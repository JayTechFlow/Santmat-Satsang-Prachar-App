# Client Design Page Mapping

## Legend

| Field | Description |
|-------|-------------|
| **Current Page** | Existing admin panel page path/component |
| **Client Design Equivalent** | Corresponding page from client design |
| **Service** | Backend service handling page data |
| **Repository** | Data access layer |
| **Firebase Source** | Firebase collection/document source |
| **Permissions** | Required RBAC level |
| **Action** | REUSE / RESTYLE / RECONSTRUCT / REPLACE UI ONLY |

---

## 1. Dashboard

| Field | Details |
|-------|---------|
| **Current Page** | `admin-panel/src/pages/Dashboard.tsx` (lazy-loaded) |
| **Client Design Equivalent** | `CLIENT DESIGN/src/components/admin/AdminDashboard.tsx` |
| **Service** | `MediaService` / analytics aggregation |
| **Repository** | `MediaRepository` / analytics data fetch |
| **Firebase Source** | `bhajans` collection (statistics aggregated), `users` collection, `categories` collection |
| **Permissions** | `developer_super_admin`, `client_super_admin` |
| **Action** | **RESTYLE** |
| **Notes** | - Client design has comprehensive SVG wave chart, metric cards, category distribution, and popular tracks table<br>- Existing Dashboard.tsx needs visual restyling to match client design<br>- **Business logic preserved**: timeline selection, chart data, metric calculations, play tracking<br>- **Keep**: `useApp()` hooks, timeline dataset, chart generation logic<br>- **Restyle**: Grid layout, card designs, SVG chart appearance, pill styling, table design<br>- Timeline range: `7d, 30d, 180d, 1y, 2y, 5y, lifetime` matches existing |
| **Key Differences** | - Client uses `font-['Mukta']`, existing may use different font family<br>- Client SVG gradient: `#EA580C` from opaque to transparent<br>- Client category colors: amber `#EA580C`, `#D97706`, `#B45309`, `#9333EA`, `#059669`<br>- Client metric cards have `rounded-3xl p-5 border border-stone-200`<br>- Client timeline pills use `bg-stone-100/80 border border-stone-200/80` with amber active state |

---

## 2. Media Library / Bhajan List

| Field | Details |
|-------|---------|
| **Current Page** | `admin-panel/src/pages/Audio.tsx` (lazy-loaded) |
| **Client Design Equivalent** | `CLIENT DESIGN/src/components/admin/AdminBhajanList.tsx` |
| **Service** | `StorageService` / `MediaService` |
| **Repository** | `MediaRepository` |
| **Firebase Source** | `bhajans` collection, `categories` collection |
| **Permissions** | `developer_super_admin`, `client_super_admin` |
| **Action** | **RESTYLE** |
| **Notes** | - Client design has full bhajan management table with search, category filters, thumbnail editor modals<br>- Existing Audio.tsx needs visual restyling to match client design<br>- **Business logic preserved**: bhajan CRUD operations, search filtering, category filtering, play/pause toggle, thumbnail editing, full detail editing, delete functionality<br>- **Keep**: All `useApp()` hooks (`bhajans`, `updateBhajan`, `deleteBhajan`, `playTrack`, `currentTrack`, `isPlaying`, `togglePlay`), categories, filtered calculation, toast messages, modal states<br>- **Restyle**: Table design (rounded-3xl, border-stone-200), search input, category pills, thumbnail modal design, edit modal design, file dropzone styling, audio player bar, status badges<br>- Both have identical table structure: thumbnail, category, duration, plays, status, actions |
| **Key Differences** | - Client: `bg-white rounded-3xl p-5 border border-stone-200 shadow-xs`<br>- Existing: may have different card rounding/border<br>- Client: Search input `bg-transparent`, existing may differ<br>- Client: Category pills `bg-stone-900 text-white` when active, existing may differ<br>- Client: Thumbnail modals use `bg-amber-50/70` and `bg-stone-50`, existing may differ<br>- Client: Status badges use specific amber/stone/emerald colors<br>- Client: File dropzones `border-2 border-dashed border-amber-300` |

---

## 3. Add Bhajan / Create Bhajan

