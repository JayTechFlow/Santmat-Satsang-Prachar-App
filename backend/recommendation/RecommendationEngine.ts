// Sprint M7.2 — Recommendation Engine: Main Recommendation Engine Orchestrator

import { MediaItem, SimilarityEngine } from './SimilarityEngine';
import {
  ContentBasedFiltering,
  UserInteraction,
  RecommendationOptions,
  RecommendationResultItem,
} from './ContentBasedFiltering';
import { CollaborativeFiltering } from './CollaborativeFiltering';
import { HybridRecommender } from './HybridRecommender';
import { MediaEventBus, MediaProcessingEvent, mediaEventBus } from '../media-processing/Events/MediaProcessingEvents';

export interface PlaybackState {
  userId: string;
  mediaId: string;
  lastPositionSeconds: number;
  totalDurationSeconds: number;
  completionPercentage: number;
  lastPlayedAt: string;
  media?: MediaItem;
}

export class RecommendationEngine {
  private mediaStore: Map<string, MediaItem> = new Map();
  private playbackStates: Map<string, PlaybackState> = new Map(); // key: userId_mediaId
  private recentViews: Map<string, UserInteraction[]> = new Map(); // key: userId

  private similarityEngine: SimilarityEngine;
  private contentFiltering: ContentBasedFiltering;
  private collaborativeFiltering: CollaborativeFiltering;
  private hybridRecommender: HybridRecommender;

  private isSubscribed: boolean = false;
  private unsubscribeFn: (() => void) | null = null;

  constructor(eventBus?: MediaEventBus) {
    this.similarityEngine = new SimilarityEngine();
    this.contentFiltering = new ContentBasedFiltering();
    this.collaborativeFiltering = new CollaborativeFiltering();
    this.hybridRecommender = new HybridRecommender(this.contentFiltering, this.collaborativeFiltering);

    if (eventBus || mediaEventBus) {
      this.connectToEventBus(eventBus || mediaEventBus);
    }
  }

  /**
   * Connect to MediaEventBus for automated media catalog ingestion.
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
          const item: MediaItem = {
            id: event.mediaId,
            title: (event.data.title as string) || (event.data.filename as string) || `Media ${event.mediaId}`,
            description: event.data.description as string,
            category: (event.data.category as string) || 'General',
            language: (event.data.language as string) || 'Hindi',
            tags: Array.isArray(event.data.tags) ? (event.data.tags as string[]) : [],
            eventId: event.data.eventId as string,
            eventName: event.data.eventName as string,
            speaker: event.data.speaker as string,
            durationSeconds: typeof event.data.durationSeconds === 'number' ? event.data.durationSeconds : undefined,
            embedding: Array.isArray(event.data.embedding) ? (event.data.embedding as number[]) : undefined,
            publishedAt: event.timestamp || new Date().toISOString(),
            playCount: 0,
            likeCount: 0,
            viewCount: 0,
            trendingScore: 1.0,
            metadata: event.data,
          };
          this.registerMedia(item);
        }
      }
    };

    const unsub1 = bus.subscribe('ProcessingCompleted', handler);
    const unsub2 = bus.subscribe('MediaStored', handler);
    const unsub3 = bus.subscribe('MetadataExtracted', handler);

    this.unsubscribeFn = () => {
      unsub1();
      unsub2();
      unsub3();
    };
    this.isSubscribed = true;
  }

  /**
   * Register or update MediaItems in the recommendation catalog.
   */
  public registerMedia(media: MediaItem | MediaItem[]): void {
    const items = Array.isArray(media) ? media : [media];
    for (const item of items) {
      this.mediaStore.set(item.id, item);
    }
    this.contentFiltering.registerMedia(items);
  }

  public getMedia(mediaId: string): MediaItem | undefined {
    return this.mediaStore.get(mediaId);
  }

  public getAllMedia(): MediaItem[] {
    return Array.from(this.mediaStore.values());
  }

  /**
   * Record user interaction across all sub-engines.
   */
  public recordInteraction(interaction: UserInteraction): void {
    const media = this.mediaStore.get(interaction.mediaId);
    if (media) {
      // Update interaction counters on media item
      if (interaction.type === 'view') media.viewCount = (media.viewCount || 0) + 1;
      if (interaction.type === 'play') media.playCount = (media.playCount || 0) + 1;
      if (interaction.type === 'like') media.likeCount = (media.likeCount || 0) + 1;
    }

    this.contentFiltering.recordUserInteraction(interaction);
    this.collaborativeFiltering.recordInteraction(interaction);

    // Record in recent views
    if (!this.recentViews.has(interaction.userId)) {
      this.recentViews.set(interaction.userId, []);
    }
    const userViews = this.recentViews.get(interaction.userId)!;
    userViews.push(interaction);
  }

