import 'package:flutter/material.dart';
import '../../domain/entities/notification_entity.dart';
import '../../../../shared/theme/app_spacing.dart';
import 'package:go_router/go_router.dart';

class NotificationDetailsPage extends StatelessWidget {
  final NotificationEntity notification;

  const NotificationDetailsPage({super.key, required this.notification});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Notification Details')),
      body: SingleChildScrollView(
        padding: AppSpacing.paddingAllMd,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (notification.imagePlaceholder != null) ...[
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(
                  notification.imagePlaceholder!,
                  width: double.infinity,
                  height: 200,
                  fit: BoxFit.cover,
                ),
              ),
              const SizedBox(height: AppSpacing.md),
            ],
            Text(
              notification.title,
              style: Theme.of(
                context,
              ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              '${notification.timestamp.day}/${notification.timestamp.month}/${notification.timestamp.year} ${notification.timestamp.hour}:${notification.timestamp.minute.toString().padLeft(2, '0')}',
              style: Theme.of(
                context,
              ).textTheme.bodyMedium?.copyWith(color: Colors.grey),
            ),
            const SizedBox(height: AppSpacing.md),
            Text(
              notification.body,
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            if (notification.action != null) ...[
              const SizedBox(height: AppSpacing.lg),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    // In a real scenario, use GoRouter to go to the action route.
                    // For now, if the route starts with '/', use GoRouter.
                    if (notification.action!.route.startsWith('/')) {
                      context.push(notification.action!.route);
                    }
                  },
                  child: Text(notification.action!.label),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
