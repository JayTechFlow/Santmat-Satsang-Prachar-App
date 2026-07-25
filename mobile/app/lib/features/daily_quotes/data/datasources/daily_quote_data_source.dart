import '../../domain/entities/daily_quote_entity.dart';
import '../../domain/entities/quote_category_entity.dart';
import '../../domain/entities/quote_author_entity.dart';
import '../../domain/entities/quote_filter_entity.dart';
import '../../domain/entities/favorite_quote_entity.dart';
import '../../domain/entities/quote_history_entity.dart';

abstract class DailyQuoteDataSource {
  Future<DailyQuoteEntity> getTodayQuote();
  Future<DailyQuoteEntity> getRandomQuote();
  Future<List<DailyQuoteEntity>> getFeaturedQuotes();
  Future<List<DailyQuoteEntity>> searchQuotes(String query);
  Future<List<DailyQuoteEntity>> filterQuotes(QuoteFilterEntity filter);
  Future<List<QuoteCategoryEntity>> getCategories();
  Future<List<QuoteAuthorEntity>> getAuthors();
  Future<List<FavoriteQuoteEntity>> getFavoriteQuotes();
  Future<bool> toggleFavoriteQuote(String quoteId);
  Future<List<QuoteHistoryEntity>> getQuoteHistory();
  Future<void> addToHistory(String quoteId);
}
