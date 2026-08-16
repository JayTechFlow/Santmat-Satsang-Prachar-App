# Enterprise Media Platform Architecture
**Sprint M1 — Foundation**  
**Project**: Santmat Satsang Prachar

---

## Architecture Overview

```
┌───────────────────────────────────────────────────────────┐
│           ENTERPRISE MEDIA PLATFORM (Sprint M1)           │
└───────────────────────────────────────────────────────────┘

     ┌─────────────┐     ┌─────────────┐
     │ Flutter App │     │ Admin Panel │
     └────────┬───┘     └────┬────────┘
               │                │
               │  Read assets   │  Upload/Manage
               │                │
               ▼                ▼
┌───────────────────────────────────────────────────────────┐
│              IMediaStorageProvider               │
│                   (Interface)                     │
│  upload | delete | restore | move | copy          │
│  generateDownloadUrl | generateStreamingUrl        │
│  exists | getMetadata | healthCheck               │
└─────────┬──────────────────────┬─────────────────────┘
         │                       │
         ▼                       ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│  Firebase      │ │  FutureS3     │ │  FutureAzure  │
│  Storage       │ │  Storage      │ │  Blob         │
│  Provider      │ │  Provider     │ │  Provider     │
│  (M1 Active)   │ │  (Pluggable)  │ │  (Pluggable)  │
└───────────────┘ └───────────────┘ └───────────────┘
```

## Layer Responsibilities

### Presentation Layer
- Flutter App: consumes media URLs, streams audio, renders images
- Admin Panel: manages media assets, uploads files, organizes library

### Domain Layer (Clean Architecture)
- `MediaAsset` entity: core business object
- `IMediaRepository`: repository contract
- Use cases: `GetMediaById`, `GetMediaByEntity`
- Value objects: `MediaType`, `MediaStatus`, `MediaVisibility`, `MediaCategory`, `MediaFolder`

### Data Layer
- `MediaRepositoryImpl`: implements IMediaRepository
- `FirestoreMediaDataSource`: reads/writes Firestore `media` collection
- `MediaAssetDto`: Firestore serialization/deserialization

### Infrastructure Layer
- `IMediaStorageProvider`: provider abstraction
- `FirebaseStorageProvider`: Firebase Storage implementation
- `MediaUploadPipeline`: orchestrates upload flow with hooks
- `MediaValidator`: validates MIME, extension, size, magic bytes

### Cloud Functions
- `generateSignedUrl`: admin-gated signed download URL generation
- `generateUploadUrl`: admin-gated signed upload URL generation
- `onMediaDocumentCreated`: auto audit log on new media
- `onMediaDocumentDeleted`: auto cleanup of Storage on hard delete

## Storage Folder Structure

```
Firebase Storage Bucket
├── audio/           # Bhajans, Stuti Vinati audio files
├── books/           # PDF books and cover images
├── banners/         # Promotional banners
├── images/          # General images
├── videos/          # Future video support
├── avatars/         # User profile photos (per user ID)
├── documents/       # General documents
├── events/          # Event banners and attachments
├── exports/         # Admin-generated exports
├── temp/            # Transient uploads during processing
├── processing/      # Backend pipeline working files (service account only)
└── backups/         # Admin-only backup storage (service account only)
```

## Firestore Collections

| Collection | Purpose | Access |
|---|---|---|
| `media` | Central media asset registry | Authenticated read (non-admin_only), Admin CRUD |
| `media_versions` | Version history of media assets | Admin only |
| `media_processing_jobs` | Async processing job tracking | Admin read, Cloud Functions write |
| `media_tags` | Tagging taxonomy | Authenticated read, Admin write |
| `media_audit` | Immutable audit trail | Admin read, Cloud Functions write |

## Provider Abstraction

To swap storage backend from Firebase to S3, Azure or Cloudflare R2:
1. Implement `IMediaStorageProvider` interface.
2. Replace `FirebaseStorageProvider` instantiation in DI.
3. No changes to `MediaUploadPipeline`, `MediaValidator`, or any feature code.
