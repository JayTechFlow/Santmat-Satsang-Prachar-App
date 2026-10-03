/**
 * CANONICAL ANALYTICS CONTRACT — single source of truth for Reports.
 *
 * Every metric rendered on /admin/reports is declared here with its exact
 * Firestore source, calculation, timezone semantics and coverage rules.
 * The aggregation engine (analytics_aggregation.ts), the query layer
 * (analytics.ts) and the Admin UI all conform to THIS file. Nothing outside
 * this file is allowed to invent a metric value.
 *
 * ── WHY THIS FILE EXISTS ────────────────────────────────────────────────
 * The previous Reports implementation rendered confident "0" values for
 * metrics whose source collections had no writers at all:
 *   - interaction_logs  → 0 documents ever written  → totalPlays / DAU / interactions
 *   - telemetry_events  → only written by an uncalled callable → playtime / topCategory
 * GA4 events (media_play, media_pause, …) are unreadable from Firestore, so
 * the Admin could never reconcile them. This contract replaces those dead
 * sources with an auditable one and, crucially, records per-day *coverage*
 * so the UI can say "not collected" instead of lying with a zero.
 */

import type * as admin from "firebase-admin";

// ── Timezone & window semantics ────────────────────────────────────────────
// Analytics days are fixed UTC calendar days. Every window is HALF-OPEN:
//   [dayStart, nextDayStart)
// A half-open window is used deliberately: `where("ts", "<=", endOfDay)` relies
// on millisecond-resolution timestamps and silently mis-buckets sub-millisecond
// or client-clock-skewed writes. Half-open windows compose without overlap and
// without gaps.
export const ANALYTICS_TIMEZONE = "UTC" as const;

// ── Playback qualification threshold ───────────────────────────────────────
// A "play" is a playback session that produced at least this many seconds of
// actual listening. Below this, a tap that was instantly skipped, interrupted
// by a call, or abandoned during buffer would inflate the play count.
export const MIN_PLAY_LISTENED_SECONDS = 10;

// Heartbeat window used to classify a user as "active" for a given day.
export const ACTIVE_USER_HEARTBEAT_MINUTES = 30;

// ── Collection names (declared once, referenced everywhere) ────────────────
export const ANALYTICS_COLLECTIONS = {
  /** One document per playback session. The authoritative play + playtime source. */
  playbackEvents: "playback_events",
  /** One document per UTC day, written only by the aggregation engine. */
  daily: "analytics_daily",
  /** Single document "overview" holding cache-free headline numbers. */
  summary: "analytics_summary",
  /** User profiles. Authoritative registration + activity-heartbeat source. */
  users: "users",
  /** Per-user library. Authoritative historical listening-activity evidence. */
  library: "library",
} as const;

// ── Day key helpers ────────────────────────────────────────────────────────

export type DayKey = string; // YYYY-MM-DD

