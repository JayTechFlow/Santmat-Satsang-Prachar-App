# CLIENT DESIGN — NATIVE BACKEND INTEGRATION REPORT

**Project:** Santmat Satsang Prachar  
**Primary Frontend Application:** `/Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN`  
**Date:** August 16, 2026  
**Status:** Integrated; lint + `vite build` pass (live E2E not executed this session)

---

## 1. Client Design Architecture

The `CLIENT DESIGN/` application is the primary frontend for the Santmat Satsang Prachar platform — React 19 + TypeScript + Vite + Tailwind CSS v4.

```
CLIENT DESIGN
├── src
│   ├── components    # Responsive UI components (admin/ & mobile/)
│   ├── context       # AppContext (subscriptions + mutations), AuthContext
│   ├── firebase      # Client SDK config (region us-central1)
│   ├── services      # Data adapters (auth, bhajan, stuti, suvichar, category,
│   │                 #   notification, playlist, search, report, user, settings,
│   │                 #   support, storage)
│   ├── types         # Domain entities, RBAC roles, API schemas
│   └── utils         # Audio synthesizer, formatting helpers
├── public
└── .env.local        # VITE_FIREBASE_* credentials
```

---

## 2. Existing Backend Architecture

Unchanged and authoritative:
- **Firebase Auth**: identity & session management.
- **Cloud Firestore** collections: `audio`, `stuti_vinati`, `suvichar`, `books`, `categories`, `banners`, `notifications`, `users`, `playlists`, `app_settings`, `support_tickets`, `roles`.
- **Cloud Functions (us-central1)**: `iam-createUser`, `iam-updateUserRole`, `iam-updateUserStatus`, `analytics-getAnalyticsSummary`, `notifications-sendNotification`, `search-globalSearch`.
- **Firebase Storage**: `bhajans/audio/*` (client), backend `images/*`, `banners/*`.
- **Permission Engine** in admin-panel; client enforces the same three roles.

---

## 3. Integration Work Completed This Session

### Services
- `reportService.ts` — wired to callable `analytics-getAnalyticsSummary`; typed `AnalyticsReportResponse { status, data: { daily, overview } }`; removed fabricated analytics.
- `supportService.ts` — NEW: CRUD against `support_tickets` (createTicket auto-sets `status:'open'`, `createdAt`/`updatedAt`).
- `searchService.ts` — removed silent empty fallback; returns `{ success:false, error }` on failure.
- `notificationService.ts`, `suvicharService.ts`, `categoryService.ts`, `playlistService.ts` — removed mock fallbacks; empty snapshot → `[]`; added `onError` callbacks; errors propagate.
- `stutiService.ts` — subscriptions and queries now `orderBy('type')` so morning/evening cards render deterministically; `createStuti` uses `addDoc`.

### AppContext (`src/context/AppContext.tsx`)
- All six subscriptions pass `onError` handlers; added `dataLoading` (6-source counter) and `dataError` states (exposed in context type + value).
- `addBhajan` no longer creates a phantom local record on failure — sets `dataError`.
- Mutations wired to backend: create/toggle playlist, suvichar CRUD, stuti update, category CRUD, notification add/delete.
- `deleteAllNotifications` (backend-wide delete) added; `clearAllNotifications` reverted to local-only.

### Admin Screens
- `AdminDashboard.tsx` — replaced fabricated timeline dataset with real `analytics-getAnalyticsSummary` data; per-range totals, chart points, and category share computed from live Firestore (`audio`).
- `AdminDevoteesManager.tsx` — removed `sampleDevotees` and fabricated region data; renders real `users` from `useUsers`, real region breakdown, live stat cards, role/status controls wired to `iam-*` callables.
- `AdminHeader.tsx` — hardcoded badge count → real `unreadCount` from context notifications.
- `AdminSettings.tsx` — status badge reflects `dataLoading`/`dataError`.
- `AdminBannerManager.tsx` — removed fabricated add defaults; requires quote + imageUrl.
- `AdminStutiManager.tsx` — removed fabricated `15:00` duration fallback; duration required.
- `AdminAddBhajan.tsx` — real audio upload via `storageService.uploadFile` → `bhajans/audio/<slug>` with progress toast; publish/schedule require audio + thumbnail; default thumbnail cleared.

### Mobile Screens
- `NotificationsScreen.tsx` — fixed `notif.timestamp` → `notif.date`.
- `ProfileScreen.tsx` — feedback form now persists to `support_tickets` via `supportService.createTicket` (feedbackError state, success/error display).
- `StutiBintiScreen.tsx` — now backed by deterministic ordering.

### Types
- `Bhajan` gained `audioUrl?` / `storagePath?` in `src/types/index.ts`.

---

## 4. Contract Names (corrected this session)
| Previously documented | Actual verified name |
| :--- | :--- |
| `bhajans` collection | `audio` |
| `stuti_binti` collection | `stuti_vinati` |
| `settings/system` doc | `app_settings` doc `system` |
| `iam.createUser` etc. | `iam-createUser`, `iam-updateUserRole`, `iam-updateUserStatus` |
| `analytics.getSummaryReport` | `analytics-getAnalyticsSummary` |
| `notifications.sendNotification` | `notifications-sendNotification` |
| `search.globalSearch` | `search-globalSearch` |

---

## 5. Known Gaps (not regressions — existing design)
1. `books` collection — no client UI; `bookService.ts` exists but is not consumed.
2. `banners` collection — `bannerService` unused; banner UI operates on `suvichar`.
3. `search-globalSearch` callable implemented but `SearchScreen` filters context client-side (PARTIAL).
4. Mobile personal state (favorites, sadhana, profile, alarms) is device-local — no admin-panel backend contract.
5. Admin `support` tab is a placeholder (renders Users manager).
6. Live E2E against the deployed Firebase project was NOT executed in this session.

---

## 6. Verification Status
- **Lint (`tsc --noEmit`):** PASS
- **Build (`vite build`):** PASS (1736 modules; chunk-size warning only)
- **Backend connectivity:** see `CLIENT_DESIGN_API_CONNECTIVITY_MATRIX.md` (20 CONNECTED, 2 PARTIAL, 2 UI_ONLY, 0 BROKEN)
- **Live E2E:** NOT VERIFIED this session
