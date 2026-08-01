# Firebase Architecture & Mapping

This document provides a comprehensive mapping of the Firebase architecture across the Backend, Admin Panel, and Mobile apps.

## 1. Firestore Collections

Based on `firestore.rules`, `firestore.indexes.json`, and application usages, the following collections are present:

* **Users & Roles**: `users` (contains subcollections), `roles`
* **App Config & UI**: `app_settings`, `home_banners`, `banners`, `quick_actions`, `featured_content`
* **Content**: `daily_suvichar`, `daily_quotes`, `suvichar`, `stuti_vinati`, `quotes`
* **Media & Documents**: `audio`, `audio_categories`, `books`, `book_categories`, `categories`
* **Engagement & Activity**: `notifications`, `analytics`, `downloads`, `donations`, `search_index`
* **Legacy/Other**: `satsangs`, `events`, `audit_logs`, `profiles`, `library`, `preferences`

## 2. Storage Folders

Based on `storage.rules`:

* `/public/`: General public assets.
* `/audio/`: Audio files (max 50MB, `audio/*`).
* `/banners/`: Banner images (max 5MB, `image/*`).
* `/thumbnails/`: Image thumbnails (max 5MB, `image/*`).
* `/books/`: PDF Documents (max 20MB, `application/pdf`).
* `/prayers/`: Prayer related files.
* `/users/`: User-specific files (e.g., profile pictures).

## 3. Security Rules Summary

* **Authentication & Admin**: Most endpoints require basic authentication (`request.auth != null`). Write operations are heavily restricted to Admin (`request.auth.token.admin == true`).
* **Owner Access**: Users can read, create, and update their own `users/{userId}` profile and subcollections, `downloads`, and `donations`. Admin modifications are blocked from the client side using `.diff()` checks.
* **Public/Authenticated Read**: Collections like `banners`, `audio`, `books`, `categories`, `stuti_vinati`, etc., can be read by any authenticated user but written only by an Admin.
* **Storage Validation**: Strict content-type and file size constraints are applied to `audio`, `banners`, `thumbnails`, and `books` uploads.

## 4. Firestore Indexes

Compound indexes are defined for querying:

* `audio`: `categoryId` (ASC), `createdAt` (DESC)
* `donations`: `userId` (ASC), `createdAt` (DESC)
* `banners`: `active` (ASC), `order` (ASC)
* `quick_actions`: `active` (ASC), `order` (ASC)

## 5. Admin Panel Mapping (React)

The React Admin Panel architecture implements a layered pattern: **Hook -> Service -> Repository -> Firestore Collection**.

| Feature | Hook | Service | Repository | Firestore Collection |
| :--- | :--- | :--- | :--- | :--- |
| **Banners** | `useBanners`, `useBannerMutations` | `bannerService` | `BannerRepository` | `banners` |
| **Bhajans (Audio)**| `useBhajans`, `useBhajanMutations` | `bhajanService` | `BhajanRepository` | `audio` |
| **Books** | `useBooks`, `useBookMutations` | `bookService` | `BookRepository` | `books` |
| **Categories** | `useCategories`, `useCategoryMutations`| `categoryService` | `CategoryRepository` | `categories` |
| **Notifications** | `useNotifications`, `useNotificationMutations` | `notificationService`| `NotificationRepository` | `notifications` |
| **Stuti Vinati** | `useStutiVinati`, `useStutiVinatiMutations`| `stutiVinatiService` | `StutiVinatiRepository`| `stuti_vinati` |
| **Suvichar** | `useSuvichar`, `useSuvicharMutations` | `suvicharService` | `SuvicharRepository` | `suvichar` |
| **Users** | `useUsers`, `useUserMutations` | `userService` | `UserRepository` | `users` |
| **Roles** | N/A | `roleService` | `RoleRepository` | `roles` |

## 6. Mobile App Mapping (Flutter)

The Flutter mobile application centrally manages its collection keys using `FirestoreCollections` (`core/firebase/firestore_collections.dart`).

**Registered Collection Keys:**
`users`, `profiles`, `satsangs`, `audio`, `books`, `book_categories`, `daily_quotes`, `events`, `notifications`, `donations`, `downloads`, `library`, `preferences`, `search_index`, `banners`, `quick_actions`.

**Datasources:**
These collections are interacted with via Firebase Datasources inside feature layers. Notable datasources include:
* `daily_suvichar_firebase_datasource.dart` (Daily Quotes)
* `firestore_audio_data_source.dart` & `firebase_audio_data_source.dart` (Audio & Categories)
* `users_firebase_datasource.dart` (Profile/Users)
* `notifications_firebase_datasource.dart` & `firestore_notification_data_source.dart` (Notifications & Preferences)
* `analytics_firebase_datasource.dart` (Analytics)

## 7. Backend (Firebase Functions)

Firebase functions act mainly as callable endpoints (`functions.https.onCall`) for the application:
* `auth.ts`, `profile.ts`, `events.ts`, `notifications.ts`, `donations.ts`, `search.ts`, `media.ts`, `admin_funcs.ts`.
* Currently, no native Firestore Triggers (e.g., `onDocumentCreated`) are implemented. Audit logs (`writeAuditLog`) are manually triggered inside these callable functions.
