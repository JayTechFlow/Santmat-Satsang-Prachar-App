/**
 * ANALYTICS QUERY LAYER (Cloud Functions surface)
 *
 * Read side of /admin/reports. Every exported callable here is admin-gated and
 * delegates its metric semantics to analytics_contract.ts.
 *
 * What this file fixes relative to the previous implementation:
 *  - `getAnalyticsSummary` used `.limit(N)` with no cursor, so "pagination" was
 *    impossible and the caller could silently truncate a range.
 *  - It returned `topCategory: "general"` — a hardcoded fallback presented as a
 *    real top category. It is now `null` when there is no evidence.
 *  - It wrapped failures in `HttpsError("internal", error.message)`, leaking
 *    Firestore internals to the browser console.
 *  - It had no comparison window, so no honest period-over-period delta existed.
 *  - It ignored per-day coverage, rendering uncollected days as real zeros.
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { requireAdmin, requireAuth, logger, db } from "./utils";
import {
  ANALYTICS_COLLECTIONS,
  ANALYTICS_TIMEZONE,
  AnalyticsCoverage,
  AnalyticsOverview,
  AnalyticsSummaryPayload,
  DailyAnalyticsRecord,
  DayKey,
  MAX_RANGE_DAYS,
  dayWindow,
  enumerateDayKeys,
  isDayKey,
  validateRange,
} from "./analytics_contract";
import {
  aggregateDay,
  aggregateRange,
  backfillLimits,
  EMPTY_COVERAGE,
  refreshOverview,
  runScheduledAggregation,
} from "./analytics_aggregation";
import { analyticsIngestionConfig } from "./analytics_ingest";

export {
  ANALYTICS_COLLECTIONS,
  ANALYTICS_TIMEZONE,
  METRIC_DEFINITIONS,
  MIN_PLAY_LISTENED_SECONDS,
  ACTIVE_USER_HEARTBEAT_MINUTES,
} from "./analytics_contract";

// ───────────────────────────────────────────────────────────────────────────
// Scheduled aggregation
// ───────────────────────────────────────────────────────────────────────────

/**
 * Keeps Today fresh and finalises Yesterday.
 *
 * The previous job ran once at 00:00 UTC for Yesterday only, which meant Today
 * never existed in the database and the Reports page was always at least a day
 * stale. This runs hourly so an in-progress day is visible as an explicit
 * partial day.
 */
export const aggregateDailyAnalyticsScheduled = functions.pubsub
  .schedule("every 1 hours")
  .onRun(async () => {
    logger.info("Starting scheduled analytics aggregation");
    const result = await runScheduledAggregation();
    logger.info("Scheduled aggregation complete", result);
  });

// ───────────────────────────────────────────────────────────────────────────
// Query helpers
// ───────────────────────────────────────────────────────────────────────────

const DEFAULT_PAGE_SIZE = 31;
const MAX_PAGE_SIZE = 200;

/** Cover-merge of per-day coverage. A series is only comparable when every day agrees. */
const mergeCoverage = (records: Array<{ coverage?: AnalyticsCoverage }>): AnalyticsCoverage => {
  const out: AnalyticsCoverage = {
    registrations: true,
    plays: true,
    playtime: true,
    activeUsers: true,
    libraryActivity: true,
  };
  const keys: Array<keyof AnalyticsCoverage> = [
    "registrations",
    "plays",
    "playtime",
    "activeUsers",
    "libraryActivity",
  ];
  for (const record of records) {
    const rowCoverage = record?.coverage;
    for (const key of keys) {
      // A legacy row written before coverage existed carries no flags. Treating
      // that as "unavailable" would hide registrations, which are authoritative
      // for the product's whole lifetime, so fall back to the safe default.
      const resolved = rowCoverage === undefined ? EMPTY_COVERAGE[key] : rowCoverage[key];
      if (resolved !== true) out[key] = false;
    }
  }
  return out;
};

const sumField = (records: DailyAnalyticsRecord[], field: keyof DailyAnalyticsRecord): number =>
  records.reduce((total, record) => {
    const value = record[field];
    return typeof value === "number" ? total + value : total;
  }, 0);

/**
 * Server-side filter applied to the returned rows.
 * Filtering happens after the range query but before paging maths, so
 * `totalRows` reflects the filtered set.
 */
interface RowFilter {
  minPlays?: number;
  minPlaytimeSeconds?: number;
  minActiveUsers?: number;
  category?: string;
  onlyPartial?: boolean;
}

