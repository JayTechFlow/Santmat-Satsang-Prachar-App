// Sprint M3.7 — Telemetry, Tracing & Health Models

export type HealthState = 'healthy' | 'warning' | 'critical' | 'offline';

export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface OperationContext {
  traceId: string;
  correlationId: string;
  jobId?: string;
  mediaId?: string;
  workerId?: string;
  stageName?: string;
  userId?: string;
  startTime: string;
}

export interface MetricSnapshot {
  timestamp: string;
  queueLength: number;
  runningJobs: number;
  completedJobs: number;
  failedJobs: number;
  retryCount: number;
  deadLetterCount: number;
  workerUtilizationPercentage: number;
  avgProcessingTimeMs: number;
  throughputPerMinute: number;
  storageConsumedBytes: number;
  successRatePercentage: number;
  failureRatePercentage: number;
}

export interface ComponentHealthStatus {
  componentName: string; // 'Queue' | 'WorkerPool' | 'Pipeline' | 'Storage'
  status: HealthState;
  message: string;
  lastChecked: string;
  details?: Record<string, unknown>;
}

export interface OperationalAlert {
  alertId: string;
  ruleName: string;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}
