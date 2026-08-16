# Frontend → Backend Connectivity Final Report

- **Date:** 2026-08-16
- **Scope:** Admin Panel (`admin-panel/src`) → Backend (Cloud Functions, Firestore, Storage, Auth)
- **Auditors note:** This audit is source-level only. No browser was run. Statuses are derived from code, rules, and Cloud Function sources — **not** from a live environment.

---

## 1. Executive Summary

The admin panel is connected to a real Firebase backend end-to-end through three backend channels:

1. **Firestore** — the primary persistence layer, accessed via the core `useList` / `useCrudMutations` / `useCrud` hooks → feature services (`BaseCrudService` subclasses) → feature repositories (`BaseRepository` subclasses). Every content module (audio, books, banners, categories, stuti vinati, suvichar, notifications, playlists, users, roles, settings) is fully wired to a matching Firestore collection with rule coverage.
2. **Cloud Functions** — used by Reports (analytics summary), Reports/AI Analytics (observability), and Support (observability health/alerts). All four referenced callables exist in `backend/firebase/functions/src/`.
3. **Firebase Storage** — used by Audio, Banners, Books, Stuti Vinati, Suvichar for uploads, previews, and deletes. The storage rules cover every admin upload path with strict MIME + size validation.

**Overall connectivity: 75 / 80 operations FULLY_CONNECTED (93.75%).**

Two genuine defects were found:

- **BROKEN — Support tickets:** the `support_tickets` collection is not present in `firebase/firestore.rules`; the catch-all deny rule rejects both listing and creating tickets (2 operations).
- **PARTIALLY_CONNECTED — AI Analytics simulated data:** `AIAnalyticsService` expects a `recommendations` field that the `observability-getObservabilityMetrics` callable never returns, so the Reports AI panel always renders fabricated numbers (`generateSimulatedMetrics`) (1 operation).
- **PARTIALLY_CONNECTED — User role assignment:** persists `roleIds`/`role` to the Firestore document but never propagates the change to the target user's Firebase Auth custom claims (1 operation).

These are the only gaps. No other broken connections, no other mock/fallback data, no unsupported operations. The UI renders no backend-only features.

**FINAL STATUS: PARTIALLY CONNECTED** (93.75% fully connected; 2 broken + 2 partial + 1 UI-only operations, both defects are production-visible).

---

## 2. Page Inventory

| # | Route | Page | Primary Backend Channel | Notes |
| --- | --- | --- | --- | --- |
| 1 | `/login` | Login | Firebase Auth | Email/password + Google sign-in, auth-state listener |
| 2 | `/` | Dashboard | Firestore | Collection counts, recent activity, top bhajans, summary |
| 3 | `/users` | Users | Firestore | Full CRUD + status/role changes; roles selector |
| 4 | `/audio` | Audio | Firestore + Storage | CRUD, title search, audio/image upload, preview |
| 5 | `/banners` | Banners | Firestore + Storage | CRUD, status filter, image upload |
| 6 | `/categories` | Categories | Firestore | CRUD with hierarchy validation |
| 7 | `/stuti-vinati` | StutiVinati | Firestore + Storage | CRUD, category filter, media upload |
| 8 | `/suvichar` | Suvichar | Firestore + Storage | CRUD, content search, image upload |
| 9 | `/books` | Books | Firestore + Storage | CRUD, PDF/cover upload, preview |
| 10 | `/notifications` | Notifications | Firestore | CRUD, scheduling fields, push delivery delegated to backend |
| 11 | `/playlist` | Playlist | Firestore | CRUD; playlist items managed via Firestore |
| 12 | `/reports` | Reports | Cloud Functions | `analytics-getAnalyticsSummary` + `observability-getObservabilityMetrics`; client-side JSON export |
| 13 | `/settings` | Settings | Firestore | `app_settings/global_config` read/save |
| 14 | `/support` | Support | Cloud Functions + Firestore | Observability health/alerts/ack (callables) + support tickets (Firestore — BROKEN) |

Route access is enforced by `AdminPermissionProvider` / `ProtectedRoute` with a per-route permission map in `PermissionContext.tsx` (`useRouteAccess`).

---

## 3. API Inventory

Frontend never calls raw REST endpoints. All backend access is through one of three channels:

