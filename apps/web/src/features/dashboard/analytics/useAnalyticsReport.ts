import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { reportService } from '../services/reportService';
import { resolveRange, shiftDayKey, todayUtc, AnalyticsRangePresetId } from './dateRange';
import type {
  AnalyticsContract,
  AnalyticsFilters,
  AnalyticsSortOrder,
  AnalyticsSummaryPayload,
} from './types';

/**
 * Owns all Reports state: range, filters, sorting, server-side pagination.
 *
 * Responsibilities kept here (rather than in the page) so that:
 *  - a stale response can never overwrite a newer one (request sequencing), and
 *  - every filter/date/sort change deterministically resets to page 1, which is
 *    the behaviour the reporting requirements demand.
 */

const DEFAULT_PAGE_SIZE = 31;

export interface UseAnalyticsReportState {
  preset: AnalyticsRangePresetId;
  customStart?: string;
  customEnd?: string;
  filters: AnalyticsFilters;
  sortOrder: AnalyticsSortOrder;
  sortKey: string;
  page: number;
  pageSize: number;
}

export const useAnalyticsReport = () => {
  const [state, setState] = useState<UseAnalyticsReportState>({
    preset: '30d',
    customStart: shiftDayKey(todayUtc(), -29),
    customEnd: todayUtc(),
    filters: {},
    sortOrder: 'desc',
    sortKey: 'date',
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const [payload, setPayload] = useState<AnalyticsSummaryPayload | null>(null);
  const [contract, setContract] = useState<AnalyticsContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sequence guard: a slow response from a previous filter must not clobber
  // the results of the current one.
  const requestIdRef = useRef(0);

  const range = useMemo(
    () =>
      resolveRange(state.preset, {
        startDate: state.customStart,
        endDate: state.customEnd,
      }),
    [state.preset, state.customStart, state.customEnd]
  );

  // Load the server-declared contract once. Failure is non-fatal: the page
  // falls back to the locally mirrored thresholds.
  useEffect(() => {
    let cancelled = false;
    reportService.getAnalyticsContract().then((res) => {
      if (cancelled) return;
      if (res.success && res.data) setContract(res.data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    const result = await reportService.getAnalyticsSummary({
      startDate: range.startDate,
      endDate: range.endDate,
      pageSize: state.pageSize,
      offset: (state.page - 1) * state.pageSize,
      sortOrder: state.sortOrder,
      ...state.filters,
    });

    if (requestId !== requestIdRef.current) return;

    if (result.success && result.data) {
      setPayload(result.data);

      // Guard against a filter/sort change that leaves the requested page past
      // the end of the result set (e.g. after narrowing filters).
      const totalPages = result.data.page.totalPages;
      if (state.page > totalPages && totalPages >= 1) {
        setState((prev) => ({ ...prev, page: totalPages }));
      }
    } else {
      setError(result.error ?? 'एनालिटिक्स डेटा उपलब्ध नहीं');
      setPayload(null);
    }
    setLoading(false);
  }, [range.startDate, range.endDate, state.page, state.pageSize, state.sortOrder, state.filters]);

  useEffect(() => {
    void load();
  }, [load]);

  // ── Actions: every one resets to page 1 ──────────────────────────────────

  const setPreset = useCallback((preset: AnalyticsRangePresetId) => {
    setState((prev) => ({ ...prev, preset, page: 1 }));
  }, []);

  const setCustomRange = useCallback((startDate: string, endDate: string) => {
    setState((prev) => ({ ...prev, preset: 'custom', customStart: startDate, customEnd: endDate, page: 1 }));
  }, []);

  const setFilters = useCallback((filters: AnalyticsFilters) => {
    setState((prev) => ({ ...prev, filters, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setState((prev) => ({ ...prev, filters: {}, sortOrder: 'desc', page: 1 }));
  }, []);

  const setSortOrder = useCallback((sortOrder: AnalyticsSortOrder) => {
    setState((prev) => ({ ...prev, sortOrder, page: 1 }));
  }, []);

  const setSortKey = useCallback((sortKey: string) => {
    setState((prev) => ({ ...prev, sortKey, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setState((prev) => ({ ...prev, page: Math.max(1, page) }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setState((prev) => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const refresh = useCallback(() => {
    void load();
  }, [load]);

  // Chart series come from the loaded page and are re-ordered oldest→newest so
  // the line reads left-to-right in time regardless of the table's sort.
  const chartPoints = useMemo(() => {
    const rows = payload?.daily ?? [];
    return [...rows].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  }, [payload?.daily]);

  const partialDates = useMemo(
    () => new Set((payload?.daily ?? []).filter((row) => row.isPartial).map((row) => row.date)),
    [payload?.daily]
  );

  const categoryOptions = useMemo(() => {
    const categories = new Set<string>();
    (payload?.daily ?? []).forEach((row) => {
      if (row.topCategory) categories.add(row.topCategory);
    });
    return [...categories].sort();
  }, [payload?.daily]);

  const activeFilterCount = useMemo(
    () =>
      Object.values(state.filters).filter((value) => value !== undefined && value !== '').length,
    [state.filters]
  );

  return {
    // state
    ...state,
    range,
    payload,
    contract,
    loading,
    error,
    chartPoints,
    partialDates,
    categoryOptions,
    activeFilterCount,
    // actions
    setPreset,
    setCustomRange,
    setFilters,
    resetFilters,
    setSortOrder,
    setSortKey,
    setPage,
    setPageSize,
    refresh,
  };
};

export type UseAnalyticsReportReturn = ReturnType<typeof useAnalyticsReport>;