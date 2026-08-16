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
    <Link to={stat.path} className="block no-underline group">
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all flex items-center justify-between">
        <div className="space-y-1">
          <p className="font-['Mukta'] font-medium text-xs text-stone-500 uppercase tracking-wider">
            {stat.label}
          </p>
          <p className="font-['Mukta'] font-extrabold text-2xl text-stone-900 leading-tight">
            {stat.value}
          </p>
        </div>
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
        >
          <IconComponent size={24} aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}