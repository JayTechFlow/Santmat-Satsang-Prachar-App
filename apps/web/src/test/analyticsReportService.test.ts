import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reportService } from '../features/dashboard/services/reportService';
import type { AnalyticsSummaryPayload } from '../features/dashboard/analytics/types';

const mockCallable = vi.fn();

vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn(() => mockCallable),
}));

vi.mock('../lib/firebase/config', () => ({
  functions: {},
}));

const buildPayload = (overrides: Partial<AnalyticsSummaryPayload> = {}): AnalyticsSummaryPayload => ({
  range: { startDate: '2026-10-01', endDate: '2026-10-07', dayCount: 7, timezone: 'UTC' },
  daily: [],
  current: {
    newRegistrations: 5,
    totalPlays: 120,
    totalListenDurationSeconds: 7200,
    uniqueActiveUsers: 12,
    distinctTracksPlayed: 40,
    libraryActiveUsers: 9,
    totalInteractions: 130,
    coverage: { registrations: true, plays: true, playtime: true, activeUsers: true, libraryActivity: true },
  },
  overview: {
    lastUpdatedDate: '2026-10-07',
    latestDailyPlays: 20,
    latestDau: 4,
    activeUserSemantics: 'exact_realtime',
  },
  comparison: null,
  nextCursor: null,
  totalRows: 7,
  page: { size: 7, offset: 0, returned: 7, hasMore: false, totalPages: 1 },
  ...overrides,
});

describe('ReportService — analytics query contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCallable.mockResolvedValue({ data: { status: 'success', data: buildPayload() } });
  });

  it('calls the real analytics callable by name', async () => {
    await reportService.getAnalyticsSummary({ startDate: '2026-10-01', endDate: '2026-10-07' });
    const { httpsCallable } = await import('firebase/functions');
    expect(httpsCallable).toHaveBeenCalledWith({}, 'analytics-getAnalyticsSummary');
  });

  it('forwards server-side paging parameters rather than paginating locally', async () => {
    await reportService.getAnalyticsSummary({ pageSize: 31, offset: 62, sortOrder: 'asc' });
    expect(mockCallable).toHaveBeenCalledWith({ pageSize: 31, offset: 62, sortOrder: 'asc' });
  });

  it('forwards filter parameters to the server', async () => {
    await reportService.getAnalyticsSummary({
      minPlays: 5,
      minPlaytimeSeconds: 60,
      minActiveUsers: 2,
      category: 'भजन',
    });
    expect(mockCallable).toHaveBeenCalledWith({
      minPlays: 5,
      minPlaytimeSeconds: 60,
      minActiveUsers: 2,
      category: 'भजन',
    });
  });

  it('returns server-computed period totals rather than deriving them client-side', async () => {
    const result = await reportService.getAnalyticsSummary();
    expect(result.success).toBe(true);
    // Totals must come from the payload: the page may only hold one page of rows,
    // so reducing the rows would under-report a longer range.
    expect(result.data?.current.totalPlays).toBe(120);
    expect(result.data?.current.coverage.plays).toBe(true);
  });

  it('preserves the coverage flags so the UI can show uncollected metrics honestly', async () => {
    mockCallable.mockResolvedValue({
      data: {
        status: 'success',
        data: buildPayload({
          current: {
            ...buildPayload().current,
            totalPlays: 0,
            coverage: { registrations: true, plays: false, playtime: false, activeUsers: false, libraryActivity: true },
          },
        }),
      },
    });

    const result = await reportService.getAnalyticsSummary();
    expect(result.success).toBe(true);
    expect(result.data?.current.coverage.plays).toBe(false);
    expect(result.data?.current.coverage.registrations).toBe(true);
  });

  it('preserves pagination geometry including totalRows and totalPages', async () => {
    mockCallable.mockResolvedValue({
      data: {
        status: 'success',
        data: buildPayload({
          totalRows: 365,
          nextCursor: 'Y3Vyc29y',
          page: { size: 31, offset: 31, returned: 31, hasMore: true, totalPages: 12 },
        }),
      },
    });

    const result = await reportService.getAnalyticsSummary();
    expect(result.data?.totalRows).toBe(365);
    expect(result.data?.page.totalPages).toBe(12);
    expect(result.data?.page.hasMore).toBe(true);
    expect(result.data?.nextCursor).toBe('Y3Vyc29y');
  });

  it('rejects a malformed payload instead of letting it crash the page', async () => {
    mockCallable.mockResolvedValue({ data: { status: 'success', data: { nope: true } } });
    const result = await reportService.getAnalyticsSummary();
    expect(result.success).toBe(false);
    expect(result.error).toContain('Unexpected response');
  });

  it('maps permission-denied to an actionable admin message', async () => {
    mockCallable.mockRejectedValue({ code: 'functions/permission-denied', message: 'internal detail' });
    const result = await reportService.getAnalyticsSummary();
    expect(result.success).toBe(false);
    expect(result.error).toContain('not permitted to view reports');
    // Backend internals must not leak into the UI.
    expect(result.error).not.toContain('internal detail');
  });

  it('maps unauthenticated to a re-login prompt', async () => {
    mockCallable.mockRejectedValue({ code: 'functions/unauthenticated' });
    const result = await reportService.getAnalyticsSummary();
    expect(result.error).toContain('sign in again');
  });

  it('maps invalid-argument to a range/filter error', async () => {
    mockCallable.mockRejectedValue({ code: 'functions/invalid-argument', message: 'functions: startDate must be on or before endDate' });
    const result = await reportService.getAnalyticsSummary();
    expect(result.error).toContain('अमान्य तिथि-सीमा');
    expect(result.error).toContain('startDate must be on or before endDate');
  });

  it('maps unavailable to a retry-later message', async () => {
    mockCallable.mockRejectedValue({ code: 'functions/unavailable' });
    const result = await reportService.getAnalyticsSummary();
    expect(result.error).toContain('temporarily unavailable');
  });

  it('never throws on a raw non-Firebase error', async () => {
    mockCallable.mockRejectedValue(new Error('boom'));
    const result = await reportService.getAnalyticsSummary();
    expect(result.success).toBe(false);
    expect(result.error).toContain('boom');
  });
});

describe('ReportService — server-declared metric contract', () => {
  beforeEach(() => vi.clearAllMocks());

  it('exposes metric definitions and thresholds from the backend', async () => {
    mockCallable.mockResolvedValue({
      data: {
        status: 'success',
        data: {
          timezone: 'UTC',
          maxRangeDays: 400,
          maxPageSize: 200,
          defaultPageSize: 31,
          metricDefinitions: [
            {
              key: 'totalPlays',
              label: 'Total Plays',
              definition: 'Sessions with >= 10s of listening',
              source: 'playback_events',
              unit: 'count',
            },
          ],
          thresholds: { minPlayListenedSeconds: 10, activeUserHeartbeatMinutes: 30 },
          ingestion: { activeUserHeartbeatMinutes: 30, heartbeatThrottleMs: 300000 },
        },
      },
    });

    const result = await reportService.getAnalyticsContract();
    expect(result.success).toBe(true);
    expect(result.data?.thresholds.minPlayListenedSeconds).toBe(10);
    expect(result.data?.metricDefinitions[0].source).toBe('playback_events');
    expect(result.data?.timezone).toBe('UTC');
  });

  it('fails softly when the contract call fails, so pages still render', async () => {
    mockCallable.mockRejectedValue({ code: 'functions/unavailable' });
    const result = await reportService.getAnalyticsContract();
    expect(result.success).toBe(false);
  });
});