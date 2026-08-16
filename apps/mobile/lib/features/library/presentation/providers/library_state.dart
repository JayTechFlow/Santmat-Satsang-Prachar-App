import '../../domain/entities/bookmark_entity.dart';
import '../../domain/entities/favorite_entity.dart';
import '../../domain/entities/history_entity.dart';
import '../../domain/entities/recent_activity_entity.dart';
import '../../domain/entities/library_filter_entity.dart';

class LibraryState {
  final bool isLoading;
  final String? error;
  final List<BookmarkEntity> bookmarks;
  final List<FavoriteEntity> favorites;
  final List<HistoryEntity> history;
  final List<RecentActivityEntity> recentActivities;
  final LibraryFilterEntity filter;

  const LibraryState({
    this.isLoading = false,
    this.error,
    this.bookmarks = const [],
    this.favorites = const [],
    this.history = const [],
    this.recentActivities = const [],
    this.filter = const LibraryFilterEntity(),
  });

  LibraryState copyWith({
    bool? isLoading,
    String? error,
    List<BookmarkEntity>? bookmarks,
    List<FavoriteEntity>? favorites,
    List<HistoryEntity>? history,
    List<RecentActivityEntity>? recentActivities,
    LibraryFilterEntity? filter,
  }) {
    return LibraryState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      bookmarks: bookmarks ?? this.bookmarks,
      favorites: favorites ?? this.favorites,
      history: history ?? this.history,
      recentActivities: recentActivities ?? this.recentActivities,
      filter: filter ?? this.filter,
    );
  }
}
