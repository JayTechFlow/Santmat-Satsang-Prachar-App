import '../../../../core/utils/result.dart';
import '../entities/library_filter_entity.dart';
import '../entities/bookmark_entity.dart';
import '../entities/favorite_entity.dart';
import '../entities/history_entity.dart';
import '../entities/recent_activity_entity.dart';
import '../repositories/library_repository.dart';

class GetBookmarksUseCase {
  final LibraryRepository repository;
  GetBookmarksUseCase(this.repository);
  Future<Result<List<BookmarkEntity>>> call(LibraryFilterEntity filter) =>
      repository.getBookmarks(filter);
}

class GetFavoritesUseCase {
  final LibraryRepository repository;
  GetFavoritesUseCase(this.repository);
  Future<Result<List<FavoriteEntity>>> call(LibraryFilterEntity filter) =>
      repository.getFavorites(filter);
}

class GetHistoryUseCase {
  final LibraryRepository repository;
  GetHistoryUseCase(this.repository);
  Future<Result<List<HistoryEntity>>> call(LibraryFilterEntity filter) =>
      repository.getHistory(filter);
}

class GetRecentActivitiesUseCase {
  final LibraryRepository repository;
  GetRecentActivitiesUseCase(this.repository);
  Future<Result<List<RecentActivityEntity>>> call() =>
      repository.getRecentActivities();
}

class AddBookmarkUseCase {
  final LibraryRepository repository;
  AddBookmarkUseCase(this.repository);
  Future<Result<void>> call(String contentId, String contentType) =>
      repository.addBookmark(contentId, contentType);
}

class RemoveBookmarkUseCase {
  final LibraryRepository repository;
  RemoveBookmarkUseCase(this.repository);
  Future<Result<void>> call(String contentId, String contentType) =>
      repository.removeBookmark(contentId, contentType);
}

class ToggleFavoriteUseCase {
  final LibraryRepository repository;
  ToggleFavoriteUseCase(this.repository);
  Future<Result<void>> call(String contentId, String contentType) =>
      repository.toggleFavorite(contentId, contentType);
}

class AddHistoryItemUseCase {
  final LibraryRepository repository;
  AddHistoryItemUseCase(this.repository);
  Future<Result<void>> call(
    String contentId,
    String contentType,
    double? progress,
  ) => repository.addHistoryItem(contentId, contentType, progress);
}

class DeleteHistoryItemUseCase {
  final LibraryRepository repository;
  DeleteHistoryItemUseCase(this.repository);
  Future<Result<void>> call(String historyId) =>
      repository.deleteHistoryItem(historyId);
}

class ClearHistoryUseCase {
  final LibraryRepository repository;
  ClearHistoryUseCase(this.repository);
  Future<Result<void>> call() => repository.clearHistory();
}
