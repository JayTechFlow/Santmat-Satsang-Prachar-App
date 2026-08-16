// Sprint M6.10 — Agent H: Search & Indexing Engine

import { VectorSearchEngine } from '../ai/Vector/VectorSearchEngine';
import { mediaEventBus, MediaProcessingEvent, MediaEventBus } from '../media-processing/Events/MediaProcessingEvents';

export interface MediaDocument {
  id: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  embedding?: number[];
  status?: 'ready' | 'processing' | 'updated' | string;
  metadata?: Record<string, any>;
  updatedAt?: string;
}

export interface SearchQueryOptions {
  query?: string;
  tags?: string[];
  categories?: string[];
  vector?: number[];
  similarityMediaId?: string;
  limit?: number;
  offset?: number;
  minScore?: number;
}

export interface SearchResultItem {
  id: string;
  score: number;
  title: string;
  category: string;
  tags: string[];
  metadata?: Record<string, any>;
  matchDetails?: {
    fullTextScore?: number;
    vectorSimilarity?: number;
    tagMatches?: string[];
    categoryMatch?: boolean;
  };
}

export interface RecommendationResult {
  id: string;
  score: number;
  reason: string;
  media?: MediaDocument;
}

export class SearchIndexingEngine {
  private mediaStore: Map<string, MediaDocument> = new Map();
  private fullTextIndex: Map<string, Set<string>> = new Map(); // token -> Set of mediaIds
  private tagIndex: Map<string, Set<string>> = new Map(); // tag -> Set of mediaIds
  private categoryIndex: Map<string, Set<string>> = new Map(); // category -> Set of mediaIds
  private vectorEngine: VectorSearchEngine = new VectorSearchEngine();

  // Recommendation engine data structures
  private tagCoOccurrence: Map<string, Map<string, number>> = new Map();
  private itemRecommendations: Map<string, RecommendationResult[]> = new Map();

  private isSubscribed: boolean = false;
  private unsubscribeFn: (() => void) | null = null;

  constructor(eventBus?: MediaEventBus) {
    if (eventBus || mediaEventBus) {
      this.connectToEventBus(eventBus || mediaEventBus);
    }
  }

  /**
   * Connect search indexing engine to uploaded media events.
   */
  public connectToEventBus(bus: MediaEventBus = mediaEventBus): void {
    if (this.isSubscribed && this.unsubscribeFn) {
      this.unsubscribeFn();
    }

    const handler = (event: MediaProcessingEvent) => {
      if (
        event.eventType === 'ProcessingCompleted' ||
        event.eventType === 'MediaStored' ||
        event.eventType === 'MetadataExtracted'
      ) {
        if (event.data && event.mediaId) {
          const mediaDoc: MediaDocument = {
            id: event.mediaId,
            title: (event.data.title as string) || (event.data.filename as string) || `Media ${event.mediaId}`,
            description: event.data.description as string,
            category: (event.data.category as string) || 'General',
            tags: Array.isArray(event.data.tags) ? (event.data.tags as string[]) : [],
            embedding: Array.isArray(event.data.embedding) ? (event.data.embedding as number[]) : undefined,
            status: 'ready',
            metadata: event.data,
            updatedAt: event.timestamp || new Date().toISOString(),
          };
          this.indexMedia(mediaDoc);
        }
      }
    };

    const unsubCompleted = bus.subscribe('ProcessingCompleted', handler);
    const unsubStored = bus.subscribe('MediaStored', handler);
    const unsubExtracted = bus.subscribe('MetadataExtracted', handler);

    this.unsubscribeFn = () => {
      unsubCompleted();
      unsubStored();
      unsubExtracted();
    };
    this.isSubscribed = true;
  }

  public disconnectFromEventBus(): void {
    if (this.unsubscribeFn) {
      this.unsubscribeFn();
      this.unsubscribeFn = null;
    }
    this.isSubscribed = false;
  }

