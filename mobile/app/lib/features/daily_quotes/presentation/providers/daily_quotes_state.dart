import '../../domain/entities/daily_quote_entity.dart';
import '../../domain/entities/quote_category_entity.dart';
import '../../domain/entities/quote_author_entity.dart';

class DailyQuotesState {
  final bool isLoading;
  final String? error;
  final DailyQuoteEntity? todayQuote;
  final List<DailyQuoteEntity> featuredQuotes;
  final List<QuoteCategoryEntity> categories;
  final List<QuoteAuthorEntity> authors;

  const DailyQuotesState({
    this.isLoading = false,
    this.error,
    this.todayQuote,
    this.featuredQuotes = const [],
    this.categories = const [],
    this.authors = const [],
  });

  DailyQuotesState copyWith({
    bool? isLoading,
    String? error,
    DailyQuoteEntity? todayQuote,
    List<DailyQuoteEntity>? featuredQuotes,
    List<QuoteCategoryEntity>? categories,
    List<QuoteAuthorEntity>? authors,
  }) {
    return DailyQuotesState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      todayQuote: todayQuote ?? this.todayQuote,
      featuredQuotes: featuredQuotes ?? this.featuredQuotes,
      categories: categories ?? this.categories,
      authors: authors ?? this.authors,
    );
  }
}
