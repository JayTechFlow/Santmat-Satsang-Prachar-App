import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { logger, writeAuditLog, db, requireAdmin, getThumbnailPath } from "./utils";

export interface QueueTaskData {
  taskType: "BULK_NOTIFICATION" | "MEDIA_THUMBNAIL_GENERATION" | "METADATA_SYNC" | "TRASH_CLEANUP" | "AI_PROCESSING";
  payload?: any;
  targetCollection?: string;
  targetId?: string;
  storagePath?: string;
  thumbnailPath?: string;
  status?: "pending" | "processing" | "completed" | "failed";
  retryCount?: number;
  maxRetries?: number;
}

const PROTECTED_COLLECTIONS = new Set([
  "users",
  "roles",
  "permissions",
  "system_config",
  "audit_logs",
  "bootstrap",
  "analytics",
  "audit_logs",
]);

const ALLOWED_TRASH_CLEANUP_COLLECTIONS = new Set([
  "media",
  "storage_files",
  "media_versions",
  "media_processing_jobs",
  "media_jobs",
]);

const ALLOWED_STORAGE_PREFIXES = new Set([
  "images/",
  "audio/",
  "video/",
  "videos/",
  "books/",
  "documents/",
  "events/",
  "avatars/",
  "banners/",
  "temp/",
  "trash/",
  "processing/",
  "thumbnails/",
  "prayers/",
  "public/",
]);

/**
 * Queue Trigger — onCreate on queue_tasks/{taskId}
 * Processes asynchronous queue jobs background task execution.
 */
