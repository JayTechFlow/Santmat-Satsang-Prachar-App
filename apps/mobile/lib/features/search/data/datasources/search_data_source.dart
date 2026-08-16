import '../../domain/entities/search_result_entity.dart';
import '../../domain/entities/recent_search_entity.dart';
import '../../domain/entities/search_suggestion_entity.dart';
import '../../domain/entities/search_filter_entity.dart';

abstract class SearchDataSource {
  Future<List<SearchResultEntity>> searchEverything(
    String query, {
    SearchFilterEntity? filter,
  });
  Future<List<RecentSearchEntity>> getRecentSearches();
  Future<void> saveRecentSearch(String query);
  Future<void> deleteRecentSearch(String query);
  Future<void> clearRecentSearches();
  Future<List<String>> getPopularSearches();
  Future<List<SearchSuggestionEntity>> getSearchSuggestions(String query);
}
