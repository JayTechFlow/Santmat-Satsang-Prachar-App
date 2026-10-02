import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../core/firebase/firestore_collections.dart';
import '../../../../core/services/firestore_service.dart';
import '../../domain/entities/book_entity.dart';
import '../../domain/entities/book_category_entity.dart';
import '../../domain/entities/book_filter_entity.dart';
import '../../domain/entities/book_bookmark_entity.dart';
import '../../domain/entities/reading_progress_entity.dart';
import 'book_data_source.dart';
import '../models/book_dto.dart';

class FirestoreBookDataSource implements BookDataSource {
  final FirestoreService _firestoreService;

  FirestoreBookDataSource(this._firestoreService);

  @override
  Future<List<BookEntity>> getLatestBooks() async {
    final snapshot = await _firestoreService.getCollection(
      FirestoreCollections.books,
    );
    return snapshot.docs
        .map((doc) => BookDto.fromFirestore(doc).toEntity())
        .toList();
  }

  @override
  Future<List<BookEntity>> getFeaturedBooks() async {
    final snapshot = await _firestoreService.getCollection(
      FirestoreCollections.books,
    );
    return snapshot.docs
        .map((doc) => BookDto.fromFirestore(doc).toEntity())
        .toList();
  }

  @override
  Future<List<BookEntity>> getPopularBooks() async {
    final snapshot = await _firestoreService.getCollection(
      FirestoreCollections.books,
    );
    return snapshot.docs
        .map((doc) => BookDto.fromFirestore(doc).toEntity())
        .toList();
  }

  @override
  Future<BookEntity> getBookDetails(String id) async {
    final doc = await _firestoreService.getDocument(
      FirestoreCollections.books,
      id,
    );
    if (!doc.exists) throw Exception('Book not found');
    return BookDto.fromFirestore(doc).toEntity();
  }

  @override
  Future<List<BookEntity>> searchBooks(String query) async {
    final snapshot = await _firestoreService.queryCollection(
      FirestoreCollections.books,
      (q) => q
          .where('title', isGreaterThanOrEqualTo: query)
          .where('title', isLessThanOrEqualTo: '$query\uf8ff'),
    );
    return snapshot.docs
        .map((doc) => BookDto.fromFirestore(doc).toEntity())
        .toList();
  }

  @override
  Future<List<BookEntity>> filterBooks(BookFilterEntity filter) async {
    final snapshot = await _firestoreService.queryCollection(
      FirestoreCollections.books,
      (q) {
        var query = q as Query<Map<String, dynamic>>;
        if (filter.categoryId != null) {
          query = query.where('category.id', isEqualTo: filter.categoryId);
        }
        if (filter.authorId != null) {
          query = query.where('author.id', isEqualTo: filter.authorId);
        }
        if (filter.language != null) {
          query = query.where('language', isEqualTo: filter.language);
        }
        if (filter.isFeatured != null) {
          query = query.where('isFeatured', isEqualTo: filter.isFeatured);
        }
        if (filter.isPopular != null) {
          query = query.where('isPopular', isEqualTo: filter.isPopular);
        }
        if (filter.isRecentlyAdded != null) {
          query = query.where(
            'isRecentlyAdded',
            isEqualTo: filter.isRecentlyAdded,
          );
        }
        return query;
      },
    );
    return snapshot.docs
        .map((doc) => BookDto.fromFirestore(doc).toEntity())
        .toList();
  }

  @override
  Future<List<BookCategoryEntity>> getCategories() async {
    final snapshot = await _firestoreService.getCollection(
      FirestoreCollections.bookCategories,
    );
    return snapshot.docs.map((doc) {
      final data = doc.data() as Map<String, dynamic>? ?? {};
      return BookCategoryEntity(
        id: doc.id,
        name: data['name'] as String? ?? '',
        description: data['description'] as String? ?? '',
      );
    }).toList();
  }

  @override
  Future<List<BookBookmarkEntity>> getBookmarks() async {
    // Implementation would require current user ID, returning empty for now
    return [];
  }

  @override
  Future<bool> toggleBookmark(String bookId, int pageNumber) async {
    return false;
  }

  @override
  Future<List<ReadingProgressEntity>> getReadingHistory() async {
    return [];
  }

  @override
  Future<void> updateReadingProgress(
    String bookId,
    int pageNumber,
    double percentage,
  ) async {}
}
