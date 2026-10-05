/**
 * WAVE 5 — Firestore + Storage SECURITY RULES EMULATOR TEST SUITE
 *
 * Proves: DENIAL (cross-user), OWNERSHIP, RBAC, SUSPENSION enforcement,
 * and NEGATIVE cases against firebase/firestore.rules and firebase/storage.rules.
 *
 * Requires Firebase Emulators: auth (9099), firestore (8080), storage (9199).
 * Run via root script: npm run test:security
 *   firebase emulators:exec --only firestore,auth,storage \
 *     "node --test firebase/security-tests/*.test.mjs"
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert";
import { before, after, describe, it } from "node:test";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";

import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  deleteObject,
  getBytes,
} from "firebase/storage";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ID = "demo-santmat-wave5-security";

const firestoreRules = readFileSync(join(__dirname, "../firestore.rules"), "utf8");
const storageRules = readFileSync(join(__dirname, "../storage.rules"), "utf8");

/** Role claim presets (mirror iam.ts syncUserCustomClaims output) */
const CLAIMS = {
  mobileUser: { role: "mobile_user", admin: false, accountStatus: "active", organizationId: "org_santmat_global" },
  suspendedUser: { role: "mobile_user", admin: false, accountStatus: "suspended", organizationId: "org_santmat_global" },
  clientAdmin: { role: "client_super_admin", admin: true, accountStatus: "active", organizationId: "org_santmat_global" },
  devAdmin: { role: "developer_super_admin", admin: true, accountStatus: "active", organizationId: "org_santmat_global" },
};

let testEnv;

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: firestoreRules },
    storage: { rules: storageRules },
  });

  // ---- Seed baseline data with rules disabled (admin bootstrap) ----
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const adminDb = ctx.firestore();
    const set = (path, data) => adminDb.doc(path).set(data);

    await Promise.all([
      set("users/userA", { uid: "userA", displayName: "User A", role: "mobile_user" }),
      set("users/userB", { uid: "userB", displayName: "User B", role: "mobile_user" }),
      set("users/clientAdmin", { uid: "clientAdmin", role: "client_super_admin" }),
      set("users/devAdmin", { uid: "devAdmin", role: "developer_super_admin" }),

      // Public content
      set("audio/audio1", { title: "Bhajan 1", public: true }),
      set("notifications/broadcast1", { title: "Global satsang announcement", isRead: false }),
      set("notifications/targeted-for-B", { title: "Private notice for B", userId: "userB", isRead: false }),

      // User B private state
      set("users/userB/favorite_audios/audio1", { favoritedAt: "2026-01-01T00:00:00Z" }),
      set("users/userB/library/audio1_audio", { sessionProgress: 42, accessedDate: "2026-01-01" }),
      set("preferences/userB", { notification: { sound: true } }),
      set("user_devotional_data/userB", { favorites: ["audio1"], stats: { plays: 7 } }),
      set("downloads/dl_B", { userId: "userB", mediaId: "audio1" }),
      set("media_statistics/userA_audio1", { playCount: 1 }),

      // Playlists
      set("playlists/pl_public", {
        ownerId: "userB",
        visibility: "public",
        collaborators: [],
        name: "B Public Playlist",
        trackIds: ["audio1"],
      }),
      set("playlists/pl_private_B", {
        ownerId: "userB",
        visibility: "private",
        collaborators: ["userCollab"],
        name: "B Private Playlist",
        trackIds: ["audio1"],
      }),

      // Admin-governed collections
      set("system_config/platform", { setting: "locked-to-dev-admin" }),
      set("audit_logs/log1", { action: "SEED" }),
      set("roles/role1", { name: "base" }),

      // Public content doc for books collection
      set("books/book1", { title: "Granthis" }),
    ]);

    // ---- Seed real Storage objects (rules disabled) so denial tests are
    // not vacuous due to object-not-found rejections ----
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const adminStorage = ctx.storage();
    await Promise.all([
      adminStorage.ref("images/banner-admin-uploaded.png").put(png, { contentType: "image/png" }),
      adminStorage.ref("temp/userA/work.bin").put(png, { contentType: "application/octet-stream" }),
      adminStorage.ref("avatars/userB/me.png").put(png, { contentType: "image/png" }),
      adminStorage.ref("backups/db.zip").put(png, { contentType: "application/zip" }),
    ]);
  });
});

