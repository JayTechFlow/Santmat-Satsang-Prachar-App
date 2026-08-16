# CLIENT DESIGN — PAGE TO BACKEND MAPPING

**Project:** Santmat Satsang Prachar  
**Target Application:** `CLIENT DESIGN/`  
**Date:** August 16, 2026  
**Last Verified:** lint + `vite build` pass

---

## 1. Executive Summary

This inventory maps every UI screen / admin tab in `CLIENT DESIGN/` to its backend dependency. Collection and callable names are the verified production contracts (see `CLIENT_DESIGN_BACKEND_CONTRACT_INVENTORY.md`).

---

## 2. Admin Panel Mapping

| Tab | Component | Backend Dependency | Data Source (collection / callable) | Status |
| :--- | :--- | :--- | :--- | :--- |
| **dashboard** | `AdminDashboard.tsx` | `reportService.getAnalyticsSummary` + context `bhajans/stutis/categories` | callable `analytics-getAnalyticsSummary`; Firestore `audio`, `stuti_vinati`, `categories` | CONNECTED |
| **analytics** | `AdminDashboard.tsx` (reuses dashboard) | `reportService.getAnalyticsSummary` | callable `analytics-getAnalyticsSummary` | CONNECTED |
| **add_bhajan** | `AdminAddBhajan.tsx` | `storageService.uploadFile` + `bhajanService` | Storage `bhajans/audio/*`; Firestore `audio` | CONNECTED |
| **bhajan_list** | `AdminBhajanList.tsx` | `bhajanService` | Firestore `audio` | CONNECTED |
| **stuti_management** | `AdminStutiManager.tsx` | `stutiService` | Firestore `stuti_vinati` | CONNECTED |
| **categories** | `AdminCategoryManager.tsx` | `categoryService` | Firestore `categories` | CONNECTED |
| **users** | `AdminDevoteesManager.tsx` | `useUsers` → `userService` | Firestore `users`; callables `iam-createUser`, `iam-updateUserRole`, `iam-updateUserStatus` | CONNECTED |
| **playlists** | `AdminDevoteesManager.tsx` (playlists tab) | context `playlists` → `playlistService` | Firestore `playlists` | CONNECTED |
| **notifications** | `AdminNotificationsManager.tsx` | `notificationService` | Firestore `notifications`; callable `notifications-sendNotification` | CONNECTED |
| **banners** | `AdminBannerManager.tsx` | context `suvichars` → `suvicharService` | Firestore `suvichar` | CONNECTED |
| **settings** | `AdminSettings.tsx` | `settingsService` (doc `system` in `app_settings`) | Firestore `app_settings` | PARTIAL |
| **support** | `AdminDevoteesManager.tsx` (placeholder) | none | — | UI_ONLY (placeholder) |

## 3. Mobile App Mapping

| Screen | Component | Backend Dependency | Data Source | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Home** | `HomeScreen.tsx` | context subscriptions | Firestore `audio`, `suvichar`, `categories`, `stuti_vinati` | CONNECTED |
| **Bhajan List** | `BhajanListScreen.tsx` | context `bhajans` | Firestore `audio` | CONNECTED |
| **Stuti** | `StutiBintiScreen.tsx` | context `stutis` (ordered by `type`) | Firestore `stuti_vinati` | CONNECTED |
| **Now Playing** | `NowPlayingScreen.tsx` | context current track / audio stream | Firestore `audio` (audioUrl from Storage) | CONNECTED |
| **Notifications** | `NotificationsScreen.tsx` | context `notifications` | Firestore `notifications` | CONNECTED |
| **Profile** | `ProfileScreen.tsx` | `supportService.createTicket` (feedback) | Firestore `support_tickets` | CONNECTED (feedback only) |
| **Search** | `SearchScreen.tsx` | in-memory filter over context | — | PARTIAL (callable `search-globalSearch` unused) |

## 4. Known Gaps
1. `support` admin tab is a placeholder (Users manager); no support-ticket UI.
2. `banners` collection / `bannerService` unused; banner UI operates on `suvichar`.
3. Mobile personal state (favorites, sadhana, profile, alarms) is local-only — no backend contract exists for it in admin-panel.
4. `books` collection has no client UI.
