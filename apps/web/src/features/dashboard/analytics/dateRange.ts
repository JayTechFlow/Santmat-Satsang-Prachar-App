/**
 * UTC date-range utilities for the Admin analytics surfaces.
 *
 * The previous Reports and Dashboard pages each computed their own range with
 * `new Date().toISOString().split('T')[0]`, which has two defects:
 *  1. `toISOString()` renders UTC while the operator is looking at a local
 *     calendar, so "Today" was the wrong day for anyone east or west of UTC.
 *  2. `start.setDate(start.getDate() - days)` produced an INCLUSIVE range of
 *     days+1, which then disagreed with the `limit: days` it was paired with —
 *     the boundary was silently dropped.
 *
 * Analytics days are UTC days (see the backend contract), so these helpers
 * work entirely in UTC and every range is inclusive of both endpoints.
 */

import type { DayKey } from './types';

const MS_PER_DAY = 86_400_000;

export const isDayKey = (value: unknown): value is DayKey =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`));

/** Today's analytics day key in UTC. */
export const todayUtc = (now: Date = new Date()): DayKey => now.toISOString().slice(0, 10);

/** UTC day key `offset` days before `key`. */
export const shiftDayKey = (key: DayKey, offset: number): DayKey =>
  new Date(new Date(`${key}T00:00:00.000Z`).getTime() + offset * MS_PER_DAY).toISOString().slice(0, 10);

/** Yesterday's analytics day key in UTC. */
export const yesterdayUtc = (now: Date = new Date()): DayKey => shiftDayKey(todayUtc(now), -1);

/** Inclusive day count between two keys. */
export const inclusiveDayCount = (startDate: DayKey, endDate: DayKey): number => {
  if (!isDayKey(startDate) || !isDayKey(endDate) || startDate > endDate) return 0;
  return Math.round((Date.parse(`${endDate}T00:00:00.000Z`) - Date.parse(`${startDate}T00:00:00.000Z`)) / MS_PER_DAY) + 1;
};

export type AnalyticsRangePresetId = 'today' | 'yesterday' | '7d' | '30d' | '90d' | '1y' | 'custom';

export interface AnalyticsRangePreset {
  id: AnalyticsRangePresetId;
  label: string;
  /** Inclusive day count for this preset. */
  days: number;
  /** Presets with a fixed window resolve their own bounds. */
  fixed?: boolean;
}

export const ANALYTICS_RANGE_PRESETS: AnalyticsRangePreset[] = [
  { id: 'today', label: 'आज', days: 1, fixed: true },
  { id: 'yesterday', label: 'कल', days: 1, fixed: true },
  { id: '7d', label: 'पिछले 7 दिन', days: 7 },
  { id: '30d', label: 'पिछले 30 दिन', days: 30 },
  { id: '90d', label: 'पिछले 90 दिन', days: 90 },
  { id: '1y', label: 'पिछले 1 वर्ष', days: 365 },
];

export interface ResolvedRange {
  startDate: DayKey;
  endDate: DayKey;
  /** Inclusive, so a 7-day preset really covers 7 days. */
  dayCount: number;
  preset: AnalyticsRangePresetId;
  isPartialPeriod: boolean;
}

/**
 * Resolve a preset (plus optional custom bounds) into inclusive UTC bounds.
 * `isPartialPeriod` is true when the range includes Today, which the UI uses
 * to mark in-progress numbers instead of presenting them as final.
 */
export const resolveRange = (
  preset: AnalyticsRangePresetId,
  custom?: { startDate?: DayKey; endDate?: DayKey },
  now: Date = new Date()
): ResolvedRange => {
  const today = todayUtc(now);

  if (preset === 'custom') {
    const endDate = isDayKey(custom?.endDate) ? custom!.endDate : today;
    const startDate = isDayKey(custom?.startDate) ? custom!.startDate : shiftDayKey(endDate, -29);
    // A reversed custom range is normalised rather than sent to the backend,
    // so the admin sees a valid window instead of an invalid-argument error.
    const [lo, hi] = startDate <= endDate ? [startDate, endDate] : [endDate, startDate];
    return {
      startDate: lo,
      endDate: hi,
      dayCount: inclusiveDayCount(lo, hi),
      preset,
      isPartialPeriod: hi >= today,
    };
  }

  const definition = ANALYTICS_RANGE_PRESETS.find((p) => p.id === preset) ?? ANALYTICS_RANGE_PRESETS[3];

  if (preset === 'today') {
    return { startDate: today, endDate: today, dayCount: 1, preset, isPartialPeriod: true };
  }
  if (preset === 'yesterday') {
    const day = shiftDayKey(today, -1);
    return { startDate: day, endDate: day, dayCount: 1, preset, isPartialPeriod: false };
  }

  // `days - 1` (not `days`) keeps the window inclusive: today plus the
  // previous days-1 days.
  const startDate = shiftDayKey(today, -(definition.days - 1));
  return {
    startDate,
    endDate: today,
    dayCount: definition.days,
    preset,
    isPartialPeriod: true,
  };
};

/** Format a day key for display without reinterpreting it as local midnight. */
export const formatDayKey = (dayKey: DayKey, locale = 'hi-IN'): string => {
  if (!isDayKey(dayKey)) return dayKey;
  return new Date(`${dayKey}T00:00:00.000Z`).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

/** Short axis label (e.g. "26 सित॰") for charts. */
export const formatDayKeyShort = (dayKey: DayKey, locale = 'hi-IN'): string => {
  if (!isDayKey(dayKey)) return dayKey;
  return new Date(`${dayKey}T00:00:00.000Z`).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
};

/** `2026-10-01 → 2026-10-07 (7 दिन)` label for the active window. */
export const formatRangeLabel = (startDate: DayKey, endDate: DayKey, locale = 'hi-IN'): string => {
  const days = inclusiveDayCount(startDate, endDate);
  if (startDate === endDate) return formatDayKey(startDate, locale);
  return `${formatDayKey(startDate, locale)} → ${formatDayKey(endDate, locale)} · ${days} दिन`;
};