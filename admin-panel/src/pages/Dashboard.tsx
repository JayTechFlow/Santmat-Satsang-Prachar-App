import { useDashboardData } from '../features/dashboard/hooks/useDashboardData';
import { StatCard } from '../features/dashboard/components/StatCard';
import { AnalyticsChart } from '../features/dashboard/components/AnalyticsChart';
import { ActivityFeed } from '../features/dashboard/components/ActivityFeed';
import { TopBhajansList } from '../features/dashboard/components/TopBhajansList';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterBar } from '../components/ui/FilterBar';
import { Tags } from 'lucide-react';

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
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <FilterBar 
          options={[
            { value: '7days', label: 'Last 7 Days' },
            { value: '30days', label: 'Last 30 Days' },
            { value: 'all', label: 'All Time' },
          ]}
          value={dateFilter}
          onChange={(val) => setDateFilter(val.toString())}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-24)', marginBottom: 'var(--space-24)' }}>
        {data.stats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-24)', marginBottom: 'var(--space-24)' }}>
        <AnalyticsChart data={data.analytics} />
        <ActivityFeed activities={data.activities} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-24)' }}>
        <TopBhajansList bhajans={data.topBhajans} />
        <div className="card">
           <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
             <h3 style={{ fontSize: '1.125rem' }}>Content Distribution</h3>
             <Tags size={20} color="var(--text-muted)" />
           </div>
           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', backgroundColor: 'var(--background)', borderRadius: 'var(--radius-input)', color: 'var(--text-muted)' }}>
              [Pie Chart Visualization Placeholder]
           </div>
        </div>
      </div>
    </div>
  );
}
