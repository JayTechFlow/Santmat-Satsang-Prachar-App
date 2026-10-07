/**
 * WAVE 5 — CLOUD FUNCTION AUTHORIZATION + NEGATIVE TESTS (Phase 7/8/16)
 *
 * Proves clean authorization/validation failures with no privilege escalation:
 *   - missing auth        -> unauthenticated
 *   - wrong role          -> permission-denied
 *   - suspended account   -> permission-denied
 *   - malformed payload   -> invalid-argument
 *   - cross-user target   -> permission-denied / invalid-argument
 *
 * Runs offline against compiled functions via firebase-functions-test,
 * consistent with the existing suites in this directory.
 */

import { describe, it, after } from "node:test";
import assert from "node:assert";
import admin from "firebase-admin";

const adminLib = (admin as any)?.default || admin;
const adminApps = adminLib.apps || [];
if (!adminApps.length) {
  adminLib.initializeApp({ projectId: "demo-test" });
}

import firebaseFunctionsTest from "firebase-functions-test";
import { validateToken } from "../lib/auth.js";
import { broadcast, sendDirectNotification } from "../lib/notifications.js";
import { setUserRole } from "../lib/iam.js";
import { contentModeration, getDashboardStats } from "../lib/admin_funcs.js";
import { generateUploadUrl } from "../lib/media.js";
import { createUser, deleteUserPermanently } from "../lib/user_provisioning.js";

const testEnv = firebaseFunctionsTest({ projectId: "demo-test" });

/** Callable context factories */
const ctx = {
  none: {} as any,
  mobileUser: { auth: { uid: "user_1", token: { role: "mobile_user", accountStatus: "active" } } } as any,
  suspendedAdmin: { auth: { uid: "admin_susp", token: { role: "client_super_admin", accountStatus: "suspended" } } } as any,
  suspendedUser: { auth: { uid: "user_susp", token: { role: "mobile_user", accountStatus: "suspended" } } } as any,
  clientAdmin: { auth: { uid: "admin_1", token: { role: "client_super_admin", accountStatus: "active" } } } as any,
  devAdmin: { auth: { uid: "dev_admin_1", token: { role: "developer_super_admin", accountStatus: "active" } } } as any,
};

const assertRejectsWith = async (
  promise: Promise<unknown>,
  code?: string
): Promise<void> => {
  try {
    await promise;
    assert.fail("Expected rejection but call succeeded");
  } catch (e: any) {
    if (code) {
      assert.strictEqual(e?.code, code, `Expected ${code}, got ${e?.code}: ${e?.message}`);
    }
  }
};

