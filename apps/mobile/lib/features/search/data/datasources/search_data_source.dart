import '../../domain/entities/search_filter_entity.dart';
import '../../domain/entities/search_result_entity.dart';
import '../../domain/entities/search_suggestion_entity.dart';

/// The Search data contract.
///
/// Search History and Popular Searches were removed from the product, so this
/// contract intentionally exposes only the published-bhajan search itself.
abstract class SearchDataSource {
  Future<List<SearchResultEntity>> searchEverything(
    String query, {
    SearchFilterEntity? filter,
  });

  Future<List<SearchSuggestionEntity>> getSearchSuggestions(String query);
}