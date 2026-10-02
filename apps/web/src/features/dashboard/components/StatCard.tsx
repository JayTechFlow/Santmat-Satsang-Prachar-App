import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, CircleAlert } from 'lucide-react';

interface StatCardProps {
  value: string;
  label: string;
  icon: React.ReactNode;
  trend?: { value: string; positive: boolean };
  drillDown?: string;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  iconBg?: string;
}

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-[0.75rem] p-5 border border-stone-200 shadow-xs animate-pulse" aria-busy="true">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-3 w-24 bg-stone-200 rounded" />
          <div className="h-7 w-20 bg-stone-200 rounded" />
          <div className="h-3 w-16 bg-stone-200 rounded" />
        </div>
        <div className="w-12 h-12 bg-stone-200 rounded-xl" />
      </div>
    </div>
  );
}

function StatCardError({ label, onRetry }: { label: string; onRetry?: () => void }) {
  return (
    <div className="bg-white rounded-[0.75rem] p-5 border border-red-200 shadow-xs" role="alert">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold text-stone-500">{label}</p>
          <p className="text-sm font-bold text-red-700">डेटा उपलब्ध नहीं</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-[0.72rem] font-bold text-red-600 hover:underline"
            >
              पुनः प्रयास
            </button>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 text-red-400 flex items-center justify-center">
          <CircleAlert className="w-6 h-6" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

export function StatCard({
  value,
  label,
  icon,
  trend,
  drillDown,
  loading = false,
  error = false,
  onRetry,
  iconBg = 'bg-orange-50 border-orange-200 text-orange-600',
}: StatCardProps) {
  const navigate = useNavigate();

  if (loading) return <StatCardSkeleton />;
  if (error) return <StatCardError label={label} onRetry={onRetry} />;

  return (
    <div
      onClick={drillDown ? () => navigate(drillDown) : undefined}
      className={`bg-white rounded-[0.75rem] p-5 border border-stone-200 shadow-xs flex items-center justify-between ${
        drillDown ? 'hover:shadow-md hover:border-stone-300 transition-all cursor-pointer group' : ''
      }`}
      role={drillDown ? 'link' : undefined}
      tabIndex={drillDown ? 0 : undefined}
      onKeyDown={drillDown ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(drillDown); } } : undefined}
    >
      <div className="space-y-1 min-w-0">
        <p className="text-xs font-bold text-stone-500 truncate">{label}</p>
        <h3 className="font-black text-2xl text-stone-900 leading-tight">{value}</h3>
        {trend && (
          <span
            className={`text-[0.72rem] font-bold flex items-center gap-1 ${
              trend.positive ? 'text-emerald-700' : 'text-red-600'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
      <div
        className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${
          drillDown ? 'group-hover:scale-105 transition-transform' : ''
        } ${iconBg}`}
      >
        {icon}
      </div>
      {drillDown && (
        <ArrowUpRight className="absolute top-4 right-4 w-4 h-4 text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  );
}
