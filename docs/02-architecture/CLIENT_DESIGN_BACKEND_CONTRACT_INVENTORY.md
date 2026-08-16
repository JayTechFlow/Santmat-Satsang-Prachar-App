# CLIENT DESIGN — BACKEND CONTRACT INVENTORY

**Project:** Santmat Satsang Prachar  
**Target Application:** `CLIENT DESIGN/`  
**Date:** August 16, 2026  
**Status:** Verified against `admin-panel/` source (source of truth) and `CLIENT DESIGN/src/services/`

---

## 1. Executive Summary

This inventory documents the backend contracts (Firestore collections, Cloud Functions, Storage paths, RBAC) defined by the production backend (`admin-panel/`) and consumed by `CLIENT DESIGN/`. Collection names and callable names below were verified by reading the backend repositories/services in `admin-panel/`, not assumed.

---

## 2. Security & Permission Contract

### Roles Matrix (admin-panel `PermissionContext.tsx`)
1. `developer_super_admin` — platform-wide permissions, tenant management, IAM, system logs.
2. `client_super_admin` — organization-scoped admin, user management, content management, analytics.
3. `mobile_user` — end-user mobile client, playback, read-only content, personal profile.

### Auth Gate
- Admin panel requires custom claims `admin === true` OR role in the two super-admin roles.
- Users with `accountStatus === 'suspended'` are blocked from authenticated access.

---

## 3. Firestore Collection Inventory (verified from admin-panel repositories)

| Collection | Backend Repository | Client Service | Client Consumer | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `audio` | bhajanRepository | `bhajanService` | AppContext, AdminBhajanList, HomeScreen | canonical bhajan collection (NOT `bhajans`) |
| `stuti_vinati` | stutiVinatiRepository | `stutiService` | AppContext, StutiBintiScreen, AdminStutiManager | NOT `stuti_binti` |
| `suvichar` | suvicharRepository | `suvicharService` | AppContext, HomeScreen, AdminBannerManager | |
| `books` | bookRepository | (no client service yet) | — | backend only for now |
| `categories` | categoryRepository | `categoryService` | AppContext, AdminCategoryManager | |
| `banners` | bannerRepository | `bannerService` (unused) | — | client UI consumes `suvichar` instead |
| `notifications` | notificationRepository | `notificationService` | AppContext, AdminNotificationsManager, NotificationsScreen | |
| `users` | userRepository | `userService` | `useUsers`, AdminDevoteesManager | |
| `playlists` | playlistRepository | `playlistService` | AppContext, AdminDevoteesManager (playlists tab) | |
| `app_settings` | settingsRepository | `settingsService` | doc `system` (was `settings/system`) | |
| `support_tickets` | supportRepository | `supportService` | ProfileScreen (feedback) | added this session |
| `roles` | roleRepository | (client uses enum only) | — | RBAC definitions |

---

## 4. Cloud Function (Callable) Inventory (verified from admin-panel callers)

| Callable Name | Backend Caller | Client Service | Client Consumer | Status |
| :--- | :--- | :--- | :--- | :--- |
| `iam-createUser` | userService | `userService.createUser` | AdminDevoteesManager | CONNECTED |
| `iam-updateUserRole` | userService | `userService.updateUserRole` | AdminDevoteesManager | CONNECTED |
| `iam-updateUserStatus` | userService | `userService.updateUserStatus` | AdminDevoteesManager | CONNECTED |
| `notifications-sendNotification` | notificationService | `notificationService.addNotification` | AdminNotificationsManager | CONNECTED |
| `analytics-getAnalyticsSummary` | analyticsReportService | `reportService.getAnalyticsSummary` | AdminDashboard | CONNECTED |
| `search-globalSearch` | searchService | `searchService.globalSearch` | (SearchScreen is in-memory; callable unused) | PARTIAL |

> All callables are in region `us-central1`. Deployment state of the functions against the current project was NOT verified in this session.

---

## 5. Firebase Storage Paths

| Purpose | Path Convention | Client Service |
| :--- | :--- | :--- |
| Bhajan audio | `bhajans/audio/<title_slug>/<timestamp>_<file>` | `storageService.uploadFile` (AdminAddBhajan) |
| Thumbnails / banners / avatars | `images/*`, `banners/*` (backend) | client uploads via base64 in some managers; audio path wired this session |

---

## 6. Known Contract Gaps (for follow-up)
1. `books` and `banners` collections have no dedicated client service consumer in the UI (banner UI uses `suvichar`).
2. `search-globalSearch` callable is implemented in `searchService` but the SearchScreen filters context data client-side.
3. Live E2E verification of Cloud Functions against the deployed project was not executed in this session.
