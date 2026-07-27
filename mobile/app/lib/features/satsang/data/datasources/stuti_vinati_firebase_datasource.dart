import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/stuti_vinati_dto.dart';
import 'stuti_vinati_remote_datasource.dart';

class StutiVinatiFirebaseDataSource implements StutiVinatiRemoteDataSource {
  final FirebaseFirestore _firestore;
  final String _collection = 'stuti_vinati';

  StutiVinatiFirebaseDataSource(this._firestore);

  @override
  Future<List<StutiVinatiDto>> getAll() async {
    final snapshot = await _firestore.collection(_collection).get();
    return snapshot.docs
        .map((doc) => StutiVinatiDto.fromJson(doc.data(), doc.id))
        .toList();
  }

  @override
  Future<StutiVinatiDto?> getById(String id) async {
    final doc = await _firestore.collection(_collection).doc(id).get();
    if (doc.exists && doc.data() != null) {
      return StutiVinatiDto.fromJson(doc.data()!, doc.id);
    }
    return null;
  }

  @override
  Future<void> add(StutiVinatiDto item) async {
    if (item.id.isNotEmpty) {
      await _firestore.collection(_collection).doc(item.id).set(item.toJson());
    } else {
      await _firestore.collection(_collection).add(item.toJson());
    }
  }

  @override
  Future<void> update(StutiVinatiDto item) async {
    await _firestore.collection(_collection).doc(item.id).update(item.toJson());
  }

  @override
  Future<void> delete(String id) async {
    await _firestore.collection(_collection).doc(id).delete();
  }
}
