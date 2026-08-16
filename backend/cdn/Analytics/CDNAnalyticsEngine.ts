// Sprint M5.8 — Enterprise CDN Analytics Engine

export interface CDNAnalyticsReport {
  totalRequests: number;
  cacheHitRatioPercent: number;
  bandwidthServedGb: number;
  estimatedCostUSD: number;
}

export class CDNAnalyticsEngine {
  public generateAnalyticsReport(totalRequests: number, cacheHits: number, bytesTransferred: number): CDNAnalyticsReport {
    const cacheHitRatioPercent = totalRequests > 0 ? Math.round((cacheHits / totalRequests) * 1000) / 10 : 0;
    const bandwidthServedGb = Math.round((bytesTransferred / (1024 * 1024 * 1024)) * 100) / 100;
    const estimatedCostUSD = Math.round(bandwidthServedGb * 0.08 * 100) / 100; // $0.08 per GB edge bandwidth egress

    return {
      totalRequests,
      cacheHitRatioPercent,
      bandwidthServedGb,
      estimatedCostUSD,
    };
  }
}
