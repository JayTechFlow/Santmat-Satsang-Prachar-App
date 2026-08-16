import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { logger, writeAuditLog, db, getThumbnailPath } from "./utils";

/**
 * Storage Trigger — onFinalize
 * Executes when a new file/object is uploaded and finalized in Cloud Storage.
 * Handles:
 * 1. Automated metadata sync to Firestore (storage_files & media collections)
 * 2. Automated thumbnail path generation & registration
 * 3. Audit logging
 * 4. Push notifications for published assets/broadcasts (server-side authorization only)
 */
export const onStorageObjectFinalized = functions.storage
  .object()
  .onFinalize(async (object) => {
    const filePath = object.name;
    if (!filePath) {
      logger.warn("Storage object finalized with no name");
      return;
    }

    // Prevent infinite trigger loops on generated thumbnails
    if (filePath.includes("thumbnails/") || filePath.includes("_thumb.")) {
      logger.info(`Ignoring thumbnail file upload: ${filePath}`);
      return;
    }

    const bucketName = object.bucket;
    const contentType = object.contentType || "application/octet-stream";
    const sizeBytes = parseInt(String(object.size || "0"), 10);
    const md5Hash = object.md5Hash || "";
    const metadata = object.metadata || {};
    const timeCreated = object.timeCreated || new Date().toISOString();

    const fileId = filePath.replace(/\//g, "_");

    // 1. Automated Thumbnail Path Generation & Metadata Sync
    let thumbnailPath: string | null = null;
    if (contentType.startsWith("image/")) {
      thumbnailPath = getThumbnailPath(filePath, "image.jpg");
    }

    const storageRecord = {
      filePath,
      bucketName,
      contentType,
      sizeBytes,
      md5Hash,
      metadata,
      thumbnailPath,
      status: "active",
      createdAt: timeCreated,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Sync to storage_files collection
    await db.collection("storage_files").doc(fileId).set(storageRecord, { merge: true });

    // 2. Sync to media collection ONLY if mediaId is present AND verified server-side
    // DO NOT trust client-provided metadata.mediaId directly for writes
    // Instead, we record the client-provided mediaId for audit but require server verification
    const clientProvidedMediaId = metadata.mediaId;
    let verifiedMediaId: string | null = null;

    if (clientProvidedMediaId) {
      // Verify the media document exists and the storagePath matches
      const mediaDoc = await db.collection("media").doc(clientProvidedMediaId).get();
      if (mediaDoc.exists) {
        const mediaData = mediaDoc.data()!;
        // Verify the storage path matches (or is being set for the first time)
        if (!mediaData.storagePath || mediaData.storagePath === filePath) {
          verifiedMediaId = clientProvidedMediaId;
        } else {
          logger.warn(`Storage trigger: mediaId ${clientProvidedMediaId} storagePath mismatch. Expected: ${mediaData.storagePath}, Got: ${filePath}`);
        }
      } else {
        logger.info(`Storage trigger: mediaId ${clientProvidedMediaId} not found in Firestore`);
      }
    }

    // Only update media document if we have a verified mediaId
    if (verifiedMediaId) {
      await db.collection("media").doc(verifiedMediaId).set(
        {
          storagePath: filePath,
          contentType,
          sizeBytes,
          thumbnailPath,
          // DO NOT trust client-provided status - default to processing
          status: "processing",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    // 3. Audit Logging
    await writeAuditLog("STORAGE_OBJECT_FINALIZED", metadata.uploadedBy || "system", {
      filePath,
      bucketName,
      contentType,
      sizeBytes,
      thumbnailPath,
      clientProvidedMediaId: clientProvidedMediaId || null,
      verifiedMediaId: verifiedMediaId || null,
    });

    // 4. Push Notification Dispatch - SERVER-SIDE AUTHORIZATION ONLY
    // NEVER trust metadata.notifyTopic, metadata.publishNotification, or metadata.mediaId
    // Notifications are only sent for:
    // - Broadcast folder uploads (server-controlled path)
    // - Media that has been explicitly approved/published via admin workflow
    let shouldNotify = false;
    let notifyTopic = "media_updates";
    let notifyTitle = "New Media File Uploaded";
    let notifyBody = `New asset available at ${filePath.split("/").pop()}`;

    // Server-controlled notification triggers only
    if (filePath.startsWith("broadcasts/")) {
      shouldNotify = true;
      notifyTopic = "broadcasts";
      notifyTitle = "New Broadcast";
      notifyBody = `New broadcast uploaded: ${filePath.split("/").pop()}`;
    }
    // Note: publishNotification from client metadata is IGNORED
    // Notifications for published media should be triggered by the admin publish workflow,
    // not by client upload metadata

    if (shouldNotify) {
      try {
        await admin.messaging().send({
          topic: notifyTopic,
          notification: {
            title: notifyTitle,
            body: notifyBody,
          },
          data: {
            filePath,
            mediaId: verifiedMediaId || "",
            contentType,
          },
        });
        logger.info(`Push notification dispatched to topic '${notifyTopic}' for ${filePath}`);
      } catch (err) {
        logger.error(`Failed to send push notification for storage finalize: ${filePath}`, err);
      }
    }
  });

/**
 * Storage Trigger — onDelete
 * Executes when a file/object is deleted from Cloud Storage.
 * Handles:
 * 1. Metadata sync (marking file status as deleted)
 * 2. Audit logging
 * 3. Cleaning references
 */
export const onStorageObjectDeleted = functions.storage
  .object()
  .onDelete(async (object) => {
    const filePath = object.name;
    if (!filePath) return;

    const fileId = filePath.replace(/\//g, "_");
    const metadata = object.metadata || {};

    // 1. Metadata Sync in Firestore
    await db.collection("storage_files").doc(fileId).set(
      {
        status: "deleted",
        deletedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // If mediaId is attached, update media document
    if (metadata.mediaId) {
      await db.collection("media").doc(metadata.mediaId).set(
        {
          storageStatus: "deleted",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    // 2. Audit Logging
    await writeAuditLog("STORAGE_OBJECT_DELETED", metadata.deletedBy || "system", {
      filePath,
      bucketName: object.bucket,
      mediaId: metadata.mediaId || null,
    });
  });
