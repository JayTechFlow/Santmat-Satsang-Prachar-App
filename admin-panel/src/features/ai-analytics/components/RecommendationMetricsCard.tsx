// Sprint M7.7 — Recommendation Metrics Component

import { Target, BarChart2 } from 'lucide-react';
import type { RecommendationMetrics } from '../types/aiAnalytics.types';

interface RecommendationMetricsCardProps {
  metrics: RecommendationMetrics;
}

export function RecommendationMetricsCard({ metrics }: RecommendationMetricsCardProps) {
  return (
    <div className="card flex-col gap-6">
      <div className="card-header border-b pb-4">
        <div className="flex items-center gap-3">
          <Target size={22} color="var(--primary)" />
          <div>
            <h3 className="card-title" style={{ margin: 0 }}>Recommendation Metrics</h3>
            <p className="text-xs text-muted" style={{ margin: 0 }}>
              Algorithmic recommendation accuracy, click-through rates, and conversion metrics
            </p>
          </div>
        </div>
        <span className="badge badge-primary">Collaborative + Content-Based ML</span>
      </div>

      {/* Metric KPI Gauges Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        <div className="bg-background p-4 rounded-md flex-col gap-1">
          <span className="text-xs text-muted font-medium">Total Recommendations</span>
          <span className="text-xl font-semibold text-heading">{metrics.totalRecommendations.toLocaleString()}</span>
        </div>
        <div className="bg-background p-4 rounded-md flex-col gap-1">
          <span className="text-xs text-muted font-medium">Recommendation CTR</span>
          <span className="text-xl font-semibold" style={{ color: 'var(--primary)' }}>{metrics.recommendationCtrPct}%</span>
        </div>
        <div className="bg-background p-4 rounded-md flex-col gap-1">
          <span className="text-xs text-muted font-medium">Conversion Rate</span>
          <span className="text-xl font-semibold" style={{ color: 'var(--success)' }}>{metrics.conversionRatePct}%</span>
        </div>
        <div className="bg-background p-4 rounded-md flex-col gap-1">
          <span className="text-xs text-muted font-medium">Algorithm Hit Rate</span>
          <span className="text-xl font-semibold text-heading">{metrics.algorithmHitRatePct}%</span>
        </div>
        <div className="bg-background p-4 rounded-md flex-col gap-1">
          <span className="text-xs text-muted font-medium">Rec Latency</span>
          <span className="text-xl font-semibold text-heading">{metrics.avgRecommendationLatencyMs} ms</span>
        </div>
        <div className="bg-background p-4 rounded-md flex-col gap-1">
          <span className="text-xs text-muted font-medium">Personalization Coverage</span>
          <span className="text-xl font-semibold text-heading">{metrics.personalizationCoveragePct}%</span>
        </div>
      </div>

      {/* Top Recommended Content Table */}
      <div>
        <h4 className="text-sm font-semibold text-heading mb-4 flex items-center gap-2">
          <BarChart2 size={16} color="var(--primary)" /> Top Performing Recommended Content
        </h4>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Impressions</th>
                <th>Clicks</th>
                <th>CTR</th>
                <th>Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {metrics.topRecommendedItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className="font-semibold text-heading">{item.title}</span>
                  </td>
                  <td>
                    <span className="badge badge-neutral">{item.category}</span>
                  </td>
                  <td>{item.impressions.toLocaleString()}</td>
                  <td>{item.clicks.toLocaleString()}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-background rounded-md overflow-hidden" style={{ height: 6, maxWidth: 80 }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(item.ctrPct * 3, 100)}%`,
                            backgroundColor: 'var(--primary)',
                            borderRadius: 3,
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-heading">{item.ctrPct}%</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs font-semibold" style={{ color: 'var(--success)' }}>
                      {item.conversionRatePct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
