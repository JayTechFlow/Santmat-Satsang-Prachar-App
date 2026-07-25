import '../../../../core/utils/result.dart';

import '../../domain/entities/book_entity.dart';
import '../../domain/entities/book_category_entity.dart';
import '../../domain/entities/book_filter_entity.dart';
import '../../domain/entities/book_bookmark_entity.dart';
import '../../domain/entities/reading_progress_entity.dart';
import '../../domain/repositories/book_repository.dart';
import '../datasources/mock_book_data_source.dart';

class BookRepositoryImpl implements BookRepository {
  final MockBookDataSource dataSource;

  BookRepositoryImpl(this.dataSource);

  @override
  Future<Result<List<BookEntity>>> getLatestBooks() async {
    try {
      final res = await dataSource.getLatestBooks();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<BookEntity>>> getFeaturedBooks() async {
    try {
      final res = await dataSource.getFeaturedBooks();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<BookEntity>>> getPopularBooks() async {
    try {
      final res = await dataSource.getPopularBooks();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<BookEntity>> getBookDetails(String id) async {
    try {
      final res = await dataSource.getBookDetails(id);
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<BookEntity>>> searchBooks(String query) async {
    try {
      final res = await dataSource.searchBooks(query);
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<BookEntity>>> filterBooks(BookFilterEntity filter) async {
    try {
      final res = await dataSource.filterBooks(filter);
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<BookCategoryEntity>>> getCategories() async {
    try {
      final res = await dataSource.getCategories();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<BookBookmarkEntity>>> getBookmarks() async {
    try {
      final res = await dataSource.getBookmarks();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<bool>> toggleBookmark(String bookId, int pageNumber) async {
    try {
      final res = await dataSource.toggleBookmark(bookId, pageNumber);
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<ReadingProgressEntity>>> getReadingHistory() async {
    try {
      final res = await dataSource.getReadingHistory();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<void>> updateReadingProgress(
    String bookId,
    int pageNumber,
    double percentage,
  ) async {
    try {
      await dataSource.updateReadingProgress(bookId, pageNumber, percentage);
      return const Result.success(null);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }
}
