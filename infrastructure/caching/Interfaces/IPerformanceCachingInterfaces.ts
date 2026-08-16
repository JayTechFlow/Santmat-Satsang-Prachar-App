// Sprint M7.10 — Performance & Caching Interfaces (Agent J)

export type EvictionPolicy = 'LRU' | 'FIFO' | 'TTL_ONLY';

export interface CacheOptions {
  ttlSeconds?: number;
  tags?: string[];
  maxEntries?: number;
  evictionPolicy?: EvictionPolicy;
}

export interface CacheEntry<T = unknown> {
  key: string;
  value: T;
  createdAt: number;
  expiresAt: number | null;
  lastAccessedAt: number;
  accessCount: number;
  tags: string[];
  sizeBytes: number;
}

export interface CacheStats {
  itemCount: number;
  hitCount: number;
  missCount: number;
  hitRatio: number;
  evictedCount: number;
  totalSizeBytes: number;
}

export interface BackgroundRefreshConfig {
  maxConcurrentRefreshes?: number;
  retryAttempts?: number;
  retryDelayMs?: number;
  staleThresholdMs?: number;
}

export interface BackgroundRefreshStats {
  totalRefreshed: number;
  pendingRefreshes: number;
  failedRefreshes: number;
  deduplicatedRefreshes: number;
  activeTasks: number;
}

export interface BatchProcessorConfig<T = unknown, R = unknown> {
  maxBatchSize: number;
  flushIntervalMs: number;
  handler: (items: T[]) => Promise<R[]>;
  maxRetries?: number;
}

export interface BatchProcessorStats {
  processedBatchCount: number;
  totalItemsProcessed: number;
  averageBatchSize: number;
  failureCount: number;
  pendingItemsCount: number;
}

export interface GraphNode {
  id: string;
  type: string;
  attributes: Record<string, unknown>;
  updatedAt: number;
  version: number;
}

export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relation: string;
  weight: number;
  updatedAt: number;
}

export interface GraphDiff {
  addedNodes: GraphNode[];
  updatedNodes: GraphNode[];
  removedNodeIds: string[];
  addedEdges: GraphEdge[];
  updatedEdges: GraphEdge[];
  removedEdgeIds: string[];
  invalidatedNodeIds: string[];
}

export interface GraphStats {
  nodeCount: number;
  edgeCount: number;
  incrementalUpdatesCount: number;
  invalidatedPathsCount: number;
  averageTraversalTimeMs: number;
}

export interface RecommendationItem {
  id: string;
  mediaId: string;
  title: string;
  category: string;
  score: number;
  reason: string;
}

export interface UserPreferenceProfile {
  userId: string;
  favoriteCategories: string[];
  recentMediaIds: string[];
  engagementScore: number;
}

export interface RecommendationStats {
  hitRate: number;
  warmHits: number;
  coldHits: number;
  dynamicRefreshes: number;
  personalizedEntriesCount: number;
}

export interface AnalyticsMetricWindow {
  windowId: string;
  windowType: '1m' | '15m' | '1h' | '1d';
  startTime: number;
  endTime: number;
  counters: Record<string, number>;
  aggregates: Record<string, number>;
}

export interface AnalyticsCacheStats {
  cachedQueryHits: number;
  cachedQueryMisses: number;
  writeThroughCount: number;
  activeWindowsCount: number;
  totalAggregatedEvents: number;
}

export interface PerformanceCachingSummary {
  status: 'optimal' | 'degraded' | 'error';
  cacheStats: CacheStats;
  backgroundRefreshStats: BackgroundRefreshStats;
  batchProcessorStats: BatchProcessorStats;
  graphStats: GraphStats;
  recommendationStats: RecommendationStats;
  analyticsCacheStats: AnalyticsCacheStats;
}
