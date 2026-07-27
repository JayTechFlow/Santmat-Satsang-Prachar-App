import type { ChartDataDTO } from '../types';
import { Activity } from 'lucide-react';

interface AnalyticsChartProps {
  data: ChartDataDTO[];
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div className="card">
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem' }}>Analytics Overview</h3>
        <Activity size={20} color="var(--text-muted)" />
      </div>
      <div style={{ height: '300px', backgroundColor: 'var(--background)', borderRadius: 'var(--radius-input)', padding: '1rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '0.5rem' }}>
        {data.map((item, idx) => {
          const heightPercent = (item.value / maxVal) * 100;
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ width: '100%', backgroundColor: 'var(--primary)', opacity: 0.8, borderRadius: '4px 4px 0 0', height: `${heightPercent}%`, minHeight: '4px', transition: 'height 0.3s' }}></div>
              <span style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.date}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
