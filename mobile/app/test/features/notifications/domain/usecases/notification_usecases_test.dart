import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/utils/result.dart';
import 'package:santmat_satsang_prachar/features/notifications/domain/entities/notification_entity.dart';
import 'package:santmat_satsang_prachar/features/notifications/domain/entities/notification_filter_entity.dart';
import 'package:santmat_satsang_prachar/features/notifications/domain/entities/notification_preference_entity.dart';
import 'package:santmat_satsang_prachar/features/notifications/domain/repositories/notification_repository.dart';
import 'package:santmat_satsang_prachar/features/notifications/domain/usecases/notification_usecases.dart';

class MockNotificationRepository implements NotificationRepository {
  @override
  Future<Result<List<NotificationEntity>>> getNotifications(
    NotificationFilterEntity filter,
  ) async => const Result.success([]);
  @override
  Future<Result<int>> getUnreadNotificationsCount() async =>
      const Result.success(5);
  @override
  Future<Result<void>> markNotificationAsRead(String id) async =>
      const Result.success(null);
  @override
  Future<Result<void>> markAllNotificationsAsRead() async =>
      const Result.success(null);
  @override
  Future<Result<void>> deleteNotification(String id) async =>
      const Result.success(null);
  @override
  Future<Result<void>> clearNotifications() async => const Result.success(null);
  @override
  Future<Result<NotificationPreferenceEntity>>
  getNotificationPreferences() async => throw UnimplementedError();
  @override
  Future<Result<void>> updateNotificationPreferences(
    NotificationPreferenceEntity preferences,
  ) async => const Result.success(null);
}

void main() {
  late MockNotificationRepository repository;
  late GetNotificationsUseCase getNotificationsUseCase;

  setUp(() {
    repository = MockNotificationRepository();
    getNotificationsUseCase = GetNotificationsUseCase(repository);
  });

  test('GetNotificationsUseCase returns success', () async {
    final result = await getNotificationsUseCase(
      const NotificationFilterEntity(),
    );
    expect(result.isSuccess, true);
    expect(result.data, isEmpty);
  });
}
