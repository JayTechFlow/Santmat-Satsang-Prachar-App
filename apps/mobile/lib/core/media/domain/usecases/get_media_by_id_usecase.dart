// Enterprise Media Platform — UseCase: GetMediaById
// Sprint M1 Foundation

import 'package:santmat_satsang_prachar/core/utils/result.dart';
import 'package:santmat_satsang_prachar/core/media/domain/entities/media_asset.dart';
import 'package:santmat_satsang_prachar/core/media/domain/repositories/i_media_repository.dart';

class GetMediaByIdUseCase {
  final IMediaRepository _repository;

  const GetMediaByIdUseCase(this._repository);

  Future<Result<MediaAsset>> call(String id) {
    return _repository.getById(id);
  }
}
