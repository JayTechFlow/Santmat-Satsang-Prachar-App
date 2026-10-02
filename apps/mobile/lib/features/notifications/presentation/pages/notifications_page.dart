import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../domain/entities/notification_entity.dart';
import '../providers/notifications_providers.dart';
import '../widgets/notification_state_widgets.dart';
import '../widgets/notification_card.dart';
import '../../../../shared/design_system/components/ssp_app_bar.dart';

class NotificationsPage extends ConsumerWidget {
  const NotificationsPage({super.key});

  void _handleNotificationTap(BuildContext context, NotificationEntity notif) {
    final route = notif.action?.route ?? notif.deepLinkPlaceholder ?? '';
    final categoryId = notif.category.id.toLowerCase();
    final categoryName = notif.category.name.toLowerCase();

    if (route.startsWith('/audio') ||
        categoryId == 'bhajan' ||
        categoryId == 'audio' ||
        categoryName == 'bhajan') {
      context.go('/audio');
    } else if (route.startsWith('/satsang') ||
        categoryId == 'stuti' ||
        categoryId == 'stuti_vinati' ||
        categoryName == 'stuti') {
      context.go('/satsang');
    } else if (route.startsWith('/search') || categoryId == 'search') {
      context.push('/search');
    } else if (route == '/' || route.startsWith('/home')) {
      context.go('/');
    } else if (route.isNotEmpty && route.startsWith('/')) {
      try {
        context.push(route, extra: notif);
      } catch (_) {
        context.push('/notifications/details', extra: notif);
      }
    } else {
      context.push('/notifications/details', extra: notif);
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(notificationsProvider);

    // Sort descending by timestamp (latest first)
    final sortedList = List.from(state.notifications)
      ..sort((a, b) => (b.timestamp as DateTime).compareTo(a.timestamp as DateTime));

    final allList = sortedList;
    final updatesList = sortedList.where((n) {
      final name = n.category.name.toLowerCase();
      final id = n.category.id.toLowerCase();
      return name == 'updates' || name == 'अपडेट' || id == 'bhajan' || id == 'stuti' || id == 'suvichar';
    }).toList();
    final specialList = sortedList.where((n) {
      final name = n.category.name.toLowerCase();
      final id = n.category.id.toLowerCase();
      return name == 'विशेष' || name == 'special' || id == 'special' || id == 'event';
    }).toList();

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: SSPAppBar.standard(
          title: 'सूचनाएँ',
          subtitle: 'महत्वपूर्ण सूचनाएं एवं संदेश',
          bottom: const TabBar(
            indicatorColor: Color(0xFFFBBF24),
            labelColor: Color(0xFFFBBF24),
            unselectedLabelColor: Color(0xFFFDE68A),
            tabs: [
              Tab(text: 'सभी'),
              Tab(text: 'अपडेट'),
              Tab(text: 'विशेष'),
            ],
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.settings_outlined, color: Color(0xFFFDE68A)),
              tooltip: 'सेटिंग्स',
              onPressed: () => context.push('/notifications/settings'),
            ),
            PopupMenuButton<String>(
              icon: const Icon(Icons.more_vert_rounded, color: Color(0xFFFDE68A)),
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
                  child: Text('सभी को पढ़ा हुआ चिह्नित करें'),
                ),
                const PopupMenuItem(
                  value: 'clear_all',
                  child: Text('सभी साफ़ करें'),
                ),
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
          final notif = notifications[index] as NotificationEntity;
          return NotificationCard(
            notification: notif,
            onTap: () {
              ref.read(notificationsProvider.notifier).markAsRead(notif.id);
              _handleNotificationTap(context, notif);
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
