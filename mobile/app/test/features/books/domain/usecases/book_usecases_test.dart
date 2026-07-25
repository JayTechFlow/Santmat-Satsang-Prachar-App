import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/utils/result.dart';
import 'package:santmat_satsang_prachar/features/books/domain/entities/book_entity.dart';
import 'package:santmat_satsang_prachar/features/books/domain/entities/book_category_entity.dart';
import 'package:santmat_satsang_prachar/features/books/domain/entities/book_filter_entity.dart';
import 'package:santmat_satsang_prachar/features/books/domain/entities/book_bookmark_entity.dart';
import 'package:santmat_satsang_prachar/features/books/domain/entities/reading_progress_entity.dart';
import 'package:santmat_satsang_prachar/features/books/domain/repositories/book_repository.dart';
import 'package:santmat_satsang_prachar/features/books/domain/usecases/book_usecases.dart';

class MockBookRepository implements BookRepository {
  @override
  Future<Result<List<BookEntity>>> getLatestBooks() async =>
      const Result.success([]);

  @override
  Future<Result<List<BookEntity>>> getFeaturedBooks() async =>
      const Result.success([]);

  @override
  Future<Result<List<BookEntity>>> getPopularBooks() async =>
      const Result.success([]);

  @override
  Future<Result<BookEntity>> getBookDetails(String id) async =>
      throw UnimplementedError();

  @override
  Future<Result<List<BookEntity>>> searchBooks(String query) async =>
      const Result.success([]);

  @override
  Future<Result<List<BookEntity>>> filterBooks(BookFilterEntity filter) async =>
      const Result.success([]);

  @override
  Future<Result<List<BookCategoryEntity>>> getCategories() async =>
      const Result.success([]);

  @override
  Future<Result<List<BookBookmarkEntity>>> getBookmarks() async =>
      const Result.success([]);

  @override
  Future<Result<bool>> toggleBookmark(String bookId, int pageNumber) async =>
      const Result.success(true);

  @override
  Future<Result<List<ReadingProgressEntity>>> getReadingHistory() async =>
      const Result.success([]);

  @override
  Future<Result<void>> updateReadingProgress(
    String bookId,
    int pageNumber,
    double percentage,
  ) async => const Result.success(null);
}

void main() {
  late MockBookRepository repository;
  late GetLatestBooksUseCase getLatestUseCase;
  late GetFeaturedBooksUseCase getFeaturedUseCase;

  setUp(() {
    repository = MockBookRepository();
    getLatestUseCase = GetLatestBooksUseCase(repository);
    getFeaturedUseCase = GetFeaturedBooksUseCase(repository);
  });

  test('GetLatestBooksUseCase returns success', () async {
    final result = await getLatestUseCase();
    expect(result.isSuccess, true);
    expect(result.data, isEmpty);
  });

  test('GetFeaturedBooksUseCase returns success', () async {
    final result = await getFeaturedUseCase();
    expect(result.isSuccess, true);
    expect(result.data, isEmpty);
  });
}
