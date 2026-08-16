// Sprint M7.3 — Personalization Engine (Agent C): User Preferences Store

export interface InteractionHistoryItem {
  id: string;
  userId: string;
  contentId: string;
  contentType: 'audio' | 'video' | 'book' | 'article' | string;
  category: string;
  speaker?: string;
  language: string;
  durationPlayedSeconds?: number;
  totalDurationSeconds?: number;
  completionRatio?: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface UserPreferences {
  userId: string;
  favoriteCategories: string[];
  favoriteSpeakers: string[];
  favoriteLanguages: string[];
  preferredContentTypes: string[];
  dashboardLayout: 'default' | 'grid' | 'compact' | 'custom' | string;
  enablePersonalizedRecommendations: boolean;
  playbackHistory: InteractionHistoryItem[];
  watchHistory: InteractionHistoryItem[];
  readingHistory: InteractionHistoryItem[];
  customSettings?: Record<string, any>;
  updatedAt: string;
}

export class UserPreferencesStore {
  private store: Map<string, UserPreferences> = new Map();
  private maxHistoryLimit: number = 200;

  constructor(maxHistoryLimit: number = 200) {
    this.maxHistoryLimit = maxHistoryLimit;
  }

  public getPreferences(userId: string): UserPreferences {
    if (!this.store.has(userId)) {
      const defaultPrefs: UserPreferences = {
        userId,
        favoriteCategories: [],
        favoriteSpeakers: [],
        favoriteLanguages: [],
        preferredContentTypes: ['audio', 'video', 'book'],
        dashboardLayout: 'default',
        enablePersonalizedRecommendations: true,
        playbackHistory: [],
        watchHistory: [],
        readingHistory: [],
        customSettings: {},
        updatedAt: new Date().toISOString(),
      };
      this.store.set(userId, defaultPrefs);
    }
    return JSON.parse(JSON.stringify(this.store.get(userId)!));
  }

  public savePreferences(preferences: UserPreferences): void {
    preferences.updatedAt = new Date().toISOString();
    this.store.set(preferences.userId, JSON.parse(JSON.stringify(preferences)));
  }

  public toggleFavoriteCategory(userId: string, category: string): boolean {
    const prefs = this.getPreferences(userId);
    const index = prefs.favoriteCategories.indexOf(category);
    let added = false;
    if (index >= 0) {
      prefs.favoriteCategories.splice(index, 1);
    } else {
      prefs.favoriteCategories.push(category);
      added = true;
    }
    this.savePreferences(prefs);
    return added;
  }

  public toggleFavoriteSpeaker(userId: string, speaker: string): boolean {
    const prefs = this.getPreferences(userId);
    const index = prefs.favoriteSpeakers.indexOf(speaker);
    let added = false;
    if (index >= 0) {
      prefs.favoriteSpeakers.splice(index, 1);
    } else {
      prefs.favoriteSpeakers.push(speaker);
      added = true;
    }
    this.savePreferences(prefs);
    return added;
  }

  public toggleFavoriteLanguage(userId: string, language: string): boolean {
    const prefs = this.getPreferences(userId);
    const index = prefs.favoriteLanguages.indexOf(language);
    let added = false;
    if (index >= 0) {
      prefs.favoriteLanguages.splice(index, 1);
    } else {
      prefs.favoriteLanguages.push(language);
      added = true;
    }
    this.savePreferences(prefs);
    return added;
  }

  public setFavoriteCategories(userId: string, categories: string[]): string[] {
    const prefs = this.getPreferences(userId);
    prefs.favoriteCategories = Array.from(new Set(categories));
    this.savePreferences(prefs);
    return prefs.favoriteCategories;
  }

  public setFavoriteSpeakers(userId: string, speakers: string[]): string[] {
    const prefs = this.getPreferences(userId);
    prefs.favoriteSpeakers = Array.from(new Set(speakers));
    this.savePreferences(prefs);
    return prefs.favoriteSpeakers;
  }

  public setFavoriteLanguages(userId: string, languages: string[]): string[] {
    const prefs = this.getPreferences(userId);
    prefs.favoriteLanguages = Array.from(new Set(languages));
    this.savePreferences(prefs);
    return prefs.favoriteLanguages;
  }

