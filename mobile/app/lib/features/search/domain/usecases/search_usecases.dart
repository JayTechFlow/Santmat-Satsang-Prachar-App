import '../../../../core/utils/result.dart';
import '../entities/search_result_entity.dart';
import '../entities/search_filter_entity.dart';
import '../entities/recent_search_entity.dart';
import '../entities/search_suggestion_entity.dart';
import '../repositories/search_repository.dart';

class SearchEverythingUseCase {
  final SearchRepository repository;
  SearchEverythingUseCase(this.repository);
  Future<Result<List<SearchResultEntity>>> call(
    String query, {
    SearchFilterEntity? filter,
  }) => repository.searchEverything(query, filter: filter);
}

class GetRecentSearchesUseCase {
  final SearchRepository repository;
  GetRecentSearchesUseCase(this.repository);
  Future<Result<List<RecentSearchEntity>>> call() =>
      repository.getRecentSearches();
}

class SaveRecentSearchUseCase {
  final SearchRepository repository;
  SaveRecentSearchUseCase(this.repository);
  Future<Result<void>> call(String query) => repository.saveRecentSearch(query);
}

class DeleteRecentSearchUseCase {
  final SearchRepository repository;
  DeleteRecentSearchUseCase(this.repository);
  Future<Result<void>> call(String query) =>
      repository.deleteRecentSearch(query);
}

class ClearRecentSearchesUseCase {
  final SearchRepository repository;
  ClearRecentSearchesUseCase(this.repository);
  Future<Result<void>> call() => repository.clearRecentSearches();
}

class GetSearchSuggestionsUseCase {
  final SearchRepository repository;
  GetSearchSuggestionsUseCase(this.repository);
  Future<Result<List<SearchSuggestionEntity>>> call(String query) =>
      repository.getSearchSuggestions(query);
}