const applyRowFilter = (record: DailyAnalyticsRecord, filter: RowFilter): boolean => {
  if (filter.minPlays !== undefined && record.totalPlays < filter.minPlays) return false;
  if (filter.minPlaytimeSeconds !== undefined && record.totalListenDurationSeconds < filter.minPlaytimeSeconds) {
    return false;
  }
  if (filter.minActiveUsers !== undefined && record.uniqueActiveUsers < filter.minActiveUsers) return false;
  if (filter.category && record.topCategory !== filter.category) return false;
  if (filter.onlyPartial !== undefined && Boolean((record as { isPartial?: boolean }).isPartial) !== filter.onlyPartial) {
    return false;
  }
  return true;
};

/**
 * Encode a day key as an opaque cursor.
 * The cursor is the last day key the client has seen. Using the day key rather
 * than an offset means paging stays correct even when a day is re-aggregated
 * or inserted between requests.
 */
const encodeCursor = (dateKey: DayKey): string => Buffer.from(dateKey, "utf8").toString("base64url");

const decodeCursor = (cursor: unknown): DayKey | null => {
  if (typeof cursor !== "string" || !cursor) return null;
  try {
    const decoded = Buffer.from(cursor, "base64url").toString("utf8");
    return isDayKey(decoded) ? decoded : null;
  } catch {
    return null;
  }
};

const toFiniteInt = (value: unknown, fallback: number, min: number, max: number): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.trunc(parsed), min), max);
};

const EMPTY_OVERVIEW: AnalyticsOverview = {
  lastUpdatedDate: null,
  latestDailyPlays: null,
  latestDau: null,
  activeUserSemantics: "unavailable",
};

/** Read one inclusive day range of aggregated records, ascending by date. */
const readRange = async (
  startDate: DayKey,
  endDate: DayKey,
  cap = MAX_RANGE_DAYS
): Promise<DailyAnalyticsRecord[]> => {
  const snap = await db
    .collection(ANALYTICS_COLLECTIONS.daily)
    .where("date", ">=", startDate)
    .where("date", "<=", endDate)
    .orderBy("date", "asc")
    .limit(cap)
    .get();

  return snap.docs.map((doc) => doc.data() as DailyAnalyticsRecord);
};

// ───────────────────────────────────────────────────────────────────────────
// Public callables
// ───────────────────────────────────────────────────────────────────────────

/**
 * Paginated, filterable analytics summary for the Admin Reports centre.
 *
 * Contract:
 *  - `startDate` / `endDate` are inclusive UTC day keys (YYYY-MM-DD).
 *  - `pageSize`  1..200, default 31.
 *  - `cursor`     opaque token from a previous response's `nextCursor`.
 *  - Sorting is newest-first and deterministic (day key descending).
 *  - `includeComparison` returns the immediately preceding window of identical
 *    length so the UI can show real deltas.
 */
