import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/daily_suvichar_dto.dart';
import 'daily_suvichar_remote_datasource.dart';

class DailySuvicharFirebaseDataSource implements DailySuvicharRemoteDataSource {
  final FirebaseFirestore _firestore;
  final String _collection = 'daily_suvichar';

  DailySuvicharFirebaseDataSource(this._firestore);

  @override
  Future<List<DailySuvicharDto>> getAll() async {
    final snapshot = await _firestore.collection(_collection).get();
    return snapshot.docs
        .map((doc) => DailySuvicharDto.fromJson(doc.data(), doc.id))
        .toList();
  }

  @override
  Future<DailySuvicharDto?> getById(String id) async {
    final doc = await _firestore.collection(_collection).doc(id).get();
    if (doc.exists && doc.data() != null) {
      return DailySuvicharDto.fromJson(doc.data()!, doc.id);
    }
    return null;
  }

  @override
  Future<void> add(DailySuvicharDto item) async {
    if (item.id.isNotEmpty) {
      await _firestore.collection(_collection).doc(item.id).set(item.toJson());
    } else {
      await _firestore.collection(_collection).add(item.toJson());
    }
  }

  @override
  Future<void> update(DailySuvicharDto item) async {
    await _firestore.collection(_collection).doc(item.id).update(item.toJson());
  }

  @override
  Future<void> delete(String id) async {
    await _firestore.collection(_collection).doc(id).delete();
  }
}
