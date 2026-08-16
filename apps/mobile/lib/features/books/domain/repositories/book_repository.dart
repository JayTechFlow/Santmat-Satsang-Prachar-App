import '../../../../core/utils/result.dart';
import '../entities/book_entity.dart';
import '../entities/book_category_entity.dart';
import '../entities/book_filter_entity.dart';
import '../entities/book_bookmark_entity.dart';
import '../entities/reading_progress_entity.dart';

abstract class BookRepository {
  Future<Result<List<BookEntity>>> getLatestBooks();
  Future<Result<List<BookEntity>>> getFeaturedBooks();
  Future<Result<List<BookEntity>>> getPopularBooks();
  Future<Result<BookEntity>> getBookDetails(String id);
  Future<Result<List<BookEntity>>> searchBooks(String query);
  Future<Result<List<BookEntity>>> filterBooks(BookFilterEntity filter);
  Future<Result<List<BookCategoryEntity>>> getCategories();

  Future<Result<List<BookBookmarkEntity>>> getBookmarks();
  Future<Result<bool>> toggleBookmark(String bookId, int pageNumber);

  Future<Result<List<ReadingProgressEntity>>> getReadingHistory();
  Future<Result<void>> updateReadingProgress(
    String bookId,
    int pageNumber,
    double percentage,
  );
}
