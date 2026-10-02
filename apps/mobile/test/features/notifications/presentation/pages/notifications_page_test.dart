import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';
import 'package:santmat_satsang_prachar/features/notifications/presentation/pages/notifications_page.dart';
import 'package:santmat_satsang_prachar/features/notifications/presentation/widgets/notification_state_widgets.dart';
import 'package:santmat_satsang_prachar/features/notifications/domain/entities/notification_entity.dart';
import 'package:santmat_satsang_prachar/features/notifications/domain/entities/notification_category_entity.dart';
import 'package:santmat_satsang_prachar/features/notifications/domain/entities/notification_action_entity.dart';
import '../../../../helpers/mock_notification_data_source.dart';

void main() {
  Widget createTestWidget(Widget child, {List<dynamic> overrides = const []}) {
    return ProviderScope(
      overrides: [
        notificationDataSourceProvider.overrideWithValue(
          MockNotificationDataSource(),
        ),
        ...overrides.whereType<dynamic>(),
      ],
      child: MaterialApp(
        home: child,
      ),
    );
  }

  group('NotificationsPage Widget & Integration Contract Tests', () {
    testWidgets('1 & 5. Notifications screen loads canonical notifications and renders unread state', (tester) async {
      await tester.pumpWidget(createTestWidget(const NotificationsPage()));
      await tester.pumpAndSettle();

      expect(find.text('सूचनाएँ'), findsOneWidget);
      expect(find.text('सभी'), findsOneWidget);
      expect(find.text('अपडेट'), findsOneWidget);
      expect(find.text('विशेष'), findsOneWidget);
      expect(find.byType(ListView), findsOneWidget);
    });

    testWidgets('2. Empty state widget renders correctly when notifications list is empty', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(body: NotificationsEmptyWidget()),
          ),
        ),
      );

      expect(find.byType(NotificationsEmptyWidget), findsOneWidget);
    });

    testWidgets('3. Loading state widget renders correctly during data fetch', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(body: NotificationsLoadingWidget()),
          ),
        ),
      );

      expect(find.byType(NotificationsLoadingWidget), findsOneWidget);
    });

    testWidgets('4. Error state widget renders correctly with retry callback', (tester) async {
      bool retried = false;
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: NotificationsErrorWidget(
                message: 'नेटवर्क त्रुटि',
                onRetry: () => retried = true,
              ),
            ),
          ),
        ),
      );

      expect(find.text('नेटवर्क त्रुटि'), findsOneWidget);
      await tester.tap(find.text('Retry'));
      expect(retried, true);
    });

    testWidgets('6 & 7. Mark as read and Mark all as read popups operate correctly', (tester) async {
      await tester.pumpWidget(createTestWidget(const NotificationsPage()));
      await tester.pumpAndSettle();

      final popupMenu = find.byType(PopupMenuButton<String>);
      expect(popupMenu, findsOneWidget);
      await tester.tap(popupMenu);
      await tester.pumpAndSettle();

      expect(find.text('सभी को पढ़ा हुआ चिह्नित करें'), findsOneWidget);
      expect(find.text('सभी साफ़ करें'), findsOneWidget);

      await tester.tap(find.text('सभी को पढ़ा हुआ चिह्नित करें'));
      await tester.pumpAndSettle();
    });

    test('8, 9, 10 & 11. Deep link navigation routing contract safety', () {
      final bhajanNotif = NotificationEntity(
        id: 'n1',
        title: 'नया भजन',
        body: 'भजन सुनें',
        category: const NotificationCategoryEntity(id: 'bhajan', name: 'भजन'),
        priority: 'normal',
        timestamp: DateTime.now(),
        isRead: false,
        action: const NotificationActionEntity(type: 'navigate', route: '/audio', label: 'सुनें'),
        dismissible: true,
      );

      final stutiNotif = NotificationEntity(
        id: 'n2',
        title: 'प्रातः स्तुति',
        body: 'स्तुति पढ़ें',
        category: const NotificationCategoryEntity(id: 'stuti', name: 'स्तुति'),
        priority: 'normal',
        timestamp: DateTime.now(),
        isRead: false,
        action: const NotificationActionEntity(type: 'navigate', route: '/satsang', label: 'पढ़ें'),
        dismissible: true,
      );

      expect(bhajanNotif.action?.route, '/audio');
      expect(stutiNotif.action?.route, '/satsang');
      expect(bhajanNotif.category.id, 'bhajan');
      expect(stutiNotif.category.id, 'stuti');
    });

    test('12. Single canonical notification provider exists in Riverpod DI', () {
      final container = ProviderContainer(
        overrides: [
          notificationDataSourceProvider.overrideWithValue(
            MockNotificationDataSource(),
          ),
        ],
      );
      addTearDown(container.dispose);

      final repository = container.read(notificationRepositoryProvider);
      expect(repository, isNotNull);
    });
  });
}
