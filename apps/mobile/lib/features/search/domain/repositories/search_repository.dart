import '../../../../core/utils/result.dart';
import '../entities/search_filter_entity.dart';
import '../../domain/entities/search_result_entity.dart';
import '../../domain/entities/search_suggestion_entity.dart';

/// The canonical Search repository.
///
/// Search History and Popular Searches were removed from the product, so no
/// history/popular contract remains here.
abstract class SearchRepository {
  Future<Result<List<SearchResultEntity>>> searchEverything(
    String query, {
    SearchFilterEntity? filter,
  });

  Future<Result<List<SearchSuggestionEntity>>> getSearchSuggestions(
    String query,
  );
}