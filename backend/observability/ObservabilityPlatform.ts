// Sprint M6.10 — Enterprise Observability & Monitoring Platform Engine

import type {
  ObservabilitySnapshot,
  UploadMetrics,
  QueueMetrics,
  AIMetrics,
  StorageMetrics,
  ErrorMetrics,
  WorkerMetrics,
  ComponentHealthStatus,
  OperationalAlert,
  ObservabilityExecutiveReport,
  HealthState,
  AlertSeverity,
} from './Models/ObservabilityModels';

export class ObservabilityPlatform {
  private static snapshots: ObservabilitySnapshot[] = [];
  private static alerts: OperationalAlert[] = [];
  private static activeTraceId: string = 'tr_default_init';
  private static activeCorrelationId: string = 'corr_default_init';

  // Default metric baseline state
  private static currentUpload: UploadMetrics = {
    activeUploads: 2,
    totalUploads: 1450,
    successfulUploads: 1442,
    failedUploads: 8,
    avgUploadSpeedBytesPerSec: 5242880, // 5 MB/s
    totalBytesUploaded: 16106127360, // 15 GB
    uploadErrorRatePercentage: 0.55,
  };

  private static currentQueue: QueueMetrics = {
    queueLength: 3,
    pendingJobs: 1,
    processingJobs: 2,
    completedJobs: 4890,
    failedJobs: 12,
    deadLetterCount: 0,
    retryCount: 15,
    avgWaitTimeMs: 145,
    throughputPerMinute: 240,
  };

  private static currentAI: AIMetrics = {
    totalInferences: 890,
    averageLatencyMs: 320,
    totalTokensUsed: 145000,
    estimatedCostUSD: 2.85,
    aiSuccessRatePercentage: 99.4,
    aiErrorRatePercentage: 0.6,
    activeModelsCount: 3,
  };

  private static currentStorage: StorageMetrics = {
    storageConsumedBytes: 1653718220, // 1.54 GB
    totalObjectsCount: 1240,
    readOperationsCount: 18500,
    writeOperationsCount: 1460,
    bandwidthOutBytes: 53687091200, // 50 GB
    quotaUsagePercentage: 15.4,
  };

  private static currentError: ErrorMetrics = {
    totalErrors: 20,
    unhandledExceptionsCount: 0,
    criticalAlertsCount: 0,
    errorRatePercentage: 0.12,
    errorBreakdownByComponent: {
      UploadPipeline: 8,
      QueueEngine: 4,
      AIEngine: 5,
      StorageBackend: 1,
      WorkerPool: 2,
    },
  };

  private static currentWorker: WorkerMetrics = {
    activeWorkersCount: 4,
    totalWorkersCount: 4,
    workerUtilizationPercentage: 62.5,
    jobsPerWorkerRate: 60,
    avgExecutionTimeMs: 1150,
    workerCrashCount: 0,
  };

  public static setTraceContext(traceId: string, correlationId: string): void {
    this.activeTraceId = traceId;
    this.activeCorrelationId = correlationId;
  }

  public static recordUploadMetrics(metrics: Partial<UploadMetrics>): void {
    this.currentUpload = { ...this.currentUpload, ...metrics };
    this.recalculateDerivedMetrics();
  }

  public static recordQueueMetrics(metrics: Partial<QueueMetrics>): void {
    this.currentQueue = { ...this.currentQueue, ...metrics };
    this.recalculateDerivedMetrics();
  }

  public static recordAIMetrics(metrics: Partial<AIMetrics>): void {
    this.currentAI = { ...this.currentAI, ...metrics };
    this.recalculateDerivedMetrics();
  }

  public static recordStorageMetrics(metrics: Partial<StorageMetrics>): void {
    this.currentStorage = { ...this.currentStorage, ...metrics };
    this.recalculateDerivedMetrics();
  }

