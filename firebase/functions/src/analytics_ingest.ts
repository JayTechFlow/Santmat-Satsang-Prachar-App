/**
 * ANALYTICS INGESTION — the write side of the Reports contract.
 *
 * Prior to this module the only analytics sink was Google Analytics 4, which
 * Firestore cannot read, so every Reports metric had no queryable source. These
 * callables create an auditable, reconcilable Firestore-backed event stream.
 *
 * Security invariants (all enforced server-side, never trusted from payload):
 *  - `uid` is always taken from `context.auth`, so a client can never attribute
 *    listening activity to another user.
 *  - `role` / `accountStatus` escalation is impossible: the payload's identity
 *    fields are ignored entirely.
 *  - A client can only ever write its own heartbeat and its own events.
 *  - Server timestamps are used for ingestion time; client `startedAt` is only
 *    used for day-bucketing and is sanity-clamped.
 *  - Writes are idempotent on (uid, sessionId), so retries, reconnects and
 *    duplicate delivery cannot inflate play counts.
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { requireAuth, logger, db } from "./utils";
import {
  ANALYTICS_COLLECTIONS,
  ACTIVE_USER_HEARTBEAT_MINUTES,
  playbackEventDocId,
  toDayKey,
  validatePlaybackEvent,
} from "./analytics_contract";

/** Reject implausible clocks rather than creating far-future buckets. */
const MAX_CLOCK_SKEW_MS = 6 * 60 * 60 * 1000;

/**
 * Report a completed playback session.
 *
 * Called by the client when a session ends — pause, seek-away, completion,
 * backgrounding, or app teardown — with the number of seconds actually heard.
 */
export const recordPlaybackSession = functions.https.onCall(async (data, context) => {
  requireAuth(context);
  const uid = context.auth!.uid;

  const validated = validatePlaybackEvent(data);
  if (!validated.ok) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      `Playback event rejected: invalid or missing '${validated.field}'.`
    );
  }

  const event = validated.value;
  const nowMs = Date.now();

  // Day bucket derived from the client start time, clamped so a wrong device
  // clock cannot create orphan days in the aggregation layer.
  const clampedStartMs = Math.min(Math.max(event.startedAt, nowMs - 7 * 86_400_000), nowMs + MAX_CLOCK_SKEW_MS);
  const dayKey = toDayKey(clampedStartMs);

  try {
    await db
      .collection(ANALYTICS_COLLECTIONS.playbackEvents)
      .doc(playbackEventDocId(uid, event.sessionId))
      .set(
        {
          uid,
          sessionId: event.sessionId,
          contentId: event.contentId,
          contentType: event.contentType,
          category: event.category ?? null,
          startedAt: clampedStartMs,
          startedAtDate: dayKey,
          listenedSeconds: event.listenedSeconds,
          mediaDurationSeconds: event.mediaDurationSeconds ?? null,
          endPositionSeconds: event.endPositionSeconds ?? null,
          completed: event.completed === true,
          recordedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    // A playback session is itself an activity signal; refresh the heartbeat in
    // the same call so active-user tracking never lags behind real usage.
    await touchHeartbeat(uid);

    return {
      status: "success",
      data: { recorded: true, sessionId: event.sessionId, day: dayKey },
    };
  } catch (error: unknown) {
    logger.error(`Failed to record playback session for uid=${uid}`, error);
    // Deliberately opaque: internals must not leak to a client app.
    throw new functions.https.HttpsError("internal", "Could not record playback session.");
  }
});

/** Minimum gap between heartbeat writes for the same user. */
const HEARTBEAT_THROTTLE_MS = 5 * 60 * 1000;

/**
 * Update `users/{uid}.lastActiveAt`, throttled.
 * This is the source that makes "Active Users" an exact-realtime signal rather
 * than an inference from playback events.
 */
export const touchActiveUser = functions.https.onCall(async (_data, context) => {
  requireAuth(context);
  const uid = context.auth!.uid;

  try {
    await touchHeartbeat(uid);
    return { status: "success", data: { updated: true } };
  } catch (error: unknown) {
    logger.error(`Failed to update activity heartbeat for uid=${uid}`, error);
    throw new functions.https.HttpsError("internal", "Could not update activity heartbeat.");
  }
});

/** Internal throttled heartbeat writer. Exported for reuse by other writers. */
export const touchHeartbeat = async (uid: string): Promise<void> => {
  const userRef = db.collection(ANALYTICS_COLLECTIONS.users).doc(uid);
  const now = admin.firestore.Timestamp.now();

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef);
    const last = snap.exists ? snap.get("lastActiveAt") : null;
    const lastMs = last?.toMillis?.();

    // Skip the write entirely inside the throttle window to avoid hot-doc churn.
    if (typeof lastMs === "number" && Date.now() - lastMs < HEARTBEAT_THROTTLE_MS) {
      return;
    }
    tx.set(userRef, { lastActiveAt: now }, { merge: true });
  });
};

/**
 * Activity window used by the Admin UI to decide whether the active-user tile
 * can be described as near-realtime. Exposed so the client does not hardcode it.
 */
export const analyticsIngestionConfig = {
  activeUserHeartbeatMinutes: ACTIVE_USER_HEARTBEAT_MINUTES,
  heartbeatThrottleMs: HEARTBEAT_THROTTLE_MS,
} as const;