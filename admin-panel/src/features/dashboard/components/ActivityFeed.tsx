import { memo } from 'react';
import type { ActivityItemDTO } from '../types';
import { Clock } from 'lucide-react';

interface ActivityFeedProps {
  activities: ActivityItemDTO[];
}

export const ActivityFeed = memo(function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="card h-full">
      <div className="card-header">
        <h3 className="card-title">Recent Activity</h3>
        <Clock size={20} className="text-muted" aria-hidden="true" />
      </div>

      {activities.length === 0 ? (
        <div className="text-center text-muted activity-empty">
          No recent activity found.
        </div>
      ) : (
        <ul className="activity-feed">
          {activities.map((item) => (
            <li key={item.id} className="activity-item">
              <span className="activity-dot" aria-hidden="true" />
              <div className="flex-1">
                <div className="font-medium text-sm">{item.title}</div>
                <div className="text-xs text-muted mt-1 capitalize">
                  {item.type.replace('_', ' ')} • {new Date(item.timestamp).toLocaleDateString()}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});