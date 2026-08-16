# BACKEND + FIREBASE STORAGE RED-TEAM SECURITY & CODE-LOOPHOLE AUDIT REPORT

**Project:** Santmat Satsang Prachar Admin Panel & Backend  
**Audit Type:** Strict Read-Only Red-Team Security & Code-Loophole Audit  
**Auditor:** Senior Security Engineer + Red-Team Tester  
**Date:** 2026-08-14  
**Verdict:** BLOCKED — CRITICAL VULNERABILITY

---

## 1. EXECUTIVE SUMMARY

A comprehensive, read-only red-team security and code-loophole audit was performed across the backend infrastructure, Firebase Storage rules, Firestore security rules, Cloud Functions, media processing pipelines, and storage policy engines of the Santmat Satsang Prachar platform.

The audit revealed **6 Critical (P0)** security vulnerabilities that allow unauthorized remote data destruction, unauthenticated media catalog overwrites, plaintext OAuth secret exposure, irreversible encryption data loss, privilege retention post-suspension, and total tenant-isolation bypass. In addition, **7 High (P1)**, **5 Medium (P2)**, and **3 Low (P3)** vulnerabilities were identified across 30 audited categories.

```text
============================================================
FINAL SECURITY VERDICT:
BLOCKED — CRITICAL VULNERABILITY
============================================================
```

---

## 2. SCOPE

### In-Scope:
- `backend/**` (Storage Engine, Security Engine, Router, Policy Engine, Observability, Media Processing, CDN, AI, Upload Pipeline)
- `backend/storage/**`
- `backend/firebase/functions/**` & `firebase/functions/**`
- `firebase/storage.rules`
- `firebase/firestore.rules`
- `firebase.json` & `storage.yaml`
- Authentication / Authorization backend implementations

### Out-of-Scope:
- `admin-panel/**` (UI)
- Flutter / Mobile application (`mobile/**`)

---

## 3. THREAT MODEL

The threat model evaluates risks from four primary adversary profiles:
1. **Unauthenticated External Attacker:** Attempts path traversal, executable upload, public data harvesting, or brute-forcing unlisted media objects.
2. **Malicious / Compromised Mobile User (`mobile_user`):** Attempts self-promotion to `client_super_admin` or `developer_super_admin`, parameter tampering, avatar overwrites, or tenant data access.
3. **Rogue Client Admin (`client_super_admin`):** Attempts cross-tenant data access, modifying `developer_super_admin` accounts, or exceeding storage/upload constraints.
4. **Suspended / Revoked Account:** Attempts to use cached/stale ID tokens to perform actions after account demotion or suspension.

---

## 4. AUTHENTICATION FINDINGS

- **Finding:** Firebase Auth token validation relies on stateless JWTs signed for 1 hour.
- **Vulnerability:** On role demotion or account suspension, `syncUserCustomClaims` sets new custom claims in Firebase Auth but fails to invoke `admin.auth().revokeRefreshTokens(userId)`.
- **Impact:** Suspended or demoted users retain full administrative privileges for up to 3,600 seconds post-revocation.

---

## 5. CUSTOM CLAIM FINDINGS

- **Finding:** `syncUserCustomClaims` in `firebase/functions/src/iam.ts` updates custom claims asynchronously on Firestore `users/{userId}` writes.
- **Vulnerability:** Because claims are refreshed asynchronously on the client only when the ID token is re-issued, a user modified in Firestore continues operating with legacy claims until token expiration.

---

## 6. RBAC FINDINGS

- **Finding:** The system defines a strict 3-role model (`developer_super_admin`, `client_super_admin`, `mobile_user`).
- **Vulnerability:** `backend/storage/Security/StorageSecurityEngine.ts` (line 562) checks `if (claims.admin === true) return true;` and includes `platform_admin` in `adminRoles`.
- **Impact:** Non-conforming legacy tokens containing `{ admin: true }` bypass 3-role model restrictions and gain administrative storage overrides.

---

## 7. STORAGE RULES FINDINGS

