import { memo } from 'react';
import type { BhajanDTO } from '../types';
import { Music } from 'lucide-react';

interface TopBhajansListProps {
  bhajans: BhajanDTO[];
}

export const TopBhajansList = memo(function TopBhajansList({ bhajans }: TopBhajansListProps) {
  return (
    <div className="card h-full">
      <div className="card-header">
        <h3 className="card-title">Top Bhajans</h3>
        <Music size={20} className="text-muted" />
      </div>
      
      {bhajans.length === 0 ? (
        <div className="text-center text-muted" style={{ padding: '2rem' }}>
          No bhajans available.
        </div>
      ) : (
        <div className="flex-col gap-4">
          {bhajans.map((item, index) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="font-bold text-muted" style={{ width: '24px' }}>#{index + 1}</div>
              <div className="flex-1">
                <div className="font-medium text-sm">{item.title}</div>
                <div className="text-xs text-muted mt-1">
                  {item.plays} plays
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
