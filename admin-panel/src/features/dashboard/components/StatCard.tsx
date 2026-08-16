import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import type { DashboardStatsViewModel } from '../types';

interface StatCardProps {
  stat: DashboardStatsViewModel;
}

export function StatCard({ stat }: StatCardProps) {
  const RawIcon = (LucideIcons as Record<string, any>)[stat.icon];
  const IconComponent = (RawIcon && RawIcon !== LucideIcons.Icon && typeof RawIcon === 'function') ? RawIcon : LucideIcons.Activity;

  return (
    <Link to={stat.path} className="stat-card-link">
      <div className="card stat-card">
        <div className="stat-card-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
          <IconComponent size={28} aria-hidden="true" />
        </div>
        <div>
          <div className="stat-card-label">
            {stat.label}
          </div>
          <div className="stat-card-value">
            {stat.value}
          </div>
        </div>
      </div>
    </Link>
  );
}