  /**
   * On media ready/updated, update full-text search index, vector index / embeddings,
   * media tags, and recommendation engine data structures.
   */
  public indexMedia(media: MediaDocument): void {
    if (!media || !media.id) return;

    // 1. Remove existing index entries for media.id if re-indexing (update)
    this.removeMediaFromIndexes(media.id);

    // Normalize tags and store media document
    const normTags = (media.tags || []).map((t) => t.toLowerCase().trim()).filter(Boolean);
    const docToStore: MediaDocument = {
      ...media,
      tags: normTags,
      status: media.status || 'ready',
      updatedAt: media.updatedAt || new Date().toISOString(),
    };
    this.mediaStore.set(media.id, docToStore);

    // 2. Update Full-Text Search Index
    const textToTokenize = `${docToStore.title} ${docToStore.description || ''} ${docToStore.category} ${normTags.join(' ')}`;
    const tokens = this.tokenize(textToTokenize);

    for (const token of tokens) {
      if (!this.fullTextIndex.has(token)) {
        this.fullTextIndex.set(token, new Set());
      }
      this.fullTextIndex.get(token)!.add(docToStore.id);
    }

    // 3. Update Vector Index / Embeddings
    const embedding =
      docToStore.embedding && docToStore.embedding.length > 0
        ? docToStore.embedding
        : this.generateFallbackEmbedding(textToTokenize);

    this.vectorEngine.indexMediaVector(docToStore.id, embedding, {
      title: docToStore.title,
      category: docToStore.category,
      tags: docToStore.tags,
    });

    docToStore.embedding = embedding;

    // 4. Update Media Tags Index & Tag Co-Occurrence Matrix
    for (const tag of normTags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(docToStore.id);

      if (!this.tagCoOccurrence.has(tag)) {
        this.tagCoOccurrence.set(tag, new Map());
      }
      const coMap = this.tagCoOccurrence.get(tag)!;
      for (const otherTag of normTags) {
        if (otherTag !== tag) {
          coMap.set(otherTag, (coMap.get(otherTag) || 0) + 1);
        }
      }
    }

    // 5. Update Category Index
    const normCategory = docToStore.category.toLowerCase().trim();
    if (!this.categoryIndex.has(normCategory)) {
      this.categoryIndex.set(normCategory, new Set());
    }
    this.categoryIndex.get(normCategory)!.add(docToStore.id);

    // 6. Update Recommendation Engine Data Structures
    this.updateRecommendationDataStructures(docToStore);
  }

  /**
   * Remove media from search and recommendation indexes
   */
  public removeMedia(mediaId: string): void {
    this.removeMediaFromIndexes(mediaId);
    this.mediaStore.delete(mediaId);
    this.itemRecommendations.delete(mediaId);
  }

