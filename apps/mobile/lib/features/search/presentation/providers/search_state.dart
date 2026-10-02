import '../../domain/entities/search_category_definition.dart';
import '../../domain/entities/search_filter_entity.dart';
import '../../domain/entities/search_result_entity.dart';

/// The one canonical Search state.
///
/// Search History, Popular Searches and Voice Search state were removed. The
/// remaining state is exactly what the Search screen renders: the query, the
/// selected permanent category, the results and the loading/error flags.
class SearchState {
  final bool isLoading;
  final String? error;
  final String query;

  /// The selected permanent category. Defaults to the "सभी भजन" sentinel.
  final SearchCategoryId selectedCategory;

  final List<SearchResultEntity> results;
  final SearchFilterEntity? activeFilter;

  const SearchState({
    this.isLoading = false,
    this.error,
    this.query = '',
    this.selectedCategory = SearchCategoryId.allBhajan,
    this.results = const [],
    this.activeFilter,
  });

  /// Definition of the selected category, resolved from the single registry.
  SearchCategoryDefinition get categoryDefinition =>
      SearchCategories.byId(selectedCategory) ?? SearchCategories.allBhajan;

  /// Exact UI label of the selected category.
  String get selectedCategoryLabel => categoryDefinition.uiLabel;

  SearchState copyWith({
    bool? isLoading,
    String? error,
    String? query,
    SearchCategoryId? selectedCategory,
    List<SearchResultEntity>? results,
    SearchFilterEntity? activeFilter,
  }) {
    return SearchState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      query: query ?? this.query,
      selectedCategory: selectedCategory ?? this.selectedCategory,
      results: results ?? this.results,
      activeFilter: activeFilter ?? this.activeFilter,
    );
  }
}