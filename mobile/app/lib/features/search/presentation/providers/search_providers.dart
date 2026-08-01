import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:async';
import '../../domain/usecases/search_usecases.dart';
import '../../domain/entities/search_filter_entity.dart';
import '../../domain/entities/recent_search_entity.dart';
import 'search_state.dart';
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';

final searchEverythingUseCaseProvider = Provider(
  (ref) => SearchEverythingUseCase(ref.watch(searchRepositoryProvider)),
);
final getRecentSearchesUseCaseProvider = Provider(
  (ref) => GetRecentSearchesUseCase(ref.watch(searchRepositoryProvider)),
);
final saveRecentSearchUseCaseProvider = Provider(
  (ref) => SaveRecentSearchUseCase(ref.watch(searchRepositoryProvider)),
);
final deleteRecentSearchUseCaseProvider = Provider(
  (ref) => DeleteRecentSearchUseCase(ref.watch(searchRepositoryProvider)),
);
final clearRecentSearchesUseCaseProvider = Provider(
  (ref) => ClearRecentSearchesUseCase(ref.watch(searchRepositoryProvider)),
);
final getSearchSuggestionsUseCaseProvider = Provider(
  (ref) => GetSearchSuggestionsUseCase(ref.watch(searchRepositoryProvider)),
);

class SearchNotifier extends Notifier<SearchState> {
  Timer? _debounceTimer;

  @override
  SearchState build() {
    ref.onDispose(() {
      _debounceTimer?.cancel();
    });
    return const SearchState();
  }

  void updateQuery(String query) {
    state = state.copyWith(query: query);

    if (query.isEmpty) {
      state = state.copyWith(results: [], suggestions: []);
      return;
    }

    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 500), () {
      _fetchSuggestions(query);
    });
  }

  Future<void> _fetchSuggestions(String query) async {
    final getSuggestions = ref.read(getSearchSuggestionsUseCaseProvider);
    final result = await getSuggestions(query);
    if (result.isSuccess) {
      state = state.copyWith(suggestions: result.data);
    }
  }

  Future<void> performSearch(String query, {SearchFilterEntity? filter}) async {
    if (query.isEmpty && filter == null) return;

    state = state.copyWith(
      isLoading: true,
      error: null,
      query: query,
      activeFilter: filter ?? state.activeFilter,
    );

    try {
      final searchEverything = ref.read(searchEverythingUseCaseProvider);
      final result = await searchEverything(query, filter: state.activeFilter);

      if (result.isSuccess) {
        state = state.copyWith(
          isLoading: false,
          results: result.data,
          suggestions: [],
        );

        if (query.isNotEmpty) {
          await ref.read(saveRecentSearchUseCaseProvider).call(query);
          ref.invalidate(recentSearchesProvider);
        }
      } else {
        state = state.copyWith(
          isLoading: false,
          error: result.error.toString(),
        );
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  void updateFilter(SearchFilterEntity filter) {
    performSearch(state.query, filter: filter);
  }
}

final searchProvider = NotifierProvider<SearchNotifier, SearchState>(
  SearchNotifier.new,
);

final recentSearchesProvider = FutureProvider<List<RecentSearchEntity>>((
  ref,
) async {
  final res = await ref.read(getRecentSearchesUseCaseProvider).call();
  if (res.isError) throw Exception(res.error);
  return res.data!;
});