- **Finding:** `firebase/storage.rules` implements helper functions `isDeveloperSuperAdmin()`, `isClientSuperAdmin()`, `isAdmin()`, `isNotExecutable()`, and MIME/size validators.
- **Vulnerabilities:**
  1. Complete omission of tenant scoping (`organizationId`).
  2. Unrestricted public read (`allow read: if true;`) across `/audio/`, `/books/`, `/video/`, `/documents/`, `/banners/`.
  3. Case-sensitive extension checking in `isNotExecutable()` allowing `.EXE` and `.PHP` uploads.

---

## 8. TENANT ISOLATION FINDINGS

- **Finding:** `organizationId` is present in Firestore user documents and custom claims.
- **Vulnerability:** Neither `firebase/storage.rules` nor `firebase/firestore.rules` validate `request.auth.token.organizationId` against resource parameters for admin rules.
- **Impact:** A `client_super_admin` of Organization A can read, write, or delete resources belonging to Organization B.

---

## 9. PUBLIC READ FINDINGS

- **Finding:** All major content storage buckets (`/audio/`, `/books/`, `/video/`, `/documents/`, `/banners/`) grant `allow read: if true;`.
- **Vulnerability:** Firebase Storage has no concept of content publication state (draft, scheduled, unpublished). Any file uploaded to storage is publicly downloadable if the path is known.

---

## 10. UPLOAD SECURITY FINDINGS

- **Finding:** Extension and MIME validators exist in `firebase/storage.rules`.
- **Vulnerabilities:**
  1. `isNotExecutable()` regex lacks the case-insensitive `(?i)` flag, allowing uppercase executable extensions (`.EXE`, `.PHP`).
  2. `upload_pipeline.ts` endpoint `processUploadPipeline` allows any authenticated `mobile_user` to set media status to `ready` and overwrite catalog records.

---

## 11. PROVIDER FINDINGS

- **Finding:** Multi-provider storage architecture (`Firebase`, `S3`, `GCS`, `Azure`, `Local`).
- **Vulnerabilities:**
  1. Core S3 Provider methods (`delete`, `copy`, `move`, `setLegalHold`) are hardcoded no-ops while advertising full capabilities.
  2. GCS, Azure, and Local providers use in-memory `Map` instances, losing stored files on cold starts.

---

## 12. ROUTER FINDINGS

- **Finding:** Two competing storage routers exist (`StorageRouter.ts` and `StorageRouterV2.ts`).
- **Vulnerabilities:**
  1. `StorageRouterV2.ts` (line 440) passes `Buffer.alloc(0)` to `provider.upload`, truncating uploaded files to 0 bytes.
  2. `StorageRouterV2.selectWithPolicyEngine` invokes an async policy engine synchronously without `await`, throwing a `TypeError`.

---

## 13. POLICY ENGINE FINDINGS

- **Finding:** `StoragePolicyEngine` evaluates path constraints, file size limits, and executable blocks.
- **Vulnerability:** `UploadPipelineEngine` directly instantiates `FirebaseStorageProvider`, completely bypassing `StoragePolicyEngine` and `storage.yaml` policy checks.

---

## 14. CLOUD FUNCTION FINDINGS

- **Finding:** Firebase Cloud Functions in `firebase/functions/src/`.
- **Vulnerabilities:**
  1. `enqueueTask` in `queue_triggers.ts` uses `requireAuth` instead of `requireAdmin`, allowing regular users to enqueue `TRASH_CLEANUP` tasks to wipe arbitrary database collections and storage paths.
  2. `enqueueTask` allows regular users to enqueue `BULK_NOTIFICATION` tasks, broadcasting unmoderated push messages to all platform users.

---

## 15. MEDIA PIPELINE FINDINGS

- **Finding:** Storage `onFinalize` trigger `onStorageObjectFinalized` in `storage_triggers.ts`.
- **Vulnerability:** Reads client-supplied storage object metadata (`publishNotification`, `notifyTopic`, `mediaId`) to dispatch push notifications and overwrite Firestore media documents without admin authorization.

---

## 16. RETRY / IDEMPOTENCY FINDINGS

- **Finding:** Retry engines in `WorkerPool.ts` and `UploadPipelineEngine.ts`.
- **Vulnerabilities:**
  1. Retrying failed jobs in `WorkerPool.ts` updates status to `retrying` but fails to delete job locks from `lockMap`, permanently deadlocking failed jobs.
  2. Replaying a DLQ job in `UploadPipelineEngine.ts` passes `Buffer.from('replayed_content')`, overwriting original files with 16 dummy bytes.