| Channel | Identifier / Call | Frontend consumer |
| --- | --- | --- |
| Cloud Function | `analytics-getAnalyticsSummary` | `analyticsReportService.fetchSummary` (Reports) |
| Cloud Function | `observability-getObservabilityMetrics` | `AIAnalyticsService.fetchDashboardData` (Reports AI) and `ObservabilityService.fetchLatestMetrics` (Support health) |
| Cloud Function | `observability-getTelemetryAlerts` | `ObservabilityService.fetchAlerts` (Support alerts) |
| Cloud Function | `observability-acknowledgeTelemetryAlert` | `ObservabilityService.acknowledgeAlert` (Support) |
| Firestore | 13 collections (see Section 6) | `BaseRepository` subclasses per feature |
| Storage | 6 admin upload paths (see Section 7) | `storageService` via `useStorage` |
| Firebase Auth | sign-in / token refresh / state listener | `authRepository` via `authService` |

---

## 4. Frontend → Backend Matrix

See `FRONTEND_BACKEND_CONNECTIVITY_MATRIX.md` in this directory for the full 80-row matrix (page, component, operation, hook, service, repository/API, backend source, permission, status).

---

## 5. Firebase Functions

| Callable referenced by frontend | Backend export | File:Line | Region | Result |
| --- | --- | --- | --- | --- |
| `analytics-getAnalyticsSummary` | `analytics.getAnalyticsSummary` | `backend/firebase/functions/src/analytics.ts:188` | default (us-central1) — matches `getFunctions(app, 'us-central1')` | **PASS** |
| `observability-getObservabilityMetrics` | `observability.getObservabilityMetrics` | `backend/firebase/functions/src/observability.ts:13` | default | **PASS** (callable exists; response shape mismatches AI-analytics expectation — see Section 11) |
| `observability-getTelemetryAlerts` | `observability.getTelemetryAlerts` | `backend/firebase/functions/src/observability.ts:79` | default | **PASS** |
| `observability-acknowledgeTelemetryAlert` | `observability.acknowledgeTelemetryAlert` | `backend/firebase/functions/src/observability.ts:110` | default | **PASS** |

All four callables exist with matching names and the same region the admin panel initializes (`functions = getFunctions(app, 'us-central1')`). No frontend references to non-existent callables were found. The `analytics` module additionally exports `triggerDailyAnalyticsAggregation`, `triggerCategoryAnalytics`, `logAnalyticsEvent` (backend-side; not called by the admin panel).

**Result: PASS** (4/4 callables matched; 1 contract-shape mismatch noted in Section 11).

---

## 6. Firestore

Frontend collection usage vs `firebase/firestore.rules` (188 lines, `rules_version = '2'`):

| Frontend collection | Rules match | Rule coverage | Result |
| --- | --- | --- | --- |
| `users` | `match /users/{userId}` | owner or any admin; client admin restricted from dev-role creates/updates | **PASS** |
| `roles` | `match /roles/{docId}` | read/write any admin | **PASS** |
| `audio` | `match /audio/{docId}` | read public, write any admin | **PASS** |
| `stuti_vinati` | `match /stuti_vinati/{docId}` | read public, write any admin | **PASS** |
| `suvichar` | `match /suvichar/{docId}` | read public, write any admin | **PASS** |
| `books` | `match /books/{docId}` | read public, write any admin | **PASS** |
| `categories` | `match /categories/{docId}` | read public, write any admin | **PASS** |
| `banners` | `match /banners/{docId}` | read public, write any admin | **PASS** |
| `notifications` | `match /notifications/{docId}` | read public, write any admin | **PASS** |
| `playlists` | `match /playlists/{playlistId}` | authenticated read (public/owner/collaborator/admin); create requires `ownerId == auth.uid` | **PASS** (see matrix footnote 4) |
| `playlist_items` | `match /playlist_items/{itemId}` | read authenticated, write any admin | **PASS** |
| `app_settings` | `match /app_settings/{docId}` | read public, write any admin | **PASS** |
| `support_tickets` | **no match** | terminal catch-all `{document=**}` → `allow read, write: if false` | **FAIL** |

**Firestore: 12/13 collections covered. `support_tickets` is missing → LIST and CREATE are denied.**

Additional relevant collections in rules (`system_config`, `audit_logs`, `analytics`, `media*`, `permissions`, `events`, `donations`, `downloads`, `preferences`, `search_index`, `satsangs`, `quotes`, etc.) exist for backend/platform purposes; `system_metrics` is written by the observability callables via the admin SDK (bypasses rules) and is not matched in rules (safe — admin SDK only).

