import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/home_banners_dto.dart';
import 'home_banners_remote_datasource.dart';

class HomeBannerFirebaseDataSource implements HomeBannerRemoteDataSource {
  final FirebaseFirestore _firestore;
  final String _collection = 'home_banners';

  HomeBannerFirebaseDataSource(this._firestore);

  @override
  Future<List<HomeBannerDto>> getAll() async {
    final snapshot = await _firestore.collection(_collection).get();
    return snapshot.docs
        .map((doc) => HomeBannerDto.fromJson(doc.data(), doc.id))
        .toList();
  }

  @override
  Future<HomeBannerDto?> getById(String id) async {
    final doc = await _firestore.collection(_collection).doc(id).get();
    if (doc.exists && doc.data() != null) {
      return HomeBannerDto.fromJson(doc.data()!, doc.id);
    }
    return null;
  }

  @override
  Future<void> add(HomeBannerDto item) async {
    if (item.id.isNotEmpty) {
      await _firestore.collection(_collection).doc(item.id).set(item.toJson());
    } else {
      await _firestore.collection(_collection).add(item.toJson());
    }
  }

  @override
  Future<void> update(HomeBannerDto item) async {
    await _firestore.collection(_collection).doc(item.id).update(item.toJson());
  }

  @override
  Future<void> delete(String id) async {
    await _firestore.collection(_collection).doc(id).delete();
  }
}
