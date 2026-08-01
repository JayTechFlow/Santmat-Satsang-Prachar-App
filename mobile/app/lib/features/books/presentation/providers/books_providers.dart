import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/usecases/book_usecases.dart';
import '../../domain/entities/book_entity.dart';
import '../../domain/entities/book_category_entity.dart';
import '../../domain/entities/book_bookmark_entity.dart';
import '../../domain/entities/reading_progress_entity.dart';
import 'books_state.dart';
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';

final getLatestBooksUseCaseProvider = Provider(
  (ref) => GetLatestBooksUseCase(ref.watch(bookRepositoryProvider)),
);
final getFeaturedBooksUseCaseProvider = Provider(
  (ref) => GetFeaturedBooksUseCase(ref.watch(bookRepositoryProvider)),
);
final getPopularBooksUseCaseProvider = Provider(
  (ref) => GetPopularBooksUseCase(ref.watch(bookRepositoryProvider)),
);
final getBookCategoriesUseCaseProvider = Provider(
  (ref) => GetBookCategoriesUseCase(ref.watch(bookRepositoryProvider)),
);
final getReadingHistoryUseCaseProvider = Provider(
  (ref) => GetReadingHistoryUseCase(ref.watch(bookRepositoryProvider)),
);
final getBookDetailsUseCaseProvider = Provider(
  (ref) => GetBookDetailsUseCase(ref.watch(bookRepositoryProvider)),
);
final getBookmarksUseCaseProvider = Provider(
  (ref) => GetBookmarksUseCase(ref.watch(bookRepositoryProvider)),
);
final toggleBookmarkUseCaseProvider = Provider(
  (ref) => ToggleBookmarkUseCase(ref.watch(bookRepositoryProvider)),
);
final updateReadingProgressUseCaseProvider = Provider(
  (ref) => UpdateReadingProgressUseCase(ref.watch(bookRepositoryProvider)),
);

class BooksHomeNotifier extends Notifier<BooksHomeState> {
  bool _mounted = true;

  @override
  BooksHomeState build() {
    ref.onDispose(() => _mounted = false);
    Future.microtask(() {
      if (_mounted) loadHomeData();
    });
    return const BooksHomeState(isLoading: true);
  }

  Future<void> loadHomeData() async {
    if (!_mounted) return;
    state = state.copyWith(isLoading: true, error: null);

    try {
      final getFeatured = ref.read(getFeaturedBooksUseCaseProvider);
      final getLatest = ref.read(getLatestBooksUseCaseProvider);
      final getPopular = ref.read(getPopularBooksUseCaseProvider);
      final getCategories = ref.read(getBookCategoriesUseCaseProvider);
      final getHistory = ref.read(getReadingHistoryUseCaseProvider);

      final results = await Future.wait([
        getFeatured(),
        getLatest(),
        getPopular(),
        getCategories(),
        getHistory(),
      ]);

      if (!_mounted) return;

      final featured = results[0];
      final latest = results[1];
      final popular = results[2];
      final categories = results[3];
      final history = results[4];

      if (featured.isError) throw Exception(featured.error);
      if (latest.isError) throw Exception(latest.error);
      if (popular.isError) throw Exception(popular.error);
      if (categories.isError) throw Exception(categories.error);
      if (history.isError) throw Exception(history.error);

      state = state.copyWith(
        isLoading: false,
        featuredBooks: featured.data as List<BookEntity>,
        latestBooks: latest.data as List<BookEntity>,
        popularBooks: popular.data as List<BookEntity>,
        categories: categories.data as List<BookCategoryEntity>,
        readingHistory: history.data as List<ReadingProgressEntity>,
      );
    } catch (e) {
      if (_mounted) {
        state = state.copyWith(isLoading: false, error: e.toString());
      }
    }
  }
}

final booksHomeStateProvider =
    NotifierProvider<BooksHomeNotifier, BooksHomeState>(BooksHomeNotifier.new);

final bookDetailsProvider = FutureProvider.family<BookEntity, String>((
  ref,
  id,
) async {
  final res = await ref.read(getBookDetailsUseCaseProvider).call(id);
  if (res.isError) throw Exception(res.error);
  return res.data!;
});

final bookmarksProvider = FutureProvider<List<BookBookmarkEntity>>((ref) async {
  final res = await ref.read(getBookmarksUseCaseProvider).call();
  if (res.isError) throw Exception(res.error);
  return res.data!;
});

final readingProgressProvider = FutureProvider<List<ReadingProgressEntity>>((
  ref,
) async {
  final res = await ref.read(getReadingHistoryUseCaseProvider).call();
  if (res.isError) throw Exception(res.error);
  return res.data!;
});