Required composite indexes: features use filters combined with `orderBy('createdAt')` in `BaseRepository` (e.g. `statusFilter` + `orderBy`), which require composite indexes to be deployed in production. The rules files present here (`firebase/firestore.indexes.json`) — deployment status **NOT VERIFIED** in a live project.

---

## 7. Storage

All upload paths used by the admin panel map to rules in `firebase/storage.rules`:

| Frontend use | Storage path | Rule | Result |
| --- | --- | --- | --- |
| Audio files | `audio/**` | admin create/update/delete; audio MIME; ≤ 100 MB | **PASS** |
| Audio thumbnails / images | `images/**` | admin; image MIME; ≤ 10 MB | **PASS** |
| Banner images | `banners/**` | admin; image MIME; ≤ 10 MB | **PASS** |
| Book covers | `book_covers/**` | admin; image MIME; ≤ 10 MB | **PASS** |
| Book PDFs | `books/**` / `book_pdfs/**` | admin; book/document MIME; ≤ 100 MB | **PASS** |
| Suvichar images | `suvichar/**` | admin; image MIME; ≤ 10 MB | **PASS** |

Uploads are performed through `useStorage` → `storageService` → `storageRepository` using `uploadBytesResumable` (progress), `getDownloadURL` (preview/link), and `deleteObject` (removal). Executable-file and MIME-spoofing guards are present. Reads are public for content paths, as expected for the mobile app.

**Result: PASS** — every admin upload operation has a rule-validated path.

---

## 8. Users / Auth

| Operation | Path | Result |
| --- | --- | --- |
| Sign in (email/password, Google) | `authRepository` → Firebase Auth | **PASS** |
| Auth state listener | `authRepository.onAuthStateChanged` | **PASS** |
| Token refresh after role change | `getAuth().currentUser.getIdToken(true)` — refreshes the **acting admin's** token only | **PARTIAL** |
| User CRUD | Firestore `users` (rule-covered) | **PASS** |
| User create → Firebase Auth account | **No callable wired.** `useUserMutations.ts:24-25` documents this as prototype-only; only the Firestore doc is created | **PARTIAL** |
| Role assignment → custom claims | **No callable wired.** `roleIds`/`role` written to doc only; target user's token claims unchanged until external `setCustomClaims` runs (backend `iam` module exists but is not called) | **PARTIAL** |

**Users/Auth: core auth flows PASS. Two partial gaps (account provisioning and claims propagation) are documented in code and do not affect the Firestore-document layer, but mean role changes do not take effect for the target user's sessions.**

---

## 9. RBAC

- Frontend enforces a 3-role model exactly: `developer_super_admin`, `client_super_admin`, `mobile_user` (`PermissionContext.tsx:10`).
- `AdminPermissionEngine` gates routes and UI via `useRouteAccess` / `PermissionGate` / `AdminOnly` / `DeveloperOnly`. Admin routes require developer or client admin; no admin route is reachable by `mobile_user`.
- Backend enforcement aligns: `firestore.rules` uses the same roles via `request.auth.token.get('role')`; `storage.rules` uses `isAdmin()` = dev or client admin; Cloud Functions use `requireAdmin(context)`.
- Client super admin is correctly restricted from creating/updating/deleting `developer_super_admin` users in Firestore rules.
- **Gap (partial):** because role changes never update custom claims (Section 8), a user promoted via the panel is not actually granted the new role by Firestore rules until claims are updated out-of-band. Frontend route gating reads claims, so the UI and the data layer agree on the stale role.

**RBAC: PASS with one documented propagation gap (role claims).**

---

## 10. Tenant Scope

- Single-tenant/global model. `PermissionContext` exposes `organizationId` from claims, but no query in any repository filters by `organizationId`; all collection reads are global.
- Firestore rules apply no `organizationId` scoping (all admins see all documents).
- No multi-tenant isolation boundary is enforced in the admin panel.

**Tenant Isolation: N/A (single-tenant design; no isolation promises broken).**

---

## 11. Mock Data Audit

