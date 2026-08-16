import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/usecases/library_usecases.dart';
import '../../domain/entities/library_filter_entity.dart';
import 'library_state.dart';
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';

final libraryGetBookmarksUseCaseProvider = Provider(
  (ref) => GetBookmarksUseCase(ref.watch(libraryRepositoryProvider)),
);
final libraryGetFavoritesUseCaseProvider = Provider(
  (ref) => GetFavoritesUseCase(ref.watch(libraryRepositoryProvider)),
);
final getHistoryUseCaseProvider = Provider(
  (ref) => GetHistoryUseCase(ref.watch(libraryRepositoryProvider)),
);
final getRecentActivitiesUseCaseProvider = Provider(
  (ref) => GetRecentActivitiesUseCase(ref.watch(libraryRepositoryProvider)),
);

final addBookmarkUseCaseProvider = Provider(
  (ref) => AddBookmarkUseCase(ref.watch(libraryRepositoryProvider)),
);
final removeBookmarkUseCaseProvider = Provider(
  (ref) => RemoveBookmarkUseCase(ref.watch(libraryRepositoryProvider)),
);
final toggleFavoriteUseCaseProvider = Provider(
  (ref) => ToggleFavoriteUseCase(ref.watch(libraryRepositoryProvider)),
);

final addHistoryItemUseCaseProvider = Provider(
  (ref) => AddHistoryItemUseCase(ref.watch(libraryRepositoryProvider)),
);
final deleteHistoryItemUseCaseProvider = Provider(
  (ref) => DeleteHistoryItemUseCase(ref.watch(libraryRepositoryProvider)),
);
final clearHistoryUseCaseProvider = Provider(
  (ref) => ClearHistoryUseCase(ref.watch(libraryRepositoryProvider)),
);

class LibraryNotifier extends Notifier<LibraryState> {
  bool _mounted = true;

  @override
  LibraryState build() {
    ref.onDispose(() => _mounted = false);
    Future.microtask(() {
      if (_mounted) loadData();
    });
    return const LibraryState(isLoading: true);
  }

  Future<void> loadData() async {
    if (!_mounted) return;
    state = state.copyWith(isLoading: true, error: null);

    try {
      final bookmarksRes = await ref
          .read(libraryGetBookmarksUseCaseProvider)
          .call(state.filter);
      final favoritesRes = await ref
          .read(libraryGetFavoritesUseCaseProvider)
          .call(state.filter);
      final historyRes = await ref
          .read(getHistoryUseCaseProvider)
          .call(state.filter);
      final recentRes = await ref
          .read(getRecentActivitiesUseCaseProvider)
          .call();

      if (!_mounted) return;

      if (bookmarksRes.isError) throw Exception(bookmarksRes.error);
      if (favoritesRes.isError) throw Exception(favoritesRes.error);
      if (historyRes.isError) throw Exception(historyRes.error);
      if (recentRes.isError) throw Exception(recentRes.error);

      state = state.copyWith(
        isLoading: false,
        bookmarks: bookmarksRes.data,
        favorites: favoritesRes.data,
        history: historyRes.data,
        recentActivities: recentRes.data,
      );
    } catch (e) {
      if (_mounted) {
        state = state.copyWith(isLoading: false, error: e.toString());
      }
    }
  }

  void updateFilter(LibraryFilterEntity newFilter) {
    state = state.copyWith(filter: newFilter);
    loadData();
  }

  Future<void> toggleFavorite(String contentId, String contentType) async {
    await ref.read(toggleFavoriteUseCaseProvider).call(contentId, contentType);
    await loadData();
  }

  Future<void> addBookmark(String contentId, String contentType) async {
    await ref.read(addBookmarkUseCaseProvider).call(contentId, contentType);
    await loadData();
  }

  Future<void> removeBookmark(String contentId, String contentType) async {
    await ref.read(removeBookmarkUseCaseProvider).call(contentId, contentType);
    await loadData();
  }

  Future<void> deleteHistory(String historyId) async {
    await ref.read(deleteHistoryItemUseCaseProvider).call(historyId);
    await loadData();
  }

  Future<void> clearHistory() async {
    await ref.read(clearHistoryUseCaseProvider).call();
    await loadData();
  }
}

final libraryProvider = NotifierProvider<LibraryNotifier, LibraryState>(
  LibraryNotifier.new,
);
