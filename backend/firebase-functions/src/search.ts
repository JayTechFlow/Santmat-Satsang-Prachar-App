import * as functions from "firebase-functions";
import { requireAuth, db } from "./utils";

/**
 * Collection → SearchResultItem type mapping for the frontend.
 * The AdminSearch component supports exactly 4 types: bhajan, stuti, suvichar, book.
 */
type CollectionMap = 'audio' | 'stuti_vinati' | 'suvichar' | 'books';
const COLLECTION_TYPE: Record<CollectionMap, string> = {
  audio: 'bhajan',
  stuti_vinati: 'stuti',
  suvichar: 'suvichar',
  books: 'book',
};

/**
 * Extract search-relevant tokens from an audio (bhajan) document.
 * Fields: title, artist, category, and first few lyrics words.
 */
function bhajanTokens(doc: any): string[] {
  const parts: string[] = [];
  if (doc.title) parts.push(doc.title.toLowerCase());
  if (doc.artist) parts.push(doc.artist.toLowerCase());
  if (doc.category) parts.push(doc.category.toLowerCase());
  // Append first 3 lyric lines' words (if lyrics present)
  if (doc.lyrics) {
    const lines = doc.lyrics.split('\n').filter((l: string) => l.trim().length > 0);
    for (let i = 0; i < Math.min(lines.length, 3); i++) {
      const wList = lines[i].split(/\s+/);
      for (let k = 0; k < wList.length; k++) {
        const w = wList[k].toLowerCase().replace(/[^a-z0-9]/g, '');
        if (w.length > 1) parts.push(w);
      }
    }
  }
  return parts.filter((t: string, i: number, arr: string[]) => t.length > 1 && arr.indexOf(t) === i);
}

/**
 * Extract search-relevant tokens from a stuti_vinati document.
 * Fields: title, subtitle, artist, quote.
 */
function stutiTokens(doc: any): string[] {
  const parts: string[] = [];
  if (doc.title) parts.push(doc.title.toLowerCase());
  if (doc.subtitle) parts.push(doc.subtitle.toLowerCase());
  if (doc.artist) parts.push(doc.artist.toLowerCase());
  if (doc.quote) parts.push(doc.quote.toLowerCase());
  return parts.filter((t: string, i: number, arr: string[]) => t.length > 1 && arr.indexOf(t) === i);
}

/**
 * Extract search-relevant tokens from a suvichar document.
 * Fields: title, quote, author, theme.
 */
function suvicharTokens(doc: any): string[] {
  const parts: string[] = [];
  if (doc.title) parts.push(doc.title.toLowerCase());
  if (doc.quote) parts.push(doc.quote.toLowerCase());
  if (doc.author) parts.push(doc.author.toLowerCase());
  if (doc.theme) parts.push(doc.theme.toLowerCase());
  return parts.filter((t: string, i: number, arr: string[]) => t.length > 1 && arr.indexOf(t) === i);
}

/**
 * Extract search-relevant tokens from a book document.
 * Fields: title, author, category.
 */
function bookTokens(doc: any): string[] {
  const parts: string[] = [];
  if (doc.title) parts.push(doc.title.toLowerCase());
  if (doc.author) parts.push(doc.author.toLowerCase());
  if (doc.category) parts.push(doc.category.toLowerCase());
  return parts.filter((t: string, i: number, arr: string[]) => t.length > 1 && arr.indexOf(t) === i);
}

/**
 * Map a doc from any of the 4 content collections to the frontend SearchResultItem shape.
 */
function mapToSearchResultItem(doc: any, type: string): { id: string; type: string; title: string; subtitle?: string; category?: string } {
  const title = doc.title || doc.name || 'Untitled';
  // subtitle: use subtype field if available, otherwise quote first line for stuti, or undefined for others
  let subtitle: string | undefined;
  if (type === 'stuti' && doc.subtitle) {
    subtitle = doc.subtitle;
  } else if (type === 'stuti' && doc.quote) {
    subtitle = doc.quote.split('\n')[0].trim();
  } else if (type === 'book' && doc.subtitle) {
    subtitle = doc.subtitle;
  }
  const category = doc.category;
  return { id: doc.id, type, title, subtitle, category };
}

/**
 * Global Search endpoint — queries the 4 content collections (audio, stuti_vinati, suvichar, books)
 * and returns typed results matching the SearchResultItem frontend contract.
 * No fabricated data — results reflect real indexed content. Empty index yields empty results.
 */
