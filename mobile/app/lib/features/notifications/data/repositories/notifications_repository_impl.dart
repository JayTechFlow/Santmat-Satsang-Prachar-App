import '../../domain/entities/notifications_entity.dart';
import '../../domain/repositories/notifications_repository.dart';
import '../datasources/notifications_remote_datasource.dart';
import '../models/notifications_dto.dart';

class NotificationMessageRepositoryImpl
    implements NotificationMessageRepository {
  final NotificationMessageRemoteDataSource _remoteDataSource;

  NotificationMessageRepositoryImpl(this._remoteDataSource);

  @override
  Future<List<NotificationMessage>> getAll() async {
    return await _remoteDataSource.getAll();
  }

  @override
  Future<NotificationMessage?> getById(String id) async {
    return await _remoteDataSource.getById(id);
  }

  @override
  Future<void> add(NotificationMessage item) async {
    final dto = NotificationMessageDto(
      id: item.id,
      title: item.title,
      body: item.body,
      type: item.type,
      createdAt: item.createdAt,
    );
    await _remoteDataSource.add(dto);
  }

  @override
  Future<void> update(NotificationMessage item) async {
    final dto = NotificationMessageDto(
      id: item.id,
      title: item.title,
      body: item.body,
      type: item.type,
      createdAt: item.createdAt,
    );
    await _remoteDataSource.update(dto);
  }

  @override
  Future<void> delete(String id) async {
    await _remoteDataSource.delete(id);
  }
}
