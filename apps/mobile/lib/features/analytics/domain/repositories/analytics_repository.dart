import '../entities/analytics_entity.dart';

abstract class AnalyticsEventRepository {
  Future<List<AnalyticsEvent>> getAll();
  Future<AnalyticsEvent?> getById(String id);
  Future<void> add(AnalyticsEvent item);
  Future<void> update(AnalyticsEvent item);
  Future<void> delete(String id);
}
