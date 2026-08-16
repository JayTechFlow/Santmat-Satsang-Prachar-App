// Enterprise Media Platform — Remote Data Source
// Sprint M1 Foundation

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:santmat_satsang_prachar/core/media/data/models/media_asset_dto.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_category.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_status.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_type.dart';

abstract class IMediaRemoteDataSource {
  Future<MediaAssetDto> getById(String id);
  Future<List<MediaAssetDto>> getAll({
    MediaType? type,
    MediaCategory? category,
    MediaStatus? status,
    String? linkedEntityId,
    int? limit,
  });
  Future<List<MediaAssetDto>> getByLinkedEntity(
    String entityId,
    String entityType,
  );
  Future<MediaAssetDto> save(Map<String, dynamic> data);
  Future<void> update(String id, Map<String, dynamic> data);
  Future<void> softDelete(String id);
  Future<void> hardDelete(String id);
}

class FirestoreMediaDataSource implements IMediaRemoteDataSource {
  final FirebaseFirestore _firestore;
  static const String _collection = 'media';

  FirestoreMediaDataSource({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  CollectionReference<Map<String, dynamic>> get _col =>
      _firestore.collection(_collection);

  @override
  Future<MediaAssetDto> getById(String id) async {
    final doc = await _col.doc(id).get();
    if (!doc.exists) {
      throw Exception('MediaAsset not found: $id');
    }
    return MediaAssetDto.fromFirestore(doc);
  }

  @override
  Future<List<MediaAssetDto>> getAll({
    MediaType? type,
    MediaCategory? category,
    MediaStatus? status,
    String? linkedEntityId,
    int? limit,
  }) async {
    Query<Map<String, dynamic>> q = _col;

    if (type != null) q = q.where('type', isEqualTo: type.value);
    if (category != null) q = q.where('category', isEqualTo: category.value);
    if (status != null) {
      q = q.where('status', isEqualTo: status.value);
    } else {
      q = q.where('status', isNotEqualTo: MediaStatus.deleted.value);
    }
    if (linkedEntityId != null) {
      q = q.where('linkedEntityId', isEqualTo: linkedEntityId);
    }
    q = q.orderBy('createdAt', descending: true);
    if (limit != null) q = q.limit(limit);

    final snapshot = await q.get();
    return snapshot.docs.map(MediaAssetDto.fromFirestore).toList();
  }

  @override
  Future<List<MediaAssetDto>> getByLinkedEntity(
    String entityId,
    String entityType,
  ) async {
    final snapshot = await _col
        .where('linkedEntityId', isEqualTo: entityId)
        .where('linkedEntityType', isEqualTo: entityType)
        .where('status', isNotEqualTo: MediaStatus.deleted.value)
        .orderBy('createdAt', descending: true)
        .get();
    return snapshot.docs.map(MediaAssetDto.fromFirestore).toList();
  }

  @override
  Future<MediaAssetDto> save(Map<String, dynamic> data) async {
    final docRef = await _col.add(data);
    final doc = await docRef.get();
    return MediaAssetDto.fromFirestore(doc);
  }

  @override
  Future<void> update(String id, Map<String, dynamic> data) async {
    await _col.doc(id).update(data);
  }

  @override
  Future<void> softDelete(String id) async {
    await _col.doc(id).update({
      'status': MediaStatus.deleted.value,
      'deletedAt': FieldValue.serverTimestamp(),
    });
  }

  @override
  Future<void> hardDelete(String id) async {
    await _col.doc(id).delete();
  }
}
