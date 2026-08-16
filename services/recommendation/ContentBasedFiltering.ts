// Sprint M7.2 — Recommendation Engine: Content Based Filtering

import { MediaItem, SimilarityEngine, DEFAULT_SIMILARITY_WEIGHTS } from './SimilarityEngine';

export type InteractionType = 'view' | 'play' | 'pause' | 'complete' | 'like' | 'bookmark' | 'share';

export interface UserInteraction {
  userId: string;
  mediaId: string;
  type: InteractionType;
  progressSeconds?: number;
  totalDurationSeconds?: number;
  timestamp: string;
  rating?: number; // 1 to 5 scale if provided
}

export interface UserContentProfile {
  userId: string;
  categoryPreferences: Map<string, number>;
  languagePreferences: Map<string, number>;
  tagPreferences: Map<string, number>;
  speakerPreferences: Map<string, number>;
  eventPreferences: Map<string, number>;
  preferenceVector?: number[];
  totalInteractions: number;
  lastUpdated: string;
}

export interface RecommendationOptions {
  limit?: number;
  offset?: number;
  category?: string;
  language?: string;
  eventId?: string;
  excludeMediaIds?: string[];
  minScore?: number;
  filterUnwatched?: boolean;
}

export interface RecommendationResultItem {
  media: MediaItem;
  score: number;
  reason: string;
  strategy?: 'content_based' | 'collaborative' | 'hybrid' | 'trending' | 'category' | 'language' | 'event' | 'recent' | 'continue_listening';
}

const INTERACTION_WEIGHTS: Record<InteractionType, number> = {
  view: 1.0,
  play: 2.0,
  pause: 0.5,
  complete: 4.0,
  like: 5.0,
  bookmark: 4.0,
  share: 3.5,
};

export class ContentBasedFiltering {
  private mediaStore: Map<string, MediaItem> = new Map();
  private userProfiles: Map<string, UserContentProfile> = new Map();
  private userInteractions: Map<string, UserInteraction[]> = new Map();
  private similarityEngine: SimilarityEngine = new SimilarityEngine();

  public registerMedia(media: MediaItem | MediaItem[]): void {
    const items = Array.isArray(media) ? media : [media];
    for (const item of items) {
      this.mediaStore.set(item.id, item);
    }
  }

  public getMedia(mediaId: string): MediaItem | undefined {
    return this.mediaStore.get(mediaId);
  }

  public getAllMedia(): MediaItem[] {
    return Array.from(this.mediaStore.values());
  }

  public recordUserInteraction(interaction: UserInteraction): void {
    if (!this.userInteractions.has(interaction.userId)) {
      this.userInteractions.set(interaction.userId, []);
    }
    const history = this.userInteractions.get(interaction.userId)!;
    history.push(interaction);

    // Rebuild user profile
    this.buildUserProfile(interaction.userId);
  }

  public getUserInteractions(userId: string): UserInteraction[] {
    return this.userInteractions.get(userId) || [];
  }

  public getUserProfile(userId: string): UserContentProfile | undefined {
    return this.userProfiles.get(userId);
  }

  public buildUserProfile(userId: string): UserContentProfile {
    const interactions = this.userInteractions.get(userId) || [];
    const profile: UserContentProfile = {
      userId,
      categoryPreferences: new Map(),
      languagePreferences: new Map(),
      tagPreferences: new Map(),
      speakerPreferences: new Map(),
      eventPreferences: new Map(),
      totalInteractions: interactions.length,
      lastUpdated: new Date().toISOString(),
    };

    let vectorSum: number[] | null = null;
    let vectorWeightTotal = 0;

    for (const inter of interactions) {
      const media = this.mediaStore.get(inter.mediaId);
      if (!media) continue;

      const baseWeight = INTERACTION_WEIGHTS[inter.type] || 1.0;
      const ratingMult = inter.rating ? inter.rating / 3.0 : 1.0;
      const weight = baseWeight * ratingMult;

      // Category preference
      if (media.category) {
        const current = profile.categoryPreferences.get(media.category) || 0;
        profile.categoryPreferences.set(media.category, current + weight);
      }

      // Language preference
      if (media.language) {
        const current = profile.languagePreferences.get(media.language) || 0;
        profile.languagePreferences.set(media.language, current + weight);
      }

      // Speaker preference
      if (media.speaker) {
        const current = profile.speakerPreferences.get(media.speaker) || 0;
        profile.speakerPreferences.set(media.speaker, current + weight);
      }

      // Event preference
      if (media.eventId) {
        const current = profile.eventPreferences.get(media.eventId) || 0;
        profile.eventPreferences.set(media.eventId, current + weight);
      }

      // Tag preferences
      if (media.tags && media.tags.length > 0) {
        for (const tag of media.tags) {
          const current = profile.tagPreferences.get(tag) || 0;
          profile.tagPreferences.set(tag, current + weight);
        }
      }

      // Embedding vector aggregation
      if (media.embedding && media.embedding.length > 0) {
        if (!vectorSum) {
          vectorSum = new Array(media.embedding.length).fill(0);
        }
        if (vectorSum.length === media.embedding.length) {
          for (let i = 0; i < media.embedding.length; i++) {
            vectorSum[i] += media.embedding[i] * weight;
          }
          vectorWeightTotal += weight;
        }
      }
    }

    if (vectorSum && vectorWeightTotal > 0) {
      profile.preferenceVector = vectorSum.map((v) => v / vectorWeightTotal);
    }

    this.userProfiles.set(userId, profile);
    return profile;
  }