| Field | Details |
|-------|---------|
| **Current Page** | `admin-panel/src/pages/` - no direct add page, uses `AdminAddBhajan` component or adds from bhajan list |
| **Client Design Equivalent** | `CLIENT DESIGN/src/components/admin/AdminAddBhajan.tsx` |
| **Service** | `StorageService` / `MediaService` / `addBhajan` Firebase function |
| **Repository** | `MediaRepository` |
| **Firebase Source** | `bhajans` collection |
| **Permissions** | `developer_super_admin`, `client_super_admin` |
| **Action** | **RESTYLE** |
| **Notes** | - Client design has comprehensive bhajan creation form with audio upload, lyrics, auto-fetch subtitle timing, scheduled posting<br>- Existing may not have standalone Add Bhajan page; may use form within Bhajan List<br>- **Business logic preserved**: form validation, audio file handling, lyrics input, auto-fetch timing, language selection, status (publish/draft/schedule), thumbnail upload via file/URL<br>- **Keep**: All form handlers (`handleImageFileChange`, `handleAudioFileChange`, `handleAutoFetchSubtitleTiming`, `handleStampCurrentAudioTime`, `handleClearTimestamps`, `handleSubmit`), audio preview, subtitle timing mode, word/character counts<br>- **Restyle**: Form layout (2-column grid), input styling, category selector, sub-category selector, lyrics textarea, dropzone styling, audio player bar, duration/language/status selects, scheduled post settings, action buttons<br>- **Key form fields mapping**:<br>  - Title, Artist (both required) → keep as required fields<br>  - Category/SubCategory → keep existing logic<br>  - Lyrics → keep unlimited text area<br>  - Auto-fetch timing → keep as client-side feature<br>  - Language select → keep (Hindi, Braj, Avadhi, Maithili, Rajasthani)<br>  - Status → keep (Publish/Draft/Schedule)<br>  - Scheduled date/time → keep for scheduled posting |
| **Key Differences** | - Client: `grid grid-cols-1 lg:grid-cols-2 gap-6` 2-column layout<br>- Existing: may have 1-column or different layout<br>- Client: Auto-fetch subtitle timing toolbar with Timer icon<br>- Existing: May not have this feature (or may be differently implemented)<br>- Client: Word count `{wordCount}` and character count `{lyrics.length}` display<br>- Existing: May show different counts<br>- Client: Live audio playback bar with progress bar<br>- Existing: May have different audio player design<br>- Client: Scheduled post settings with Calendar/Time inputs<br>- Existing: May have different scheduling UI |

---

## 4. Stuti & Vinati Management

| Field | Details |
|-------|---------|
| **Current Page** | `admin-panel/src/pages/StutiVinati.tsx` (lazy-loaded) |
| **Client Design Equivalent** | `CLIENT DESIGN` has `AdminStutiManager.tsx` in admin components, and mobile `StutiBintiScreen.tsx` |
| **Service** | Stuti management service |
| **Repository** | Stuti repository |
| **Firebase Source** | `stutis` collection (likely) |
| **Permissions** | `developer_super_admin`, `client_super_admin` |
| **Action** | **RESTYLE** |
| **Notes** | - Client design has stuti/management screen with morning/evening types<br>- Existing StutiVinati page needs visual restyling<br>- **Business logic preserved**: stuti item CRUD, type selection (morning/evening), quote/lyrics management, banner image handling<br>- **Keep**: Stuti item types, quote/lyrics fields, banner image handling<br>- **Restyle**: Page layout, form designs, badge/status styling |

---

## 5. Banners Management

| Field | Details |
|-------|---------|
| **Current Page** | `admin-panel/src/pages/Banners.tsx` (lazy-loaded) |
| **Client Design Equivalent** | `CLIENT DESIGN/src/components/admin/AdminBannerManager.tsx` |
| **Service** | Banner management service |
| **Repository** | Banner repository |
| **Firebase Source** | Likely `banners` collection or similar |
| **Permissions** | `developer_super_admin`, `client_super_admin` |
| **Action** | **RESTYLE** |
| **Notes** | - Client design has banner manager component<br>- Existing Banners page needs visual restyling<br>- **Business logic preserved**: banner CRUD, image upload, ordering, homepage display settings<br>- **Keep**: All banner management logic<br>- **Restyle**: Page design, image dropzones, gallery layout |

---

## 6. Categories Management

