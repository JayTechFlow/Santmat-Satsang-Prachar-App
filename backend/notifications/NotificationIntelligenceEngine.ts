// Sprint M7.5 — Notification Intelligence Engine

import { TopicSubscriptionManager } from './TopicSubscriptionManager';
import { EventReminderService, SatsangEvent } from './EventReminderService';
import { ContentAlertService, NewContentPayload, RecommendedContentItem, UserPreferenceProfile } from './ContentAlertService';

export interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  category: string; // 'Updates' | 'विशेष' | 'Events' | etc.
  type: 'event_reminder' | 'new_content' | 'recommendation' | 'broadcast' | 'scheduled' | 'custom';
  targetScreen?: string; // 'Home' | 'Audio' | 'Books' | 'StutiVinati'
  deeplink?: string;
  payloadData?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
  icon?: string;
  imageUrl?: string;
  channel?: 'push' | 'in_app' | 'email' | 'all';
  tags?: string[];
  contentId?: string;
  eventId?: string;
}

export interface PersonalizationScoreResult {
  score: number;
  quietHoursActive: boolean;
  frequencyCapExceeded: boolean;
  matchedTags: string[];
  categoryMatch: boolean;
  recommendationBoost: number;
  finalPriority: 'low' | 'normal' | 'high';
  sendWindowRecommended: string;
}

export interface NotificationDispatchResult {
  id: string;
  notificationId: string;
  targetUserId?: string;
  targetTopicId?: string;
  channel: string;
  status: 'sent' | 'queued' | 'suppressed' | 'failed';
  timestamp: string;
  recipientCount: number;
  deviceTokensTargeted: number;
  details?: Record<string, any>;
}

export interface ScheduledNotificationJob {
  jobId: string;
  notification: NotificationPayload;
  scheduledFor: string; // ISO String
  targetUserId?: string;
  targetTopicId?: string;
  status: 'pending' | 'executed' | 'cancelled' | 'failed';
  createdAt: string;
}

export interface NotificationMetrics {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalDismissed: number;
  totalFailed: number;
  clickThroughRate: number;
  openRate: number;
}

export class NotificationIntelligenceEngine {
  public topicManager: TopicSubscriptionManager;
  public eventReminderService: EventReminderService;
  public contentAlertService: ContentAlertService;

  private scheduledJobs: Map<string, ScheduledNotificationJob> = new Map();
  private dispatchHistory: NotificationDispatchResult[] = [];
  private userEngagementProfiles: Map<
    string,
    {
      deliveredCount: number;
      openedCount: number;
      clickedCount: number;
      lastEngagedAt?: string;
      preferredHourOfDay?: number;
    }
  > = new Map();

  private notificationMetrics: NotificationMetrics = {
    totalSent: 0,
    totalDelivered: 0,
    totalOpened: 0,
    totalClicked: 0,
    totalDismissed: 0,
    totalFailed: 0,
    clickThroughRate: 0.0,
    openRate: 0.0,
  };

  constructor(
    topicManager?: TopicSubscriptionManager,
    eventReminderService?: EventReminderService,
    contentAlertService?: ContentAlertService
  ) {
    this.topicManager = topicManager || new TopicSubscriptionManager();
    this.eventReminderService = eventReminderService || new EventReminderService();
    this.contentAlertService = contentAlertService || new ContentAlertService();
  }

  // --- Personalized Notifications & Scoring Engine ---

  public calculatePersonalizationScore(
    userId: string,
    notification: NotificationPayload
  ): PersonalizationScoreResult {
    const userPref = this.contentAlertService.getUserPreferenceProfile(userId);
    const engagement = this.userEngagementProfiles.get(userId);

    let score = 0.5; // Baseline score
    const matchedTags: string[] = [];
    let categoryMatch = false;
    let recommendationBoost = 0;

    // 1. Tag & Category Matching
    if (userPref) {
      if (notification.tags) {
        for (const tag of notification.tags) {
          if (userPref.favoriteTags.includes(tag.toLowerCase())) {
            matchedTags.push(tag);
            score += 0.15;
          }
        }
      }

      if (userPref.favoriteCategories.includes(notification.category.toLowerCase())) {
        categoryMatch = true;
        score += 0.2;
      }
    }

    // 2. Type Boosts
    if (notification.type === 'recommendation') {
      recommendationBoost = 0.25;
      score += recommendationBoost;
    } else if (notification.type === 'event_reminder') {
      score += 0.3; // Reminders have high inherent relevance
    }

    // 3. User Engagement CTR Adjustment
    if (engagement && engagement.deliveredCount > 0) {
      const userCTR = engagement.clickedCount / engagement.deliveredCount;
      score += userCTR * 0.2;
    }

    // Cap score at 1.0
    score = Math.min(1.0, score);

    // 4. Quiet hours check
    let quietHoursActive = false;
    if (userPref?.quietHoursStart && userPref?.quietHoursEnd) {
      quietHoursActive = this.contentAlertService.isInQuietHours(
        userPref.quietHoursStart,
        userPref.quietHoursEnd
      );
    }

    // 5. Frequency capping check
    const frequencyCapExceeded = !this.contentAlertService.shouldSendAlertToUser(userId, userPref);

    // Determine final priority
    let finalPriority: 'low' | 'normal' | 'high' = notification.priority || 'normal';
    if (score > 0.8 && !quietHoursActive) {
      finalPriority = 'high';
    } else if (score < 0.4 || quietHoursActive || frequencyCapExceeded) {
      finalPriority = 'low';
    }

    // Recommend best send window (e.g. next morning if quiet hours active)
    let sendWindowRecommended = new Date().toISOString();
    if (quietHoursActive && userPref?.quietHoursEnd) {
      const [endH, endM] = userPref.quietHoursEnd.split(':').map(Number);
      const nextWindow = new Date();
      if (nextWindow.getHours() >= endH) {
        nextWindow.setDate(nextWindow.getDate() + 1);
      }
      nextWindow.setHours(endH, endM, 0, 0);
      sendWindowRecommended = nextWindow.toISOString();
    }

    return {
      score: parseFloat(score.toFixed(4)),
      quietHoursActive,
      frequencyCapExceeded,
      matchedTags,
      categoryMatch,
      recommendationBoost,
      finalPriority,
      sendWindowRecommended,
    };
  }

