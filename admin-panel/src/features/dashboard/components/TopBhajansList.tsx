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
        <Music size={20} className="text-muted" aria-hidden="true" />
      </div>

      {bhajans.length === 0 ? (
        <div className="text-center text-muted activity-empty">
          No bhajans available.
        </div>
      ) : (
        <ul className="top-bhajans-list">
          {bhajans.map((item, index) => (
            <li key={item.id} className="top-bhajan-item">
              <span className="bhajan-rank">#{index + 1}</span>
              <div className="flex-1">
                <div className="font-medium text-sm">{item.title}</div>
                <div className="text-xs text-muted mt-1">
                  {item.plays} plays
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});