---

## 17. SECRET MANAGEMENT FINDINGS

- **Finding:** Secret handling in Cloud Functions and configuration loaders.
- **Vulnerabilities:**
  1. Hardcoded Google OAuth client secret (`client_secret: "j9iVZfS8kkCEFUPaAeJV0sAi"`) committed in `bootstrap_cli.ts` source code and written to world-readable `/tmp/firebase_cli_adc.json`.
  2. Ephemeral random 32-byte key generation in `StorageSecurityEngine.ts` `encryptData` and `decryptData`, rendering encrypted files permanently irrecoverable.

---

## 18. SIGNED URL FINDINGS

- **Finding:** Signed URL generation in `FirebaseStorageProvider`, `S3SignedUrlService`, and `SignedURLPlatform`.
- **Vulnerabilities:**
  1. `SignedURLPlatform.validateToken` checks only `token.startsWith('sig_')` without verifying HMAC signatures.
  2. Presigned POST policy in `S3SignedUrlService` returns a hardcoded fake signature string `'computed-signature'`.
  3. `media.ts` allows signed URL expiration up to 7 days (604,800 seconds).

---

## 19. OBSERVABILITY FINDINGS

- **Finding:** Logging and audit capabilities in Cloud Functions and Storage engines.
- **Vulnerability:** Unsanitized error messages and telemetry parameters in logging output; missing correlation ID propagation across storage provider operations.

---

## 20. DUPLICATE IMPLEMENTATION FINDINGS

- **Finding:** Duplicate implementations of Storage Routers (`StorageRouter.ts` vs `StorageRouterV2.ts`), Provider Registries, and Auth Context hooks.
- **Impact:** Divergent security contracts and execution paths depending on whether legacy or V2 modules are imported.

---

## 21. CONFIGURATION FINDINGS

- **Finding:** `storage.yaml` and `StorageConfigLoader.ts`.
- **Vulnerabilities:**
  1. Environment variable substitution regex only matches exact single-token strings, failing for embedded variables.
  2. `storage.yaml` template contains permissive `localhost` CORS origins and wildcard allowed headers.

---

## 22. TEST QUALITY FINDINGS

- **Finding:** Storage unit and integration tests in `backend/storage/__tests__/`.
- **Vulnerability:** All integration tests run with `memoryFallback: true` against in-memory JavaScript `Map` instances, completely masking real storage provider SDK, authentication, and network failures in CI.

---

## 23. PRODUCTION-READINESS CLAIM AUDIT

- **Finding:** Codebase comments and documentation claiming "Enterprise Production Ready".
- **Verdict:** Unsubstantiated. Multiple core subsystems (AI Vision/Audio intelligence, Content Moderation, CDN Providers, S3 methods) are hardcoded stubs or mocks.

---

## 24. P0 FINDINGS (CRITICAL VULNERABILITIES)

1. **SEC-P0-01:** Remote Arbitrary Data Destruction via `enqueueTask` (`queue_triggers.ts:114`)
2. **SEC-P0-02:** Storage `onFinalize` Unvalidated Metadata Push Notification & Overwrite (`storage_triggers.ts:64`)
3. **SEC-P0-03:** Unauthorized Media Catalog Overwrite via `processUploadPipeline` (`upload_pipeline.ts:10`)
4. **SEC-P0-04:** Hardcoded Google OAuth Client Secret & World-Readable ADC File (`bootstrap_cli.ts:27`)
5. **SEC-P0-05:** Irreversible Data Loss in Encryption / Decryption Methods (`StorageSecurityEngine.ts:381`)
6. **SEC-P0-06:** Stale ID Token Privilege Retention & Complete Tenant Isolation Failure (`iam.ts:9`, `storage.rules:143`, `firestore.rules:41`)

---

## 25. P1 FINDINGS (HIGH SEVERITY)

