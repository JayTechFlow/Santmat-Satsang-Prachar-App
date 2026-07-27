import '../../domain/entities/stuti_vinati_entity.dart';
import '../../domain/repositories/stuti_vinati_repository.dart';
import '../datasources/stuti_vinati_remote_datasource.dart';
import '../models/stuti_vinati_dto.dart';

class StutiVinatiRepositoryImpl implements StutiVinatiRepository {
  final StutiVinatiRemoteDataSource _remoteDataSource;

  StutiVinatiRepositoryImpl(this._remoteDataSource);

  @override
  Future<List<StutiVinati>> getAll() async {
    return await _remoteDataSource.getAll();
  }

  @override
  Future<StutiVinati?> getById(String id) async {
    return await _remoteDataSource.getById(id);
  }

  @override
  Future<void> add(StutiVinati item) async {
    final dto = StutiVinatiDto(
      id: item.id,
      title: item.title,
      textContent: item.textContent,
      audioUrl: item.audioUrl,
      type: item.type,
    );
    await _remoteDataSource.add(dto);
  }

  @override
  Future<void> update(StutiVinati item) async {
    final dto = StutiVinatiDto(
      id: item.id,
      title: item.title,
      textContent: item.textContent,
      audioUrl: item.audioUrl,
      type: item.type,
    );
    await _remoteDataSource.update(dto);
  }

  @override
  Future<void> delete(String id) async {
    await _remoteDataSource.delete(id);
  }
}
