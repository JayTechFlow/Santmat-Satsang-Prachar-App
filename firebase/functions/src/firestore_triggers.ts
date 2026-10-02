import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { logger, writeAuditLog, db } from "./utils";

/**
 * Firestore Trigger — onWrite on media/{mediaId}
 * Handles:
 * 1. Audit logging on creation, update, and deletion
 * 2. Automated metadata sync (category counts, stats update)
 * 3. Push notifications when media status changes to 'published'
 * 4. Queue creation for trash cleanup when status is set to 'trash'
 */
export const onMediaDocumentWrite = functions.firestore
  .document("media/{mediaId}")
  .onWrite(async (change, context) => {
    const mediaId = context.params.mediaId;
    const beforeData = change.before.exists ? change.before.data() : null;
    const afterData = change.after.exists ? change.after.data() : null;

    // Document Deletion
    if (!afterData) {
      await writeAuditLog("MEDIA_DOCUMENT_DELETED", "system", {
        mediaId,
        previousTitle: beforeData?.title || null,
        previousCategory: beforeData?.category || null,
      });

      // Recalculate category stats if category existed
      if (beforeData?.category) {
        await updateCategoryStats(beforeData.category);
      }
      return;
    }

    // Document Creation
    if (!beforeData) {
      await writeAuditLog("MEDIA_DOCUMENT_CREATED", afterData.uploadedBy || "system", {
        mediaId,
        title: afterData.title || null,
        category: afterData.category || null,
        type: afterData.type || null,
        status: afterData.status || "draft",
      });

      if (afterData.category) {
        await updateCategoryStats(afterData.category);
      }
    } else {
      // Document Update
      await writeAuditLog("MEDIA_DOCUMENT_UPDATED", afterData.updatedBy || "system", {
        mediaId,
        changes: getDiffKeys(beforeData, afterData),
        status: afterData.status,
      });

      if (beforeData.category !== afterData.category) {
        if (beforeData.category) await updateCategoryStats(beforeData.category);
        if (afterData.category) await updateCategoryStats(afterData.category);
      }
    }

    // 2. Push Notification Dispatch when published
    const wasPublished = beforeData?.status === "published";
    const isNowPublished = afterData?.status === "published";

    if (!wasPublished && isNowPublished) {
      const topic = afterData.notificationTopic || "media_updates";
      const title = "New Media Published";
      const body = afterData.title ? `"${afterData.title}" is now available.` : "New media content is ready to view.";

      try {
        await admin.messaging().send({
          topic,
          notification: {
            title,
            body,
          },
          data: {
            mediaId,
            category: afterData.category || "",
            type: afterData.type || "",
          },
        });
        logger.info(`Dispatched push notification for newly published media ${mediaId} to topic '${topic}'`);
      } catch (err) {
        logger.error(`Failed to send push notification for media ${mediaId}`, err);
      }
    }

    // 3. Trash & Soft Delete Handler
    if (afterData.status === "trash" || afterData.isDeleted === true) {
      // Enqueue trash cleanup background task
      await db.collection("queue_tasks").add({
        taskType: "TRASH_CLEANUP",
        targetCollection: "media",
        targetId: mediaId,
        storagePath: afterData.storagePath || null,
        thumbnailPath: afterData.thumbnailPath || null,
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      logger.info(`Enqueued TRASH_CLEANUP queue task for media ${mediaId}`);
    }
  });

/**
 * Firestore Trigger — onWrite on audio/{audioId}
 * Handles:
 * 1. Audit logging on creation, update, and deletion
 * 2. Automated metadata sync (category counts, stats update)
 * 3. Push notifications when audio status changes to 'published' ('प्रकाशित')
 * 4. Queue creation for trash cleanup when status is set to 'trash'
 */
export const onAudioDocumentWrite = functions.firestore
  .document("audio/{audioId}")
  .onWrite(async (change, context) => {
    const audioId = context.params.audioId;
    const beforeData = change.before.exists ? change.before.data() : null;
    const afterData = change.after.exists ? change.after.data() : null;

    // Document Deletion
    if (!afterData) {
      await writeAuditLog("AUDIO_DOCUMENT_DELETED", "system", {
        audioId,
        previousTitle: beforeData?.title || null,
        previousCategory: beforeData?.category || null,
      });

      // Recalculate category stats if category existed
      if (beforeData?.category) {
        await updateCategoryStats(beforeData.category);
      }
      return;
    }

    // Document Creation
    if (!beforeData) {
      await writeAuditLog("AUDIO_DOCUMENT_CREATED", afterData.createdBy || "system", {
        audioId,
        title: afterData.title || null,
        category: afterData.category || null,
        type: afterData.type || null,
        status: afterData.status || "draft",
      });

      if (afterData.category) {
        await updateCategoryStats(afterData.category);
      }
    } else {
      // Document Update
      await writeAuditLog("AUDIO_DOCUMENT_UPDATED", afterData.updatedBy || "system", {
        audioId,
        changes: getDiffKeys(beforeData, afterData),
        status: afterData.status,
      });

      if (beforeData.category !== afterData.category) {
        if (beforeData.category) await updateCategoryStats(beforeData.category);
        if (afterData.category) await updateCategoryStats(afterData.category);
      }
    }

    // 2. Push Notification Dispatch when published
    const wasPublished = beforeData?.status === "published" || beforeData?.status === "प्रकाशित";
    const isNowPublished = afterData?.status === "published" || afterData?.status === "प्रकाशित";

    if (!wasPublished && isNowPublished) {
      const topic = afterData.notificationTopic || "audio_updates";
      const title = "New Bhajan Published";
      const body = afterData.title ? `"${afterData.title}" is now available.` : "New audio content is ready to play.";

      try {
        await admin.messaging().send({
          topic,
          notification: {
            title,
            body,
          },
          data: {
            audioId,
            category: afterData.category || "",
            type: afterData.type || "",
          },
        });
        logger.info(`Dispatched push notification for newly published audio ${audioId} to topic '${topic}'`);
      } catch (err) {
        logger.error(`Failed to send push notification for audio ${audioId}`, err);
      }
    }

    // 3. Trash & Soft Delete Handler
    if (afterData.status === "trash" || afterData.status === "ड्राफ्ट" && afterData.isDeleted === true) {
      // Enqueue trash cleanup background task
      await db.collection("queue_tasks").add({
        taskType: "TRASH_CLEANUP",
        targetCollection: "audio",
        targetId: audioId,
        storagePath: afterData.storagePath || null,
        thumbnailPath: afterData.thumbnailPath || null,
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      logger.info(`Enqueued TRASH_CLEANUP queue task for audio ${audioId}`);
    }
  });

/**
 * Firestore Trigger — onCreate on notifications_queue/{queueId}
 * Trigger for instant notification processing queue entries
 */
export const onNotificationQueueCreated = functions.firestore
  .document("notifications_queue/{queueId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    if (!data) return;

    const { title, body, topic, tokens, payload } = data;

    try {
      if (topic) {
        await admin.messaging().send({
          topic,
          notification: { title, body },
          data: payload || {},
        });
      } else if (Array.isArray(tokens) && tokens.length > 0) {
        await admin.messaging().sendMulticast({
          tokens,
          notification: { title, body },
          data: payload || {},
        });
      }

      await snap.ref.update({
        status: "sent",
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await writeAuditLog("NOTIFICATION_DISPATCHED", "system", {
        queueId: context.params.queueId,
        topic: topic || null,
        recipientCount: tokens?.length || 1,
      });
    } catch (error: any) {
      await snap.ref.update({
        status: "failed",
        error: error?.message || "Failed to dispatch notification",
        failedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      logger.error(`Notification dispatch failed for queue ${context.params.queueId}`, error);
    }
  });

/**
 * Scheduled Purge Function — Purges items in status 'trash' older than 30 days.
 */
export const purgeTrashFilesScheduled = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const snap = await db
      .collection("media")
      .where("status", "==", "trash")
      .where("updatedAt", "<=", thirtyDaysAgo)
      .get();

    logger.info(`Found ${snap.docs.length} trashed items to purge`);

    const bucket = admin.storage().bucket();
    for (const doc of snap.docs) {
      const data = doc.data();
      if (data.storagePath) {
        try {
          await bucket.file(data.storagePath).delete();
        } catch {
          // Non-fatal if file doesn't exist
        }
      }
      if (data.thumbnailPath) {
        try {
          await bucket.file(data.thumbnailPath).delete();
        } catch {
          // Non-fatal
        }
      }
      await doc.ref.delete();
      await writeAuditLog("TRASH_ITEM_PURGED", "scheduled_job", {
        mediaId: doc.id,
        title: data.title || null,
      });
    }
  });

/**
 * Core Server-side Scheduled Publisher Logic.
 * Scans 'audio' collection for items in status 'शेड्यूल किया गया' or 'scheduled',
 * checks if the target publication time has arrived, and atomically transitions
 * their status to 'प्रकाशित'.
 *
 * Idempotent, safe, and triggers onAudioDocumentWrite for FCM notification dispatch.
 */
export async function processScheduledPublishing(now: Date = new Date()): Promise<{ publishedCount: number; publishedIds: string[] }> {
  const nowIso = now.toISOString();

  // Fetch scheduled items from 'audio' collection
  const scheduledAudioSnap = await db
    .collection("audio")
    .where("status", "in", ["शेड्यूल किया गया", "scheduled"])
    .get();

  let publishedCount = 0;
  const publishedIds: string[] = [];

  for (const docSnap of scheduledAudioSnap.docs) {
    const data = docSnap.data();

    // Guard: Ignore deleted, trashed, or draft items
    if (data.isDeleted === true || data.status === "trash" || data.status === "draft" || data.status === "प्रकाशित") {
      continue;
    }

    let isDue = false;

    // 1. Check scheduledAt (ISO string or Timestamp)
    if (data.scheduledAt) {
      if (typeof data.scheduledAt === "string") {
        const parsed = new Date(data.scheduledAt);
        if (!isNaN(parsed.getTime())) {
          isDue = parsed <= now;
        }
      } else if (data.scheduledAt.toDate && typeof data.scheduledAt.toDate === "function") {
        isDue = data.scheduledAt.toDate() <= now;
      }
    }
    // 2. Fallback check: scheduledDate (YYYY-MM-DD) and scheduledTime (HH:mm) in IST (+05:30)
    else if (data.scheduledDate) {
      const timeStr = data.scheduledTime || "00:00";
      const scheduledDateTime = new Date(`${data.scheduledDate}T${timeStr}:00+05:30`);
      if (!isNaN(scheduledDateTime.getTime())) {
        isDue = scheduledDateTime <= now;
      }
    }

    if (isDue) {
      logger.info(`Auto-publishing scheduled audio item ${docSnap.id} ("${data.title || ""}") at ${nowIso}`);

      await docSnap.ref.update({
        status: "प्रकाशित",
        publishedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await writeAuditLog("SCHEDULED_CONTENT_AUTO_PUBLISHED", "scheduled_job", {
        audioId: docSnap.id,
        title: data.title || null,
        scheduledDate: data.scheduledDate || null,
        scheduledTime: data.scheduledTime || null,
        scheduledAt: data.scheduledAt || null,
      });

      publishedCount++;
      publishedIds.push(docSnap.id);
    }
  }

  logger.info(`Scheduled publisher executed at ${nowIso}: ${publishedCount} item(s) auto-published.`);
  return { publishedCount, publishedIds };
}

/**
 * Scheduled Purge / Publish Trigger — Runs every 1 minute to auto-publish scheduled content.
 */
export const publishScheduledContentScheduled = functions.pubsub
  .schedule("every 1 minutes")
  .onRun(async () => {
    await processScheduledPublishing();
  });

/**
 * Helper to update category document item counts
 */
async function updateCategoryStats(categoryId: string) {
  try {
    const mediaSnapshot = await db
      .collection("media")
      .where("category", "==", categoryId)
      .where("status", "==", "published")
      .get();

    const audioSnapshot = await db
      .collection("audio")
      .where("category", "==", categoryId)
      .where("status", "in", ["published", "प्रकाशित"])
      .get();

    await db.collection("categories").doc(categoryId).set(
      {
        itemCount: mediaSnapshot.docs.length + audioSnapshot.docs.length,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    logger.error(`Failed to update stats for category ${categoryId}`, err);
  }
}

function getDiffKeys(before: any, after: any): string[] {
  const keys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
  const diffs: string[] = [];
  keys.forEach((key) => {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      diffs.push(key);
    }
  });
  return diffs;
}