after(async () => {
  await testEnv.cleanup();
});

// ---------------------------------------------------------------------------
// Context helpers
// ---------------------------------------------------------------------------
const db = (ctx) => ctx.firestore();
const unauth = () => testEnv.unauthenticatedContext();
const userA = () => testEnv.authenticatedContext("userA", CLAIMS.mobileUser);
const userB = () => testEnv.authenticatedContext("userB", CLAIMS.mobileUser);
const collab = () => testEnv.authenticatedContext("userCollab", CLAIMS.mobileUser);
const suspended = () => testEnv.authenticatedContext("suspendedUser", CLAIMS.suspendedUser);
const clientAdmin = () => testEnv.authenticatedContext("clientAdmin", CLAIMS.clientAdmin);
const devAdmin = () => testEnv.authenticatedContext("devAdmin", CLAIMS.devAdmin);

// ===========================================================================
// PHASE 3 — CROSS-USER SECURITY (all must be DENIED)
// ===========================================================================
describe("Phase 3 — Cross-user denial (User A vs User B)", () => {
  it("DENIES A reading B profile", async () => {
    await assertFails(getDoc(doc(db(userA()), "users/userB")));
  });

  it("ALLOWS B reading own profile; DENIES A writing B profile", async () => {
    await assertSucceeds(getDoc(doc(db(userB()), "users/userB")));
    await assertFails(updateDoc(doc(db(userA()), "users/userB"), { hacked: true }));
  });

  it("DENIES A reading/writing B preferences", async () => {
    await assertFails(getDoc(doc(db(userA()), "preferences/userB")));
    await assertFails(setDoc(doc(db(userA()), "preferences/userB"), { hijacked: true }, { merge: true }));
    await assertFails(deleteDoc(doc(db(userA()), "preferences/userB")));
  });

  it("DENIES A reading/modifying B favorites", async () => {
    await assertFails(getDoc(doc(db(userA()), "users/userB/favorite_audios/audio1")));
    await assertFails(
      setDoc(doc(db(userA()), "users/userB/favorite_audios/audio1"), { favoritedAt: "evil" })
    );
    await assertFails(deleteDoc(doc(db(userA()), "users/userB/favorite_audios/audio1")));
  });

  it("DENIES A modifying B playback progress/library state", async () => {
    await assertFails(
      updateDoc(doc(db(userA()), "users/userB/library/audio1_audio"), { sessionProgress: 0 })
    );
    await assertSucceeds(
      updateDoc(doc(db(userB()), "users/userB/library/audio1_audio"), { sessionProgress: 99 })
    );
  });

  it("DENIES A reading/modifying B devotional data and downloads", async () => {
    await assertFails(getDoc(doc(db(userA()), "user_devotional_data/userB")));
    await assertFails(setDoc(doc(db(userA()), "user_devotional_data/userB"), { favorites: [] }));
    await assertFails(getDoc(doc(db(userA()), "downloads/dl_B")));
    await assertFails(deleteDoc(doc(db(userA()), "downloads/dl_B")));
  });

  it("ENFORCES ownership on downloads create (userId binding)", async () => {
    const a = db(userA());
    await assertSucceeds(setDoc(doc(a, "downloads/dl_A_new"), { userId: "userA", mediaId: "audio1" }));
    await assertFails(setDoc(doc(a, "downloads/dl_spoof"), { userId: "userB", mediaId: "audio1" }));
  });

  it("ALLOWS admins cross-user reads but keeps mobile_user denied", async () => {
    await assertSucceeds(getDoc(doc(db(clientAdmin()), "users/userB")));
    await assertSucceeds(getDoc(doc(db(devAdmin()), "preferences/userB")));
    await assertSucceeds(getDoc(doc(db(clientAdmin()), "downloads/dl_B")));
  });
});

