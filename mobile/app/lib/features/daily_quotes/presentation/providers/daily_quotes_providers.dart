import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/di/service_locator_registrations.dart';
import '../../data/datasources/daily_quote_data_source.dart';
import '../../data/datasources/mock_daily_quote_data_source.dart';
import '../../data/datasources/firestore_daily_quote_data_source.dart';
import '../../data/repositories/daily_quote_repository_impl.dart';
import '../../domain/repositories/daily_quote_repository.dart';
import '../../domain/usecases/daily_quote_usecases.dart';
import '../../domain/entities/daily_quote_entity.dart';
import '../../domain/entities/favorite_quote_entity.dart';
import '../../domain/entities/quote_history_entity.dart';
import '../../domain/entities/quote_category_entity.dart';
import '../../domain/entities/quote_author_entity.dart';
import 'daily_quotes_state.dart';

final dailyQuoteDataSourceProvider = Provider<DailyQuoteDataSource>((ref) {
  final isDev = ref.watch(environmentConfigurationProvider).isDev;
  if (isDev) {
    return MockDailyQuoteDataSource();
  }
  return FirestoreDailyQuoteDataSource(ref.watch(firestoreServiceProvider));
});

final dailyQuoteRepositoryProvider = Provider<DailyQuoteRepository>((ref) {
  return DailyQuoteRepositoryImpl(ref.watch(dailyQuoteDataSourceProvider));
});

final getTodayQuoteUseCaseProvider = Provider(
  (ref) => GetTodayQuoteUseCase(ref.watch(dailyQuoteRepositoryProvider)),
);
final getRandomQuoteUseCaseProvider = Provider(
  (ref) => GetRandomQuoteUseCase(ref.watch(dailyQuoteRepositoryProvider)),
);
final getFeaturedQuotesUseCaseProvider = Provider(
  (ref) => GetFeaturedQuotesUseCase(ref.watch(dailyQuoteRepositoryProvider)),
);
final getFavoriteQuotesUseCaseProvider = Provider(
  (ref) => GetFavoriteQuotesUseCase(ref.watch(dailyQuoteRepositoryProvider)),
);
final getQuoteHistoryUseCaseProvider = Provider(
  (ref) => GetQuoteHistoryUseCase(ref.watch(dailyQuoteRepositoryProvider)),
);
final getQuoteCategoriesUseCaseProvider = Provider(
  (ref) => GetQuoteCategoriesUseCase(ref.watch(dailyQuoteRepositoryProvider)),
);
final getQuoteAuthorsUseCaseProvider = Provider(
  (ref) => GetQuoteAuthorsUseCase(ref.watch(dailyQuoteRepositoryProvider)),
);

class DailyQuotesNotifier extends Notifier<DailyQuotesState> {
  bool _mounted = true;

  @override
  DailyQuotesState build() {
    ref.onDispose(() => _mounted = false);
    Future.microtask(() {
      if (_mounted) loadData();
    });
    return const DailyQuotesState(isLoading: true);
  }

  Future<void> loadData() async {
    if (!_mounted) return;
    state = state.copyWith(isLoading: true, error: null);

    try {
      final getToday = ref.read(getTodayQuoteUseCaseProvider);
      final getFeatured = ref.read(getFeaturedQuotesUseCaseProvider);
      final getCategories = ref.read(getQuoteCategoriesUseCaseProvider);
      final getAuthors = ref.read(getQuoteAuthorsUseCaseProvider);

      final results = await Future.wait([
        getToday(),
        getFeatured(),
        getCategories(),
        getAuthors(),
      ]);

      if (!_mounted) return;

      final today = results[0];
      final featured = results[1];
      final categories = results[2];
      final authors = results[3];

      if (today.isError) throw Exception(today.error);
      if (featured.isError) throw Exception(featured.error);
      if (categories.isError) throw Exception(categories.error);
      if (authors.isError) throw Exception(authors.error);

      state = state.copyWith(
        isLoading: false,
        todayQuote: today.data as DailyQuoteEntity,
        featuredQuotes: featured.data as List<DailyQuoteEntity>,
        categories: categories.data as List<QuoteCategoryEntity>,
        authors: authors.data as List<QuoteAuthorEntity>,
      );
    } catch (e) {
      if (_mounted) {
        state = state.copyWith(isLoading: false, error: e.toString());
      }
    }
  }
}

final dailyQuotesProvider =
    NotifierProvider<DailyQuotesNotifier, DailyQuotesState>(
      DailyQuotesNotifier.new,
    );

final favoritesProvider = FutureProvider<List<FavoriteQuoteEntity>>((
  ref,
) async {
  final res = await ref.read(getFavoriteQuotesUseCaseProvider).call();
  if (res.isError) throw Exception(res.error);
  return res.data!;
});

final quoteHistoryProvider = FutureProvider<List<QuoteHistoryEntity>>((
  ref,
) async {
  final res = await ref.read(getQuoteHistoryUseCaseProvider).call();
  if (res.isError) throw Exception(res.error);
  return res.data!;
});
