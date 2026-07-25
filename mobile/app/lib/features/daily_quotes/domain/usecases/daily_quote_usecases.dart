import '../../../../core/utils/result.dart';
import '../entities/daily_quote_entity.dart';
import '../entities/quote_category_entity.dart';
import '../entities/quote_author_entity.dart';
import '../entities/favorite_quote_entity.dart';
import '../entities/quote_history_entity.dart';
import '../entities/quote_filter_entity.dart';
import '../repositories/daily_quote_repository.dart';

class GetTodayQuoteUseCase {
  final DailyQuoteRepository repository;
  GetTodayQuoteUseCase(this.repository);
  Future<Result<DailyQuoteEntity>> call() => repository.getTodayQuote();
}

class GetRandomQuoteUseCase {
  final DailyQuoteRepository repository;
  GetRandomQuoteUseCase(this.repository);
  Future<Result<DailyQuoteEntity>> call() => repository.getRandomQuote();
}

class GetFeaturedQuotesUseCase {
  final DailyQuoteRepository repository;
  GetFeaturedQuotesUseCase(this.repository);
  Future<Result<List<DailyQuoteEntity>>> call() =>
      repository.getFeaturedQuotes();
}

class SearchQuotesUseCase {
  final DailyQuoteRepository repository;
  SearchQuotesUseCase(this.repository);
  Future<Result<List<DailyQuoteEntity>>> call(String query) =>
      repository.searchQuotes(query);
}

class FilterQuotesUseCase {
  final DailyQuoteRepository repository;
  FilterQuotesUseCase(this.repository);
  Future<Result<List<DailyQuoteEntity>>> call(QuoteFilterEntity filter) =>
      repository.filterQuotes(filter);
}

class ToggleFavoriteQuoteUseCase {
  final DailyQuoteRepository repository;
  ToggleFavoriteQuoteUseCase(this.repository);
  Future<Result<bool>> call(String quoteId) =>
      repository.toggleFavoriteQuote(quoteId);
}

class GetFavoriteQuotesUseCase {
  final DailyQuoteRepository repository;
  GetFavoriteQuotesUseCase(this.repository);
  Future<Result<List<FavoriteQuoteEntity>>> call() =>
      repository.getFavoriteQuotes();
}

class GetQuoteHistoryUseCase {
  final DailyQuoteRepository repository;
  GetQuoteHistoryUseCase(this.repository);
  Future<Result<List<QuoteHistoryEntity>>> call() =>
      repository.getQuoteHistory();
}

class AddQuoteToHistoryUseCase {
  final DailyQuoteRepository repository;
  AddQuoteToHistoryUseCase(this.repository);
  Future<Result<void>> call(String quoteId) => repository.addToHistory(quoteId);
}

class GetQuoteCategoriesUseCase {
  final DailyQuoteRepository repository;
  GetQuoteCategoriesUseCase(this.repository);
  Future<Result<List<QuoteCategoryEntity>>> call() =>
      repository.getCategories();
}

class GetQuoteAuthorsUseCase {
  final DailyQuoteRepository repository;
  GetQuoteAuthorsUseCase(this.repository);
  Future<Result<List<QuoteAuthorEntity>>> call() => repository.getAuthors();
}
