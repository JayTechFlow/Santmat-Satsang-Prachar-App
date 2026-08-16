import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/utils/result.dart';
import 'package:santmat_satsang_prachar/features/library/domain/entities/bookmark_entity.dart';
import 'package:santmat_satsang_prachar/features/library/domain/entities/favorite_entity.dart';
import 'package:santmat_satsang_prachar/features/library/domain/entities/history_entity.dart';
import 'package:santmat_satsang_prachar/features/library/domain/entities/recent_activity_entity.dart';
import 'package:santmat_satsang_prachar/features/library/domain/entities/library_filter_entity.dart';
import 'package:santmat_satsang_prachar/features/library/domain/repositories/library_repository.dart';
import 'package:santmat_satsang_prachar/features/library/domain/usecases/library_usecases.dart';

class MockLibraryRepository implements LibraryRepository {
  @override
  Future<Result<List<BookmarkEntity>>> getBookmarks(
    LibraryFilterEntity filter,
  ) async => const Result.success([]);
  @override
  Future<Result<List<FavoriteEntity>>> getFavorites(
    LibraryFilterEntity filter,
  ) async => const Result.success([]);
  @override
  Future<Result<List<HistoryEntity>>> getHistory(
    LibraryFilterEntity filter,
  ) async => const Result.success([]);
  @override
  Future<Result<List<RecentActivityEntity>>> getRecentActivities() async =>
      const Result.success([]);
  @override
  Future<Result<void>> addBookmark(
    String contentId,
    String contentType,
  ) async => const Result.success(null);
  @override
  Future<Result<void>> removeBookmark(
    String contentId,
    String contentType,
  ) async => const Result.success(null);
  @override
  Future<Result<void>> toggleFavorite(
    String contentId,
    String contentType,
  ) async => const Result.success(null);
  @override
  Future<Result<void>> addHistoryItem(
    String contentId,
    String contentType,
    double? progress,
  ) async => const Result.success(null);
  @override
  Future<Result<void>> deleteHistoryItem(String historyId) async =>
      const Result.success(null);
  @override
  Future<Result<void>> clearHistory() async => const Result.success(null);
}

void main() {
  late MockLibraryRepository repository;
  late GetBookmarksUseCase getBookmarksUseCase;

  setUp(() {
    repository = MockLibraryRepository();
    getBookmarksUseCase = GetBookmarksUseCase(repository);
  });

  test('GetBookmarksUseCase returns success', () async {
    final result = await getBookmarksUseCase(const LibraryFilterEntity());
    expect(result.isSuccess, true);
    expect(result.data, isEmpty);
  });
}
