import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/notifications_dto.dart';
import 'notifications_remote_datasource.dart';

class NotificationMessageFirebaseDataSource
    implements NotificationMessageRemoteDataSource {
  final FirebaseFirestore _firestore;
  final String _collection = 'notifications';

  NotificationMessageFirebaseDataSource(this._firestore);

  @override
  Future<List<NotificationMessageDto>> getAll() async {
    final snapshot = await _firestore.collection(_collection).get();
    return snapshot.docs
        .map((doc) => NotificationMessageDto.fromJson(doc.data(), doc.id))
        .toList();
  }

  @override
  Future<NotificationMessageDto?> getById(String id) async {
    final doc = await _firestore.collection(_collection).doc(id).get();
    if (doc.exists && doc.data() != null) {
      return NotificationMessageDto.fromJson(doc.data()!, doc.id);
    }
    return null;
  }

  @override
  Future<void> add(NotificationMessageDto item) async {
    if (item.id.isNotEmpty) {
      await _firestore.collection(_collection).doc(item.id).set(item.toJson());
    } else {
      await _firestore.collection(_collection).add(item.toJson());
    }
  }

  @override
  Future<void> update(NotificationMessageDto item) async {
    await _firestore.collection(_collection).doc(item.id).update(item.toJson());
  }

  @override
  Future<void> delete(String id) async {
    await _firestore.collection(_collection).doc(id).delete();
  }
}
