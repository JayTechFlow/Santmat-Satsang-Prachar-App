import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { requireAuth, requireAdmin, logger, db } from "./utils";

/**
 * Analytics Aggregation Engine — Cloud Functions
 * Aggregates daily telemetry, active user metrics, category consumption, and client events.
 */

export interface DailyAnalyticsSnapshot {
  date: string;
  totalPlays: number;
  uniqueActiveUsers: number;
  totalListenDurationSeconds: number;
  newRegistrations: number;
  totalInteractions: number;
  topCategory: string;
  updatedAt: any;
}

/**
 * Scheduled job to aggregate daily analytics at 00:00 UTC every day.
 */
export const aggregateDailyAnalyticsScheduled = functions.pubsub
  .schedule("0 0 * * *")
  .onRun(async () => {
    logger.info("Starting scheduled daily analytics aggregation");
    await runDailyAnalyticsAggregation();
  });

/**
 * HTTPS Callable version for admin manual invocation.
 */
export const triggerDailyAnalyticsAggregation = functions.https.onCall(async (data, context) => {
  requireAdmin(context);
  const dateStr = data?.date; // Optional YYYY-MM-DD
  const snapshot = await runDailyAnalyticsAggregation(dateStr);
  return {
    status: "success",
    data: snapshot,
  };
});

async function runDailyAnalyticsAggregation(targetDateStr?: string) {
  const targetDate = targetDateStr ? new Date(targetDateStr) : new Date(Date.now() - 24 * 3600 * 1000);
  const dateKey = targetDate.toISOString().split("T")[0];

  const startTime = new Date(dateKey + "T00:00:00.000Z");
  const endTime = new Date(dateKey + "T23:59:59.999Z");

  // 1. Fetch interaction logs for the target date
  const interactionSnap = await db
    .collection("interaction_logs")
    .where("timestamp", ">=", startTime)
    .where("timestamp", "<=", endTime)
    .get();

  let totalPlays = 0;
  let totalInteractions = 0;
  const activeUserSet = new Set<string>();

  interactionSnap.docs.forEach((doc) => {
    const data = doc.data();
    totalInteractions++;
    if (data.uid) activeUserSet.add(data.uid);
    if (data.interactionType === "play") totalPlays++;
  });

  // 2. Fetch new user registrations for the target date
  const usersSnap = await db
    .collection("users")
    .where("createdAt", ">=", startTime)
    .where("createdAt", "<=", endTime)
    .get();

  const newRegistrations = usersSnap.docs.length;

  // 3. Fetch category breakdown from telemetry events
  const eventsSnap = await db
    .collection("telemetry_events")
    .where("timestamp", ">=", startTime)
    .where("timestamp", "<=", endTime)
    .get();

  const categoryCounts: Record<string, number> = {};
  let totalListenDurationSeconds = 0;

  eventsSnap.docs.forEach((doc) => {
    const data = doc.data();
    if (data.category) {
      categoryCounts[data.category] = (categoryCounts[data.category] || 0) + 1;
    }
    if (data.durationSeconds && typeof data.durationSeconds === "number") {
      totalListenDurationSeconds += data.durationSeconds;
    }
  });

  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "general";

  const snapshot: DailyAnalyticsSnapshot = {
    date: dateKey,
    totalPlays,
    uniqueActiveUsers: activeUserSet.size,
    totalListenDurationSeconds,
    newRegistrations,
    totalInteractions,
    topCategory,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  // Save to daily analytics collection
  await db.collection("analytics_daily").doc(dateKey).set(snapshot, { merge: true });

  // Update global analytics summary document
  await db.collection("analytics_summary").doc("overview").set(
    {
      lastUpdatedDate: dateKey,
      latestDau: activeUserSet.size,
      latestDailyPlays: totalPlays,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  logger.info(`Daily analytics for ${dateKey} aggregated: ${totalPlays} plays, ${activeUserSet.size} DAU.`);
  return snapshot;
}

/**
 * Aggregate category-level analytics metrics.
 * Runs every 6 hours or manually called.
 */
export const aggregateCategoryAnalytics = functions.pubsub
  .schedule("every 6 hours")
  .onRun(async () => {
    logger.info("Starting category analytics aggregation");
    await runCategoryAnalyticsAggregation();
  });

export const triggerCategoryAnalytics = functions.https.onCall(async (data, context) => {
  requireAdmin(context);
  const result = await runCategoryAnalyticsAggregation();
  return {
    status: "success",
    data: result,
  };
});

async function runCategoryAnalyticsAggregation() {
  const mediaSnap = await db.collection("media").where("status", "==", "published").get();
  const categoryStats: Record<string, { totalItems: number; totalPlays: number; totalLikes: number }> = {};

  mediaSnap.docs.forEach((doc) => {
    const data = doc.data();
    const category = data.category || "uncategorized";

    if (!categoryStats[category]) {
      categoryStats[category] = { totalItems: 0, totalPlays: 0, totalLikes: 0 };
    }

    categoryStats[category].totalItems += 1;
    categoryStats[category].totalPlays += data.playCount || 0;
    categoryStats[category].totalLikes += data.likeCount || 0;
  });

  const batch = db.batch();
  Object.entries(categoryStats).forEach(([catId, stats]) => {
    const ref = db.collection("analytics_categories").doc(catId);
    batch.set(
      ref,
      {
        categoryId: catId,
        ...stats,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });
  await batch.commit();

  logger.info(`Category analytics updated for ${Object.keys(categoryStats).length} categories.`);
  return { categoryCount: Object.keys(categoryStats).length };
}

/**
 * Get aggregated analytics report summary for admin interface.
 */
export const getAnalyticsSummary = functions.https.onCall(async (data, context) => {
  requireAdmin(context);

  const { startDate, endDate, limit = 30 } = data as {
    startDate?: string;
    endDate?: string;
    limit?: number;
  };

  try {
    let query: admin.firestore.Query = db.collection("analytics_daily").orderBy("date", "desc");

    if (startDate) {
      query = query.where("date", ">=", startDate);
    }
    if (endDate) {
      query = query.where("date", "<=", endDate);
    }

    const snap = await query.limit(limit).get();
    const dailyData = snap.docs.map((doc) => doc.data());

    const overviewSnap = await db.collection("analytics_summary").doc("overview").get();
    const overviewData = overviewSnap.exists ? overviewSnap.data() : null;

    return {
      status: "success",
      data: {
        daily: dailyData,
        overview: overviewData,
      },
    };
  } catch (error: any) {
    throw new functions.https.HttpsError("internal", error?.message ?? "Failed to fetch analytics summary");
  }
});

/**
 * HTTPS Callable for mobile/web client telemetry logging.
 */
export const logAnalyticsEvent = functions.https.onCall(async (data, context) => {
  requireAuth(context);

  const { eventName, category, durationSeconds, metadata } = data as {
    eventName: string;
    category?: string;
    durationSeconds?: number;
    metadata?: Record<string, any>;
  };

  if (!eventName) {
    throw new functions.https.HttpsError("invalid-argument", "eventName is required");
  }

  const uid = context.auth!.uid;

  try {
    await db.collection("telemetry_events").add({
      uid,
      eventName,
      category: category || "general",
      durationSeconds: durationSeconds || 0,
      metadata: metadata || {},
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      status: "success",
      data: { logged: true, eventName },
    };
  } catch (error: any) {
    logger.error(`Failed to log analytics event '${eventName}' for user ${uid}`, error);
    throw new functions.https.HttpsError("internal", error?.message ?? "Failed to log analytics event");
  }
});
