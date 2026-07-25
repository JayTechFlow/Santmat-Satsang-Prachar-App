import '../../../../core/utils/result.dart';
import '../../domain/entities/daily_quote_entity.dart';
import '../../domain/entities/quote_category_entity.dart';
import '../../domain/entities/quote_author_entity.dart';
import '../../domain/entities/favorite_quote_entity.dart';
import '../../domain/entities/quote_history_entity.dart';
import '../../domain/entities/quote_filter_entity.dart';
import '../../domain/repositories/daily_quote_repository.dart';
import '../datasources/mock_daily_quote_data_source.dart';

class DailyQuoteRepositoryImpl implements DailyQuoteRepository {
  final MockDailyQuoteDataSource dataSource;

  DailyQuoteRepositoryImpl(this.dataSource);

  @override
  Future<Result<DailyQuoteEntity>> getTodayQuote() async {
    try {
      final res = await dataSource.getTodayQuote();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<DailyQuoteEntity>> getRandomQuote() async {
    try {
      final res = await dataSource.getRandomQuote();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<DailyQuoteEntity>>> getFeaturedQuotes() async {
    try {
      final res = await dataSource.getFeaturedQuotes();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<DailyQuoteEntity>>> searchQuotes(String query) async {
    try {
      final res = await dataSource.searchQuotes(query);
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<DailyQuoteEntity>>> filterQuotes(
    QuoteFilterEntity filter,
  ) async {
    try {
      final res = await dataSource.filterQuotes(filter);
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<QuoteCategoryEntity>>> getCategories() async {
    try {
      final res = await dataSource.getCategories();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<QuoteAuthorEntity>>> getAuthors() async {
    try {
      final res = await dataSource.getAuthors();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<FavoriteQuoteEntity>>> getFavoriteQuotes() async {
    try {
      final res = await dataSource.getFavoriteQuotes();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<bool>> toggleFavoriteQuote(String quoteId) async {
    try {
      final res = await dataSource.toggleFavoriteQuote(quoteId);
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<QuoteHistoryEntity>>> getQuoteHistory() async {
    try {
      final res = await dataSource.getQuoteHistory();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<void>> addToHistory(String quoteId) async {
    try {
      await dataSource.addToHistory(quoteId);
      return const Result.success(null);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }
}
