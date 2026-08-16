# Frontend → Backend Connectivity Matrix

- **Scope:** Admin Panel (`admin-panel/src`) → Backend (`backend/firebase/functions`, `firebase/` rules)
- **Backend sources:** Firestore (`firebase/firestore.rules`), Cloud Functions (`backend/firebase/functions/src/`), Firebase Storage (`firebase/storage.rules`), Firebase Auth
- **Audit date:** 2026-08-16
- **Method:** Source-level trace of every admin page from UI component → hook → service → repository/API → backend resource. Statuses assigned from verified code + rules, not from browser runs.

## Status Definitions

| Status | Meaning |
| --- | --- |
| `FULLY_CONNECTED` | Frontend operation reaches a real backend resource; backend resource exists and is authorized by security rules. |
| `PARTIALLY_CONNECTED` | Frontend connects to a backend resource but the contract is incomplete (shape mismatch, simulated fallback, or side-effect not propagated). |
| `UI_ONLY` | Operation is performed entirely client-side; no backend resource involved. |
| `BACKEND_ONLY` | Backend resource exists with no frontend consumer. |
| `BROKEN` | Frontend operation targets a backend resource that is missing, mis-named, or denied by security rules. |
| `NOT_SUPPORTED` | Frontend exposes the operation but no backend support exists and no UI-only path is defined. |
| `NOT_VERIFIED` | Operation could not be verified from source or runtime. |

## Operations Legend

`LIST`, `GET`, `CREATE`, `UPDATE`, `DELETE`, `SEARCH`, `FILTER`, `UPLOAD`, `DOWNLOAD`, `PREVIEW`, `ANALYTICS`, `STATUS CHANGE`, `ROLE CHANGE`, `OTHER`.

---

## Matrix

### Login (`/login`)

| Page | Component | Operation | Hook | Service | Repository/API | Backend Source | Permission | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Login | LoginForm | OTHER (email/password sign-in) | `useAuth` | `authService.login` | `authRepository` (`signInWithEmailAndPassword`) | Firebase Auth | none (public) | `FULLY_CONNECTED` |
| Login | LoginForm | OTHER (Google sign-in) | `useAuth` | `authService.signInWithGoogle` | `authRepository` (`GoogleAuthProvider`) | Firebase Auth | none (public) | `FULLY_CONNECTED` |
| Login | LoginForm | OTHER (auth state listener) | `useAuth` | `authService.onAuthStateChanged` | `authRepository` | Firebase Auth | none (public) | `FULLY_CONNECTED` |

### Dashboard (`/`)

| Page | Component | Operation | Hook | Service | Repository/API | Backend Source | Permission | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Dashboard | StatCards | ANALYTICS (collection counts) | `useDashboardData` | `dashboardService.getCollectionCount` | `dashboardRepository` (`getCountFromServer`) | Firestore `audio`, `stuti_vinati`, `users`, `notifications`, `books` | `analytics.view` | `FULLY_CONNECTED` |
| Dashboard | RecentActivity | LIST (recent activities) | `useDashboardData` | `dashboardService.getRecentActivities` | `dashboardRepository` (ACTIVITY_COLLECTIONS) | Firestore `audio`, `books`, `stuti_vinati`, `suvichar` | `analytics.view` | `FULLY_CONNECTED` |
| Dashboard | TopBhajans | LIST (top content) | `useDashboardData` | `dashboardService.getTopBhajans` | `dashboardRepository` | Firestore `audio` | `analytics.view` | `FULLY_CONNECTED` |
| Dashboard | StatCards | ANALYTICS (summary) | `useDashboardData` | `dashboardService.getAnalytics` | `dashboardRepository` | Firestore (aggregated counts) | `analytics.view` | `FULLY_CONNECTED` |

### Users (`/users`)

