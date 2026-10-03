/**
 * REPORTS ANALYTICS — CONTRACT + AUTHORIZATION TESTS
 *
 * Focus is the behaviour that made the previous Reports page untrustworthy:
 *
 *  1. Day bucketing must be HALF-OPEN ([00:00, next 00:00)) — the old code used
 *     `<= 23:59:59.999Z`, which double-counts a boundary instant and silently
 *     mis-buckets sub-millisecond writes.
 *  2. Range validation must derive a comparison window of IDENTICAL length, and
 *     must reject inverted / oversized ranges with invalid-argument.
 *  3. Playback events must be validated, clamped and idempotency-keyed.
 *  4. Analytics callables must be unreachable without an admin identity, and a
 *     non-admin must never be able to read analytics or forge an event.
 *
 * Runs offline against the compiled functions via firebase-functions-test,
 * consistent with the existing suites in this directory.
 */

import { describe, it, after } from "node:test";
import assert from "node:assert";
import admin from "firebase-admin";

const adminLib = (admin as any)?.default || admin;
if (!(adminLib.apps || []).length) {
  adminLib.initializeApp({ projectId: "demo-test" });
}

import firebaseFunctionsTest from "firebase-functions-test";
import {
  dayWindow,
  enumerateDayKeys,
  countDayKeys,
  toDayKey,
  isDayKey,
  validateRange,
  validatePlaybackEvent,
  qualifiesAsPlay,
  playbackEventDocId,
  MIN_PLAY_LISTENED_SECONDS,
  MAX_RANGE_DAYS,
} from "../lib/analytics_contract.js";
import { coverageForDay } from "../lib/analytics_aggregation.js";
import {
  getAnalyticsSummary,
  getAnalyticsContract,
  recordPlaybackSession,
  touchActiveUser,
  triggerDailyAnalyticsAggregation,
  backfillAnalyticsHistory,
} from "../lib/analytics.js";

const testEnv = firebaseFunctionsTest({ projectId: "demo-test" });

const ctx = {
  none: {} as any,
  mobileUser: { auth: { uid: "user_1", token: { role: "mobile_user", accountStatus: "active" } } } as any,
  suspendedAdmin: {
    auth: { uid: "admin_susp", token: { role: "client_super_admin", accountStatus: "suspended" } },
  } as any,
  clientAdmin: {
    auth: { uid: "admin_1", token: { role: "client_super_admin", accountStatus: "active" } },
  } as any,
  devAdmin: {
    auth: { uid: "dev_admin_1", token: { role: "developer_super_admin", accountStatus: "active" } },
  } as any,
};

const assertRejects = async (promise: Promise<unknown>, expected: string, label: string): Promise<void> => {
  try {
    await promise;
    assert.fail(`${label}: expected rejection with ${expected}, but it resolved`);
  } catch (error: any) {
    assert.ok(
      String(error?.code ?? "").includes(expected),
      `${label}: expected code to include "${expected}", got "${error?.code}" (${error?.message})`
    );
  }
};

after(() => {
  testEnv.cleanup();
});

// ───────────────────────────────────────────────────────────────────────────
// 1. Half-open day windows
// ───────────────────────────────────────────────────────────────────────────

describe("analytics day windows are half-open", () => {
  it("starts the window exactly at UTC midnight", () => {
    const { start } = dayWindow("2026-10-01");
    assert.strictEqual(start.toISOString(), "2026-10-01T00:00:00.000Z");
  });

  it("ends at the NEXT midnight, not 23:59:59.999", () => {
    const { end } = dayWindow("2026-10-01");
    // The regression this guards: the old engine used `T23:59:59.999Z` with a
    // `<=` comparison, which overlaps the following day's first millisecond.
    assert.strictEqual(end.toISOString(), "2026-10-02T00:00:00.000Z");
  });

  it("produces adjacent, non-overlapping windows across a day boundary", () => {
    const day1 = dayWindow("2026-10-01");
    const day2 = dayWindow("2026-10-02");
    assert.strictEqual(day1.end.getTime(), day2.start.getTime());
  });

  it("spans exactly 24 hours including across a month boundary", () => {
    const { start, end } = dayWindow("2026-03-31");
    assert.strictEqual(end.getTime() - start.getTime(), 86_400_000);
    assert.strictEqual(end.toISOString(), "2026-04-01T00:00:00.000Z");
  });

  it("rejects a malformed day key instead of silently bucketing", () => {
    assert.throws(() => dayWindow("01-10-2026" as any));
    assert.throws(() => dayWindow("not-a-date" as any));
  });

  it("maps an instant to its UTC day key", () => {
    assert.strictEqual(toDayKey(Date.parse("2026-10-02T23:59:59.999Z")), "2026-10-02");
    assert.strictEqual(toDayKey(Date.parse("2026-10-03T00:00:00.000Z")), "2026-10-03");
  });

  it("recognises only well-formed day keys", () => {
    assert.strictEqual(isDayKey("2026-10-01"), true);
    assert.strictEqual(isDayKey("2026-13-01"), false);
    assert.strictEqual(isDayKey("2026-10-01T00:00:00Z"), false);
    assert.strictEqual(isDayKey(20261001), false);
  });
});

