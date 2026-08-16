// Sprint M7.3 — Personalization Engine (Agent C): Dynamic Homepage Engine

import { UserProfile } from './UserProfileLearner';
import { UserPreferences, InteractionHistoryItem } from './UserPreferencesStore';

export interface MediaItem {
  id: string;
  title: string;
  type: 'audio' | 'video' | 'book' | 'article' | string;
  category: string;
  speaker?: string;
  language: string;
  tags?: string[];
  coverUrl?: string;
  duration?: number;
  publishedAt?: string;
  popularityScore?: number;
  metadata?: Record<string, any>;
}

export type SectionType =
  | 'continue_listening'
  | 'continue_watching'
  | 'continue_reading'
  | 'recommended_for_you'
  | 'favorite_speakers'
  | 'top_categories'
  | 'preferred_language_highlights'
  | 'trending'
  | 'recent_uploads';

export interface HomepageSection {
  id: string;
  title: string;
  sectionType: SectionType;
  items: MediaItem[];
  itemCount: number;
  relevanceScore: number;
}

export interface DynamicHomepageLayout {
  userId: string;
  sections: HomepageSection[];
  generatedAt: string;
  appliedPreferences: {
    favoriteCategories: string[];
    favoriteSpeakers: string[];
    favoriteLanguages: string[];
    dashboardLayout: string;
  };
}

export interface DynamicHomepageOptions {
  maxItemsPerSection?: number;
  enabledSections?: SectionType[];
  filterHistoryItems?: boolean;
}

export class DynamicHomepageEngine {
  private defaultMaxItems: number;

  constructor(defaultMaxItems: number = 10) {
    this.defaultMaxItems = defaultMaxItems;
  }

