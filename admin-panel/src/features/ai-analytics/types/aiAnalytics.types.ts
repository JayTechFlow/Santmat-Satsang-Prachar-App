// Sprint M7.7 — AI & Personalization Analytics Types

export type AnalyticsPeriod = '24h' | '7d' | '30d' | '90d';

export interface RecommendedItemMetric {
  id: string;
  title: string;
  category: string;
  impressions: number;
  clicks: number;
  ctrPct: number;
  conversionRatePct: number;
}

export interface RecommendationMetrics {
  totalRecommendations: number;
  recommendationCtrPct: number;
  conversionRatePct: number;
  algorithmHitRatePct: number;
  avgRecommendationLatencyMs: number;
  personalizationCoveragePct: number;
  topRecommendedItems: RecommendedItemMetric[];
}

export interface SearchQueryMetric {
  query: string;
  searchCount: number;
  resultCount: number;
  ctrPct: number;
}

export interface SearchMetrics {
  totalSearches: number;
  searchCtrPct: number;
  avgSearchLatencyMs: number;
  zeroResultRatePct: number;
  autocompleteClickRatePct: number;
  topSearchQueries: SearchQueryMetric[];
  zeroResultQueries: SearchQueryMetric[];
  popularCategoriesInSearch: Array<{ category: string; count: number }>;
}

export interface ModelPerformanceMetric {
  modelName: string;
  inferences: number;
  avgLatencyMs: number;
  errorRatePct: number;
  tokensUsed: number;
  costUSD: number;
}

export interface AIMetrics {
  totalInferences: number;
  avgLatencyMs: number;
  totalTokensUsed: number;
  estimatedCostUSD: number;
  modelAccuracyPct: number;
  moderationFlagsCount: number;
  vectorSearchOpsCount: number;
  vectorCacheHitRatePct: number;
  modelBreakdown: ModelPerformanceMetric[];
}

export interface TrendingItemMetric {
  id: string;
  title: string;
  category: string;
  views: number;
  velocityScore: number; // Growth rate indicator
  trendDirection: 'up' | 'down' | 'stable';
  viralCoefficient: number;
}

export interface TrendingMetrics {
  trendingItems: TrendingItemMetric[];
  peakActiveHours: Array<{ hour: string; activeUsers: number }>;
  topCategoriesByVelocity: Array<{ category: string; velocityScore: number }>;
  viralItemsCount: number;
}

export interface UserInsights {
  totalUsers: number;
  activeUsers: number;
  personalizedUsersPct: number;
  retentionRate30dPct: number;
  userEngagementSegments: {
    powerUsersPct: number; // High engagement (>10 hrs/wk)
    regularUsersPct: number; // Medium engagement (2-10 hrs/wk)
    casualUsersPct: number; // Low engagement (<2 hrs/wk)
  };
  preferredCategoryDistribution: Array<{ category: string; userCount: number; percentage: number }>;
  churnRiskCount: number;
}

export interface CategoryAnalytics {
  categoryViews: Array<{ category: string; views: number; watchTimeMin: number }>;
  completionRateByCategory: Array<{ category: string; completionRatePct: number }>;
  topCategoriesByEngagement: Array<{ category: string; engagementScore: number }>;
  totalCategoryShares: Array<{ category: string; sharesPct: number }>;
}

export interface PlaybackAnalytics {
  totalWatchTimeHours: number;
  avgWatchDurationMin: number;
  overallCompletionRatePct: number;
  bufferingEventRatePct: number;
  qualityBreakdown: Array<{ quality: string; percentage: number }>;
  deviceBreakdown: Array<{ device: string; percentage: number }>;
  dropOffPoints: Array<{ timestampMin: number; dropOffPct: number }>;
}

export interface AIPersonalizationDashboardData {
  period: AnalyticsPeriod;
  recommendations: RecommendationMetrics;
  search: SearchMetrics;
  ai: AIMetrics;
  trending: TrendingMetrics;
  userInsights: UserInsights;
  categoryAnalytics: CategoryAnalytics;
  playbackAnalytics: PlaybackAnalytics;
  lastUpdated: string;
}
