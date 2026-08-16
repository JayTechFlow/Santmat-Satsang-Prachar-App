import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/analytics_dto.dart';
import 'analytics_remote_datasource.dart';

class AnalyticsEventFirebaseDataSource
    implements AnalyticsEventRemoteDataSource {
  final FirebaseFirestore _firestore;
  final String _collection = 'analytics';

  AnalyticsEventFirebaseDataSource(this._firestore);

  @override
  Future<List<AnalyticsEventDto>> getAll() async {
    final snapshot = await _firestore.collection(_collection).get();
    return snapshot.docs
        .map((doc) => AnalyticsEventDto.fromJson(doc.data(), doc.id))
        .toList();
  }

  @override
  Future<AnalyticsEventDto?> getById(String id) async {
    final doc = await _firestore.collection(_collection).doc(id).get();
    if (doc.exists && doc.data() != null) {
      return AnalyticsEventDto.fromJson(doc.data()!, doc.id);
    }
    return null;
  }

  @override
  Future<void> add(AnalyticsEventDto item) async {
    if (item.id.isNotEmpty) {
      await _firestore.collection(_collection).doc(item.id).set(item.toJson());
    } else {
      await _firestore.collection(_collection).add(item.toJson());
    }
  }

  @override
  Future<void> update(AnalyticsEventDto item) async {
    await _firestore.collection(_collection).doc(item.id).update(item.toJson());
  }

  @override
  Future<void> delete(String id) async {
    await _firestore.collection(_collection).doc(id).delete();
  }
}
