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
      (lines[i].split(/\s+/)).forEach((w: string) => parts.push(w.toLowerCase().replace(/[^a-z0-9]/g, '')));
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
  const audioDocs = await db.collection("audio").get().then(snap => snap.docs.map(d => ({ id: d.id, ...d.data(), collection: 'audio' } as any)));
  allItems.push(...audioDocs);

  // stuti_vinati → stuti
  const stutiDocs = await db.collection("stuti_vinati")
    .where("type", "in", ["morning", "evening"])
    .get().then(snap => snap.docs.map(d => ({ id: d.id, ...d.data(), collection: 'stuti_vinati' } as any)));
  allItems.push(...stutiDocs);

  // suvichar → suvichar
  const suvicharDocs = await db.collection("suvichar").get().then(snap => snap.docs.map(d => ({ id: d.id, ...d.data(), collection: 'suvichar' } as any)));
  allItems.push(...suvicharDocs);

  // books → book
  const booksDocs = await db.collection("books").get().then(snap => snap.docs.map(d => ({ id: d.id, ...d.data(), collection: 'books' } as any)));
  allItems.push(...booksDocs);

/* Scoring & filtering */
  const scored: Array<{ item: any; score: number }> = [];

  allItems.forEach((item: any) => {
    const type = COLLECTION_TYPE[item.collection as CollectionMap];
    if (!type) return;

    const tokenFnsMap: Record<string, (doc: any) => string[]> = {
      bhajan: bhajanTokens,
      stuti: stutiTokens,
      suvichar: suvicharTokens,
      book: bookTokens,
    };
    const tokenFn = tokenFnsMap[type];

    if (!tokenFn) return;

    const itemTokens: string[] = tokenFn(item);
    if (itemTokens.length === 0) return;

    let matchCount = 0;
    queryTokens.forEach((qt: string) => {
      if (itemTokens.includes(qt)) matchCount++;
    });
    const textScore = matchCount / queryTokens.length;

    if (textScore > 0) {
      scored.push({ item, score: textScore });
    }
  });

  // Sort by score desc
  scored.sort((a, b) => b.score - a.score);

  // Map to SearchResultItem and paginate
  const total = scored.length;
  const paginated = scored.slice(offset, offset + limit).map(s => {
    const itemType = COLLECTION_TYPE[s.item.collection as CollectionMap] || 'bhajan';
    const mapped = mapToSearchResultItem(s.item, itemType as any);
    return {
      ...mapped,
      score: parseFloat(s.score.toFixed(4)),
    };
  });

  return {
    status: "success",
    data: { total, items: paginated },
  };
});

/**
 * Autocomplete suggestions for titles, tags, and categories
 * across the 4 content collections.
 */
export const autocomplete = functions.https.onCall(async (data, context) => {
  requireAuth(context);

  const { query: q, limit = 5 } = data as { query?: string; limit?: number };
  if (!q || q.trim().length === 0) {
    return { status: "success", data: { titles: [], tags: [], categories: [] } };
  }

  const qLower = q.trim().toLowerCase();

  // Query titles from all 4 collections
  const titleSets: string[][] = [];

  titleSets.push(
    await db.collection("audio")
      .get()
      .then(snap => snap.docs
        .filter(d => (d.data() as any).title)
        .map(d => (d.data() as any).title as string))
  );

  titleSets.push(
    await db.collection("stuti_vinati")
      .where("type", "in", ["morning", "evening"])
      .get()
      .then(snap => snap.docs
        .filter(d => (d.data() as any).title)
        .map(d => (d.data() as any).title as string))
  );

  titleSets.push(
    await db.collection("suvichar")
      .get()
      .then(snap => snap.docs
        .filter(d => (d.data() as any).title)
        .map(d => (d.data() as any).title as string))
  );

  titleSets.push(
    await db.collection("books")
      .get()
      .then(snap => snap.docs
        .filter(d => (d.data() as any).title)
        .map(d => (d.data() as any).title as string))
  );

  const titlesSet = new Set<string>();
  const categoriesSet = new Set<string>();
  const tagSet = new Set<string>();

  // Collect titles
  titleSets.forEach(arr => arr.forEach((t: string) => { if (t.toLowerCase().includes(qLower)) titlesSet.add(t); }));

  // Collect categories from audio and books
  const catPromises: Promise<string[]>[] = [];
  catPromises.push(
    db.collection("audio")
      .get()
      .then(snap => snap.docs.map(d => (d.data() as any).category || '').filter(Boolean))
  );
  catPromises.push(
    db.collection("books")
      .get()
      .then(snap => snap.docs.map(d => (d.data() as any).category || '').filter(Boolean))
  );
  const catSets: string[][] = await Promise.all(catPromises);
  catSets.forEach(arr => arr.forEach((c: string) => categoriesSet.add(c)));

  // Collect simple "tags" — just unique non-empty short strings from key fields
  const tagPromises: Promise<string[]>[] = [];
  tagPromises.push(
    db.collection("audio")
      .get()
      .then(snap => snap.docs.map(d => {
        const t = (d.data() as any).title || '';
        return t.split(' ')[0];
      }).filter(Boolean))
  );
  tagPromises.push(
    db.collection("stuti_vinati")
      .where("type", "in", ["morning", "evening"])
      .get()
      .then(snap => snap.docs.map(d => {
        const q = (d.data() as any).quote || '';
        return q.split(' ')[0];
      }).filter(Boolean))
  );
  tagPromises.push(
    db.collection("suvichar")
      .get()
      .then(snap => snap.docs.map(d => {
        const q = (d.data() as any).quote || '';
        return q.split(' ')[0];
      }).filter(Boolean))
  );
  tagPromises.push(
    db.collection("books")
      .get()
      .then(snap => snap.docs.map(d => {
        const t = (d.data() as any).title || '';
        return t.split(' ')[0];
      }).filter(Boolean))
  );
  const tagSets: string[][] = await Promise.all(tagPromises);
  tagSets.forEach(arr => arr.forEach((t: string) => tagSet.add(t)));

  return {
    status: "success",
    data: {
      titles: Array.from(titlesSet).slice(0, limit),
      categories: Array.from(categoriesSet).slice(0, limit),
      tags: Array.from(tagSet).slice(0, limit),
    },
  };
});

/**
 * Get popular / trending search queries.
 * Unchanged — uses popular_searches collection.
 */
export const trendingSearches = functions.https.onCall(async (data, context) => {
  requireAuth(context);
  try {
    const snapshot = await db
      .collection("popular_searches")
      .orderBy("score", "desc")
      .limit(10)
      .get();
    const searches = snapshot.docs.map((doc) => doc.data().query);
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

    snapshot.docs.forEach((doc) => {
      if (doc.id === mediaId) return;
      const item = doc.data();

      let score = 0;
      const reasons: string[] = [];

      if (item.category && item.category === target.category) {
        score += 0.4;
        reasons.push("Same category");
      }

      if (Array.isArray(item.tags) && Array.isArray(target.tags)) {
        const shared = item.tags.filter((t: string) => target.tags.includes(t));
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