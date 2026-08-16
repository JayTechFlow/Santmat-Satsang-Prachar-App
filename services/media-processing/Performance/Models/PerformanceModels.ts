// Sprint M3.8 — Performance & Chaos Engineering Models

export interface BenchmarkMetrics {
  totalJobsExecuted: number;
  concurrentWorkersCount: number;
  averageLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  throughputJobsPerSecond: number;
  memoryPeakUsageMb: number;
  cpuPeakUtilizationPercentage: number;
  successfulJobsCount: number;
  failedJobsCount: number;
}

export type ChaosScenario =
  | 'worker_crash'
  | 'network_latency'
  | 'storage_failure'
  | 'pipeline_stage_timeout'
  | 'retry_exhaustion'
  | 'poison_payload';

export interface ChaosResult {
  scenario: ChaosScenario;
  simulatedAt: string;
  recoveredSuccessfully: boolean;
  recoveryDurationMs: number;
  jobsReplayedCount: number;
  circuitBreakerTripped: boolean;
  details: string;
}

export interface CapacityPlanReport {
  recommendedMaxConcurrentWorkers: number;
  recommendedMaxQueueDepth: number;
  estimatedThroughputPerMinute: number;
  estimatedStorageGrowthGbPerMonth: number;
  estimatedBandwidthGbPerMonth: number;
  scalingRecommendation: string;
}
