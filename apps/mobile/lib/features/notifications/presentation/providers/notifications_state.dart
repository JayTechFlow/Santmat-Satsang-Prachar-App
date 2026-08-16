import '../../domain/entities/notification_entity.dart';
import '../../domain/entities/notification_filter_entity.dart';

class NotificationsState {
  final bool isLoading;
  final String? error;
  final List<NotificationEntity> notifications;
  final NotificationFilterEntity filter;

  const NotificationsState({
    this.isLoading = false,
    this.error,
    this.notifications = const [],
    this.filter = const NotificationFilterEntity(),
  });

  NotificationsState copyWith({
    bool? isLoading,
    String? error,
    List<NotificationEntity>? notifications,
    NotificationFilterEntity? filter,
  }) {
    return NotificationsState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      notifications: notifications ?? this.notifications,
      filter: filter ?? this.filter,
    );
  }
}
