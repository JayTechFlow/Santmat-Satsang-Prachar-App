import '../../../../core/utils/result.dart';
import '../entities/notification_entity.dart';
import '../entities/notification_filter_entity.dart';
import '../entities/notification_preference_entity.dart';
import '../repositories/notification_repository.dart';

class GetNotificationsUseCase {
  final NotificationRepository repository;
  GetNotificationsUseCase(this.repository);
  Future<Result<List<NotificationEntity>>> call(
    NotificationFilterEntity filter,
  ) => repository.getNotifications(filter);
}

class GetUnreadNotificationsCountUseCase {
  final NotificationRepository repository;
  GetUnreadNotificationsCountUseCase(this.repository);
  Future<Result<int>> call() => repository.getUnreadNotificationsCount();
}

class MarkNotificationAsReadUseCase {
  final NotificationRepository repository;
  MarkNotificationAsReadUseCase(this.repository);
  Future<Result<void>> call(String id) => repository.markNotificationAsRead(id);
}

class MarkAllNotificationsAsReadUseCase {
  final NotificationRepository repository;
  MarkAllNotificationsAsReadUseCase(this.repository);
  Future<Result<void>> call() => repository.markAllNotificationsAsRead();
}

class DeleteNotificationUseCase {
  final NotificationRepository repository;
  DeleteNotificationUseCase(this.repository);
  Future<Result<void>> call(String id) => repository.deleteNotification(id);
}

class ClearNotificationsUseCase {
  final NotificationRepository repository;
  ClearNotificationsUseCase(this.repository);
  Future<Result<void>> call() => repository.clearNotifications();
}

class GetNotificationPreferencesUseCase {
  final NotificationRepository repository;
  GetNotificationPreferencesUseCase(this.repository);
  Future<Result<NotificationPreferenceEntity>> call() =>
      repository.getNotificationPreferences();
}

class UpdateNotificationPreferencesUseCase {
  final NotificationRepository repository;
  UpdateNotificationPreferencesUseCase(this.repository);
  Future<Result<void>> call(NotificationPreferenceEntity preferences) =>
      repository.updateNotificationPreferences(preferences);
}
