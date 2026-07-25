import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/notification_entity.dart';
import '../../domain/entities/notification_category_entity.dart';
import '../../domain/entities/notification_action_entity.dart';

class NotificationDto {
  static NotificationEntity fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    final categoryData = data['category'] as Map<String, dynamic>? ?? {};
    final actionData = data['action'] as Map<String, dynamic>?;

    return NotificationEntity(
      id: doc.id,
      title: data['title'] as String? ?? '',
      body: data['body'] as String? ?? '',
      category: NotificationCategoryEntity(
        id: categoryData['id'] as String? ?? '',
        name: categoryData['name'] as String? ?? '',
      ),
      priority: data['priority'] as String? ?? 'normal',
      timestamp: (data['timestamp'] as Timestamp?)?.toDate() ?? DateTime.now(),
      isRead: data['isRead'] as bool? ?? false,
      iconPlaceholder: data['iconPlaceholder'] as String?,
      imagePlaceholder: data['imagePlaceholder'] as String?,
      action: actionData != null
          ? NotificationActionEntity(
              type: actionData['type'] as String? ?? '',
              route: actionData['route'] as String? ?? '',
              label: actionData['label'] as String? ?? '',
            )
          : null,
      deepLinkPlaceholder: data['deepLinkPlaceholder'] as String?,
      dismissible: data['dismissible'] as bool? ?? true,
    );
  }

  static Map<String, dynamic> toFirestore(NotificationEntity entity) {
    return {
      'title': entity.title,
      'body': entity.body,
      'category': {
        'id': entity.category.id,
        'name': entity.category.name,
      },
      'priority': entity.priority,
      'timestamp': Timestamp.fromDate(entity.timestamp),
      'isRead': entity.isRead,
      'iconPlaceholder': entity.iconPlaceholder,
      'imagePlaceholder': entity.imagePlaceholder,
      'action': entity.action != null
          ? {
              'type': entity.action!.type,
              'route': entity.action!.route,
              'label': entity.action!.label,
            }
          : null,
      'deepLinkPlaceholder': entity.deepLinkPlaceholder,
      'dismissible': entity.dismissible,
    };
  }
}
