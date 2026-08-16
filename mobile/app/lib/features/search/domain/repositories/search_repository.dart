import '../../../../core/utils/result.dart';
import '../entities/search_result_entity.dart';
import '../entities/search_filter_entity.dart';
import '../entities/recent_search_entity.dart';
import '../entities/search_suggestion_entity.dart';

abstract class SearchRepository {
  Future<Result<List<SearchResultEntity>>> searchEverything(
    String query, {
    SearchFilterEntity? filter,
  });
  Future<Result<List<RecentSearchEntity>>> getRecentSearches();
  Future<Result<void>> saveRecentSearch(String query);
  Future<Result<void>> deleteRecentSearch(String query);
  Future<Result<void>> clearRecentSearches();
  Future<Result<List<String>>> getPopularSearches();
  Future<Result<List<SearchSuggestionEntity>>> getSearchSuggestions(
    String query,
  );
}
