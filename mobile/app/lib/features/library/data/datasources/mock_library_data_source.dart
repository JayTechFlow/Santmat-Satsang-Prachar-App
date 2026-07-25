import '../../domain/entities/library_item_entity.dart';
import '../../domain/entities/bookmark_entity.dart';
import '../../domain/entities/favorite_entity.dart';
import '../../domain/entities/history_entity.dart';
import '../../domain/entities/recent_activity_entity.dart';
import '../../domain/entities/library_filter_entity.dart';

import 'library_data_source.dart';

class MockLibraryDataSource implements LibraryDataSource {
  late List<LibraryItemEntity> _allItems;
  late List<BookmarkEntity> _bookmarks;
  late List<FavoriteEntity> _favorites;
  late List<HistoryEntity> _history;
  late List<RecentActivityEntity> _recentActivities;

  MockLibraryDataSource() {
    _allItems = List.generate(15, (index) {
      final contentType = [
        'audio',
        'book',
        'satsang',
        'quote',
        'event',
      ][index % 5];
      final routePrefix = contentType == 'audio'
          ? '/audio'
          : contentType == 'book'
          ? '/books'
          : contentType == 'satsang'
          ? '/satsang'
          : contentType == 'quote'
          ? '/daily-quotes'
          : '/events';
      return LibraryItemEntity(
        id: 'item_$index',
        contentId: 'cid_$index',
        contentType: contentType,
        title: '${contentType.toUpperCase()} Item $index',
        subtitle: 'Subtitle for item $index',
        thumbnail: 'https://picsum.photos/seed/lib_$index/150/150',
        category: 'Spiritual',
        author: 'Maharaj Ji',
        createdDate: DateTime.now().subtract(Duration(days: index * 2)),
        lastOpened: DateTime.now().subtract(Duration(hours: index * 3)),
        sourceModule: contentType,
        route: '$routePrefix/details/cid_$index',
        isFavorite: index % 3 == 0,
        isBookmarked: index % 4 == 0,
        progress: index % 2 == 0 ? 0.45 : null,
      );
    });

    _bookmarks = _allItems
        .where((item) => item.isBookmarked)
        .map(
          (item) => BookmarkEntity(
            id: 'bm_${item.id}',
            item: item,
            bookmarkedDate: DateTime.now().subtract(const Duration(days: 1)),
          ),
        )
        .toList();

    _favorites = _allItems
        .where((item) => item.isFavorite)
        .map(
          (item) => FavoriteEntity(
            id: 'fav_${item.id}',
            item: item,
            favoritedDate: DateTime.now().subtract(const Duration(days: 2)),
          ),
        )
        .toList();

    _history = _allItems
        .take(10)
        .map(
          (item) => HistoryEntity(
            id: 'hist_${item.id}',
            item: item,
            accessedDate: item.lastOpened ?? DateTime.now(),
            sessionProgress: item.progress,
          ),
        )
        .toList();

    _recentActivities = _history
        .take(5)
        .map(
          (h) => RecentActivityEntity(
            id: 'act_${h.item.id}',
            item: h.item,
            activityDate: h.accessedDate,
            activityType: h.item.contentType == 'book'
                ? 'read'
                : h.item.contentType == 'audio'
                ? 'listened'
                : 'viewed',
          ),
        )
        .toList();
  }

  @override
  Future<List<BookmarkEntity>> getBookmarks(LibraryFilterEntity filter) async {
    await Future.delayed(const Duration(milliseconds: 300));
    var res = List<BookmarkEntity>.from(_bookmarks);
    if (filter.contentType != null) {
      res = res.where((b) => b.item.contentType == filter.contentType).toList();
    }
    return res;
  }

  @override
  Future<List<FavoriteEntity>> getFavorites(LibraryFilterEntity filter) async {
    await Future.delayed(const Duration(milliseconds: 300));
    var res = List<FavoriteEntity>.from(_favorites);
    if (filter.contentType != null) {
      res = res.where((f) => f.item.contentType == filter.contentType).toList();
    }
    return res;
  }

  @override
  Future<List<HistoryEntity>> getHistory(LibraryFilterEntity filter) async {
    await Future.delayed(const Duration(milliseconds: 300));
    var res = List<HistoryEntity>.from(_history);
    if (filter.contentType != null) {
      res = res.where((h) => h.item.contentType == filter.contentType).toList();
    }
    res.sort((a, b) => b.accessedDate.compareTo(a.accessedDate));
    return res;
  }

  @override
  Future<List<RecentActivityEntity>> getRecentActivities() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return _recentActivities;
  }

  @override
  Future<void> addBookmark(String contentId, String contentType) async {
    await Future.delayed(const Duration(milliseconds: 200));
    final item = _allItems.firstWhere(
      (i) => i.contentId == contentId && i.contentType == contentType,
      orElse: () => _allItems.first,
    );
    if (!_bookmarks.any((b) => b.item.contentId == contentId)) {
      _bookmarks.add(
        BookmarkEntity(
          id: 'bm_${item.id}',
          item: item,
          bookmarkedDate: DateTime.now(),
        ),
      );
    }
  }

  @override
  Future<void> removeBookmark(String contentId, String contentType) async {
    await Future.delayed(const Duration(milliseconds: 200));
    _bookmarks.removeWhere(
      (b) => b.item.contentId == contentId && b.item.contentType == contentType,
    );
  }

  @override
  Future<void> toggleFavorite(String contentId, String contentType) async {
    await Future.delayed(const Duration(milliseconds: 200));
    final exists = _favorites.any(
      (f) => f.item.contentId == contentId && f.item.contentType == contentType,
    );
    if (exists) {
      _favorites.removeWhere(
        (f) =>
            f.item.contentId == contentId && f.item.contentType == contentType,
      );
    } else {
      final item = _allItems.firstWhere(
        (i) => i.contentId == contentId && i.contentType == contentType,
        orElse: () => _allItems.first,
      );
      _favorites.add(
        FavoriteEntity(
          id: 'fav_${item.id}',
          item: item,
          favoritedDate: DateTime.now(),
        ),
      );
    }
  }

  @override
  Future<void> addHistoryItem(
    String contentId,
    String contentType,
    double? progress,
  ) async {
    await Future.delayed(const Duration(milliseconds: 200));
    final item = _allItems.firstWhere(
      (i) => i.contentId == contentId && i.contentType == contentType,
      orElse: () => _allItems.first,
    );

    _history.removeWhere(
      (h) => h.item.contentId == contentId && h.item.contentType == contentType,
    );
    _history.add(
      HistoryEntity(
        id: 'hist_${item.id}',
        item: item,
        accessedDate: DateTime.now(),
        sessionProgress: progress,
      ),
    );
  }

  @override
  Future<void> deleteHistoryItem(String historyId) async {
    await Future.delayed(const Duration(milliseconds: 200));
    _history.removeWhere((h) => h.id == historyId);
  }

  @override
  Future<void> clearHistory() async {
    await Future.delayed(const Duration(milliseconds: 200));
    _history.clear();
  }
}
