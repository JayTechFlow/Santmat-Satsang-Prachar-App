import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { requireAuth, writeAuditLog, logger } from "./utils";

/**
 * Secure User Provisioning Endpoint
 * Creates a new Firebase Auth user + Firestore profile + custom claims
 * Callable from the admin dashboard only.
 * Response excludes all secrets: no password, no refresh tokens, no SDK internals.
 */
export const createUser = functions.https.onCall(async (data, context) => {
  requireAuth(context);
  const callerUid = context.auth!.uid;
  const callerRole = context.auth!.token.role || "";

  // Caller role guard: only developer_super_admin and client_super_admin can provision users
  if (callerRole !== "developer_super_admin" && callerRole !== "client_super_admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Insufficient privileges: Admin privileges required to create user accounts."
    );
  }

  const { email, password, displayName, role, phone, initialStatus } = data || {};

  // Validate required fields
  if (!email || typeof email !== "string") {
    throw new functions.https.HttpsError("invalid-argument", "email is required and must be a string.");
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "password is required and must be at least 6 characters long."
    );
  }
  if (!displayName || typeof displayName !== "string") {
    throw new functions.https.HttpsError("invalid-argument", "displayName is required and must be a string.");
  }
  if (!role || !["developer_super_admin", "client_super_admin", "mobile_user"].includes(role)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "role must be one of: developer_super_admin, client_super_admin, mobile_user."
    );
  }

  // Privilege Escalation Guard: client_super_admin cannot provision developer_super_admin
  if (callerRole === "client_super_admin" && role === "developer_super_admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Privilege escalation forbidden: Client Super Admins cannot create Developer Super Admin accounts."
    );
  }

  // Prevent creating a developer_super_admin via this endpoint (use bootstrap CLI instead)
  if (role === "developer_super_admin") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Creating developer_super_admin accounts must be done via the offline Admin SDK CLI."
    );
  }

  let resolvedRole = role;
  let resolvedStatus = initialStatus || "active";
  if (!resolvedStatus) resolvedStatus = "active";
  if (resolvedStatus !== "active" && resolvedStatus !== "suspended") {
    resolvedStatus = "active";
  }

  // 1. Create the user in Firebase Auth
  let userRecord;
  try {
    userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });
  } catch (error: any) {
    console.error('createUser Firebase Auth Error:', error);
    if (error.code === 'auth/email-already-exists') {
      throw new functions.https.HttpsError("already-exists", "An account with this email already exists.");
    }
    if (error.code === 'auth/invalid-email') {
      throw new functions.https.HttpsError("invalid-argument", "The email address is not valid.");
    }
    throw new functions.https.HttpsError("internal", "Failed to create user in Firebase Auth.");
  }

  const uid = userRecord.uid;

  // 2. Create the Firestore user profile document
  const usersRef = admin.firestore().collection('users');
  try {
    await usersRef.doc(uid).set({
      uid,
      email,
      displayName,
      role: resolvedRole,
      roleIds: [resolvedRole],
      status: resolvedStatus,
      phone: phone || "",
      organizationId: "org_santmat_global",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: false });
  } catch (error: any) {
    // If Firestore creation fails, delete the Firebase Auth user to avoid orphan
    try {
      await admin.auth().deleteUser(uid);
    } catch (delError) {
      logger.warn(`Failed to delete orphaned Auth user ${uid} after Firestore error:`, delError);
    }
    console.error('createUser Firestore Error:', error);
    throw new functions.https.HttpsError("internal", "Failed to create user profile in Firestore.");
  }

  // 3. Set custom claims on the Firebase Auth user
  const isAdmin = resolvedRole === "developer_super_admin" || resolvedRole === "client_super_admin";
  const customClaims = {
    admin: isAdmin,
    role: resolvedRole,
    organizationId: "org_santmat_global",
    accountStatus: resolvedStatus,
  };
  try {
    await admin.auth().setCustomUserClaims(uid, customClaims);
  } catch (error: any) {
    logger.warn(`Failed to set custom claims for newly created user ${uid}:`, error);
    // Non-fatal: claims will be synced by the onWrite trigger
  }

  // 4. Write audit log
  await writeAuditLog("CREATE_USER", callerUid, {
    email,
    uid,
    role: resolvedRole,
    status: resolvedStatus,
    displayName,
  });

  // 5. Return safe user summary (NO password, NO secrets)
  const safeUser = {
    uid,
    email,
    displayName,
    role: resolvedRole,
    organizationId: "org_santmat_global",
    accountStatus: resolvedStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    phone: phone || '',
  };

  return { status: "success", data: safeUser };
});

