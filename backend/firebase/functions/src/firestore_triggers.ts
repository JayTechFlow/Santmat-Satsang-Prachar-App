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
 * Helper to update category document item counts
 */
async function updateCategoryStats(categoryId: string) {
  try {
    const snapshot = await db
      .collection("media")
      .where("category", "==", categoryId)
      .where("status", "==", "published")
      .get();

    await db.collection("categories").doc(categoryId).set(
      {
        itemCount: snapshot.docs.length,
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