| Page | Component | Operation | Hook | Service | Repository/API | Backend Source | Permission | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Users | UserTable | LIST | `useUsers` (`useList`) | `userService.list` | `userRepository` (`BaseRepository` `users`) | Firestore `users` (read: owner or any admin) | `users.view` | `FULLY_CONNECTED` |
| Users | SearchBar | SEARCH (`fullName`) | `useUsers` | `userService` | `userRepository` (query) | Firestore `users` | `users.view` | `FULLY_CONNECTED` |
| Users | FilterBar | FILTER (status / roleIds array-contains / department) | `useUsers` | `userService` | `userRepository` (query) | Firestore `users` | `users.view` | `FULLY_CONNECTED` |
| Users | CreateUserModal | CREATE | `useUserMutations` | `userService.create` (email regex + `checkEmailExists`) | `userRepository.add` | Firestore `users` create (rules: any admin; client admin cannot set dev role) | `users.create` | `FULLY_CONNECTED`¹ |
| Users | EditUserModal | UPDATE | `useUserMutations` | `userService.update` | `userRepository.update` | Firestore `users` update | `users.update` | `FULLY_CONNECTED` |
| Users | EditUserModal | STATUS CHANGE | `useUserMutations.changeStatus` | `userService.update` | `userRepository.update` | Firestore `users` update | `users.update` | `FULLY_CONNECTED` |
| Users | EditUserModal | ROLE CHANGE | `useUserMutations.assignRole` | `userService.update` | `userRepository.update` + `getIdToken(true)` | Firestore `users` update; Firebase Auth custom claims **NOT** updated (no callable wired) | `users.assign_role` | `PARTIALLY_CONNECTED`² |
| Users | UserTable | DELETE | `useUserMutations` | `userService.delete` | `userRepository.delete` | Firestore `users` delete (dev admin; client admin only non-dev) | `users.delete` | `FULLY_CONNECTED` |
| Users | RoleSelect | LIST (role options) | `useRoles` | `roleService.list` | `roleRepository` (`BaseRepository` `roles`) | Firestore `roles` (read/write any admin) | `rbac.view` | `FULLY_CONNECTED` |

### Audio (`/audio`)

| Page | Component | Operation | Hook | Service | Repository/API | Backend Source | Permission | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Audio | AudioTable | LIST | `useBhajans` (`useList`, searchField `title`) | `bhajanService.list` | `bhajanRepository` (`audio`) | Firestore `audio` (read public / write any admin) | `audio.manage` | `FULLY_CONNECTED` |
| Audio | SearchBar | SEARCH (`title`) | `useBhajans` | `bhajanService` | `bhajanRepository` (query) | Firestore `audio` | `audio.manage` | `FULLY_CONNECTED` |
| Audio | FilterBar | FILTER (publish status / category) | `useBhajans` | `bhajanService` | `bhajanRepository` (query) | Firestore `audio` | `audio.manage` | `FULLY_CONNECTED` |
| Audio | AudioModal | CREATE | `useBhajanMutations` | `bhajanService.create` (`titleExists`) | `bhajanRepository.add` | Firestore `audio` create | `audio.manage` | `FULLY_CONNECTED` |
| Audio | AudioModal | UPDATE | `useBhajanMutations` | `bhajanService.update` | `bhajanRepository.update` | Firestore `audio` update | `audio.manage` | `FULLY_CONNECTED` |
| Audio | AudioTable | DELETE | `useBhajanMutations` | `bhajanService.delete` | `bhajanRepository.delete` | Firestore `audio` delete | `audio.delete` | `FULLY_CONNECTED` |
| Audio | AudioUpload | UPLOAD (audio file) | `useStorage` | `storageService` | `storageRepository` (`uploadBytesResumable` / `getDownloadURL`) | Firebase Storage `audio/**` (admin create/update/delete, 100 MB max, audio MIME only) | `audio.upload` | `FULLY_CONNECTED` |
| Audio | ImageUpload | UPLOAD (thumbnail) | `useStorage` | `storageService` | `storageRepository` | Firebase Storage `images/**` or `audio/**` (10 MB max, image MIME only) | `media.upload` | `FULLY_CONNECTED` |
| Audio | AudioTable | PREVIEW | `useStorage` | `storageService.getDownloadURL` | `storageRepository` | Firebase Storage (read public) | `audio.view` | `FULLY_CONNECTED` |

### Banners (`/banners`)

