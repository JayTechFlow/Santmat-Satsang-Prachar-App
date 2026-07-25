import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:santmat_satsang_prachar/features/notifications/presentation/providers/notifications_providers.dart';
import 'package:santmat_satsang_prachar/features/notifications/data/datasources/mock_notification_data_source.dart';

void main() {
  test('NotificationsNotifier loads data correctly', () async {
    final container = ProviderContainer(
      overrides: [
        mockNotificationDataSourceProvider.overrideWithValue(
          MockNotificationDataSource(),
        ),
      ],
    );
    addTearDown(container.dispose);

    var state = container.read(notificationsProvider);
    expect(state.isLoading, true);

    await container.read(notificationsProvider.notifier).loadNotifications();
    state = container.read(notificationsProvider);

    expect(state.isLoading, false);
    expect(state.error, isNull);
    expect(state.notifications, isNotEmpty);
  });
}
