# Database Schema & Data Architecture

## Firestore Collection Structure

The database utilizes Cloud Firestore structured into top-level collections with strictly validated schemas.

```
firestore-root
 ├── users/{uid}
 ├── satsangs/{satsangId}
 ├── media/{mediaId}
 ├── books/{bookId}
 ├── events/{eventId}
 ├── donations/{donationId}
 └── system/{configDoc}
```

---

## Entity Schemas & Fields

### 1. `users` Collection
Document ID: `{uid}` (Matches Firebase Auth UID)

| Field Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `uid` | String | Yes | Unique Firebase User ID |
| `phoneNumber` | String | No | Formatted E.164 phone number |
| `email` | String | No | User email address |
| `displayName` | String | Yes | Full name |
| `role` | String | Yes | Role: `admin`, `editor`, `user`, `guest` |
| `preferredLanguage` | String | Yes | Default: `hi` (Hindi), `en`, etc. |
| `fcmTokens` | Array<String> | Yes | List of active FCM tokens for push notifications |
| `createdAt` | Timestamp | Yes | Profile creation time |
| `updatedAt` | Timestamp | Yes | Last profile update time |

---

### 2. `satsangs` Collection
Document ID: `{satsangId}`

| Field Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Yes | Satsang Identifier |
| `title` | Map<String, String> | Yes | Localized titles (`hi`, `en`) |
| `description` | Map<String, String> | No | Localized description |
| `speaker` | String | Yes | Preacher / Swami name |
| `location` | GeoPoint | No | Latitude/Longitude coordinates |
| `date` | Timestamp | Yes | Event or recording timestamp |
| `audioUrl` | String | No | Direct audio URL / HLS stream URL |
| `videoUrl` | String | No | Video playback stream URL |
| `durationSeconds` | Number | Yes | Audio/Video duration in seconds |
| `tags` | Array<String> | No | Searchable tags |
| `isPublished` | Boolean | Yes | Publication state control |
| `createdAt` | Timestamp | Yes | Record creation time |

---

### 3. `media` Collection (Audios, Videos, Podcasts)
Document ID: `{mediaId}`

| Field Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Yes | Media item ID |
| `type` | String | Yes | Enum: `audio`, `video`, `bhajan`, `discourse` |
| `title` | String | Yes | Media Title |
| `mediaUrl` | String | Yes | HLS Manifest URL (`.m3u8`) or Direct Storage URL |
| `thumbnailUrl` | String | Yes | Poster image URL |
| `fileSizeBytes` | Number | Yes | Total file size |
| `bitrateKbps` | Number | No | Media bitrate |
| `processingStatus` | String | Yes | Status: `PENDING`, `PROCESSING`, `READY`, `FAILED` |
| `viewCount` | Number | Yes | Aggregated view counter |
| `createdAt` | Timestamp | Yes | Creation timestamp |

---

### 4. `donations` Collection
Document ID: `{donationId}`

| Field Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Yes | Transaction ID |
| `userId` | String | Yes | Contributor UID |
| `amount` | Number | Yes | Currency amount in INR/USD |
| `currency` | String | Yes | Currency code (`INR`, `USD`) |
| `gateway` | String | Yes | Gateway used (`Razorpay`, `Stripe`) |
| `transactionRef` | String | Yes | External payment gateway transaction ID |
| `status` | String | Yes | Status: `PENDING`, `SUCCESS`, `FAILED` |
| `timestamp` | Timestamp | Yes | Transaction timestamp |

---

## Firestore Indexing Rules (`firestore.indexes.json`)

To support high-performance queries, compound composite indexes are defined:

```json
{
  "indexes": [
    {
      "collectionGroup": "satsangs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isPublished", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "media",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "type", "order": "ASCENDING" },
        { "fieldPath": "processingStatus", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

---

## Firebase Security Rules Summary

- **Users**: Read permitted for owner or admin. Write permitted only for authenticating user (`request.auth.uid == userId`).
- **Satsangs & Media**: Public read permitted for `isPublished == true`. Write restricted strictly to users with custom claim `request.auth.token.role in ['admin', 'editor']`.
- **Donations**: Read permitted for owner (`request.auth.uid == resource.data.userId`) or admin. Write permitted only through validated backend Cloud Functions.