| Page | Component | Operation | Hook | Service | Repository/API | Backend Source | Permission | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Banners | BannerTable | LIST | `useBanners` (`useList`, statusFilter, search `title`) | `bannerService.list` | `bannerRepository` (`banners`, Date↔Timestamp) | Firestore `banners` (read public / write any admin) | `banners.manage` | `FULLY_CONNECTED` |
| Banners | SearchBar | SEARCH (`title`) | `useBanners` | `bannerService` | `bannerRepository` (query) | Firestore `banners` | `banners.manage` | `FULLY_CONNECTED` |
| Banners | FilterBar | FILTER (status) | `useBanners` | `bannerService` | `bannerRepository` (query) | Firestore `banners` | `banners.manage` | `FULLY_CONNECTED` |
| Banners | BannerModal | CREATE | `useBannerMutations` | `bannerService.create` (scheduled-date validation) | `bannerRepository.add` | Firestore `banners` create | `banners.manage` | `FULLY_CONNECTED` |
| Banners | BannerModal | UPDATE | `useBannerMutations` | `bannerService.update` | `bannerRepository.update` | Firestore `banners` update | `banners.manage` | `FULLY_CONNECTED` |
| Banners | BannerTable | DELETE | `useBannerMutations` | `bannerService.delete` | `bannerRepository.delete` | Firestore `banners` delete | `banners.delete` | `FULLY_CONNECTED` |
| Banners | ImageUpload | UPLOAD (image) | `useStorage` | `storageService` | `storageRepository` | Firebase Storage `banners/**` (10 MB max, image MIME only) | `banners.upload` | `FULLY_CONNECTED` |

### Categories (`/categories`)

| Page | Component | Operation | Hook | Service | Repository/API | Backend Source | Permission | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Categories | CategoryTable | LIST | `useCategories` (status/type filter, search `name`) | `categoryService.list` | `categoryRepository` (`categories`) | Firestore `categories` (read public / write any admin) | `categories.manage` | `FULLY_CONNECTED` |
| Categories | SearchBar | SEARCH (`name`) | `useCategories` | `categoryService` | `categoryRepository` (query) | Firestore `categories` | `categories.manage` | `FULLY_CONNECTED` |
| Categories | FilterBar | FILTER (status / type) | `useCategories` | `categoryService` | `categoryRepository` (query) | Firestore `categories` | `categories.manage` | `FULLY_CONNECTED` |
| Categories | CategoryModal | CREATE | `useCategoryMutations` | `categoryService.create` (duplicate / self-parent / circular checks) | `categoryRepository.add` (`nameExistsUnderParent`) | Firestore `categories` create | `categories.create` | `FULLY_CONNECTED` |
| Categories | CategoryModal | UPDATE | `useCategoryMutations` | `categoryService.update` (parent validation) | `categoryRepository.update` | Firestore `categories` update | `categories.manage` | `FULLY_CONNECTED` |
| Categories | CategoryTable | DELETE | `useCategoryMutations` | `categoryService.delete` (`hasChildren` / `isReferencedInCollection`) | `categoryRepository.delete` | Firestore `categories` delete | `categories.delete` | `FULLY_CONNECTED` |

### Stuti Vinati (`/stuti-vinati`)

| Page | Component | Operation | Hook | Service | Repository/API | Backend Source | Permission | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| StutiVinati | StutiTable | LIST | `useStutiVinati` (publishStatus/categoryId filter, search `title`) | `stutiVinatiService.list` | `stutiVinatiRepository` (`stuti_vinati`) | Firestore `stuti_vinati` (read public / write any admin) | `stuti.manage` | `FULLY_CONNECTED` |
| StutiVinati | SearchBar | SEARCH (`title`) | `useStutiVinati` | `stutiVinatiService` | `stutiVinatiRepository` (query) | Firestore `stuti_vinati` | `stuti.manage` | `FULLY_CONNECTED` |
| StutiVinati | FilterBar | FILTER (publishStatus / category) | `useStutiVinati` | `stutiVinatiService` | `stutiVinatiRepository` (query) | Firestore `stuti_vinati` | `stuti.manage` | `FULLY_CONNECTED` |
| StutiVinati | StutiModal | CREATE | `useStutiVinatiMutations` | `stutiVinatiService.create` (`checkCategory`) | `stutiVinatiRepository.add` | Firestore `stuti_vinati` create | `stuti.manage` | `FULLY_CONNECTED` |
| StutiVinati | StutiModal | UPDATE | `useStutiVinatiMutations` | `stutiVinatiService.update` | `stutiVinatiRepository.update` | Firestore `stuti_vinati` update | `stuti.manage` | `FULLY_CONNECTED` |
| StutiVinati | StutiTable | DELETE | `useStutiVinatiMutations` | `stutiVinatiService.delete` | `stutiVinatiRepository.delete` | Firestore `stuti_vinati` delete | `stuti.delete` | `FULLY_CONNECTED` |
| StutiVinati | AudioUpload / ImageUpload | UPLOAD | `useStorage` | `storageService` | `storageRepository` | Firebase Storage `audio/**`, `images/**` | `stuti.upload` / `media.upload` | `FULLY_CONNECTED` |

