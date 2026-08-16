import '../entities/notifications_entity.dart';

abstract class NotificationMessageRepository {
  Future<List<NotificationMessage>> getAll();
  Future<NotificationMessage?> getById(String id);
  Future<void> add(NotificationMessage item);
  Future<void> update(NotificationMessage item);
  Future<void> delete(String id);
}