// ===========================================================================
// PHASE 4 — RBAC / ROLE ENFORCEMENT / NO SELF-ESCALATION
// ===========================================================================
describe("Phase 4 — RBAC and privilege-escalation prevention", () => {
  it("DENIES mobile_user granting themselves a role via own profile create/update", async () => {
    const a = db(userA());
    await assertFails(
      setDoc(doc(a, "users/newSelfPromoted"), { uid: "newSelfPromoted", role: "developer_super_admin" })
    );
    await assertFails(updateDoc(doc(a, "users/userA"), { role: "developer_super_admin" }));
    await assertFails(updateDoc(doc(a, "users/userA"), { accountStatus: "active", admin: true }));
  });

  it("ALLOWS mobile_user canonical self-profile creation ONLY with mobile_user/active", async () => {
    const r = testEnv.authenticatedContext("new_registered", CLAIMS.mobileUser);
    await assertSucceeds(
      setDoc(doc(db(r), "users/new_registered"), {
        uid: "new_registered",
        email: "reg@example.com",
        displayName: "New User",
        role: "mobile_user",
        status: "active",
      })
    );
    // Client can never create a privileged role or a suspended status
    const c = testEnv.authenticatedContext("newClientAdmin", CLAIMS.mobileUser);
    await assertFails(
      setDoc(doc(db(c), "users/newClientAdmin"), { uid: "newClientAdmin", role: "client_super_admin", status: "active" })
    );
    const s = testEnv.authenticatedContext("newSuspended", CLAIMS.mobileUser);
    await assertFails(
      setDoc(doc(db(s), "users/newSuspended"), { uid: "newSuspended", role: "mobile_user", status: "suspended" })
    );
    // Owner can never change role/status on an existing profile
    await assertFails(updateDoc(doc(db(r), "users/new_registered"), { role: "client_super_admin" }));
    await assertFails(updateDoc(doc(db(r), "users/new_registered"), { status: "suspended" }));
  });

  it("DENIES client_super_admin escalating anyone to developer_super_admin", async () => {
    const c = db(clientAdmin());
    await assertFails(setDoc(doc(c, "users/victimUp"), { uid: "victimUp", role: "developer_super_admin" }));
    await assertFails(updateDoc(doc(c, "users/userA"), { role: "developer_super_admin" }));
    await assertFails(updateDoc(doc(c, "users/userA"), { roleIds: ["developer_super_admin"] }));
  });

  it("ALLOWS client_super_admin managing non-developer users", async () => {
    await assertSucceeds(
      updateDoc(doc(db(clientAdmin()), "users/userA"), { displayName: "Renamed by client admin" })
    );
  });

  it("LOCKS system_config to developer_super_admin only", async () => {
    await assertFails(updateDoc(doc(db(clientAdmin()), "system_config/platform"), { setting: "owned" }));
    await assertFails(updateDoc(doc(db(userA()), "system_config/platform"), { setting: "owned" }));
    await assertSucceeds(updateDoc(doc(db(devAdmin()), "system_config/platform"), { setting: "dev-tuned" }));
  });

  it("LOCKS audit_logs: no client writes, developer read-only", async () => {
    await assertFails(setDoc(doc(db(devAdmin()), "audit_logs/tamper"), { action: "TAMPER" }));
    await assertFails(getDoc(doc(db(clientAdmin()), "audit_logs/log1")));
    await assertSucceeds(getDoc(doc(db(devAdmin()), "audit_logs/log1")));
  });

  it("DENIES client_super_admin deleting developer_super_admin account", async () => {
    await assertFails(deleteDoc(doc(db(clientAdmin()), "users/devAdmin")));
  });

  it("DENIES mobile_user writing to roles or permissions collections", async () => {
    await assertFails(setDoc(doc(db(userA()), "roles/injected"), { name: "admin" }));
    await assertFails(setDoc(doc(db(userA()), "permissions/injected"), { action: "all" }));
  });

  it("DENIES unauthenticated access to protected content collections", async () => {
    await assertFails(getDoc(doc(db(unauth()), "users/userA")));
    await assertFails(getDoc(doc(db(unauth()), "media/media1")));
    await assertFails(getDoc(doc(db(unauth()), "media_statistics/userA_audio1")));
  });

  it("ALLOWS public content reads for everyone including unauthenticated", async () => {
    await assertSucceeds(getDoc(doc(db(unauth()), "audio/audio1")));
    await assertSucceeds(getDoc(doc(db(userA()), "books/book1")));
  });
});

