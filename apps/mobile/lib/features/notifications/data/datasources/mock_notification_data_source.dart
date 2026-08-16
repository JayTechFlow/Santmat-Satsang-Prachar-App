import '../../domain/entities/notification_entity.dart';
import '../../domain/entities/notification_category_entity.dart';
import '../../domain/entities/notification_action_entity.dart';
import '../../domain/entities/notification_filter_entity.dart';
import '../../domain/entities/notification_preference_entity.dart';
import 'notification_data_source.dart';

class MockNotificationDataSource implements NotificationDataSource {
  final List<NotificationCategoryEntity> _categories = [
    const NotificationCategoryEntity(id: 'c1', name: 'Satsang'),
    const NotificationCategoryEntity(id: 'c2', name: 'System'),
    const NotificationCategoryEntity(id: 'c3', name: 'Event'),
  ];

  late List<NotificationEntity> _notifications;
  late NotificationPreferenceEntity _preferences;

  MockNotificationDataSource() {
    _notifications = List.generate(20, (index) {
      final isRead = index > 5;
      return NotificationEntity(
        id: 'notif_$index',
        title: 'Notification Title $index',
        body:
            'This is the detailed body of notification $index. It contains important updates.',
        category: _categories[index % _categories.length],
        priority: index % 4 == 0 ? 'high' : 'normal',
        timestamp: DateTime.now().subtract(Duration(hours: index * 2)),
        isRead: isRead,
        iconPlaceholder: 'icon_placeholder',
        imagePlaceholder: index % 3 == 0
            ? 'https://picsum.photos/seed/notif_$index/400/200'
            : null,
        action: index % 2 == 0
            ? NotificationActionEntity(
                type: 'navigate',
                route: '/events',
                label: 'View Events',
              )
            : null,
        deepLinkPlaceholder: null,
        dismissible: true,
      );
    });

    _preferences = const NotificationPreferenceEntity(
      generalNotifications: true,
      satsangNotifications: true,
      audioNotifications: true,
      booksNotifications: true,
      dailyQuotes: true,
      events: true,
      donationUpdates: false,
      announcements: true,
      sound: true,
      vibration: true,
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '06:00',
    );
  }

  @override
  Future<List<NotificationEntity>> getNotifications(
    NotificationFilterEntity filter,
  ) async {
    await Future.delayed(const Duration(milliseconds: 300));
    var results = _notifications;

    if (filter.isRead != null) {
      results = results.where((n) => n.isRead == filter.isRead).toList();
    }
    if (filter.categoryId != null) {
      results = results
          .where((n) => n.category.id == filter.categoryId)
          .toList();
    }
    if (filter.priority != null) {
      results = results.where((n) => n.priority == filter.priority).toList();
    }

    if (filter.newestFirst ?? true) {
      results.sort((a, b) => b.timestamp.compareTo(a.timestamp));
    } else {
      results.sort((a, b) => a.timestamp.compareTo(b.timestamp));
    }

    return results;
  }

  @override
  Future<int> getUnreadNotificationsCount() async {
    await Future.delayed(const Duration(milliseconds: 100));
    return _notifications.where((n) => !n.isRead).length;
  }

  @override
  Future<void> markNotificationAsRead(String id) async {
    await Future.delayed(const Duration(milliseconds: 200));
    final index = _notifications.indexWhere((n) => n.id == id);
    if (index != -1) {
      _notifications[index] = _notifications[index].copyWith(isRead: true);
    }
  }

  @override
  Future<void> markAllNotificationsAsRead() async {
    await Future.delayed(const Duration(milliseconds: 400));
    _notifications = _notifications
        .map((n) => n.copyWith(isRead: true))
        .toList();
  }

  @override
  Future<void> deleteNotification(String id) async {
    await Future.delayed(const Duration(milliseconds: 200));
    _notifications.removeWhere((n) => n.id == id);
  }

  @override
  Future<void> clearNotifications() async {
    await Future.delayed(const Duration(milliseconds: 400));
    _notifications.clear();
  }

  @override
  Future<NotificationPreferenceEntity> getNotificationPreferences() async {
    await Future.delayed(const Duration(milliseconds: 200));
    return _preferences;
  }

  @override
  Future<void> updateNotificationPreferences(
    NotificationPreferenceEntity preferences,
  ) async {
    await Future.delayed(const Duration(milliseconds: 300));
    _preferences = preferences;
  }
}
