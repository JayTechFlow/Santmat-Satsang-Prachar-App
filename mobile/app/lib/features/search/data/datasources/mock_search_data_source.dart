import '../../domain/entities/search_result_entity.dart';
import '../../domain/entities/recent_search_entity.dart';
import '../../domain/entities/search_suggestion_entity.dart';
import '../../domain/entities/search_filter_entity.dart';

import 'search_data_source.dart';

class MockSearchDataSource implements SearchDataSource {
  late final List<SearchResultEntity> _mockData;
  final List<RecentSearchEntity> _recentSearches = [];

  MockSearchDataSource() {
    _mockData = [
      ...List.generate(
        5,
        (index) => SearchResultEntity(
          id: 'satsang_$index',
          title: 'Satsang Session $index',
          subtitle: 'By Maharshi Mehi',
          imageUrl: 'https://picsum.photos/seed/satsang_$index/200/200',
          type: SearchContentType.satsang,
          routePath: '/satsang/details/satsang_$index',
          date: DateTime.now().subtract(Duration(days: index)),
          tags: ['Meditation', 'Peace'],
        ),
      ),
      ...List.generate(
        5,
        (index) => SearchResultEntity(
          id: 'audio_$index',
          title: 'Bhajan $index',
          subtitle: 'Devotional Audio',
          imageUrl: 'https://picsum.photos/seed/audio_$index/200/200',
          type: SearchContentType.audio,
          routePath: '/audio/details/audio_$index',
          date: DateTime.now().subtract(Duration(days: index)),
          tags: ['Bhajan', 'Audio'],
        ),
      ),
      ...List.generate(
        5,
        (index) => SearchResultEntity(
          id: 'book_$index',
          title: 'Book $index',
          subtitle: 'Santmat Literature',
          imageUrl: 'https://picsum.photos/seed/book_$index/200/200',
          type: SearchContentType.books,
          routePath: '/books/details/book_$index',
          date: DateTime.now().subtract(Duration(days: index)),
          tags: ['Literature', 'Book'],
        ),
      ),
      ...List.generate(
        5,
        (index) => SearchResultEntity(
          id: 'quote_$index',
          title: 'Quote $index',
          subtitle: 'Daily Inspiration',
          imageUrl: 'https://picsum.photos/seed/quote_$index/200/200',
          type: SearchContentType.dailyQuotes,
          routePath: '/quotes/details/quote_$index',
          date: DateTime.now().subtract(Duration(days: index)),
          tags: ['Quote', 'Inspiration'],
        ),
      ),
    ];
  }

  @override
  Future<List<SearchResultEntity>> searchEverything(
    String query, {
    SearchFilterEntity? filter,
  }) async {
    await Future.delayed(const Duration(milliseconds: 500));
    final q = query.toLowerCase();

    return _mockData.where((item) {
      if (q.isNotEmpty) {
        final matchTitle = item.title.toLowerCase().contains(q);
        final matchSubtitle = item.subtitle.toLowerCase().contains(q);
        final matchTags = item.tags.any((t) => t.toLowerCase().contains(q));
        if (!matchTitle && !matchSubtitle && !matchTags) {
          return false;
        }
      }

      if (filter != null) {
        if (filter.contentTypes != null && filter.contentTypes!.isNotEmpty) {
          if (!filter.contentTypes!.contains(item.type)) {
            return false;
          }
        }
      }

      return true;
    }).toList();
  }

  @override
  Future<List<RecentSearchEntity>> getRecentSearches() async {
    await Future.delayed(const Duration(milliseconds: 200));
    return _recentSearches;
  }

  @override
  Future<void> saveRecentSearch(String query) async {
    await Future.delayed(const Duration(milliseconds: 100));
    final q = query.trim();
    if (q.isEmpty) return;

    _recentSearches.removeWhere(
      (s) => s.query.toLowerCase() == q.toLowerCase(),
    );
    _recentSearches.insert(
      0,
      RecentSearchEntity(query: q, searchedAt: DateTime.now()),
    );

    if (_recentSearches.length > 10) {
      _recentSearches.removeLast();
    }
  }

  @override
  Future<void> deleteRecentSearch(String query) async {
    await Future.delayed(const Duration(milliseconds: 100));
    _recentSearches.removeWhere(
      (s) => s.query.toLowerCase() == query.toLowerCase(),
    );
  }

  @override
  Future<void> clearRecentSearches() async {
    await Future.delayed(const Duration(milliseconds: 100));
    _recentSearches.clear();
  }

  @override
  Future<List<SearchSuggestionEntity>> getSearchSuggestions(
    String query,
  ) async {
    await Future.delayed(const Duration(milliseconds: 200));
    final q = query.toLowerCase();
    if (q.isEmpty) return [];

    final suggestions = _mockData
        .where((item) => item.title.toLowerCase().contains(q))
        .map((item) => SearchSuggestionEntity(suggestion: item.title))
        .take(5)
        .toList();

    return suggestions;
  }
}
