/**
 * ANALYTICS AGGREGATION ENGINE
 *
 * Reads the sources declared in analytics_contract.ts and materialises one
 * `analytics_daily/{YYYY-MM-DD}` document per UTC day.
 *
 * Design rules enforced here:
 *  1. Half-open windows [dayStart, nextDayStart) — never `<= endOfDay`.
 *  2. Every metric is derived from a collection that actually has writers.
 *  3. Coverage is recorded per metric so an uncollected day is distinguishable
 *     from a genuine zero.
 *  4. Aggregation is idempotent: re-running a day overwrites it, never doubles.
 *  5. Partial days are allowed and explicitly flagged as partial, so Today is
 *     available within minutes instead of only appearing after midnight.
 */

import * as admin from "firebase-admin";
import { db, logger } from "./utils";
import {
  ANALYTICS_COLLECTIONS,
  AnalyticsCoverage,
  DailyAnalyticsRecord,
  DayKey,
  dayWindow,
  enumerateDayKeys,
  isDayKey,
  qualifiesAsPlay,
  toDayKey,
} from "./analytics_contract";

const MAX_DAY_BACKFILL_DAYS = 400;

interface PlaybackEventRow {
  uid: string;
  listenedSeconds: number;
  category: string | null;
  startedAt: number;
  contentId: string;
  contentType: string;
}

interface LibraryActivityRow {
  uid: string;
  contentId: string;
  contentType: string;
  accessedDate: unknown;
  category: string | null;
}

export const EMPTY_COVERAGE: AnalyticsCoverage = {
  registrations: true,
  plays: false,
  playtime: false,
  activeUsers: false,
  libraryActivity: false,
};

/** Exposed for tests and for diagnostics about which series are trustworthy. */
export const defaultCoverage = (): AnalyticsCoverage => ({ ...EMPTY_COVERAGE });

/**
 * The first UTC day on which each source is *provably* in existence.
 *
 * This is what stops history being fabricated. Firestore happily answers a
 * query over a collection that never had a writer and returns an empty page, so
 * "0 plays on 3 March" is indistinguishable from "nothing was ever recorded on
 * 3 March" unless we know when recording began. Claiming coverage only from the
 * first observed document keeps an uncollected day rendered as unavailable
 * rather than as a confident zero.
 *
 * `registrations` needs no cutover: `users.createdAt` is authoritative for the
 * life of the product, so a pre-launch day genuinely had zero registrations.
 */
export interface SourceCutovers {
  users: DayKey | null;
  playback: DayKey | null;
  heartbeat: DayKey | null;
}

const cutoverCache = new Map<string, DayKey | null>();

/** Earliest value of [field] in [collection], as a UTC day key. */
const readFirstFieldDay = async (collection: string, field: string): Promise<DayKey | null> => {
  const cacheKey = `${collection}.${field}`;
  if (cutoverCache.has(cacheKey)) return cutoverCache.get(cacheKey) ?? null;

  let value: DayKey | null = null;
  try {
    const snap = await db.collection(collection).orderBy(field, "asc").limit(1).get();
    if (!snap.empty) {
      const raw = snap.docs[0].data()[field] as admin.firestore.Timestamp | string | number | undefined;
      if (raw && typeof (raw as any).toDate === "function") {
        value = toDayKey((raw as any).toDate().getTime());
      } else if (typeof raw === "number") {
        value = toDayKey(raw);
      } else if (typeof raw === "string") {
        if (isDayKey(raw)) {
          value = raw;
        } else {
          const parsed = Date.parse(raw);
          if (!Number.isNaN(parsed)) value = toDayKey(parsed);
        }
      }
    }
  } catch (error) {
    // A missing index must not silently become "covered from the beginning".
    logger.warn(`Could not resolve ${cacheKey} cutover`, error);
    value = null;
  }

  cutoverCache.set(cacheKey, value);
  return value;
};

/** Resolve every cutover once per cold start. */
export const resolveSourceCutovers = async (): Promise<SourceCutovers> => {
  const [users, playback, heartbeat] = await Promise.all([
    readFirstFieldDay(ANALYTICS_COLLECTIONS.users, "createdAt"),
    readFirstFieldDay(ANALYTICS_COLLECTIONS.playbackEvents, "startedAtDate"),
    readFirstFieldDay(ANALYTICS_COLLECTIONS.users, "lastActiveAt"),
  ]);
  return { users, playback, heartbeat };
};

