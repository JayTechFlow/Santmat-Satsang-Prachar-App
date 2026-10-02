import * as functions from "firebase-functions";
import { requireAdmin, writeAuditLog, sanitizeInput, db } from "./utils";

export const getDashboardStats = functions.https.onCall(async (data, context) => {
    requireAdmin(context);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const usersSnap = await db.collection("users").get();
    const bhajansSnap = await db.collection("audio").get();
    const stutisSnap = await db.collection("stuti_vinati").get();
    const booksSnap = await db.collection("books").get();
    const suvicharsSnap = await db.collection("suvichar").get();
    const playlistsSnap = await db.collection("playlists").get();
    const categoriesSnap = await db.collection("categories").get();
    const notificationsSnap = await db.collection("notifications").get();

    const totalPlays = (await db.collection("interaction_logs")
      .where("timestamp", ">=", thirtyDaysAgo)
      .get()).docs.filter((d) => d.data()?.interactionType === "play").length;

    const overview = {
      totalUsers: usersSnap.size,
      totalBhajans: bhajansSnap.size,
      totalStutis: stutisSnap.size,
      totalBooks: booksSnap.size,
      totalSuvichars: suvicharsSnap.size,
      totalPlaylists: playlistsSnap.size,
      totalCategories: categoriesSnap.size,
      totalNotifications: notificationsSnap.size,
    };

    await writeAuditLog("getDashboardStats", context.auth?.uid || 'system', {
      action: "get_dashboard_stats",
    });

    return {
      status: "success",
      data: {
        totalUsers: overview.totalUsers,
        totalBhajans: overview.totalBhajans,
        totalStutis: overview.totalStutis,
        totalBooks: overview.totalBooks,
        totalSuvichars: overview.totalSuvichars,
        totalPlaylists: overview.totalPlaylists,
        totalCategories: overview.totalCategories,
        totalNotifications: overview.totalNotifications,
        totalPlays,
        lastUpdated: new Date().toISOString()
      }
    };
  });

export const contentModeration = functions.https.onCall(async (data, context) => {
    requireAdmin(context);

    const { action, contentId, reason, collection: targetCollection } = data;
    // Whitelist: moderation may only touch content collections. Without this,
    // an admin callable could write into developer-only collections such as
    // system_config / roles (Admin SDK bypasses security rules).
    const MODERATABLE_COLLECTIONS = [
      'audio', 'stuti_vinati', 'books', 'suvichar', 'media',
      'events', 'satsangs', 'categories', 'book_categories', 'audio_categories',
      'banners', 'home_banners', 'featured_content', 'daily_quotes', 'daily_suvichar',
      'quotes', 'playlists', 'notifications',
    ];
    const colName = (targetCollection && typeof targetCollection === 'string')
      ? targetCollection
      : 'media';

    if (!MODERATABLE_COLLECTIONS.includes(colName)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        `Moderation is not permitted on collection '${colName}'.`
      );
    }

    if (!contentId || typeof contentId !== 'string') {
      throw new functions.https.HttpsError("invalid-argument", "contentId is required and must be a string.");
    }

    const allowedActions = ['approve', 'reject', 'flag'];
    if (!allowedActions.includes(action)) {
      throw new functions.https.HttpsError("invalid-argument", `Invalid action. Allowed: ${allowedActions.join(', ')}.`);
    }

    let updateData: any = {};

    switch (action) {
      case 'approve':
        updateData = {
          moderationStatus: 'approved',
          moderationReason: null,
          moderatedBy: context.auth?.uid,
          moderatedAt: new Date().toISOString()
        };
        break;

      case 'reject':
        if (!reason || typeof reason !== 'string') {
          throw new functions.https.HttpsError("invalid-argument", "reason is required for reject action.");
        }
        updateData = {
          moderationStatus: 'rejected',
          moderationReason: sanitizeInput(reason).slice(0, 500),
          moderatedBy: context.auth?.uid,
          moderatedAt: new Date().toISOString()
        };
        break;

      case 'flag':
        if (!reason || typeof reason !== 'string') {
          throw new functions.https.HttpsError("invalid-argument", "reason is required for flag action.");
        }
        updateData = {
          moderationStatus: 'flagged',
          moderationReason: sanitizeInput(reason).slice(0, 500),
          moderatedBy: context.auth?.uid,
          moderatedAt: new Date().toISOString()
        };
        break;
    }

    await db.collection(colName).doc(contentId).update(updateData);

    await writeAuditLog("contentModeration", context.auth?.uid || 'system', {
      action, contentId, collection: colName, reason: updateData.moderationReason
    });

    return { status: "success", data: updateData };
  });