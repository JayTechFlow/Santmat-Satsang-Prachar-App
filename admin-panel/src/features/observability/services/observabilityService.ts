// Sprint M6.10 — Enterprise Observability Service for Admin Panel
// RECOVERY: No simulated/fabricated metric fallbacks. All data comes from the
// backend observability callables; when unavailable, callers receive no data
// (null / empty) instead of fake production values.

import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../firebase/config';
import type {
  ObservabilitySnapshot,
  ComponentHealthStatus,
  OperationalAlert,
} from '../../../../../backend/observability/Models/ObservabilityModels';

export class ObservabilityService {
  /**
   * Fetch the current observability snapshot across Upload, Queue, AI, Storage,
   * Error, and Worker metrics from the backend callable.
   *
   * Returns `null` when the backend is unreachable or holds no recorded snapshot
   * (see cloud function `observability-getObservabilityMetrics` empty-case).
   */
  public static async fetchLatestMetrics(): Promise<ObservabilitySnapshot | null> {
    try {
      const getMetricsFn = httpsCallable<void, { status: string; data: ObservabilitySnapshot | null }>(
        functions,
        'observability-getObservabilityMetrics'
      );
      const res = await getMetricsFn();
      if (res.data && res.data.data) {
        return res.data.data;
      }
    } catch {
      // Backend unreachable — no data (never fabricate metrics)
    }

    return null;
  }

  /**
   * Derive per-component health from a real observability snapshot.
   *
   * The backend exposes no dedicated health callable, so health status is
   * computed exclusively from snapshot values (upload error rate, queue depth,
   * dead-letter count, AI success rate, storage quota, error counts, worker
   * liveness). When no snapshot exists there is no health data to report.
   */
  public static deriveComponentHealth(snapshot: ObservabilitySnapshot): ComponentHealthStatus[] {
    const now = new Date().toISOString();
    const { upload, queue, ai, storage, error, worker } = snapshot;

    const uploadStatus = upload.uploadErrorRatePercentage > 5.0 ? 'warning' : 'healthy';
    const queueStatus = queue.deadLetterCount > 0 || queue.queueLength > 500 ? 'warning' : 'healthy';
    const aiStatus = ai.aiSuccessRatePercentage < 95.0 ? 'warning' : 'healthy';
    const storageStatus =
      storage.quotaUsagePercentage > 90.0
        ? 'critical'
        : storage.quotaUsagePercentage > 85.0
          ? 'warning'
          : 'healthy';
    const errorStatus =
      error.criticalAlertsCount > 0
        ? 'critical'
        : error.errorRatePercentage > 2.0
          ? 'warning'
          : 'healthy';
    const workerStatus = worker.activeWorkersCount === 0 ? 'critical' : 'healthy';

    return [
      {
        componentName: 'UploadPipeline',
        status: uploadStatus,
        message: `Upload pipeline active. ${upload.activeUploads} active, ${upload.successfulUploads} completed, ${upload.failedUploads} failed.`,
        lastChecked: now,
        details: { speedBps: upload.avgUploadSpeedBytesPerSec },
      },
      {
        componentName: 'QueueEngine',
        status: queueStatus,
        message: `Queue engine operational. ${queue.queueLength} queued, ${queue.throughputPerMinute}/min throughput.`,
        lastChecked: now,
        details: { waitMs: queue.avgWaitTimeMs },
      },
      {
        componentName: 'AIEngine',
        status: aiStatus,
        message: `AI services online. ${ai.totalInferences} inferences served (${ai.averageLatencyMs}ms avg latency).`,
        lastChecked: now,
        details: { costUSD: ai.estimatedCostUSD },
      },
      {
        componentName: 'StorageBackend',
        status: storageStatus,
        message: `Storage backend online. ${(storage.storageConsumedBytes / (1024 * 1024 * 1024)).toFixed(2)} GB consumed, ${storage.totalObjectsCount} objects.`,
        lastChecked: now,
        details: { objects: storage.totalObjectsCount },
      },
      {
        componentName: 'ErrorMonitor',
        status: errorStatus,
        message: `Error tracking active. ${error.totalErrors} total errors in current window.`,
        lastChecked: now,
        details: { totalErrors: error.totalErrors },
      },
      {
        componentName: 'WorkerPool',
        status: workerStatus,
        message: `${worker.activeWorkersCount} of ${worker.totalWorkersCount} workers reporting.`,
        lastChecked: now,
        details: { utilization: worker.workerUtilizationPercentage },
      },
    ];
  }

  /**
   * Fetch active operational alerts from the backend callable.
   *
   * Returns an empty array when the backend is unreachable or holds no alerts
   * (never fabricated alert data).
   */
  public static async fetchAlerts(): Promise<OperationalAlert[]> {
    try {
      const getAlertsFn = httpsCallable<void, { status: string; data: { alerts: OperationalAlert[] } }>(
        functions,
        'observability-getTelemetryAlerts'
      );
      const res = await getAlertsFn();
      if (res.data && res.data.data && Array.isArray(res.data.data.alerts)) {
        return res.data.data.alerts;
      }
    } catch {
      // Backend unreachable — no alerts data
    }

    return [];
  }

  /**
   * Acknowledge an operational alert via the backend callable.
   * Returns `true` on success, `false` when the call failed.
   */
  public static async acknowledgeAlert(alertId: string): Promise<boolean> {
    try {
      const ackFn = httpsCallable<{ alertId: string }, { status: string }>(
        functions,
        'observability-acknowledgeTelemetryAlert'
      );
      await ackFn({ alertId });
      return true;
    } catch {
      return false;
    }
  }
}
