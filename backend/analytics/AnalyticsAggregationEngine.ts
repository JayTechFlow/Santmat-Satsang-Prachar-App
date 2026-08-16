// Sprint M7.6 — Advanced Analytics Engine: Analytics Aggregation Engine

import { UserEngagementTracker, EngagementSummary, RetentionMetrics } from './UserEngagementTracker';
import { SessionAnalyticsService, SessionMetrics } from './SessionAnalyticsService';
import {
  ContentAnalyticsService,
  PlaybackMetrics,
  RecommendationMetrics,
  AIMetrics,
  SearchMetrics,
  ContentPerformance,
} from './ContentAnalyticsService';

export interface ExecutiveDashboardReport {
  generatedAt: string;
  userEngagement: EngagementSummary;
  retention: RetentionMetrics;
  sessions: SessionMetrics;
  playback: PlaybackMetrics;
  recommendations: RecommendationMetrics;
  aiUsage: AIMetrics;
  search: SearchMetrics;
  topPerformingContent: ContentPerformance[];
  healthStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
}

export interface RealtimeAnalyticsSnapshot {
  timestamp: string;
  activeConcurrentUsers: number;
  totalEventsProcessed: number;
  currentSearchVolume: number;
  aiLatencyAvgMs: number;
  topTrendingContentId?: string;
}

export class AnalyticsAggregationEngine {
  public userEngagementTracker: UserEngagementTracker;
  public sessionAnalyticsService: SessionAnalyticsService;
  public contentAnalyticsService: ContentAnalyticsService;

  constructor(
    userEngagementTracker?: UserEngagementTracker,
    sessionAnalyticsService?: SessionAnalyticsService,
    contentAnalyticsService?: ContentAnalyticsService
  ) {
    this.userEngagementTracker = userEngagementTracker || new UserEngagementTracker();
    this.sessionAnalyticsService = sessionAnalyticsService || new SessionAnalyticsService();
    this.contentAnalyticsService = contentAnalyticsService || new ContentAnalyticsService();
  }

  /**
   * Generate an executive-level summary dashboard report across all analytics dimensions.
   */
  public generateExecutiveDashboardReport(): ExecutiveDashboardReport {
    const userEngagement = this.userEngagementTracker.getEngagementSummary();
    const retention = this.userEngagementTracker.getRetentionMetrics();
    const sessions = this.sessionAnalyticsService.getSessionMetrics();
    const playback = this.contentAnalyticsService.getPlaybackMetrics();
    const recommendations = this.contentAnalyticsService.getRecommendationMetrics();
    const aiUsage = this.contentAnalyticsService.getAIMetrics();
    const search = this.contentAnalyticsService.getSearchMetrics();
    const topPerformingContent = this.contentAnalyticsService.getTopContent(5);

    // Determine health status based on metrics (e.g. AI error rate or high session bounce rate)
    let healthStatus: ExecutiveDashboardReport['healthStatus'] = 'HEALTHY';
    if (
      (aiUsage.totalRequests > 0 && aiUsage.errorRatePercent > 15) ||
      (sessions.totalSessions >= 3 && sessions.bounceRate > 80)
    ) {
      healthStatus = 'DEGRADED';
    }
    if (aiUsage.totalRequests > 0 && aiUsage.errorRatePercent > 35) {
      healthStatus = 'CRITICAL';
    }

    return {
      generatedAt: new Date().toISOString(),
      userEngagement,
      retention,
      sessions,
      playback,
      recommendations,
      aiUsage,
      search,
      topPerformingContent,
      healthStatus,
    };
  }

  /**
   * Produce a lightweight realtime snapshot of live metrics.
   */
  public getRealtimeSnapshot(): RealtimeAnalyticsSnapshot {
    const activeSessions = this.sessionAnalyticsService.getActiveSessions();
    const engagementSummary = this.userEngagementTracker.getEngagementSummary();
    const searchMetrics = this.contentAnalyticsService.getSearchMetrics();
    const aiMetrics = this.contentAnalyticsService.getAIMetrics();
    const topContent = this.contentAnalyticsService.getTopContent(1);

    return {
      timestamp: new Date().toISOString(),
      activeConcurrentUsers: activeSessions.length,
      totalEventsProcessed: engagementSummary.totalEvents,
      currentSearchVolume: searchMetrics.totalSearches,
      aiLatencyAvgMs: aiMetrics.avgLatencyMs,
      topTrendingContentId: topContent[0]?.contentId,
    };
  }

  /**
   * Reset all underlying services.
   */
  public resetAll(): void {
    this.userEngagementTracker.clear();
    this.sessionAnalyticsService.clear();
    this.contentAnalyticsService.clear();
  }
}
