import '../../domain/entities/daily_quote_entity.dart';
import '../../domain/entities/quote_category_entity.dart';
import '../../domain/entities/quote_author_entity.dart';
import '../../domain/entities/quote_filter_entity.dart';
import '../../domain/entities/favorite_quote_entity.dart';
import '../../domain/entities/quote_history_entity.dart';
import 'daily_quote_data_source.dart';

class MockDailyQuoteDataSource implements DailyQuoteDataSource {
  final List<QuoteCategoryEntity> _categories = [
    const QuoteCategoryEntity(
      id: 'c1',
      name: 'Meditation',
      description: 'Quotes about Dhyan',
    ),
    const QuoteCategoryEntity(
      id: 'c2',
      name: 'Devotion',
      description: 'Quotes about Bhakti',
    ),
    const QuoteCategoryEntity(
      id: 'c3',
      name: 'Wisdom',
      description: 'General wisdom',
    ),
  ];

  final List<QuoteAuthorEntity> _authors = [
    const QuoteAuthorEntity(
      id: 'a1',
      name: 'Maharshi Mehi Paramhans',
      bio: 'Great saint of the 20th century.',
      imageUrl: 'https://picsum.photos/seed/a1/200/200',
    ),
    const QuoteAuthorEntity(
      id: 'a2',
      name: 'Sant Tulsi Sahib',
      bio: 'Mystic saint of Hathras.',
      imageUrl: 'https://picsum.photos/seed/a2/200/200',
    ),
  ];

  late final List<DailyQuoteEntity> _quotes;
  final List<FavoriteQuoteEntity> _favorites = [];
  final List<QuoteHistoryEntity> _history = [];

  MockDailyQuoteDataSource() {
    _quotes = List.generate(10, (index) {
      return DailyQuoteEntity(
        id: 'quote_$index',
        quoteText:
            'This is a deeply spiritual and profound quote number $index that inspires devotion and inner peace. The path of Santmat leads to salvation.',
        author: _authors[index % _authors.length],
        category: _categories[index % _categories.length],
        language: index % 3 == 0 ? 'English' : 'Hindi',
        reference: 'Book $index, Page ${index * 10}',
        tags: ['Spirituality', 'Peace'],
        createdDate: DateTime.now().subtract(Duration(days: index)),
        isFeatured: index < 3,
        isFavorite: false,
        isDaily: index == 0,
        backgroundImageUrl: 'https://picsum.photos/seed/quote_$index/600/400',
        gradientThemeId: 'theme_${index % 3}',
      );
    });
  }

  @override
  Future<DailyQuoteEntity> getTodayQuote() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return _quotes.firstWhere((q) => q.isDaily, orElse: () => _quotes.first);
  }

  @override
  Future<DailyQuoteEntity> getRandomQuote() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return _quotes[DateTime.now().millisecond % _quotes.length];
  }

  @override
  Future<List<DailyQuoteEntity>> getFeaturedQuotes() async {
    await Future.delayed(const Duration(milliseconds: 400));
    return _quotes.where((q) => q.isFeatured).toList();
  }

  @override
  Future<List<DailyQuoteEntity>> searchQuotes(String query) async {
    await Future.delayed(const Duration(milliseconds: 400));
    final q = query.toLowerCase();
    return _quotes.where((quote) {
      return quote.quoteText.toLowerCase().contains(q) ||
          quote.author.name.toLowerCase().contains(q);
    }).toList();
  }

  @override
  Future<List<DailyQuoteEntity>> filterQuotes(QuoteFilterEntity filter) async {
    await Future.delayed(const Duration(milliseconds: 400));
    return _quotes.where((q) {
      if (filter.categoryId != null && q.category.id != filter.categoryId) {
        return false;
      }
      if (filter.authorId != null && q.author.id != filter.authorId) {
        return false;
      }
      if (filter.language != null && q.language != filter.language) {
        return false;
      }
      if (filter.isFeatured != null && q.isFeatured != filter.isFeatured) {
        return false;
      }
      if (filter.isDaily != null && q.isDaily != filter.isDaily) {
        return false;
      }
      return true;
    }).toList();
  }

  @override
  Future<List<QuoteCategoryEntity>> getCategories() async {
    await Future.delayed(const Duration(milliseconds: 200));
    return _categories;
  }

  @override
  Future<List<QuoteAuthorEntity>> getAuthors() async {
    await Future.delayed(const Duration(milliseconds: 200));
    return _authors;
  }

  @override
  Future<List<FavoriteQuoteEntity>> getFavoriteQuotes() async {
    await Future.delayed(const Duration(milliseconds: 300));
    if (_favorites.isEmpty && _quotes.length > 2) {
      _favorites.add(
        FavoriteQuoteEntity(quote: _quotes[1], favoritedAt: DateTime.now()),
      );
    }
    return _favorites;
  }

  @override
  Future<bool> toggleFavoriteQuote(String quoteId) async {
    await Future.delayed(const Duration(milliseconds: 200));
    final index = _favorites.indexWhere((f) => f.quote.id == quoteId);
    if (index >= 0) {
      _favorites.removeAt(index);
      return false;
    } else {
      final quote = _quotes.firstWhere((q) => q.id == quoteId);
      _favorites.add(
        FavoriteQuoteEntity(quote: quote, favoritedAt: DateTime.now()),
      );
      return true;
    }
  }

  @override
  Future<List<QuoteHistoryEntity>> getQuoteHistory() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return _history;
  }

  @override
  Future<void> addToHistory(String quoteId) async {
    await Future.delayed(const Duration(milliseconds: 100));
    final quote = _quotes.firstWhere((q) => q.id == quoteId);
    _history.removeWhere((h) => h.quote.id == quoteId);
    _history.insert(
      0,
      QuoteHistoryEntity(quote: quote, viewedAt: DateTime.now()),
    );
  }
}