| Field | Details |
|-------|---------|
| **Current Page** | `admin-panel/src/pages/Categories.tsx` (lazy-loaded) |
| **Client Design Equivalent** | `CLIENT DESIGN/src/components/admin/AdminCategoryManager.tsx` |
| **Service** | Category service |
| **Repository** | Category repository |
| **Firebase Source** | `categories` collection |
| **Permissions** | `developer_super_admin`, `client_super_admin` |
| **Action** | **RESTYLE** |
| **Notes** | - Client design has category manager<br>- Existing Categories page needs visual restyling<br>- **Business logic preserved**: category CRUD, sub-categories, icons, featured status, ordering<br>- **Keep**: Category creation/editing logic, sub-category hierarchy, icon assignment, featured toggle, order reordering<br>- **Restyle**: Page design, card/grid layout, status badges |

---

## 7. Users Management

| Field | Details |
|-------|---------|
| **Current Page** | `admin-panel/src/pages/Users.tsx` (lazy-loaded) |
| **Client Design Equivalent** | `CLIENT DESIGN/src/components/admin/AdminDevoteesManager.tsx` (from client) |
| **Service** | User management service |
| **Repository** | User repository |
| **Firebase Source** | `users` collection |
| **Permissions** | `developer_super_admin`, `client_super_admin` |
| **Action** | **RESTYLE** |
| **Notes** | - Client design has devotees manager<br>- Existing Users page needs visual restyling<br>- **Business logic preserved**: user CRUD, role assignment, activation/deactivation, profile management<br>- **Keep**: All user permission logic, role assignments, activation/deactivation backend calls<br>- **Restyle**: Page design, user card/table design, status badges, role selection UI<br>- **CRITICAL**: UserAvatar must remain defensive against undefined/null/empty name/missing email/missing photo/broken image<br>- **Preserve**: Existing secure backend/Admin SDK architecture for user creation/editing/deactivation<br>- **Do NOT**: Create browser-side privileged operations |
| **Key Observations** | - Client design shows user management with list view<br>- Existing Users.tsx likely has similar table structure<br>- Both preserve backend permission architecture |

---

## 8. Playlists Management

| Field | Details |
|-------|---------|
| **Current Page** | `admin-panel/src/pages/Playlist.tsx` (lazy-loaded) |
| **Client Design Equivalent** | `CLIENT DESIGN/src/types.ts` has `Playlist` interface, and `AdminBhajanList` references playlists |
| **Service** | Playlist service |
| **Repository** | Playlist repository |
| **Firebase Source** | `playlists` collection |
| **Permissions** | `developer_super_admin`, `client_super_admin` |
| **Action** | **RESTYLE** |
| **Notes** | - Client design defines Playlist interface with `id, name, bhajanIds, createdAt`<br>- Existing Playlist page needs visual restyling<br>- **Business logic preserved**: playlist CRUD, bhajan assignment, ordering<br>- **Keep**: Playlist creation/editing, bhajan selection interface<br>- **Restyle**: Page design, list/table layout |

---

## 9. Notifications Management

| Field | Details |
|-------|---------|
| **Current Page** | `admin-panel/src/pages/Notifications.tsx` (lazy-loaded) |
| **Client Design Equivalent** | `CLIENT DESIGN/src/components/admin/AdminNotificationsManager.tsx` |
| **Service** | Notification service |
| **Repository** | Notification repository |
| **Firebase Source** | Likely `notifications` collection or Firebase Cloud Messaging |
| **Permissions** | `developer_super_admin`, `client_super_admin` |
| **Action** | **RESTYLE** |
| **Notes** | - Client design has notifications manager<br>- Existing Notifications page needs visual restyling<br>- **Business logic preserved**: notification creation, sending to devotees, announcement management, alert system<br>- **Keep**: Notification creation form, sending logic, recipient selection<br>- **Restyle**: Page design, form styling, list layout |

---

## 10. Reports & Analytics

| Field | Details |
|-------|---------|
| **Current Page** | `admin-panel/src/pages/Reports.tsx` (lazy-loaded) |
| **Client Design Equivalent** | `CLIENT DESIGN/src/components/admin/AdminDashboard.tsx` (contains full analytics) |
| **Service** | Analytics service / MediaService |
| **Repository** | Analytics repository |
| **Firebase Source** | `bhajans`, `users`, `categories` collections |
| **Permissions** | `developer_super_admin`, `client_super_admin` |
| **Action** | **RESTYLE** |
| **Notes** | - Client design Dashboard contains comprehensive analytics (the same as Reports page)<br>- Existing Reports page needs visual restyling to match Dashboard design<br>- **Business logic preserved**: timeline selection, all metric calculations, category distribution, chart generation, top tracks display<br>- **Keep**: All analytics data fetching, timelineDataset, chart generation logic, timeline tab switching<br>- **Restyle**: Page wrapper design, metric card appearance, chart SVG design, pill styling, table design<br>- **Critical**: Timeline range types `7d, 30d, 180d, 1y, 2y, 5y, lifetime` must match existing data structure |

