// Sprint M3.7 — Enterprise Observability & Monitoring Test Suite

import { describe, it, expect } from 'vitest';
import { MetricsCollector } from './Metrics/MetricsCollector';
import { HealthChecker } from './Health/HealthChecker';
import { AlertManager } from './Alerts/AlertManager';
import { DistributedTracer } from './Tracing/DistributedTracer';

describe('Sprint M3.7 Enterprise Observability & Monitoring Platform', () => {
  it('MetricsCollector records snapshots and calculates SLA success rates', () => {
    const snapshot = {
      timestamp: new Date().toISOString(),
      queueLength: 5,
      runningJobs: 2,
      completedJobs: 100,
      failedJobs: 0,
      retryCount: 1,
      deadLetterCount: 0,
      workerUtilizationPercentage: 50,
      avgProcessingTimeMs: 1200,
      throughputPerMinute: 150,
      storageConsumedBytes: 1000000,
      successRatePercentage: 100,
      failureRatePercentage: 0,
    };

    MetricsCollector.recordSnapshot(snapshot);
    const latest = MetricsCollector.getLatestSnapshot();

    expect(latest.queueLength).toBe(5);
    expect(latest.successRatePercentage).toBe(100);
  });

  it('HealthChecker evaluates system components and returns HealthState', () => {
    const healthStatuses = HealthChecker.checkSystemHealth();

    expect(healthStatuses.length).toBe(4);
    const queueHealth = healthStatuses.find((h) => h.componentName === 'QueueEngine');
    expect(queueHealth?.status).toBe('healthy');
  });

  it('AlertManager raises and acknowledges operational alerts', () => {
    const alert = AlertManager.raiseAlert('QueueOverflowRule', 'warning', 'Queue depth exceeded 1,000 threshold.');

    expect(alert.alertId).toBeDefined();
    expect(alert.acknowledged).toBe(false);

    const ack = AlertManager.acknowledgeAlert(alert.alertId, 'admin_user_1');
    expect(ack).toBe(true);
    expect(AlertManager.getActiveAlerts()[0].acknowledged).toBe(true);
  });

  it('DistributedTracer generates traceId and correlationId for end-to-end tracing', () => {
    const traceCtx = DistributedTracer.createTraceContext('job_101', 'media_202', 'worker_303');

    expect(traceCtx.traceId).toContain('tr_');
    expect(traceCtx.correlationId).toContain('corr_');
    expect(traceCtx.jobId).toBe('job_101');
  });
});
