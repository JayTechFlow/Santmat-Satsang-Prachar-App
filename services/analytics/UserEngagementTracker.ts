// Sprint M7.6 — Advanced Analytics Engine: User Engagement Tracker

export type EngagementEventType =
  | 'view'
  | 'like'
  | 'share'
  | 'comment'
  | 'download'
  | 'bookmark'
  | 'dwell_time';

export interface EngagementEvent {
  id: string;
  userId: string;
  eventType: EngagementEventType;
  contentId?: string;
  durationSeconds?: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface UserEngagementProfile {
  userId: string;
  totalInteractions: number;
  totalDwellTimeSeconds: number;
  engagementScore: number;
  lastActive: string;
  interactionBreakdown: Record<EngagementEventType, number>;
}

export interface RetentionMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  stickinessRatio: number; // DAU / MAU ratio
  churnRateEstimate: number;
}

export interface EngagementSummary {
  totalEvents: number;
  uniqueUsers: number;
  avgDwellTimePerUser: number;
  avgEngagementScore: number;
  topEngagedUsers: UserEngagementProfile[];
  eventTypeCounts: Record<EngagementEventType, number>;
}

export class UserEngagementTracker {
  private events: EngagementEvent[] = [];
  private userProfiles: Map<string, UserEngagementProfile> = new Map();

  // Weights for computing user engagement score
  private readonly EVENT_WEIGHTS: Record<EngagementEventType, number> = {
    view: 1,
    dwell_time: 2,
    like: 5,
    bookmark: 5,
    share: 10,
    comment: 8,
    download: 12,
  };

  /**
   * Track a user engagement event and update the user's profile score.
   */
  public trackEvent(
    userId: string,
    eventType: EngagementEventType,
    contentId?: string,
    durationSeconds?: number,
    metadata?: Record<string, any>
  ): EngagementEvent {
    const event: EngagementEvent = {
      id: `eng_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      eventType,
      contentId,
      durationSeconds: durationSeconds || 0,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.events.push(event);
    this.updateUserProfile(event);
    return event;
  }

  private updateUserProfile(event: EngagementEvent): void {
    let profile = this.userProfiles.get(event.userId);

    if (!profile) {
      profile = {
        userId: event.userId,
        totalInteractions: 0,
        totalDwellTimeSeconds: 0,
        engagementScore: 0,
        lastActive: event.timestamp,
        interactionBreakdown: {
          view: 0,
          like: 0,
          share: 0,
          comment: 0,
          download: 0,
          bookmark: 0,
          dwell_time: 0,
        },
      };
      this.userProfiles.set(event.userId, profile);
    }

    profile.totalInteractions += 1;
    profile.lastActive = event.timestamp;
    profile.interactionBreakdown[event.eventType] =
      (profile.interactionBreakdown[event.eventType] || 0) + 1;

    if (event.eventType === 'dwell_time' || event.durationSeconds) {
      profile.totalDwellTimeSeconds += event.durationSeconds || 0;
    }

    // Recalculate engagement score
    let score = 0;
    for (const [type, count] of Object.entries(profile.interactionBreakdown)) {
      const weight = this.EVENT_WEIGHTS[type as EngagementEventType] || 1;
      score += count * weight;
    }
    // Add point bonus for dwell time (1 point per 60s)
    score += Math.floor(profile.totalDwellTimeSeconds / 60);
    profile.engagementScore = score;
  }

  /**
   * Get user engagement profile by user ID.
   */
  public getUserProfile(userId: string): UserEngagementProfile | undefined {
    return this.userProfiles.get(userId);
  }

  /**
   * Calculate retention metrics (DAU, WAU, MAU, stickiness ratio).
   */
  public getRetentionMetrics(now: Date = new Date()): RetentionMetrics {
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const dauUsers = new Set<string>();
    const wauUsers = new Set<string>();
    const mauUsers = new Set<string>();

    for (const event of this.events) {
      const eventTime = new Date(event.timestamp);
      if (eventTime >= oneDayAgo) dauUsers.add(event.userId);
      if (eventTime >= sevenDaysAgo) wauUsers.add(event.userId);
      if (eventTime >= thirtyDaysAgo) mauUsers.add(event.userId);
    }

    const dau = dauUsers.size;
    const wau = wauUsers.size;
    const mau = mauUsers.size;

    const stickinessRatio = mau > 0 ? Number((dau / mau).toFixed(4)) : 0;
    const churnRateEstimate = mau > 0 ? Number((1 - wau / mau).toFixed(4)) : 0;

    return {
      dailyActiveUsers: dau,
      weeklyActiveUsers: wau,
      monthlyActiveUsers: mau,
      stickinessRatio,
      churnRateEstimate,
    };
  }

  /**
   * Get global engagement summary.
   */
  public getEngagementSummary(limitTopUsers: number = 5): EngagementSummary {
    const totalEvents = this.events.length;
    const uniqueUsers = this.userProfiles.size;

    let totalDwellTime = 0;
    let totalScore = 0;

    const eventTypeCounts: Record<EngagementEventType, number> = {
      view: 0,
      like: 0,
      share: 0,
      comment: 0,
      download: 0,
      bookmark: 0,
      dwell_time: 0,
    };

    const profiles = Array.from(this.userProfiles.values());

    for (const p of profiles) {
      totalDwellTime += p.totalDwellTimeSeconds;
      totalScore += p.engagementScore;
    }

    for (const e of this.events) {
      eventTypeCounts[e.eventType] = (eventTypeCounts[e.eventType] || 0) + 1;
    }

    const topEngagedUsers = [...profiles]
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, limitTopUsers);

    return {
      totalEvents,
      uniqueUsers,
      avgDwellTimePerUser: uniqueUsers > 0 ? Math.round(totalDwellTime / uniqueUsers) : 0,
      avgEngagementScore: uniqueUsers > 0 ? Number((totalScore / uniqueUsers).toFixed(2)) : 0,
      topEngagedUsers,
      eventTypeCounts,
    };
  }

  /**
   * Filter events by criteria.
   */
  public getEvents(userId?: string, eventType?: EngagementEventType): EngagementEvent[] {
    return this.events.filter((e) => {
      if (userId && e.userId !== userId) return false;
      if (eventType && e.eventType !== eventType) return false;
      return true;
    });
  }

  /**
   * Clear recorded data (useful for test resets).
   */
  public clear(): void {
    this.events = [];
    this.userProfiles.clear();
  }
}
