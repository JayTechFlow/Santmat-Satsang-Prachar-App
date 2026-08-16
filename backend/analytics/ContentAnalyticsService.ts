// Sprint M7.6 — Advanced Analytics Engine: Content Analytics & Specialized Metrics Service

export interface PlaybackEvent {
  id?: string;
  userId: string;
  contentId: string;
  eventType: 'play' | 'pause' | 'seek' | 'buffer_stall' | 'complete' | 'progress';
  playheadPositionSeconds: number;
  totalDurationSeconds: number;
  bitrateKbps?: number;
  timestamp?: string;
}

export interface PlaybackMetrics {
  totalPlays: number;
  totalCompletions: number;
  totalWatchTimeSeconds: number;
  avgCompletionRatePercent: number;
  bufferStallRatePercent: number;
  avgBitrateKbps: number;
  dropOffCurve: { positionPercent: number; userCount: number }[];
}

export interface RecommendationEvent {
  id?: string;
  userId: string;
  recommendedContentId: string;
  algorithmId: string; // e.g. 'collaborative_filtering', 'content_based', 'vector_similarity'
  action: 'impression' | 'click' | 'convert';
  timestamp?: string;
}

export interface RecommendationMetrics {
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  ctrPercent: number;
  conversionRatePercent: number;
  algorithmPerformance: {
    algorithmId: string;
    impressions: number;
    clicks: number;
    conversions: number;
    ctrPercent: number;
  }[];
}

export interface AIEvent {
  id?: string;
  featureName: 'transcription' | 'moderation' | 'vector_search' | 'recommendation' | 'summary';
  latencyMs: number;
  tokensUsed: number;
  costUsd: number;
  userRating?: number; // 1 to 5 scale
  status: 'success' | 'error';
  timestamp?: string;
}

export interface AIMetrics {
  totalRequests: number;
  successfulRequests: number;
  errorRatePercent: number;
  avgLatencyMs: number;
  totalTokensUsed: number;
  totalCostUsd: number;
  avgUserRating: number;
  featureBreakdown: {
    featureName: string;
    requestCount: number;
    avgLatencyMs: number;
    totalCostUsd: number;
  }[];
}

export interface SearchAnalyticsEvent {
  id?: string;
  userId: string;
  query: string;
  resultCount: number;
  clickedDocId?: string;
  usedFilters?: string[];
  timestamp?: string;
}

export interface SearchMetrics {
  totalSearches: number;
  zeroResultSearches: number;
  zeroResultRatePercent: number;
  searchToClickCtrPercent: number;
  topQueries: { query: string; count: number }[];
  popularFilters: { filter: string; count: number }[];
}

export interface ContentPerformance {
  contentId: string;
  category?: string;
  totalViews: number;
  uniqueViewers: number;
  totalWatchTimeSeconds: number;
  completionRatePercent: number;
  engagementVelocityScore: number;
}

export class ContentAnalyticsService {
  private playbackEvents: PlaybackEvent[] = [];
  private recommendationEvents: RecommendationEvent[] = [];
  private aiEvents: AIEvent[] = [];
  private searchEvents: SearchAnalyticsEvent[] = [];
  private contentViews: Map<string, { userId: string; category?: string; timestamp: string }[]> = new Map();

