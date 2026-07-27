import '../../domain/entities/analytics_entity.dart';
import '../../domain/repositories/analytics_repository.dart';
import '../datasources/analytics_remote_datasource.dart';
import '../models/analytics_dto.dart';

class AnalyticsEventRepositoryImpl implements AnalyticsEventRepository {
  final AnalyticsEventRemoteDataSource _remoteDataSource;

  AnalyticsEventRepositoryImpl(this._remoteDataSource);

  @override
  Future<List<AnalyticsEvent>> getAll() async {
    return await _remoteDataSource.getAll();
  }

  @override
  Future<AnalyticsEvent?> getById(String id) async {
    return await _remoteDataSource.getById(id);
  }

  @override
  Future<void> add(AnalyticsEvent item) async {
    final dto = AnalyticsEventDto(
      id: item.id,
      eventName: item.eventName,
      userId: item.userId,
      parameters: item.parameters,
      timestamp: item.timestamp,
    );
    await _remoteDataSource.add(dto);
  }

  @override
  Future<void> update(AnalyticsEvent item) async {
    final dto = AnalyticsEventDto(
      id: item.id,
      eventName: item.eventName,
      userId: item.userId,
      parameters: item.parameters,
      timestamp: item.timestamp,
    );
    await _remoteDataSource.update(dto);
  }

  @override
  Future<void> delete(String id) async {
    await _remoteDataSource.delete(id);
  }
}
