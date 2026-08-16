// Enterprise Media Platform — Repository Implementation
// Sprint M1 Foundation

import 'package:santmat_satsang_prachar/core/utils/result.dart';
import 'package:santmat_satsang_prachar/core/media/data/datasources/media_remote_datasource.dart';
import 'package:santmat_satsang_prachar/core/media/data/models/media_asset_dto.dart';
import 'package:santmat_satsang_prachar/core/media/domain/entities/media_asset.dart';
import 'package:santmat_satsang_prachar/core/media/domain/repositories/i_media_repository.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_category.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_status.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_type.dart';

class MediaRepositoryImpl implements IMediaRepository {
  final IMediaRemoteDataSource _dataSource;

  const MediaRepositoryImpl(this._dataSource);

  @override
  Future<Result<MediaAsset>> getById(String id) async {
    try {
      final dto = await _dataSource.getById(id);
      return Result.success(dto.toDomain());
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<List<MediaAsset>>> getAll({
    MediaType? type,
    MediaCategory? category,
    MediaStatus? status,
    String? linkedEntityId,
    int? limit,
  }) async {
    try {
      final dtos = await _dataSource.getAll(
        type: type,
        category: category,
        status: status,
        linkedEntityId: linkedEntityId,
        limit: limit,
      );
      return Result.success(dtos.map((d) => d.toDomain()).toList());
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<List<MediaAsset>>> getByLinkedEntity(
    String entityId,
    String entityType,
  ) async {
    try {
      final dtos = await _dataSource.getByLinkedEntity(entityId, entityType);
      return Result.success(dtos.map((d) => d.toDomain()).toList());
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<MediaAsset>> save(MediaAsset asset) async {
    try {
      final data = MediaAssetDto.fromDomain(asset);
      final dto = await _dataSource.save(data);
      return Result.success(dto.toDomain());
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<MediaAsset>> update(String id, MediaAsset asset) async {
    try {
      final data = MediaAssetDto.fromDomain(asset);
      await _dataSource.update(id, data);
      return Result.success(asset.copyWith(id: id, updatedAt: DateTime.now()));
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<void>> softDelete(String id) async {
    try {
      await _dataSource.softDelete(id);
      return const Result.success(null);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<void>> hardDelete(String id) async {
    try {
      await _dataSource.hardDelete(id);
      return const Result.success(null);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }
}
