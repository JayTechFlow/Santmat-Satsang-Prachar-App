// Enterprise Media Platform — Repository Interface
// Sprint M1 Foundation

import 'package:santmat_satsang_prachar/core/utils/result.dart';
import 'package:santmat_satsang_prachar/core/media/domain/entities/media_asset.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_category.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_type.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_status.dart';

abstract class IMediaRepository {
  /// Fetch a single MediaAsset by ID.
  Future<Result<MediaAsset>> getById(String id);

  /// Fetch all media assets, optionally filtered.
  Future<Result<List<MediaAsset>>> getAll({
    MediaType? type,
    MediaCategory? category,
    MediaStatus? status,
    String? linkedEntityId,
    int? limit,
  });

  /// Fetch media linked to a specific entity (e.g. bhajan, book).
  Future<Result<List<MediaAsset>>> getByLinkedEntity(
    String entityId,
    String entityType,
  );

  /// Save a new MediaAsset record to Firestore.
  Future<Result<MediaAsset>> save(MediaAsset asset);

  /// Update an existing MediaAsset.
  Future<Result<MediaAsset>> update(String id, MediaAsset asset);

  /// Soft-delete: mark as deleted without removing from storage.
  Future<Result<void>> softDelete(String id);

  /// Hard-delete: remove from Firestore and Firebase Storage.
  Future<Result<void>> hardDelete(String id);
}