/**
 * Reconcile User Directory
 * Compares Firebase Auth users with Firestore profiles to identify orphans, active,
 * or missing profiles.
 */
export const reconcileUserDirectory = functions.https.onCall(async (data, context) => {
  requireAuth(context);
  const callerRole = context.auth!.token.role || "";

  if (callerRole !== "developer_super_admin" && callerRole !== "client_super_admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Insufficient privileges."
    );
  }

  try {
    // 1. Fetch Firestore profiles
    const firestoreUsersSnap = await admin.firestore().collection("users").get();
    const firestoreMap = new Map<string, any>();
    firestoreUsersSnap.forEach((doc) => {
      firestoreMap.set(doc.id, doc.data());
    });

    // 2. Fetch Auth users
    const authUsers: admin.auth.UserRecord[] = [];
    let pageToken: string | undefined = undefined;
    do {
      const result = await admin.auth().listUsers(1000, pageToken);
      authUsers.push(...result.users);
      pageToken = result.pageToken;
    } while (pageToken);

    const authMap = new Map<string, admin.auth.UserRecord>();
    authUsers.forEach((user) => {
      authMap.set(user.uid, user);
    });

    // 3. Reconcile
    const allUids = new Set([...firestoreMap.keys(), ...authMap.keys()]);
    const reconciledList: any[] = [];

    for (const uid of allUids) {
      const authUser = authMap.get(uid);
      const firestoreUser = firestoreMap.get(uid);

      const email = authUser?.email || firestoreUser?.email || "unknown@santmat.org";
      const displayName = authUser?.displayName || firestoreUser?.displayName || firestoreUser?.name || "Devotee User";
      const role = authUser?.customClaims?.role || firestoreUser?.role || "mobile_user";
      const status = firestoreUser?.status || firestoreUser?.accountStatus || (authUser?.disabled ? "suspended" : "active");

      let identityState = "ACTIVE";
      if (authUser && firestoreUser) {
        identityState = "ACTIVE";
      } else if (authUser && !firestoreUser) {
        identityState = "PROFILE_MISSING";
      } else if (!authUser && firestoreUser) {
        identityState = "ORPHAN_PROFILE";
      }

      reconciledList.push({
        uid,
        email,
        displayName,
        role,
        accountStatus: status,
        identityState,
        createdAt: authUser?.metadata.creationTime || 
          (firestoreUser?.createdAt?.toDate ? firestoreUser.createdAt.toDate().toISOString() : firestoreUser?.createdAt) || null,
        lastSignIn: authUser?.metadata.lastSignInTime || null,
      });
    }

    return { status: "success", data: reconciledList };
  } catch (error: any) {
    logger.error("Failed to reconcile user directory:", error);
    throw new functions.https.HttpsError("internal", "Failed to reconcile user directory.");
  }
});

/**
 * Cleanup Orphan Profile
 * Delete Firestore profile document and subcollections for users who no longer exist in Firebase Auth.
 * Restructured to developer_super_admin only.
 */
