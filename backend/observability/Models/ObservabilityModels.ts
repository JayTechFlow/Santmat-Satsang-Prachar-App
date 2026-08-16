// Sprint M6.10 — Observability & Monitoring Models

export type HealthState = 'healthy' | 'warning' | 'critical' | 'offline';
export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface UploadMetrics {
  activeUploads: number;
  totalUploads: number;
  successfulUploads: number;
  failedUploads: number;
  avgUploadSpeedBytesPerSec: number;
  totalBytesUploaded: number;
  uploadErrorRatePercentage: number;
}

export interface QueueMetrics {
  queueLength: number;
  pendingJobs: number;
  processingJobs: number;
  completedJobs: number;
  failedJobs: number;
  deadLetterCount: number;
  retryCount: number;
  avgWaitTimeMs: number;
  throughputPerMinute: number;
}

export interface AIMetrics {
  totalInferences: number;
  averageLatencyMs: number;
  totalTokensUsed: number;
  estimatedCostUSD: number;
  aiSuccessRatePercentage: number;
  aiErrorRatePercentage: number;
  activeModelsCount: number;
}

export interface StorageMetrics {
  storageConsumedBytes: number;
  totalObjectsCount: number;
  readOperationsCount: number;
  writeOperationsCount: number;
  bandwidthOutBytes: number;
  quotaUsagePercentage: number;
}

export interface ErrorMetrics {
  totalErrors: number;
  unhandledExceptionsCount: number;
  criticalAlertsCount: number;
  errorRatePercentage: number;
  errorBreakdownByComponent: Record<string, number>;
}

export interface WorkerMetrics {
  activeWorkersCount: number;
  totalWorkersCount: number;
  workerUtilizationPercentage: number;
  jobsPerWorkerRate: number;
  avgExecutionTimeMs: number;
  workerCrashCount: number;
}

export interface ObservabilitySnapshot {
  timestamp: string;
  traceId: string;
  correlationId: string;
  upload: UploadMetrics;
  queue: QueueMetrics;
  ai: AIMetrics;
  storage: StorageMetrics;
  error: ErrorMetrics;
  worker: WorkerMetrics;
  overallHealth: HealthState;
  systemSlaPercentage: number;
}

export interface ComponentHealthStatus {
  componentName: 'UploadPipeline' | 'QueueEngine' | 'AIEngine' | 'StorageBackend' | 'ErrorMonitor' | 'WorkerPool';
  status: HealthState;
  message: string;
  lastChecked: string;
  details?: Record<string, unknown>;
}

export interface OperationalAlert {
  alertId: string;
  ruleName: string;
  component: string;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface ObservabilityExecutiveReport {
  generatedAt: string;
  period: string;
  overallSlaPercentage: number;
  totalPayloadBytes: number;
  totalProcessedJobs: number;
  totalInferences: number;
  totalErrors: number;
  healthyComponentsCount: number;
  totalComponentsCount: number;
  activeAlertsCount: number;
  domainMetrics: {
    upload: UploadMetrics;
    queue: QueueMetrics;
    ai: AIMetrics;
    storage: StorageMetrics;
    error: ErrorMetrics;
    worker: WorkerMetrics;
  };
}
