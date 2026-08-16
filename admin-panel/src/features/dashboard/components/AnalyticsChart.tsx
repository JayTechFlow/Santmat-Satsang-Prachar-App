import { memo, useMemo } from 'react';
import type { ChartDataDTO } from '../types';
import { Activity } from 'lucide-react';

interface AnalyticsChartProps {
  data: ChartDataDTO[];
}

export const AnalyticsChart = memo(function AnalyticsChart({ data }: AnalyticsChartProps) {
  const maxVal = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);

  return (
    <div className="card h-full">
      <div className="card-header">
        <h3 className="card-title">Recent Content Activity</h3>
        <Activity size={20} className="text-muted" aria-hidden="true" />
      </div>
      <div
        className="analytics-chart"
        role="img"
        aria-label={`Bar chart of content activity: ${data.map((d) => `${d.date}: ${d.value}`).join(', ')}`}
      >
        {data.map((item, idx) => {
          const heightPercent = (item.value / maxVal) * 100;
          return (
            <div key={idx} className="analytics-column">
              <div className="analytics-bar-track">
                <div
                  className="analytics-bar-fill"
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              <span className="analytics-bar-label">{item.date}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});