export const cleanupOrphanProfile = functions.https.onCall(async (data, context) => {
  requireAuth(context);
  const callerRole = context.auth!.token.role || "";

  if (callerRole !== "developer_super_admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only Developer Super Admins can clean up orphan profiles."
    );
  }

  const { targetUid } = data || {};
  if (!targetUid || typeof targetUid !== "string") {
    throw new functions.https.HttpsError("invalid-argument", "targetUid is required.");
  }

  try {
    // Verify target user does NOT exist in Firebase Auth
    try {
      await admin.auth().getUser(targetUid);
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Cannot clean up profile: User still exists in Firebase Auth."
      );
    } catch (e: any) {
      if (e.code !== "auth/user-not-found") {
        throw e;
      }
    }

    // Delete Firestore profile recursively
    const db = admin.firestore();
    const docRef = db.collection("users").doc(targetUid);
    await db.recursiveDelete(docRef);

    // Audit log
    await writeAuditLog("CLEANUP_ORPHAN_PROFILE", context.auth!.uid, {
      targetUid,
    });

    return { status: "success" };
  } catch (error: any) {
    logger.error(`Failed to clean up orphan profile ${targetUid}:`, error);
    throw new functions.https.HttpsError("internal", error.message || "Cleanup failed.");
  }
});

/**
 * Phase 10 — Permanent User Deletion Endpoint (DEVELOPER SUPER ADMIN ONLY)
 * Permanently deletes the user across all platform subsystems:
 * 1. Validates Developer Super Admin privileges server-side (Zero Trust).
 * 2. Blocks self-deletion (anti-suicide guard) and last developer admin protection.
 * 3. Deletes Firestore profile and all subcollections recursively (users/{targetUid}/** including notification_state).
 * 4. Deletes related user-scoped collections: preferences/{targetUid}, profiles/{targetUid}, user_devotional_data/{targetUid}.
 * 5. Deletes user-created records: downloads (userId), playlists (ownerId).
 * 6. Deletes user Storage assets: avatars/{targetUid}/**, temp/{targetUid}/**, users/{targetUid}/**.
 * 7. Deletes Firebase Authentication account.
 * 8. Writes immutable audit log (NO secrets logged).
 * 9. Returns explicit execution status (FULL_DELETE_SUCCESS or PARTIAL_DELETE_REQUIRES_REVIEW).
 */
