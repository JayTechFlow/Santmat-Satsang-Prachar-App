// Enterprise Media Platform — Data Transfer Object
// Sprint M1 Foundation

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:santmat_satsang_prachar/core/media/domain/entities/media_asset.dart';
import 'package:santmat_satsang_prachar/core/media/domain/entities/media_metadata.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_type.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_status.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_visibility.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_category.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_folder.dart';

class MediaAssetDto {
  final String id;
  final Map<String, dynamic> data;

  const MediaAssetDto({required this.id, required this.data});

  factory MediaAssetDto.fromFirestore(DocumentSnapshot doc) {
    return MediaAssetDto(
      id: doc.id,
      data: doc.data() as Map<String, dynamic>,
    );
  }

  Map<String, dynamic> toFirestore() => {
    ...data,
    'updatedAt': FieldValue.serverTimestamp(),
  };

  MediaAsset toDomain() {
    final meta = data['metadata'] as Map<String, dynamic>? ?? {};
    return MediaAsset(
      id: id,
      type: MediaType.fromString(data['type'] as String? ?? ''),
      category: MediaCategory.fromString(data['category'] as String? ?? ''),
      status: MediaStatus.fromString(data['status'] as String? ?? ''),
      visibility: MediaVisibility.fromString(data['visibility'] as String? ?? ''),
      folder: MediaFolder.fromString(data['folder'] as String? ?? ''),
      storageUrl: data['storageUrl'] as String? ?? '',
      storagePath: data['storagePath'] as String? ?? '',
      thumbnailUrl: data['thumbnailUrl'] as String?,
      thumbnailPath: data['thumbnailPath'] as String?,
      metadata: MediaMetadata(
        filename: meta['filename'] as String? ?? '',
        originalFilename: meta['originalFilename'] as String? ?? '',
        mimeType: meta['mimeType'] as String? ?? '',
        sizeBytes: (meta['sizeBytes'] as num?)?.toInt() ?? 0,
        extension: meta['extension'] as String? ?? '',
        checksum: meta['checksum'] as String?,
        width: (meta['width'] as num?)?.toInt(),
        height: (meta['height'] as num?)?.toInt(),
        duration: (meta['duration'] as num?)?.toDouble(),
        bitrate: (meta['bitrate'] as num?)?.toInt(),
        sampleRate: (meta['sampleRate'] as num?)?.toInt(),
        blurHashPlaceholder: meta['blurHashPlaceholder'] as String?,
        previewUrl: meta['previewUrl'] as String?,
        streamingPreviewUrl: meta['streamingPreviewUrl'] as String?,
        waveformPoints: (meta['waveformPoints'] as List?)?.map((e) => (e as num).toDouble()).toList(),
        posterUrl: meta['posterUrl'] as String?,
        frameRate: (meta['frameRate'] as num?)?.toDouble(),
        videoCodec: meta['videoCodec'] as String?,
        author: meta['author'] as String?,
        documentCategory: meta['documentCategory'] as String?,
        isEncrypted: meta['isEncrypted'] as bool?,
        customFields: Map<String, String>.from(meta['customFields'] as Map? ?? {}),
      ),
      tags: List<String>.from(data['tags'] as List? ?? []),
      title: data['title'] as String?,
      description: data['description'] as String?,
      altText: data['altText'] as String?,
      linkedEntityId: data['linkedEntityId'] as String?,
      linkedEntityType: data['linkedEntityType'] as String?,
      uploadedBy: data['uploadedBy'] as String? ?? '',
      uploadedByEmail: data['uploadedByEmail'] as String?,
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      updatedAt: (data['updatedAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      deletedAt: (data['deletedAt'] as Timestamp?)?.toDate(),
      expiresAt: (data['expiresAt'] as Timestamp?)?.toDate(),
    );
  }

  static Map<String, dynamic> fromDomain(MediaAsset asset) => {
    'type': asset.type.value,
    'category': asset.category.value,
    'status': asset.status.value,
    'visibility': asset.visibility.value,
    'folder': asset.folder.value,
    'storageUrl': asset.storageUrl,
    'storagePath': asset.storagePath,
    'thumbnailUrl': asset.thumbnailUrl,
    'thumbnailPath': asset.thumbnailPath,
    'metadata': {
      'filename': asset.metadata.filename,
      'originalFilename': asset.metadata.originalFilename,
      'mimeType': asset.metadata.mimeType,
      'sizeBytes': asset.metadata.sizeBytes,
      'extension': asset.metadata.extension,
      'checksum': asset.metadata.checksum,
      'width': asset.metadata.width,
      'height': asset.metadata.height,
      'duration': asset.metadata.duration,
      'bitrate': asset.metadata.bitrate,
      'sampleRate': asset.metadata.sampleRate,
      'pageCount': asset.metadata.pageCount,
      'customFields': asset.metadata.customFields,
    },
    'tags': asset.tags,
    'title': asset.title,
    'description': asset.description,
    'altText': asset.altText,
    'linkedEntityId': asset.linkedEntityId,
    'linkedEntityType': asset.linkedEntityType,
    'uploadedBy': asset.uploadedBy,
    'uploadedByEmail': asset.uploadedByEmail,
    'createdAt': FieldValue.serverTimestamp(),
    'updatedAt': FieldValue.serverTimestamp(),
    'deletedAt': asset.deletedAt != null ? Timestamp.fromDate(asset.deletedAt!) : null,
    'expiresAt': asset.expiresAt != null ? Timestamp.fromDate(asset.expiresAt!) : null,
  };
}
