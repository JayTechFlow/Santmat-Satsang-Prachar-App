import '../models/notifications_dto.dart';

abstract class NotificationMessageRemoteDataSource {
  Future<List<NotificationMessageDto>> getAll();
  Future<NotificationMessageDto?> getById(String id);
  Future<void> add(NotificationMessageDto item);
  Future<void> update(NotificationMessageDto item);
  Future<void> delete(String id);
}
