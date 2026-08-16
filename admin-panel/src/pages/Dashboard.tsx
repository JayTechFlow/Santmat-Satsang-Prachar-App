import { useDashboardData } from '../features/dashboard/hooks/useDashboardData';
import { StatCard } from '../features/dashboard/components/StatCard';
import { AnalyticsChart } from '../features/dashboard/components/AnalyticsChart';
import { ActivityFeed } from '../features/dashboard/components/ActivityFeed';
import { TopBhajansList } from '../features/dashboard/components/TopBhajansList';
import { ContentDistribution } from '../features/dashboard/components/ContentDistribution';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterBar } from '../components/ui/FilterBar';
import { LayoutDashboard } from 'lucide-react';

export function Dashboard() {
  const { data, loading, error, isEmpty, dateFilter, setDateFilter, refetch } = useDashboardData();

  if (loading) {
    return <LoadingOverlay message="Loading dashboard data..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load dashboard"
        message={error.message}
        onRetry={refetch}
      />
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        title="No Data Available"
        message="The dashboard does not have any data to display at this time."
      />
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="text-muted text-sm">
            Platform activity, content health and engagement at a glance
          </p>
        </div>
        <FilterBar
          label="Dashboard date range"
          options={[
            { value: '7days', label: 'Last 7 Days' },
            { value: '30days', label: 'Last 30 Days' },
          ]}
          value={dateFilter}
          onChange={(val) => setDateFilter(val.toString())}
        />
      </div>

      <div className="dashboard-stats-grid">
        {data.stats.map((stat, index) => (
          <StatCard key={`${stat.label}-${index}`} stat={stat} />
        ))}
      </div>

      <div className="dashboard-grid-main">
        <AnalyticsChart data={data.analytics} />
        <ActivityFeed activities={data.activities} />
      </div>

      <div className="dashboard-grid-secondary">
        <TopBhajansList bhajans={data.topBhajans} />
        <ContentDistribution stats={data.stats} />
      </div>

      <p className="dashboard-note">
        <LayoutDashboard size={14} aria-hidden="true" />
        Metrics are computed from live Firestore collections; the 7-day chart reflects recent upload activity.
      </p>
    </div>
  );
}