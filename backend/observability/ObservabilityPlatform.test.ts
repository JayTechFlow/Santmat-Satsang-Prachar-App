// Sprint M6.10 — Observability & Monitoring Platform Test Suite

import { describe, it, expect, beforeEach } from 'vitest';
import { ObservabilityPlatform } from './ObservabilityPlatform';
import { FirebaseObservabilityAdapter } from './FirebaseObservabilityAdapter';
import { ObservabilityLogger } from './ObservabilityLogger';

describe('Sprint M6.10 Enterprise Observability & Monitoring Platform', () => {
  beforeEach(() => {
    ObservabilityPlatform.resetForTesting();
    ObservabilityLogger.clearLogs();
  });

  it('records and retrieves Upload, Queue, AI, Storage, Error, and Worker metrics', () => {
    ObservabilityPlatform.recordUploadMetrics({
      activeUploads: 5,
      totalUploads: 100,
      successfulUploads: 98,
      failedUploads: 2,
    });

    ObservabilityPlatform.recordQueueMetrics({
      queueLength: 10,
      completedJobs: 500,
      failedJobs: 5,
    });

    ObservabilityPlatform.recordAIMetrics({
      totalInferences: 250,
      averageLatencyMs: 180,
      estimatedCostUSD: 1.25,
    });

    ObservabilityPlatform.recordStorageMetrics({
      storageConsumedBytes: 500000000,
      totalObjectsCount: 300,
    });

    ObservabilityPlatform.recordErrorMetrics('AIEngine', 1);

    ObservabilityPlatform.recordWorkerMetrics({
      activeWorkersCount: 4,
      totalWorkersCount: 4,
      workerUtilizationPercentage: 75,
    });

    const snapshot = ObservabilityPlatform.createSnapshot();

    expect(snapshot.upload.activeUploads).toBe(5);
    expect(snapshot.upload.successfulUploads).toBe(98);
    expect(snapshot.queue.queueLength).toBe(10);
    expect(snapshot.ai.totalInferences).toBe(250);
    expect(snapshot.storage.totalObjectsCount).toBe(300);
    expect(snapshot.error.errorBreakdownByComponent['AIEngine']).toBeGreaterThanOrEqual(1);
    expect(snapshot.worker.workerUtilizationPercentage).toBe(75);
  });

  it('calculates System SLA percentage based on total operations and failed operations', () => {
    const sla = ObservabilityPlatform.calculateSystemSla();
    expect(sla).toBeGreaterThan(95.0);
    expect(sla).toBeLessThanOrEqual(100.0);
  });

  it('evaluates overall system health and component health statuses', () => {
    const health = ObservabilityPlatform.evaluateOverallHealth();
    expect(health).toBe('healthy');

    const componentStatuses = ObservabilityPlatform.getComponentHealth();
    expect(componentStatuses.length).toBe(6);

    const queueComp = componentStatuses.find((c) => c.componentName === 'QueueEngine');
    expect(queueComp?.status).toBe('healthy');
  });

  it('raises and acknowledges operational alerts with severity thresholding', () => {
    const alert = ObservabilityPlatform.raiseAlert(
      'WorkerPoolDepleted',
      'WorkerPool',
      'critical',
      'All worker nodes are offline.'
    );

    expect(alert.alertId).toBeDefined();
    expect(alert.acknowledged).toBe(false);

    const activeAlerts = ObservabilityPlatform.getActiveAlerts();
    expect(activeAlerts.some((a) => a.alertId === alert.alertId)).toBe(true);

    const ack = ObservabilityPlatform.acknowledgeAlert(alert.alertId, 'admin_user_99');
    expect(ack).toBe(true);

    const activeAlertsAfterAck = ObservabilityPlatform.getActiveAlerts();
    expect(activeAlertsAfterAck.some((a) => a.alertId === alert.alertId)).toBe(false);
  });

  it('generates an executive observability summary report', () => {
    const report = ObservabilityPlatform.generateExecutiveReport('24h');

    expect(report.generatedAt).toBeDefined();
    expect(report.period).toBe('24h');
    expect(report.overallSlaPercentage).toBeGreaterThan(0);
    expect(report.domainMetrics.upload).toBeDefined();
    expect(report.domainMetrics.queue).toBeDefined();
    expect(report.domainMetrics.ai).toBeDefined();
    expect(report.domainMetrics.storage).toBeDefined();
    expect(report.domainMetrics.error).toBeDefined();
    expect(report.domainMetrics.worker).toBeDefined();
  });

  it('syncs metrics snapshot to Firebase via FirebaseObservabilityAdapter', async () => {
    const adapter = new FirebaseObservabilityAdapter();
    const res = await adapter.syncSnapshotToFirebase();

    expect(res.success).toBe(true);
    expect(res.docId).toBeDefined();
  });

  it('logs structured telemetry entries and correlates trace IDs via ObservabilityLogger', () => {
    const traceCtx = ObservabilityLogger.startTrace('job_404', 'media_808');
    expect(traceCtx.traceId).toContain('tr_');
    expect(traceCtx.correlationId).toContain('corr_job_404_media_808');

    ObservabilityLogger.info('UploadPipeline', 'Started media upload job');
    ObservabilityLogger.error('StorageBackend', 'Storage timeout error', new Error('Timeout 500ms'));

    const logs = ObservabilityLogger.getRecentLogs();
    expect(logs.length).toBe(2);
    expect(logs[1].level).toBe('error');
    expect(logs[1].component).toBe('StorageBackend');
  });
});