  /**
   * Track playback position for 'Continue Listening' feature.
   */
  public updatePlaybackProgress(
    userId: string,
    mediaId: string,
    lastPositionSeconds: number,
    totalDurationSeconds: number
  ): void {
    if (totalDurationSeconds <= 0) return;

    const completionPercentage = (lastPositionSeconds / totalDurationSeconds) * 100;
    const key = `${userId}_${mediaId}`;
    const media = this.mediaStore.get(mediaId);

    const state: PlaybackState = {
      userId,
      mediaId,
      lastPositionSeconds,
      totalDurationSeconds,
      completionPercentage,
      lastPlayedAt: new Date().toISOString(),
      media,
    };

    this.playbackStates.set(key, state);

    // Record play or complete interaction based on progress
    const interType = completionPercentage >= 90 ? 'complete' : 'play';
    this.recordInteraction({
      userId,
      mediaId,
      type: interType,
      progressSeconds: lastPositionSeconds,
      totalDurationSeconds,
      timestamp: state.lastPlayedAt,
    });
  }

  // --- FEATURE IMPLEMENTATIONS ---

  /**
   * 1. Similar Media: Returns media similar to a target mediaId.
   */
  public getSimilarMedia(
    mediaId: string,
    options: RecommendationOptions = {}
  ): RecommendationResultItem[] {
    return this.contentFiltering.recommendSimilarMedia(mediaId, options);
  }

  /**
   * 2. Personalized Recommendations: Hybrid ensemble of content and collaborative filtering.
   */
  public getPersonalizedRecommendations(
    userId: string,
    options: RecommendationOptions = {}
  ): RecommendationResultItem[] {
    return this.hybridRecommender.recommend(userId, options);
  }

  /**
   * 3. Trending Media: Calculates score using view/play velocity and recency.
   */
  public getTrendingMedia(
    options: RecommendationOptions = {}
  ): RecommendationResultItem[] {
    const limit = options.limit || 10;
    const offset = options.offset || 0;
    let candidates = Array.from(this.mediaStore.values());

    if (options.category) {
      candidates = candidates.filter((m) => m.category.toLowerCase() === options.category!.toLowerCase());
    }
    if (options.language) {
      candidates = candidates.filter((m) => m.language.toLowerCase() === options.language!.toLowerCase());
    }
    if (options.eventId) {
      candidates = candidates.filter((m) => m.eventId === options.eventId);
    }

    const now = Date.now();

    const scored = candidates.map((media) => {
      const views = media.viewCount || 0;
      const plays = media.playCount || 0;
      const likes = media.likeCount || 0;

      // Age decay factor
      const pubTime = media.publishedAt ? new Date(media.publishedAt).getTime() : now;
      const ageHours = Math.max(1, (now - pubTime) / (1000 * 3600));

      // Velocity formula: (views + plays*2 + likes*3) / (ageHours ^ 1.5)
      const rawScore = (views * 1.0 + plays * 2.0 + likes * 3.0 + 5.0) / Math.pow(ageHours + 2, 0.5);

      return { media, score: rawScore };
    });

    let maxScore = 1;
    for (const s of scored) {
      if (s.score > maxScore) maxScore = s.score;
    }

    const results: RecommendationResultItem[] = scored.map((s) => ({
      media: s.media,
      score: Math.min(1.0, s.score / maxScore),
      reason: 'Trending satsang media among community listeners',
      strategy: 'trending',
    }));

    results.sort((a, b) => b.score - a.score);
    return results.slice(offset, offset + limit);
  }

  /**
   * 4. Continue Listening: Unfinished audio/video media items.
   */
  public getContinueListening(
    userId: string,
    options: RecommendationOptions = {}
  ): PlaybackState[] {
    const limit = options.limit || 10;
    const userStates: PlaybackState[] = [];

    for (const [key, state] of this.playbackStates.entries()) {
      if (key.startsWith(`${userId}_`)) {
        // Return only items partially listened (between 2% and 95%)
        if (state.completionPercentage >= 2 && state.completionPercentage < 95) {
          userStates.push(state);
        }
      }
    }

    userStates.sort((a, b) => new Date(b.lastPlayedAt).getTime() - new Date(a.lastPlayedAt).getTime());
    return userStates.slice(0, limit);
  }

