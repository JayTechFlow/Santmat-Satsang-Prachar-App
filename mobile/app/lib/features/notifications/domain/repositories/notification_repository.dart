import '../../../../core/utils/result.dart';
import '../entities/notification_entity.dart';
import '../entities/notification_filter_entity.dart';
import '../entities/notification_preference_entity.dart';

abstract class NotificationRepository {
  Future<Result<List<NotificationEntity>>> getNotifications(
    NotificationFilterEntity filter,
  );
  Future<Result<int>> getUnreadNotificationsCount();
  Future<Result<void>> markNotificationAsRead(String id);
  Future<Result<void>> markAllNotificationsAsRead();
  Future<Result<void>> deleteNotification(String id);
  Future<Result<void>> clearNotifications();
  Future<Result<NotificationPreferenceEntity>> getNotificationPreferences();
  Future<Result<void>> updateNotificationPreferences(
    NotificationPreferenceEntity preferences,
  );
}