  /**
   * Ensure search queries can query by tags, categories, title, and similarity.
   */
  public async search(options: SearchQueryOptions): Promise<SearchResultItem[]> {
    const {
      query,
      tags,
      categories,
      vector,
      similarityMediaId,
      limit = 20,
      offset = 0,
      minScore = 0.0,
    } = options;

    const candidateScores: Map<
      string,
      {
        score: number;
        fullTextScore: number;
        vectorSimilarity: number;
        tagMatches: string[];
        categoryMatch: boolean;
      }
    > = new Map();

    let candidateIds = new Set<string>(this.mediaStore.keys());

    // Filter candidate IDs by tags if provided
    if (tags && tags.length > 0) {
      const normTags = tags.map((t) => t.toLowerCase().trim());
      const matchingIds = new Set<string>();
      for (const tag of normTags) {
        const ids = this.tagIndex.get(tag);
        if (ids) {
          ids.forEach((id) => matchingIds.add(id));
        }
      }
      candidateIds = new Set([...candidateIds].filter((id) => matchingIds.has(id)));
    }

    // Filter candidate IDs by categories if provided
    if (categories && categories.length > 0) {
      const normCategories = categories.map((c) => c.toLowerCase().trim());
      const matchingIds = new Set<string>();
      for (const cat of normCategories) {
        const ids = this.categoryIndex.get(cat);
        if (ids) {
          ids.forEach((id) => matchingIds.add(id));
        }
      }
      candidateIds = new Set([...candidateIds].filter((id) => matchingIds.has(id)));
    }

    // Determine query vector if similarity is requested
    let targetVector = vector;
    if (!targetVector && similarityMediaId) {
      const targetDoc = this.mediaStore.get(similarityMediaId);
      if (targetDoc && targetDoc.embedding) {
        targetVector = targetDoc.embedding;
      }
    }

    const queryTokens = query ? this.tokenize(query) : [];

    for (const id of candidateIds) {
      const doc = this.mediaStore.get(id);
      if (!doc) continue;

      let fullTextScore = 0;
      let vectorSimilarity = 0;
      const matchedTags: string[] = [];
      let categoryMatch = false;

      // Title & Full text match
      if (queryTokens.length > 0) {
        const docTokens = this.tokenize(
          `${doc.title} ${doc.description || ''} ${doc.category} ${doc.tags.join(' ')}`
        );
        const titleTokens = this.tokenize(doc.title);

        let matchCount = 0;
        for (const qToken of queryTokens) {
          if (titleTokens.includes(qToken)) {
            matchCount += 2;
          } else if (docTokens.includes(qToken)) {
            matchCount += 1;
          }
        }
        fullTextScore = matchCount / (queryTokens.length * 2);
      }

      // Vector similarity match
      if (targetVector && targetVector.length > 0 && doc.embedding) {
        vectorSimilarity = this.cosineSimilarity(targetVector, doc.embedding);
      }

      // Tag match
      if (tags && tags.length > 0) {
        const normQueryTags = tags.map((t) => t.toLowerCase().trim());
        for (const qTag of normQueryTags) {
          if (doc.tags.includes(qTag)) {
            matchedTags.push(qTag);
          }
        }
      }

      // Category match
      if (categories && categories.length > 0) {
        const normQueryCats = categories.map((c) => c.toLowerCase().trim());
        if (normQueryCats.includes(doc.category.toLowerCase().trim())) {
          categoryMatch = true;
        }
      }

      let finalScore = 0;
      if (queryTokens.length > 0 && targetVector) {
        finalScore = fullTextScore * 0.5 + vectorSimilarity * 0.5;
      } else if (queryTokens.length > 0) {
        finalScore = fullTextScore;
      } else if (targetVector) {
        finalScore = vectorSimilarity;
      } else {
        finalScore = 1.0;
      }

      if (matchedTags.length > 0) {
        finalScore += 0.1 * matchedTags.length;
      }
      if (categoryMatch) {
        finalScore += 0.1;
      }

      if (finalScore >= minScore) {
        candidateScores.set(id, {
          score: finalScore,
          fullTextScore,
          vectorSimilarity,
          tagMatches: matchedTags,
          categoryMatch,
        });
      }
    }

    const sorted = [...candidateScores.entries()]
      .sort((a, b) => b[1].score - a[1].score)
      .slice(offset, offset + limit);

    return sorted.map(([id, details]) => {
      const doc = this.mediaStore.get(id)!;
      return {
        id: doc.id,
        score: parseFloat(details.score.toFixed(4)),
        title: doc.title,
        category: doc.category,
        tags: doc.tags,
        metadata: doc.metadata,
        matchDetails: {
          fullTextScore: parseFloat(details.fullTextScore.toFixed(4)),
          vectorSimilarity: parseFloat(details.vectorSimilarity.toFixed(4)),
          tagMatches: details.tagMatches,
          categoryMatch: details.categoryMatch,
        },
      };
    });
  }

  public async searchByTitle(titleQuery: string, limit: number = 20): Promise<SearchResultItem[]> {
    return this.search({ query: titleQuery, limit });
  }

  public async searchByTags(tags: string[], limit: number = 20): Promise<SearchResultItem[]> {
    return this.search({ tags, limit });
  }

  public async searchByCategories(categories: string[], limit: number = 20): Promise<SearchResultItem[]> {
    return this.search({ categories, limit });
  }

