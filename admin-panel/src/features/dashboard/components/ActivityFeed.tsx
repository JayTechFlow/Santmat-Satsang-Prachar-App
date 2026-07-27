import type { ActivityItemDTO } from '../types';
import { Clock } from 'lucide-react';

interface ActivityFeedProps {
  activities: ActivityItemDTO[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem' }}>Recent Activity</h3>
        <Clock size={20} color="var(--text-muted)" />
      </div>
      
      {activities.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No recent activity found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {activities.map((item) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{item.title}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', textTransform: 'capitalize' }}>
                  {item.type.replace('_', ' ')} • {new Date(item.timestamp).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
