import '../../domain/entities/daily_suvichar_entity.dart';
import '../../domain/repositories/daily_suvichar_repository.dart';
import '../datasources/daily_suvichar_remote_datasource.dart';
import '../models/daily_suvichar_dto.dart';

class DailySuvicharRepositoryImpl implements DailySuvicharRepository {
  final DailySuvicharRemoteDataSource _remoteDataSource;

  DailySuvicharRepositoryImpl(this._remoteDataSource);

  @override
  Future<List<DailySuvichar>> getAll() async {
    return await _remoteDataSource.getAll();
  }

  @override
  Future<DailySuvichar?> getById(String id) async {
    return await _remoteDataSource.getById(id);
  }

  @override
  Future<void> add(DailySuvichar item) async {
    final dto = DailySuvicharDto(
      id: item.id,
      text: item.text,
      imageUrl: item.imageUrl,
      date: item.date,
    );
    await _remoteDataSource.add(dto);
  }

  @override
  Future<void> update(DailySuvichar item) async {
    final dto = DailySuvicharDto(
      id: item.id,
      text: item.text,
      imageUrl: item.imageUrl,
      date: item.date,
    );
    await _remoteDataSource.update(dto);
  }

  @override
  Future<void> delete(String id) async {
    await _remoteDataSource.delete(id);
  }
}
