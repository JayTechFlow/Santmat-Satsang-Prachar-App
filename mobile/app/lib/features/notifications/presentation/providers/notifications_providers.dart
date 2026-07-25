import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/datasources/mock_notification_data_source.dart';
import '../../data/repositories/notification_repository_impl.dart';
import '../../domain/repositories/notification_repository.dart';
import '../../domain/usecases/notification_usecases.dart';
import '../../domain/entities/notification_preference_entity.dart';
import '../../domain/entities/notification_filter_entity.dart';
import 'notifications_state.dart';

import '../../data/datasources/firestore_notification_data_source.dart';
import '../../data/datasources/notification_data_source.dart';
import '../../../../core/di/service_locator_registrations.dart';

final notificationDataSourceProvider = Provider<NotificationDataSource>((ref) {
  final env = ref.watch(environmentConfigurationProvider);
  if (env.isDev) {
    return MockNotificationDataSource();
  }
  return FirestoreNotificationDataSource(ref.watch(firestoreServiceProvider));
});

final notificationRepositoryProvider = Provider<NotificationRepository>((ref) {
  return NotificationRepositoryImpl(
    ref.watch(notificationDataSourceProvider),
  );
});

final getNotificationsUseCaseProvider = Provider(
  (ref) => GetNotificationsUseCase(ref.watch(notificationRepositoryProvider)),
);
final getUnreadNotificationsCountUseCaseProvider = Provider(
  (ref) => GetUnreadNotificationsCountUseCase(
    ref.watch(notificationRepositoryProvider),
  ),
);
final markNotificationAsReadUseCaseProvider = Provider(
  (ref) =>
      MarkNotificationAsReadUseCase(ref.watch(notificationRepositoryProvider)),
);
final markAllNotificationsAsReadUseCaseProvider = Provider(
  (ref) => MarkAllNotificationsAsReadUseCase(
    ref.watch(notificationRepositoryProvider),
  ),
);
final deleteNotificationUseCaseProvider = Provider(
  (ref) => DeleteNotificationUseCase(ref.watch(notificationRepositoryProvider)),
);
final clearNotificationsUseCaseProvider = Provider(
  (ref) => ClearNotificationsUseCase(ref.watch(notificationRepositoryProvider)),
);
final getNotificationPreferencesUseCaseProvider = Provider(
  (ref) => GetNotificationPreferencesUseCase(
    ref.watch(notificationRepositoryProvider),
  ),
);
final updateNotificationPreferencesUseCaseProvider = Provider(
  (ref) => UpdateNotificationPreferencesUseCase(
    ref.watch(notificationRepositoryProvider),
  ),
);

class NotificationsNotifier extends Notifier<NotificationsState> {
  bool _mounted = true;

  @override
  NotificationsState build() {
    ref.onDispose(() => _mounted = false);
    Future.microtask(() {
      if (_mounted) loadNotifications();
    });
    return const NotificationsState(isLoading: true);
  }

  Future<void> loadNotifications() async {
    if (!_mounted) return;
    state = state.copyWith(isLoading: true, error: null);

    try {
      final getNotifications = ref.read(getNotificationsUseCaseProvider);
      final res = await getNotifications(state.filter);

      if (!_mounted) return;

      if (res.isError) {
        throw Exception(res.error);
      }

      state = state.copyWith(isLoading: false, notifications: res.data);

      // refresh unread count
      ref.invalidate(unreadNotificationsCountProvider);
    } catch (e) {
      if (_mounted) {
        state = state.copyWith(isLoading: false, error: e.toString());
      }
    }
  }

  void updateFilter(NotificationFilterEntity newFilter) {
    state = state.copyWith(filter: newFilter);
    loadNotifications();
  }

  Future<void> markAsRead(String id) async {
    final markRead = ref.read(markNotificationAsReadUseCaseProvider);
    final res = await markRead(id);
    if (res.isSuccess) {
      await loadNotifications();
    }
  }

  Future<void> markAllAsRead() async {
    final markAll = ref.read(markAllNotificationsAsReadUseCaseProvider);
    final res = await markAll();
    if (res.isSuccess) {
      await loadNotifications();
    }
  }

  Future<void> deleteNotification(String id) async {
    final del = ref.read(deleteNotificationUseCaseProvider);
    final res = await del(id);
    if (res.isSuccess) {
      await loadNotifications();
    }
  }

  Future<void> clearAll() async {
    final clear = ref.read(clearNotificationsUseCaseProvider);
    final res = await clear();
    if (res.isSuccess) {
      await loadNotifications();
    }
  }
}

final notificationsProvider =
    NotifierProvider<NotificationsNotifier, NotificationsState>(
      NotificationsNotifier.new,
    );

final unreadNotificationsCountProvider = FutureProvider<int>((ref) async {
  final getCount = ref.read(getUnreadNotificationsCountUseCaseProvider);
  final res = await getCount();
  if (res.isError) throw Exception(res.error);
  return res.data!;
});

final notificationPreferencesProvider =
    FutureProvider<NotificationPreferenceEntity>((ref) async {
      final getPrefs = ref.read(getNotificationPreferencesUseCaseProvider);
      final res = await getPrefs();
      if (res.isError) throw Exception(res.error);
      return res.data!;
    });