  // --- PLAYBACK ANALYTICS ---
  public recordPlaybackEvent(event: PlaybackEvent): PlaybackEvent {
    const fullEvent: PlaybackEvent = {
      id: `play_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...event,
    };
    this.playbackEvents.push(fullEvent);
    return fullEvent;
  }

  public getPlaybackMetrics(contentId?: string): PlaybackMetrics {
    const events = contentId
      ? this.playbackEvents.filter((e) => e.contentId === contentId)
      : this.playbackEvents;

    const plays = events.filter((e) => e.eventType === 'play').length;
    const completions = events.filter((e) => e.eventType === 'complete').length;
    const stalls = events.filter((e) => e.eventType === 'buffer_stall').length;

    let totalWatchTimeSeconds = 0;
    let bitrateSum = 0;
    let bitrateCount = 0;
    let totalCompletionRateSum = 0;
    let durationCount = 0;

    const positionBuckets: number[] = new Array(10).fill(0); // 0-10%, 10-20%, ... 90-100%

    for (const e of events) {
      if (e.eventType === 'progress' || e.eventType === 'complete') {
        totalWatchTimeSeconds += e.playheadPositionSeconds;
        if (e.totalDurationSeconds > 0) {
          const completionPct = Math.min(100, (e.playheadPositionSeconds / e.totalDurationSeconds) * 100);
          totalCompletionRateSum += completionPct;
          durationCount++;

          const bucketIndex = Math.min(9, Math.floor(completionPct / 10));
          positionBuckets[bucketIndex]++;
        }
      }
      if (e.bitrateKbps) {
        bitrateSum += e.bitrateKbps;
        bitrateCount++;
      }
    }

    const totalPlays = plays > 0 ? plays : events.length;
    const dropOffCurve = positionBuckets.map((count, index) => ({
      positionPercent: index * 10,
      userCount: count,
    }));

    return {
      totalPlays,
      totalCompletions: completions,
      totalWatchTimeSeconds: Math.round(totalWatchTimeSeconds),
      avgCompletionRatePercent: durationCount > 0 ? Number((totalCompletionRateSum / durationCount).toFixed(2)) : 0,
      bufferStallRatePercent: totalPlays > 0 ? Number(((stalls / totalPlays) * 100).toFixed(2)) : 0,
      avgBitrateKbps: bitrateCount > 0 ? Math.round(bitrateSum / bitrateCount) : 0,
      dropOffCurve,
    };
  }

  // --- RECOMMENDATION ANALYTICS ---
  public recordRecommendationEvent(event: RecommendationEvent): RecommendationEvent {
    const fullEvent: RecommendationEvent = {
      id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...event,
    };
    this.recommendationEvents.push(fullEvent);
    return fullEvent;
  }

  public getRecommendationMetrics(): RecommendationMetrics {
    const impressions = this.recommendationEvents.filter((e) => e.action === 'impression').length;
    const clicks = this.recommendationEvents.filter((e) => e.action === 'click').length;
    const conversions = this.recommendationEvents.filter((e) => e.action === 'convert').length;

    const algoMap: Map<string, { impressions: number; clicks: number; conversions: number }> = new Map();

    for (const e of this.recommendationEvents) {
      if (!algoMap.has(e.algorithmId)) {
        algoMap.set(e.algorithmId, { impressions: 0, clicks: 0, conversions: 0 });
      }
      const data = algoMap.get(e.algorithmId)!;
      if (e.action === 'impression') data.impressions++;
      else if (e.action === 'click') data.clicks++;
      else if (e.action === 'convert') data.conversions++;
    }

    const algorithmPerformance = Array.from(algoMap.entries()).map(([algorithmId, data]) => ({
      algorithmId,
      ...data,
      ctrPercent: data.impressions > 0 ? Number(((data.clicks / data.impressions) * 100).toFixed(2)) : 0,
    }));

    return {
      totalImpressions: impressions,
      totalClicks: clicks,
      totalConversions: conversions,
      ctrPercent: impressions > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 0,
      conversionRatePercent: clicks > 0 ? Number(((conversions / clicks) * 100).toFixed(2)) : 0,
      algorithmPerformance,
    };
  }

  // --- AI ANALYTICS ---
  public recordAIEvent(event: AIEvent): AIEvent {
    const fullEvent: AIEvent = {
      id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...event,
    };
    this.aiEvents.push(fullEvent);
    return fullEvent;
  }

  public getAIMetrics(): AIMetrics {
    const totalRequests = this.aiEvents.length;
    if (totalRequests === 0) {
      return {
        totalRequests: 0,
        successfulRequests: 0,
        errorRatePercent: 0,
        avgLatencyMs: 0,
        totalTokensUsed: 0,
        totalCostUsd: 0,
        avgUserRating: 0,
        featureBreakdown: [],
      };
    }

    let successCount = 0;
    let latencySum = 0;
    let tokensSum = 0;
    let costSum = 0;
    let ratingSum = 0;
    let ratingCount = 0;

    const featureMap: Map<string, { count: number; latencySum: number; costSum: number }> = new Map();

    for (const e of this.aiEvents) {
      if (e.status === 'success') successCount++;
      latencySum += e.latencyMs;
      tokensSum += e.tokensUsed;
      costSum += e.costUsd;

      if (e.userRating !== undefined) {
        ratingSum += e.userRating;
        ratingCount++;
      }

      if (!featureMap.has(e.featureName)) {
        featureMap.set(e.featureName, { count: 0, latencySum: 0, costSum: 0 });
      }
      const feat = featureMap.get(e.featureName)!;
      feat.count++;
      feat.latencySum += e.latencyMs;
      feat.costSum += e.costUsd;
    }

    const featureBreakdown = Array.from(featureMap.entries()).map(([featureName, feat]) => ({
      featureName,
      requestCount: feat.count,
      avgLatencyMs: Math.round(feat.latencySum / feat.count),
      totalCostUsd: Number(feat.costSum.toFixed(4)),
    }));

    return {
      totalRequests,
      successfulRequests: successCount,
      errorRatePercent: Number((((totalRequests - successCount) / totalRequests) * 100).toFixed(2)),
      avgLatencyMs: Math.round(latencySum / totalRequests),
      totalTokensUsed: tokensSum,
      totalCostUsd: Number(costSum.toFixed(4)),
      avgUserRating: ratingCount > 0 ? Number((ratingSum / ratingCount).toFixed(2)) : 0,
      featureBreakdown,
    };
  }

  // --- SEARCH ANALYTICS ---
  public recordSearchEvent(event: SearchAnalyticsEvent): SearchAnalyticsEvent {
    const fullEvent: SearchAnalyticsEvent = {
      id: `srch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...event,
    };
    this.searchEvents.push(fullEvent);
    return fullEvent;
  }

