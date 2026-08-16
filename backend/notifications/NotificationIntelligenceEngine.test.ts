// Sprint M7.5 — Notification Intelligence Engine Unit Tests

import { describe, it, expect, beforeEach } from 'vitest';
import { TopicSubscriptionManager } from './TopicSubscriptionManager';
import { EventReminderService } from './EventReminderService';
import { ContentAlertService } from './ContentAlertService';
import { NotificationIntelligenceEngine, NotificationPayload } from './NotificationIntelligenceEngine';

describe('Sprint M7.5 — Notification Intelligence Engine', () => {
  let topicManager: TopicSubscriptionManager;
  let eventReminderService: EventReminderService;
  let contentAlertService: ContentAlertService;
  let engine: NotificationIntelligenceEngine;

  beforeEach(() => {
    topicManager = new TopicSubscriptionManager();
    eventReminderService = new EventReminderService();
    contentAlertService = new ContentAlertService();
    engine = new NotificationIntelligenceEngine(topicManager, eventReminderService, contentAlertService);
  });

  // --- TopicSubscriptionManager Tests ---
  describe('TopicSubscriptionManager', () => {
    it('should initialize default topics and allow registering new topics', () => {
      const topics = topicManager.listTopics();
      expect(topics.length).toBeGreaterThanOrEqual(4);

      topicManager.registerTopic({
        id: 'delhi_satsang',
        name: 'Delhi Regional Satsang',
        category: 'Events',
        tags: ['delhi', 'regional'],
      });

      const registered = topicManager.getTopic('delhi_satsang');
      expect(registered).toBeDefined();
      expect(registered?.name).toBe('Delhi Regional Satsang');
    });

    it('should manage user subscriptions and device tokens', async () => {
      const sub = await topicManager.subscribe('user_1', 'daily_quotes', {
        preferredChannel: 'push',
      });

      expect(sub.userId).toBe('user_1');
      expect(topicManager.isSubscribed('user_1', 'daily_quotes')).toBe(true);

      topicManager.registerUserDeviceToken('user_1', {
        token: 'fcm_token_123',
        platform: 'android',
        lastActiveAt: new Date().toISOString(),
        enabled: true,
      });

      const userTokens = topicManager.getUserDeviceTokens('user_1');
      expect(userTokens.length).toBe(1);
      expect(userTokens[0].token).toBe('fcm_token_123');

      const topicTokens = topicManager.getDeviceTokensForTopic('daily_quotes');
      expect(topicTokens).toContain('fcm_token_123');

      await topicManager.unsubscribe('user_1', 'daily_quotes');
      expect(topicManager.isSubscribed('user_1', 'daily_quotes')).toBe(false);
    });

    it('should match topics by tags and auto-subscribe users', async () => {
      const subs = await topicManager.subscribeToTags('user_2', ['bhajan', 'media']);
      expect(subs.length).toBeGreaterThan(0);
      expect(topicManager.isSubscribed('user_2', 'new_audio_releases')).toBe(true);
    });
  });

  // --- EventReminderService Tests ---
  describe('EventReminderService', () => {
    it('should register satsang events and generate dynamic scheduled reminders', () => {
      const startTime = new Date(Date.now() + 86400000).toISOString(); // 24 hours from now
      const event = eventReminderService.registerEvent({
        id: 'event_001',
        title: 'Annual Santmat Satsang Mahotsav',
        startTime,
        location: 'Ashram Main Hall',
        reminderOffsetsMinutes: [1440, 60, 15],
      });

      expect(event.id).toBe('event_001');

      const reminders = eventReminderService.scheduleEventReminders('event_001');
      expect(reminders.length).toBe(3);
      expect(reminders[0].offsetMinutes).toBe(1440);
    });

    it('should track user RSVPs for events', () => {
      const event = eventReminderService.registerEvent({
        id: 'event_rsvp',
        title: 'Sunday Morning Satsang',
        startTime: new Date().toISOString(),
      });

      const rsvp = eventReminderService.registerUserRSVP(event.id, 'user_10', 'going');
      expect(rsvp.status).toBe('going');

      const attendees = eventReminderService.getEventAttendees(event.id);
      expect(attendees).toContain('user_10');
    });

    it('should process due reminders batch', () => {
      const pastStartTime = new Date(Date.now() - 3600000).toISOString(); // 1 hr ago
      eventReminderService.registerEvent({
        id: 'past_event',
        title: 'Past Satsang',
        startTime: pastStartTime,
        reminderOffsetsMinutes: [15],
      });

      const batch = eventReminderService.processDueReminders(new Date());
      expect(batch.processedCount).toBeGreaterThan(0);
      expect(batch.sentReminders.length).toBeGreaterThan(0);
    });
  });

  // --- ContentAlertService Tests ---
  describe('ContentAlertService', () => {
    it('should trigger new content alerts and notify listeners', () => {
      let notifiedAlertTitle = '';
      contentAlertService.registerContentListener((alert) => {
        notifiedAlertTitle = alert.title;
      });

      const alert = contentAlertService.triggerNewContentAlert({
        id: 'audio_505',
        title: 'Santmat Saar Pravachan Part 3',
        type: 'audio',
        category: 'Pravachan',
        tags: ['santmat', 'pravachan'],
        publishedAt: new Date().toISOString(),
      });

      expect(alert.targetScreen).toBe('Audio');
      expect(notifiedAlertTitle).toContain('Santmat Saar Pravachan Part 3');
      expect(contentAlertService.getAlertHistory().length).toBeGreaterThan(0);
    });

    it('should generate recommendation alerts matching user preferences and enforce quiet hours / frequency caps', () => {
      contentAlertService.setUserPreferenceProfile({
        userId: 'user_pref_1',
        favoriteCategories: ['pravachan', 'stuti'],
        favoriteTags: ['meditation', 'dhyan'],
        preferredContentTypes: ['audio'],
        maxAlertsPerDay: 2,
        quietHoursStart: '23:00',
        quietHoursEnd: '06:00',
      });

      const recAlert = contentAlertService.generateRecommendationAlert('user_pref_1', {
        contentId: 'media_88',
        title: 'Dhyan Yoga Pravachan',
        type: 'audio',
        category: 'Pravachan',
        tags: ['dhyan', 'meditation'],
        score: 0.95,
        reason: 'Interest in Dhyan Yoga',
      });

      expect(recAlert).not.toBeNull();
      expect(recAlert?.recommendationDetails?.score).toBe(0.95);

      // Verify quiet hours detection helper
      const nightTime = new Date('2026-08-08T23:30:00Z');
      const inQuiet = contentAlertService.isInQuietHours('23:00', '06:00', nightTime);
      expect(inQuiet).toBe(true);
    });
  });

  // --- NotificationIntelligenceEngine Core Orchestration Tests ---
  describe('NotificationIntelligenceEngine Orchestration', () => {
    it('should calculate personalized score and priority dynamically', () => {
      contentAlertService.setUserPreferenceProfile({
        userId: 'user_score_test',
        favoriteCategories: ['spiritual', 'events'],
        favoriteTags: ['bhajan', 'satsang'],
        preferredContentTypes: ['audio'],
      });

      const payload: NotificationPayload = {
        id: 'notif_score_1',
        title: 'Evening Satsang Bhajan',
        message: 'Beautiful bhajan discourse',
        category: 'Spiritual',
        type: 'recommendation',
        tags: ['bhajan'],
      };

      const scoreResult = engine.calculatePersonalizationScore('user_score_test', payload);
      expect(scoreResult.score).toBeGreaterThan(0.7);
      expect(scoreResult.categoryMatch).toBe(true);
      expect(scoreResult.matchedTags).toContain('bhajan');
      expect(scoreResult.finalPriority).toBe('high');
    });

    it('should dispatch personalized notification or queue it when quiet hours apply', async () => {
      topicManager.registerUserDeviceToken('user_dispatch_1', {
        token: 'token_abc_123',
        platform: 'ios',
        lastActiveAt: new Date().toISOString(),
        enabled: true,
      });

      const payload: NotificationPayload = {
        id: 'notif_dispatch_1',
        title: 'Morning Satsang Alert',
        message: 'Morning discourse starts at 6 AM',
        category: 'Events',
        type: 'event_reminder',
      };

      const result = await engine.dispatchPersonalizedNotification('user_dispatch_1', payload);
      expect(result.status).toBe('sent');
      expect(result.deviceTokensTargeted).toBe(1);
    });

    it('should handle scheduled notification jobs queue execution', async () => {
      const scheduledTime = new Date(Date.now() - 5000).toISOString(); // 5 seconds ago
      const payload: NotificationPayload = {
        id: 'sched_notif_10',
        title: 'Scheduled Satsang Broadcast',
        message: 'Discourse begins now',
        category: 'Events',
        type: 'scheduled',
      };

      const job = engine.scheduleNotification(payload, scheduledTime, undefined, 'satsang_announcements');
      expect(job.status).toBe('pending');

      const results = await engine.processScheduledQueue(new Date());
      expect(results.length).toBe(1);
      expect(engine.getScheduledJobs('executed').length).toBe(1);
    });

    it('should broadcast notifications to topic subscribers', async () => {
      await topicManager.subscribe('sub_user_1', 'satsang_announcements');
      await topicManager.subscribe('sub_user_2', 'satsang_announcements');

      topicManager.registerUserDeviceToken('sub_user_1', {
        token: 'sub_tok_1',
        platform: 'android',
        lastActiveAt: new Date().toISOString(),
        enabled: true,
      });

      const payload: NotificationPayload = {
        id: 'broadcast_1',
        title: 'Special Announcement',
        message: 'Guru Maharaj Satsang update',
        category: 'Events',
        type: 'broadcast',
      };

      const dispatchResult = await engine.broadcastToTopic('satsang_announcements', payload);
      expect(dispatchResult.recipientCount).toBe(2);
      expect(dispatchResult.deviceTokensTargeted).toBe(1);
      expect(dispatchResult.status).toBe('sent');
    });

    it('should track user engagement metrics (delivered, opened, clicked) and update CTR', () => {
      engine.trackNotificationEngagement('notif_1', 'user_m1', 'delivered');
      engine.trackNotificationEngagement('notif_1', 'user_m1', 'opened');
      engine.trackNotificationEngagement('notif_1', 'user_m1', 'clicked');

      const metrics = engine.getNotificationMetrics();
      expect(metrics.totalDelivered).toBeGreaterThan(0);
      expect(metrics.totalOpened).toBe(1);
      expect(metrics.totalClicked).toBe(1);
      expect(metrics.openRate).toBeGreaterThan(0);
    });
  });
});
