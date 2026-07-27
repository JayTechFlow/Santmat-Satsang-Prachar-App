import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/users_dto.dart';
import 'users_remote_datasource.dart';

class UserEntityFirebaseDataSource implements UserEntityRemoteDataSource {
  final FirebaseFirestore _firestore;
  final String _collection = 'users';

  UserEntityFirebaseDataSource(this._firestore);

  @override
  Future<List<UserEntityDto>> getAll() async {
    final snapshot = await _firestore.collection(_collection).get();
    return snapshot.docs
        .map((doc) => UserEntityDto.fromJson(doc.data(), doc.id))
        .toList();
  }

  @override
  Future<UserEntityDto?> getById(String id) async {
    final doc = await _firestore.collection(_collection).doc(id).get();
    if (doc.exists && doc.data() != null) {
      return UserEntityDto.fromJson(doc.data()!, doc.id);
    }
    return null;
  }

  @override
  Future<void> add(UserEntityDto item) async {
    if (item.id.isNotEmpty) {
      await _firestore.collection(_collection).doc(item.id).set(item.toJson());
    } else {
      await _firestore.collection(_collection).add(item.toJson());
    }
  }

  @override
  Future<void> update(UserEntityDto item) async {
    await _firestore.collection(_collection).doc(item.id).update(item.toJson());
  }

  @override
  Future<void> delete(String id) async {
    await _firestore.collection(_collection).doc(id).delete();
  }
}
