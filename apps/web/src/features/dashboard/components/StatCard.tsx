import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, CircleAlert, TrendingUp, TrendingDown } from 'lucide-react';

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
  trendLabel?: string;
}

function StatCardSkeleton() {
  return (
    <div className="bg-surface rounded-xl border border-stone-200/80 shadow-xs p-5 animate-pulse" aria-busy="true">
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
    <div className="bg-surface rounded-xl border border-danger/30 bg-danger/5 p-5" role="alert">
      <div className="flex items-start gap-3">
        <CircleAlert className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-text-primary font-medium">डेटा लोड होने में समस्या</p>
          <p className="text-sm text-text-secondary mt-1">
            {label} के लिए आँकड़े प्राप्त करने में असमर्थ
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm font-medium text-brand hover:underline"
            >
              पुनः प्रयास करें
            </button>
          )}
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
  iconBg = 'bg-brand/10',
  trendLabel = 'पिछले 30 दिनों में'
}: StatCardProps) {
  const navigate = useNavigate();

  if (loading) return <StatCardSkeleton />;
  if (error) return <StatCardError label={label} onRetry={onRetry} />;

  return (
    <div
      className="bg-surface rounded-xl border border-stone-200/80 shadow-xs p-5 hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => drillDown && navigate(drillDown)}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary font-medium">{label}</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend.positive ? 'text-success' : 'text-danger'}`}>
              {trend.positive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="font-medium">{trend.value}</span>
            </div>
          )}
          {trend && (
            <p className="text-xs text-text-secondary mt-1">
              {trendLabel}
            </p>
          )}
        </div>
        <div
          className={`${iconBg} w-12 h-12 rounded-xl flex items-center justify-center`}
          data-testid="stat-card-icon-container"
        >
          {icon}
        </div>
      </div>
    </div>
  );
}