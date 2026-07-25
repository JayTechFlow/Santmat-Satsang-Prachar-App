import '../../../../core/utils/result.dart';
import '../entities/book_entity.dart';
import '../entities/book_category_entity.dart';
import '../entities/book_filter_entity.dart';
import '../entities/book_bookmark_entity.dart';
import '../entities/reading_progress_entity.dart';
import '../repositories/book_repository.dart';

class GetLatestBooksUseCase {
  final BookRepository repository;
  GetLatestBooksUseCase(this.repository);
  Future<Result<List<BookEntity>>> call() => repository.getLatestBooks();
}

class GetFeaturedBooksUseCase {
  final BookRepository repository;
  GetFeaturedBooksUseCase(this.repository);
  Future<Result<List<BookEntity>>> call() => repository.getFeaturedBooks();
}

class GetPopularBooksUseCase {
  final BookRepository repository;
  GetPopularBooksUseCase(this.repository);
  Future<Result<List<BookEntity>>> call() => repository.getPopularBooks();
}

class GetBookDetailsUseCase {
  final BookRepository repository;
  GetBookDetailsUseCase(this.repository);
  Future<Result<BookEntity>> call(String id) => repository.getBookDetails(id);
}

class SearchBooksUseCase {
  final BookRepository repository;
  SearchBooksUseCase(this.repository);
  Future<Result<List<BookEntity>>> call(String query) =>
      repository.searchBooks(query);
}

class FilterBooksUseCase {
  final BookRepository repository;
  FilterBooksUseCase(this.repository);
  Future<Result<List<BookEntity>>> call(BookFilterEntity filter) =>
      repository.filterBooks(filter);
}

class GetBookmarksUseCase {
  final BookRepository repository;
  GetBookmarksUseCase(this.repository);
  Future<Result<List<BookBookmarkEntity>>> call() => repository.getBookmarks();
}

class ToggleBookmarkUseCase {
  final BookRepository repository;
  ToggleBookmarkUseCase(this.repository);
  Future<Result<bool>> call(String bookId, int pageNumber) =>
      repository.toggleBookmark(bookId, pageNumber);
}

class GetReadingHistoryUseCase {
  final BookRepository repository;
  GetReadingHistoryUseCase(this.repository);
  Future<Result<List<ReadingProgressEntity>>> call() =>
      repository.getReadingHistory();
}

class UpdateReadingProgressUseCase {
  final BookRepository repository;
  UpdateReadingProgressUseCase(this.repository);
  Future<Result<void>> call(String bookId, int pageNumber, double percentage) =>
      repository.updateReadingProgress(bookId, pageNumber, percentage);
}

class GetBookCategoriesUseCase {
  final BookRepository repository;
  GetBookCategoriesUseCase(this.repository);
  Future<Result<List<BookCategoryEntity>>> call() => repository.getCategories();
}