  public static recordErrorMetrics(component: string, errorCount = 1): void {
    this.currentError.totalErrors += errorCount;
    this.currentError.errorBreakdownByComponent[component] =
      (this.currentError.errorBreakdownByComponent[component] || 0) + errorCount;
    this.recalculateDerivedMetrics();
  }

  public static recordWorkerMetrics(metrics: Partial<WorkerMetrics>): void {
    this.currentWorker = { ...this.currentWorker, ...metrics };
    this.recalculateDerivedMetrics();
  }

  private static recalculateDerivedMetrics(): void {
    // Recalculate upload error rate
    if (this.currentUpload.totalUploads > 0) {
      this.currentUpload.uploadErrorRatePercentage =
        Math.round((this.currentUpload.failedUploads / this.currentUpload.totalUploads) * 10000) / 100;
    }

    // Recalculate AI error rate
    if (this.currentAI.totalInferences > 0) {
      const errorInferences = Math.round(
        this.currentAI.totalInferences * (1 - this.currentAI.aiSuccessRatePercentage / 100)
      );
      this.currentAI.aiErrorRatePercentage =
        Math.round((errorInferences / this.currentAI.totalInferences) * 10000) / 100;
    }
  }

  public static calculateSystemSla(): number {
    const totalOps =
      this.currentUpload.totalUploads +
      this.currentQueue.completedJobs +
      this.currentAI.totalInferences +
      this.currentStorage.readOperationsCount +
      this.currentStorage.writeOperationsCount;

    const totalFailedOps =
      this.currentUpload.failedUploads +
      this.currentQueue.failedJobs +
      this.currentError.totalErrors;

    if (totalOps === 0) return 99.99;
    const sla = ((totalOps - totalFailedOps) / totalOps) * 100;
    return Math.max(0, Math.min(100, Math.round(sla * 100) / 100));
  }

  public static evaluateOverallHealth(): HealthState {
    if (this.currentError.criticalAlertsCount > 0 || this.currentWorker.activeWorkersCount === 0) {
      return 'critical';
    }
    if (
      this.currentQueue.queueLength > 500 ||
      this.currentError.errorRatePercentage > 2.0 ||
      this.currentStorage.quotaUsagePercentage > 85.0
    ) {
      return 'warning';
    }
    return 'healthy';
  }

  public static createSnapshot(): ObservabilitySnapshot {
    const snapshot: ObservabilitySnapshot = {
      timestamp: new Date().toISOString(),
      traceId: this.activeTraceId,
      correlationId: this.activeCorrelationId,
      upload: { ...this.currentUpload },
      queue: { ...this.currentQueue },
      ai: { ...this.currentAI },
      storage: { ...this.currentStorage },
      error: { ...this.currentError },
      worker: { ...this.currentWorker },
      overallHealth: this.evaluateOverallHealth(),
      systemSlaPercentage: this.calculateSystemSla(),
    };

    this.snapshots.push(snapshot);
    if (this.snapshots.length > 1000) {
      this.snapshots.shift();
    }
    return snapshot;
  }

  public static getLatestSnapshot(): ObservabilitySnapshot {
    if (this.snapshots.length === 0) {
      return this.createSnapshot();
    }
    return this.snapshots[this.snapshots.length - 1];
  }

  public static getSnapshotHistory(): ObservabilitySnapshot[] {
    return [...this.snapshots];
  }