### Suvichar (`/suvichar`)

| Page | Component | Operation | Hook | Service | Repository/API | Backend Source | Permission | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Suvichar | SuvicharTable | LIST | `useSuvichar` (search `content`) | `suvicharService.list` | `suvicharRepository` (`suvichar`) | Firestore `suvichar` (read public / write any admin) | `feature.suvichar` / admin | `FULLY_CONNECTED` |
| Suvichar | SearchBar | SEARCH (`content`) | `useSuvichar` | `suvicharService` | `suvicharRepository` (query) | Firestore `suvichar` | admin | `FULLY_CONNECTED` |
| Suvichar | SuvicharModal | CREATE | `useSuvicharMutations` | `suvicharService.create` | `suvicharRepository.add` | Firestore `suvichar` create | admin | `FULLY_CONNECTED` |
| Suvichar | SuvicharModal | UPDATE | `useSuvicharMutations` | `suvicharService.update` | `suvicharRepository.update` | Firestore `suvichar` update | admin | `FULLY_CONNECTED` |
| Suvichar | SuvicharTable | DELETE | `useSuvicharMutations` | `suvicharService.delete` | `suvicharRepository.delete` | Firestore `suvichar` delete | admin | `FULLY_CONNECTED` |
| Suvichar | ImageUpload | UPLOAD (image) | `useStorage` | `storageService` | `storageRepository` | Firebase Storage `suvichar/**` (10 MB max, image MIME only) | admin | `FULLY_CONNECTED` |

### Books (`/books`)

| Page | Component | Operation | Hook | Service | Repository/API | Backend Source | Permission | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Books | BookTable | LIST | `useBooks` (publishStatus/categoryId filter, search `title`) | `bookService.list` | `bookRepository` (`books`) | Firestore `books` (read public / write any admin) | `books.manage` | `FULLY_CONNECTED` |
| Books | SearchBar | SEARCH (`title`) | `useBooks` | `bookService` | `bookRepository` (query) | Firestore `books` | `books.manage` | `FULLY_CONNECTED` |
| Books | FilterBar | FILTER (publishStatus / category) | `useBooks` | `bookService` | `bookRepository` (query) | Firestore `books` | `books.manage` | `FULLY_CONNECTED` |
| Books | BookModal | CREATE | `useBookMutations` | `bookService.create` (`checkCategory`, `titleExists`) | `bookRepository.add` | Firestore `books` create | `books.manage` | `FULLY_CONNECTED` |
| Books | BookModal | UPDATE | `useBookMutations` | `bookService.update` | `bookRepository.update` | Firestore `books` update | `books.manage` | `FULLY_CONNECTED` |
| Books | BookTable | DELETE | `useBookMutations` | `bookService.delete` | `bookRepository.delete` | Firestore `books` delete | `books.delete` | `FULLY_CONNECTED` |
| Books | PDFUpload | UPLOAD (PDF) | `useStorage` | `storageService` | `storageRepository` | Firebase Storage `books/**` / `book_pdfs/**` (100 MB max, book MIME only) | `books.upload` | `FULLY_CONNECTED` |
| Books | ImageUpload | UPLOAD (cover) | `useStorage` | `storageService` | `storageRepository` | Firebase Storage `book_covers/**` (10 MB max, image MIME only) | `books.upload` | `FULLY_CONNECTED` |
| Books | BookTable | PREVIEW | `useStorage` | `storageService.getDownloadURL` | `storageRepository` | Firebase Storage (read public) | `books.read` | `FULLY_CONNECTED` |

### Notifications (`/notifications`)

