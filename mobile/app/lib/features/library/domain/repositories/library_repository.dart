import '../../../../core/utils/result.dart';
import '../entities/library_filter_entity.dart';
import '../entities/bookmark_entity.dart';
import '../entities/favorite_entity.dart';
import '../entities/history_entity.dart';
import '../entities/recent_activity_entity.dart';

abstract class LibraryRepository {
  Future<Result<List<BookmarkEntity>>> getBookmarks(LibraryFilterEntity filter);
  Future<Result<List<FavoriteEntity>>> getFavorites(LibraryFilterEntity filter);
  Future<Result<List<HistoryEntity>>> getHistory(LibraryFilterEntity filter);
  Future<Result<List<RecentActivityEntity>>> getRecentActivities();
  
  Future<Result<void>> addBookmark(String contentId, String contentType);
  Future<Result<void>> removeBookmark(String contentId, String contentType);
  Future<Result<void>> toggleFavorite(String contentId, String contentType);
  
  Future<Result<void>> addHistoryItem(String contentId, String contentType, double? progress);
  Future<Result<void>> deleteHistoryItem(String historyId);
  Future<Result<void>> clearHistory();
}
