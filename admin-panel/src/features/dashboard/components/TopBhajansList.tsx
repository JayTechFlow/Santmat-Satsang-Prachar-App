import type { BhajanDTO } from '../types';
import { Music } from 'lucide-react';

interface TopBhajansListProps {
  bhajans: BhajanDTO[];
}

export function TopBhajansList({ bhajans }: TopBhajansListProps) {
  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem' }}>Top Bhajans</h3>
        <Music size={20} color="var(--text-muted)" />
      </div>
      
      {bhajans.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No bhajans available.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bhajans.map((item, index) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--text-muted)', width: '24px' }}>#{index + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{item.title}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {item.plays} plays
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
