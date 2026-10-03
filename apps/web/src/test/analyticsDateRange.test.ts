import { describe, it, expect } from 'vitest';
import {
  todayUtc,
  yesterdayUtc,
  shiftDayKey,
  inclusiveDayCount,
  resolveRange,
  isDayKey,
  formatRangeLabel,
  ANALYTICS_RANGE_PRESETS,
} from '../features/dashboard/analytics/dateRange';
import {
  computeDelta,
  formatDeltaPercent,
  formatDeltaAbsolute,
  formatDuration,
  formatHoursCompact,
  formatIndian,
  formatRelativeRefresh,
} from '../features/dashboard/analytics/format';
import { buildPageWindow } from '../features/dashboard/components/analytics/AnalyticsPagination';

describe('Analytics date ranges — UTC and inclusive', () => {
  const now = new Date('2026-10-08T12:00:00.000Z');

  it('resolves today from the UTC calendar, not device-local midnight', () => {
    // The old code used toISOString() against a local Date, which produced the
    // wrong day for operators outside UTC.
    expect(todayUtc(now)).toBe('2026-10-08');
    expect(yesterdayUtc(now)).toBe('2026-10-07');
  });

  it('shifts across a month boundary correctly', () => {
    expect(shiftDayKey('2026-10-01', -1)).toBe('2026-09-30');
    expect(shiftDayKey('2026-03-01', -1)).toBe('2026-02-28');
    expect(shiftDayKey('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('counts both endpoints of an inclusive range', () => {
    expect(inclusiveDayCount('2026-10-01', '2026-10-01')).toBe(1);
    expect(inclusiveDayCount('2026-10-01', '2026-10-07')).toBe(7);
    expect(inclusiveDayCount('2026-10-01', '2026-10-31')).toBe(31);
  });

  it('returns 0 for an inverted range rather than a negative count', () => {
    expect(inclusiveDayCount('2026-10-07', '2026-10-01')).toBe(0);
  });

  it('resolves a 7-day preset to exactly 7 inclusive days', () => {
    const range = resolveRange('7d', undefined, now);
    expect(range.dayCount).toBe(7);
    expect(range.startDate).toBe('2026-10-02');
    expect(range.endDate).toBe('2026-10-08');
  });

  it('resolves a 30-day preset to exactly 30 days, not 31', () => {
    const range = resolveRange('30d', undefined, now);
    expect(range.dayCount).toBe(30);
    expect(inclusiveDayCount(range.startDate, range.endDate)).toBe(30);
  });

  it('resolves Today and Yesterday to single-day windows', () => {
    const today = resolveRange('today', undefined, now);
    expect(today.startDate).toBe('2026-10-08');
    expect(today.endDate).toBe('2026-10-08');
    expect(today.isPartialPeriod).toBe(true);

    const yesterday = resolveRange('yesterday', undefined, now);
    expect(yesterday.startDate).toBe('2026-10-07');
    expect(yesterday.endDate).toBe('2026-10-07');
    expect(yesterday.isPartialPeriod).toBe(false);
  });

  it('marks any range ending today as partial', () => {
    expect(resolveRange('90d', undefined, now).isPartialPeriod).toBe(true);
    expect(
      resolveRange('custom', { startDate: '2026-10-01', endDate: '2026-10-07' }, now).isPartialPeriod
    ).toBe(false);
  });

  it('normalises an inverted custom range instead of emitting an invalid one', () => {
    const range = resolveRange(
      'custom',
      { startDate: '2026-10-07', endDate: '2026-10-01' },
      now
    );
    expect(range.startDate).toBe('2026-10-01');
    expect(range.endDate).toBe('2026-10-07');
  });

  it('falls back to a 30-day window when custom bounds are missing', () => {
    const range = resolveRange('custom', {}, now);
    expect(range.dayCount).toBe(30);
    expect(range.endDate).toBe('2026-10-08');
  });

  it('exposes Today/Yesterday presets that the previous control lacked', () => {
    const ids = ANALYTICS_RANGE_PRESETS.map((p) => p.id);
    expect(ids).toContain('today');
    expect(ids).toContain('yesterday');
  });

  it('validates day-key shape', () => {
    expect(isDayKey('2026-10-01')).toBe(true);
    expect(isDayKey('2026-13-01')).toBe(false);
    expect(isDayKey('01/10/2026')).toBe(false);
  });

  it('formats a range label including its inclusive day count', () => {
    expect(formatRangeLabel('2026-10-01', '2026-10-07')).toContain('7');
  });
});

describe('Analytics delta honesty', () => {
  it('reports an honest percentage against a non-zero baseline', () => {
    const delta = computeDelta(150, 100);
    expect(delta.isComparable).toBe(true);
    expect(delta.percent).toBeCloseTo(50);
    expect(formatDeltaPercent(delta)).toBe('+50%');
  });

  it('refuses to render a percentage when the metric was never collected', () => {
    // This is the case that previously produced a misleading "+0%".
    const delta = computeDelta(0, 0, false);
    expect(delta.isComparable).toBe(false);
    expect(formatDeltaPercent(delta)).toBe('—');
  });

  it('refuses a percentage when the comparison window has no data', () => {
    const delta = computeDelta(120, null);
    expect(delta.isComparable).toBe(false);
    expect(formatDeltaPercent(delta)).toBe('—');
  });

  it('reports only the absolute change when the baseline is zero', () => {
    const delta = computeDelta(40, 0);
    expect(delta.isComparable).toBe(true);
    expect(delta.percent).toBeNull();
    expect(delta.absolute).toBe(40);
    expect(formatDeltaPercent(delta)).toBe('—');
    expect(formatDeltaAbsolute(delta)).toBe('+40');
  });

  it('marks direction correctly for growth, decline and no change', () => {
    expect(computeDelta(200, 100).direction).toBe('up');
    expect(computeDelta(50, 100).direction).toBe('down');
    expect(computeDelta(100, 100).direction).toBe('flat');
    expect(formatDeltaPercent(computeDelta(100, 100))).toBe('0%');
  });

  it('renders a minus sign rather than a hyphen for declines', () => {
    expect(formatDeltaPercent(computeDelta(80, 100))).toBe('−20%');
    expect(formatDeltaAbsolute(computeDelta(80, 100))).toBe('−20');
  });
});

describe('Analytics formatting', () => {
  it('formats durations without producing empty units', () => {
    expect(formatDuration(0)).toBe('0 सेकंड');
    expect(formatDuration(45)).toBe('45 सेकंड');
    expect(formatDuration(60)).toBe('1 मिनट');
    expect(formatDuration(3600)).toBe('1 घंटे');
    expect(formatDuration(5400)).toBe('1 घंटे 30 मिनट');
  });

  it('formats hours compactly for chart axes', () => {
    expect(formatHoursCompact(3600)).toBe('1.00h');
    expect(formatHoursCompact(18000)).toBe('5.00h');
    expect(formatHoursCompact(720000)).toBe('200h');
  });

  it('uses Indian digit grouping', () => {
    expect(formatIndian(1234567)).toBe('12,34,567');
  });

  it('returns null for an unknown refresh timestamp instead of inventing one', () => {
    expect(formatRelativeRefresh(undefined)).toBeNull();
    expect(formatRelativeRefresh(null)).toBeNull();
    expect(formatRelativeRefresh('not-a-timestamp')).toBeNull();
  });

  it('reports a relative refresh from a Firestore timestamp shape', () => {
    const twoHoursAgo = { seconds: Math.floor((Date.now() - 7_200_000) / 1000) };
    expect(formatRelativeRefresh(twoHoursAgo)).toBe('2 घंटे पहले');
  });
});

describe('Analytics pagination window', () => {
  it('renders every page when there are few pages', () => {
    expect(buildPageWindow(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('collapses distant pages into gaps around the current page', () => {
    const window = buildPageWindow(25, 53);
    expect(window[0]).toBe(1);
    expect(window[window.length - 1]).toBe(53);
    expect(window).toContain('gap');
    expect(window).toContain(25);
    expect(window.length).toBeLessThan(11);
  });

  it('always includes first and last pages for jump navigation', () => {
    expect(buildPageWindow(7, 20)[0]).toBe(1);
    expect(buildPageWindow(7, 20).at(-1)).toBe(20);
  });

  it('handles the single-page case', () => {
    expect(buildPageWindow(1, 1)).toEqual([1]);
  });

  it('does not emit gaps that sit next to each other', () => {
    const window = buildPageWindow(3, 10);
    for (let i = 1; i < window.length; i += 1) {
      expect(window[i] === 'gap' && window[i - 1] === 'gap').toBe(false);
    }
  });
});