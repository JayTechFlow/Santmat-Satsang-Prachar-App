/**
 * Dashboard timeline presets and the server-imposed window ceiling.
 *
 * Kept free of React and Firebase so it can be reasoned about — and tested —
 * without mounting the dashboard.
 */

export type TimelineRange = '7d' | '30d' | '180d' | '1y' | '2y' | '5y' | 'lifetime';

/**
 * Hard ceiling enforced by `getAnalyticsSummary`. Anything longer is rejected
 * with invalid-argument, so presets must be clamped rather than sent as-is.
 */
export const MAX_ANALYTICS_RANGE_DAYS = 400;

export const RANGE_LABELS: Record<TimelineRange, string> = {
  '7d': 'पिछले 7 दिन (Last 7 Days)',
  '30d': 'पिछले 30 दिन (Last 30 Days)',
  '180d': 'पिछले 180 दिन / 6 माह (Last 180 Days)',
  '1y': 'विगत 1 वर्ष (Last 1 Year)',
  '2y': 'विगत 2 वर्ष (Last 2 Years)',
  '5y': 'विगत 5 वर्ष (Last 5 Years)',
  'lifetime': 'सर्वकालिक / आजीवन (Lifetime Historical Archive)',
};

/** Requested window per preset; `null` means unbounded. */
export const RANGE_DAYS: Record<TimelineRange, number | null> = {
  '7d': 7,
  '30d': 30,
  '180d': 180,
  '1y': 365,
  '2y': 730,
  '5y': 1825,
  'lifetime': null,
};

/** The window actually requested for a preset, after clamping. */
export const effectiveRangeDays = (range: TimelineRange): number =>
  Math.min(RANGE_DAYS[range] ?? MAX_ANALYTICS_RANGE_DAYS, MAX_ANALYTICS_RANGE_DAYS);

/**
 * Label for a preset. Presets longer than the server limit are annotated so an
 * operator is never told "Last 2 Years" while looking at 400 days.
 */
export const timelineLabel = (range: TimelineRange): string => {
  const base = RANGE_LABELS[range];
  const requested = RANGE_DAYS[range];
  if (requested !== null && requested > MAX_ANALYTICS_RANGE_DAYS) {
    return `${base} — अधिकतम ${MAX_ANALYTICS_RANGE_DAYS} दिन दिखाए जा रहे हैं`;
  }
  if (requested === null) {
    return `${base} — अधिकतम ${MAX_ANALYTICS_RANGE_DAYS} दिन`;
  }
  return base;
};