---

## 11. Settings

| Field | Details |
|-------|---------|
| **Current Page** | `admin-panel/src/pages/Settings.tsx` (lazy-loaded) |
| **Client Design Equivalent** | `CLIENT DESIGN/src/components/admin/AdminSettings.tsx` |
| **Service** | Settings service |
| **Repository** | Settings repository |
| **Firebase Source** | Likely `settings` or parameter collection |
| **Permissions** | `developer_super_admin`, `client_super_admin` |
| **Action** | **RESTYLE** |
| **Notes** | - Client design has admin settings form<br>- Existing Settings page needs visual restyling<br>- **Business logic preserved**: application settings, configuration, feature toggles, general app preferences<br>- **Keep**: All settings form logic, save handlers, backend configuration calls<br>- **Restyle**: Page design, form layout, input styling, toggle switches, save/cancel buttons |

---

## 12. Support

| Field | Details |
|-------|---------|
| **Current Page** | `admin-panel/src/pages/Support.tsx` (lazy-loaded) |
| **Client Design Equivalent** | `CLIENT DESIGN/src/components/admin/AdminSidebar.tsx` has support contact at bottom, and `MessageSquare` icon used |
| **Service** | Support message service |
| **Repository** | Support repository |
| **Firebase Source** | Likely support messages collection |
| **Permissions** | `developer_super_admin`, `client_super_admin` |
| **Action** | **RESTYLE** |
| **Notes** | - Client design has support section in sidebar with contact info<br>- Existing Support page needs visual restyling<br>- **Business logic preserved**: support message viewing, responding, contact management<br>- **Keep**: Support message fetching, display logic, contact storage<br>- **Restyle**: Page design, message list/table design, contact form |

---

## 13. Suvichar Management

| Field | Details |
|-------|---------|
| **Current Page** | `admin-panel/src/pages/Suvichar.tsx` (lazy-loaded) |
| **Client Design Equivalent** | `CLIENT DESIGN/src/components/admin/` has references, and mobile `SuvicharModal.tsx` |
| **Service** | Suvichar management service |
| **Repository** | Suvichar repository |
| **Firebase Source** | `suvichars` collection |
| **Permissions** | `developer_super_admin`, `client_super_admin` |
| **Action** | **RESTYLE** |
| **Notes** | - Client design has suvichar-related types and mobile screens<br>- Existing Suvichar page needs visual restyling<br>- **Business logic preserved**: suvichar CRUD, theme/author management, image handling, special poster status<br>- **Keep**: All suvichar management logic<br>- **Restyle**: Page design, form/layout styling |

---

## 14. Books Management

| Field | Details |
|-------|---------|
| **Current Page** | `admin-panel/src/pages/Books.tsx` (lazy-loaded) |
| **Client Design Equivalent** | Client types include `SuvicharItem` with book-like structure |
| **Service** | Books management service |
| **Repository** | Books repository |
| **Firebase Source** | `books` collection |
| **Permissions** | `developer_super_admin`, `client_super_admin` |
| **Action** | **RESTYLE** |
| **Notes** | - Client design context includes `SuvicharItem` model<br>- Existing Books page needs visual restyling<br>- **Business logic preserved**: book CRUD, theme management, author, image handling<br>- **Keep**: All book management logic<br>- **Restyle**: Page design, form/layout styling |

---

## 15. Profile / Mobile Screens

| Field | Details |
|-------|---------|
| **Current Page** | Not in admin panel (mobile app is separate) |
| **Client Design Equivalent** | `CLIENT DESIGN/src/components/mobile/` - HomeScreen, BhajanListScreen, NowPlayingScreen, ProfileScreen, SearchScreen, BottomNav, SideDrawer, TopHeader, LyricsModal, MiniPlayer |
| **Service** | Mobile app services |
| **Repository** | Mobile data layer |
| **Firebase Source** | Firebase Auth, Firestore for mobile data |
| **Permissions** | `mobile_user` (different from admin RBAC) |
| **Action** | **NOT applicable to admin panel** - separate mobile app |

---