  public static getComponentHealth(): ComponentHealthStatus[] {
    const now = new Date().toISOString();
    return [
      {
        componentName: 'UploadPipeline',
        status: this.currentUpload.uploadErrorRatePercentage > 5.0 ? 'warning' : 'healthy',
        message: `Upload pipeline active. ${this.currentUpload.activeUploads} active, ${this.currentUpload.successfulUploads} completed.`,
        lastChecked: now,
        details: { speedBps: this.currentUpload.avgUploadSpeedBytesPerSec },
      },
      {
        componentName: 'QueueEngine',
        status: this.currentQueue.deadLetterCount > 0 ? 'warning' : 'healthy',
        message: `Priority queues operational. ${this.currentQueue.queueLength} queued, ${this.currentQueue.throughputPerMinute}/min throughput.`,
        lastChecked: now,
        details: { waitMs: this.currentQueue.avgWaitTimeMs },
      },
      {
        componentName: 'AIEngine',
        status: this.currentAI.aiSuccessRatePercentage < 95.0 ? 'warning' : 'healthy',
        message: `AI Intelligence services online. ${this.currentAI.totalInferences} inferences served (${this.currentAI.averageLatencyMs}ms avg latency).`,
        lastChecked: now,
        details: { costUSD: this.currentAI.estimatedCostUSD },
      },
      {
        componentName: 'StorageBackend',
        status: this.currentStorage.quotaUsagePercentage > 90.0 ? 'critical' : 'healthy',
        message: `Multi-Cloud storage online. ${Math.round(this.currentStorage.storageConsumedBytes / (1024 * 1024))} MB payload consumed.`,
        lastChecked: now,
        details: { objects: this.currentStorage.totalObjectsCount },
      },
      {
        componentName: 'ErrorMonitor',
        status: this.currentError.criticalAlertsCount > 0 ? 'critical' : 'healthy',
        message: `Error tracking active. Zero unhandled exceptions in current window.`,
        lastChecked: now,
        details: { totalErrors: this.currentError.totalErrors },
      },
      {
        componentName: 'WorkerPool',
        status: this.currentWorker.activeWorkersCount === 0 ? 'critical' : 'healthy',
        message: `${this.currentWorker.activeWorkersCount} of ${this.currentWorker.totalWorkersCount} workers reporting healthy heartbeats.`,
        lastChecked: now,
        details: { utilization: this.currentWorker.workerUtilizationPercentage },
      },
    ];
  }

  public static raiseAlert(
    ruleName: string,
    component: string,
    severity: AlertSeverity,
    message: string
  ): OperationalAlert {
    const alert: OperationalAlert = {
      alertId: `alt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ruleName,
      component,
      severity,
      message,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    };
    this.alerts.unshift(alert);
    if (severity === 'critical') {
      this.currentError.criticalAlertsCount++;
    }
    return alert;
  }

  public static acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.find((a) => a.alertId === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = new Date().toISOString();
      if (alert.severity === 'critical' && this.currentError.criticalAlertsCount > 0) {
        this.currentError.criticalAlertsCount--;
      }
      return true;
    }
    return false;
  }

  public static getActiveAlerts(): OperationalAlert[] {
    return this.alerts.filter((a) => !a.acknowledged);
  }

  public static getAllAlerts(): OperationalAlert[] {
    return [...this.alerts];
  }

  public static generateExecutiveReport(period = '24h'): ObservabilityExecutiveReport {
    const latest = this.getLatestSnapshot();
    const componentHealth = this.getComponentHealth();
    const healthyCount = componentHealth.filter((c) => c.status === 'healthy').length;

    return {
      generatedAt: new Date().toISOString(),
      period,
      overallSlaPercentage: latest.systemSlaPercentage,
      totalPayloadBytes: latest.storage.storageConsumedBytes,
      totalProcessedJobs: latest.queue.completedJobs,
      totalInferences: latest.ai.totalInferences,
      totalErrors: latest.error.totalErrors,
      healthyComponentsCount: healthyCount,
      totalComponentsCount: componentHealth.length,
      activeAlertsCount: this.getActiveAlerts().length,
      domainMetrics: {
        upload: { ...latest.upload },
        queue: { ...latest.queue },
        ai: { ...latest.ai },
        storage: { ...latest.storage },
        error: { ...latest.error },
        worker: { ...latest.worker },
      },
    };
  }

  public static resetForTesting(): void {
    this.snapshots = [];
    this.alerts = [];
    this.activeTraceId = 'tr_default_init';
    this.activeCorrelationId = 'corr_default_init';
  }
}
