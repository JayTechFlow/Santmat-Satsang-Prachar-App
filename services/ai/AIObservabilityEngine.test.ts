// Sprint M6.8 — AI Observability Test Suite

import { describe, it, expect } from 'vitest';
import { AIObservabilityEngine } from './Observability/AIObservabilityEngine';

describe('Sprint M6.8 Enterprise AI Observability', () => {
  it('AIObservabilityEngine tracks inference latencies, token consumption, and cost metrics', () => {
    const obs = new AIObservabilityEngine();
    obs.logInference(120, 1500, 0.003);
    obs.logInference(80, 500, 0.001);

    const report = obs.generateReport();
    expect(report.totalInferences).toBe(2);
    expect(report.averageLatencyMs).toBe(100);
    expect(report.totalTokensUsed).toBe(2000);
    expect(report.estimatedCostUSD).toBe(0.004);
  });
});