export const deleteUserPermanently = functions.https.onCall(async (data, context) => {
  requireAuth(context);
  const callerUid = context.auth!.uid;
  const callerRole = context.auth!.token.role || "";

  // Caller role guard: DEVELOPER SUPER ADMIN ONLY
  if (callerRole !== "developer_super_admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Permission denied: Permanent user deletion is restricted to Developer Super Admins only."
    );
  }

  const { targetUid } = data || {};

  // Input validation
  if (!targetUid || typeof targetUid !== "string") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "targetUid is required and must be a string."
    );
  }

  // Format validation
  if (
    targetUid.length < 1 ||
    targetUid.length > 128 ||
    targetUid.includes("/") ||
    targetUid.includes("..") ||
    !/^[a-zA-Z0-9_-]+$/.test(targetUid)
  ) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Invalid targetUid format."
    );
  }

  // Self-Deletion Guard
  if (targetUid === callerUid) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Self-deletion forbidden: You cannot permanently delete your own account."
    );
  }

  const db = admin.firestore();

  // Inspect target user document in Firestore to capture metadata for audit log
  const targetDoc = await db.collection("users").doc(targetUid).get();
  const targetData = targetDoc.exists ? targetDoc.data() : null;
  const targetRole = targetData?.role || "";
  const targetEmail = targetData?.email || "";
  const targetDisplayName = targetData?.displayName || targetData?.name || "";

  // Last Admin Protection: Prevent deleting the last active developer_super_admin
  if (targetRole === "developer_super_admin") {
    const devAdminSnap = await db
      .collection("users")
      .where("role", "==", "developer_super_admin")
      .get();
    const activeDevAdmins = devAdminSnap.docs.filter((d) => d.data()?.status !== "suspended");
    if (activeDevAdmins.length <= 1 && activeDevAdmins.some((d) => d.id === targetUid)) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Last Admin Protection: Cannot delete the last active Developer Super Admin account."
      );
    }
  }

  const deletedResources: string[] = [];
  const failedResources: { resource: string; error: string }[] = [];

  // Stage 1: Clean up Storage assets (avatars, temp, users)
  try {
    const bucket = admin.storage().bucket();
    const storagePrefixes = [
      `avatars/${targetUid}/`,
      `temp/${targetUid}/`,
      `users/${targetUid}/`
    ];
    for (const prefix of storagePrefixes) {
      try {
        await bucket.deleteFiles({ prefix });
        deletedResources.push(`storage:${prefix}`);
      } catch (err: any) {
        logger.info(`Storage cleanup notice for prefix ${prefix}:`, err.message);
      }
    }
  } catch (err: any) {
    logger.warn(`Storage asset deletion failed for user ${targetUid}:`, err);
    failedResources.push({ resource: "storage:assets", error: err.message || String(err) });
  }

  // Stage 2: Clean up dependent Firestore collections
  try {
    // A. Delete user-owned downloads
    const downloadsSnap = await db.collection("downloads").where("userId", "==", targetUid).get();
    if (!downloadsSnap.empty) {
      const batch = db.batch();
      downloadsSnap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      deletedResources.push(`firestore:downloads (${downloadsSnap.size} docs)`);
    }

    // B. Delete user-owned playlists
    const playlistsSnap = await db.collection("playlists").where("ownerId", "==", targetUid).get();
    if (!playlistsSnap.empty) {
      const batch = db.batch();
      playlistsSnap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      deletedResources.push(`firestore:playlists (${playlistsSnap.size} docs)`);
    }

    // C. Delete single-document user data (preferences, profiles, user_devotional_data)
    const userDocs = [
      `preferences/${targetUid}`,
      `profiles/${targetUid}`,
      `user_devotional_data/${targetUid}`
    ];
    for (const path of userDocs) {
      const docRef = db.doc(path);
      const snap = await docRef.get();
      if (snap.exists) {
        await docRef.delete();
        deletedResources.push(`firestore:${path}`);
      }
    }
  } catch (err: any) {
    logger.warn(`Dependent user documents cleanup error for ${targetUid}:`, err);
    failedResources.push({ resource: "firestore:dependent_docs", error: err.message || String(err) });
  }

  // Stage 3: Delete Firestore User document and all its subcollections recursively
  try {
    const userDocRef = db.collection("users").doc(targetUid);
    await db.recursiveDelete(userDocRef);
    deletedResources.push(`firestore:users/${targetUid}`);
  } catch (err: any) {
    logger.error(`Failed to delete Firestore user document recursively for ${targetUid}:`, err);
    failedResources.push({ resource: `firestore:users/${targetUid}`, error: err.message || String(err) });
  }

  // Stage 4: Delete user from Firebase Auth
  try {
    await admin.auth().deleteUser(targetUid);
    deletedResources.push("auth:user_account");
  } catch (err: any) {
    if (err.code === "auth/user-not-found") {
      deletedResources.push("auth:user_account (already absent)");
    } else {
      logger.error(`Failed to delete Firebase Auth user ${targetUid}:`, err);
      failedResources.push({ resource: "auth:user_account", error: err.message || String(err) });
    }
  }

  const operationStatus = failedResources.length === 0
    ? "FULL_DELETE_SUCCESS"
    : "PARTIAL_DELETE_REQUIRES_REVIEW";

  // Stage 5: Write comprehensive, safe audit log
  await writeAuditLog("DELETE_USER_PERMANENTLY", callerUid, {
    targetUid,
    targetEmail,
    targetDisplayName,
    targetRole,
    status: operationStatus,
    deletedResources,
    failedResources,
    timestamp: new Date().toISOString(),
  });

  return {
    status: operationStatus,
    targetUid,
    deletedResources,
    failedResources,
    message: operationStatus === "FULL_DELETE_SUCCESS"
      ? `User ${targetUid} was permanently deleted with all dependent resources.`
      : `User ${targetUid} deletion partially succeeded. Some resources require review.`
  };
});