  public async dispatchPersonalizedNotification(
    userId: string,
    notification: NotificationPayload,
    options: { forceImmediate?: boolean } = {}
  ): Promise<NotificationDispatchResult> {
    const pScore = this.calculatePersonalizationScore(userId, notification);

    if (!options.forceImmediate && (pScore.quietHoursActive || pScore.frequencyCapExceeded)) {
      // Schedule or suppress
      if (pScore.quietHoursActive) {
        const job = this.scheduleNotification(notification, pScore.sendWindowRecommended, userId);
        return {
          id: `disp_${Date.now()}_${userId}`,
          notificationId: notification.id,
          targetUserId: userId,
          channel: notification.channel || 'push',
          status: 'queued',
          timestamp: new Date().toISOString(),
          recipientCount: 1,
          deviceTokensTargeted: this.topicManager.getUserDeviceTokens(userId).length,
          details: { scheduledJobId: job.jobId, reason: 'Deferred due to quiet hours' },
        };
      } else {
        return {
          id: `disp_${Date.now()}_${userId}`,
          notificationId: notification.id,
          targetUserId: userId,
          channel: notification.channel || 'push',
          status: 'suppressed',
          timestamp: new Date().toISOString(),
          recipientCount: 0,
          deviceTokensTargeted: 0,
          details: { reason: 'Frequency cap exceeded' },
        };
      }
    }

    const deviceTokens = this.topicManager.getUserDeviceTokens(userId);
    const result: NotificationDispatchResult = {
      id: `disp_${Date.now()}_${userId}`,
      notificationId: notification.id,
      targetUserId: userId,
      channel: notification.channel || 'push',
      status: 'sent',
      timestamp: new Date().toISOString(),
      recipientCount: 1,
      deviceTokensTargeted: deviceTokens.length,
      details: { personalizationScore: pScore.score, priority: pScore.finalPriority },
    };

    this.dispatchHistory.push(result);
    this.updateMetricsOnSend(1, deviceTokens.length);
    this.trackUserDelivery(userId);
    return result;
  }

  // --- Scheduled Notifications Engine ---

