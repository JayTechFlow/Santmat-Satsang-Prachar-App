import '../../../../core/utils/result.dart';
import '../../domain/entities/library_filter_entity.dart';
import '../../domain/entities/bookmark_entity.dart';
import '../../domain/entities/favorite_entity.dart';
import '../../domain/entities/history_entity.dart';
import '../../domain/entities/recent_activity_entity.dart';
import '../../domain/repositories/library_repository.dart';
import '../datasources/mock_library_data_source.dart';

class LibraryRepositoryImpl implements LibraryRepository {
  final MockLibraryDataSource dataSource;

  LibraryRepositoryImpl(this.dataSource);

  @override
  Future<Result<List<BookmarkEntity>>> getBookmarks(
    LibraryFilterEntity filter,
  ) async {
    try {
      final res = await dataSource.getBookmarks(filter);
      return Result.success(res);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<List<FavoriteEntity>>> getFavorites(
    LibraryFilterEntity filter,
  ) async {
    try {
      final res = await dataSource.getFavorites(filter);
      return Result.success(res);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<List<HistoryEntity>>> getHistory(
    LibraryFilterEntity filter,
  ) async {
    try {
      final res = await dataSource.getHistory(filter);
      return Result.success(res);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<List<RecentActivityEntity>>> getRecentActivities() async {
    try {
      final res = await dataSource.getRecentActivities();
      return Result.success(res);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<void>> addBookmark(String contentId, String contentType) async {
    try {
      await dataSource.addBookmark(contentId, contentType);
      return const Result.success(null);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<void>> removeBookmark(
    String contentId,
    String contentType,
  ) async {
    try {
      await dataSource.removeBookmark(contentId, contentType);
      return const Result.success(null);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<void>> toggleFavorite(
    String contentId,
    String contentType,
  ) async {
    try {
      await dataSource.toggleFavorite(contentId, contentType);
      return const Result.success(null);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<void>> addHistoryItem(
    String contentId,
    String contentType,
    double? progress,
  ) async {
    try {
      await dataSource.addHistoryItem(contentId, contentType, progress);
      return const Result.success(null);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<void>> deleteHistoryItem(String historyId) async {
    try {
      await dataSource.deleteHistoryItem(historyId);
      return const Result.success(null);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<void>> clearHistory() async {
    try {
      await dataSource.clearHistory();
      return const Result.success(null);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }
}