export const globalSearch = functions.https.onCall(async (data, context) => {
  requireAuth(context);

  const { query: q, limit = 20, offset = 0 } = data as {
    query?: string;
    limit?: number;
    offset?: number;
  };

  if (!q || q.trim().length === 0) {
    return { status: "success", data: { total: 0, items: [] } };
  }

  const queryTokens: string[] = q
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t: string) => t.length > 1);

  if (queryTokens.length === 0) {
    return { status: "success", data: { total: 0, items: [] } };
  }

  // Search the 4 content collections — tag each doc with its source collection name
  const allItems: any[] = [];

  // audio → bhajan
  const audioSnap = await db.collection("audio").get();
  for (let i = 0; i < audioSnap.docs.length; i++) {
    allItems.push({ id: audioSnap.docs[i].id, ...audioSnap.docs[i].data(), collection: 'audio' } as any);
  }

  // stuti_vinati → stuti
  const stutiSnap = await db.collection("stuti_vinati").get();
  for (let i = 0; i < stutiSnap.docs.length; i++) {
    allItems.push({ id: stutiSnap.docs[i].id, ...stutiSnap.docs[i].data(), collection: 'stuti_vinati' } as any);
  }

  // suvichar → suvichar
  const suvicharSnap = await db.collection("suvichar").get();
  for (let i = 0; i < suvicharSnap.docs.length; i++) {
    allItems.push({ id: suvicharSnap.docs[i].id, ...suvicharSnap.docs[i].data(), collection: 'suvichar' } as any);
  }

  // books → book
  const booksSnap = await db.collection("books").get();
  for (let i = 0; i < booksSnap.docs.length; i++) {
    allItems.push({ id: booksSnap.docs[i].id, ...booksSnap.docs[i].data(), collection: 'books' } as any);
  }

/* Scoring & filtering */
  const scored: Array<{ item: any; score: number }> = [];

  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
    const type = COLLECTION_TYPE[item.collection as any];
    if (!type) continue;

    const tokenFns: { bhajan: (doc: any) => string[]; stuti: (doc: any) => string[]; suvichar: (doc: any) => string[]; book: (doc: any) => string[]; } = {
      bhajan: bhajanTokens,
      stuti: stutiTokens,
      suvichar: suvicharTokens,
      book: bookTokens,
    }[type];

    if (!tokenFns) continue;

    const itemTokens: string[] = tokenFns(item);
    if (itemTokens.length === 0) continue;

    let matchCount = 0;
    for (let j = 0; j < queryTokens.length; j++) {
      if (itemTokens.includes(queryTokens[j])) matchCount++;
    }
    const textScore = matchCount / queryTokens.length;

    if (textScore > 0) {
      scored.push({ item, score: textScore });
    }
  }

  // Sort by score desc
  for (let i = 0; i < scored.length; i++) {
    for (let j = i + 1; j < scored.length; j++) {
      if (scored[j].score > scored[i].score) {
        const temp = scored[i];
        scored[i] = scored[j];
        scored[j] = temp;
      }
    }
  }

  // Map to SearchResultItem and paginate
  const total = scored.length;
  const paginated: any[] = [];
  for (let i = offset; i < scored.length && i < offset + limit; i++) {
    const s = scored[i];
    const mapped = mapToSearchResultItem(s.item, s.item.collection as any);
    paginated.push({
      ...mapped,
      score: parseFloat(s.score.toFixed(4)),
    });
  }

  return {
    status: "success",
    data: { total, items: paginated },
  };
});

/**
 * Get popular / trending search queries.
 * Unchanged — uses popular_searches collection.
 */
export const trendingSearches = functions.https.onCall(async (data, context) => {
  requireAuth(context);
  try {
    const snapshot = await db.collection("popular_searches").orderBy("score", "desc").limit(10).get();
    const searches: string[] = [];
    snapshot.forEach(doc => searches.push(doc.data().query));
    return { status: "success", data: searches };
  } catch (e) {
    return { status: "error", message: "Failed to fetch popular searches" };
  }
});

/**
 * Get recommendations for a specific media item.
 * Unchanged — uses recommendation_index built from media collection.
 */
export const getMediaRecommendations = functions.https.onCall(async (data, context) => {
  requireAuth(context);

  const { mediaId, limit = 5 } = data as { mediaId: string; limit?: number };
  if (!mediaId) {
    throw new functions.https.HttpsError("invalid-argument", "mediaId is required");
  }

  try {
    const targetDoc = await db.collection("recommendation_index").doc(mediaId).get();
    if (!targetDoc.exists) {
      return { status: "success", data: [] };
    }

    const target = targetDoc.data()!;
    const snapshot = await db.collection("recommendation_index").limit(50).get();

    const recommendations: Array<{ id: string; score: number; reason: string }> = [];

    snapshot.forEach(doc => {
      if (doc.id === mediaId) return;
      const item = doc.data();

      let score = 0;
      const reasons: string[] = [];

      if (item.category && item.category === target.category) {
        score += 0.4;
        reasons.push("Same category");
      }

      if (Array.isArray(item.tags) && Array.isArray(target.tags)) {
        const shared: string[] = [];
        for (const t of item.tags) {
          if (target.tags.includes(t)) shared.push(t);
        }
        if (shared.length > 0) {
          score += shared.length * 0.3;
          reasons.push(`Shared tags: ${shared.join(", ")}`);
        }
      }

      if (score > 0) {
        recommendations.push({
          id: doc.id,
          score: parseFloat(score.toFixed(4)),
          reason: reasons.join("; "),
        });
      }
    });

    recommendations.sort((a, b) => b.score - a.score);

    return {
      status: "success",
      data: recommendations.slice(0, limit),
    };
  } catch (error: any) {
    return { status: "error", message: error?.message ?? "Failed to fetch recommendations" };
  }
});
