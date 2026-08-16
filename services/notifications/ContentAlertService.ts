// Sprint M7.5 — Notification Intelligence: Content Alert Service

export interface NewContentPayload {
  id: string;
  title: string;
  type: 'audio' | 'video' | 'book' | 'article' | 'pravachan';
  category: string;
  tags: string[];
  author?: string;
  publishedAt: string;
  mediaUrl?: string;
  targetScreen?: string;
  description?: string;
}

export interface RecommendedContentItem {
  contentId: string;
  title: string;
  type: string;
  category: string;
  tags: string[];
  score: number;
  reason: string;
}

export interface UserPreferenceProfile {
  userId: string;
  favoriteCategories: string[];
  favoriteTags: string[];
  preferredContentTypes: string[];
  quietHoursStart?: string; // "22:00"
  quietHoursEnd?: string;   // "07:00"
  maxAlertsPerDay?: number;
  lastAlertSentAt?: string;
  dailyAlertCount?: number;
}

export interface ContentAlertNotification {
  id: string;
  title: string;
  message: string;
  category: string;
  type: 'new_content' | 'recommendation';
  targetScreen: string;
  contentId: string;
  contentType: string;
  tags: string[];
  createdAt: string;
  recipientUserId?: string;
  topicId?: string;
  recommendationDetails?: {
    score: number;
    reason: string;
  };
}

export class ContentAlertService {
  private alertHistory: ContentAlertNotification[] = [];
  private listeners: ((alert: ContentAlertNotification) => void)[] = [];
  private userPreferenceProfiles: Map<string, UserPreferenceProfile> = new Map();

  constructor() {}

  // --- New Content Alerts ---

  public triggerNewContentAlert(content: NewContentPayload): ContentAlertNotification {
    if (!content || !content.id || !content.title) {
      throw new Error('NewContentPayload requires id and title');
    }

    const normTags = (content.tags || []).map((t) => t.toLowerCase().trim());
    const targetScreenMap: Record<string, string> = {
      audio: 'Audio',
      video: 'Home',
      book: 'Books',
      article: 'Books',
      pravachan: 'Audio',
    };

    const alert: ContentAlertNotification = {
      id: `alert_new_${content.id}_${Date.now()}`,
      title: `New Content Published: ${content.title}`,
      message: content.description || `New ${content.type} "${content.title}" is now available in ${content.category}.`,
      category: content.category || 'Updates',
      type: 'new_content',
      targetScreen: content.targetScreen || targetScreenMap[content.type] || 'Home',
      contentId: content.id,
      contentType: content.type,
      tags: normTags,
      topicId: 'new_audio_releases',
      createdAt: new Date().toISOString(),
    };

    this.alertHistory.push(alert);
    this.notifyListeners(alert);
    return alert;
  }

  // --- Recommendation Alerts ---

  public generateRecommendationAlert(
    userId: string,
    recommendedItem: RecommendedContentItem
  ): ContentAlertNotification | null {
    if (!userId || !recommendedItem) return null;

    const userProfile = this.userPreferenceProfiles.get(userId);
    if (userProfile && !this.shouldSendAlertToUser(userId, userProfile)) {
      return null;
    }

    const alert: ContentAlertNotification = {
      id: `alert_rec_${userId}_${recommendedItem.contentId}_${Date.now()}`,
      title: `Recommended for You: ${recommendedItem.title}`,
      message: `Based on your interest in ${recommendedItem.reason.toLowerCase()}, we think you will love this ${recommendedItem.type}.`,
      category: recommendedItem.category || 'विशेष',
      type: 'recommendation',
      targetScreen: 'Audio',
      contentId: recommendedItem.contentId,
      contentType: recommendedItem.type,
      tags: recommendedItem.tags || [],
      recipientUserId: userId,
      createdAt: new Date().toISOString(),
      recommendationDetails: {
        score: recommendedItem.score,
        reason: recommendedItem.reason,
      },
    };

    this.alertHistory.push(alert);
    this.updateUserAlertStats(userId);
    this.notifyListeners(alert);
    return alert;
  }

  public generateBatchRecommendationAlerts(
    userItems: { userId: string; item: RecommendedContentItem }[]
  ): ContentAlertNotification[] {
    const generated: ContentAlertNotification[] = [];
    for (const { userId, item } of userItems) {
      const alert = this.generateRecommendationAlert(userId, item);
      if (alert) {
        generated.push(alert);
      }
    }
    return generated;
  }

  // --- User Preferences & Filtering Rules ---

  public setUserPreferenceProfile(profile: UserPreferenceProfile): void {
    if (!profile || !profile.userId) return;
    this.userPreferenceProfiles.set(profile.userId, {
      ...profile,
      favoriteCategories: profile.favoriteCategories.map((c) => c.toLowerCase()),
      favoriteTags: profile.favoriteTags.map((t) => t.toLowerCase()),
      dailyAlertCount: profile.dailyAlertCount || 0,
    });
  }

  public getUserPreferenceProfile(userId: string): UserPreferenceProfile | undefined {
    return this.userPreferenceProfiles.get(userId);
  }

  public shouldSendAlertToUser(userId: string, profile?: UserPreferenceProfile): boolean {
    const userProf = profile || this.userPreferenceProfiles.get(userId);
    if (!userProf) return true;

    // 1. Check Frequency Caps
    const maxDaily = userProf.maxAlertsPerDay ?? 5;
    const currentDaily = userProf.dailyAlertCount ?? 0;
    if (currentDaily >= maxDaily) {
      return false;
    }

    // 2. Check Quiet Hours
    if (userProf.quietHoursStart && userProf.quietHoursEnd) {
      if (this.isInQuietHours(userProf.quietHoursStart, userProf.quietHoursEnd)) {
        return false;
      }
    }

    return true;
  }

  public isInQuietHours(
    quietStart: string,
    quietEnd: string,
    currentTime: Date = new Date()
  ): boolean {
    const parseMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const startMinutes = parseMinutes(quietStart);
    const endMinutes = parseMinutes(quietEnd);

    if (startMinutes < endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } else {
      // Overnight quiet hours (e.g. 22:00 to 07:00)
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
  }

  private updateUserAlertStats(userId: string): void {
    const prof = this.userPreferenceProfiles.get(userId);
    if (prof) {
      prof.dailyAlertCount = (prof.dailyAlertCount || 0) + 1;
      prof.lastAlertSentAt = new Date().toISOString();
      this.userPreferenceProfiles.set(userId, prof);
    }
  }

  // --- Observability & History ---

  public registerContentListener(callback: (alert: ContentAlertNotification) => void): void {
    this.listeners.push(callback);
  }

  public getAlertHistory(userId?: string, limit: number = 50): ContentAlertNotification[] {
    if (!userId) {
      return this.alertHistory.slice(-limit);
    }
    return this.alertHistory
      .filter((a) => a.recipientUserId === userId || !a.recipientUserId)
      .slice(-limit);
  }

  private notifyListeners(alert: ContentAlertNotification): void {
    for (const listener of this.listeners) {
      try {
        listener(alert);
      } catch (err) {
        // Suppress listener error
      }
    }
  }
}