  /**
   * 5. Recently Viewed: Items recently viewed or played by user.
   */
  public getRecentlyViewed(
    userId: string,
    options: RecommendationOptions = {}
  ): RecommendationResultItem[] {
    const limit = options.limit || 10;
    const views = this.recentViews.get(userId) || [];

    const seenMediaIds = new Set<string>();
    const deduplicatedViews: UserInteraction[] = [];

    // Reverse iterate to get newest interactions first
    for (let i = views.length - 1; i >= 0; i--) {
      const inter = views[i];
      if (!seenMediaIds.has(inter.mediaId)) {
        seenMediaIds.add(inter.mediaId);
        deduplicatedViews.push(inter);
      }
    }

    const results: RecommendationResultItem[] = [];
    for (const inter of deduplicatedViews) {
      const media = this.mediaStore.get(inter.mediaId);
      if (!media) continue;

      results.push({
        media,
        score: 1.0,
        reason: `Recently viewed on ${new Date(inter.timestamp).toLocaleDateString()}`,
        strategy: 'recent',
      });
    }

    return results.slice(0, limit);
  }

  /**
   * 6. Frequently Played Together: Items commonly listened together with target mediaId.
   */
  public getFrequentlyPlayedTogether(
    mediaId: string,
    options: RecommendationOptions = {}
  ): RecommendationResultItem[] {
    const limit = options.limit || 5;
    const allMedia = Array.from(this.mediaStore.values());
    return this.collaborativeFiltering.getFrequentlyPlayedTogether(mediaId, allMedia, limit);
  }

  /**
   * 7. Category Recommendation:
   * - Media within a specific category ranked by relevance.
   * - Top recommended categories for user.
   */
  public getCategoryRecommendations(
    category: string,
    options: RecommendationOptions = {}
  ): RecommendationResultItem[] {
    return this.getTrendingMedia({ ...options, category });
  }

  public getRecommendedCategoriesForUser(userId: string, limit: number = 5): string[] {
    const profile = this.contentFiltering.getUserProfile(userId);
    if (!profile || profile.categoryPreferences.size === 0) {
      // Fallback to top categories in store
      const categoryCounts = new Map<string, number>();
      for (const m of this.mediaStore.values()) {
        if (m.category) {
          categoryCounts.set(m.category, (categoryCounts.get(m.category) || 0) + 1);
        }
      }
      return Array.from(categoryCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([cat]) => cat);
    }

    return Array.from(profile.categoryPreferences.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([cat]) => cat);
  }

  /**
   * 8. Language Recommendation:
   * - Media in specific language ranked by relevance.
   * - Top recommended languages for user.
   */
  public getLanguageRecommendations(
    language: string,
    options: RecommendationOptions = {}
  ): RecommendationResultItem[] {
    return this.getTrendingMedia({ ...options, language });
  }

  public getRecommendedLanguagesForUser(userId: string, limit: number = 3): string[] {
    const profile = this.contentFiltering.getUserProfile(userId);
    if (!profile || profile.languagePreferences.size === 0) {
      const languageCounts = new Map<string, number>();
      for (const m of this.mediaStore.values()) {
        if (m.language) {
          languageCounts.set(m.language, (languageCounts.get(m.language) || 0) + 1);
        }
      }
      return Array.from(languageCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([lang]) => lang);
    }

    return Array.from(profile.languagePreferences.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([lang]) => lang);
  }

  /**
   * 9. Event Recommendation:
   * - Media for a specific event (e.g. Bhandara 2026).
   * - Top recommended events for user based on participation and preference.
   */
  public getEventRecommendations(
    eventId: string,
    options: RecommendationOptions = {}
  ): RecommendationResultItem[] {
    return this.getTrendingMedia({ ...options, eventId });
  }

  public getRecommendedEventsForUser(userId: string, limit: number = 3): string[] {
    const profile = this.contentFiltering.getUserProfile(userId);
    if (!profile || profile.eventPreferences.size === 0) {
      const eventCounts = new Map<string, number>();
      for (const m of this.mediaStore.values()) {
        if (m.eventId) {
          eventCounts.set(m.eventId, (eventCounts.get(m.eventId) || 0) + 1);
        }
      }
      return Array.from(eventCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([evt]) => evt);
    }

    return Array.from(profile.eventPreferences.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([evt]) => evt);
  }

  // Getters for internal sub-engines if needed for advanced usage
  public getSimilarityEngine(): SimilarityEngine {
    return this.similarityEngine;
  }

  public getContentFiltering(): ContentBasedFiltering {
    return this.contentFiltering;
  }

  public getCollaborativeFiltering(): CollaborativeFiltering {
    return this.collaborativeFiltering;
  }

  public getHybridRecommender(): HybridRecommender {
    return this.hybridRecommender;
  }
}
