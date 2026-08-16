import { useState } from 'react';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { DataTable } from '../components/ui/DataTable';
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { useAnalyticsReport } from '../features/reports/hooks/useAnalyticsReport';
import { useAIAnalytics } from '../features/ai-analytics/hooks/useAIAnalytics';
import { AIDashboardOverview } from '../features/ai-analytics/components/AIDashboardOverview';
import { RecommendationMetricsCard } from '../features/ai-analytics/components/RecommendationMetricsCard';
import { SearchMetricsCard } from '../features/ai-analytics/components/SearchMetricsCard';
import { AIMetricsCard } from '../features/ai-analytics/components/AIMetricsCard';
import { TrendingDashboardCard } from '../features/ai-analytics/components/TrendingDashboardCard';
import { UserInsightsCard } from '../features/ai-analytics/components/UserInsightsCard';
import type { DailyAnalyticsSnapshot } from '../features/reports/types/report.types';
import { Download, Sparkles, BarChart2 } from 'lucide-react';

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatCount(value: number | undefined): string {
  return (value ?? 0).toLocaleString();
}

export function Reports() {
  const { data: reportData, loading: reportLoading, error: reportError, refetch: refetchReport } = useAnalyticsReport(30);
  const { data: aiData, loading: aiLoading, error: aiError, exportReport: exportAIReport } = useAIAnalytics('30d');
  const [activeTab, setActiveTab] = useState('ops');

  const { overview, daily } = reportData;

  const handleExportCSV = () => {
    if (activeTab === 'ai') {
      exportAIReport();
      return;
    }

    if (!daily || daily.length === 0) return;
    const headers = ['Date', 'Total Plays', 'Unique Active Users', 'Listen Time (s)', 'New Registrations', 'Total Interactions', 'Top Category'];
    const rows = daily.map((row) => [
      row.date,
      row.totalPlays || 0,
      row.uniqueActiveUsers || 0,
      row.totalListenDurationSeconds || 0,
      row.newRegistrations || 0,
      row.totalInteractions || 0,
      row.topCategory || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `operational_analytics_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      key: 'date',
      header: 'Date',
      render: (row: DailyAnalyticsSnapshot) => <span className="font-mono">{row.date}</span>,
    },
    {
      key: 'totalPlays',
      header: 'Plays',
      render: (row: DailyAnalyticsSnapshot) => formatCount(row.totalPlays),
    },
    {
      key: 'uniqueActiveUsers',
      header: 'Active Users',
      render: (row: DailyAnalyticsSnapshot) => formatCount(row.uniqueActiveUsers),
    },
    {
      key: 'totalListenDurationSeconds',
      header: 'Listen Time',
      render: (row: DailyAnalyticsSnapshot) => formatDuration(row.totalListenDurationSeconds ?? 0),
    },
    {
      key: 'newRegistrations',
      header: 'New Registrations',
      render: (row: DailyAnalyticsSnapshot) => formatCount(row.newRegistrations),
    },
    {
      key: 'totalInteractions',
      header: 'Interactions',
      render: (row: DailyAnalyticsSnapshot) => formatCount(row.totalInteractions),
    },
    {
      key: 'topCategory',
      header: 'Top Category',
      render: (row: DailyAnalyticsSnapshot) =>
        row.topCategory ? <span className="badge badge-neutral">{row.topCategory}</span> : <span className="text-muted">—</span>,
    },
  ];

  return (
    <div className="p-6 space-y-6 font-['Mukta'] bg-[#FAF8F5] min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="font-extrabold text-xl text-stone-900 leading-tight">
            विस्तृत रिपोर्ट और एनालिटिक्स (Reports & Intelligence)
          </h1>
          <p className="text-xs text-stone-600 font-medium">
            प्लेटफॉर्म उपयोग, ऑडियो स्ट्रीम मेट्रिक्स, एआई विश्लेषण एवं रिपोर्ट डाउनलोड
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#EA580C] hover:bg-[#C45A0A] text-white rounded-xl font-bold text-xs shadow-sm transition-all"
          onClick={handleExportCSV}
        >
          <Download className="w-4 h-4" />
          <span>रिपोर्ट डाउनलोड करें (CSV)</span>
        </button>
      </div>

      <TabsRoot defaultValue="ops" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="ops" className="flex items-center space-x-2">
            <BarChart2 className="w-4 h-4" />
            <span>Operational Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-warning" />
            <span>AI & Recommendation Intelligence</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ops">
          {reportLoading && <LoadingState variant="page" message="Loading analytics report..." />}

          {reportError && !reportLoading && (
            <ErrorState
              title="Analytics unavailable"
              message="The analytics service could not be reached. Make sure the backend functions are deployed, then try again."
              onRetry={refetchReport}
            />
          )}

          {!reportLoading && !reportError && (
            <>
              {overview && (
                <div className="reports-summary-grid mb-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div className="card stat-card p-4">
                    <div className="stat-card-label text-sm text-muted">Daily Plays (latest)</div>
                    <div className="stat-card-value text-2xl font-bold mt-1">{formatCount(overview.latestDailyPlays)}</div>
                  </div>
                  <div className="card stat-card p-4">
                    <div className="stat-card-label text-sm text-muted">Active Users (latest)</div>
                    <div className="stat-card-value text-2xl font-bold mt-1">{formatCount(overview.latestDau)}</div>
                  </div>
                  <div className="card stat-card p-4">
                    <div className="stat-card-label text-sm text-muted">Last Aggregation</div>
                    <div className="stat-card-value text-sm font-semibold mt-1">{overview.lastUpdatedDate ?? '—'}</div>
                  </div>
                </div>
              )}

              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-4">Daily Operational Metrics (last {daily.length || 30} days)</h2>
                {daily.length === 0 ? (
                  <EmptyState
                    title="No analytics data yet"
                    message="Once the daily aggregation job runs, daily usage metrics will appear here."
                  />
                ) : (
                  <DataTable
                    data={daily}
                    columns={columns}
                    keyExtractor={(row) => row.date}
                  />
                )}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="ai">
          {aiLoading && <LoadingState variant="page" message="Loading AI intelligence metrics..." />}

          {aiError && !aiLoading && (
            <ErrorState
              title="AI Metrics Unavailable"
              message={aiError.message}
              onRetry={refetchReport}
            />
          )}

          {!aiLoading && !aiError && aiData && (
            <div className="space-y-6">
              <AIDashboardOverview data={aiData} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
                <RecommendationMetricsCard metrics={aiData.recommendations} />
                <SearchMetricsCard metrics={aiData.search} />
                <AIMetricsCard metrics={aiData.ai} />
                <TrendingDashboardCard metrics={aiData.trending} />
              </div>

              <div className="mt-6">
                <UserInsightsCard insights={aiData.userInsights} />
              </div>
            </div>
          )}
        </TabsContent>
      </TabsRoot>
    </div>
  );
}