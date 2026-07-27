import '../models/daily_suvichar_dto.dart';

abstract class DailySuvicharRemoteDataSource {
  Future<List<DailySuvicharDto>> getAll();
  Future<DailySuvicharDto?> getById(String id);
  Future<void> add(DailySuvicharDto item);
  Future<void> update(DailySuvicharDto item);
  Future<void> delete(String id);
}