describe("day enumeration", () => {
  it("counts an inclusive range correctly", () => {
    assert.strictEqual(countDayKeys("2026-10-01", "2026-10-01"), 1);
    assert.strictEqual(countDayKeys("2026-10-01", "2026-10-07"), 7);
    assert.strictEqual(countDayKeys("2026-10-01", "2026-10-31"), 31);
  });

  it("enumerates exactly the days in the range", () => {
    const keys = enumerateDayKeys("2026-12-30", "2027-01-02");
    assert.deepStrictEqual(keys, ["2026-12-30", "2026-12-31", "2027-01-01", "2027-01-02"]);
  });

  it("returns an empty list for an inverted range", () => {
    assert.deepStrictEqual(enumerateDayKeys("2026-10-07", "2026-10-01"), []);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 2. Range validation + deterministic comparison window
// ───────────────────────────────────────────────────────────────────────────

describe("range validation", () => {
  it("treats both endpoints as inclusive", () => {
    const range = validateRange("2026-10-01", "2026-10-07");
    assert.strictEqual(range.dayCount, 7);
  });

  it("derives a comparison window of identical length immediately before", () => {
    const range = validateRange("2026-10-08", "2026-10-14");
    assert.strictEqual(range.comparison.startDate, "2026-10-01");
    assert.strictEqual(range.comparison.endDate, "2026-10-07");
    assert.strictEqual(countDayKeys(range.comparison.startDate, range.comparison.endDate), 7);
  });

  it("does not overlap the current window", () => {
    const range = validateRange("2026-10-08", "2026-10-14");
    assert.ok(range.comparison.endDate < range.startDate);
  });

  it("handles a single-day range", () => {
    const range = validateRange("2026-10-01", "2026-10-01");
    assert.strictEqual(range.dayCount, 1);
    assert.strictEqual(range.comparison.startDate, "2026-09-30");
    assert.strictEqual(range.comparison.endDate, "2026-09-30");
  });

  it("rejects an inverted range", () => {
    assert.throws(() => validateRange("2026-10-07", "2026-10-01"), RangeError);
  });

  it("rejects a range beyond the declared maximum", () => {
    const tooWide = new Date(Date.parse("2020-01-01T00:00:00.000Z") + (MAX_RANGE_DAYS + 5) * 86_400_000)
      .toISOString()
      .slice(0, 10);
    assert.throws(() => validateRange("2020-01-01", tooWide), RangeError);
  });

  it("defaults to today when bounds are missing", () => {
    const range = validateRange(undefined, undefined);
    assert.strictEqual(range.startDate, range.endDate);
    assert.strictEqual(range.dayCount, 1);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 3. Playback event validation
// ───────────────────────────────────────────────────────────────────────────

describe("playback event validation", () => {
  const valid = {
    sessionId: "abcdefgh12345678",
    contentId: "bhajan_01",
    contentType: "audio",
    startedAt: Date.parse("2026-10-01T10:00:00.000Z"),
    listenedSeconds: 180,
  };

  it("accepts a well-formed event", () => {
    const result = validatePlaybackEvent(valid);
    assert.strictEqual(result.ok, true);
  });

  it("rejects a missing or malformed sessionId", () => {
    assert.strictEqual(validatePlaybackEvent({ ...valid, sessionId: "short" }).ok, false);
    assert.strictEqual(validatePlaybackEvent({ ...valid, sessionId: undefined }).ok, false);
    assert.strictEqual(validatePlaybackEvent({ ...valid, sessionId: "has spaces here" }).ok, false);
  });

  it("rejects an unknown contentType", () => {
    const result = validatePlaybackEvent({ ...valid, contentType: "podcast" });
    assert.strictEqual(result.ok, false);
    assert.strictEqual(result.ok === false && result.field, "contentType");
  });

  it("rejects negative listenedSeconds", () => {
    assert.strictEqual(validatePlaybackEvent({ ...valid, listenedSeconds: -5 }).ok, false);
  });

  it("rejects a non-finite startedAt", () => {
    assert.strictEqual(validatePlaybackEvent({ ...valid, startedAt: 'not-a-number' }).ok, false);
  });

  it("clamps an absurd listenedSeconds instead of rejecting it", () => {
    const result = validatePlaybackEvent({ ...valid, listenedSeconds: 99_999_999 });
    assert.strictEqual(result.ok, true);
    assert.ok(result.ok && result.value.listenedSeconds <= 6 * 60 * 60);
  });

  it("normalises a missing category to undefined rather than the string 'general'", () => {
    const result = validatePlaybackEvent({ ...valid, category: undefined });
    assert.strictEqual(result.ok, true);
    assert.ok(result.ok && result.value.category === undefined);
  });

  it("rejects a non-object payload", () => {
    assert.strictEqual(validatePlaybackEvent(null).ok, false);
    assert.strictEqual(validatePlaybackEvent('nope').ok, false);
  });
});

describe("play qualification threshold", () => {
  it("excludes sub-threshold taps from the play count", () => {
    assert.strictEqual(qualifiesAsPlay(0), false);
    assert.strictEqual(qualifiesAsPlay(MIN_PLAY_LISTENED_SECONDS - 1), false);
  });

  it("includes sessions at or above the threshold", () => {
    assert.strictEqual(qualifiesAsPlay(MIN_PLAY_LISTENED_SECONDS), true);
    assert.strictEqual(qualifiesAsPlay(600), true);
  });
});

describe("playback document ids are idempotent and collision-free", () => {
  it("is stable for the same uid + session", () => {
    assert.strictEqual(
      playbackEventDocId("user_1", "abcdefgh12345678"),
      playbackEventDocId("user_1", "abcdefgh12345678")
    );
  });

  it("differs across users so one user cannot overwrite another's event", () => {
    assert.notStrictEqual(
      playbackEventDocId("user_1", "abcdefgh12345678"),
      playbackEventDocId("user_2", "abcdefgh12345678")
    );
  });

  it("differs across sessions of the same user", () => {
    assert.notStrictEqual(
      playbackEventDocId("user_1", "abcdefgh12345678"),
      playbackEventDocId("user_1", "zzzzzzzz12345678")
    );
  });

  it("produces only Firestore-safe characters", () => {
    assert.match(playbackEventDocId("user/../1", "abc def"), /^[A-Za-z0-9_-]+$/);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 4. Authorization
// ───────────────────────────────────────────────────────────────────────────

describe("analytics authorization", () => {
  // Callables must be invoked through the emulator harness wrapper; calling the
  // exported handler directly bypasses the callable protocol.
  const summary = testEnv.wrap(getAnalyticsSummary);
  const contract = testEnv.wrap(getAnalyticsContract);
  const trigger = testEnv.wrap(triggerDailyAnalyticsAggregation);
  const backfill = testEnv.wrap(backfillAnalyticsHistory);
  const record = testEnv.wrap(recordPlaybackSession);
  const heartbeat = testEnv.wrap(touchActiveUser);

  const adminOnly = [
    ["getAnalyticsSummary", summary],
    ["getAnalyticsContract", contract],
    ["triggerDailyAnalyticsAggregation", trigger],
    ["backfillAnalyticsHistory", backfill],
  ] as const;

  for (const [name, wrapped] of adminOnly) {
    it(`${name} rejects an unauthenticated caller`, async () => {
      await assertRejects(wrapped({}, ctx.none), "unauthenticated", name);
    });

    it(`${name} rejects a non-admin user`, async () => {
      await assertRejects(wrapped({}, ctx.mobileUser), "permission-denied", name);
    });

    it(`${name} rejects a suspended admin`, async () => {
      await assertRejects(wrapped({}, ctx.suspendedAdmin), "permission-denied", name);
    });
  }

  it("recordPlaybackSession rejects an unauthenticated caller", async () => {
    await assertRejects(
      record(
        {
          sessionId: "abcdefgh12345678",
          contentId: "x",
          contentType: "audio",
          startedAt: Date.now(),
          listenedSeconds: 60,
        },
        ctx.none
      ),
      "unauthenticated",
      "recordPlaybackSession"
    );
  });

  it("recordPlaybackSession rejects an invalid payload for an authenticated user", async () => {
    await assertRejects(record({ contentId: "x" }, ctx.mobileUser), "invalid-argument", "recordPlaybackSession");
  });

  it("touchActiveUser rejects an unauthenticated caller", async () => {
    await assertRejects(heartbeat({}, ctx.none), "unauthenticated", "touchActiveUser");
  });

  it("getAnalyticsSummary rejects an inverted date range with invalid-argument", async () => {
    await assertRejects(
      summary({ startDate: "2026-10-31", endDate: "2026-10-01" }, ctx.clientAdmin),
      "invalid-argument",
      "getAnalyticsSummary"
    );
  });

  it("triggerDailyAnalyticsAggregation rejects a malformed single date", async () => {
    await assertRejects(trigger({ date: "31-10-2026" }, ctx.clientAdmin), "invalid-argument", "trigger");
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 5. Coverage cutover — the guard against fabricating history
// ───────────────────────────────────────────────────────────────────────────

describe("coverage is only claimed once a source actually existed", () => {
  const ok = { playback: true, heartbeat: true };
  const failed = { playback: false, heartbeat: false };

  it("marks plays and playtime unavailable before the first playback event", () => {
    const coverage = coverageForDay(
      "2026-09-01",
      { users: "2026-01-01", playback: "2026-09-20", heartbeat: null },
      ok
    );
    assert.equal(coverage.plays, false);
    assert.equal(coverage.playtime, false);
  });

  it("claims plays from the first playback day onward", () => {
    const onCutover = coverageForDay(
      "2026-09-20",
      { users: "2026-01-01", playback: "2026-09-20", heartbeat: null },
      ok
    );
    assert.equal(onCutover.plays, true);
    assert.equal(onCutover.playtime, true);
  });

  it("reports zero plays as covered only after the collector existed", () => {
    const before = coverageForDay(
      "2026-09-19",
      { users: "2026-01-01", playback: "2026-09-20", heartbeat: null },
      ok
    );
    const after = coverageForDay(
      "2026-09-21",
      { users: "2026-01-01", playback: "2026-09-20", heartbeat: null },
      ok
    );
    // Same empty result, opposite meaning — this is the whole point.
    assert.equal(before.plays, false, "a day before the collector existed must not read as 0 plays");
    assert.equal(after.plays, true, "a day after the collector existed with no plays is a real zero");
  });

  it("treats active users as covered when either collector is live", () => {
    const heartbeatOnly = coverageForDay(
      "2026-09-25",
      { users: "2026-01-01", playback: null, heartbeat: "2026-09-20" },
      ok
    );
    assert.equal(heartbeatOnly.activeUsers, true);

    const neither = coverageForDay(
      "2026-09-10",
      { users: "2026-01-01", playback: "2026-09-20", heartbeat: "2026-09-20" },
      ok
    );
    assert.equal(neither.activeUsers, false);
  });

  it("never claims coverage from a failed query even after cutover", () => {
    const coverage = coverageForDay(
      "2026-09-25",
      { users: "2026-01-01", playback: "2026-09-20", heartbeat: "2026-09-20" },
      failed
    );
    assert.equal(coverage.plays, false);
    assert.equal(coverage.activeUsers, false);
  });

  it("keeps registrations covered for all history including before first launch", () => {
    const coverage = coverageForDay(
      "2020-01-01",
      { users: "2026-01-01", playback: null, heartbeat: null },
      failed
    );
    assert.equal(coverage.registrations, true);
    assert.equal(coverage.libraryActivity, false);
  });

  it("claims library activity from the first account onward", () => {
    const coverage = coverageForDay(
      "2026-09-25",
      { users: "2026-01-01", playback: null, heartbeat: null },
      ok
    );
    assert.equal(coverage.libraryActivity, true);
  });

  it("marks everything unavailable when no source has ever been observed", () => {
    const coverage = coverageForDay(
      "2026-09-25",
      { users: null, playback: null, heartbeat: null },
      ok
    );
    assert.equal(coverage.plays, false);
    assert.equal(coverage.playtime, false);
    assert.equal(coverage.activeUsers, false);
    assert.equal(coverage.libraryActivity, false);
    assert.equal(coverage.registrations, true);
  });
});