| Page | Component | Operation | Hook | Service | Repository/API | Backend Source | Permission | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Notifications | NotificationTable | LIST | `useNotifications` (pushStatus/audience/targetScreen filter, search `title`) | `notificationService.list` | `notificationRepository` (`notifications`) | Firestore `notifications` (read public / write any admin) | `notifications.manage` | `FULLY_CONNECTED` |
| Notifications | SearchBar | SEARCH (`title`) | `useNotifications` | `notificationService` | `notificationRepository` (query) | Firestore `notifications` | `notifications.manage` | `FULLY_CONNECTED` |
| Notifications | FilterBar | FILTER (pushStatus / audience / targetScreen) | `useNotifications` | `notificationService` | `notificationRepository` (query) | Firestore `notifications` | `notifications.manage` | `FULLY_CONNECTED` |
| Notifications | NotificationModal | CREATE (incl. schedule) | `useNotificationMutations` | `notificationService.create` (scheduled delivery validation) | `notificationRepository.add` | Firestore `notifications` create; push delivery delegated to backend `notifications` module (scheduled trigger) | `notifications.send` / `notifications.schedule` | `FULLY_CONNECTED`³ |
| Notifications | NotificationModal | UPDATE | `useNotificationMutations` | `notificationService.update` | `notificationRepository.update` | Firestore `notifications` update | `notifications.manage` | `FULLY_CONNECTED` |
| Notifications | NotificationTable | DELETE | `useNotificationMutations` | `notificationService.delete` | `notificationRepository.delete` | Firestore `notifications` delete | `notifications.manage` | `FULLY_CONNECTED` |

### Playlist (`/playlist`)

| Page | Component | Operation | Hook | Service | Repository/API | Backend Source | Permission | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Playlist | PlaylistTable | LIST | `usePlaylists` (custom; `playlistService.getAll`) | `playlistService.list` | `playlistRepository` (`playlists`) | Firestore `playlists` (read: public / owner / collaborators / any admin) | `playlists.view` | `FULLY_CONNECTED` |
| Playlist | PlaylistModal | CREATE | `usePlaylists` (client id `pl-${Date.now()}`) | `playlistService.create` | `playlistRepository.add` | Firestore `playlists` create (rules require `ownerId == request.auth.uid`) | `playlists.create` | `FULLY_CONNECTED`⁴ |
| Playlist | PlaylistModal | UPDATE | `usePlaylists` | `playlistService.update` | `playlistRepository.update` | Firestore `playlists` update (owner / collaborator / any admin) | `playlists.manage` | `FULLY_CONNECTED` |
| Playlist | PlaylistTable | DELETE | `usePlaylists` | `playlistService.delete` | `playlistRepository.delete` | Firestore `playlists` delete (owner / any admin) | `playlists.delete` | `FULLY_CONNECTED` |

### Reports (`/reports`)

| Page | Component | Operation | Hook | Service | Repository/API | Backend Source | Permission | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Reports | AnalyticsSummary | ANALYTICS (platform summary) | `useAnalyticsReport` | `analyticsReportService.fetchSummary` | `httpsCallable(functions, 'analytics-getAnalyticsSummary')` | Cloud Function `analytics.getAnalyticsSummary` (`backend/firebase/functions/src/analytics.ts:188`) | `reports.view` | `FULLY_CONNECTED` |
| Reports | AIAnalytics | ANALYTICS (AI & personalization) | `useAIAnalytics` | `aiAnalyticsService.fetchDashboardData` | `httpsCallable(functions, 'observability-getObservabilityMetrics')` | Cloud Function `observability.getObservabilityMetrics` (`backend/firebase/functions/src/observability.ts:13`) returns `system_metrics` snapshot — **no `recommendations` field**, so frontend always falls back to `generateSimulatedMetrics()` | `reports.view` | `PARTIALLY_CONNECTED`⁵ |
| Reports | ExportButton | OTHER (report export) | `useAIAnalytics.exportReport` | `AIAnalyticsService.exportReport` | Client-side JSON Blob download | none (no backend export endpoint) | `reports.export` | `UI_ONLY` |

### Settings (`/settings`)

| Page | Component | Operation | Hook | Service | Repository/API | Backend Source | Permission | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Settings | SettingsForm | GET (global config) | `useSettings` | `settingsService.getGlobalSettings` (`getById('global_config')`) | `settingsRepository` (`app_settings`) | Firestore `app_settings/global_config` (read public / write any admin); `DEFAULT_SETTINGS` fallback when doc absent | `settings.manage` | `FULLY_CONNECTED` |
| Settings | SettingsForm | UPDATE (save global config) | `useSettings` | `settingsService.saveGlobalSettings` (update then create fallback) | `settingsRepository` | Firestore `app_settings/global_config` update/create | `settings.manage` | `FULLY_CONNECTED` |

### Support (`/support`)

