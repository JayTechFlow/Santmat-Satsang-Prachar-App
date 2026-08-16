// Sprint M7.5 — Notification Intelligence: Topic Subscription Manager

export interface TopicDefinition {
  id: string;
  name: string;
  description?: string;
  category: string;
  tags?: string[];
  isDefault?: boolean;
  defaultChannel?: 'push' | 'in_app' | 'email' | 'sms' | 'all';
  createdAt?: string;
}

export interface SubscriptionOptions {
  preferredChannel?: 'push' | 'in_app' | 'email' | 'sms' | 'all';
  quietHours?: {
    start: string; // HH:mm format, e.g. "22:00"
    end: string;   // HH:mm format, e.g. "07:00"
  };
  maxFrequencyPerDay?: number;
  status?: 'active' | 'paused' | 'muted';
}

export interface UserSubscription {
  id: string;
  userId: string;
  topicId: string;
  subscribedAt: string;
  options: SubscriptionOptions;
}

export interface DeviceTokenInfo {
  token: string;
  platform: 'ios' | 'android' | 'web';
  lastActiveAt: string;
  enabled: boolean;
}

export class TopicSubscriptionManager {
  private topics: Map<string, TopicDefinition> = new Map();
  private userSubscriptions: Map<string, Map<string, UserSubscription>> = new Map(); // userId -> (topicId -> UserSubscription)
  private userDeviceTokens: Map<string, Map<string, DeviceTokenInfo>> = new Map(); // userId -> (token -> DeviceTokenInfo)

  constructor() {
    this.initializeDefaultTopics();
  }

  private initializeDefaultTopics(): void {
    const defaults: TopicDefinition[] = [
      {
        id: 'satsang_announcements',
        name: 'Satsang Announcements',
        description: 'Important updates regarding upcoming Satsangs and events',
        category: 'Events',
        tags: ['satsang', 'events', 'announcements'],
        isDefault: true,
        defaultChannel: 'all',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'daily_quotes',
        name: 'Daily Spiritual Quotes',
        description: 'Daily quotes and Vani from Santmat Gurus',
        category: 'Spiritual',
        tags: ['quotes', 'daily', 'vani'],
        isDefault: false,
        defaultChannel: 'push',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'new_audio_releases',
        name: 'New Audio & Bhajans',
        description: 'Notifications when new audio discourses or bhajans are published',
        category: 'Media',
        tags: ['audio', 'bhajan', 'media'],
        isDefault: true,
        defaultChannel: 'push',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'live_stream_alerts',
        name: 'Live Stream Broadcasts',
        description: 'Immediate alerts when live Satsang streams start',
        category: 'Live',
        tags: ['live', 'stream', 'broadcast'],
        isDefault: true,
        defaultChannel: 'push',
        createdAt: new Date().toISOString(),
      },
    ];

    for (const topic of defaults) {
      this.topics.set(topic.id, topic);
    }
  }

  // --- Topic Metadata Management ---

  public registerTopic(topic: TopicDefinition): void {
    if (!topic || !topic.id) return;
    const normalized: TopicDefinition = {
      ...topic,
      tags: (topic.tags || []).map((t) => t.toLowerCase().trim()),
      createdAt: topic.createdAt || new Date().toISOString(),
    };
    this.topics.set(normalized.id, normalized);
  }

  public unregisterTopic(topicId: string): void {
    this.topics.delete(topicId);
    // Cleanup subscriptions for deleted topic
    for (const userSubs of this.userSubscriptions.values()) {
      userSubs.delete(topicId);
    }
  }

  public getTopic(topicId: string): TopicDefinition | undefined {
    return this.topics.get(topicId);
  }

  public listTopics(category?: string): TopicDefinition[] {
    const all = Array.from(this.topics.values());
    if (!category) return all;
    return all.filter((t) => t.category.toLowerCase() === category.toLowerCase());
  }

  // --- User Subscription Management ---