const DAY_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const isDayKey = (value: unknown): value is DayKey =>
  typeof value === "string" && DAY_KEY_PATTERN.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`));

/**
 * Parse a YYYY-MM-DD key into the half-open UTC window it represents.
 * Throws on malformed input so callers surface invalid-argument rather than
 * silently bucketing into the wrong day.
 */
export const dayWindow = (dateKey: DayKey): { start: Date; end: Date } => {
  if (!isDayKey(dateKey)) {
    throw new Error(`Invalid day key: ${String(dateKey)}`);
  }
  const start = new Date(`${dateKey}T00:00:00.000Z`);
  const end = new Date(start.getTime() + 86_400_000);
  return { start, end };
};

/** Convert an instant to its UTC day key. */
export const toDayKey = (instant: Date | number): DayKey =>
  new Date(instant).toISOString().slice(0, 10);

/** Inclusive list of day keys from `from` to `to`. */
export const enumerateDayKeys = (from: DayKey, to: DayKey): DayKey[] => {
  if (!isDayKey(from) || !isDayKey(to)) {
    throw new Error(`Invalid day key range: ${from} .. ${to}`);
  }
  if (from > to) return [];

  const keys: DayKey[] = [];
  let cursor = new Date(`${from}T00:00:00.000Z`).getTime();
  const end = new Date(`${to}T00:00:00.000Z`).getTime();
  while (cursor <= end) {
    keys.push(new Date(cursor).toISOString().slice(0, 10));
    cursor += 86_400_000;
  }
  return keys;
};

/** Number of days in an inclusive day-key range. */
export const countDayKeys = (from: DayKey, to: DayKey): number => enumerateDayKeys(from, to).length;

// ── Document shapes ────────────────────────────────────────────────────────

/**
 * Which metrics have a trustworthy source for a given day.
 *
 * `false` means "this metric was not collectable on this day" and MUST render as
 * an explicit unavailable state — never as 0. This is the mechanism that stops
 * the Reports UI from presenting historical gaps as real zeroes.
 */
export interface AnalyticsCoverage {
  /** users.createdAt — real for all time. */
  registrations: boolean;
  /** playback_events — only real once mobile event collection shipped. */
  plays: boolean;
  /** playback_events.listenedSeconds — only real once event collection shipped. */
  playtime: boolean;
  /** playback_events ∪ users.lastActiveAt — only real once heartbeat shipped. */
  activeUsers: boolean;
  /** users/{uid}/library/*.accessedDate — real for the whole retention window. */
  libraryActivity: boolean;
}

/** One UTC day of analytics. */
export interface DailyAnalyticsRecord {
  date: DayKey;
  newRegistrations: number;
  totalPlays: number;
  totalListenDurationSeconds: number;
  uniqueActiveUsers: number;
  totalInteractions: number;
  /**
   * Distinct (user, track) pairs with library activity on this day, derived from
   * users/{uid}/library/*.accessedDate. This is real historical evidence of
   * listening activity and survives even when playback_events does not exist.
   */
  distinctTracksPlayed: number;
  /** Distinct uids with library activity on this day. Real historical active-user evidence. */
  libraryActiveUsers: number;
  /**
   * Most-played category for the day, or null when no evidence exists.
   * Never defaults to "general": an unknown category is unknown, not general.
   */
  topCategory: string | null;
  coverage: AnalyticsCoverage;
  updatedAt: admin.firestore.FieldValue | Date | number;
}

/** Headline counters mirroring the final day of the selected range. */
export interface AnalyticsOverview {
  lastUpdatedDate: DayKey | null;
  latestDailyPlays: number | null;
  latestDau: number | null;
  /**
   * Whether `latestDau` is exact-realtime (heartbeat present) or a
   * whole-day distinct-user count. The UI renders this distinction verbatim.
   */
  activeUserSemantics: "exact_realtime" | "daily_distinct_users" | "unavailable";
  updatedAt?: admin.firestore.FieldValue | Date | number;
}

/** Payload returned to the Admin client for one page of a date range. */
export interface AnalyticsSummaryPayload {
  range: { startDate: DayKey; endDate: DayKey; dayCount: number; timezone: typeof ANALYTICS_TIMEZONE };
  /** Rows for the requested page, newest first. */
  daily: DailyAnalyticsRecord[];
  /**
   * Totals for the WHOLE filtered range, computed server-side.
   * The client must render these rather than re-reducing the paginated rows,
   * otherwise a paginated range silently reports only the visible slice.
   */
  current: {
    newRegistrations: number;
    totalPlays: number;
    totalListenDurationSeconds: number;
    uniqueActiveUsers: number;
    distinctTracksPlayed: number;
    libraryActiveUsers: number;
    totalInteractions: number;
    coverage: AnalyticsCoverage;
  };
  overview: AnalyticsOverview;
  /**
   * Immediately-preceding window of identical length, used for honest
   * period-over-period deltas. Null when the preceding window is unknown.
   */
  comparison: {
    startDate: DayKey;
    endDate: DayKey;
    newRegistrations: number;
    totalPlays: number;
    totalListenDurationSeconds: number;
    uniqueActiveUsers: number;
    distinctTracksPlayed: number;
    coverage: AnalyticsCoverage;
  } | null;
  /** Opaque cursor for the next page, null when this is the last page. */
  nextCursor: string | null;
  /** Total rows matching the range, independent of the current page. */
  totalRows: number;
  /** Page geometry so the UI can render real pagination. */
  page: {
    size: number;
    offset: number;
    returned: number;
    hasMore: boolean;
    totalPages: number;
  };
}

// ── Playback event ingestion payload ───────────────────────────────────────

/**
 * A single playback session reported by the client.
 *
 * `sessionId` is the idempotency key: retries, app restarts and duplicate
 * delivery collapse into one document, so a flaky network can never inflate
 * the play count.
 */
export interface PlaybackEventInput {
  sessionId: string;
  contentId: string;
  contentType: "audio" | "video" | "book";
  category?: string;
  /** Wall-clock start of the session (client clock). */
  startedAt: number;
  /** Seconds of audio/video actually played, excluding paused time. */
  listenedSeconds: number;
  /** Total media duration in seconds, when known. */
  mediaDurationSeconds?: number;
  /** True when the session reached the end of the media. */
  completed?: boolean;
  /** Listening position at the end of the session. */
  endPositionSeconds?: number;
}

export const PLAYBACK_CONTENT_TYPES = ["audio", "video", "book"] as const;

export const MAX_PLAYBACK_LISTENED_SECONDS = 6 * 60 * 60; // 6h hard cap per session
export const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;
export const CONTENT_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

/**
 * Validate and normalise a client-reported playback event.
 * Returns either a sanitised record or the field that failed, so the callable
 * can answer invalid-argument without echoing user input back.
 */
export const validatePlaybackEvent = (
  input: unknown
): { ok: true; value: PlaybackEventInput } | { ok: false; field: string } => {
  if (!input || typeof input !== "object") return { ok: false, field: "event" };

  const raw = input as Record<string, unknown>;

  const sessionId = typeof raw.sessionId === "string" ? raw.sessionId.trim() : "";
  if (!SESSION_ID_PATTERN.test(sessionId)) return { ok: false, field: "sessionId" };

  const contentId = typeof raw.contentId === "string" ? raw.contentId.trim() : "";
  if (!CONTENT_ID_PATTERN.test(contentId)) return { ok: false, field: "contentId" };

  const contentType = raw.contentType;
  if (typeof contentType !== "string" || !(PLAYBACK_CONTENT_TYPES as readonly string[]).includes(contentType)) {
    return { ok: false, field: "contentType" };
  }

  const startedAt = Number(raw.startedAt);
  if (!Number.isFinite(startedAt) || startedAt <= 0) return { ok: false, field: "startedAt" };

  const listenedRaw = Number(raw.listenedSeconds);
  if (!Number.isFinite(listenedRaw) || listenedRaw < 0) return { ok: false, field: "listenedSeconds" };
  const listenedSeconds = Math.min(Math.round(listenedRaw), MAX_PLAYBACK_LISTENED_SECONDS);

  const category = typeof raw.category === "string" && raw.category.trim() ? raw.category.trim().slice(0, 64) : null;

  const mediaDurationRaw = Number(raw.mediaDurationSeconds);
  const mediaDurationSeconds =
    Number.isFinite(mediaDurationRaw) && mediaDurationRaw > 0 ? Math.min(Math.round(mediaDurationRaw), MAX_PLAYBACK_LISTENED_SECONDS) : null;

  const endPositionRaw = Number(raw.endPositionSeconds);
  const endPositionSeconds =
    Number.isFinite(endPositionRaw) && endPositionRaw >= 0 ? Math.round(endPositionRaw) : null;

  return {
    ok: true,
    value: {
      sessionId,
      contentId,
      contentType: contentType as PlaybackEventInput["contentType"],
      category: category ?? undefined,
      startedAt,
      listenedSeconds,
      mediaDurationSeconds: mediaDurationSeconds ?? undefined,
      completed: raw.completed === true,
      endPositionSeconds: endPositionSeconds ?? undefined,
    },
  };
};

/**
 * A session counts as a play when it produced at least
 * MIN_PLAY_LISTENED_SECONDS of listening. Sub-threshold taps are retained in
 * the collection (they are real interaction evidence for
 * `totalInteractions`) but excluded from the play count.
 */
export const qualifiesAsPlay = (listenedSeconds: number): boolean =>
  Number.isFinite(listenedSeconds) && listenedSeconds >= MIN_PLAY_LISTENED_SECONDS;

/**
 * Deterministic, collision-resistant document id for a playback event.
 * Includes the uid so two users can never overwrite each other, and the
 * sessionId so retries of the same session are idempotent.
 */
export const playbackEventDocId = (uid: string, sessionId: string): string =>
  `${uid}_${sessionId}`.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 140);

// ── Human-readable metric definitions surfaced to the Admin UI ─────────────

export interface MetricDefinition {
  key: keyof DailyAnalyticsRecord;
  label: string;
  /** Exactly how the number is produced. Rendered in the UI "definition" popover. */
  definition: string;
  source: string;
  unit: "count" | "seconds" | "category";
}

export const METRIC_DEFINITIONS: MetricDefinition[] = [
  {
    key: "newRegistrations",
    label: "New Registrations",
    definition:
      "Count of users whose profile document has createdAt inside the day window. Half-open UTC window [day 00:00, next day 00:00).",
    source: "users.createdAt",
    unit: "count",
  },
  {
    key: "totalPlays",
    label: "Total Plays",
    definition:
      `Playback sessions with at least ${MIN_PLAY_LISTENED_SECONDS}s of actual listening. Deduped by (uid, sessionId).`,
    source: "playback_events",
    unit: "count",
  },
  {
    key: "totalListenDurationSeconds",
    label: "Music Playtime",
    definition:
      "Sum of listenedSeconds across playback sessions in the day. Paused time is excluded; each session is capped and clamped client-side.",
    source: "playback_events.listenedSeconds",
    unit: "seconds",
  },
  {
    key: "uniqueActiveUsers",
    label: "Active Users",
    definition:
      `Distinct uids with a qualifying playback session or a heartbeat within ${ACTIVE_USER_HEARTBEAT_MINUTES} minutes in the day.`,
    source: "playback_events ∪ users.lastActiveAt",
    unit: "count",
  },
  {
    key: "distinctTracksPlayed",
    label: "Distinct Tracks Played",
    definition:
      "Distinct (user, track) pairs whose library entry carries an accessedDate inside the day. Retained as the historical listening-activity series.",
    source: "users/{uid}/library/*.accessedDate",
    unit: "count",
  },
  {
    key: "libraryActiveUsers",
    label: "Library Active Users",
    definition: "Distinct uids with at least one library entry accessed inside the day.",
    source: "users/{uid}/library/*.accessedDate",
    unit: "count",
  },
  {
    key: "totalInteractions",
    label: "Playback Sessions",
    definition:
      "All playback sessions reported for the day, including sub-threshold taps. Used for interaction volume, not play volume.",
    source: "playback_events",
    unit: "count",
  },
];

// ── Range validation ───────────────────────────────────────────────────────

export const MAX_RANGE_DAYS = 400;

export interface ValidRange {
  startDate: DayKey;
  endDate: DayKey;
  dayCount: number;
  comparison: { startDate: DayKey; endDate: DayKey };
}

/**
 * Validate a requested date range and derive its comparison window.
 * The comparison window is the immediately preceding window of identical
 * length, which keeps period-over-period deltas deterministic instead of
 * comparing a 30-day period against "all time".
 */
export const validateRange = (startInput: unknown, endInput: unknown, maxDays = MAX_RANGE_DAYS): ValidRange => {
  const endDate = isDayKey(endInput) ? endInput : toDayKey(Date.now());
  const startDate = isDayKey(startInput) ? startInput : endDate;

  if (startDate > endDate) {
    throw new RangeError("startDate must be on or before endDate");
  }

  const dayCount = countDayKeys(startDate, endDate);
  if (dayCount > maxDays) {
    throw new RangeError(`Requested range of ${dayCount} days exceeds the ${maxDays}-day limit`);
  }

  // Preceding window of identical length.
  const comparisonEndMs = new Date(`${startDate}T00:00:00.000Z`).getTime() - 1;
  const comparisonEnd = toDayKey(comparisonEndMs);
  const comparisonStart = toDayKey(new Date(comparisonEndMs).getTime() - (dayCount - 1) * 86_400_000);

  return { startDate, endDate, dayCount, comparison: { startDate: comparisonStart, endDate: comparisonEnd } };
};