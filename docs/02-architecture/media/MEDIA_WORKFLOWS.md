# Media Platform Workflows
**Sprint M1 — Foundation**

## Upload Pipeline

```
File Selected
    ↓
[Stage 1] Validation
   • MIME type check
   • Extension check
   • File size check
   • Filename check
   • Magic byte verification (async, non-blocking)
    ↓
[Stage 2] RBAC Check
   • Verify admin JWT claim
   • Reject if insufficient permissions
    ↓
[Stage 3] Virus Scan Hook (Extension Point)
   • Currently: pass-through
   • M2+: ClamAV / VirusTotal integration
    ↓
[Stage 4] Compression Hook (Extension Point)
   • Currently: pass-through
   • M2+: Image WebP conversion, audio normalization
    ↓
[Stage 5] Thumbnail Hook (Extension Point)
   • Currently: pass-through
   • M2+: Auto-generate thumbnails for audio/video/PDF
    ↓
[Stage 6] Metadata Extraction
   • Image dimensions (width, height)
   • File size, MIME type, extension
   • Audio/video duration (M2+)
    ↓
[Stage 7] Storage Upload
   • Upload to Firebase Storage via IMediaStorageProvider
   • Progress callback
    ↓
[Stage 8] Result Composition
   • Compose MediaAsset domain object
   • Return MediaUploadResult
    ↓
Firestore Save (by caller)
    ↓
Cloud Function: onMediaDocumentCreated
   • Write to media_audit collection
    ↓
Done
```

## Read Flow (Mobile App)

```
Screen loads
    ↓
UseCase called (e.g. GetMediaByEntityUseCase)
    ↓
IMediaRepository.getByLinkedEntity()
    ↓
FirestoreMediaDataSource.getByLinkedEntity()
    ↓
Firestore query: media collection
   • where linkedEntityId == entityId
   • where linkedEntityType == entityType
   • where status != deleted
    ↓
MediaAssetDto.toDomain() for each result
    ↓
List<MediaAsset> returned
    ↓
Widget renders
```

## Delete Flow

### Soft Delete
```
Admin clicks Delete
    ↓
MediaRepository.softDelete(id)
    ↓
Firestore update: status = deleted, deletedAt = now
    ↓
Asset hidden from public queries (status filter)
```

### Hard Delete
```
Admin confirms permanent deletion
    ↓
MediaRepository.hardDelete(id)
    ↓
Firestore document deleted
    ↓
Cloud Function: onMediaDocumentDeleted fires
    ↓
Storage files deleted (storagePath + thumbnailPath)
```
