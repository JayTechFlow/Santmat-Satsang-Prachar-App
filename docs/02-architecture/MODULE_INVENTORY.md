# Module Inventory

This document provides an inventory of all feature modules across the Flutter mobile app and the React admin panel. It tracks the implementation status of each module.

## 📱 Mobile App (`mobile/app/lib/features`)

| Module | Status | Notes |
|---|---|---|
| **authentication** | ✅ Implemented | Fully integrated core authentication flow. |
| **home** | ✅ Implemented | Core dashboard / home screen UI and logic. |
| **library** | ✅ Implemented | Manage reading lists, downloads, and progress. |
| **notifications** | ✅ Implemented | Push notifications, lists, and settings. |
| **preferences** | ✅ Implemented | User preferences settings and configuration UI. |
| **search** | ✅ Implemented | Global app search functionality. |
| **audio** | 🚧 Incomplete | Missing implementations for favorite toggle, seek, next/prev, and playlist logic. "Playlist" and "Category Details" are coming soon. |
| **books** | 🚧 Incomplete | Missing features. "Category Books", "Bookmarks", and "History" are coming soon. |
| **daily_quotes** | 🚧 Incomplete | "Quote Details", "Favorites", and "History" pages are coming soon. |
| **donations** | 🚧 Incomplete | "Campaign Details", "Checkout", "Donation History", and "Receipt" pages are coming soon. |
| **downloads** | 🚧 Incomplete | "Download Details" page is coming soon. |
| **events** | 🚧 Incomplete | "Event Details", "Registered Events", and "Registration" features are coming soon. |
| **profile** | 🚧 Incomplete | Core UI exists, but language change logic is explicitly marked as "TODO in next module". |
| **satsang** | 🚧 Incomplete | "Category Details" page is coming soon. |
| **analytics** | ❄️ Frozen / Orphaned | Data/domain layer exists but is not consumed by the app. Service locator relies on a core service instead. |
| **settings** | ❄️ Frozen / Duplicate | Global app settings feature module (data/domain) that is completely orphaned. User settings are handled by `preferences`, and app settings configuration has been moved or abandoned. |
| **common** | ❄️ Frozen / Abandoned | Empty folder structure. Likely deprecated in favor of `core` and `shared` directories. |

## 💻 Admin Panel (`admin-panel/src/features` & `pages`)

| Module | Status | Notes |
|---|---|---|
| **banners** | ✅ Implemented | Banner management features for the home carousel. |
| **bhajans** | ✅ Implemented | Audio track management (Frontend page: `Audio.tsx`). |
| **books** | ✅ Implemented | Book catalog management. |
| **categories** | ✅ Implemented | App-wide taxonomy and category management. |
| **dashboard** | ✅ Implemented | Overview stats and quick links. |
| **notifications** | ✅ Implemented | Push notification sender and history logs. |
| **stuti-vinati** | ✅ Implemented | Devotional text management (different from audio bhajans). |
| **suvichar** | ✅ Implemented | Daily quotes / suvichar management. |
| **users** | ✅ Implemented | User administration and session tracking. |
| **Playlist** | ⏳ Coming Soon | Stub page exists (`Playlist.tsx`) using `<ComingSoon />` component. |
| **Reports** | ⏳ Coming Soon | Stub page exists (`Reports.tsx`) using `<ComingSoon />` component. |
| **Settings** | ⏳ Coming Soon | Stub page exists (`Settings.tsx`) using `<ComingSoon />` component. |
| **Support** | ⏳ Coming Soon | Stub page exists (`Support.tsx`) using `<ComingSoon />` component. |
