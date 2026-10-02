import 'package:flutter_test/flutter_test.dart';
import '../../../../helpers/mock_notification_data_source.dart';
import 'package:santmat_satsang_prachar/features/notifications/data/repositories/notification_repository_impl.dart';
import 'package:santmat_satsang_prachar/features/notifications/domain/entities/notification_filter_entity.dart';

void main() {
  late MockNotificationDataSource dataSource;
  late NotificationRepositoryImpl repository;

  setUp(() {
    dataSource = MockNotificationDataSource();
    repository = NotificationRepositoryImpl(dataSource);
  });

  test('getNotifications returns Result.success', () async {
    final result = await repository.getNotifications(
      const NotificationFilterEntity(),
    );
    expect(result.isSuccess, true);
    expect(result.data, isNotEmpty);
  });

  test('markNotificationAsRead updates status correctly', () async {
    final notifs = await repository.getNotifications(
      const NotificationFilterEntity(),
    );
    final unread = notifs.data!.firstWhere((n) => !n.isRead);

    final res = await repository.markNotificationAsRead(unread.id);
    expect(res.isSuccess, true);
  });
}