export const getAnalyticsSummary = functions.https.onCall(async (data, context) => {
  requireAdmin(context);

  const request = (data ?? {}) as Record<string, unknown>;

  const pageSize = toFiniteInt(request.pageSize ?? request.limit, DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
  const cursorDay = decodeCursor(request.cursor);
  // Offset pagination complements the cursor: the Admin UI needs
  // jump-to-page, while the cursor keeps deep paging stable while new days are
  // still being written. Both are resolved server-side; the client never
  // paginates by slicing a fully-downloaded array.
  const offset = Math.max(toFiniteInt(request.offset, 0, 0, 100_000), 0);

  let range: ReturnType<typeof validateRange>;
  try {
    range = validateRange(request.startDate, request.endDate);
  } catch (error) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      error instanceof RangeError ? error.message : "Invalid date range supplied."
    );
  }

  const filter: RowFilter = {};
  if (request.minPlays !== undefined) filter.minPlays = toFiniteInt(request.minPlays, 0, 0, 1e12);
  if (request.minPlaytimeSeconds !== undefined) {
    filter.minPlaytimeSeconds = toFiniteInt(request.minPlaytimeSeconds, 0, 0, 1e12);
  }
  if (request.minActiveUsers !== undefined) {
    filter.minActiveUsers = toFiniteInt(request.minActiveUsers, 0, 0, 1e12);
  }
  if (typeof request.category === "string" && request.category.trim()) {
    filter.category = request.category.trim().slice(0, 64);
  }
  if (request.onlyPartial !== undefined) filter.onlyPartial = request.onlyPartial === true;

  const sortOrder = request.sortOrder === "asc" ? "asc" : "desc";

  try {
    const [records, comparisonRecords, overviewSnap] = await Promise.all([
      readRange(range.startDate, range.endDate),
      readRange(range.comparison.startDate, range.comparison.endDate),
      db.collection(ANALYTICS_COLLECTIONS.summary).doc("overview").get(),
    ]);

    const filtered = records.filter((record) => applyRowFilter(record, filter));

    // A cursor narrows the set to rows strictly older than the cursor day,
    // which is what makes paging stable while new days are being written.
    const afterCursor = cursorDay
      ? filtered.filter((record) => (sortOrder === "desc" ? record.date < cursorDay : record.date > cursorDay))
      : filtered;

    const ordered = [...afterCursor].sort((a, b) =>
      sortOrder === "desc" ? (a.date < b.date ? 1 : a.date > b.date ? -1 : 0) : a.date > b.date ? 1 : -1
    );

    const pageRows = ordered.slice(offset, offset + pageSize);
    const hasMore = ordered.length > offset + pageSize;
    const lastRow = pageRows[pageRows.length - 1];

    // Period totals are computed here, server-side, over the WHOLE filtered
    // range rather than the current page. The UI must not re-derive these from
    // the rows it happens to have loaded, or a paginated range would silently
    // report only the visible slice.
    const rangeCoverage = mergeCoverage(filtered);

    const payload: AnalyticsSummaryPayload = {
      range: {
        startDate: range.startDate,
        endDate: range.endDate,
        dayCount: range.dayCount,
        timezone: ANALYTICS_TIMEZONE,
      },
      daily: pageRows,
      current: {
        newRegistrations: sumField(filtered, "newRegistrations"),
        totalPlays: sumField(filtered, "totalPlays"),
        totalListenDurationSeconds: sumField(filtered, "totalListenDurationSeconds"),
        uniqueActiveUsers: sumField(filtered, "uniqueActiveUsers"),
        distinctTracksPlayed: sumField(filtered, "distinctTracksPlayed"),
        libraryActiveUsers: sumField(filtered, "libraryActiveUsers"),
        totalInteractions: sumField(filtered, "totalInteractions"),
        coverage: rangeCoverage,
      },
      overview: overviewSnap.exists ? ({ ...EMPTY_OVERVIEW, ...overviewSnap.data() } as AnalyticsOverview) : EMPTY_OVERVIEW,
      comparison:
        request.includeComparison === false
          ? null
          : {
              startDate: range.comparison.startDate,
              endDate: range.comparison.endDate,
              newRegistrations: sumField(comparisonRecords, "newRegistrations"),
              totalPlays: sumField(comparisonRecords, "totalPlays"),
              totalListenDurationSeconds: sumField(comparisonRecords, "totalListenDurationSeconds"),
              uniqueActiveUsers: sumField(comparisonRecords, "uniqueActiveUsers"),
              distinctTracksPlayed: sumField(comparisonRecords, "distinctTracksPlayed"),
              coverage: mergeCoverage(comparisonRecords),
            },
      nextCursor: hasMore && lastRow ? encodeCursor(lastRow.date) : null,
      totalRows: filtered.length,
      page: {
        size: pageSize,
        offset,
        returned: pageRows.length,
        hasMore,
        totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
      },
    };

    return { status: "success", data: payload };
  } catch (error: unknown) {
    logger.error("getAnalyticsSummary failed", error);
    throw new functions.https.HttpsError("internal", "Analytics are temporarily unavailable.");
  }
});

/**
 * Contract metadata for the Admin client: metric definitions, ingestion
 * configuration and the declared timezone.
 *
 * Serving this from the backend means the UI can never drift from the server's
 * thresholds — for example it always labels active users with the same
 * heartbeat window the aggregation actually used.
 */
export const getAnalyticsContract = functions.https.onCall(async (_data, context) => {
  requireAdmin(context);
  const { METRIC_DEFINITIONS, MIN_PLAY_LISTENED_SECONDS, ACTIVE_USER_HEARTBEAT_MINUTES } =
    await import("./analytics_contract");

  return {
    status: "success",
    data: {
      timezone: ANALYTICS_TIMEZONE,
      maxRangeDays: MAX_RANGE_DAYS,
      maxPageSize: MAX_PAGE_SIZE,
      defaultPageSize: DEFAULT_PAGE_SIZE,
      metricDefinitions: METRIC_DEFINITIONS,
      ingestion: analyticsIngestionConfig,
      thresholds: {
        minPlayListenedSeconds: MIN_PLAY_LISTENED_SECONDS,
        activeUserHeartbeatMinutes: ACTIVE_USER_HEARTBEAT_MINUTES,
      },
    },
  };
});

/**
 * Admin-triggered aggregation for a specific day or inclusive range.
 * Kept separate from the read path so a heavy backfill never blocks the UI.
 */
