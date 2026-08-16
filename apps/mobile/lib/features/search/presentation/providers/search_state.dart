import '../../domain/entities/search_result_entity.dart';
import '../../domain/entities/search_filter_entity.dart';
import '../../domain/entities/search_suggestion_entity.dart';

class SearchState {
  final bool isLoading;
  final String? error;
  final String query;
  final List<SearchResultEntity> results;
  final List<SearchSuggestionEntity> suggestions;
  final SearchFilterEntity? activeFilter;

  const SearchState({
    this.isLoading = false,
    this.error,
    this.query = '',
    this.results = const [],
    this.suggestions = const [],
    this.activeFilter,
  });

  SearchState copyWith({
    bool? isLoading,
    String? error,
    String? query,
    List<SearchResultEntity>? results,
    List<SearchSuggestionEntity>? suggestions,
    SearchFilterEntity? activeFilter,
  }) {
    return SearchState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      query: query ?? this.query,
      results: results ?? this.results,
      suggestions: suggestions ?? this.suggestions,
      activeFilter: activeFilter ?? this.activeFilter,
    );
  }
}
