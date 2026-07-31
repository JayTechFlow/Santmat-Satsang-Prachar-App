import type { ChartDataDTO } from '../types';
import { Activity } from 'lucide-react';

interface AnalyticsChartProps {
  data: ChartDataDTO[];
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div className="card h-full">
      <div className="card-header">
        <h3 className="card-title">Analytics Overview</h3>
        <Activity size={20} className="text-muted" />
      </div>
      <div className="bg-background rounded-md flex items-end justify-center gap-2 pb-4" style={{ height: '300px', padding: '1rem', justifyContent: 'space-around' }}>
        {data.map((item, idx) => {
          const heightPercent = (item.value / maxVal) * 100;
          return (
            <div key={idx} className="flex-col items-center flex-1 h-full justify-center" style={{ justifyContent: 'flex-end' }}>
              <div className="w-full bg-primary" style={{ opacity: 0.8, borderRadius: '4px 4px 0 0', height: `${heightPercent}%`, minHeight: '4px', transition: 'height 0.3s' }}></div>
              <span className="text-xs text-muted mt-2">{item.date}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