export const processQueueTask = functions.firestore
  .document("queue_tasks/{taskId}")
  .onCreate(async (snap, context) => {
    const taskId = context.params.taskId;
    const data = snap.data() as QueueTaskData;

    if (!data || data.status === "processing" || data.status === "completed") {
      return;
    }

    const startTime = Date.now();

    // Mark task as processing
    await snap.ref.update({
      status: "processing",
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    try {
      let result: any = null;

      switch (data.taskType) {
        case "BULK_NOTIFICATION":
          result = await handleBulkNotification(data.payload);
          break;
        case "MEDIA_THUMBNAIL_GENERATION":
          result = await handleThumbnailGeneration(data);
          break;
        case "METADATA_SYNC":
          result = await handleMetadataSync(data);
          break;
        case "TRASH_CLEANUP":
          result = await handleTrashCleanup(data);
          break;
        case "AI_PROCESSING":
          result = await handleAIQueueProcessing(data);
          break;
        default:
          throw new Error(`Unknown queue task type: ${data.taskType}`);
      }

      const durationMs = Date.now() - startTime;

      // Mark task completed
      await snap.ref.update({
        status: "completed",
        result,
        durationMs,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await writeAuditLog("QUEUE_TASK_COMPLETED", "system", {
        taskId,
        taskType: data.taskType,
        durationMs,
        result,
      });
    } catch (error: any) {
      const durationMs = Date.now() - startTime;
      const currentRetry = (data.retryCount || 0) + 1;
      const maxRetries = data.maxRetries || 3;

      logger.error(`Queue task ${taskId} failed (attempt ${currentRetry}/${maxRetries}):`, error);

      if (currentRetry < maxRetries) {
        await snap.ref.update({
          status: "pending",
          retryCount: currentRetry,
          lastError: error?.message || "Task execution failed",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        await snap.ref.update({
          status: "failed",
          retryCount: currentRetry,
          error: error?.message || "Task execution failed",
          failedAt: admin.firestore.FieldValue.serverTimestamp(),
          durationMs,
        });

        await writeAuditLog("QUEUE_TASK_FAILED", "system", {
          taskId,
          taskType: data.taskType,
          error: error?.message,
          attempts: currentRetry,
        });
      }
    }
  });

/**
 * Enqueue Task HTTPS Callable — Allows admin or authorized callers to push jobs to the queue
 */
export const enqueueTask = functions.https.onCall(async (data, context) => {
  requireAdmin(context);
  const uid = context.auth!.uid;
  const callerOrgId = context.auth!.token.organizationId as string | undefined;

  const { taskType, payload, targetCollection, targetId, storagePath, thumbnailPath, maxRetries = 3 } = data;

  if (!taskType) {
    throw new functions.https.HttpsError("invalid-argument", "taskType is required");
  }

  const validTypes = [
    "BULK_NOTIFICATION",
    "MEDIA_THUMBNAIL_GENERATION",
    "METADATA_SYNC",
    "TRASH_CLEANUP",
    "AI_PROCESSING",
  ];
  if (!validTypes.includes(taskType)) {
    throw new functions.https.HttpsError("invalid-argument", `Invalid taskType: ${taskType}`);
  }

  // Validate targetCollection if provided
  if (targetCollection) {
    if (PROTECTED_COLLECTIONS.has(targetCollection)) {
      throw new functions.https.HttpsError("permission-denied", `Target collection '${targetCollection}' is protected and cannot be targeted by queue tasks`);
    }
  }

  // Validate targetId if provided (basic format check)
  if (targetId && (targetId.length > 200 || !/^[a-zA-Z0-9_-]+$/.test(targetId))) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid targetId format");
  }

  // Validate storagePath if provided
  if (storagePath) {
    const isAllowedPrefix = Array.from(ALLOWED_STORAGE_PREFIXES).some(prefix => storagePath.startsWith(prefix));
    if (!isAllowedPrefix) {
      throw new functions.https.HttpsError("permission-denied", `Storage path '${storagePath}' is not within allowed prefixes`);
    }
  }

  // Validate thumbnailPath if provided
  if (thumbnailPath) {
    const isAllowedPrefix = Array.from(ALLOWED_STORAGE_PREFIXES).some(prefix => thumbnailPath.startsWith(prefix));
    if (!isAllowedPrefix) {
      throw new functions.https.HttpsError("permission-denied", `Thumbnail path '${thumbnailPath}' is not within allowed prefixes`);
    }
  }

  // For TRASH_CLEANUP, enforce strict validation
  if (taskType === "TRASH_CLEANUP") {
    if (!targetCollection || !ALLOWED_TRASH_CLEANUP_COLLECTIONS.has(targetCollection)) {
      throw new functions.https.HttpsError("invalid-argument", "TRASH_CLEANUP requires a valid targetCollection from allowed list");
    }
    if (!targetId) {
      throw new functions.https.HttpsError("invalid-argument", "TRASH_CLEANUP requires targetId");
    }
    // Verify the document exists and is in trash status
    const docSnap = await db.collection(targetCollection).doc(targetId).get();
    if (!docSnap.exists) {
      throw new functions.https.HttpsError("not-found", `Target document ${targetCollection}/${targetId} not found`);
    }
    const docData = docSnap.data()!;
    const status = docData.status || docData.storageStatus;
    if (status !== "trash" && status !== "deleted") {
      throw new functions.https.HttpsError("permission-denied", `Document is not in trash/deleted status (current: ${status || 'unknown'})`);
    }
    // Tenant isolation: verify organization ownership if applicable
    if (docData.organizationId && callerOrgId && docData.organizationId !== callerOrgId) {
      // Developer super admin can cross-tenant; client super admin cannot
      const callerRole = context.auth!.token.role as string;
      if (callerRole !== "developer_super_admin") {
        throw new functions.https.HttpsError("permission-denied", "Cross-tenant TRASH_CLEANUP not authorized");
      }
    }
  }

  const docRef = await db.collection("queue_tasks").add({
    taskType,
    payload: payload || {},
    targetCollection: targetCollection || null,
    targetId: targetId || null,
    storagePath: storagePath || null,
    thumbnailPath: thumbnailPath || null,
    status: "pending",
    retryCount: 0,
    maxRetries,
    createdBy: uid,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await writeAuditLog("TASK_ENQUEUED", uid, {
    taskId: docRef.id,
    taskType,
    targetCollection,
    targetId,
    storagePath,
  });

  return {
    status: "success",
    data: {
      taskId: docRef.id,
      taskType,
    },
  };
});

// Handlers for queue jobs
async function handleBulkNotification(payload: any) {
  if (!payload || !payload.title || !payload.body) {
    throw new Error("Invalid payload for BULK_NOTIFICATION");
  }

  const topic = payload.topic || "all_users";
  const response = await admin.messaging().send({
    topic,
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: payload.data || {},
  });

  return { messageId: response, topic, status: "sent" };
}

async function handleThumbnailGeneration(data: QueueTaskData) {
  const { targetId, storagePath } = data;
  if (!targetId || !storagePath) {
    throw new Error("targetId and storagePath required for thumbnail generation");
  }

  const thumbnailPath = getThumbnailPath(storagePath, "media.jpg");

  await db.collection("media").doc(targetId).set(
    {
      thumbnailPath,
      thumbnailGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return { targetId, thumbnailPath, generated: true };
}

async function handleMetadataSync(data: QueueTaskData) {
  const { targetCollection = "media" } = data;

  const snapshot = await db.collection(targetCollection).get();
  let updatedCount = 0;

  for (const doc of snapshot.docs) {
    const item = doc.data();
    if (!item.indexedAt) {
      await doc.ref.set(
        {
          indexedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      updatedCount++;
    }
  }

  return { collection: targetCollection, totalExamined: snapshot.docs.length, updatedCount };
}

async function handleTrashCleanup(data: QueueTaskData) {
  const { targetCollection, targetId, storagePath, thumbnailPath } = data;
  
  // Re-validate at execution time for defense in depth
  if (!targetCollection || !ALLOWED_TRASH_CLEANUP_COLLECTIONS.has(targetCollection)) {
    throw new Error("TRASH_CLEANUP: Invalid or unauthorized targetCollection");
  }
  if (!targetId) {
    throw new Error("TRASH_CLEANUP: targetId is required");
  }
  
  // Verify document still exists and is in trash status
  const docSnap = await db.collection(targetCollection).doc(targetId).get();
  if (!docSnap.exists) {
    // Already deleted - nothing to clean up
    return { purgedTarget: `${targetCollection}/${targetId}`, storagePath, thumbnailPath, alreadyDeleted: true };
  }
  const docData = docSnap.data()!;
  const status = docData.status || docData.storageStatus;
  if (status !== "trash" && status !== "deleted") {
    throw new Error(`TRASH_CLEANUP: Document not in trash/deleted status (current: ${status || 'unknown'})`);
  }

  if (storagePath) {
    const isAllowedPrefix = Array.from(ALLOWED_STORAGE_PREFIXES).some(prefix => storagePath.startsWith(prefix));
    if (!isAllowedPrefix) {
      throw new Error(`TRASH_CLEANUP: Storage path '${storagePath}' not in allowed prefixes`);
    }
    try {
      await admin.storage().bucket().file(storagePath).delete();
    } catch {
      // File may be gone
    }
  }
  if (thumbnailPath) {
    const isAllowedPrefix = Array.from(ALLOWED_STORAGE_PREFIXES).some(prefix => thumbnailPath.startsWith(prefix));
    if (!isAllowedPrefix) {
      throw new Error(`TRASH_CLEANUP: Thumbnail path '${thumbnailPath}' not in allowed prefixes`);
    }
    try {
      await admin.storage().bucket().file(thumbnailPath).delete();
    } catch {
      // File may be gone
    }
  }
  if (targetCollection && targetId) {
    await db.collection(targetCollection).doc(targetId).delete();
  }
  return { purgedTarget: `${targetCollection}/${targetId}`, storagePath, thumbnailPath };
}

async function handleAIQueueProcessing(data: QueueTaskData) {
  const { payload, targetId } = data;
  if (!payload || !targetId) {
    throw new Error("payload and targetId required for AI processing task");
  }

  // Create document in ai_tasks collection to trigger AI processing
  const aiRef = await db.collection("ai_tasks").add({
    taskType: payload.aiTaskType || "CONTENT_MODERATION",
    targetId,
    content: payload.content || "",
    status: "pending",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { aiTaskId: aiRef.id, targetId };
}
