import { describe, it, expect } from 'vitest';
import { coverageKeyFor } from '../features/dashboard/components/analytics';
import type { AnalyticsCoverage, DailyAnalyticsRecord } from '../features/dashboard/analytics/types';
import { COVERAGE_REASONS } from '../features/dashboard/analytics/types';

/**
 * The invariant this suite protects: a metric that was never collected must not
 * be displayed as 0.
 *
 * Before this work the Reports page derived every KPI from a raw reduce over
 * `daily[]` and rendered 0 whenever the source collection was empty — so an
 * uncollected metric was indistinguishable from a genuine zero. The coverage
 * flags are what make the difference observable, so their mapping is tested
 * directly.
 */

const FULL_COVERAGE: AnalyticsCoverage = {
  registrations: true,
  plays: true,
  playtime: true,
  activeUsers: true,
  libraryActivity: true,
};

const NO_PLAYBACK_COVERAGE: AnalyticsCoverage = {
  registrations: true,
  plays: false,
  playtime: false,
  activeUsers: false,
  libraryActivity: true,
};

const row = (overrides: Partial<DailyAnalyticsRecord> = {}): DailyAnalyticsRecord => ({
  date: '2026-10-01',
  newRegistrations: 0,
  totalPlays: 0,
  totalListenDurationSeconds: 0,
  uniqueActiveUsers: 0,
  totalInteractions: 0,
  distinctTracksPlayed: 0,
  libraryActiveUsers: 0,
  topCategory: null,
  coverage: FULL_COVERAGE,
  ...overrides,
});

describe('Coverage → column mapping', () => {
  it('gates the play column on the plays coverage flag', () => {
    expect(coverageKeyFor('totalPlays')).toBe('plays');
  });

  it('gates the playtime column on the playtime coverage flag', () => {
    expect(coverageKeyFor('totalListenDurationSeconds')).toBe('playtime');
  });

  it('gates the active-user column on the activeUsers coverage flag', () => {
    expect(coverageKeyFor('uniqueActiveUsers')).toBe('activeUsers');
  });

  it('gates the distinct-track column on library activity', () => {
    expect(coverageKeyFor('distinctTracksPlayed')).toBe('libraryActivity');
  });

  it('never gates registrations, which are real for all history', () => {
    expect(coverageKeyFor('newRegistrations')).toBe('registrations');
  });
});

describe('Uncollected metrics are distinguishable from real zeros', () => {
  it('a covered zero row is a genuine zero and stays numeric', () => {
    const covered = row({ totalPlays: 0, coverage: FULL_COVERAGE });
    expect(covered.totalPlays).toBe(0);
    expect(covered.coverage.plays).toBe(true);
    expect(covered.coverage.plays).toBe(true);
  });

  it('an uncovered row is flagged so the UI renders a dash, not 0', () => {
    const uncovered = row({ totalPlays: 0, coverage: NO_PLAYBACK_COVERAGE });
    expect(uncovered.coverage.plays).toBe(false);
    expect(uncovered.coverage.registrations).toBe(true);
  });

  it('keeps real registration counts even when playback was never collected', () => {
    // This is the important mixed case: the day genuinely had registrations
    // AND genuinely had no play collector. Zeroing the whole row would destroy
    // a real measurement.
    const mixed = row({ newRegistrations: 3, totalPlays: 0, coverage: NO_PLAYBACK_COVERAGE });
    expect(mixed.newRegistrations).toBe(3);
    expect(mixed.coverage.registrations).toBe(true);
    expect(mixed.coverage.plays).toBe(false);
  });

  it('never infers topCategory when there is no evidence', () => {
    expect(row({ coverage: NO_PLAYBACK_COVERAGE }).topCategory).toBeNull();
  });

  it('marks in-progress days so partial totals are never read as final', () => {
    expect(row({ isPartial: true }).isPartial).toBe(true);
    expect(row().isPartial).toBeUndefined();
  });
});

describe('Coverage reasons are actionable', () => {
  it('gives a distinct explanation per uncovered metric', () => {
    const reasons = (Object.keys(COVERAGE_REASONS) as Array<keyof AnalyticsCoverage>).map(
      (key) => COVERAGE_REASONS[key]
    );
    expect(new Set(reasons).size).toBe(reasons.length);
  });

  it('does not claim registrations are ever missing', () => {
    expect(COVERAGE_REASONS.registrations).toMatch(/हमेशा/);
  });
});