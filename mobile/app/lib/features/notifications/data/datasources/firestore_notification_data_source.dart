import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../core/firebase/firestore_collections.dart';
import '../../../../core/services/firestore_service.dart';
import '../../domain/entities/notification_entity.dart';
import '../../domain/entities/notification_filter_entity.dart';
import '../../domain/entities/notification_preference_entity.dart';
import '../models/notification_dto.dart';
import 'notification_data_source.dart';

class FirestoreNotificationDataSource implements NotificationDataSource {
  final FirestoreService _firestoreService;

  FirestoreNotificationDataSource(this._firestoreService);

  @override
  Future<List<NotificationEntity>> getNotifications(NotificationFilterEntity filter) async {
    // Basic implementation that fetches all and filters locally for simplicity,
    // or we can use queries. For now, matching mock logic.
    final snapshot = await _firestoreService.getCollection(FirestoreCollections.notifications);
    var results = snapshot.docs.map((doc) => NotificationDto.fromFirestore(doc)).toList();

    if (filter.isRead != null) {
      results = results.where((n) => n.isRead == filter.isRead).toList();
    }
    if (filter.categoryId != null) {
      results = results.where((n) => n.category.id == filter.categoryId).toList();
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
    final snapshot = await _firestoreService.getCollection(FirestoreCollections.notifications);
    return snapshot.docs
        .map((doc) => NotificationDto.fromFirestore(doc))
        .where((n) => !n.isRead)
        .length;
  }

  @override
  Future<void> markNotificationAsRead(String id) async {
    await _firestoreService.updateDocument(FirestoreCollections.notifications, id, {'isRead': true});
  }

  @override
  Future<void> markAllNotificationsAsRead() async {
    final snapshot = await _firestoreService.getCollection(FirestoreCollections.notifications);
    final batch = FirebaseFirestore.instance.batch();
    for (var doc in snapshot.docs) {
      batch.update(doc.reference, {'isRead': true});
    }
    await batch.commit();
  }

  @override
  Future<void> deleteNotification(String id) async {
    await _firestoreService.deleteDocument(FirestoreCollections.notifications, id);
  }

  @override
  Future<void> clearNotifications() async {
    final snapshot = await _firestoreService.getCollection(FirestoreCollections.notifications);
    final batch = FirebaseFirestore.instance.batch();
    for (var doc in snapshot.docs) {
      batch.delete(doc.reference);
    }
    await batch.commit();
  }

  @override
  Future<NotificationPreferenceEntity> getNotificationPreferences() async {
    try {
      final doc = await _firestoreService.getDocument(FirestoreCollections.preferences, 'notifications');
      if (!doc.exists) {
        return const NotificationPreferenceEntity(
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
      final data = doc.data() as Map<String, dynamic>;
      return NotificationPreferenceEntity(
        generalNotifications: data['generalNotifications'] as bool? ?? true,
        satsangNotifications: data['satsangNotifications'] as bool? ?? true,
        audioNotifications: data['audioNotifications'] as bool? ?? true,
        booksNotifications: data['booksNotifications'] as bool? ?? true,
        dailyQuotes: data['dailyQuotes'] as bool? ?? true,
        events: data['events'] as bool? ?? true,
        donationUpdates: data['donationUpdates'] as bool? ?? false,
        announcements: data['announcements'] as bool? ?? true,
        sound: data['sound'] as bool? ?? true,
        vibration: data['vibration'] as bool? ?? true,
        quietHoursEnabled: data['quietHoursEnabled'] as bool? ?? false,
        quietHoursStart: data['quietHoursStart'] as String? ?? '22:00',
        quietHoursEnd: data['quietHoursEnd'] as String? ?? '06:00',
      );
    } catch (e) {
      return const NotificationPreferenceEntity(
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
  }

  @override
  Future<void> updateNotificationPreferences(NotificationPreferenceEntity preferences) async {
    final data = {
      'generalNotifications': preferences.generalNotifications,
      'satsangNotifications': preferences.satsangNotifications,
      'audioNotifications': preferences.audioNotifications,
      'booksNotifications': preferences.booksNotifications,
      'dailyQuotes': preferences.dailyQuotes,
      'events': preferences.events,
      'donationUpdates': preferences.donationUpdates,
      'announcements': preferences.announcements,
      'sound': preferences.sound,
      'vibration': preferences.vibration,
      'quietHoursEnabled': preferences.quietHoursEnabled,
      'quietHoursStart': preferences.quietHoursStart,
      'quietHoursEnd': preferences.quietHoursEnd,
    };
    
    // Check if it exists first
    try {
      final doc = await _firestoreService.getDocument(FirestoreCollections.preferences, 'notifications');
      if (doc.exists) {
        await _firestoreService.updateDocument(FirestoreCollections.preferences, 'notifications', data);
      } else {
        await FirebaseFirestore.instance.collection(FirestoreCollections.preferences).doc('notifications').set(data);
      }
    } catch (_) {
      await FirebaseFirestore.instance.collection(FirestoreCollections.preferences).doc('notifications').set(data);
    }
  }
}