  public addPlaybackHistory(
    userId: string,
    item: Omit<InteractionHistoryItem, 'id' | 'userId' | 'timestamp'> & { timestamp?: string }
  ): InteractionHistoryItem {
    const prefs = this.getPreferences(userId);
    const historyItem: InteractionHistoryItem = {
      ...item,
      id: `play_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      contentType: item.contentType || 'audio',
      timestamp: item.timestamp || new Date().toISOString(),
      completionRatio: item.completionRatio ?? (item.durationPlayedSeconds && item.totalDurationSeconds ? Math.min(1, item.durationPlayedSeconds / item.totalDurationSeconds) : 1),
    };

    // Prepend to history, filter duplicates of same contentId if recent
    prefs.playbackHistory = [historyItem, ...prefs.playbackHistory.filter(h => h.contentId !== item.contentId)].slice(0, this.maxHistoryLimit);
    this.savePreferences(prefs);
    return historyItem;
  }

  public addWatchHistory(
    userId: string,
    item: Omit<InteractionHistoryItem, 'id' | 'userId' | 'timestamp'> & { timestamp?: string }
  ): InteractionHistoryItem {
    const prefs = this.getPreferences(userId);
    const historyItem: InteractionHistoryItem = {
      ...item,
      id: `watch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      contentType: item.contentType || 'video',
      timestamp: item.timestamp || new Date().toISOString(),
      completionRatio: item.completionRatio ?? (item.durationPlayedSeconds && item.totalDurationSeconds ? Math.min(1, item.durationPlayedSeconds / item.totalDurationSeconds) : 1),
    };

    prefs.watchHistory = [historyItem, ...prefs.watchHistory.filter(h => h.contentId !== item.contentId)].slice(0, this.maxHistoryLimit);
    this.savePreferences(prefs);
    return historyItem;
  }

  public addReadingHistory(
    userId: string,
    item: Omit<InteractionHistoryItem, 'id' | 'userId' | 'timestamp'> & { timestamp?: string }
  ): InteractionHistoryItem {
    const prefs = this.getPreferences(userId);
    const historyItem: InteractionHistoryItem = {
      ...item,
      id: `read_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      contentType: item.contentType || 'book',
      timestamp: item.timestamp || new Date().toISOString(),
      completionRatio: item.completionRatio ?? 1,
    };

    prefs.readingHistory = [historyItem, ...prefs.readingHistory.filter(h => h.contentId !== item.contentId)].slice(0, this.maxHistoryLimit);
    this.savePreferences(prefs);
    return historyItem;
  }

  public getPlaybackHistory(userId: string, limit: number = 20): InteractionHistoryItem[] {
    const prefs = this.getPreferences(userId);
    return prefs.playbackHistory.slice(0, limit);
  }

  public getWatchHistory(userId: string, limit: number = 20): InteractionHistoryItem[] {
    const prefs = this.getPreferences(userId);
    return prefs.watchHistory.slice(0, limit);
  }

  public getReadingHistory(userId: string, limit: number = 20): InteractionHistoryItem[] {
    const prefs = this.getPreferences(userId);
    return prefs.readingHistory.slice(0, limit);
  }

  public clearHistory(userId: string, historyType: 'playback' | 'watch' | 'reading' | 'all' = 'all'): void {
    const prefs = this.getPreferences(userId);
    if (historyType === 'all' || historyType === 'playback') {
      prefs.playbackHistory = [];
    }
    if (historyType === 'all' || historyType === 'watch') {
      prefs.watchHistory = [];
    }
    if (historyType === 'all' || historyType === 'reading') {
      prefs.readingHistory = [];
    }
    this.savePreferences(prefs);
  }

  public exportUserData(userId: string): string {
    const prefs = this.getPreferences(userId);
    return JSON.stringify(prefs, null, 2);
  }

  public importUserData(userId: string, jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (typeof parsed !== 'object' || !parsed) return false;
      parsed.userId = userId;
      parsed.updatedAt = new Date().toISOString();
      this.store.set(userId, parsed);
      return true;
    } catch {
      return false;
    }
  }

  public clearAllStores(): void {
    this.store.clear();
  }
}
