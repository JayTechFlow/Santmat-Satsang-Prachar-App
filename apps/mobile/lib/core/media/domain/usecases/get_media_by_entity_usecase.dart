// Enterprise Media Platform — UseCase: GetMediaByEntity
// Sprint M1 Foundation

import 'package:santmat_satsang_prachar/core/utils/result.dart';
import 'package:santmat_satsang_prachar/core/media/domain/entities/media_asset.dart';
import 'package:santmat_satsang_prachar/core/media/domain/repositories/i_media_repository.dart';

class GetMediaByEntityUseCase {
  final IMediaRepository _repository;

  const GetMediaByEntityUseCase(this._repository);

  Future<Result<List<MediaAsset>>> call(
    String entityId,
    String entityType,
  ) {
    return _repository.getByLinkedEntity(entityId, entityType);
  }
}
