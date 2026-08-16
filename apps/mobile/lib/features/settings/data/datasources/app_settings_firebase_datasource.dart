import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/app_settings_dto.dart';
import 'app_settings_remote_datasource.dart';

class AppSettingsFirebaseDataSource implements AppSettingsRemoteDataSource {
  final FirebaseFirestore _firestore;
  final String _collection = 'app_settings';

  AppSettingsFirebaseDataSource(this._firestore);

  @override
  Future<List<AppSettingsDto>> getAll() async {
    final snapshot = await _firestore.collection(_collection).get();
    return snapshot.docs
        .map((doc) => AppSettingsDto.fromJson(doc.data(), doc.id))
        .toList();
  }

  @override
  Future<AppSettingsDto?> getById(String id) async {
    final doc = await _firestore.collection(_collection).doc(id).get();
    if (doc.exists && doc.data() != null) {
      return AppSettingsDto.fromJson(doc.data()!, doc.id);
    }
    return null;
  }

  @override
  Future<void> add(AppSettingsDto item) async {
    if (item.id.isNotEmpty) {
      await _firestore.collection(_collection).doc(item.id).set(item.toJson());
    } else {
      await _firestore.collection(_collection).add(item.toJson());
    }
  }

  @override
  Future<void> update(AppSettingsDto item) async {
    await _firestore.collection(_collection).doc(item.id).update(item.toJson());
  }

  @override
  Future<void> delete(String id) async {
    await _firestore.collection(_collection).doc(id).delete();
  }
}
