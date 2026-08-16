# Media Platform Domain Model
**Sprint M1 — Foundation**

## Core Entities

### MediaAsset
The primary domain entity representing any media file managed by the platform.

| Field | Type | Description |
|---|---|---|
| `id` | string | Firestore document ID |
| `type` | MediaType | audio, image, banner, pdf, video, document |
| `category` | MediaCategory | bhajan, stuti_vinati, book, banner, avatar, etc. |
| `status` | MediaStatus | pending, processing, active, archived, failed, deleted |
| `visibility` | MediaVisibility | public, authenticated, admin_only |
| `folder` | MediaFolder | Storage folder enum |
| `storageUrl` | string | Public/signed download URL |
| `storagePath` | string | Firebase Storage path |
| `thumbnailUrl` | string? | Thumbnail download URL |
| `metadata` | MediaMetadata | Technical file metadata |
| `tags` | string[] | Taxonomy tags |
| `title` | string? | Human-readable title |
| `linkedEntityId` | string? | Related entity ID (bhajan, book, etc.) |
| `uploadedBy` | string | Firebase Auth UID |
| `createdAt` | Timestamp | Creation timestamp |
| `updatedAt` | Timestamp | Last update timestamp |

### MediaMetadata

| Field | Type | Description |
|---|---|---|
| `filename` | string | Stored filename |
| `originalFilename` | string | Original uploaded filename |
| `mimeType` | string | Declared MIME type |
| `sizeBytes` | number | File size in bytes |
| `extension` | string | File extension |
| `checksum` | string? | MD5/SHA256 for deduplication |
| `width` | number? | Image width in pixels |
| `height` | number? | Image height in pixels |
| `duration` | number? | Audio/video duration in seconds |
| `bitrate` | number? | Audio bitrate |
| `sampleRate` | number? | Audio sample rate |
| `pageCount` | number? | PDF page count |

## Value Objects

### MediaType
`audio` | `image` | `banner` | `pdf` | `video` | `document`

### MediaStatus
`pending` | `processing` | `active` | `archived` | `failed` | `deleted`

### MediaVisibility
`public` | `authenticated` | `admin_only`

### MediaCategory
`bhajan` | `stuti_vinati` | `book` | `banner` | `avatar` | `event` | `notification` | `general`

### MediaFolder
`audio` | `books` | `banners` | `images` | `videos` | `avatars` | `documents` | `events` | `exports` | `temp` | `processing` | `backups`

## Size Limits

| Type | Limit |
|---|---|
| Images / Banners | 5 MB |
| Audio | 50 MB |
| PDF / Documents | 20 MB |
| Video | 500 MB |