// ===========================================================================
// PHASE 13 — NOTIFICATION SECURITY
// ===========================================================================
describe("Phase 13 — Notification ownership", () => {
  it("KEEPS broadcast notifications publicly readable", async () => {
    await assertSucceeds(getDoc(doc(db(unauth()), "notifications/broadcast1")));
    await assertSucceeds(getDoc(doc(db(userA()), "notifications/broadcast1")));
  });

  it("DENIES User A reading User B targeted notification; ALLOWS B", async () => {
    await assertFails(getDoc(doc(db(userA()), "notifications/targeted-for-B")));
    await assertFails(getDoc(doc(db(unauth()), "notifications/targeted-for-B")));
    await assertSucceeds(getDoc(doc(db(userB()), "notifications/targeted-for-B")));
    await assertSucceeds(getDoc(doc(db(clientAdmin()), "notifications/targeted-for-B")));
  });

  it("DENIES mobile_user mutating shared notifications collection", async () => {
    await assertFails(updateDoc(doc(db(userA()), "notifications/broadcast1"), { isRead: true }));
    await assertFails(setDoc(doc(db(userA()), "notifications/inject"), { title: "phishing", body: "x" }));
    await assertFails(deleteDoc(doc(db(userA()), "notifications/broadcast1")));
  });

  it("SCOPES per-user read-state under users/{uid}/notification_state", async () => {
    await assertSucceeds(
      setDoc(doc(db(userA()), "users/userA/notification_state/broadcast1"), { isRead: true }, { merge: true })
    );
    await assertFails(
      setDoc(doc(db(userA()), "users/userB/notification_state/broadcast1"), { isRead: true }, { merge: true })
    );
  });
});

// ===========================================================================
// PHASE 14 — PLAYLIST SECURITY
// ===========================================================================
describe("Phase 14 — Playlist ownership and collaboration", () => {
  it("DENIES non-owner reading private playlist; ALLOWS owner and collaborator", async () => {
    await assertFails(getDoc(doc(db(userA()), "playlists/pl_private_B")));
    await assertSucceeds(getDoc(doc(db(userB()), "playlists/pl_private_B")));
    await assertSucceeds(getDoc(doc(db(collab()), "playlists/pl_private_B")));
  });

  it("ALLOWS anyone authenticated reading public playlist", async () => {
    await assertSucceeds(getDoc(doc(db(userA()), "playlists/pl_public")));
  });

  it("DENIES non-owner/collaborator updating playlist", async () => {
    await assertFails(
      updateDoc(doc(db(userA()), "playlists/pl_private_B"), { name: "hijacked" })
    );
  });

  it("ALLOWS collaborator content edits but DENIES ownership reassignment", async () => {
    const c = db(collab());
    await assertSucceeds(
      updateDoc(doc(c, "playlists/pl_private_B"), { trackIds: ["audio2"] })
    );
    await assertFails(updateDoc(doc(c, "playlists/pl_private_B"), { ownerId: "userCollab" }));
  });

  it("DENIES non-owner delete; ALLOWS owner delete of own playlist", async () => {
    const b = db(userB());
    await assertSucceeds(setDoc(doc(b, "playlists/pl_toDelete"), { ownerId: "userB", visibility: "private", collaborators: [] }));
    await assertFails(deleteDoc(doc(db(userA()), "playlists/pl_toDelete")));
    await assertSucceeds(deleteDoc(doc(b, "playlists/pl_toDelete")));
  });

  it("ENFORCES creator ownership on create (no creating playlists owned by others)", async () => {
    await assertFails(
      setDoc(doc(db(userA()), "playlists/pl_spoof"), { ownerId: "userB", visibility: "public", collaborators: [] })
    );
    await assertFails(
      setDoc(doc(db(unauth()), "playlists/pl_anon"), { ownerId: "userA", visibility: "public", collaborators: [] })
    );
  });

  it("DENIES suspended user creating playlists", async () => {
    await assertFails(
      setDoc(doc(db(suspended()), "playlists/pl_susp"), { ownerId: "suspendedUser", visibility: "public", collaborators: [] })
    );
  });
});

