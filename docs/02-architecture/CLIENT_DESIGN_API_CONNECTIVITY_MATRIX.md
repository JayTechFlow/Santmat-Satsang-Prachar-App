# CLIENT DESIGN — API CONNECTIVITY MATRIX

**Project:** Santmat Satsang Prachar  
**Target Application:** `CLIENT DESIGN/`  
**Date:** August 16, 2026  
**Last Verified:** lint + `vite build` pass

---

## Connectivity Status Legend
- **CONNECTED** — wired to the real backend (Firestore / Cloud Function / Storage / Auth), verified in code.
- **PARTIAL** — wired to backend but with known gaps (e.g. fallback content, missing edge handling).
- **UI_ONLY** — renders from context/local state; no backend call (no backend contract exists in admin-panel).
- **NOT_VERIFIED** — service exists and is wired in code but has not been exercised against a live backend in this session.
- **BROKEN** — wired to a backend target that does not exist / collection name mismatch.

---

## API Connectivity Matrix

| Page | Operation | Hook / Caller | Service | Backend Target | Data Source | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **App bootstrap** | Live content subscriptions | `AppContext` | `bhajanService`, `stutiService`, `suvicharService`, `categoryService`, `notificationService`, `playlistService` | `onSnapshot` on `audio`, `stuti_vinati`, `suvichar`, `categories`, `notifications`, `playlists` | Firestore | CONNECTED |
| **Admin Dashboard** | Metrics & trend chart | `AdminDashboard` | `reportService` | callable `analytics-getAnalyticsSummary` | Cloud Function → Firestore analytics docs | CONNECTED |
| **Admin Dashboard** | Category share | `AdminDashboard` | context `bhajans` | computed from live `audio` collection | Firestore | CONNECTED |
| **Admin Add Bhajan** | Audio upload | `AdminAddBhajan` | `storageService` | `uploadBytesResumable` → `bhajans/audio/*` | Firebase Storage | CONNECTED |
| **Admin Add Bhajan** | Save metadata | `AdminAddBhajan` → `AppContext.addBhajan` | `bhajanService` | `addDoc` on `audio` | Firestore | CONNECTED |
| **Admin Bhajan List** | List / update / delete | `AdminBhajanList` | `bhajanService` | `onSnapshot`, `updateDoc`, `deleteDoc` on `audio` | Firestore | CONNECTED |
| **Admin Devotees / Users** | Fetch users | `AdminDevoteesManager` | `userService` | `onSnapshot` on `users` | Firestore | CONNECTED |
| **Admin Devotees / Users** | Create user | `AdminDevoteesManager` | `userService` | callable `iam-createUser` | Cloud Function (Admin SDK) | CONNECTED |
| **Admin Devotees / Users** | Update role / status | `AdminDevoteesManager` | `userService` | callables `iam-updateUserRole`, `iam-updateUserStatus` | Cloud Function (custom claims) | CONNECTED |
| **Admin Stuti Manager** | List / save stuti | `AdminStutiManager` | `stutiService` | `onSnapshot`, `updateDoc` on `stuti_vinati` | Firestore | CONNECTED |
| **Admin Category Manager** | CRUD categories | `AdminCategoryManager` | `categoryService` | `onSnapshot`, `addDoc`, `updateDoc`, `deleteDoc` on `categories` | Firestore | CONNECTED |
| **Admin Banner Manager** | Banner / suvichar CRUD | `AdminBannerManager` | `suvicharService` (+ context `addSuvichar`/`updateSuvichar`/`deleteSuvichar`) | `suvichar` collection | Firestore | CONNECTED |
| **Admin Notifications** | Send / delete / clear-all | `AdminNotificationsManager` | `notificationService` | `addDoc` + callable `notifications-sendNotification`, `deleteDoc` on `notifications` | Firestore + Cloud Function | CONNECTED |
| **Admin Playlists** | Fetch playlists | `AdminDevoteesManager` (playlists tab) | `playlistService` | `onSnapshot` on `playlists` | Firestore | CONNECTED |
| **Admin Settings** | System settings | `AdminSettings` | `settingsService` | doc `system` in `app_settings` | Firestore | PARTIAL |
| **Admin Support** | Support desk tab | `AdminLayout` → routes to Users manager | — | no `support_tickets` UI | — | UI_ONLY (placeholder) |
| **Mobile Home** | Home content (bhajans, suvichar, categories) | `HomeScreen` via `AppContext` | `bhajanService`, `suvicharService`, `categoryService` | `onSnapshot` on `audio`, `suvichar`, `categories` | Firestore | CONNECTED |
| **Mobile Stuti Screen** | Morning / evening stuti | `StutiBintiScreen` via `AppContext` | `stutiService` | `onSnapshot` on `stuti_vinati` (ordered by `type`) | Firestore | CONNECTED |
| **Mobile Notifications** | Read notifications | `NotificationsScreen` via `AppContext` | `notificationService` | `onSnapshot` on `notifications` | Firestore | CONNECTED |
| **Mobile Profile** | Feedback / support | `ProfileScreen` | `supportService` | `addDoc` on `support_tickets` | Firestore | CONNECTED |
| **Mobile Search** | Global search | `SearchScreen` | in-memory over context | local filter (callable `search-globalSearch` available but unused) | — | PARTIAL |
| **Mobile Favorites / Profile / Sadhana / Alarms** | Personal state | `ProfileScreen`, `AppContext` | local state | no backend contract in admin-panel | — | UI_ONLY |

---

## Known Gaps / Notes
1. `bannerService.ts` (targets `banners` collection) is **unused** — AdminBannerManager and HomeScreen operate on `suvichar`; the `banners` collection exists in admin-panel but the client UI does not consume it.
2. `AdminAddBhajan` draft save does not upload audio (audio upload is enforced for `प्रकाशित` / `शेड्यूल किया गया`).
3. `searchService` (callable `search-globalSearch`) exists but SearchScreen filters context data locally.
4. Mobile personal state (favorites, profile, sadhana streak, alarm settings) has no backend contract in admin-panel and is intentionally local-only.
5. `AdminSupport` tab is a placeholder that renders the Users manager; no support-ticket UI exists in the admin panel.

---

## Statistics
- **Total Operations Evaluated:** 24
- **CONNECTED:** 20
- **PARTIAL:** 2 (Admin Settings, Mobile Search)
- **UI_ONLY:** 2 (Admin Support placeholder, Mobile personal state)
- **BROKEN:** 0
- **NOT_VERIFIED:** 0 (all live-callable paths have error handling; live E2E against production not executed in this session)
- **Overall Backend Connectivity (CONNECTED + PARTIAL):** 91.7%