  public async subscribe(
    userId: string,
    topicId: string,
    options: SubscriptionOptions = {}
  ): Promise<UserSubscription> {
    if (!userId || !topicId) {
      throw new Error('userId and topicId are required for subscription');
    }

    if (!this.topics.has(topicId)) {
      // Auto-register default topic if missing
      this.registerTopic({
        id: topicId,
        name: topicId.replace(/_/g, ' ').toUpperCase(),
        category: 'General',
        createdAt: new Date().toISOString(),
      });
    }

    if (!this.userSubscriptions.has(userId)) {
      this.userSubscriptions.set(userId, new Map());
    }

    const defaultOptions: SubscriptionOptions = {
      preferredChannel: options.preferredChannel || this.topics.get(topicId)?.defaultChannel || 'push',
      status: options.status || 'active',
      maxFrequencyPerDay: options.maxFrequencyPerDay ?? 10,
      quietHours: options.quietHours,
    };

    const sub: UserSubscription = {
      id: `sub_${userId}_${topicId}`,
      userId,
      topicId,
      subscribedAt: new Date().toISOString(),
      options: defaultOptions,
    };

    this.userSubscriptions.get(userId)!.set(topicId, sub);
    return sub;
  }

  public async unsubscribe(userId: string, topicId: string): Promise<boolean> {
    const userSubs = this.userSubscriptions.get(userId);
    if (!userSubs || !userSubs.has(topicId)) {
      return false;
    }
    userSubs.delete(topicId);
    return true;
  }

  public isSubscribed(userId: string, topicId: string): boolean {
    const userSubs = this.userSubscriptions.get(userId);
    if (!userSubs) return false;
    const sub = userSubs.get(topicId);
    return !!sub && sub.options.status === 'active';
  }

  public getUserSubscriptions(userId: string): UserSubscription[] {
    const userSubs = this.userSubscriptions.get(userId);
    if (!userSubs) return [];
    return Array.from(userSubs.values());
  }

  public getSubscribersForTopic(topicId: string): UserSubscription[] {
    const subscribers: UserSubscription[] = [];
    for (const userSubs of this.userSubscriptions.values()) {
      const sub = userSubs.get(topicId);
      if (sub && sub.options.status === 'active') {
        subscribers.push(sub);
      }
    }
    return subscribers;
  }

  public updateSubscriptionPreferences(
    userId: string,
    topicId: string,
    options: Partial<SubscriptionOptions>
  ): boolean {
    const userSubs = this.userSubscriptions.get(userId);
    if (!userSubs || !userSubs.has(topicId)) {
      return false;
    }

    const existing = userSubs.get(topicId)!;
    existing.options = {
      ...existing.options,
      ...options,
    };
    return true;
  }

  // --- Device Token Tracking ---

  public registerUserDeviceToken(userId: string, deviceToken: DeviceTokenInfo): void {
    if (!userId || !deviceToken || !deviceToken.token) return;

    if (!this.userDeviceTokens.has(userId)) {
      this.userDeviceTokens.set(userId, new Map());
    }

    const tokenMap = this.userDeviceTokens.get(userId)!;
    tokenMap.set(deviceToken.token, {
      ...deviceToken,
      lastActiveAt: deviceToken.lastActiveAt || new Date().toISOString(),
      enabled: deviceToken.enabled !== undefined ? deviceToken.enabled : true,
    });
  }

  public removeUserDeviceToken(userId: string, token: string): void {
    const tokenMap = this.userDeviceTokens.get(userId);
    if (tokenMap) {
      tokenMap.delete(token);
    }
  }

  public getUserDeviceTokens(userId: string): DeviceTokenInfo[] {
    const tokenMap = this.userDeviceTokens.get(userId);
    if (!tokenMap) return [];
    return Array.from(tokenMap.values()).filter((d) => d.enabled);
  }

  public getDeviceTokensForTopic(topicId: string): string[] {
    const subscribers = this.getSubscribersForTopic(topicId);
    const tokens: string[] = [];

    for (const sub of subscribers) {
      const userTokens = this.getUserDeviceTokens(sub.userId);
      for (const t of userTokens) {
        tokens.push(t.token);
      }
    }

    return Array.from(new Set(tokens));
  }

  // --- Tag Matching & Helper Subscriptions ---

  public async subscribeToTags(userId: string, tags: string[]): Promise<UserSubscription[]> {
    const matchingTopics = this.getMatchingTopicsForTags(tags);
    const results: UserSubscription[] = [];

    for (const topic of matchingTopics) {
      const sub = await this.subscribe(userId, topic.id);
      results.push(sub);
    }

    return results;
  }

  public getMatchingTopicsForTags(tags: string[]): TopicDefinition[] {
    const normTags = tags.map((t) => t.toLowerCase().trim());
    return Array.from(this.topics.values()).filter((topic) =>
      topic.tags?.some((tag) => normTags.includes(tag.toLowerCase()))
    );
  }
}