export const triggerDailyAnalyticsAggregation = functions.https.onCall(async (data, context) => {
  requireAdmin(context);

  const request = (data ?? {}) as Record<string, unknown>;
  const single = typeof request.date === "string" ? request.date : null;
  const start = typeof request.startDate === "string" ? request.startDate : null;
  const end = typeof request.endDate === "string" ? request.endDate : null;

  try {
    if (single) {
      if (!isDayKey(single)) {
        throw new functions.https.HttpsError("invalid-argument", "date must be a YYYY-MM-DD day key.");
      }
      const record = await aggregateDay(single);
      await refreshOverview(dayWindow(single));
      return { status: "success", data: { daysProcessed: 1, from: single, to: single, record } };
    }

    const range = validateRange(start ?? request.date, end ?? request.date);
    if (range.dayCount > backfillLimits.MAX_DAY_BACKFILL_DAYS) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        `Range of ${range.dayCount} days exceeds the ${backfillLimits.MAX_DAY_BACKFILL_DAYS}-day backfill limit.`
      );
    }
    const result = await aggregateRange(range.startDate, range.endDate);
    return { status: "success", data: result };
  } catch (error: unknown) {
    if (error instanceof functions.https.HttpsError) throw error;
    logger.error("triggerDailyAnalyticsAggregation failed", error);
    throw new functions.https.HttpsError("internal", "Aggregation failed.");
  }
});

/**
 * Backfill the historical series from sources that genuinely existed at the
 * time. Only real collections are read; days where a metric had no collection
 * are marked uncovered rather than filled with zeros.
 */
export const backfillAnalyticsHistory = functions.https.onCall(async (data, context) => {
  requireAdmin(context);

  const request = (data ?? {}) as Record<string, unknown>;
  const start = typeof request.startDate === "string" ? request.startDate : null;
  const end = typeof request.endDate === "string" ? request.endDate : null;

  try {
    const range = validateRange(start, end);
    const days = enumerateDayKeys(range.startDate, range.endDate);
    if (days.length > backfillLimits.MAX_DAY_BACKFILL_DAYS) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        `Backfill of ${days.length} days exceeds the ${backfillLimits.MAX_DAY_BACKFILL_DAYS}-day limit.`
      );
    }

    const results = [];
    for (const dayKey of days) {
      results.push(await aggregateDay(dayKey));
    }
    await refreshOverview(dayWindow(range.endDate));

    return {
      status: "success",
      data: {
        daysProcessed: results.length,
        from: range.startDate,
        to: range.endDate,
        daysWithPlayCoverage: results.filter((r) => r.coverage.plays).length,
        daysWithLibraryActivity: results.filter((r) => r.distinctTracksPlayed > 0).length,
      },
    };
  } catch (error: unknown) {
    if (error instanceof functions.https.HttpsError) throw error;
    logger.error("backfillAnalyticsHistory failed", error);
    throw new functions.https.HttpsError("internal", "Backfill failed.");
  }
});

/**
 * Legacy telemetry sink retained for backwards compatibility.
 *
 * NOTE: this collection was never wired to any client, which is why Reports
 * previously showed structural zeros. It is no longer part of the Reports
 * contract; writes land in `telemetry_events` for legacy/debug use only and are
 * deliberately NOT read by the aggregation engine.
 */
export const logAnalyticsEvent = functions.https.onCall(async (data, context) => {
  requireAuth(context);

  const eventName = typeof (data as any)?.eventName === "string" ? (data as any).eventName.trim() : "";
  if (!eventName) {
    throw new functions.https.HttpsError("invalid-argument", "eventName is required.");
  }

  const uid = context.auth!.uid;
  const category = typeof (data as any)?.category === "string" ? (data as any).category.slice(0, 64) : "general";
  const durationRaw = Number((data as any)?.durationSeconds);
  const durationSeconds = Number.isFinite(durationRaw) && durationRaw > 0 ? Math.min(Math.round(durationRaw), 6 * 60 * 60) : 0;

  try {
    await db.collection("telemetry_events").add({
      uid,
      eventName: eventName.slice(0, 128),
      category,
      durationSeconds,
      metadata: {},
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { status: "success", data: { logged: true, eventName } };
  } catch (error: unknown) {
    logger.error(`Failed to log analytics event '${eventName}'`, error);
    throw new functions.https.HttpsError("internal", "Could not log analytics event.");
  }
});

/** Re-exported so `index.ts` keeps a single analytics namespace. */
export { recordPlaybackSession, touchActiveUser, analyticsIngestionConfig } from "./analytics_ingest";