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
        <Clock size={20} className="text-muted" />
      </div>
      
      
      {activities.length === 0 ? (
        <div className="text-center text-muted" style={{ padding: '2rem' }}>
          No recent activity found.
        </div>
      ) : (
        <div className="flex-col gap-4">
          {activities.map((item) => (
            <div key={item.id} className="flex items-center gap-4 pb-4 border-b">
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></div>
              <div className="flex-1">
                <div className="font-medium text-sm">{item.title}</div>
                <div className="text-xs text-muted mt-1 capitalize">
                  {item.type.replace('_', ' ')} • {new Date(item.timestamp).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
