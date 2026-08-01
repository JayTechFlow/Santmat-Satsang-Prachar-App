# Firebase Domain Matrix

This document outlines the Firebase architecture for the Santmat Satsang Prachar application, covering Firestore collections, Storage, Indexes, Security Rules, and Cloud Functions.

## 1. Firestore Collections Overview

The application utilizes approximately 25 core collections in Firestore. Access is governed primarily by Authentication and Role-Based Access Control (Admin vs. User).

| Collection | Description / Access Rules |
|---|---|
| `users` | User profiles. Users can read/write their own profile (excluding `role`/`admin` flags). Admins have full access. Contains nested subcollections. |
| `app_settings` | Global app config. Read: Authenticated, Write: Admin. |
| `home_banners`, `banners` | Banner configurations. Read: Authenticated, Write: Admin. |
| `quick_actions` | Homepage quick actions. Read: Authenticated, Write: Admin. |
| `daily_suvichar`, `suvichar` | Daily quotes/thoughts. Read: Authenticated, Write: Admin. |
| `daily_quotes`, `quotes` | Quotes repository. Read: Authenticated, Write: Admin. |
| `featured_content` | Featured media/items. Read: Authenticated, Write: Admin. |
| `audio`, `audio_categories` | Audio files and categories. Read: Authenticated, Write: Admin. |
| `books`, `book_categories` | E-books and categories. Read: Authenticated, Write: Admin. |
| `stuti_vinati` | Prayers. Read: Authenticated, Write: Admin. |
| `categories` | General categories. Read: Authenticated, Write: Admin. |
| `roles` | RBAC mappings. Read/Write: Admin only. |
| `notifications` | Notification history. Read: Authenticated, Write: Admin. |
| `analytics` | System analytics. Read/Write: Admin only. |
| `audit_logs` | Audit trail for critical actions. Read: Admin, Write: None (System). |
| `search_index` | Search caching. Read: Authenticated, Write: Admin. |
| `downloads` | Download history. Read/Update/Delete: Owner or Admin. Create: Owner. |
| `donations` | Donation records. Read: Owner or Admin. Create: Owner, Update/Delete: Admin. |
| `satsangs`, `events` | Legacy/Event collections. Read: Authenticated, Write: Admin. |

## 2. Cloud Storage Rules

Storage is partitioned by content type and access level, ensuring secure media delivery and management.

| Path | Access Rules | Constraints |
|---|---|---|
| `/public/**` | Read: Authenticated, Write: Admin | - |
| `/audio/**` | Read: Authenticated, Write: Admin | Content-Type: `audio/*`, Size < 50MB |
| `/banners/**` | Read: Authenticated, Write: Admin | Content-Type: `image/*`, Size < 5MB |
| `/thumbnails/**` | Read: Authenticated, Write: Admin | Content-Type: `image/*`, Size < 5MB |
| `/books/**` | Read: Authenticated, Write: Admin | Content-Type: `application/pdf`, Size < 20MB |
| `/prayers/**` | Read: Authenticated, Write: Admin | - |
| `/users/{userId}/**`| Read: Owner or Admin, Write: Owner | Content-Type: `image/*` |

## 3. Firestore Indexes

Custom indexes are configured to support complex queries for specific features:

* **Audio:** `categoryId` (ASC) + `createdAt` (DESC)
* **Donations:** `userId` (ASC) + `createdAt` (DESC)
* **Banners:** `active` (ASC) + `order` (ASC)
* **Quick Actions:** `active` (ASC) + `order` (ASC)

## 4. Cloud Functions Mapping

Business logic is encapsulated in Firebase Cloud Functions deployed from `backend/firebase/functions/src/`.

| Domain | Functions | Description |
|---|---|---|
| **Auth** | `validateToken`, `sessionValidation`, `roleResolution` | Manages authentication tokens and RBAC. |
| **Profile** | `getProfile` | Retrieves user profile securely. |
| **Events** | `register`, `cancel`, `attendance` | Handles event registrations and generates audit logs. |
| **Notifications** | `subscribeTopic`, `broadcast` | Push notification management via FCM. |
| **Donations** | `createPaymentIntent`, `verifyPayment`, `generateReceipt` | Payment processing flows. |
| **Search** | `globalSearch`, `autocomplete`, `trendingSearches` | Advanced search capabilities. |
| **Media** | `generateSignedUrl`, `generateUploadUrl` | Secure media URL generation. |
| **Admin** | `getDashboardStats`, `contentModeration` | Admin analytics and moderation tools. |

## 5. Security Rules Overview

* **Authentication Requirement:** Almost all resources require the user to be authenticated (`request.auth != null`).
* **Role-Based Access:** Admin privileges are checked via custom claims (`request.auth.token.admin == true`).
* **Ownership Verification:** User-specific data (profiles, downloads, user storage) ensures the requester matches the `userId` (`request.auth.uid == userId`).
* **Audit Trails:** Critical operations (like event registration, moderation) are logged to the `audit_logs` collection via Cloud Functions, bypassing direct client write access.