  /**
   * Recommend items based on content similarity to user's profile.
   */
  public recommendForUser(
    userId: string,
    options: RecommendationOptions = {}
  ): RecommendationResultItem[] {
    const profile = this.userProfiles.get(userId) || this.buildUserProfile(userId);
    const limit = options.limit || 10;
    const offset = options.offset || 0;
    const minScore = options.minScore || 0.05;

    const userHistory = this.getUserInteractions(userId);
    const interactedMediaIds = new Set(userHistory.map((h) => h.mediaId));
    const excludeIds = new Set(options.excludeMediaIds || []);

    let candidates = Array.from(this.mediaStore.values());

    if (options.filterUnwatched !== false) {
      candidates = candidates.filter((item) => !interactedMediaIds.has(item.id));
    }
    if (excludeIds.size > 0) {
      candidates = candidates.filter((item) => !excludeIds.has(item.id));
    }
    if (options.category) {
      candidates = candidates.filter(
        (item) => item.category.toLowerCase() === options.category!.toLowerCase()
      );
    }
    if (options.language) {
      candidates = candidates.filter(
        (item) => item.language.toLowerCase() === options.language!.toLowerCase()
      );
    }
    if (options.eventId) {
      candidates = candidates.filter((item) => item.eventId === options.eventId);
    }

    // Score candidates against user profile
    const scoredResults: RecommendationResultItem[] = [];

    // Helper to get max profile feature score
    const getMaxProfileKey = (map: Map<string, number>): string | undefined => {
      let maxKey: string | undefined;
      let maxVal = -1;
      for (const [k, v] of map.entries()) {
        if (v > maxVal) {
          maxVal = v;
          maxKey = k;
        }
      }
      return maxKey;
    };

    const topCategory = getMaxProfileKey(profile.categoryPreferences);

    for (const item of candidates) {
      const score = this.scoreItemAgainstProfile(item, profile);

      if (score >= minScore) {
        let reason = 'Matches your content preferences';
        if (topCategory && item.category === topCategory) {
          reason = `Recommended based on your interest in ${topCategory}`;
        } else if (item.speaker && profile.speakerPreferences.has(item.speaker)) {
          reason = `Featuring ${item.speaker}, based on your listening history`;
        }

        scoredResults.push({
          media: item,
          score,
          reason,
          strategy: 'content_based',
        });
      }
    }

    scoredResults.sort((a, b) => b.score - a.score);
    return scoredResults.slice(offset, offset + limit);
  }

  /**
   * Recommend items similar to a specific media item.
   */
  public recommendSimilarMedia(
    mediaId: string,
    options: RecommendationOptions = {}
  ): RecommendationResultItem[] {
    const target = this.mediaStore.get(mediaId);
    if (!target) return [];

    const candidates = Array.from(this.mediaStore.values());
    const limit = options.limit || 10;
    const offset = options.offset || 0;
    const minScore = options.minScore || 0.05;
    const excludeIds = new Set(options.excludeMediaIds || []);

    const filteredCandidates = candidates.filter(
      (c) => c.id !== mediaId && !excludeIds.has(c.id)
    );

    const similarities = this.similarityEngine.findSimilarItems(
      target,
      filteredCandidates,
      candidates.length,
      minScore
    );

    return similarities.slice(offset, offset + limit).map((res) => ({
      media: res.media,
      score: res.score,
      reason: `Similar to ${target.title}`,
      strategy: 'content_based',
    }));
  }

  private scoreItemAgainstProfile(item: MediaItem, profile: UserContentProfile): number {
    if (profile.totalInteractions === 0) {
      // Cold start user profile: default baseline score
      return 0.1;
    }

    let categoryScore = 0;
    if (item.category && profile.categoryPreferences.has(item.category)) {
      categoryScore = profile.categoryPreferences.get(item.category)!;
    }

    let languageScore = 0;
    if (item.language && profile.languagePreferences.has(item.language)) {
      languageScore = profile.languagePreferences.get(item.language)!;
    }

    let speakerScore = 0;
    if (item.speaker && profile.speakerPreferences.has(item.speaker)) {
      speakerScore = profile.speakerPreferences.get(item.speaker)!;
    }

    let eventScore = 0;
    if (item.eventId && profile.eventPreferences.has(item.eventId)) {
      eventScore = profile.eventPreferences.get(item.eventId)!;
    }

    let tagScore = 0;
    if (item.tags) {
      for (const tag of item.tags) {
        if (profile.tagPreferences.has(tag)) {
          tagScore += profile.tagPreferences.get(tag)!;
        }
      }
    }

    let vectorScore = 0;
    if (profile.preferenceVector && item.embedding) {
      vectorScore = Math.max(0, this.similarityEngine.cosineSimilarity(profile.preferenceVector, item.embedding));
    }

    // Normalize raw sums by total interaction weight scale
    const normFactor = Math.max(1, profile.totalInteractions * 2);

    const combinedScore =
      (categoryScore / normFactor) * 0.3 +
      (languageScore / normFactor) * 0.2 +
      (tagScore / normFactor) * 0.25 +
      (speakerScore / normFactor) * 0.15 +
      (eventScore / normFactor) * 0.1 +
      vectorScore * 0.4;

    return Math.min(1.0, Math.max(0.0, combinedScore));
  }
}
