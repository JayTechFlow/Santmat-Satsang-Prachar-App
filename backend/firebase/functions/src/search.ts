import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { requireAuth, db } from "./utils";

/**
 * On media ready/updated, update full-text search index, vector index / embeddings,
 * media tags, and recommendation engine data structures in Firestore.
 */
export const onMediaDocumentWrite = functions.firestore
  .document("media/{mediaId}")
  .onWrite(async (change, context) => {
    const mediaId = context.params.mediaId;

    // Handle deletion
    if (!change.after.exists) {
      const batch = db.batch();
      batch.delete(db.collection("search_index").doc(mediaId));
      batch.delete(db.collection("vector_index").doc(mediaId));
      batch.delete(db.collection("recommendation_index").doc(mediaId));
      await batch.commit();
      return;
    }

    const data = change.after.data();
    if (!data) return;

    const status = data.status ?? "ready";
    // Only index media when status is ready or updated
    if (status !== "ready" && status !== "updated") {
      return;
    }

    const title: string = data.title ?? data.filename ?? `Media ${mediaId}`;
    const description: string = data.description ?? "";
    const category: string = data.category ?? "General";
    const tags: string[] = Array.isArray(data.tags)
      ? data.tags.map((t: string) => t.toLowerCase().trim()).filter(Boolean)
      : [];
    const embedding: number[] = Array.isArray(data.embedding) ? data.embedding : [];

    const textToTokenize = `${title} ${description} ${category} ${tags.join(" ")}`;
    const tokens = Array.from(
      new Set(
        textToTokenize
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, " ")
          .split(/\s+/)
          .filter((t) => t.length > 1)
      )
    );

    const batch = db.batch();

    // 1. Full-Text Search Index
    batch.set(
      db.collection("search_index").doc(mediaId),
      {
        mediaId,
        title,
        description,
        category,
        tags,
        tokens,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // 2. Vector Index / Embeddings
    if (embedding.length > 0) {
      batch.set(
        db.collection("vector_index").doc(mediaId),
        {
          mediaId,
          embedding,
          title,
          category,
          tags,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    // 3. Media Tags Index
    for (const tag of tags) {
      const tagRef = db.collection("tag_index").doc(tag);
      batch.set(
        tagRef,
        {
          tag,
          mediaIds: admin.firestore.FieldValue.arrayUnion(mediaId),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    // 4. Recommendation Engine Data Structure
    batch.set(
      db.collection("recommendation_index").doc(mediaId),
      {
        mediaId,
        category: category.toLowerCase().trim(),
        tags,
        embedding: embedding.length > 0 ? embedding : null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await batch.commit();
  });

/**
 * Global Search endpoint — Query by tags, categories, title, and similarity.
 */
export const globalSearch = functions.https.onCall(async (data, context) => {
  requireAuth(context);

  const {
    query,
    tags,
    categories,
    vector,
    similarityMediaId,
    limit = 20,
    offset = 0,
  } = data as {
    query?: string;
    tags?: string[];
    categories?: string[];
    vector?: number[];
    similarityMediaId?: string;
    limit?: number;
    offset?: number;
  };

  try {
    let queryRef: admin.firestore.Query = db.collection("search_index");

    // Filter by category if provided
    if (categories && categories.length > 0) {
      queryRef = queryRef.where("category", "in", categories.slice(0, 10));
    }

    // Filter by tags if provided
    if (tags && tags.length > 0) {
      const normTags = tags.map((t) => t.toLowerCase().trim());
      queryRef = queryRef.where("tags", "array-contains-any", normTags.slice(0, 10));
    }

    const snapshot = await queryRef.get();

    // Fetch target vector if similarityMediaId provided
    let queryVector = vector;
    if (!queryVector && similarityMediaId) {
      const targetVecDoc = await db.collection("vector_index").doc(similarityMediaId).get();
      if (targetVecDoc.exists && Array.isArray(targetVecDoc.data()?.embedding)) {
        queryVector = targetVecDoc.data()!.embedding as number[];
      }
    }

    const results: Array<{
      id: string;
      title: string;
      category: string;
      tags: string[];
      score: number;
    }> = [];

    const queryTokens = query
      ? query
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, " ")
          .split(/\s+/)
          .filter((t) => t.length > 1)
      : [];

    for (const doc of snapshot.docs) {
      const item = doc.data();
      let textScore = 1.0;
      let vectorScore = 0.0;

      if (queryTokens.length > 0 && Array.isArray(item.tokens)) {
        const itemTokens = item.tokens as string[];
        let matchCount = 0;
        queryTokens.forEach((qt) => {
          if (itemTokens.includes(qt)) matchCount++;
        });
        textScore = matchCount / queryTokens.length;
      }

      if (queryVector && queryVector.length > 0) {
        const vecDoc = await db.collection("vector_index").doc(doc.id).get();
        if (vecDoc.exists && Array.isArray(vecDoc.data()?.embedding)) {
          const itemVec = vecDoc.data()!.embedding as number[];
          const dot = queryVector.reduce((acc: number, val: number, idx: number) => acc + val * (itemVec[idx] || 0), 0);
          const magA = Math.sqrt(queryVector.reduce((acc: number, val: number) => acc + val * val, 0));
          const magB = Math.sqrt(itemVec.reduce((acc: number, val: number) => acc + val * val, 0));
          vectorScore = magA && magB ? dot / (magA * magB) : 0;
        }
      }

      let score = textScore;
      if (queryVector && queryVector.length > 0) {
        score = queryTokens.length > 0 ? textScore * 0.5 + vectorScore * 0.5 : vectorScore;
      }

      if (score > 0) {
        results.push({
          id: doc.id,
          title: item.title ?? "",
          category: item.category ?? "",
          tags: item.tags ?? [],
          score: parseFloat(score.toFixed(4)),
        });
      }
    }

    results.sort((a, b) => b.score - a.score);

    // Record popular search query
    if (query && query.trim().length > 2) {
      const queryKey = query.trim().toLowerCase();
      const searchRef = db.collection("popular_searches").doc(queryKey);
      await searchRef.set(
        {
          query: query.trim(),
          score: admin.firestore.FieldValue.increment(1),
          lastSearchedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    const paginated = results.slice(offset, offset + limit);

    return {
      status: "success",
      data: {
        total: results.length,
        items: paginated,
      },
    };
  } catch (error: any) {
    return { status: "error", message: error?.message ?? "Search failed" };
  }
});

/**
 * Autocomplete suggestions for titles, tags, and categories.
 */
export const autocomplete = functions.https.onCall(async (data, context) => {
  requireAuth(context);

  const { query, limit = 5 } = data as { query?: string; limit?: number };
  if (!query || query.trim().length === 0) {
    return { status: "success", data: { titles: [], tags: [], categories: [] } };
  }

  try {
    const qLower = query.trim().toLowerCase();
    const snapshot = await db.collection("search_index").limit(50).get();

    const titlesSet = new Set<string>();
    const tagsSet = new Set<string>();
    const categoriesSet = new Set<string>();

    snapshot.docs.forEach((doc) => {
      const item = doc.data();
      if (item.title && (item.title as string).toLowerCase().includes(qLower)) {
        titlesSet.add(item.title);
      }
      if (item.category && (item.category as string).toLowerCase().includes(qLower)) {
        categoriesSet.add(item.category);
      }
      if (Array.isArray(item.tags)) {
        item.tags.forEach((tag: string) => {
          if (tag.toLowerCase().includes(qLower)) {
            tagsSet.add(tag);
          }
        });
      }
    });

    return {
      status: "success",
      data: {
        titles: Array.from(titlesSet).slice(0, limit),
        tags: Array.from(tagsSet).slice(0, limit),
        categories: Array.from(categoriesSet).slice(0, limit),
      },
    };
  } catch (error: any) {
    return { status: "error", message: error?.message ?? "Autocomplete failed" };
  }
});

/**
 * Get popular / trending search queries.
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