  public async searchBySimilarity(
    vectorOrMediaId: number[] | string,
    limit: number = 20
  ): Promise<SearchResultItem[]> {
    if (typeof vectorOrMediaId === 'string') {
      return this.search({ similarityMediaId: vectorOrMediaId, limit });
    }
    return this.search({ vector: vectorOrMediaId, limit });
  }

  public getRecommendations(mediaId: string, limit: number = 5): RecommendationResult[] {
    const cached = this.itemRecommendations.get(mediaId);
    if (cached) {
      return cached.slice(0, limit);
    }

    const target = this.mediaStore.get(mediaId);
    if (!target) return [];

    const recs: RecommendationResult[] = [];
    for (const [id, media] of this.mediaStore.entries()) {
      if (id === mediaId) continue;

      let score = 0;
      const reasons: string[] = [];

      const sharedTags = media.tags.filter((t) => target.tags.includes(t));
      if (sharedTags.length > 0) {
        score += sharedTags.length * 0.3;
        reasons.push(`Shared tags: ${sharedTags.join(', ')}`);
      }

      if (media.category.toLowerCase() === target.category.toLowerCase()) {
        score += 0.4;
        reasons.push(`Same category: ${target.category}`);
      }

      if (target.embedding && media.embedding) {
        const sim = this.cosineSimilarity(target.embedding, media.embedding);
        score += sim * 0.5;
        if (sim > 0.7) {
          reasons.push(`High vector similarity (${(sim * 100).toFixed(0)}%)`);
        }
      }

      if (score > 0) {
        recs.push({
          id: media.id,
          score: parseFloat(score.toFixed(4)),
          reason: reasons.join('; '),
          media,
        });
      }
    }

    recs.sort((a, b) => b.score - a.score);
    this.itemRecommendations.set(mediaId, recs);
    return recs.slice(0, limit);
  }

  public getMediaById(id: string): MediaDocument | undefined {
    return this.mediaStore.get(id);
  }

  public getAllIndexedMedia(): MediaDocument[] {
    return Array.from(this.mediaStore.values());
  }

  public getPopularTags(limit: number = 10): { tag: string; count: number }[] {
    const counts: { tag: string; count: number }[] = [];
    for (const [tag, set] of this.tagIndex.entries()) {
      counts.push({ tag, count: set.size });
    }
    return counts.sort((a, b) => b.count - a.count).slice(0, limit);
  }

  public getCategoryCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const [cat, set] of this.categoryIndex.entries()) {
      counts[cat] = set.size;
    }
    return counts;
  }

  private removeMediaFromIndexes(mediaId: string): void {
    const existing = this.mediaStore.get(mediaId);
    if (!existing) return;

    for (const [, set] of this.fullTextIndex.entries()) {
      set.delete(mediaId);
    }
    for (const [, set] of this.tagIndex.entries()) {
      set.delete(mediaId);
    }
    for (const [, set] of this.categoryIndex.entries()) {
      set.delete(mediaId);
    }
    this.itemRecommendations.delete(mediaId);
    for (const [, list] of this.itemRecommendations.entries()) {
      const idx = list.findIndex((r) => r.id === mediaId);
      if (idx >= 0) list.splice(idx, 1);
    }
  }

  private updateRecommendationDataStructures(doc: MediaDocument): void {
    for (const [id, item] of this.mediaStore.entries()) {
      if (
        item.category.toLowerCase() === doc.category.toLowerCase() ||
        item.tags.some((t) => doc.tags.includes(t))
      ) {
        this.itemRecommendations.delete(id);
      }
    }
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const len = Math.min(a.length, b.length);
    let dot = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < len; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);
    return magA && magB ? dot / (magA * magB) : 0;
  }

  private generateFallbackEmbedding(text: string): number[] {
    const dims = 16;
    const vec = new Array(dims).fill(0);
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      vec[i % dims] += charCode / 255;
    }
    const mag = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
    return mag > 0 ? vec.map((v) => v / mag) : vec;
  }
}
