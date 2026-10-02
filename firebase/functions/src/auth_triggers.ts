import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { logger, writeAuditLog } from "./utils";

/**
 * Auth User Deletion Lifecycle Trigger
 * Automatically clean up Firestore user profile, subcollections, and storage assets
 * when a user is deleted from Firebase Auth.
 */
export const onAuthUserDeleted = functions.auth.user().onDelete(async (user, context) => {
  const uid = user.uid;
  const email = user.email || "unknown@santmat.org";
  logger.info(`Auth user deletion trigger received for UID: ${uid}, Email: ${email}`);

  // 1. Write start audit log entry
  await writeAuditLog("USER_DATA_CLEANUP_STARTED", "system", {
    targetUid: uid,
    email,
    reason: "auth_user_deleted_trigger",
  });

  // 2. Clean up Storage user-owned assets (avatars/{uid}/*)
  try {
    const bucket = admin.storage().bucket();
    const prefix = `avatars/${uid}/`;
    await bucket.deleteFiles({ prefix });
    logger.info(`Successfully deleted Storage user-owned assets for user ${uid}`);
  } catch (error: any) {
    logger.warn(`Storage assets deletion failed or not found for user ${uid}:`, error.message);
  }

  // 3. Clean up Firestore user profile document and subcollections recursively
  try {
    const db = admin.firestore();
    const docRef = db.collection("users").doc(uid);
    await db.recursiveDelete(docRef);
    logger.info(`Successfully deleted Firestore user document and subcollections for user ${uid}`);
  } catch (error: any) {
    logger.error(`Firestore profile cleanup failed for user ${uid}:`, error);
    await writeAuditLog("USER_DATA_CLEANUP_FAILED", "system", {
      targetUid: uid,
      error: error.message || String(error),
    });
    throw error;
  }

  // 4. Write completion audit log
  await writeAuditLog("USER_DATA_CLEANUP_COMPLETED", "system", {
    targetUid: uid,
    email,
  });
});
