// Sprint M5.8 — CDN Analytics Test Suite

import { describe, it, expect } from 'vitest';
import { CDNAnalyticsEngine } from './Analytics/CDNAnalyticsEngine';

describe('Sprint M5.8 Enterprise CDN Analytics Engine', () => {
  it('CDNAnalyticsEngine calculates cache hit ratio, bandwidth served, and estimated cost', () => {
    const analytics = new CDNAnalyticsEngine();
    const report = analytics.generateAnalyticsReport(100000, 95000, 500 * 1024 * 1024 * 1024); // 100k req, 95k hits, 500 GB egress

    expect(report.cacheHitRatioPercent).toBe(95);
    expect(report.bandwidthServedGb).toBe(500);
    expect(report.estimatedCostUSD).toBe(40);
  });
});
