import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { requireAuth, writeAuditLog, logger, db } from "./utils";
import { ROLE_HIERARCHY, type Role } from "./auth/PermissionEngine";

/**
 * Compare two roles: returns -1 if roleA < roleB, 0 if equal, 1 if roleA > roleB
 */
function compareRoles(roleA: string, roleB: string): number {
  const indexA = ROLE_HIERARCHY.indexOf(roleA as Role);
  const indexB = ROLE_HIERARCHY.indexOf(roleB as Role);
  if (indexA === -1 || indexB === -1) return 0;
  return indexA - indexB;
}

/**
 * Check if a role/status change requires refresh token revocation
 * Revocation is needed when:
 * - Role is downgraded (e.g., admin -> non-admin, developer_super_admin -> client_super_admin)
 * - Account is suspended
 * - Privileges are removed
 */
function shouldRevokeRefreshTokens(
  oldRole: string,
  newRole: string,
  oldStatus: string,
  newStatus: string
): boolean {
  // Role downgrade
  if (compareRoles(newRole, oldRole) < 0) {
    return true;
  }
  // Account suspended
  if (oldStatus !== "suspended" && newStatus === "suspended") {
    return true;
  }
  // Admin privilege removed
  const wasAdmin = oldRole === "developer_super_admin" || oldRole === "client_super_admin";
  const isAdmin = newRole === "developer_super_admin" || newRole === "client_super_admin";
  if (wasAdmin && !isAdmin) {
    return true;
  }
  return false;
}

/**
 * Phase B — Automatic Custom Claims Synchronization
 * Triggered whenever a document in users/{userId} is created or updated.
 * Revokes refresh tokens on role downgrade or account suspension.
 */
export const syncUserCustomClaims = functions.firestore
  .document("users/{userId}")
  .onWrite(async (change, context) => {
    const userId = context.params.userId;
    if (!change.after.exists) {
      // User document was deleted
      logger.info(`User ${userId} deleted. Resetting custom claims.`);
      try {
        await admin.auth().setCustomUserClaims(userId, null);
        await admin.auth().revokeRefreshTokens(userId);
      } catch (e) {
        logger.warn(`Could not clear claims/revoke tokens for deleted user ${userId}:`, e);
      }
      return;
    }

    const userData = change.after.data();
    if (!userData) return;

    // Get previous role and status from before the change
    const oldUserData = change.before.data() || {};
    const oldRole = oldUserData.role || "";
    const oldRoleIds: string[] = Array.isArray(oldUserData.roleIds) ? oldUserData.roleIds : [];
    const oldStatus = oldUserData.status || "active";

    // Determine new Role - ONLY 3 roles exist: developer_super_admin, client_super_admin, mobile_user
    let resolvedRole = "mobile_user";
    const role = userData.role || "";
    const roleIds: string[] = Array.isArray(userData.roleIds) ? userData.roleIds : [];

    if (role === "developer_super_admin" || roleIds.includes("developer_super_admin")) {
      resolvedRole = "developer_super_admin";
    } else if (
      role === "client_super_admin" ||
      roleIds.includes("client_super_admin")
    ) {
      resolvedRole = "client_super_admin";
    }

    // Determine old resolved role for comparison
    let oldResolvedRole = "mobile_user";
    if (oldRole === "developer_super_admin" || oldRoleIds.includes("developer_super_admin")) {
      oldResolvedRole = "developer_super_admin";
    } else if (
      oldRole === "client_super_admin" ||
      oldRoleIds.includes("client_super_admin")
    ) {
      oldResolvedRole = "client_super_admin";
    }

    const isAdmin = resolvedRole === "developer_super_admin" || resolvedRole === "client_super_admin";
    const accountStatus = userData.status === "suspended" ? "suspended" : "active";
    const organizationId = userData.organizationId || "org_santmat_global";

    const customClaims = {
      admin: isAdmin,
      role: resolvedRole,
      organizationId,
      accountStatus,
    };

    try {
      await admin.auth().setCustomUserClaims(userId, customClaims);
      logger.info(`Successfully synchronized custom claims for user ${userId}`, customClaims);
      await writeAuditLog("SYNC_CUSTOM_CLAIMS", userId, customClaims);

      // Check if refresh tokens should be revoked
      const shouldRevoke = shouldRevokeRefreshTokens(oldResolvedRole, resolvedRole, oldStatus, accountStatus);
      if (shouldRevoke) {
        await admin.auth().revokeRefreshTokens(userId);
        logger.info(`Revoked refresh tokens for user ${userId} due to role/status change`, {
          oldRole: oldResolvedRole,
          newRole: resolvedRole,
          oldStatus,
          newStatus: accountStatus,
        });
        await writeAuditLog("REVOKE_REFRESH_TOKENS", userId, {
          reason: "role_downgrade_or_suspension",
          oldRole: oldResolvedRole,
          newRole: resolvedRole,
          oldStatus,
          newStatus: accountStatus,
        });
      }
    } catch (error) {
      logger.error(`Failed to set custom claims for user ${userId}`, error);
    }
  });

/**
 * Phase A — Idempotent Developer Super Admin Bootstrap (PERMANENTLY DISABLED ENDPOINT)
 * Zero Trust Hardening (Option D): The public HTTPS Callable bootstrap endpoint is permanently disabled 
 * to ensure ZERO public HTTP attack surface. Use the offline Admin SDK CLI ceremony (`bootstrap_cli.ts`).
 */
export const bootstrapDeveloperSuperAdmin = functions.https.onCall(async () => {
  logger.warn("Public bootstrap attempt blocked. Endpoint permanently disabled in favor of Option D Admin SDK CLI.");
  throw new functions.https.HttpsError(
    "unauthenticated",
    "Public HTTPS bootstrap endpoint is permanently disabled for security. Use offline Admin SDK CLI."
  );
});

/**
 * Secure Role Assignment Endpoint
 * Prevents privilege escalation and self-promotion.
 */
export const setUserRole = functions.https.onCall(async (data, context) => {
  requireAuth(context);
  const callerUid = context.auth!.uid;
  const callerRole = context.auth!.token.role || "";

  const { targetUid, newRole } = data;

  if (!targetUid || !newRole) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "targetUid and newRole parameters are required."
    );
  }

  // Self-Promotion Guard
  if (targetUid === callerUid) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Self-promotion forbidden: You cannot modify your own role."
    );
  }

  // Hierarchy Guards
  if (newRole === "developer_super_admin" && callerRole !== "developer_super_admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Privilege escalation forbidden: Only Developer Super Admins can assign the Developer role."
    );
  }

  const targetDoc = await db.collection("users").doc(targetUid).get();
  const targetCurrentRole = targetDoc.data()?.role || "";

  if (targetCurrentRole === "developer_super_admin" && callerRole !== "developer_super_admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Permission denied: Only Developer Super Admins can modify a Developer account."
    );
  }

  if (callerRole !== "developer_super_admin" && callerRole !== "client_super_admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Permission denied: Insufficient privileges to assign roles."
    );
  }

  // Update target user document in Firestore
  await db.collection("users").doc(targetUid).set(
    {
      role: newRole,
      roleIds: [newRole],
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await writeAuditLog("SET_USER_ROLE", callerUid, { targetUid, newRole });
  return { status: "success", message: `Role updated to ${newRole} for ${targetUid}` };
});


