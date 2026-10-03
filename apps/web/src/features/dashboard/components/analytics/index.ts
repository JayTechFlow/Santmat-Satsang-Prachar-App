/**
 * Reusable analytics components for the Admin Reports surface.
 *
 * These are extracted so the Reports page contains composition only, and so a
 * future admin analytics surface can reuse the same KPI/table/chart/pagination
 * behaviour — including the coverage-aware "not collected" rendering that keeps
 * unmeasured metrics from being displayed as zero.
 */
export { AnalyticsKpiCard } from './AnalyticsKpiCard';
export { AnalyticsRangeFilter } from './AnalyticsRangeFilter';
export { AnalyticsFilterBar, EMPTY_FILTERS } from './AnalyticsFilterBar';
export { AnalyticsTrendChart } from './AnalyticsTrendChart';
export { AnalyticsTable, AnalyticsTableHeader, coverageKeyFor } from './AnalyticsTable';
export { AnalyticsPagination, buildPageWindow } from './AnalyticsPagination';
export { AnalyticsCoverageNotice } from './AnalyticsCoverageNotice';

export type { SortableColumn } from './AnalyticsTable';
export type { TrendMetric, TrendPoint } from './AnalyticsTrendChart';