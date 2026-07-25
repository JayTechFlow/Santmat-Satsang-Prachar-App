import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/notifications_providers.dart';
import '../widgets/notification_state_widgets.dart';
import '../widgets/notification_card.dart';

class NotificationsPage extends ConsumerWidget {
  const NotificationsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(notificationsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () => context.push('/notifications/settings'),
          ),
          PopupMenuButton<String>(
            onSelected: (value) {
              if (value == 'mark_all_read') {
                ref.read(notificationsProvider.notifier).markAllAsRead();
              } else if (value == 'clear_all') {
                ref.read(notificationsProvider.notifier).clearAll();
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'mark_all_read',
                child: Text('Mark all as read'),
              ),
              const PopupMenuItem(value: 'clear_all', child: Text('Clear all')),
            ],
          ),
        ],
      ),
      body: state.isLoading
          ? const NotificationsLoadingWidget()
          : state.error != null
          ? NotificationsErrorWidget(
              message: state.error!,
              onRetry: () =>
                  ref.read(notificationsProvider.notifier).loadNotifications(),
            )
          : state.notifications.isEmpty
          ? const NotificationsEmptyWidget()
          : RefreshIndicator(
              onRefresh: () =>
                  ref.read(notificationsProvider.notifier).loadNotifications(),
              child: ListView.separated(
                itemCount: state.notifications.length,
                separatorBuilder: (context, index) => const Divider(height: 1),
                itemBuilder: (context, index) {
                  final notif = state.notifications[index];
                  return NotificationCard(
                    notification: notif,
                    onTap: () {
                      ref
                          .read(notificationsProvider.notifier)
                          .markAsRead(notif.id);
                      context.push('/notifications/details', extra: notif);
                    },
                    onDismiss: () => ref
                        .read(notificationsProvider.notifier)
                        .deleteNotification(notif.id),
                  );
                },
              ),
            ),
    );
  }
}
