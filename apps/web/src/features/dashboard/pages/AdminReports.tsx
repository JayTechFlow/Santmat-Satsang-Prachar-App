/**
 * ============================================================================
 * Santmat Satsang Prachar - Reports & Analytics Centre (Admin)
 * ============================================================================
 * Composition layer. All state lives in `useAnalyticsReport`, all rendering
 * concerns live in `components/analytics`, and all formatting/date logic lives
 * in `analytics/`. This file contains no duplicated date maths or KPI maths —
 * a single change to the contract propagates everywhere.
 *
 * Every metric is sourced from real Firestore documents and carries a coverage
 * flag. Where a metric had no collector for the selected period, the UI renders
 * "not collected" rather than a zero.
 */
import React from 'react';
import {
  AlertTriangle,
  BarChart3,
  Headphones,
  Inbox,
  Loader2,
  Music4,
  RefreshCw,
  Timer,
  UserPlus,
  Users,
} from 'lucide-react';
import { AdminPageHeader } from '../../../components/admin';
import { useAnalyticsReport } from '../analytics/useAnalyticsReport';
import {
  ACTIVE_SEMANTICS_LABELS,
  COVERAGE_REASONS,
  CoverageKey,
} from '../analytics/types';
import {
  AnalyticsCoverageNotice,
  AnalyticsFilterBar,
  AnalyticsKpiCard,
  AnalyticsPagination,
  AnalyticsRangeFilter,
  AnalyticsTable,
  AnalyticsTableHeader,
  AnalyticsTrendChart,
} from '../components/analytics';
import { formatDuration, formatIndian } from '../analytics/format';