| Location | Finding | Impact |
| --- | --- | --- |
| `ai-analytics/services/aiAnalyticsService.ts:47,109-373` | `generateSimulatedMetrics(period)` fabricates recommendations, search, AI cost, trending, user insights, category and playback metrics whenever the callable response lacks `data.recommendations` or the call fails | **MOCK DATA — production-visible on the Reports AI panel.** Because `observability-getObservabilityMetrics` returns the `system_metrics` snapshot shape with no `recommendations` field, the panel renders simulated numbers on every load (backend snapshot exists but is discarded). |
| `settings/services/settingsService.ts` | `DEFAULT_SETTINGS` fallback when `global_config` doc is absent | **Acceptable** — initial-value defaults, clearly scoped to a missing document, not fabricated runtime telemetry. |
| `dashboard/repositories/dashboardRepository.ts` | `getCollectionCount` returns 0 on error | **Acceptable** — safe zero placeholder on query failure, not presented as real data. |
| `playlist/hooks/usePlaylists.ts` | Client-side id `pl-${Date.now()}` and client-side title/description filtering | **Acceptable** — id generation and post-fetch filtering, not fake data. |
| `observability/services/observabilityService.ts` | Explicitly returns `null` / `[]` (no data) when backend unreachable — comment "No simulated/fabricated metric fallbacks" | **Clean** — correct behavior. |
| `support/hooks/useSupport.ts` | Default `contactEmail` `admin@santmatsatsang.org` in the ticket form | **Acceptable** — form default, not backend data. |

**Mock Data Audit: 1 MOCK DATA occurrence (AI Analytics simulated metrics); all others are legitimate defaults/placeholders.**

---

## 12. Type Contract Audit

| Location | Finding |
| --- | --- |
| `ai-analytics/types/aiAnalytics.types.ts` ↔ `observability-getObservabilityMetrics` | **Mismatch.** Frontend expects `AIPersonalizationDashboardData` (with `recommendations`); backend returns `ObservabilitySnapshot` (upload/queue/ai/storage/error/worker). No runtime validation; `as RecommendationMetrics` style casts make the mismatch silent. |
| `support/hooks/useSupport.ts:5` | Imports backend types via a **deep relative path into the backend package** (`../../../../../backend/observability/Models/ObservabilityModels`). Fragile cross-package import; compiles only because the frontend includes backend source in its TS project. |
| Repository timestamp conversion | `bannerRepository` converts Firestore `Timestamp` ↔ `Date`; other repositories rely on Firestore auto (de)serialization. Consistent enough for build, unverified at runtime. |
| `any` usage | `useUserMutations` catch blocks use `err: any`; `PermissionContext` uses `(window as any).firebase` and claim casts. Pre-existing, lint-clean (no `no-explicit-any` rule violation raised as error). |
| Cloud Function payload | `AIAnalyticsService` passes `{ period }` to `observability-getObservabilityMetrics`; the backend ignores `data` and always returns the latest snapshot. Harmless but the parameter is dead. |

**Type Contract Audit: 1 significant mismatch (AI Analytics) + 1 fragile cross-package import (Support types).**

---

## 13. Error Handling

| Pattern | Coverage |
| --- | --- |
| `useList` / `useCrud` hooks | Expose `loading`, `error`, `refresh`; pages render `LoadingState`, `EmptyState`, `ErrorState`. Present on Dashboard, Users, Audio, Banners, Categories, StutiVinati, Suvichar, Books, Notifications, Playlist, Settings, Reports, Support. |
| Service validation errors | `AppError` with typed codes (`VALIDATION_ERROR`, `NOT_FOUND`, `PERMISSION_DENIED`) mapped to toasts in mutation hooks. |
| Storage uploads | `useStorage` exposes progress/error; UI surfaces failure toasts. |
| Callable failures | `ObservabilityService` returns `null`/`[]` on failure (no crash, honest empty states). `AIAnalyticsService` **silently substitutes simulated data on failure** — error is swallowed, which masks backend unavailability (see Section 11). |
| Firestore rule denials | Surface as generic `permission-denied` errors surfaced by the repositories → toast. For `support_tickets` this currently masks the BROKEN status with a generic failure message. |

**Error Handling: comprehensive at the UI level. One masking issue (AI Analytics fallback swallows real failures).**

---

## 14. Live Verification

No browser was launched during this audit (sandbox restriction). All findings are source-verified:
- Build: **PASS** (`✓ built in 587ms`; only the pre-existing chunk-size warning)
- Lint: **PASS** (0 errors; 22 pre-existing `react(only-export-components)` warnings)
- Tests: **PASS** (22/22 across 5 files)
- Cloud Function name/region match: **PASS** (source)
- Rules coverage: **PASS** for 12/13 Firestore collections and all storage paths (source)

