// Sprint M7.7 — Trending Dashboard Component

import { TrendingUp, Clock, Flame, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import type { TrendingMetrics } from '../types/aiAnalytics.types';

interface TrendingDashboardCardProps {
  metrics: TrendingMetrics;
}

export function TrendingDashboardCard({ metrics }: TrendingDashboardCardProps) {
  return (
    <div className="card flex-col gap-6">
      <div className="card-header border-b pb-4">
        <div className="flex items-center gap-3">
          <TrendingUp size={22} color="var(--success)" />
          <div>
            <h3 className="card-title" style={{ margin: 0 }}>Trending Content & Velocity Analytics</h3>
            <p className="text-xs text-muted" style={{ margin: 0 }}>
              Growth velocity scores, peak active satsang hours, and viral content coefficient tracking
            </p>
          </div>
        </div>
        <span className="badge badge-success">Live Engagement Stream</span>
      </div>

      <div className="grid grid-cols-2 gap-6" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr' }}>
        {/* Trending Content Table */}
        <div className="flex-col gap-3">
          <h4 className="text-sm font-semibold text-heading flex items-center gap-2">
            <Flame size={16} color="var(--primary)" /> Top Trending Satsang & Bhajans
          </h4>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Total Views</th>
                  <th>Velocity</th>
                  <th>Trend</th>
                  <th>Viral Score</th>
                </tr>
              </thead>
              <tbody>
                {metrics.trendingItems.map((item) => (
                  <tr key={item.id}>
                    <td className="font-semibold text-heading">{item.title}</td>
                    <td><span className="badge badge-neutral">{item.category}</span></td>
                    <td>{item.views.toLocaleString()}</td>
                    <td>
                      <span className="font-semibold" style={{ color: 'var(--primary)' }}>
                        {item.velocityScore} pts
                      </span>
                    </td>
                    <td>
                      {item.trendDirection === 'up' && (
                        <span className="badge badge-success flex items-center gap-1">
                          <ArrowUpRight size={12} /> Rising
                        </span>
                      )}
                      {item.trendDirection === 'down' && (
                        <span className="badge badge-danger flex items-center gap-1">
                          <ArrowDownRight size={12} /> Cooling
                        </span>
                      )}
                      {item.trendDirection === 'stable' && (
                        <span className="badge badge-neutral flex items-center gap-1">
                          <Minus size={12} /> Stable
                        </span>
                      )}
                    </td>
                    <td>{item.viralCoefficient}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Peak Active Hours & Category Velocity */}
        <div className="flex-col gap-6">
          <div className="bg-background p-4 rounded-md flex-col gap-3">
            <h4 className="text-sm font-semibold text-heading flex items-center gap-2">
              <Clock size={16} color="var(--info)" /> Peak Active Listening Hours
            </h4>
            <div className="flex-col gap-2">
              {metrics.peakActiveHours.map((h, idx) => (
                <div key={idx} className="flex-between text-xs">
                  <span className="text-muted">{h.hour}</span>
                  <span className="font-semibold text-heading">{h.activeUsers.toLocaleString()} users</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-background p-4 rounded-md flex-col gap-3">
            <h4 className="text-sm font-semibold text-heading flex items-center gap-2">
              <TrendingUp size={16} color="var(--success)" /> Category Growth Velocity
            </h4>
            <div className="flex-col gap-2">
              {metrics.topCategoriesByVelocity.map((cat, idx) => (
                <div key={idx} className="flex-col gap-1">
                  <div className="flex-between text-xs">
                    <span className="font-medium text-heading">{cat.category}</span>
                    <span className="text-muted">{cat.velocityScore} pts</span>
                  </div>
                  <div className="bg-surface rounded-md overflow-hidden" style={{ height: 6 }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${cat.velocityScore}%`,
                        backgroundColor: 'var(--success)',
                        borderRadius: 3,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
