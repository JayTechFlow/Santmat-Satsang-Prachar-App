import '../../../../core/utils/result.dart';
import '../entities/search_filter_entity.dart';
import '../entities/search_result_entity.dart';
import '../entities/search_suggestion_entity.dart';
import '../repositories/search_repository.dart';

/// The single Search use case: category-filtered, text-matched published
/// bhajan search. Search History and Popular Searches use cases were removed
/// with their features.
class SearchEverythingUseCase {
  final SearchRepository repository;
  SearchEverythingUseCase(this.repository);
  Future<Result<List<SearchResultEntity>>> call(
    String query, {
    SearchFilterEntity? filter,
  }) => repository.searchEverything(query, filter: filter);
}

class GetSearchSuggestionsUseCase {
  final SearchRepository repository;
  GetSearchSuggestionsUseCase(this.repository);
  Future<Result<List<SearchSuggestionEntity>>> call(String query) =>
      repository.getSearchSuggestions(query);
}