  public generateHomepage(
    userProfile: UserProfile,
    preferences: UserPreferences,
    catalog: MediaItem[],
    options: DynamicHomepageOptions = {}
  ): DynamicHomepageLayout {
    const maxItems = options.maxItemsPerSection || this.defaultMaxItems;
    const isGuest = userProfile.engagementLevel === 'new' && userProfile.totalInteractions === 0;

    const watchedContentIds = new Set<string>([
      ...preferences.playbackHistory.map(h => h.contentId),
      ...preferences.watchHistory.map(h => h.contentId),
      ...preferences.readingHistory.map(h => h.contentId),
    ]);

    const sections: HomepageSection[] = [];

    // 1. Continue Listening
    const continueAudioItems = this.getContinueItems(preferences.playbackHistory, catalog, 'audio');
    if (continueAudioItems.length > 0 && this.isSectionEnabled('continue_listening', options)) {
      sections.push({
        id: 'sec_continue_listening',
        title: 'Continue Listening',
        sectionType: 'continue_listening',
        items: continueAudioItems.slice(0, maxItems),
        itemCount: Math.min(continueAudioItems.length, maxItems),
        relevanceScore: 1.0,
      });
    }

    // 2. Continue Watching
    const continueVideoItems = this.getContinueItems(preferences.watchHistory, catalog, 'video');
    if (continueVideoItems.length > 0 && this.isSectionEnabled('continue_watching', options)) {
      sections.push({
        id: 'sec_continue_watching',
        title: 'Continue Watching',
        sectionType: 'continue_watching',
        items: continueVideoItems.slice(0, maxItems),
        itemCount: Math.min(continueVideoItems.length, maxItems),
        relevanceScore: 1.0,
      });
    }

    // 3. Continue Reading
    const continueReadingItems = this.getContinueItems(preferences.readingHistory, catalog, 'book');
    if (continueReadingItems.length > 0 && this.isSectionEnabled('continue_reading', options)) {
      sections.push({
        id: 'sec_continue_reading',
        title: 'Continue Reading',
        sectionType: 'continue_reading',
        items: continueReadingItems.slice(0, maxItems),
        itemCount: Math.min(continueReadingItems.length, maxItems),
        relevanceScore: 1.0,
      });
    }

    // 4. Recommended For You (scored by userProfile affinities)
    if (this.isSectionEnabled('recommended_for_you', options)) {
      const recommended = this.rankMediaForUser(catalog, userProfile, options.filterHistoryItems ? watchedContentIds : undefined);
      if (recommended.length > 0) {
        sections.push({
          id: 'sec_recommended_for_you',
          title: 'Recommended Satsangs & Pravachans',
          sectionType: 'recommended_for_you',
          items: recommended.slice(0, maxItems),
          itemCount: Math.min(recommended.length, maxItems),
          relevanceScore: 0.95,
        });
      }
    }

    // 5. Favorite Speakers
    if (this.isSectionEnabled('favorite_speakers', options)) {
      const targetSpeakers = Array.from(
        new Set([...preferences.favoriteSpeakers, ...userProfile.topSpeakers])
      );
      if (targetSpeakers.length > 0) {
        const speakerItems = catalog.filter(m => m.speaker && targetSpeakers.includes(m.speaker));
        if (speakerItems.length > 0) {
          sections.push({
            id: 'sec_favorite_speakers',
            title: `Discourses by ${targetSpeakers[0]}${targetSpeakers.length > 1 ? ' & More' : ''}`,
            sectionType: 'favorite_speakers',
            items: speakerItems.slice(0, maxItems),
            itemCount: Math.min(speakerItems.length, maxItems),
            relevanceScore: 0.90,
          });
        }
      }
    }

    // 6. Top Categories
    if (this.isSectionEnabled('top_categories', options)) {
      const targetCategories = Array.from(
        new Set([...preferences.favoriteCategories, ...userProfile.topCategories])
      );
      const categoryItems = targetCategories.length > 0
        ? catalog.filter(m => targetCategories.includes(m.category))
        : catalog;

      if (categoryItems.length > 0) {
        sections.push({
          id: 'sec_top_categories',
          title: targetCategories.length > 0 ? `Featured in ${targetCategories[0]}` : 'Top Categories',
          sectionType: 'top_categories',
          items: categoryItems.slice(0, maxItems),
          itemCount: Math.min(categoryItems.length, maxItems),
          relevanceScore: 0.85,
        });
      }
    }

    // 7. Preferred Language Highlights
    if (this.isSectionEnabled('preferred_language_highlights', options)) {
      const targetLanguages = Array.from(
        new Set([...preferences.favoriteLanguages, ...userProfile.topLanguages])
      );
      if (targetLanguages.length > 0) {
        const languageItems = catalog.filter(m => targetLanguages.includes(m.language));
        if (languageItems.length > 0) {
          sections.push({
            id: 'sec_language_highlights',
            title: `${targetLanguages[0]} Satsangs & Literature`,
            sectionType: 'preferred_language_highlights',
            items: languageItems.slice(0, maxItems),
            itemCount: Math.min(languageItems.length, maxItems),
            relevanceScore: 0.80,
          });
        }
      }
    }

    // 8. Trending
    if (this.isSectionEnabled('trending', options)) {
      const trendingItems = [...catalog].sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0));
      sections.push({
        id: 'sec_trending',
        title: 'Trending Satsangs & Audio Books',
        sectionType: 'trending',
        items: trendingItems.slice(0, maxItems),
        itemCount: Math.min(trendingItems.length, maxItems),
        relevanceScore: isGuest ? 1.0 : 0.75,
      });
    }

    // 9. Recent Uploads
    if (this.isSectionEnabled('recent_uploads', options)) {
      const recentItems = [...catalog].sort((a, b) => {
        const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return timeB - timeA;
      });
      sections.push({
        id: 'sec_recent_uploads',
        title: 'Recently Added Pravachans & Books',
        sectionType: 'recent_uploads',
        items: recentItems.slice(0, maxItems),
        itemCount: Math.min(recentItems.length, maxItems),
        relevanceScore: isGuest ? 0.95 : 0.70,
      });
    }

    // Sort sections by relevance score if guest or customized
    if (isGuest) {
      sections.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    return {
      userId: preferences.userId,
      sections,
      generatedAt: new Date().toISOString(),
      appliedPreferences: {
        favoriteCategories: preferences.favoriteCategories,
        favoriteSpeakers: preferences.favoriteSpeakers,
        favoriteLanguages: preferences.favoriteLanguages,
        dashboardLayout: preferences.dashboardLayout,
      },
    };
  }

  private getContinueItems(
    history: InteractionHistoryItem[],
    catalog: MediaItem[],
    expectedType: string
  ): MediaItem[] {
    const results: MediaItem[] = [];
    const seenContentIds = new Set<string>();

    for (const entry of history) {
      if (seenContentIds.has(entry.contentId)) continue;
      seenContentIds.add(entry.contentId);

      // Only items that are in progress (less than 95% complete and > 5% played)
      const completionRatio = entry.completionRatio ?? 0;
      if (completionRatio >= 0.05 && completionRatio < 0.95) {
        const matched = catalog.find(m => m.id === entry.contentId);
        if (matched) {
          results.push(matched);
        } else {
          // Construct item placeholder from history item metadata if catalog missing
          results.push({
            id: entry.contentId,
            title: entry.metadata?.title || `Item ${entry.contentId}`,
            type: entry.contentType || expectedType,
            category: entry.category,
            speaker: entry.speaker,
            language: entry.language,
          });
        }
      }
    }
    return results;
  }

  public rankMediaForUser(
    catalog: MediaItem[],
    profile: UserProfile,
    watchedContentIds?: Set<string>
  ): MediaItem[] {
    const scoredList = catalog
      .filter(item => !watchedContentIds || !watchedContentIds.has(item.id))
      .map(item => {
        let score = 0;

        // Category affinity
        const catAffinity = profile.categoryAffinities[item.category] || 0;
        score += catAffinity * 0.35;

        // Speaker affinity
        if (item.speaker) {
          const speakerAffinity = profile.speakerAffinities[item.speaker] || 0;
          score += speakerAffinity * 0.30;
        }

        // Language affinity
        const langAffinity = profile.languageAffinities[item.language] || 0;
        score += langAffinity * 0.20;

        // Content type affinity
        const typeAffinity = profile.contentTypeAffinities[item.type] || 0;
        score += typeAffinity * 0.10;

        // Popularity score bonus
        if (item.popularityScore) {
          score += Math.min(1.0, item.popularityScore / 100) * 0.05;
        }

        return { item, score };
      });

    scoredList.sort((a, b) => b.score - a.score);
    return scoredList.map(s => s.item);
  }

  private isSectionEnabled(section: SectionType, options: DynamicHomepageOptions): boolean {
    if (!options.enabledSections || options.enabledSections.length === 0) return true;
    return options.enabledSections.includes(section);
  }
}
