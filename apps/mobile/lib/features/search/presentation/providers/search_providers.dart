import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';

import '../../data/datasources/firestore_search_data_source.dart';
import '../../domain/entities/search_category_definition.dart';
import '../../domain/entities/search_filter_entity.dart';
import '../../domain/entities/search_result_entity.dart';
import '../../domain/usecases/search_usecases.dart';
import 'search_state.dart';

final searchEverythingUseCaseProvider = Provider(
  (ref) => SearchEverythingUseCase(ref.watch(searchRepositoryProvider)),
);
final getSearchSuggestionsUseCaseProvider = Provider(
  (ref) => GetSearchSuggestionsUseCase(ref.watch(searchRepositoryProvider)),
);

/// Debounce applied to typing so a keystroke does not trigger a search.
const Duration kSearchDebounce = Duration(milliseconds: 350);

/// The single canonical Search notifier.
///
/// There is exactly one instance of this state for the whole app: the single
/// `/search` route is the only Search surface, so Home → Search and
/// Audio → Search share this query, this category and this result set.
class SearchNotifier extends Notifier<SearchState> {
  Timer? _debounceTimer;
  int _requestId = 0;
  bool _disposed = false;
  bool _userInteracted = false;

  @override
  SearchState build() {
    _disposed = false;
    _userInteracted = false;
    ref.onDispose(() {
      _disposed = true;
      _debounceTimer?.cancel();
    });

    // Opening Search must show real bhajan results, never an empty shell.
    // Scheduled as a microtask so no provider is mutated while it builds.
    Future.microtask(_loadDefaultResults);

    return const SearchState();
  }

  void _loadDefaultResults() {
    if (_disposed) return;
    // Guarded: if a query or a category was already chosen before this
    // microtask ran, that newer intent wins and must never be overwritten by
    // the default load.
    if (_userInteracted || _requestId != 0) return;
    runSearch(
      state.query,
      category: SearchCategories.defaultCategory.id,
    );
  }

  /// Text input. Searching always combines the query with the *current*
  /// category, and clearing the query restores the full category listing.
  void updateQuery(String query) {
    _userInteracted = true;
    state = state.copyWith(query: query);

    _debounceTimer?.cancel();
    if (query.isEmpty) {
      runSearch(query, category: state.selectedCategory);
      return;
    }
    _debounceTimer = Timer(
      kSearchDebounce,
      () => runSearch(query, category: state.selectedCategory),
    );
  }

  /// Category tap. The query is intentionally preserved; only the result set
  /// changes, immediately.
  void selectCategory(SearchCategoryId category) {
    _userInteracted = true;
    if (category == state.selectedCategory) return;
    _debounceTimer?.cancel();
    state = state.copyWith(selectedCategory: category);
    runSearch(state.query, category: category);
  }

  /// Runs a search for [query] under [category] and stores the result set.
  ///
  /// Obsolete in-flight responses are discarded via [_requestId], so rapid
  /// category switching or typing can never leave stale results behind.
  Future<void> runSearch(
    String query, {
    required SearchCategoryId category,
    SearchFilterEntity? filter,
  }) async {
    _debounceTimer?.cancel();
    _requestId++;
    final currentRequestId = _requestId;

    final activeFilter =
        filter ?? SearchFilterEntity.forCategory(category);
    state = state.copyWith(
      isLoading: true,
      error: null,
      query: query,
      selectedCategory: category,
      activeFilter: activeFilter,
    );

    try {
      final searchEverything = ref.read(searchEverythingUseCaseProvider);
      final result = await searchEverything(query, filter: activeFilter);

      if (_disposed || currentRequestId != _requestId) return;

      if (result.isSuccess) {
        state = state.copyWith(
          isLoading: false,
          results: _boundResults(result.data),
        );
      } else {
        state = state.copyWith(
          isLoading: false,
          error: result.error?.toString(),
        );
      }
    } catch (e) {
      if (_disposed || currentRequestId != _requestId) return;
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  List<SearchResultEntity> _boundResults(List<SearchResultEntity>? results) {
    return (results ?? const <SearchResultEntity>[])
        .take(FirestoreSearchDataSource.maxResults)
        .toList(growable: false);
  }

  /// Re-runs the current query/category pair.
  Future<void> retry() =>
      runSearch(state.query, category: state.selectedCategory);

  void clearResults() {
    state = state.copyWith(results: const []);
  }
}

final searchProvider = NotifierProvider<SearchNotifier, SearchState>(
  SearchNotifier.new,
);