| Page | Component | Operation | Hook | Service | Repository/API | Backend Source | Permission | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Support | SupportTickets tab | LIST (support tickets) | `useSupport` | `supportService.getAll` | `supportRepository` (`support_tickets`) | Firestore `support_tickets` — **collection absent from `firebase/firestore.rules`; catch-all `{document=**}` deny → reads rejected** | `support.view` | `BROKEN`⁶ |
| Support | CreateTicketModal | CREATE (support ticket) | `useSupport.createTicket` | `supportService.create` | `supportRepository.add` | Firestore `support_tickets` — **no rule → catch-all deny → writes rejected** | `support.manage` | `BROKEN`⁶ |
| Support | System Health tab | ANALYTICS (health telemetry) | `useSupport` | `ObservabilityService.fetchLatestMetrics` | `httpsCallable(functions, 'observability-getObservabilityMetrics')` | Cloud Function `observability.getObservabilityMetrics` (returns real `system_metrics` snapshot or `null`; never fabricates) | `support.view` | `FULLY_CONNECTED` |
| Support | Alerts tab | LIST (operational alerts) | `useSupport` | `ObservabilityService.fetchAlerts` | `httpsCallable(functions, 'observability-getTelemetryAlerts')` | Cloud Function `observability.getTelemetryAlerts` (`backend/firebase/functions/src/observability.ts:79`) | `support.view` | `FULLY_CONNECTED` |
| Support | Alerts tab | OTHER (acknowledge alert) | `useSupport.acknowledgeAlert` | `ObservabilityService.acknowledgeAlert` | `httpsCallable(functions, 'observability-acknowledgeTelemetryAlert')` | Cloud Function `observability.acknowledgeTelemetryAlert` (`backend/firebase/functions/src/observability.ts:110`) | `support.manage` | `FULLY_CONNECTED` |

---

## Footnotes

1. **Users CREATE — FULLY_CONNECTED (Firestore), Auth provisioning gap:** creating a user persists a `users/{uid}` document via the client SDK only. The code comment in `useUserMutations.ts:24-25` documents that no Cloud Function / secondary-auth app provisions a Firebase Auth account. The operation connects to Firestore and is rule-authorized; the Firebase Auth sign-in account must be created out-of-band. See Section 8 of the final report.

2. **Users ROLE CHANGE — PARTIALLY_CONNECTED:** `assignRole` writes `roleIds` (and `role` via the edit form) to the `users/{uid}` document and then force-refreshes the *current admin's* token (`getIdToken(true)`). It does **not** update the target user's Firebase Auth custom claims — no `setCustomClaims` callable is wired from the frontend. Firestore rules authorize on the caller's token claims (not the document), so a promoted user does not actually gain the new role's access until their own token claims are updated out-of-band. The `backend/firebase/functions/src/iam.ts` module exists but is not invoked by this flow.

3. **Notifications CREATE — FULLY_CONNECTED (persistence):** the frontend persists the notification document. Actual push/FCM delivery is delegated to the backend `notifications` module (scheduled triggers); no frontend callable call occurs for delivery.

4. **Playlist CREATE — FULLY_CONNECTED with rule constraint:** Firestore rules require `request.resource.data.ownerId == request.auth.uid` for playlist creation. The admin panel must set `ownerId` to the logged-in admin's uid; otherwise the write is rejected by rules.

5. **Reports AI Analytics — PARTIALLY_CONNECTED (contract mismatch + simulated fallback):** the frontend `AIAnalyticsService.fetchDashboardData` expects a response containing `data.recommendations` (the `AIPersonalizationDashboardData` shape). The backend `observability-getObservabilityMetrics` returns the `system_metrics` snapshot shape (upload/queue/ai/storage/error/worker) with **no `recommendations` field**. Consequently the check `res.data.data.recommendations` always fails and the panel renders `generateSimulatedMetrics(period)` — fabricated numbers — whenever it is loaded. This is a real contract defect; see Mock Data Audit (Section 11) and Repairs (Section 19).

6. **Support tickets — BROKEN:** the frontend lists and creates `support_tickets` documents via the client SDK, but `support_tickets` is not matched anywhere in `firebase/firestore.rules`; the terminal `match /{document=**} { allow read, write: if false; }` denies both reads and writes. The observability sub-features of the same page are fully connected.

---

## Totals

| Metric | Count |
| --- | --- |
| Total operations (14 pages) | 80 |
| `FULLY_CONNECTED` | 75 |
| `PARTIALLY_CONNECTED` | 2 |
| `UI_ONLY` | 1 |
| `BROKEN` | 2 |
| `BACKEND_ONLY` | 0 |
| `NOT_SUPPORTED` | 0 |
| `NOT_VERIFIED` | 0 |
| **CONNECTIVITY %** | **93.75%** (75 / 80) |
