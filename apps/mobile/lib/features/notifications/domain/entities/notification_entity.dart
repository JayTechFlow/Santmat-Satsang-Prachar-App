import 'notification_category_entity.dart';
import 'notification_action_entity.dart';

class NotificationEntity {
  final String id;
  final String title;
  final String body;
  final NotificationCategoryEntity category;
  final String priority;
  final DateTime timestamp;
  final bool isRead;
  final String? iconPlaceholder;
  final String? imagePlaceholder;
  final NotificationActionEntity? action;
  final String? deepLinkPlaceholder;
  final bool dismissible;

  const NotificationEntity({
    required this.id,
    required this.title,
    required this.body,
    required this.category,
    required this.priority,
    required this.timestamp,
    required this.isRead,
    this.iconPlaceholder,
    this.imagePlaceholder,
    this.action,
    this.deepLinkPlaceholder,
    required this.dismissible,
  });

  NotificationEntity copyWith({bool? isRead}) {
    return NotificationEntity(
      id: id,
      title: title,
      body: body,
      category: category,
      priority: priority,
      timestamp: timestamp,
      isRead: isRead ?? this.isRead,
      iconPlaceholder: iconPlaceholder,
      imagePlaceholder: imagePlaceholder,
      action: action,
      deepLinkPlaceholder: deepLinkPlaceholder,
      dismissible: dismissible,
    );
  }
}
