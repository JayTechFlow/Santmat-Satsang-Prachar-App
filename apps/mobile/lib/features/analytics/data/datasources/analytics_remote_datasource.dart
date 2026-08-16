import '../models/analytics_dto.dart';

abstract class AnalyticsEventRemoteDataSource {
  Future<List<AnalyticsEventDto>> getAll();
  Future<AnalyticsEventDto?> getById(String id);
  Future<void> add(AnalyticsEventDto item);
  Future<void> update(AnalyticsEventDto item);
  Future<void> delete(String id);
}
