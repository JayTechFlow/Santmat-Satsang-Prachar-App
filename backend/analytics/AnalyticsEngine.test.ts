// Sprint M7.6 — Agent F: Advanced Analytics Engine Unit Tests

import { describe, it, expect, beforeEach } from 'vitest';
import {
  AnalyticsAggregationEngine,
  SessionAnalyticsService,
  ContentAnalyticsService,
  UserEngagementTracker,
} from './index';

describe('Sprint M7.6 — Agent F: Advanced Analytics Engine', () => {
  let tracker: UserEngagementTracker;
  let sessionService: SessionAnalyticsService;
  let contentService: ContentAnalyticsService;
  let aggregationEngine: AnalyticsAggregationEngine;

  beforeEach(() => {
    tracker = new UserEngagementTracker();
    sessionService = new SessionAnalyticsService();
    contentService = new ContentAnalyticsService();
    aggregationEngine = new AnalyticsAggregationEngine(tracker, sessionService, contentService);
  });

  describe('1. User Engagement Tracker', () => {
    it('should track user interaction events and compute user engagement profiles', () => {
      tracker.trackEvent('user_101', 'view', 'content_001');
      tracker.trackEvent('user_101', 'like', 'content_001');
      tracker.trackEvent('user_101', 'share', 'content_001');
      tracker.trackEvent('user_101', 'dwell_time', 'content_001', 120);

      const profile = tracker.getUserProfile('user_101');
      expect(profile).toBeDefined();
      expect(profile?.totalInteractions).toBe(4);
      expect(profile?.totalDwellTimeSeconds).toBe(120);
      // View(1) + Like(5) + Share(10) + Dwell(2) + 120s bonus(2) = 20
      expect(profile?.engagementScore).toBeGreaterThanOrEqual(18);
    });

    it('should calculate retention metrics (DAU, WAU, MAU, stickiness ratio)', () => {
      tracker.trackEvent('user_1', 'view');
      tracker.trackEvent('user_2', 'view');
      tracker.trackEvent('user_3', 'like');

      const retention = tracker.getRetentionMetrics();
      expect(retention.dailyActiveUsers).toBe(3);
      expect(retention.weeklyActiveUsers).toBe(3);
      expect(retention.monthlyActiveUsers).toBe(3);
      expect(retention.stickinessRatio).toBe(1.0);
    });

    it('should generate engagement summary with top users', () => {
      tracker.trackEvent('user_a', 'like');
      tracker.trackEvent('user_b', 'download');
      tracker.trackEvent('user_b', 'share');

      const summary = tracker.getEngagementSummary(2);
      expect(summary.totalEvents).toBe(3);
      expect(summary.uniqueUsers).toBe(2);
      expect(summary.topEngagedUsers[0].userId).toBe('user_b');
    });
  });

  describe('2. Session Analytics Service', () => {
    it('should start, update heartbeats, and end sessions correctly', () => {
      const session = sessionService.startSession('user_201', 'android', 'Samsung S22', 'Delhi, IN');
      expect(session.sessionId).toBeDefined();
      expect(session.active).toBe(true);

      const updated = sessionService.recordSessionHeartbeat(session.sessionId);
      expect(updated?.heartbeatCount).toBe(2);

      const ended = sessionService.endSession(session.sessionId, '/home');
      expect(ended?.active).toBe(false);
      expect(ended?.exitPage).toBe('/home');
    });

    it('should track active concurrent sessions and compute platform/device breakdowns', () => {
      sessionService.startSession('user_1', 'android', 'Mobile', 'Delhi');
      sessionService.startSession('user_2', 'ios', 'iPhone', 'Mumbai');
      sessionService.startSession('user_3', 'web', 'Chrome Desktop', 'Bengaluru');

      const active = sessionService.getActiveSessions();
      expect(active.length).toBe(3);

      const metrics = sessionService.getSessionMetrics();
      expect(metrics.totalSessions).toBe(3);
      expect(metrics.uniqueUsersCount).toBe(3);
      expect(metrics.platforms.find((p) => p.platform === 'android')?.count).toBe(1);
      expect(metrics.geography.length).toBe(3);
    });
  });

  describe('3. Playback Analytics', () => {
    it('should record playback events and calculate completion rate & watch time', () => {
      contentService.recordPlaybackEvent({
        userId: 'user_301',
        contentId: 'satsang_video_01',
        eventType: 'play',
        playheadPositionSeconds: 0,
        totalDurationSeconds: 600,
      });

      contentService.recordPlaybackEvent({
        userId: 'user_301',
        contentId: 'satsang_video_01',
        eventType: 'progress',
        playheadPositionSeconds: 300,
        totalDurationSeconds: 600,
        bitrateKbps: 2400,
      });

      contentService.recordPlaybackEvent({
        userId: 'user_301',
        contentId: 'satsang_video_01',
        eventType: 'complete',
        playheadPositionSeconds: 600,
        totalDurationSeconds: 600,
      });

      const metrics = contentService.getPlaybackMetrics('satsang_video_01');
      expect(metrics.totalPlays).toBeGreaterThanOrEqual(1);
      expect(metrics.totalCompletions).toBe(1);
      expect(metrics.avgBitrateKbps).toBe(2400);
      expect(metrics.dropOffCurve.length).toBe(10);
    });
  });

  describe('4. Recommendation Analytics', () => {
    it('should record recommendation impressions, clicks, conversions, and CTR', () => {
      contentService.recordRecommendationEvent({
        userId: 'user_401',
        recommendedContentId: 'rec_10',
        algorithmId: 'vector_similarity',
        action: 'impression',
      });
      contentService.recordRecommendationEvent({
        userId: 'user_401',
        recommendedContentId: 'rec_10',
        algorithmId: 'vector_similarity',
        action: 'click',
      });
      contentService.recordRecommendationEvent({
        userId: 'user_401',
        recommendedContentId: 'rec_10',
        algorithmId: 'vector_similarity',
        action: 'convert',
      });

      const metrics = contentService.getRecommendationMetrics();
      expect(metrics.totalImpressions).toBe(1);
      expect(metrics.totalClicks).toBe(1);
      expect(metrics.ctrPercent).toBe(100);
      expect(metrics.conversionRatePercent).toBe(100);
      expect(metrics.algorithmPerformance[0].algorithmId).toBe('vector_similarity');
    });
  });

  describe('5. AI Analytics', () => {
    it('should track AI request volume, latency, token usage, cost, and ratings', () => {
      contentService.recordAIEvent({
        featureName: 'transcription',
        latencyMs: 350,
        tokensUsed: 1500,
        costUsd: 0.003,
        userRating: 5,
        status: 'success',
      });
      contentService.recordAIEvent({
        featureName: 'moderation',
        latencyMs: 120,
        tokensUsed: 400,
        costUsd: 0.0008,
        userRating: 4,
        status: 'success',
      });

      const metrics = contentService.getAIMetrics();
      expect(metrics.totalRequests).toBe(2);
      expect(metrics.successfulRequests).toBe(2);
      expect(metrics.errorRatePercent).toBe(0);
      expect(metrics.totalTokensUsed).toBe(1900);
      expect(metrics.avgUserRating).toBe(4.5);
      expect(metrics.featureBreakdown.length).toBe(2);
    });
  });

  describe('6. Search Analytics', () => {
    it('should track query volume, top queries, zero-result rates, and filters', () => {
      contentService.recordSearchEvent({
        userId: 'user_501',
        query: 'Kabir Sahib Bhajans',
        resultCount: 15,
        clickedDocId: 'doc_99',
        usedFilters: ['audio', 'hindi'],
      });
      contentService.recordSearchEvent({
        userId: 'user_502',
        query: 'NonExistentTopicXYZ',
        resultCount: 0,
      });

      const metrics = contentService.getSearchMetrics();
      expect(metrics.totalSearches).toBe(2);
      expect(metrics.zeroResultSearches).toBe(1);
      expect(metrics.zeroResultRatePercent).toBe(50);
      expect(metrics.searchToClickCtrPercent).toBe(50);
      expect(metrics.topQueries[0].query).toBe('kabir sahib bhajans');
      expect(metrics.popularFilters.find((f) => f.filter === 'audio')?.count).toBe(1);
    });
  });

  describe('7. Content Analytics & Performance Velocity', () => {
    it('should track views and compute velocity score & top content ranking', () => {
      contentService.recordContentView('content_alpha', 'user_1', 'Bhakti');
      contentService.recordContentView('content_alpha', 'user_2', 'Bhakti');
      contentService.recordContentView('content_beta', 'user_1', 'Pravachan');

      const perfAlpha = contentService.getContentPerformance('content_alpha');
      expect(perfAlpha.totalViews).toBe(2);
      expect(perfAlpha.uniqueViewers).toBe(2);

      const topContent = contentService.getTopContent(2);
      expect(topContent.length).toBe(2);
      expect(topContent[0].contentId).toBe('content_alpha');
    });
  });

  describe('8. Analytics Aggregation Engine Dashboard & Snapshots', () => {
    it('should generate executive dashboard report across all analytics modules', () => {
      tracker.trackEvent('u1', 'view', 'c1');
      sessionService.startSession('u1', 'android');
      contentService.recordPlaybackEvent({
        userId: 'u1',
        contentId: 'c1',
        eventType: 'play',
        playheadPositionSeconds: 10,
        totalDurationSeconds: 100,
      });
      contentService.recordAIEvent({
        featureName: 'vector_search',
        latencyMs: 80,
        tokensUsed: 100,
        costUsd: 0.0001,
        status: 'success',
      });

      const report = aggregationEngine.generateExecutiveDashboardReport();
      expect(report.generatedAt).toBeDefined();
      expect(report.healthStatus).toBe('HEALTHY');
      expect(report.userEngagement.totalEvents).toBe(1);
      expect(report.sessions.totalSessions).toBe(1);
      expect(report.aiUsage.totalRequests).toBe(1);

      const snapshot = aggregationEngine.getRealtimeSnapshot();
      expect(snapshot.activeConcurrentUsers).toBe(1);
      expect(snapshot.totalEventsProcessed).toBe(1);
    });

    it('should reset all analytics data on resetAll call', () => {
      tracker.trackEvent('u1', 'view');
      sessionService.startSession('u1');
      aggregationEngine.resetAll();

      const snapshot = aggregationEngine.getRealtimeSnapshot();
      expect(snapshot.activeConcurrentUsers).toBe(0);
      expect(snapshot.totalEventsProcessed).toBe(0);
    });
  });
});
