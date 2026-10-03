/**
 * Analytics contract types — mirror of `firebase/functions/src/analytics_contract.ts`.
 *
 * These are the ONLY shapes the Reports UI renders. Keeping a single typed
 * contract on both sides means a metric can never appear in the UI without a
 * declared source, and `coverage` can never be forgotten when a value is
 * displayed.
 */

export type DayKey = string; // YYYY-MM-DD (UTC)

export type ActiveUserSemantics = 'exact_realtime' | 'daily_distinct_users' | 'unavailable';

/**
 * Which metrics have a trustworthy source for a given day or period.
 * A `false` flag MUST render as an explicit "not collected" state, never 0.
 */
export interface AnalyticsCoverage {
  registrations: boolean;
  plays: boolean;
  playtime: boolean;
  activeUsers: boolean;
  libraryActivity: boolean;
}

export interface DailyAnalyticsRecord {
  date: DayKey;
  newRegistrations: number;
  totalPlays: number;
  totalListenDurationSeconds: number;
  uniqueActiveUsers: number;
  totalInteractions: number;
  distinctTracksPlayed: number;
  libraryActiveUsers: number;
  /** null when there is no evidence — never a hardcoded "general". */
  topCategory: string | null;
  coverage: AnalyticsCoverage;
  /** The day is still in progress; totals are not final. */
  isPartial?: boolean;
  updatedAt?: unknown;
}

export interface AnalyticsTotals {
  newRegistrations: number;
  totalPlays: number;
  totalListenDurationSeconds: number;
  uniqueActiveUsers: number;
  distinctTracksPlayed: number;
  libraryActiveUsers: number;
  totalInteractions: number;
  coverage: AnalyticsCoverage;
}

export interface AnalyticsOverview {
  lastUpdatedDate: DayKey | null;
  latestDailyPlays: number | null;
  latestDau: number | null;
  activeUserSemantics: ActiveUserSemantics;
  updatedAt?: unknown;
}

export interface AnalyticsRange {
  startDate: DayKey;
  endDate: DayKey;
  dayCount: number;
  timezone: string;
}

export interface AnalyticsPageGeometry {
  size: number;
  offset: number;
  returned: number;
  hasMore: boolean;
  totalPages: number;
}

/** Payload returned by `analytics-getAnalyticsSummary`. */
export interface AnalyticsSummaryPayload {
  range: AnalyticsRange;
  /** Current page of rows, newest first by default. */
  daily: DailyAnalyticsRecord[];
  /** Totals for the whole filtered range, computed server-side. */
  current: AnalyticsTotals;
  overview: AnalyticsOverview;
  /** Immediately preceding window of identical length. */
  comparison: AnalyticsTotals & { startDate: DayKey; endDate: DayKey } | null;
  nextCursor: string | null;
  totalRows: number;
  page: AnalyticsPageGeometry;
}

export interface MetricDefinition {
  key: string;
  label: string;
  definition: string;
  source: string;
  unit: 'count' | 'seconds' | 'category';
}

/** Server-declared contract, fetched via `analytics-getAnalyticsContract`. */
export interface AnalyticsContract {
  timezone: string;
  maxRangeDays: number;
  maxPageSize: number;
  defaultPageSize: number;
  metricDefinitions: MetricDefinition[];
  thresholds: {
    minPlayListenedSeconds: number;
    activeUserHeartbeatMinutes: number;
  };
  ingestion: {
    activeUserHeartbeatMinutes: number;
    heartbeatThrottleMs: number;
  };
}

// ── Query shape accepted by the service ────────────────────────────────────

export type AnalyticsSortOrder = 'asc' | 'desc';

export interface AnalyticsFilters {
  minPlays?: number;
  minPlaytimeSeconds?: number;
  minActiveUsers?: number;
  category?: string;
}

export interface AnalyticsQuery extends AnalyticsFilters {
  startDate?: DayKey;
  endDate?: DayKey;
  pageSize?: number;
  offset?: number;
  cursor?: string | null;
  sortOrder?: AnalyticsSortOrder;
  includeComparison?: boolean;
}

/** A metric that can be unavailable because no collector fed the pipeline. */
export type CoverageKey = keyof AnalyticsCoverage;

/** Map a coverage flag to the reason shown to the admin. */
export const COVERAGE_REASONS: Record<CoverageKey, string> = {
  registrations: 'पंजीकरण डेटा हमेशा उपलब्ध होता है',
  plays: 'प्ले डेटा एकत्र करने वाला कलेक्टर अभी उपलब्ध नहीं था',
  playtime: 'श्रवण समय का कलेक्टर अभी उपलब्ध नहीं था',
  activeUsers: 'सक्रिय-उपयोगकर्ता हार्टबीट अभी उपलब्ध नहीं था',
  libraryActivity: 'लाइब्रेरी गतिविधि डेटा उपलब्ध नहीं',
};

/**
 * Human label for the active-user semantics returned by the backend, so the UI
 * states the difference between exact-realtime and whole-day distinct users
 * rather than implying both are the same measurement.
 */
export const ACTIVE_SEMANTICS_LABELS: Record<ActiveUserSemantics, string> = {
  exact_realtime: 'रीयल-टाइम (हार्टबीट आधारित)',
  daily_distinct_users: 'दिनभर के अद्वितीय उपयोगकर्ता',
  unavailable: 'उपलब्ध नहीं',
};