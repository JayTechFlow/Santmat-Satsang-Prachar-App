// Sprint M7.2 — Recommendation Engine: Similarity Engine

export interface MediaItem {
  id: string;
  title: string;
  description?: string;
  category: string; // e.g., 'Satsang', 'Bhajan', 'Pravachan', 'Stuti', 'Granth'
  language: string; // e.g., 'Hindi', 'English', 'Punjabi'
  tags: string[];
  eventId?: string;
  eventName?: string;
  speaker?: string;
  durationSeconds?: number;
  embedding?: number[];
  publishedAt?: string;
  playCount?: number;
  likeCount?: number;
  viewCount?: number;
  trendingScore?: number;
  metadata?: Record<string, any>;
}

export interface SimilarityWeights {
  categoryWeight: number;
  languageWeight: number;
  tagWeight: number;
  speakerWeight: number;
  eventWeight: number;
  titleWeight: number;
  embeddingWeight: number;
}

export const DEFAULT_SIMILARITY_WEIGHTS: SimilarityWeights = {
  categoryWeight: 0.25,
  languageWeight: 0.15,
  tagWeight: 0.20,
  speakerWeight: 0.15,
  eventWeight: 0.10,
  titleWeight: 0.05,
  embeddingWeight: 0.10,
};

export class SimilarityEngine {
  /**
   * Cosine Similarity between two numerical vectors.
   * Returns a value between -1 and 1 (or 0 and 1 for non-negative embeddings).
   */
  public cosineSimilarity(a: number[], b: number[]): number {
    if (!a || !b || a.length === 0 || b.length === 0 || a.length !== b.length) {
      return 0;
    }
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude > 0 ? dotProduct / magnitude : 0;
  }

  /**
   * Jaccard Similarity between two sets or string arrays.
   * Returns a value between 0 and 1.
   */
  public jaccardSimilarity(
    setA: Set<string> | string[],
    setB: Set<string> | string[]
  ): number {
    const a = new Set(Array.isArray(setA) ? setA.map((s) => s.toLowerCase().trim()) : Array.from(setA).map((s) => s.toLowerCase().trim()));
    const b = new Set(Array.isArray(setB) ? setB.map((s) => s.toLowerCase().trim()) : Array.from(setB).map((s) => s.toLowerCase().trim()));

    if (a.size === 0 && b.size === 0) return 1.0;
    if (a.size === 0 || b.size === 0) return 0.0;

    let intersectionCount = 0;
    for (const elem of a) {
      if (b.has(elem)) {
        intersectionCount++;
      }
    }

    const unionCount = a.size + b.size - intersectionCount;
    return unionCount > 0 ? intersectionCount / unionCount : 0.0;
  }

  /**
   * Euclidean Distance between two vectors.
   */
  public euclideanDistance(a: number[], b: number[]): number {
    if (!a || !b || a.length === 0 || b.length === 0 || a.length !== b.length) {
      return Infinity;
    }
    let sumSq = 0;
    for (let i = 0; i < a.length; i++) {
      const diff = a[i] - b[i];
      sumSq += diff * diff;
    }
    return Math.sqrt(sumSq);
  }

  /**
   * Normalized Euclidean Similarity [0, 1].
   */
  public euclideanSimilarity(a: number[], b: number[]): number {
    const dist = this.euclideanDistance(a, b);
    if (dist === Infinity) return 0;
    return 1 / (1 + dist);
  }

  /**
   * Pearson Correlation Coefficient between two series [-1, 1].
   */
  public pearsonCorrelation(a: number[], b: number[]): number {
    if (!a || !b || a.length === 0 || b.length === 0 || a.length !== b.length) {
      return 0;
    }
    const n = a.length;
    let sumA = 0;
    let sumB = 0;
    for (let i = 0; i < n; i++) {
      sumA += a[i];
      sumB += b[i];
    }
    const meanA = sumA / n;
    const meanB = sumB / n;

    let num = 0;
    let denA = 0;
    let denB = 0;
    for (let i = 0; i < n; i++) {
      const diffA = a[i] - meanA;
      const diffB = b[i] - meanB;
      num += diffA * diffB;
      denA += diffA * diffA;
      denB += diffB * diffB;
    }

    const den = Math.sqrt(denA * denB);
    return den > 0 ? num / den : 0;
  }

  /**
   * Tokenized text similarity (word overlap Jaccard index).
   */
  public computeTextSimilarity(textA?: string, textB?: string): number {
    if (!textA || !textB) return 0;
    const tokenize = (t: string) =>
      t
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 2);

    const tokensA = tokenize(textA);
    const tokensB = tokenize(textB);
    return this.jaccardSimilarity(tokensA, tokensB);
  }

  /**
   * Computes comprehensive overall metadata similarity score between two MediaItems [0, 1].
   */
  public computeMetadataSimilarity(
    itemA: MediaItem,
    itemB: MediaItem,
    customWeights?: Partial<SimilarityWeights>
  ): number {
    if (itemA.id === itemB.id) return 1.0;

    const w: SimilarityWeights = { ...DEFAULT_SIMILARITY_WEIGHTS, ...customWeights };

    const categoryScore = itemA.category && itemB.category && itemA.category.toLowerCase() === itemB.category.toLowerCase() ? 1.0 : 0.0;
    const languageScore = itemA.language && itemB.language && itemA.language.toLowerCase() === itemB.language.toLowerCase() ? 1.0 : 0.0;
    const tagScore = this.jaccardSimilarity(itemA.tags || [], itemB.tags || []);
    const speakerScore =
      itemA.speaker && itemB.speaker && itemA.speaker.toLowerCase() === itemB.speaker.toLowerCase() ? 1.0 : 0.0;
    const eventScore =
      itemA.eventId && itemB.eventId && itemA.eventId.toLowerCase() === itemB.eventId.toLowerCase() ? 1.0 : 0.0;

    const titleScore = this.computeTextSimilarity(itemA.title, itemB.title);

    let embeddingScore = 0;
    if (itemA.embedding && itemB.embedding) {
      embeddingScore = Math.max(0, this.cosineSimilarity(itemA.embedding, itemB.embedding));
    } else {
      // If embedding is not present, redistribute embeddingWeight proportionally to other fields
      embeddingScore = (categoryScore + tagScore + languageScore) / 3;
    }

    const totalWeight =
      w.categoryWeight +
      w.languageWeight +
      w.tagWeight +
      w.speakerWeight +
      w.eventWeight +
      w.titleWeight +
      w.embeddingWeight;

    const weightedSum =
      categoryScore * w.categoryWeight +
      languageScore * w.languageWeight +
      tagScore * w.tagWeight +
      speakerScore * w.speakerWeight +
      eventScore * w.eventWeight +
      titleScore * w.titleWeight +
      embeddingScore * w.embeddingWeight;

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  /**
   * Finds and ranks candidate MediaItems by similarity to a target MediaItem.
   */
  public findSimilarItems(
    target: MediaItem,
    candidates: MediaItem[],
    topK: number = 10,
    minScore: number = 0.0,
    customWeights?: Partial<SimilarityWeights>
  ): { media: MediaItem; score: number }[] {
    return candidates
      .filter((c) => c.id !== target.id)
      .map((c) => ({
        media: c,
        score: this.computeMetadataSimilarity(target, c, customWeights),
      }))
      .filter((res) => res.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}