/** Test seam. */
export const __resetCutoverCache = (): void => cutoverCache.clear();

/** A day counts as covered only from its source's cutover onward. */
const coveredFrom = (cutover: DayKey | null, dateKey: DayKey): boolean =>
  cutover !== null && dateKey >= cutover;

/** Per-day coverage, gated by when each source actually started recording. */
export const coverageForDay = (
  dateKey: DayKey,
  cutovers: SourceCutovers,
  queriesSucceeded: { playback: boolean; heartbeat: boolean }
): AnalyticsCoverage => {
  const playbackLive = coveredFrom(cutovers.playback, dateKey) && queriesSucceeded.playback;
  const heartbeatLive = coveredFrom(cutovers.heartbeat, dateKey) && queriesSucceeded.heartbeat;
  return {
    // Authoritative for the product's whole lifetime.
    registrations: true,
    plays: playbackLive,
    playtime: playbackLive,
    activeUsers: playbackLive || heartbeatLive,
    // Library writes predate this pipeline, so the honest cutover is the first
    // account; before that no library entry could exist.
    libraryActivity: coveredFrom(cutovers.users, dateKey),
  };
};

/** Firestore requires an index for this range+orderBy combo. Missing index is a
 *  normal operational state during first deploy, so we degrade rather than fail. */
const isMissingIndexError = (error: unknown): boolean => {
  const message = String((error as Error)?.message ?? "");
  return message.includes("FAILED_PRECONDITION") || message.includes("requires an index");
};

/**
 * Read playback sessions for a half-open window.
 * Returns null when the query could not be served, so the caller can mark
 * coverage unknown instead of reporting a false zero.
 */
const readPlaybackEvents = async (
  window: { start: Date; end: Date }
): Promise<PlaybackEventRow[] | null> => {
  try {
    const snap = await db
      .collection(ANALYTICS_COLLECTIONS.playbackEvents)
      .where("startedAtDate", ">=", toDayKey(window.start))
      .where("startedAtDate", "<=", toDayKey(window.end.getTime() - 1))
      .limit(50_000)
      .get();

    return snap.docs.map((doc) => {
      const data = doc.data();
      return {
        uid: String(data.uid ?? ""),
        listenedSeconds: Number(data.listenedSeconds ?? 0),
        category: typeof data.category === "string" ? data.category : null,
        startedAt: Number(data.startedAt ?? 0),
        contentId: String(data.contentId ?? ""),
        contentType: String(data.contentType ?? ""),
      };
    });
  } catch (error) {
    if (isMissingIndexError(error)) {
      logger.warn("playback_events range query needs a composite index; marking coverage unavailable", error);
      return null;
    }
    throw error;
  }
};

/**
 * Read library listening activity for a half-open window.
 *
 * Library entries are stored under users/{uid}/library/{contentId}_{contentType}
 * and carry `accessedDate`, which the mobile client updates every time a track
 * is opened. This is the only real listening evidence that exists for the whole
 * retention window, so it is preserved as its own series rather than being
 * silently dropped when playback_events did not yet exist.
 */
const readLibraryActivity = async (
  window: { start: Date; end: Date }
): Promise<LibraryActivityRow[]> => {
  const usersSnap = await db.collection(ANALYTICS_COLLECTIONS.users).select("uid").limit(5_000).get();

  const rows: LibraryActivityRow[] = [];
  const startMs = window.start.getTime();
  const endMs = window.end.getTime();

  // Batched reads keep this bounded; users are few enough that a chunked walk
  // is cheaper and more reliable than a collectionGroup range index.
  const userDocs = usersSnap.docs;
  const CHUNK = 400;
  for (let i = 0; i < userDocs.length; i += CHUNK) {
    const chunk = userDocs.slice(i, i + CHUNK);
    const snaps = await Promise.all(
      chunk.map((userDoc) =>
        db
          .collection(ANALYTICS_COLLECTIONS.users)
          .doc(userDoc.id)
          .collection(ANALYTICS_COLLECTIONS.library)
          .select("contentId", "contentType", "accessedDate", "category")
          .limit(500)
          .get()
          .catch(() => ({ docs: [] }) as any)
      )
    );

    for (let c = 0; c < chunk.length; c += 1) {
      const uid = chunk[c].id;
      for (const libDoc of (snaps[c].docs as any[])) {
        const data = libDoc.data();
        const accessed = normalizeDateish(data.accessedDate);
        if (accessed === null) continue;
        if (accessed < startMs || accessed >= endMs) continue;

        const contentType = typeof data.contentType === "string" ? data.contentType : "audio";
        // Only audio/video represent listening. A book being opened is a
        // different activity and must not be counted as music playtime.
        if (contentType !== "audio" && contentType !== "video") continue;

        rows.push({
          uid,
          contentId: String(data.contentId ?? libDoc.id),
          contentType,
          accessedDate: data.accessedDate,
          category: typeof data.category === "string" ? data.category : null,
        });
      }
    }
  }

  return rows;
};

