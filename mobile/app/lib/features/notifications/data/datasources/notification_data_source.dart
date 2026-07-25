import '../../domain/entities/notification_entity.dart';
import '../../domain/entities/notification_filter_entity.dart';
import '../../domain/entities/notification_preference_entity.dart';

abstract class NotificationDataSource {
  Future<List<NotificationEntity>> getNotifications(NotificationFilterEntity filter);
  Future<int> getUnreadNotificationsCount();
  Future<void> markNotificationAsRead(String id);
  Future<void> markAllNotificationsAsRead();
  Future<void> deleteNotification(String id);
  Future<void> clearNotifications();
  Future<NotificationPreferenceEntity> getNotificationPreferences();
  Future<void> updateNotificationPreferences(NotificationPreferenceEntity preferences);
}
