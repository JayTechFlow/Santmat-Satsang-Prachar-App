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
      <div className="card flex items-center gap-6 cursor-pointer" style={{ transition: 'var(--transition-fast)' }}>
        <div className="rounded-md" style={{ backgroundColor: `${stat.color}15`, color: stat.color, padding: '1rem' }}>
          <IconComponent size={28} />
        </div>
        <div>
          <div className="font-semibold text-sm text-muted mb-2">
            {stat.label}
          </div>
          <div className="font-bold text-heading" style={{ fontSize: '1.75rem' }}>
            {stat.value}
          </div>
        </div>
      </div>
    </Link>
  );
}