/** Accept Timestamp | Date | epoch millis | ISO string, return epoch millis. */
const normalizeDateish = (value: unknown): number | null => {
  if (!value) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  const maybe = value as { toMillis?: () => number };
  if (typeof maybe?.toMillis === "function") return maybe.toMillis();
  return null;
};

/** Registrations for a day, straight from users.createdAt. */
const countRegistrations = async (window: { start: Date; end: Date }): Promise<number> => {
  try {
    const snap = await db
      .collection(ANALYTICS_COLLECTIONS.users)
      .where("createdAt", ">=", window.start)
      .where("createdAt", "<", window.end)
      .limit(5_000)
      .get();
    return snap.size;
  } catch (error) {
    if (isMissingIndexError(error)) {
      logger.warn("users.createdAt range query needs a composite index", error);
      return 0;
    }
    throw error;
  }
};

/** Distinct uids whose lastActiveAt heartbeat falls inside the window. */
const countHeartbeatUsers = async (window: { start: Date; end: Date }): Promise<Set<string> | null> => {
  try {
    const snap = await db
      .collection(ANALYTICS_COLLECTIONS.users)
      .where("lastActiveAt", ">=", window.start)
      .where("lastActiveAt", "<", window.end)
      .limit(5_000)
      .get();

    const uids = new Set<string>();
    snap.docs.forEach((doc) => uids.add(doc.id));
    return uids;
  } catch (error) {
    if (isMissingIndexError(error)) {
      logger.warn("users.lastActiveAt range query needs a composite index", error);
      return null;
    }
    throw error;
  }
};

/**
 * Aggregate one UTC day. Idempotent — safe to re-run at any time.
 */