1. **SEC-P1-01:** Arbitrary Collection State Injection via `triggerAITask` (`ai_triggers.ts:115`)
2. **SEC-P1-02:** Fake CDN Signed Token Validation Bypass (`SignedURLPlatform.ts:6`)
3. **SEC-P1-03:** Heap Out-of-Memory DoS via Buffer Allocation in WorkerPool (`WorkerPool.ts:69`)
4. **SEC-P1-04:** Permanent Job Lock & Memory Leak on Retries (`WorkerPool.ts:96`)
5. **SEC-P1-05:** Permanent Data Destruction upon DLQ Replay (`UploadPipelineEngine.ts:321`)
6. **SEC-P1-06:** StorageRouterV2 0-Byte Truncation Bug (`StorageRouterV2.ts:440`)
7. **SEC-P1-07:** Ineffective No-Op Input Sanitizer (`utils.ts:99`)

---

## 26. P2 FINDINGS (MEDIUM SEVERITY)

1. **SEC-P2-01:** Fake 32-Bit SHA-256 Checksum Implementation (`StorageProviderFactory.ts:507`)
2. **SEC-P2-02:** Non-Deterministic Random Checksum Fallback (`MediaValidator.ts:47`)
3. **SEC-P2-03:** Case-Sensitive Executable Extension Regex in Storage Rules (`storage.rules:56`)
4. **SEC-P2-04:** IDOR in `updateUserRecommendations` (`recommendations.ts:22`)
5. **SEC-P2-05:** Cross-Tenant Role Assignment in `setUserRole` (`iam.ts:78`)

---

## 27. P3 FINDINGS (LOW SEVERITY & TECHNICAL DEBT)

1. **SEC-P3-01:** Split Router & Factory Architectures (`StorageRouter.ts` vs `StorageRouterV2.ts`)
2. **SEC-P3-02:** Hardcoded Mock AI and CDN Subsystems Claiming "Production Ready"
3. **SEC-P3-03:** `isOwner` Helper in `firestore.rules:32` Omits `isActive()`

---

## 28. POSITIVE SECURITY CONTROLS VERIFIED

1. **3-Role Permission Model:** Strict compliance with `developer_super_admin`, `client_super_admin`, and `mobile_user` in active rule evaluations. Zero active legacy roles.
2. **Self-Promotion Guard in `setUserRole`:** Prevents users from modifying their own role (`targetUid !== callerUid`).
3. **Executable Blacklist in Storage Rules:** Helper function `isNotExecutable()` blocks `.exe`, `.sh`, `.bat`, `.php`, `.py`, `.apk` extensions and dangerous MIME types.
4. **Disabled Public Bootstrap Endpoint:** Callable endpoint `bootstrapDeveloperSuperAdmin` in `iam.ts` is permanently disabled and throws `unauthenticated`.

---

## 29. RECOMMENDED FIX ORDER

1. **Fix SEC-P0-01 & SEC-P0-03:** Add `requireAdmin` to `enqueueTask` and `revokeRefreshTokens` in `iam.ts`.
2. **Fix SEC-P0-02 & SEC-P0-03:** Add `requireAdmin` to `processUploadPipeline` and remove client metadata trust in `storage_triggers.ts`.
3. **Fix SEC-P0-04:** Rotate Google OAuth client secret in GCP Console and remove hardcoded secrets from codebase.
4. **Fix SEC-P0-05:** Implement real KMS envelope encryption in `StorageSecurityEngine.ts`.
5. **Fix SEC-P0-06:** Implement `isTenantAdmin` tenant isolation in `firestore.rules` and `storage.rules`.
6. **Fix SEC-P1-01 to SEC-P1-07:** Implement real HMAC-SHA256 in `SignedURLPlatform`, streaming in `WorkerPool`, real S3 SDK methods, DLQ replay buffer fix, real HTML entity sanitizer in `utils.ts`.
7. **Fix SEC-P2-01 to SEC-P3-03:** Use real SHA-256 in provider factory, add `(?i)` flag to extension regex, fix IDORs, add `isActive()` checks in rules.

---

## 30. FINAL SECURITY VERDICT

```text
============================================================
FINAL SECURITY VERDICT:
BLOCKED — CRITICAL VULNERABILITY
============================================================
```

**Reason:** Critical P0 vulnerabilities exist in Cloud Functions (`enqueueTask`, `processUploadPipeline`, `onStorageObjectFinalized`), authentication credentials (`bootstrap_cli.ts`), cryptographic key management (`StorageSecurityEngine.ts`), token revocation (`iam.ts`), and security rules tenant scoping (`storage.rules` / `firestore.rules`). Remediation and verification are required before release.
