import '../entities/daily_suvichar_entity.dart';

abstract class DailySuvicharRepository {
  Future<List<DailySuvichar>> getAll();
  Future<DailySuvichar?> getById(String id);
  Future<void> add(DailySuvichar item);
  Future<void> update(DailySuvichar item);
  Future<void> delete(String id);
}
