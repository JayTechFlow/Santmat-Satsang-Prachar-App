import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import type { DashboardStatsViewModel } from '../types';

interface StatCardProps {
  stat: DashboardStatsViewModel;
}

export function StatCard({ stat }: StatCardProps) {
  const IconComponent = (LucideIcons as any)[stat.icon] || LucideIcons.Activity;

  return (
    <Link to={stat.path} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer', transition: 'var(--transition-fast)', padding: '1.5rem' }}>
        <div style={{ backgroundColor: `${stat.color}15`, color: stat.color, padding: '1rem', borderRadius: 'var(--radius-input)' }}>
          <IconComponent size={28} />
        </div>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            {stat.label}
          </div>
          <div style={{ color: 'var(--text-heading)', fontSize: '1.75rem', fontWeight: 700 }}>
            {stat.value}
          </div>
        </div>
      </div>
    </Link>
  );
}
