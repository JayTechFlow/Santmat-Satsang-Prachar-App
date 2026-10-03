import { describe, it, expect } from 'vitest';
import {
  effectiveRangeDays,
  timelineLabel,
  MAX_ANALYTICS_RANGE_DAYS,
} from '../features/dashboard/analytics/timelineRange';

/**
 * Regression guard for a defect found in production.
 *
 * The Dashboard offered "Last 2 Years" / "Last 5 Years" / "Lifetime"
 * presets which requested 730 and 1825 day windows. `getAnalyticsSummary`
 * rejects anything over 400 days with invalid-argument, so selecting any of
 * them produced a hard error panel instead of data.
 */
describe('Dashboard timeline ranges respect the server ceiling', () => {
  const SERVER_LIMIT = MAX_ANALYTICS_RANGE_DAYS;

  it('passes short presets through untouched', () => {
    expect(effectiveRangeDays('7d')).toBe(7);
    expect(effectiveRangeDays('30d')).toBe(30);
    expect(effectiveRangeDays('180d')).toBe(180);
    expect(effectiveRangeDays('1y')).toBe(365);
  });

  it('clamps 2y to the server maximum instead of requesting 730 days', () => {
    expect(effectiveRangeDays('2y')).toBe(SERVER_LIMIT);
  });

  it('clamps 5y to the server maximum instead of requesting 1825 days', () => {
    expect(effectiveRangeDays('5y')).toBe(SERVER_LIMIT);
  });

  it('clamps the unbounded lifetime preset to the server maximum', () => {
    expect(effectiveRangeDays('lifetime')).toBe(SERVER_LIMIT);
  });

  it('never produces a window the backend would reject', () => {
    for (const range of ['7d', '30d', '180d', '1y', '2y', '5y', 'lifetime'] as const) {
      expect(effectiveRangeDays(range)).toBeLessThanOrEqual(SERVER_LIMIT);
      expect(effectiveRangeDays(range)).toBeGreaterThan(0);
    }
  });

  it('annotates a clamped preset so it is not mislabelled', () => {
    expect(timelineLabel('2y')).toContain('400');
    expect(timelineLabel('5y')).toContain('400');
    expect(timelineLabel('lifetime')).toContain('400');
  });

  it('leaves an honest short preset label alone', () => {
    expect(timelineLabel('30d')).not.toContain('400');
    expect(timelineLabel('30d')).toContain('30');
  });
});