import 'package:firebase_auth/firebase_auth.dart';
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
  final FirebaseAuth _firebaseAuth;

  FirestoreNotificationDataSource(
    this._firestoreService, {
    FirebaseAuth? firebaseAuth,
  }) : _firebaseAuth = firebaseAuth ?? FirebaseAuth.instance;

  String get _userId => _firebaseAuth.currentUser?.uid ?? '';

  /// Per-user notification state lives in an owner-scoped subcollection:
  /// users/{uid}/notification_state/{notificationId}
  /// The shared /notifications collection is admin-managed broadcast content,
  /// so read/deleted flags must never be mutated there by mobile users
  /// (enforced by firestore.rules; ownership enforced by users/{uid} rules).
  String get _statePath => 'users/$_userId/notification_state';

  Future<Map<String, Map<String, dynamic>>> _loadState() async {
    if (_userId.isEmpty) return {};
    final snap = await FirebaseFirestore.instance.collection(_statePath).get();
    return {
      for (final doc in snap.docs) doc.id: doc.data(),
    };
  }

  @override
  Future<List<NotificationEntity>> getNotifications(
    NotificationFilterEntity filter,
  ) async {
    // Basic implementation that fetches all and filters locally for simplicity,
    // or we can use queries. For now, matching mock logic.
    final snapshot = await _firestoreService.getCollection(
      FirestoreCollections.notifications,
    );
    final state = await _loadState();
    var results = snapshot.docs
        .where((doc) => !(state[doc.id]?['isDeleted'] == true))
        .map((doc) {
          final entity = NotificationDto.fromFirestore(doc);
          final docState = state[doc.id];
          if (docState == null) return entity;
          return entity.copyWith(
            isRead: (docState['isRead'] as bool?) ?? entity.isRead,
          );
        })
        .toList();

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
    final snapshot = await _firestoreService.getCollection(
      FirestoreCollections.notifications,
    );
    final state = await _loadState();
    return snapshot.docs
        .where((doc) => !(state[doc.id]?['isDeleted'] == true))
        .map((doc) {
          final entity = NotificationDto.fromFirestore(doc);
          final docState = state[doc.id];
          if (docState == null) return entity;
          return entity.copyWith(
            isRead: (docState['isRead'] as bool?) ?? entity.isRead,
          );
        })
        .where((n) => !n.isRead)
        .length;
  }

  @override
  Future<void> markNotificationAsRead(String id) async {
    if (_userId.isEmpty) return;
    await _firestoreService.setDocument(
      _statePath,
      id,
      {'isRead': true},
      merge: true,
    );
  }

  @override
  Future<void> markAllNotificationsAsRead() async {
    if (_userId.isEmpty) return;
    final snapshot = await _firestoreService.getCollection(
      FirestoreCollections.notifications,
    );
    final batch = FirebaseFirestore.instance.batch();
    for (var doc in snapshot.docs) {
      batch.set(
        FirebaseFirestore.instance.collection(_statePath).doc(doc.id),
        {'isRead': true},
        SetOptions(merge: true),
      );
    }
    await batch.commit();
  }

  @override
  Future<void> deleteNotification(String id) async {
    if (_userId.isEmpty) return;
    // Soft-delete: broadcast notifications are shared content owned by admins,
    // so a user only hides them for themself.
    await _firestoreService.setDocument(
      _statePath,
      id,
      {'isDeleted': true},
      merge: true,
    );
  }

  @override
  Future<void> clearNotifications() async {
    if (_userId.isEmpty) return;
    final snapshot = await _firestoreService.getCollection(
      FirestoreCollections.notifications,
    );
    final batch = FirebaseFirestore.instance.batch();
    for (var doc in snapshot.docs) {
      batch.set(
        FirebaseFirestore.instance.collection(_statePath).doc(doc.id),
        {'isDeleted': true},
        SetOptions(merge: true),
      );
    }
    await batch.commit();
  }

  @override
  Future<NotificationPreferenceEntity> getNotificationPreferences() async {
    if (_userId.isEmpty) {
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
    try {
      final doc = await _firestoreService.getDocument(
        FirestoreCollections.preferences,
        _userId,
      );
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
      final notifData = data['notification'] as Map<String, dynamic>? ?? data;
      return NotificationPreferenceEntity(
        generalNotifications: notifData['generalNotifications'] as bool? ?? true,
        satsangNotifications: notifData['satsangNotifications'] as bool? ?? true,
        audioNotifications: notifData['audioNotifications'] as bool? ?? true,
        booksNotifications: notifData['booksNotifications'] as bool? ?? true,
        dailyQuotes: notifData['dailyQuotes'] as bool? ?? true,
        events: notifData['events'] as bool? ?? true,
        donationUpdates: notifData['donationUpdates'] as bool? ?? false,
        announcements: notifData['announcements'] as bool? ?? true,
        sound: notifData['sound'] as bool? ?? true,
        vibration: notifData['vibration'] as bool? ?? true,
        quietHoursEnabled: notifData['quietHoursEnabled'] as bool? ?? false,
        quietHoursStart: notifData['quietHoursStart'] as String? ?? '22:00',
        quietHoursEnd: notifData['quietHoursEnd'] as String? ?? '06:00',
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
  Future<void> updateNotificationPreferences(
    NotificationPreferenceEntity preferences,
  ) async {
    if (_userId.isEmpty) return;
    final data = {
      'notification': {
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
      }
    };

    await _firestoreService.setDocument(
      FirestoreCollections.preferences,
      _userId,
      data,
      merge: true,
    );
  }
}
