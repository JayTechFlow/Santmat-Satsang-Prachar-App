// Sprint M7.7 — AI Metrics Component

import { Cpu, Activity } from 'lucide-react';
import type { AIMetrics } from '../types/aiAnalytics.types';

interface AIMetricsCardProps {
  metrics: AIMetrics;
}

export function AIMetricsCard({ metrics }: AIMetricsCardProps) {
  return (
    <div className="card flex-col gap-6">
      <div className="card-header border-b pb-4">
        <div className="flex items-center gap-3">
          <Cpu size={22} color="#8B5CF6" />
          <div>
            <h3 className="card-title" style={{ margin: 0 }}>AI Operational & Model Metrics</h3>
            <p className="text-xs text-muted" style={{ margin: 0 }}>
              Vertex AI Gemini, Vector Search ops, token consumption, moderation triggers, and estimated cost breakdown
            </p>
          </div>
        </div>
        <span className="badge badge-info" style={{ backgroundColor: '#F3E8FF', color: '#8B5CF6' }}>
          Multi-Provider AI Abstraction
        </span>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        <div className="bg-background p-4 rounded-md flex-col gap-1">
          <span className="text-xs text-muted font-medium">Total AI Inferences</span>
          <span className="text-xl font-semibold text-heading">{metrics.totalInferences.toLocaleString()}</span>
        </div>
        <div className="bg-background p-4 rounded-md flex-col gap-1">
          <span className="text-xs text-muted font-medium">Avg Inference Latency</span>
          <span className="text-xl font-semibold text-heading">{metrics.avgLatencyMs} ms</span>
        </div>
        <div className="bg-background p-4 rounded-md flex-col gap-1">
          <span className="text-xs text-muted font-medium">Total Tokens Used</span>
          <span className="text-xl font-semibold text-heading">{metrics.totalTokensUsed.toLocaleString()}</span>
        </div>
        <div className="bg-background p-4 rounded-md flex-col gap-1">
          <span className="text-xs text-muted font-medium">Estimated AI Cost</span>
          <span className="text-xl font-semibold" style={{ color: 'var(--primary)' }}>${metrics.estimatedCostUSD}</span>
        </div>
        <div className="bg-background p-4 rounded-md flex-col gap-1">
          <span className="text-xs text-muted font-medium">Model Accuracy</span>
          <span className="text-xl font-semibold" style={{ color: 'var(--success)' }}>{metrics.modelAccuracyPct}%</span>
        </div>
        <div className="bg-background p-4 rounded-md flex-col gap-1">
          <span className="text-xs text-muted font-medium">Moderation Flags</span>
          <span className="text-xl font-semibold" style={{ color: metrics.moderationFlagsCount > 0 ? 'var(--warning)' : 'var(--success)' }}>
            {metrics.moderationFlagsCount}
          </span>
        </div>
        <div className="bg-background p-4 rounded-md flex-col gap-1">
          <span className="text-xs text-muted font-medium">Vector Search Ops</span>
          <span className="text-xl font-semibold text-heading">{metrics.vectorSearchOpsCount.toLocaleString()}</span>
        </div>
        <div className="bg-background p-4 rounded-md flex-col gap-1">
          <span className="text-xs text-muted font-medium">Vector Cache Hit Rate</span>
          <span className="text-xl font-semibold text-heading">{metrics.vectorCacheHitRatePct}%</span>
        </div>
      </div>

      {/* Model Breakdown Table */}
      <div>
        <h4 className="text-sm font-semibold text-heading mb-4 flex items-center gap-2">
          <Activity size={16} color="#8B5CF6" /> Model Performance & Resource Allocation
        </h4>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Model / Provider</th>
                <th>Inferences</th>
                <th>Avg Latency</th>
                <th>Error Rate</th>
                <th>Tokens Used</th>
                <th>Cost (USD)</th>
              </tr>
            </thead>
            <tbody>
              {metrics.modelBreakdown.map((m, idx) => (
                <tr key={idx}>
                  <td className="font-semibold text-heading">{m.modelName}</td>
                  <td>{m.inferences.toLocaleString()}</td>
                  <td>{m.avgLatencyMs} ms</td>
                  <td>
                    <span className="badge badge-success">{m.errorRatePct}%</span>
                  </td>
                  <td>{m.tokensUsed.toLocaleString()}</td>
                  <td className="font-semibold" style={{ color: 'var(--primary)' }}>
                    ${m.costUSD}
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