  public getSearchMetrics(): SearchMetrics {
    const totalSearches = this.searchEvents.length;
    if (totalSearches === 0) {
      return {
        totalSearches: 0,
        zeroResultSearches: 0,
        zeroResultRatePercent: 0,
        searchToClickCtrPercent: 0,
        topQueries: [],
        popularFilters: [],
      };
    }

    let zeroResultCount = 0;
    let clickedCount = 0;

    const queryMap: Map<string, number> = new Map();
    const filterMap: Map<string, number> = new Map();

    for (const e of this.searchEvents) {
      if (e.resultCount === 0) zeroResultCount++;
      if (e.clickedDocId) clickedCount++;

      const normalizedQuery = e.query.trim().toLowerCase();
      queryMap.set(normalizedQuery, (queryMap.get(normalizedQuery) || 0) + 1);

      if (e.usedFilters) {
        for (const f of e.usedFilters) {
          filterMap.set(f, (filterMap.get(f) || 0) + 1);
        }
      }
    }

    const topQueries = Array.from(queryMap.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const popularFilters = Array.from(filterMap.entries())
      .map(([filter, count]) => ({ filter, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalSearches,
      zeroResultSearches: zeroResultCount,
      zeroResultRatePercent: Number(((zeroResultCount / totalSearches) * 100).toFixed(2)),
      searchToClickCtrPercent: Number(((clickedCount / totalSearches) * 100).toFixed(2)),
      topQueries,
      popularFilters,
    };
  }

  // --- CONTENT PERFORMANCE ANALYTICS ---
  public recordContentView(contentId: string, userId: string, category?: string): void {
    if (!this.contentViews.has(contentId)) {
      this.contentViews.set(contentId, []);
    }
    this.contentViews.get(contentId)!.push({
      userId,
      category,
      timestamp: new Date().toISOString(),
    });
  }

  public getContentPerformance(contentId: string): ContentPerformance {
    const views = this.contentViews.get(contentId) || [];
    const uniqueViewers = new Set(views.map((v) => v.userId)).size;
    const playback = this.getPlaybackMetrics(contentId);

    // Engagement velocity: views per unit time (weighted recent views)
    const now = Date.now();
    let velocityScore = 0;
    for (const v of views) {
      const ageHours = (now - new Date(v.timestamp).getTime()) / (1000 * 3600);
      const decayWeight = Math.max(0.1, 1 / (1 + ageHours / 24)); // Decay factor
      velocityScore += decayWeight;
    }

    return {
      contentId,
      category: views[0]?.category,
      totalViews: views.length,
      uniqueViewers,
      totalWatchTimeSeconds: playback.totalWatchTimeSeconds,
      completionRatePercent: playback.avgCompletionRatePercent,
      engagementVelocityScore: Number(velocityScore.toFixed(2)),
    };
  }

  public getTopContent(limit: number = 5): ContentPerformance[] {
    const contentIds = Array.from(this.contentViews.keys());
    const performances = contentIds.map((id) => this.getContentPerformance(id));
    return performances.sort((a, b) => b.engagementVelocityScore - a.engagementVelocityScore).slice(0, limit);
  }

  public clear(): void {
    this.playbackEvents = [];
    this.recommendationEvents = [];
    this.aiEvents = [];
    this.searchEvents = [];
    this.contentViews.clear();
  }
}