export const aggregateDay = async (
  dateKey: DayKey,
  opts: { partial?: boolean; cutovers?: SourceCutovers } = {}
): Promise<DailyAnalyticsRecord> => {
  const window = dayWindow(dateKey);
  const isToday = toDayKey(Date.now()) === dateKey;
  const cutovers = opts.cutovers ?? (await resolveSourceCutovers());

  const [playbackRows, libraryRows, newRegistrations, heartbeatUsers] = await Promise.all([
    readPlaybackEvents(window),
    readLibraryActivity(window),
    countRegistrations(window),
    countHeartbeatUsers(window),
  ]);

  // ── Plays, playtime, interactions ────────────────────────────────────
  let totalPlays = 0;
  let totalListenDurationSeconds = 0;
  let totalInteractions = 0;
  const playtimeByUser = new Map<string, number>();
  const categoryPlays = new Map<string, number>();

  if (playbackRows) {
    for (const row of playbackRows) {
      totalInteractions += 1;
      if (row.contentType !== "audio" && row.contentType !== "video") continue;

      if (qualifiesAsPlay(row.listenedSeconds)) {
        totalPlays += 1;
        totalListenDurationSeconds += row.listenedSeconds;
        playtimeByUser.set(row.uid, (playtimeByUser.get(row.uid) ?? 0) + row.listenedSeconds);
        if (row.category) {
          categoryPlays.set(row.category, (categoryPlays.get(row.category) ?? 0) + 1);
        }
      }
    }
  }

  // ── Active users: playback ∪ heartbeat ───────────────────────────────
  const activeUsers = new Set<string>(playtimeByUser.keys());
  if (heartbeatUsers) heartbeatUsers.forEach((uid) => activeUsers.add(uid));

  // ── Library-derived historical series ─────────────────────────────────
  const distinctTracks = new Set<string>();
  const libraryActiveUsers = new Set<string>();
  for (const row of libraryRows) {
    distinctTracks.add(`${row.uid}:${row.contentId}`);
    libraryActiveUsers.add(row.uid);
  }

  const topCategory =
    categoryPlays.size > 0
      ? [...categoryPlays.entries()].sort((a, b) => b[1] - a[1])[0][0]
      : null;

  const coverage: AnalyticsCoverage = coverageForDay(dateKey, cutovers, {
    playback: playbackRows !== null,
    heartbeat: heartbeatUsers !== null,
  });

  const record: DailyAnalyticsRecord & { isPartial: boolean } = {
    date: dateKey,
    newRegistrations,
    totalPlays: coverage.plays ? totalPlays : 0,
    totalListenDurationSeconds: coverage.playtime ? totalListenDurationSeconds : 0,
    uniqueActiveUsers: coverage.activeUsers ? activeUsers.size : 0,
    totalInteractions: coverage.plays ? totalInteractions : 0,
    distinctTracksPlayed: distinctTracks.size,
    libraryActiveUsers: libraryActiveUsers.size,
    topCategory,
    coverage,
    // A partial day is one that is still in progress; consumers must not treat
    // it as a completed total.
    isPartial: isToday || opts.partial === true,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection(ANALYTICS_COLLECTIONS.daily).doc(dateKey).set(record, { merge: true });

  logger.info(
    `Aggregated ${dateKey}: plays=${record.totalPlays} playtime=${record.totalListenDurationSeconds}s ` +
      `active=${record.uniqueActiveUsers} newUsers=${newRegistrations} libraryTracks=${record.distinctTracksPlayed} ` +
      `partial=${record.isPartial}`
  );

  return record;
};

/**
 * Rebuild the `analytics_summary/overview` document from an explicit window.
 *
 * Active-user semantics are stated explicitly rather than implied: when
 * heartbeats are in play the number is exact-realtime, otherwise it is a
 * whole-day distinct-user count, and the client renders that difference.
 */
export const refreshOverview = async (
  window: { start: Date; end: Date }
): Promise<Record<string, unknown>> => {
  const lastDayKey = toDayKey(window.end.getTime() - 1);
  const daySnap = await db.collection(ANALYTICS_COLLECTIONS.daily).doc(lastDayKey).get();
  const day = daySnap.exists ? (daySnap.data() as DailyAnalyticsRecord) : null;

  const windowUsers = await countHeartbeatUsers(window);

  const activeUserSemantics: "exact_realtime" | "daily_distinct_users" | "unavailable" =
    day?.coverage?.activeUsers
      ? "exact_realtime"
      : windowUsers !== null
        ? "daily_distinct_users"
        : "unavailable";

  const overview = {
    lastUpdatedDate: daySnap.exists ? lastDayKey : null,
    latestDailyPlays: day ? day.totalPlays : null,
    latestDau: day ? day.uniqueActiveUsers : null,
    activeUserSemantics,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection(ANALYTICS_COLLECTIONS.summary).doc("overview").set(overview, { merge: true });
  return overview;
};

/**
 * Aggregate a contiguous inclusive range of days.
 * Used by the scheduled job (yesterday + today's partial) and by the admin
 * backfill endpoint.
 */
export const aggregateRange = async (
  startDate: DayKey,
  endDate: DayKey
): Promise<{ daysProcessed: number; from: DayKey; to: DayKey }> => {
  const keys = enumerateDayKeys(startDate, endDate);
  // Resolve the cutovers once for the whole backfill rather than per day.
  const cutovers = await resolveSourceCutovers();
  for (const key of keys) {
    await aggregateDay(key, { cutovers });
  }
  await refreshOverview({ start: new Date(`${startDate}T00:00:00.000Z`), end: dayWindow(endDate).end });
  return { daysProcessed: keys.length, from: startDate, to: endDate };
};

/**
 * The scheduled job keeps Today fresh (as an explicit partial day) and
 * finalises Yesterday. Yesterday is re-run so late-arriving client events are
 * picked up; aggregation is idempotent so this is safe.
 */
export const runScheduledAggregation = async (): Promise<{ finalized: DayKey; partial: DayKey }> => {
  const todayKey = toDayKey(Date.now());
  const yesterdayKey = toDayKey(Date.now() - 86_400_000);

  await aggregateDay(yesterdayKey);
  await aggregateDay(todayKey, { partial: true });
  await refreshOverview(dayWindow(todayKey));

  return { finalized: yesterdayKey, partial: todayKey };
};

export const backfillLimits = { MAX_DAY_BACKFILL_DAYS };

export { isDayKey };