// ===========================================================================
// PHASE 12 — MEDIA / PROGRESS / STATS INTEGRITY
// ===========================================================================
describe("Phase 12 — Media statistics integrity (no forged analytics)", () => {
  it("DENIES mobile_user writing media_statistics", async () => {
    const a = db(userA());
    await assertFails(setDoc(doc(a, "media_statistics/forged_1"), { playCount: 999999999 }));
    await assertFails(updateDoc(doc(a, "media_statistics/userA_audio1"), { playCount: 999999999 }));
    await assertFails(deleteDoc(doc(a, "media_statistics/userA_audio1")));
  });

  it("ALLOWS authenticated read and admin write of media_statistics", async () => {
    await assertSucceeds(getDoc(doc(db(userA()), "media_statistics/userA_audio1")));
    await assertSucceeds(
      setDoc(doc(db(clientAdmin()), "media_statistics/audio1"), { playCount: 5 }, { merge: true })
    );
  });
});

// ===========================================================================
// PHASE 8 — SUSPENSION ENFORCEMENT
// ===========================================================================
describe("Phase 8 — Suspended accounts are denied protected operations", () => {
  it("DENIES suspended user owning writes (profile/preferences/progress)", async () => {
    const s = db(suspended());
    await assertFails(setDoc(doc(s, "preferences/suspendedUser"), { any: true }));
    await assertFails(setDoc(doc(s, "users/suspendedUser/notification_state/x"), { isRead: true }));
    await assertFails(setDoc(doc(s, "downloads/dl_susp"), { userId: "suspendedUser", mediaId: "audio1" }));
  });

  it("DENIES suspended user self-restoring accountStatus", async () => {
    await assertFails(updateDoc(doc(db(suspended()), "users/suspendedUser"), { status: "active", accountStatus: "active" }));
  });
});

// ===========================================================================
// PHASE 16 — NEGATIVE TESTS (validation + malformed payloads at rules layer)
// ===========================================================================
describe("Phase 16 — Negative cases", () => {
  it("DENIES support ticket with invalid category/priority/status", async () => {
    const base = {
      submittedBy: "userA",
      subject: "Valid subject",
      message: "Valid message",
      createdAt: "2026-08-23T00:00:00Z",
      contactEmail: "a@example.com",
    };
    const a = db(userA());
    await assertSucceeds(setDoc(doc(collection(a, "support_tickets")), { ...base, category: "bug", priority: "low", status: "open" }));
    await assertFails(setDoc(doc(collection(a, "support_tickets")), { ...base, category: "<script>alert(1)</script>", priority: "low", status: "open" }));
    await assertFails(setDoc(doc(collection(a, "support_tickets")), { ...base, category: "bug", priority: "apocalyptic", status: "open" }));
    await assertFails(setDoc(doc(collection(a, "support_tickets")), { ...base, category: "bug", priority: "low", status: "closed" }));
    await assertFails(setDoc(doc(collection(a, "support_tickets")), { ...base, category: "bug", priority: "low", status: "open", submittedBy: "userB" }));
  });

  it("DENIES catch-all access to undocumented paths", async () => {
    await assertFails(getDoc(doc(db(userA()), "some_random_collection/doc1")));
    await assertFails(setDoc(doc(db(userA()), "interaction_logs/log1"), { x: 1 }));
    await assertFails(getDoc(doc(db(clientAdmin()), "telemetry_events/event1")));
  });

  it("DENIES mobile_user writing admin-managed content collections", async () => {
    const a = db(userA());
    for (const c of ["audio", "books", "stuti_vinati", "search_index", "app_settings"]) {
      await assertFails(setDoc(doc(a, `${c}/injected`), { injected: true }));
    }
  });

  it("ALLOWS admin content management writes", async () => {
    await assertSucceeds(setDoc(doc(db(clientAdmin()), "audio/adminManaged"), { title: "New Bhajan" }));
  });
});

