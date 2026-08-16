import '../../domain/entities/bookmark_entity.dart';
import '../../domain/entities/favorite_entity.dart';
import '../../domain/entities/history_entity.dart';
import '../../domain/entities/recent_activity_entity.dart';
import '../../domain/entities/library_filter_entity.dart';

abstract class LibraryDataSource {
  Future<List<BookmarkEntity>> getBookmarks(LibraryFilterEntity filter);
  Future<List<FavoriteEntity>> getFavorites(LibraryFilterEntity filter);
  Future<List<HistoryEntity>> getHistory(LibraryFilterEntity filter);
  Future<List<RecentActivityEntity>> getRecentActivities();
  Future<void> addBookmark(String contentId, String contentType);
  Future<void> removeBookmark(String contentId, String contentType);
  Future<void> toggleFavorite(String contentId, String contentType);
  Future<void> addHistoryItem(
    String contentId,
    String contentType,
    double? progress,
  );
  Future<void> deleteHistoryItem(String historyId);
  Future<void> clearHistory();
}
