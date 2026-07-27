import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/books_dto.dart';
import 'books_remote_datasource.dart';

class BookFirebaseDataSource implements BookRemoteDataSource {
  final FirebaseFirestore _firestore;
  final String _collection = 'books';

  BookFirebaseDataSource(this._firestore);

  @override
  Future<List<BookDto>> getAll() async {
    final snapshot = await _firestore.collection(_collection).get();
    return snapshot.docs
        .map((doc) => BookDto.fromJson(doc.data(), doc.id))
        .toList();
  }

  @override
  Future<BookDto?> getById(String id) async {
    final doc = await _firestore.collection(_collection).doc(id).get();
    if (doc.exists && doc.data() != null) {
      return BookDto.fromJson(doc.data()!, doc.id);
    }
    return null;
  }

  @override
  Future<void> add(BookDto item) async {
    if (item.id.isNotEmpty) {
      await _firestore.collection(_collection).doc(item.id).set(item.toJson());
    } else {
      await _firestore.collection(_collection).add(item.toJson());
    }
  }

  @override
  Future<void> update(BookDto item) async {
    await _firestore.collection(_collection).doc(item.id).update(item.toJson());
  }

  @override
  Future<void> delete(String id) async {
    await _firestore.collection(_collection).doc(id).delete();
  }
}
