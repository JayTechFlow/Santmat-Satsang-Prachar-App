import '../../../../core/utils/result.dart';
import '../entities/daily_quote_entity.dart';
import '../entities/quote_category_entity.dart';
import '../entities/quote_author_entity.dart';
import '../entities/favorite_quote_entity.dart';
import '../entities/quote_history_entity.dart';
import '../entities/quote_filter_entity.dart';

abstract class DailyQuoteRepository {
  Future<Result<DailyQuoteEntity>> getTodayQuote();
  Future<Result<DailyQuoteEntity>> getRandomQuote();
  Future<Result<List<DailyQuoteEntity>>> getFeaturedQuotes();
  Future<Result<List<DailyQuoteEntity>>> searchQuotes(String query);
  Future<Result<List<DailyQuoteEntity>>> filterQuotes(QuoteFilterEntity filter);
  Future<Result<List<QuoteCategoryEntity>>> getCategories();
  Future<Result<List<QuoteAuthorEntity>>> getAuthors();

  Future<Result<List<FavoriteQuoteEntity>>> getFavoriteQuotes();
  Future<Result<bool>> toggleFavoriteQuote(String quoteId);

  Future<Result<List<QuoteHistoryEntity>>> getQuoteHistory();
  Future<Result<void>> addToHistory(String quoteId);
}