describe("Wave 5 — Function authorization security suite", () => {
  after(() => {
    testEnv.cleanup();
  });

  // ------------------------------------------------------------------
  // Phase 7 — missing auth
  // ------------------------------------------------------------------
  it("validateToken DENIES unauthenticated caller", async () => {
    const wrapped = testEnv.wrap(validateToken);
    await assertRejectsWith(wrapped(undefined, ctx.none), "unauthenticated");
  });

  it("getDashboardStats DENIES unauthenticated and mobile_user callers", async () => {
    const wrapped = testEnv.wrap(getDashboardStats);
    await assertRejectsWith(wrapped(undefined, ctx.none), "unauthenticated");
    await assertRejectsWith(wrapped({}, ctx.mobileUser), "permission-denied");
  });

  it("broadcast DENIES unauthenticated caller with unauthenticated code", async () => {
    const wrapped = testEnv.wrap(broadcast);
    await assertRejectsWith(wrapped({ title: "x", body: "y" }, ctx.none), "unauthenticated");
  });

  it("contentModeration DENIES unauthenticated caller", async () => {
    const wrapped = testEnv.wrap(contentModeration);
    await assertRejectsWith(
      wrapped({ action: "approve", contentId: "c1" }, ctx.none),
      "unauthenticated"
    );
  });

  // ------------------------------------------------------------------
  // Phase 7 — wrong role
  // ------------------------------------------------------------------
  it("broadcast DENIES mobile_user role", async () => {
    const wrapped = testEnv.wrap(broadcast);
    await assertRejectsWith(
      wrapped({ title: "Hi", body: "Hello" }, ctx.mobileUser),
      "permission-denied"
    );
  });

  it("sendDirectNotification DENIES mobile_user (no user-level send path)", async () => {
    const wrapped = testEnv.wrap(sendDirectNotification);
    await assertRejectsWith(
      wrapped({ targetToken: "tok", title: "t", body: "b" }, ctx.mobileUser),
      "permission-denied"
    );
  });

  it("setUserRole DENIES mobile_user attempting role assignment", async () => {
    const originalCollection = admin.firestore().collection;
    admin.firestore().collection = (() => ({
      doc: () => ({ get: async () => ({ exists: true, data: () => ({ role: "mobile_user" }) }) }),
    })) as any;
    try {
      const wrapped = testEnv.wrap(setUserRole);
      await assertRejectsWith(
        wrapped({ targetUid: "victim", newRole: "mobile_user" }, ctx.mobileUser),
        "permission-denied"
      );
    } finally {
      admin.firestore().collection = originalCollection;
    }
  });

  // ------------------------------------------------------------------
  // Phase 8 — suspension enforcement at the callable boundary
  // ------------------------------------------------------------------
  it("broadcast DENIES SUSPENDED admin even with valid admin role", async () => {
    const wrapped = testEnv.wrap(broadcast);
    await assertRejectsWith(
      wrapped({ title: "Hi", body: "Hello" }, ctx.suspendedAdmin),
      "permission-denied"
    );
  });

  // ------------------------------------------------------------------
  // Phase 16 — malformed payloads / validation
  // ------------------------------------------------------------------
  it("broadcast REJECTS missing title/body with invalid-argument", async () => {
    const wrapped = testEnv.wrap(broadcast);
    await assertRejectsWith(wrapped({}, ctx.clientAdmin), "invalid-argument");
    await assertRejectsWith(wrapped({ title: "OnlyTitle" }, ctx.clientAdmin), "invalid-argument");
  });

  it("setUserRole REJECTS invalid newRole values (no arbitrary roles)", async () => {
    const wrapped = testEnv.wrap(setUserRole);
    await assertRejectsWith(
      wrapped({ targetUid: "target_1", newRole: "galactic_emperor" }, ctx.devAdmin),
      "invalid-argument"
    );
    await assertRejectsWith(wrapped({ targetUid: "target_1", newRole: "" }, ctx.devAdmin), "invalid-argument");
    await assertRejectsWith(wrapped({ targetUid: "", newRole: "mobile_user" }, ctx.devAdmin), "invalid-argument");
    await assertRejectsWith(
      wrapped({ targetUid: "../../etc/passwd", newRole: "mobile_user" }, ctx.devAdmin),
      "invalid-argument"
    );
  });

  it("setUserRole BLOCKS self-promotion (cross-user guard)", async () => {
    const wrapped = testEnv.wrap(setUserRole);
    await assertRejectsWith(
      wrapped({ targetUid: "dev_admin_1", newRole: "developer_super_admin" }, ctx.devAdmin),
      "permission-denied"
    );
    await assertRejectsWith(
      wrapped({ targetUid: "admin_1", newRole: "developer_super_admin" }, ctx.clientAdmin),
      "permission-denied"
    );
  });

  it("contentModeration REJECTS invalid action and non-whitelisted collection", async () => {
    const wrapped = testEnv.wrap(contentModeration);
    await assertRejectsWith(
      wrapped({ action: "nuke", contentId: "c1" }, ctx.clientAdmin),
      "invalid-argument"
    );
    await assertRejectsWith(
      wrapped({ action: "approve", contentId: "c1", collection: "system_config" }, ctx.clientAdmin),
      "invalid-argument"
    );
    await assertRejectsWith(
      wrapped({ action: "approve", contentId: "c1", collection: "roles" }, ctx.devAdmin),
      "invalid-argument"
    );
    await assertRejectsWith(wrapped({ action: "approve" }, ctx.clientAdmin), "invalid-argument");
  });

  it("generateUploadUrl REJECTS path traversal and forbidden folders/content types", async () => {
    const wrapped = testEnv.wrap(generateUploadUrl);
    await assertRejectsWith(
      wrapped({ storagePath: "../secrets/key.json", contentType: "image/png" }, ctx.clientAdmin),
      "permission-denied"
    );
    await assertFailsFolder(wrapped, "trash/x.png");
    await assertRejectsWith(
      wrapped({ storagePath: "images/x.png", contentType: "application/x-msdownload" }, ctx.clientAdmin),
      "invalid-argument"
    );
    await assertRejectsWith(
      wrapped({ storagePath: "images/x.png" }, ctx.clientAdmin),
      "invalid-argument"
    );
  });

  // ------------------------------------------------------------------
  // Phase 15 — Privileged User Provisioning
  // ------------------------------------------------------------------
  it("createUser DENIES unauthenticated and mobile_user callers", async () => {
    const wrapped = testEnv.wrap(createUser);
    await assertRejectsWith(
      wrapped({ email: "new@example.com", password: "password123", displayName: "New", role: "mobile_user" }, ctx.none),
      "unauthenticated"
    );
    await assertRejectsWith(
      wrapped({ email: "new@example.com", password: "password123", displayName: "New", role: "mobile_user" }, ctx.mobileUser),
      "permission-denied"
    );
  });

  it("createUser BLOCKS client_super_admin creating developer_super_admin", async () => {
    const wrapped = testEnv.wrap(createUser);
    await assertRejectsWith(
      wrapped({ email: "dev@example.com", password: "password123", displayName: "Dev", role: "developer_super_admin" }, ctx.clientAdmin),
      "permission-denied"
    );
  });

  it("createUser BLOCKS developer_super_admin creating developer_super_admin via API (offline CLI only)", async () => {
    const wrapped = testEnv.wrap(createUser);
    await assertRejectsWith(
      wrapped({ email: "dev@example.com", password: "password123", displayName: "Dev", role: "developer_super_admin" }, ctx.devAdmin),
      "invalid-argument"
    );
  });

  it("createUser REJECTS invalid payload (short password, missing fields, arbitrary roles)", async () => {
    const wrapped = testEnv.wrap(createUser);
    await assertRejectsWith(
      wrapped({ email: "", password: "password123", displayName: "Dev", role: "mobile_user" }, ctx.devAdmin),
      "invalid-argument"
    );
    await assertRejectsWith(
      wrapped({ email: "test@example.com", password: "123", displayName: "Dev", role: "mobile_user" }, ctx.devAdmin),
      "invalid-argument"
    );
    await assertRejectsWith(
      wrapped({ email: "test@example.com", password: "password123", displayName: "", role: "mobile_user" }, ctx.devAdmin),
      "invalid-argument"
    );
    await assertRejectsWith(
      wrapped({ email: "test@example.com", password: "password123", displayName: "Dev", role: "super_god_admin" }, ctx.devAdmin),
      "invalid-argument"
    );
  });

  // ------------------------------------------------------------------
  // Phase 10 — deleteUserPermanently RBAC & Safety Guards
  // ------------------------------------------------------------------
  it("deleteUserPermanently DENIES unauthenticated caller", async () => {
    const wrapped = testEnv.wrap(deleteUserPermanently);
    await assertRejectsWith(wrapped({ targetUid: "target_user_1" }, ctx.none), "unauthenticated");
  });

  it("deleteUserPermanently DENIES mobile_user caller", async () => {
    const wrapped = testEnv.wrap(deleteUserPermanently);
    await assertRejectsWith(wrapped({ targetUid: "target_user_1" }, ctx.mobileUser), "permission-denied");
  });

  it("deleteUserPermanently DENIES client_super_admin caller (DEVELOPER ONLY)", async () => {
    const wrapped = testEnv.wrap(deleteUserPermanently);
    await assertRejectsWith(wrapped({ targetUid: "target_user_1" }, ctx.clientAdmin), "permission-denied");
  });

  it("deleteUserPermanently DENIES suspended admin caller", async () => {
    const wrapped = testEnv.wrap(deleteUserPermanently);
    await assertRejectsWith(wrapped({ targetUid: "target_user_1" }, ctx.suspendedAdmin), "permission-denied");
  });

  it("deleteUserPermanently BLOCKS self-deletion (anti-suicide guard)", async () => {
    const wrapped = testEnv.wrap(deleteUserPermanently);
    await assertRejectsWith(wrapped({ targetUid: "dev_admin_1" }, ctx.devAdmin), "permission-denied");
  });

  it("deleteUserPermanently REJECTS invalid or missing targetUid", async () => {
    const wrapped = testEnv.wrap(deleteUserPermanently);
    await assertRejectsWith(wrapped({ targetUid: "" }, ctx.devAdmin), "invalid-argument");
    await assertRejectsWith(wrapped({ targetUid: "../../etc/passwd" }, ctx.devAdmin), "invalid-argument");
    await assertRejectsWith(wrapped({}, ctx.devAdmin), "invalid-argument");
  });
});

async function assertFailsFolder(wrapped: any, path: string): Promise<void> {
  await assertRejectsWith(
    wrapped({ storagePath: path, contentType: "image/png" }, ctx.clientAdmin),
    "permission-denied"
  );
}
