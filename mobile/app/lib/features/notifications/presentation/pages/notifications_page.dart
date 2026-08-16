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

    // Sort descending by timestamp (latest first)
    final sortedList = List.from(state.notifications)
      ..sort((a, b) => (b.timestamp as DateTime).compareTo(a.timestamp as DateTime));

    final allList = sortedList;
    final updatesList = sortedList.where((n) => n.category.name == 'Updates').toList();
    final specialList = sortedList.where((n) => n.category.name == 'विशेष').toList();

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Notifications'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'सभी'),
              Tab(text: 'Updates'),
              Tab(text: 'विशेष'),
            ],
          ),
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
            : TabBarView(
                children: [
                  _buildList(allList, ref, context),
                  _buildList(updatesList, ref, context),
                  _buildList(specialList, ref, context),
                ],
              ),
      ),
    );
  }

  Widget _buildList(List notifications, WidgetRef ref, BuildContext context) {
    if (notifications.isEmpty) {
      return const NotificationsEmptyWidget();
    }
    return RefreshIndicator(
      onRefresh: () =>
          ref.read(notificationsProvider.notifier).loadNotifications(),
      child: ListView.separated(
        itemCount: notifications.length,
        separatorBuilder: (context, index) => const Divider(height: 1),
        itemBuilder: (context, index) {
          final notif = notifications[index];
          return NotificationCard(
            notification: notif,
            onTap: () {
              ref.read(notificationsProvider.notifier).markAsRead(notif.id);
              context.push('/notifications/details', extra: notif);
            },
            onDismiss: () => ref
                .read(notificationsProvider.notifier)
                .deleteNotification(notif.id),
          );
        },
      ),
    );
  }
}
