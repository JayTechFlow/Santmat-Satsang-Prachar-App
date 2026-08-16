// Enterprise Media Platform — Domain Entity
// Sprint M1 Foundation

import 'package:santmat_satsang_prachar/core/media/domain/entities/media_metadata.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_type.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_status.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_visibility.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_category.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_folder.dart';

class MediaAsset {
  final String id;
  final MediaType type;
  final MediaCategory category;
  final MediaStatus status;
  final MediaVisibility visibility;
  final MediaFolder folder;
  final String storageUrl;
  final String storagePath;
  final String? thumbnailUrl;
  final String? thumbnailPath;
  final MediaMetadata metadata;
  final List<String> tags;
  final String? title;
  final String? description;
  final String? altText;
  final String? linkedEntityId;
  final String? linkedEntityType;
  final String uploadedBy;
  final String? uploadedByEmail;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? deletedAt;
  final DateTime? expiresAt;

  const MediaAsset({
    required this.id,
    required this.type,
    required this.category,
    required this.status,
    required this.visibility,
    required this.folder,
    required this.storageUrl,
    required this.storagePath,
    this.thumbnailUrl,
    this.thumbnailPath,
    required this.metadata,
    this.tags = const [],
    this.title,
    this.description,
    this.altText,
    this.linkedEntityId,
    this.linkedEntityType,
    required this.uploadedBy,
    this.uploadedByEmail,
    required this.createdAt,
    required this.updatedAt,
    this.deletedAt,
    this.expiresAt,
  });

  bool get isActive => status == MediaStatus.active;
  bool get isDeleted => deletedAt != null;
  bool get isExpired => expiresAt != null && DateTime.now().isAfter(expiresAt!);
  bool get isPublic => visibility == MediaVisibility.public;

  // Processing & Status indicators (Sprint M3.1)
  bool get isUploading => status == MediaStatus.pending;
  bool get isProcessing => status == MediaStatus.processing;
  bool get isReady => status == MediaStatus.active && !isDeleted && !isExpired;

  MediaAsset copyWith({
    String? id,
    MediaType? type,
    MediaCategory? category,
    MediaStatus? status,
    MediaVisibility? visibility,
    MediaFolder? folder,
    String? storageUrl,
    String? storagePath,
    String? thumbnailUrl,
    String? thumbnailPath,
    MediaMetadata? metadata,
    List<String>? tags,
    String? title,
    String? description,
    String? altText,
    String? linkedEntityId,
    String? linkedEntityType,
    String? uploadedBy,
    String? uploadedByEmail,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? deletedAt,
    DateTime? expiresAt,
  }) {
    return MediaAsset(
      id: id ?? this.id,
      type: type ?? this.type,
      category: category ?? this.category,
      status: status ?? this.status,
      visibility: visibility ?? this.visibility,
      folder: folder ?? this.folder,
      storageUrl: storageUrl ?? this.storageUrl,
      storagePath: storagePath ?? this.storagePath,
      thumbnailUrl: thumbnailUrl ?? this.thumbnailUrl,
      thumbnailPath: thumbnailPath ?? this.thumbnailPath,
      metadata: metadata ?? this.metadata,
      tags: tags ?? this.tags,
      title: title ?? this.title,
      description: description ?? this.description,
      altText: altText ?? this.altText,
      linkedEntityId: linkedEntityId ?? this.linkedEntityId,
      linkedEntityType: linkedEntityType ?? this.linkedEntityType,
      uploadedBy: uploadedBy ?? this.uploadedBy,
      uploadedByEmail: uploadedByEmail ?? this.uploadedByEmail,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      deletedAt: deletedAt ?? this.deletedAt,
      expiresAt: expiresAt ?? this.expiresAt,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is MediaAsset &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;
}
