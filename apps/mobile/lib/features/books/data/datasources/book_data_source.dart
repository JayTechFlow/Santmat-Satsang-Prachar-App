import '../../domain/entities/book_entity.dart';
import '../../domain/entities/book_category_entity.dart';
import '../../domain/entities/book_filter_entity.dart';
import '../../domain/entities/book_bookmark_entity.dart';
import '../../domain/entities/reading_progress_entity.dart';

abstract class BookDataSource {
  Future<List<BookEntity>> getLatestBooks();
  Future<List<BookEntity>> getFeaturedBooks();
  Future<List<BookEntity>> getPopularBooks();
  Future<BookEntity> getBookDetails(String id);
  Future<List<BookEntity>> searchBooks(String query);
  Future<List<BookEntity>> filterBooks(BookFilterEntity filter);
  Future<List<BookCategoryEntity>> getCategories();
  Future<List<BookBookmarkEntity>> getBookmarks();
  Future<bool> toggleBookmark(String bookId, int pageNumber);
  Future<List<ReadingProgressEntity>> getReadingHistory();
  Future<void> updateReadingProgress(
    String bookId,
    int pageNumber,
    double percentage,
  );
}
