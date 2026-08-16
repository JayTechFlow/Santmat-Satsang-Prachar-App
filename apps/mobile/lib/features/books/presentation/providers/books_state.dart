import '../../domain/entities/book_entity.dart';
import '../../domain/entities/book_category_entity.dart';
import '../../domain/entities/reading_progress_entity.dart';

class BooksHomeState {
  final bool isLoading;
  final String? error;
  final List<BookEntity> featuredBooks;
  final List<BookEntity> latestBooks;
  final List<BookEntity> popularBooks;
  final List<BookCategoryEntity> categories;
  final List<ReadingProgressEntity> readingHistory;

  const BooksHomeState({
    this.isLoading = false,
    this.error,
    this.featuredBooks = const [],
    this.latestBooks = const [],
    this.popularBooks = const [],
    this.categories = const [],
    this.readingHistory = const [],
  });

  BooksHomeState copyWith({
    bool? isLoading,
    String? error,
    List<BookEntity>? featuredBooks,
    List<BookEntity>? latestBooks,
    List<BookEntity>? popularBooks,
    List<BookCategoryEntity>? categories,
    List<ReadingProgressEntity>? readingHistory,
  }) {
    return BooksHomeState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      featuredBooks: featuredBooks ?? this.featuredBooks,
      latestBooks: latestBooks ?? this.latestBooks,
      popularBooks: popularBooks ?? this.popularBooks,
      categories: categories ?? this.categories,
      readingHistory: readingHistory ?? this.readingHistory,
    );
  }
}
