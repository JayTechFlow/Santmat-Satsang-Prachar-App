// Sprint M3.8 — Enterprise Performance & Chaos Engineering Test Suite

import { describe, it, expect } from 'vitest';
import { LoadSimulator } from './LoadTests/LoadSimulator';
import { ChaosEngine } from './Chaos/ChaosEngine';
import { CapacityPlanner } from './Capacity/CapacityPlanner';

describe('Sprint M3.8 Enterprise Performance Engineering & Chaos Testing', () => {
  it('LoadSimulator simulates burst workloads and computes throughput & latency percentiles', () => {
    const metrics = LoadSimulator.simulateWorkload(100, 10);

    expect(metrics.totalJobsExecuted).toBe(100);
    expect(metrics.concurrentWorkersCount).toBe(10);
    expect(metrics.averageLatencyMs).toBeGreaterThan(0);
    expect(metrics.p95LatencyMs).toBeGreaterThan(metrics.averageLatencyMs);
    expect(metrics.p99LatencyMs).toBeGreaterThan(metrics.p95LatencyMs);
    expect(metrics.throughputJobsPerSecond).toBeGreaterThan(0);
  });

  it('ChaosEngine injects worker crashes and verifies automatic recovery', () => {
    const result = ChaosEngine.simulateFault('worker_crash');

    expect(result.scenario).toBe('worker_crash');
    expect(result.recoveredSuccessfully).toBe(true);
    expect(result.jobsReplayedCount).toBe(2);
    expect(result.details).toContain('Lock lease expired');
  });

  it('ChaosEngine traps corrupt payload and verifies Dead-Letter Queue routing', () => {
    const result = ChaosEngine.simulateFault('poison_payload');

    expect(result.scenario).toBe('poison_payload');
    expect(result.recoveredSuccessfully).toBe(true);
    expect(result.details).toContain('Dead-Letter Queue');
  });

  it('CapacityPlanner generates scaling recommendations and storage growth estimates', () => {
    const plan = CapacityPlanner.generatePlan(50000);

    expect(plan.recommendedMaxConcurrentWorkers).toBe(20);
    expect(plan.recommendedMaxQueueDepth).toBe(5000);
    expect(plan.estimatedStorageGrowthGbPerMonth).toBe(450);
    expect(plan.scalingRecommendation).toContain('dynamically');
  });
});