// ===========================================================================
// PHASE 6 — STORAGE RULE AUDIT
// ===========================================================================
describe("Phase 6 — Storage authorization", () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const exe = new Uint8Array([0x4d, 0x5a, 0x90, 0x00]);

  it("ALLOWS unauthenticated public reads of content buckets", async () => {
    await assertSucceeds(
      getBytes(ref(testEnv.unauthenticatedContext().storage(), "images/banner-admin-uploaded.png"))
    );
  });

  it("DENIES unauthenticated uploads everywhere", async () => {
    const s = testEnv.unauthenticatedContext().storage();
    await assertFails(uploadBytes(ref(s, "images/anon.png"), png, { contentType: "image/png" }));
    await assertFails(uploadBytes(ref(s, "audio/anon.mp3"), png, { contentType: "audio/mpeg" }));
    await assertFails(uploadBytes(ref(s, "temp/userA/anon.txt"), png, { contentType: "text/plain" }));
  });

  it("DENIES mobile_user uploads to admin-only content buckets", async () => {
    const s = testEnv.authenticatedContext("userA", CLAIMS.mobileUser).storage();
    await assertFails(uploadBytes(ref(s, "audio/userA.mp3"), png, { contentType: "audio/mpeg" }));
    await assertFails(uploadBytes(ref(s, "books/userA.pdf"), png, { contentType: "application/pdf" }));
    await assertFails(uploadBytes(ref(s, "banners/hack.png"), png, { contentType: "image/png" }));
  });

  it("ALLOWS admin uploads with valid types and DENIES invalid MIME", async () => {
    const s = testEnv.authenticatedContext("clientAdmin", CLAIMS.clientAdmin).storage();
    await assertSucceeds(uploadBytes(ref(s, "images/admin-upload.png"), png, { contentType: "image/png" }));
    // Extension/MIME mismatch (PNG bytes declared as audio)
    await assertFails(uploadBytes(ref(s, "images/mismatch.mp3"), png, { contentType: "audio/mpeg" }));
  });

  it("DENIES executable uploads even by admins", async () => {
    const s = testEnv.authenticatedContext("clientAdmin", CLAIMS.clientAdmin).storage();
    await assertFails(uploadBytes(ref(s, "images/evil.exe"), exe, { contentType: "application/x-msdownload" }));
    await assertFails(uploadBytes(ref(s, "images/evil.sh"), exe, { contentType: "text/x-sh" }));
  });

  it("DENIES SVG uploads (stored-XSS hardening)", async () => {
    const s = testEnv.authenticatedContext("clientAdmin", CLAIMS.clientAdmin).storage();
    const svg = new Uint8Array([0x3c, 0x73, 0x76, 0x67, 0x3e]); // "<svg>"
    await assertFails(uploadBytes(ref(s, "images/xss.svg"), svg, { contentType: "image/svg+xml" }));
  });

  it("ENFORCES avatar ownership: user writes own, not others'", async () => {
    const sa = testEnv.authenticatedContext("userA", CLAIMS.mobileUser).storage();
    const sb = testEnv.authenticatedContext("userB", CLAIMS.mobileUser).storage();
    await assertSucceeds(uploadBytes(ref(sa, "avatars/userA/me.png"), png, { contentType: "image/png" }));
    await assertFails(uploadBytes(ref(sa, "avatars/userB/steal.png"), png, { contentType: "image/png" }));
    await assertFails(deleteObject(ref(sa, "avatars/userB/me.png")));
  });

  it("SCOPES temp files: owner-only read/write", async () => {
    const sa = testEnv.authenticatedContext("userA", CLAIMS.mobileUser).storage();
    const sb = testEnv.authenticatedContext("userB", CLAIMS.mobileUser).storage();
    await assertSucceeds(getBytes(ref(sa, "temp/userA/work.bin")));
    await assertFails(getBytes(ref(sb, "temp/userA/work.bin")));
    await assertFails(uploadBytes(ref(sb, "temp/userA/work.bin"), png, { contentType: "application/octet-stream" }));
  });

  it("DENIES mobile_user trash/export/backup access", async () => {
    const s = testEnv.authenticatedContext("userA", CLAIMS.mobileUser).storage();
    await assertFails(uploadBytes(ref(s, "trash/x.png"), png, { contentType: "image/png" }));
    await assertFails(uploadBytes(ref(s, "exports/x.csv"), png, { contentType: "text/csv" }));
    await assertFails(getBytes(ref(s, "backups/db.zip")));
  });

  it("DENIES undeclared paths via deny-all fallback", async () => {
    const s = testEnv.authenticatedContext("userA", CLAIMS.mobileUser).storage();
    await assertFails(uploadBytes(ref(s, "undeclared/path/file.png"), png, { contentType: "image/png" }));
  });

  it("DENIES mobile_user deleting admin content", async () => {
    const s = testEnv.authenticatedContext("userA", CLAIMS.mobileUser).storage();
    await assertFails(deleteObject(ref(s, "images/banner-admin-uploaded.png")));
  });
});