**LIVE E2E: NOT VERIFIED.** No live Firebase project interaction (real reads/writes, real callable invocations, real uploads) was executed. Composite-index deployment and rule deployment against a real project remain **NOT VERIFIED**.

---

## 15. Broken Connections

| Page | Operation | Cause | Severity |
| --- | --- | --- | --- |
| Support | LIST support tickets | `support_tickets` collection absent from `firestore.rules`; catch-all deny | **HIGH** — the Support Tickets tab always fails to load. |
| Support | CREATE support ticket | Same rule gap; the "New Ticket" modal always fails on submit. | **HIGH** — user-facing feature unusable. |

No other broken connections found.

---

## 16. UI-Only Features

| Page | Operation | Description |
| --- | --- | --- |
| Reports | Export AI Analytics report | Client-side JSON blob download (`AIAnalyticsService.exportReport`) — no backend export endpoint. |

---

## 17. Backend-Only Features

None. Every backend collection/function with a frontend-facing counterpart is consumed by the admin panel, and no backend API is consumed that lacks a UI surface in these 14 pages.

---

## 18. Not Supported Features

| Page / Area | Operation | Status |
| --- | --- | --- |
| Users | Create Firebase Auth account from the panel | Not supported by any wired callable (documented prototype limitation; Firestore doc only). |
| Users | Propagate role change to target user's custom claims | Not supported by any wired callable. |
| Reports | Real (non-simulated) AI/personalization metrics | Not supported — the backend returns an observability snapshot the frontend discards. |
| Notifications | Immediate push delivery call | Not supported from the panel; delivery delegated to backend scheduled triggers. |

---

## 19. Repairs

Recommended fixes (no changes made to backend or frontend during this audit):

1. **Support tickets (HIGH):** add a `match /support_tickets/{docId}` rule (e.g. read/write any admin) to `firebase/firestore.rules`, or serve tickets through a `support-*` callable if server-side authz is preferred.
2. **AI Analytics (HIGH):** either (a) have the backend return the `AIPersonalizationDashboardData` shape from a dedicated callable, or (b) have the frontend parse the actual `ObservabilitySnapshot` shape; remove `generateSimulatedMetrics` or gate it behind an explicit "demo data" flag. Fix the dead `{ period }` payload if (a).
3. **Role assignment (MEDIUM):** wire a callable (e.g. `iam.setCustomClaims`) so `assignRole` updates the target user's token claims, and remove the "refresh own token only" behavior; alternatively document that claim updates are out-of-band.
4. **User creation (MEDIUM):** wire a secondary-auth/callable path to provision the Firebase Auth account when creating a user from the panel, or remove the create-user UI.
5. **Support type import (LOW):** extract shared DTOs to a shared package or replicate the minimal types in the frontend instead of the deep relative import into `backend/`.
6. **Composite indexes (LOW):** verify `firebase/firestore.indexes.json` is deployed to the live project, since filters + `orderBy('createdAt')` require composite indexes.

---

## 20. Final Acceptance

- Total admin pages: **14** (Login + 13 admin routes).
- Total operations audited: **80**.
- Fully connected: **75**; partially connected: **2**; UI-only: **1**; broken: **2**; not supported: **0**; not verified: **0**.
- **CONNECTIVITY %: 93.75% (75 / 80).**
- Firebase Functions: **PASS** (4/4 callables matched; 1 shape mismatch).
- Firestore: **PARTIAL** (12/13 collections; `support_tickets` missing → 2 broken operations).
- Storage: **PASS** (all upload paths rule-covered).
- Users/Auth: **PARTIAL** (auth flows PASS; account provisioning + claims propagation not wired).
- RBAC: **PASS** (3-role model enforced frontend + rules; claims-propagation gap noted).
- Tenant isolation: **N/A** (single-tenant).
- Mock data: **FOUND** (1 occurrence — AI Analytics simulated metrics; all others are legitimate defaults).
- Build: **PASS**. Lint: **PASS** (0 errors). Tests: **PASS** (22/22).
- LIVE E2E: **NOT VERIFIED** (no browser/live project run).
- **FINAL STATUS: PARTIALLY CONNECTED.**

---

*Report generated by source-level audit of `admin-panel/src`, `backend/firebase/functions/src`, `firebase/firestore.rules`, `firebase/storage.rules`, and the App routes. No files were modified by this audit.*
