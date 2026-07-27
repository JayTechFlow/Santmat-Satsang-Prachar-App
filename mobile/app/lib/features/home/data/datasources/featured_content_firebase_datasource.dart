import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/featured_content_dto.dart';
import 'featured_content_remote_datasource.dart';

class FeaturedContentFirebaseDataSource
    implements FeaturedContentRemoteDataSource {
  final FirebaseFirestore _firestore;
  final String _collection = 'featured_content';

  FeaturedContentFirebaseDataSource(this._firestore);

  @override
  Future<List<FeaturedContentDto>> getAll() async {
    final snapshot = await _firestore.collection(_collection).get();
    return snapshot.docs
        .map((doc) => FeaturedContentDto.fromJson(doc.data(), doc.id))
        .toList();
  }

  @override
  Future<FeaturedContentDto?> getById(String id) async {
    final doc = await _firestore.collection(_collection).doc(id).get();
    if (doc.exists && doc.data() != null) {
      return FeaturedContentDto.fromJson(doc.data()!, doc.id);
    }
    return null;
  }

  @override
  Future<void> add(FeaturedContentDto item) async {
    if (item.id.isNotEmpty) {
      await _firestore.collection(_collection).doc(item.id).set(item.toJson());
    } else {
      await _firestore.collection(_collection).add(item.toJson());
    }
  }

  @override
  Future<void> update(FeaturedContentDto item) async {
    await _firestore.collection(_collection).doc(item.id).update(item.toJson());
  }

  @override
  Future<void> delete(String id) async {
    await _firestore.collection(_collection).doc(id).delete();
  }
}