export const AdminReports: React.FC = () => {
  const report = useAnalyticsReport();
  const {
    payload,
    contract,
    loading,
    error,
    range,
    chartPoints,
    partialDates,
    categoryOptions,
    activeFilterCount,
  } = report;

  const coverage = payload?.current.coverage ?? {
    registrations: false,
    plays: false,
    playtime: false,
    activeUsers: false,
    libraryActivity: false,
  };
  const totals = payload?.current;
  const comparison = payload?.comparison ?? null;
  const overview = payload?.overview;

  const minPlaySeconds = contract?.thresholds.minPlayListenedSeconds ?? 10;
  const heartbeatMinutes = contract?.thresholds.activeUserHeartbeatMinutes ?? 30;
  const timezone = contract?.timezone ?? payload?.range.timezone ?? 'UTC';

  const definitionFor = (key: string) => contract?.metricDefinitions.find((d) => d.key === key);
  const covered = (key: CoverageKey) => coverage[key];

  const points = (metric: 'totalPlays' | 'totalListenDurationSeconds' | 'uniqueActiveUsers' | 'distinctTracksPlayed') =>
    chartPoints.map((row) => ({ date: row.date, value: row[metric] ?? 0 }));

  const comparisonLabel = comparison
    ? `${comparison.startDate} → ${comparison.endDate}`
    : null;

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto font-['Mukta'] select-none">
      <AdminPageHeader
        title="रिपोर्ट एवं एनालिटिक्स केंद्र"
        subtitle={`वास्तविक दस्तावेज़ों से गणना · समय क्षेत्र ${timezone} · स्रोत: analytics-getAnalyticsSummary`}
        badgeText="विस्तृत रिपोर्ट एवं एनालिटिक्स"
        badgeVariant="primary"
        icon={<BarChart3 className="w-4 h-4" />}
        actions={
          <button
            type="button"
            onClick={report.refresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold bg-stone-100/80 border border-stone-200/80 text-stone-700 hover:bg-stone-200/70 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            ताज़ा करें
          </button>
        }
      />

      <AnalyticsRangeFilter
        preset={report.preset}
        customStart={report.customStart}
        customEnd={report.customEnd}
        maxRangeDays={contract?.maxRangeDays ?? 400}
        resolvedStartDate={range.startDate}
        resolvedEndDate={range.endDate}
        onPresetChange={report.setPreset}
        onCustomChange={report.setCustomRange}
        isPartialPeriod={range.isPartialPeriod}
      />

      <AnalyticsFilterBar
        filters={report.filters}
        sortOrder={report.sortOrder}
        categoryOptions={categoryOptions}
        activeFilterCount={activeFilterCount}
        onFiltersChange={report.setFilters}
        onSortOrderChange={report.setSortOrder}
        onReset={report.resetFilters}
        disabled={loading}
      />

      {loading && !payload ? (
        <div className="admin-card p-12 text-center space-y-3">
          <Loader2 className="w-10 h-10 mx-auto text-orange-600 animate-spin" />
          <p className="text-sm font-bold text-stone-600">रिपोर्ट लोड हो रही है…</p>
        </div>
      ) : error ? (
        <div className="bg-amber-50 rounded-xl p-12 border border-amber-200 shadow-xs text-center space-y-3">
          <AlertTriangle className="w-10 h-10 mx-auto text-amber-600" />
          <p className="text-sm font-bold text-amber-900">एनालिटिक्स डेटा उपलब्ध नहीं</p>
          <p className="text-xs text-amber-800 max-w-lg mx-auto">{error}</p>
          <button
            type="button"
            onClick={report.refresh}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            पुनः प्रयास करें
          </button>
        </div>
      ) : payload ? (
        <>
          <AnalyticsCoverageNotice
            coverage={coverage}
            activeUserSemantics={overview?.activeUserSemantics ?? 'unavailable'}
            activeUserHeartbeatMinutes={heartbeatMinutes}
            minPlayListenedSeconds={minPlaySeconds}
            timezone={timezone}
          />

          {/* KPI tiles — values come from server-computed period totals, so a
              paginated range never reports only the visible slice. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnalyticsKpiCard
              label="कुल प्ले"
              icon={<Headphones className="w-6 h-6" />}
              value={covered('plays') ? formatIndian(totals?.totalPlays ?? 0) : '—'}
              available={covered('plays')}
              unavailableReason={COVERAGE_REASONS.plays}
              previousValue={comparison?.coverage.plays ? comparison.totalPlays : null}
              currentNumericValue={covered('plays') ? totals?.totalPlays ?? 0 : undefined}
              definition={definitionFor('totalPlays')?.definition}
              source={definitionFor('totalPlays')?.source}
              accentClassName="bg-orange-50 border-orange-200 text-orange-600"
            />

            <AnalyticsKpiCard
              label="संगीत श्रवण समय"
              icon={<Timer className="w-6 h-6" />}
              value={covered('playtime') ? formatDuration(totals?.totalListenDurationSeconds ?? 0) : '—'}
              available={covered('playtime')}
              unavailableReason={COVERAGE_REASONS.playtime}
              previousValue={comparison?.coverage.playtime ? comparison.totalListenDurationSeconds : null}
              currentNumericValue={covered('playtime') ? totals?.totalListenDurationSeconds ?? 0 : undefined}
              definition={definitionFor('totalListenDurationSeconds')?.definition}
              source={definitionFor('totalListenDurationSeconds')?.source}
              accentClassName="bg-amber-50 border-amber-200 text-amber-700"
            />

            <AnalyticsKpiCard
              label="सक्रिय उपयोगकर्ता"
              icon={<Users className="w-6 h-6" />}
              value={covered('activeUsers') ? formatIndian(totals?.uniqueActiveUsers ?? 0) : '—'}
              available={covered('activeUsers')}
              unavailableReason={COVERAGE_REASONS.activeUsers}
              previousValue={comparison?.coverage.activeUsers ? comparison.uniqueActiveUsers : null}
              currentNumericValue={covered('activeUsers') ? totals?.uniqueActiveUsers ?? 0 : undefined}
              definition={definitionFor('uniqueActiveUsers')?.definition}
              source={definitionFor('uniqueActiveUsers')?.source}
              accentClassName="bg-emerald-50 border-emerald-200 text-emerald-700"
              footer={
                <span className="text-[10px] font-bold text-stone-400">
                  {ACTIVE_SEMANTICS_LABELS[overview?.activeUserSemantics ?? 'unavailable']}
                </span>
              }
            />

            <AnalyticsKpiCard
              label="नए पंजीकरण"
              icon={<UserPlus className="w-6 h-6" />}
              value={covered('registrations') ? formatIndian(totals?.newRegistrations ?? 0) : '—'}
              available={covered('registrations')}
              unavailableReason={COVERAGE_REASONS.registrations}
              previousValue={comparison?.coverage.registrations ? comparison.newRegistrations : null}
              currentNumericValue={covered('registrations') ? totals?.newRegistrations ?? 0 : undefined}
              definition={definitionFor('newRegistrations')?.definition}
              source={definitionFor('newRegistrations')?.source}
              accentClassName="bg-purple-50 border-purple-200 text-purple-700"
            />
          </div>

          {/* Distinct-track series — the listening activity that survives even
              where playback session events were never collected. */}
          {totals && covered('libraryActivity') ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AnalyticsTrendChart
                title="कुल प्ले (Total Plays)"
                metric="totalPlays"
                points={points('totalPlays')}
                available={covered('plays')}
                unavailableReason={COVERAGE_REASONS.plays}
                partialDates={partialDates}
              />
              <AnalyticsTrendChart
                title="संगीत श्रवण समय"
                metric="totalListenDurationSeconds"
                points={points('totalListenDurationSeconds')}
                available={covered('playtime')}
                unavailableReason={COVERAGE_REASONS.playtime}
                asHours
                partialDates={partialDates}
              />
              <AnalyticsTrendChart
                title="सक्रिय उपयोगकर्ता"
                metric="uniqueActiveUsers"
                points={points('uniqueActiveUsers')}
                available={covered('activeUsers')}
                unavailableReason={COVERAGE_REASONS.activeUsers}
                partialDates={partialDates}
              />
              <AnalyticsTrendChart
                title="विशिष्ट भजन श्रवण (लाइब्रेरी गतिविधि)"
                metric="distinctTracksPlayed"
                points={points('distinctTracksPlayed')}
                available={covered('libraryActivity')}
                unavailableReason={COVERAGE_REASONS.libraryActivity}
                partialDates={partialDates}
              />
            </div>
          ) : (
            <div className="admin-card p-8 flex flex-col items-center justify-center gap-2 text-center">
              <Music4 className="w-8 h-8 text-stone-300" />
              <p className="text-sm font-bold text-stone-500">रुझान चार्ट के लिए डेटा उपलब्ध नहीं</p>
              <p className="text-xs font-semibold text-stone-400 max-w-md">
                {COVERAGE_REASONS.libraryActivity}
              </p>
            </div>
          )}

          {/* Daily detail */}
          <div className="admin-card p-5 sm:p-6 space-y-4">
            <AnalyticsTableHeader
              right={
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                    {range.dayCount} दिन
                  </span>
                  {comparisonLabel ? (
                    <span className="text-[11px] font-bold text-stone-500">
                      तुलना: {comparisonLabel}
                    </span>
                  ) : null}
                </div>
              }
            >
              दैनिक विवरण (Daily Analytics)
            </AnalyticsTableHeader>

            {payload.daily.length === 0 ? (
              <div className="py-10 text-center text-stone-400 space-y-2">
                <Inbox className="w-10 h-10 mx-auto text-stone-300" />
                <p className="text-sm font-bold">चयनित अवधि में कोई विश्लेषण रिकॉर्ड नहीं मिला</p>
                <p className="text-xs font-semibold">
                  {activeFilterCount > 0
                    ? 'फ़िल्टर हटाकर पुनः प्रयास करें।'
                    : 'इस अवधि के लिए अभी दैनिक स्नैपशॉट नहीं बना है।'}
                </p>
              </div>
            ) : (
              <AnalyticsTable
                rows={payload.daily}
                coverage={coverage}
                sortKey={report.sortKey as never}
                sortDirection={report.sortOrder}
                onSortChange={report.setSortKey}
              />
            )}

            <AnalyticsPagination
              page={report.page}
              totalPages={payload.page.totalPages}
              totalRows={payload.totalRows}
              returnedRows={payload.page.returned}
              pageSize={report.pageSize}
              disabled={loading}
              onPageChange={report.setPage}
              onPageSizeChange={report.setPageSize}
            />
          </div>
        </>
      ) : null}
    </div>
  );
};

export default AdminReports;