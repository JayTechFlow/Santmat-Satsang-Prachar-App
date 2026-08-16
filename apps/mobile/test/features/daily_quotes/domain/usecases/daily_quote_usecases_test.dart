import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/utils/result.dart';
import 'package:santmat_satsang_prachar/features/daily_quotes/domain/entities/daily_quote_entity.dart';
import 'package:santmat_satsang_prachar/features/daily_quotes/domain/entities/quote_category_entity.dart';
import 'package:santmat_satsang_prachar/features/daily_quotes/domain/entities/quote_author_entity.dart';
import 'package:santmat_satsang_prachar/features/daily_quotes/domain/entities/favorite_quote_entity.dart';
import 'package:santmat_satsang_prachar/features/daily_quotes/domain/entities/quote_history_entity.dart';
import 'package:santmat_satsang_prachar/features/daily_quotes/domain/entities/quote_filter_entity.dart';
import 'package:santmat_satsang_prachar/features/daily_quotes/domain/repositories/daily_quote_repository.dart';
import 'package:santmat_satsang_prachar/features/daily_quotes/domain/usecases/daily_quote_usecases.dart';

class MockDailyQuoteRepository implements DailyQuoteRepository {
  @override
  Future<Result<DailyQuoteEntity>> getTodayQuote() async =>
      throw UnimplementedError();

  @override
  Future<Result<DailyQuoteEntity>> getRandomQuote() async =>
      throw UnimplementedError();

  @override
  Future<Result<List<DailyQuoteEntity>>> getFeaturedQuotes() async =>
      const Result.success([]);

  @override
  Future<Result<List<DailyQuoteEntity>>> searchQuotes(String query) async =>
      const Result.success([]);

  @override
  Future<Result<List<DailyQuoteEntity>>> filterQuotes(
    QuoteFilterEntity filter,
  ) async => const Result.success([]);

  @override
  Future<Result<List<QuoteCategoryEntity>>> getCategories() async =>
      const Result.success([]);

  @override
  Future<Result<List<QuoteAuthorEntity>>> getAuthors() async =>
      const Result.success([]);

  @override
  Future<Result<List<FavoriteQuoteEntity>>> getFavoriteQuotes() async =>
      const Result.success([]);

  @override
  Future<Result<bool>> toggleFavoriteQuote(String quoteId) async =>
      const Result.success(true);

  @override
  Future<Result<List<QuoteHistoryEntity>>> getQuoteHistory() async =>
      const Result.success([]);

  @override
  Future<Result<void>> addToHistory(String quoteId) async =>
      const Result.success(null);
}

void main() {
  late MockDailyQuoteRepository repository;
  late GetFeaturedQuotesUseCase getFeaturedUseCase;

  setUp(() {
    repository = MockDailyQuoteRepository();
    getFeaturedUseCase = GetFeaturedQuotesUseCase(repository);
  });

  test('GetFeaturedQuotesUseCase returns success', () async {
    final result = await getFeaturedUseCase();
    expect(result.isSuccess, true);
    expect(result.data, isEmpty);
  });
}
