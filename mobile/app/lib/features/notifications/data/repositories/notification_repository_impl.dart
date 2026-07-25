import '../../../../core/utils/result.dart';
import '../../domain/entities/notification_entity.dart';
import '../../domain/entities/notification_filter_entity.dart';
import '../../domain/entities/notification_preference_entity.dart';
import '../../domain/repositories/notification_repository.dart';
import '../datasources/mock_notification_data_source.dart';

class NotificationRepositoryImpl implements NotificationRepository {
  final MockNotificationDataSource dataSource;

  NotificationRepositoryImpl(this.dataSource);

  @override
  Future<Result<List<NotificationEntity>>> getNotifications(
    NotificationFilterEntity filter,
  ) async {
    try {
      final res = await dataSource.getNotifications(filter);
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<int>> getUnreadNotificationsCount() async {
    try {
      final res = await dataSource.getUnreadNotificationsCount();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<void>> markNotificationAsRead(String id) async {
    try {
      await dataSource.markNotificationAsRead(id);
      return const Result.success(null);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<void>> markAllNotificationsAsRead() async {
    try {
      await dataSource.markAllNotificationsAsRead();
      return const Result.success(null);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<void>> deleteNotification(String id) async {
    try {
      await dataSource.deleteNotification(id);
      return const Result.success(null);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<void>> clearNotifications() async {
    try {
      await dataSource.clearNotifications();
      return const Result.success(null);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<NotificationPreferenceEntity>>
  getNotificationPreferences() async {
    try {
      final res = await dataSource.getNotificationPreferences();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<void>> updateNotificationPreferences(
    NotificationPreferenceEntity preferences,
  ) async {
    try {
      await dataSource.updateNotificationPreferences(preferences);
      return const Result.success(null);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }
}