  public scheduleNotification(
    notification: NotificationPayload,
    scheduledFor: string,
    targetUserId?: string,
    targetTopicId?: string
  ): ScheduledNotificationJob {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const job: ScheduledNotificationJob = {
      jobId,
      notification,
      scheduledFor,
      targetUserId,
      targetTopicId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.scheduledJobs.set(jobId, job);
    return job;
  }

  public cancelScheduledNotification(jobId: string): boolean {
    const job = this.scheduledJobs.get(jobId);
    if (!job || job.status !== 'pending') return false;
    job.status = 'cancelled';
    this.scheduledJobs.set(jobId, job);
    return true;
  }

  public async processScheduledQueue(
    currentTime: Date = new Date()
  ): Promise<NotificationDispatchResult[]> {
    const refMs = currentTime.getTime();
    const results: NotificationDispatchResult[] = [];

    for (const job of this.scheduledJobs.values()) {
      if (job.status === 'pending' && new Date(job.scheduledFor).getTime() <= refMs) {
        job.status = 'executed';
        if (job.targetUserId) {
          const res = await this.dispatchPersonalizedNotification(
            job.targetUserId,
            job.notification,
            { forceImmediate: true }
          );
          results.push(res);
        } else if (job.targetTopicId) {
          const res = await this.broadcastToTopic(job.targetTopicId, job.notification);
          results.push(res);
        }
      }
    }

    return results;
  }

  public getScheduledJobs(status?: 'pending' | 'executed' | 'cancelled' | 'failed'): ScheduledNotificationJob[] {
    const all = Array.from(this.scheduledJobs.values());
    if (!status) return all;
    return all.filter((j) => j.status === status);
  }

  // --- Broadcast & Multi-channel Dispatch ---

  public async broadcastToTopic(
    topicId: string,
    notification: NotificationPayload
  ): Promise<NotificationDispatchResult> {
    const tokens = this.topicManager.getDeviceTokensForTopic(topicId);
    const subscribers = this.topicManager.getSubscribersForTopic(topicId);

    const result: NotificationDispatchResult = {
      id: `disp_topic_${Date.now()}_${topicId}`,
      notificationId: notification.id,
      targetTopicId: topicId,
      channel: notification.channel || 'push',
      status: 'sent',
      timestamp: new Date().toISOString(),
      recipientCount: subscribers.length,
      deviceTokensTargeted: tokens.length,
      details: { topicId },
    };

    this.dispatchHistory.push(result);
    this.updateMetricsOnSend(subscribers.length, tokens.length);
    return result;
  }

  // --- High Level Orchestration Triggers ---

  public async triggerEventReminderBroadcast(eventId: string): Promise<NotificationDispatchResult | null> {
    const event = this.eventReminderService.getEvent(eventId);
    if (!event) return null;

    const payload: NotificationPayload = {
      id: `notif_event_${eventId}_${Date.now()}`,
      title: `Event Reminder: ${event.title}`,
      message: `${event.title} starts soon! ${event.description || ''}`,
      category: 'Events',
      type: 'event_reminder',
      targetScreen: 'StutiVinati',
      eventId: event.id,
      priority: 'high',
      tags: event.tags,
    };

    return this.broadcastToTopic(event.topicId || 'satsang_announcements', payload);
  }

  public async triggerNewContentBroadcast(content: NewContentPayload): Promise<NotificationDispatchResult> {
    const alert = this.contentAlertService.triggerNewContentAlert(content);

    const payload: NotificationPayload = {
      id: alert.id,
      title: alert.title,
      message: alert.message,
      category: alert.category,
      type: 'new_content',
      targetScreen: alert.targetScreen,
      contentId: alert.contentId,
      tags: alert.tags,
    };

    return this.broadcastToTopic(alert.topicId || 'new_audio_releases', payload);
  }

  public async sendRecommendationToUser(
    userId: string,
    item: RecommendedContentItem
  ): Promise<NotificationDispatchResult | null> {
    const alert = this.contentAlertService.generateRecommendationAlert(userId, item);
    if (!alert) return null;

    const payload: NotificationPayload = {
      id: alert.id,
      title: alert.title,
      message: alert.message,
      category: alert.category,
      type: 'recommendation',
      targetScreen: alert.targetScreen,
      contentId: alert.contentId,
      tags: alert.tags,
      priority: 'normal',
    };

    return this.dispatchPersonalizedNotification(userId, payload);
  }

  // --- Engagement Analytics & Tracking ---

  public trackNotificationEngagement(
    notificationId: string,
    userId: string,
    action: 'delivered' | 'opened' | 'dismissed' | 'clicked'
  ): void {
    if (!this.userEngagementProfiles.has(userId)) {
      this.userEngagementProfiles.set(userId, {
        deliveredCount: 0,
        openedCount: 0,
        clickedCount: 0,
      });
    }

    const profile = this.userEngagementProfiles.get(userId)!;
    profile.lastEngagedAt = new Date().toISOString();

    if (action === 'delivered') {
      profile.deliveredCount++;
      this.notificationMetrics.totalDelivered++;
    } else if (action === 'opened') {
      profile.openedCount++;
      this.notificationMetrics.totalOpened++;
    } else if (action === 'clicked') {
      profile.clickedCount++;
      this.notificationMetrics.totalClicked++;
    } else if (action === 'dismissed') {
      this.notificationMetrics.totalDismissed++;
    }

    this.recalculateRates();
  }

  public getNotificationMetrics(): NotificationMetrics {
    return { ...this.notificationMetrics };
  }

  public getDispatchHistory(): NotificationDispatchResult[] {
    return [...this.dispatchHistory];
  }

  private updateMetricsOnSend(recipients: number, tokens: number): void {
    this.notificationMetrics.totalSent += Math.max(1, recipients);
    this.recalculateRates();
  }

  private trackUserDelivery(userId: string): void {
    if (!this.userEngagementProfiles.has(userId)) {
      this.userEngagementProfiles.set(userId, {
        deliveredCount: 0,
        openedCount: 0,
        clickedCount: 0,
      });
    }
    const prof = this.userEngagementProfiles.get(userId)!;
    prof.deliveredCount++;
    this.notificationMetrics.totalDelivered++;
    this.recalculateRates();
  }

  private recalculateRates(): void {
    const sent = this.notificationMetrics.totalSent || 1;
    const delivered = this.notificationMetrics.totalDelivered || 1;

    this.notificationMetrics.openRate = parseFloat(
      (this.notificationMetrics.totalOpened / delivered).toFixed(4)
    );
    this.notificationMetrics.clickThroughRate = parseFloat(
      (this.notificationMetrics.totalClicked / sent).toFixed(4)
    );
  }
}
