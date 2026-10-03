/**
 * Formatting helpers for analytics surfaces.
 *
 * These previously lived as inline functions duplicated inside AdminReports and
 * AdminDashboard, which produced two different renderings of the same metric.
 * Delta formatting in particular must be defined once: a comparison period that
 * is unavailable has to render as "—" rather than as a fabricated 0% change.
 */

const numberFormatter = new Intl.NumberFormat('en-IN');
export const formatIndian = (value: number): string => numberFormatter.format(Math.round(value ?? 0));

/** Compact duration: "3 घंटे 12 मिनट", "45 मिनट", "30 सेकंड". */
export const formatDuration = (seconds: number): string => {
  const total = Math.max(0, Math.round(seconds ?? 0));
  if (total < 60) return `${total} सेकंड`;

  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);

  if (hours <= 0) return `${minutes} मिनट`;
  return `${hours} घंटे${minutes > 0 ? ` ${minutes} मिनट` : ''}`;
};

/** Hours with one decimal, for dense chart axes. */
export const formatHoursCompact = (seconds: number): string => {
  const hours = (Math.max(0, seconds ?? 0)) / 3600;
  if (hours >= 100) return `${Math.round(hours)}h`;
  if (hours >= 10) return `${hours.toFixed(1)}h`;
  return `${hours.toFixed(2)}h`;
};

export interface DeltaResult {
  /** Absolute change; null when it cannot be computed honestly. */
  absolute: number | null;
  /** Percentage change; null when the baseline is zero or unavailable. */
  percent: number | null;
  direction: 'up' | 'down' | 'flat' | 'unknown';
  /** Whether the comparison is meaningful enough to render at all. */
  isComparable: boolean;
  /** Short reason the delta is unavailable, for a tooltip. */
  reason?: string;
}

/**
 * Period-over-period delta.
 *
 * `comparable === false` means the current period has no trustworthy source for
 * this metric, or the comparison window has no data. In that case the UI must
 * render an explicit unavailable marker, never a percentage — a "+0%" against an
 * uncollected baseline is a lie that reads like a real measurement.
 */
export const computeDelta = (current: number, previous: number | undefined | null, comparable = true): DeltaResult => {
  if (!comparable) {
    return { absolute: null, percent: null, direction: 'unknown', isComparable: false, reason: 'तुलना के लिए डेटा अपूर्ण' };
  }
  if (previous === undefined || previous === null || !Number.isFinite(previous)) {
    return { absolute: null, percent: null, direction: 'unknown', isComparable: false, reason: 'तुलनात्मक अवधि का डेटा नहीं' };
  }

  const absolute = (current ?? 0) - previous;
  if (previous === 0) {
    // Growth from a zero baseline is unbounded; report the absolute change only.
    return {
      absolute,
      percent: null,
      direction: absolute === 0 ? 'flat' : absolute > 0 ? 'up' : 'down',
      isComparable: true,
      reason: absolute === 0 ? undefined : 'पिछली अवधि शून्य था',
    };
  }

  const percent = (absolute / Math.abs(previous)) * 100;
  return {
    absolute,
    percent,
    direction: absolute === 0 ? 'flat' : absolute > 0 ? 'up' : 'down',
    isComparable: true,
  };
};

/** "+12.4%" / "−8%" / "—" depending on comparability. */
export const formatDeltaPercent = (delta: DeltaResult): string => {
  if (!delta.isComparable || delta.percent === null) return '—';
  const magnitude = Math.abs(delta.percent);
  // Sign is applied explicitly below, so the magnitude must be formatted
  // without a sign of its own.
  const rounded = magnitude >= 100 ? Math.round(magnitude) : Math.round(magnitude * 10) / 10;
  if (delta.direction === 'flat') return '0%';
  return `${delta.direction === 'up' ? '+' : '−'}${rounded}%`;
};

/** Signed absolute change, e.g. "+1,204". */
export const formatDeltaAbsolute = (delta: DeltaResult, formatter: (n: number) => string = formatIndian): string => {
  if (!delta.isComparable || delta.absolute === null) return '—';
  if (delta.absolute === 0) return '0';
  return `${delta.absolute > 0 ? '+' : '−'}${formatter(Math.abs(delta.absolute))}`;
};

/** Tailwind classes for a delta chip, direction-aware. */
export const deltaToneClasses = (direction: DeltaResult['direction']): string => {
  switch (direction) {
    case 'up':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'down':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'flat':
      return 'bg-stone-100 text-stone-600 border-stone-200';
    default:
      return 'bg-stone-50 text-stone-400 border-stone-200';
  }
};

/**
 * A short "last refreshed" string from a Firestore-style timestamp.
 * Returns null for unknown/absent values instead of inventing a time.
 */
export const formatRelativeRefresh = (updatedAt: unknown, now: Date = new Date()): string | null => {
  if (!updatedAt) return null;

  let ms: number | null = null;
  const candidate = updatedAt as { toMillis?: () => number; seconds?: number; _seconds?: number };
  if (typeof candidate?.toMillis === 'function') ms = candidate.toMillis();
  else if (typeof candidate?.seconds === 'number') ms = candidate.seconds * 1000;
  else if (typeof candidate?._seconds === 'number') ms = candidate._seconds * 1000;
  else if (updatedAt instanceof Date) ms = updatedAt.getTime();

  if (ms === null || !Number.isFinite(ms)) return null;

  const deltaSeconds = Math.round((now.getTime() - ms) / 1000);
  if (deltaSeconds < 0) return 'अभी';
  if (deltaSeconds < 60) return 'अभी';
  if (deltaSeconds < 3600) return `${Math.floor(deltaSeconds / 60)} मिनट पहले`;
  if (deltaSeconds < 86_400) return `${Math.floor(deltaSeconds / 3600)} घंटे पहले`;
  return `${Math.floor(deltaSeconds / 86_400)} दिन पहले`;
};