import { memo } from 'react';
import { Tags } from 'lucide-react';
import type { DashboardStatsViewModel } from '../types';

interface ContentDistributionProps {
  stats: DashboardStatsViewModel[];
}

export const ContentDistribution = memo(function ContentDistribution({ stats }: ContentDistributionProps) {
  const total = stats.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="card h-full">
      <div className="card-header">
        <h3 className="card-title">Content Distribution</h3>
        <Tags size={20} className="text-muted" aria-hidden="true" />
      </div>

      {total === 0 ? (
        <div className="text-center text-muted distribution-empty">
          No content data available yet.
        </div>
      ) : (
        <div className="distribution-list" role="img" aria-label="Content distribution by collection">
          {stats.map((stat) => {
            const pct = Math.round((stat.value / total) * 100);
            return (
              <div key={stat.label} className="distribution-row">
                <div className="distribution-row-header">
                  <span className="distribution-label">{stat.label}</span>
                  <span className="distribution-count">
                    {stat.value} · {pct}%
                  </span>
                </div>
                <div className="distribution-track">
                  <div
                    className="distribution-fill"
                    style={{ width: `${pct}%`, backgroundColor: stat.color }}
                    aria-hidden="true"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});