import '../../domain/entities/download_entity.dart';
import '../../domain/entities/download_filter_entity.dart';
import '../../domain/entities/offline_content_entity.dart';
import '../../domain/entities/storage_statistics_entity.dart';
import '../../domain/entities/download_category_entity.dart';
import 'download_data_source.dart';

class MockDownloadDataSource implements DownloadDataSource {
  final List<DownloadCategoryEntity> _categories = [
    const DownloadCategoryEntity(id: 'c1', name: 'Satsang'),
    const DownloadCategoryEntity(id: 'c2', name: 'Audio'),
    const DownloadCategoryEntity(id: 'c3', name: 'Books'),
    const DownloadCategoryEntity(id: 'c4', name: 'Quotes'),
  ];

  late List<DownloadEntity> _downloads;
  late StorageStatisticsEntity _storageStats;

  MockDownloadDataSource() {
    _downloads = List.generate(8, (index) {
      final isCompleted = index % 2 == 0;
      final isDownloading = index == 1;
      final isPaused = index == 3;
      final isFailed = index == 5;

      String status = 'pending';
      double progress = 0.0;
      int downloadedSize = 0;
      int totalSize = (index + 1) * 15 * 1024 * 1024; // 15MB to 120MB

      if (isCompleted) {
        status = 'completed';
        progress = 1.0;
        downloadedSize = totalSize;
      } else if (isDownloading) {
        status = 'downloading';
        progress = 0.45;
        downloadedSize = (totalSize * 0.45).toInt();
      } else if (isPaused) {
        status = 'paused';
        progress = 0.70;
        downloadedSize = (totalSize * 0.70).toInt();
      } else if (isFailed) {
        status = 'failed';
        progress = 0.20;
        downloadedSize = (totalSize * 0.20).toInt();
      }

      return DownloadEntity(
        id: 'dl_$index',
        title: 'Spiritual Content $index',
        contentType: index % 3 == 0
            ? 'audio'
            : index % 3 == 1
            ? 'book'
            : 'document',
        category: _categories[index % _categories.length],
        totalSize: totalSize,
        downloadedSize: downloadedSize,
        progress: progress,
        status: status,
        priority: 1,
        createdDate: DateTime.now().subtract(Duration(days: index)),
        completedDate: isCompleted
            ? DateTime.now().subtract(Duration(days: index))
            : null,
        localPathPlaceholder: isCompleted
            ? '/storage/emulated/0/Download/content_$index'
            : null,
        remoteUrlPlaceholder: 'https://example.com/content_$index',
        thumbnail: 'https://picsum.photos/seed/dl_$index/100/100',
      );
    });

    _storageStats = const StorageStatisticsEntity(
      totalSpace: 64 * 1024 * 1024 * 1024, // 64 GB
      freeSpace: 24 * 1024 * 1024 * 1024, // 24 GB
      appUsage: 500 * 1024 * 1024, // 500 MB
      downloadsUsage: 1024 * 1024 * 1024, // 1 GB
      cacheUsage: 200 * 1024 * 1024, // 200 MB
      usageByContentType: {
        'audio': 500 * 1024 * 1024,
        'book': 300 * 1024 * 1024,
        'document': 224 * 1024 * 1024,
      },
    );
  }

  Future<List<DownloadEntity>> getDownloads(DownloadFilterEntity filter) async {
    await Future.delayed(const Duration(milliseconds: 300));
    var results = List<DownloadEntity>.from(_downloads);

    if (filter.status != null) {
      results = results.where((d) => d.status == filter.status).toList();
    }
    if (filter.contentType != null) {
      results = results
          .where((d) => d.contentType == filter.contentType)
          .toList();
    }
    if (filter.categoryId != null) {
      results = results
          .where((d) => d.category.id == filter.categoryId)
          .toList();
    }
    if (filter.searchQuery != null && filter.searchQuery!.isNotEmpty) {
      results = results
          .where(
            (d) => d.title.toLowerCase().contains(
              filter.searchQuery!.toLowerCase(),
            ),
          )
          .toList();
    }

    if (filter.sort != null) {
      switch (filter.sort) {
        case 'newest':
          results.sort((a, b) => b.createdDate.compareTo(a.createdDate));
          break;
        case 'oldest':
          results.sort((a, b) => a.createdDate.compareTo(b.createdDate));
          break;
        case 'largest':
          results.sort((a, b) => b.totalSize.compareTo(a.totalSize));
          break;
        case 'smallest':
          results.sort((a, b) => a.totalSize.compareTo(b.totalSize));
          break;
      }
    } else {
      results.sort((a, b) => b.createdDate.compareTo(a.createdDate));
    }

    return results;
  }

  Future<void> startDownload(
    String remoteUrl,
    String title,
    String contentType,
    String categoryId,
    String? thumbnail,
  ) async {
    await Future.delayed(const Duration(milliseconds: 200));
    final newDownload = DownloadEntity(
      id: 'dl_${DateTime.now().millisecondsSinceEpoch}',
      title: title,
      contentType: contentType,
      category: _categories.firstWhere(
        (c) => c.id == categoryId,
        orElse: () => _categories.first,
      ),
      totalSize: 50 * 1024 * 1024,
      downloadedSize: 0,
      progress: 0.0,
      status: 'downloading',
      priority: 1,
      createdDate: DateTime.now(),
      remoteUrlPlaceholder: remoteUrl,
      thumbnail: thumbnail,
    );
    _downloads.insert(0, newDownload);
  }

  Future<void> pauseDownload(String downloadId) async {
    await Future.delayed(const Duration(milliseconds: 200));
    final index = _downloads.indexWhere((d) => d.id == downloadId);
    if (index != -1) {
      final current = _downloads[index];
      _downloads[index] = DownloadEntity(
        id: current.id,
        title: current.title,
        contentType: current.contentType,
        category: current.category,
        totalSize: current.totalSize,
        downloadedSize: current.downloadedSize,
        progress: current.progress,
        status: 'paused',
        priority: current.priority,
        createdDate: current.createdDate,
        remoteUrlPlaceholder: current.remoteUrlPlaceholder,
        thumbnail: current.thumbnail,
      );
    }
  }

  Future<void> resumeDownload(String downloadId) async {
    await Future.delayed(const Duration(milliseconds: 200));
    final index = _downloads.indexWhere((d) => d.id == downloadId);
    if (index != -1) {
      final current = _downloads[index];
      _downloads[index] = DownloadEntity(
        id: current.id,
        title: current.title,
        contentType: current.contentType,
        category: current.category,
        totalSize: current.totalSize,
        downloadedSize: current.downloadedSize,
        progress: current.progress,
        status: 'downloading',
        priority: current.priority,
        createdDate: current.createdDate,
        remoteUrlPlaceholder: current.remoteUrlPlaceholder,
        thumbnail: current.thumbnail,
      );
    }
  }

  Future<void> cancelDownload(String downloadId) async {
    await Future.delayed(const Duration(milliseconds: 200));
    _downloads.removeWhere((d) => d.id == downloadId);
  }

  Future<void> deleteDownload(String downloadId) async {
    await Future.delayed(const Duration(milliseconds: 200));
    _downloads.removeWhere((d) => d.id == downloadId);
  }

  Future<void> retryDownload(String downloadId) async {
    await Future.delayed(const Duration(milliseconds: 200));
    await resumeDownload(downloadId);
  }

  Future<void> clearDownloads() async {
    await Future.delayed(const Duration(milliseconds: 200));
    _downloads.clear();
  }

  Future<List<OfflineContentEntity>> getOfflineContent() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return _downloads.where((d) => d.isCompleted).map((d) {
      return OfflineContentEntity(
        id: 'off_${d.id}',
        download: d,
        localFilePath: d.localPathPlaceholder!,
        lastAccessed: DateTime.now().subtract(const Duration(days: 1)),
      );
    }).toList();
  }

  Future<StorageStatisticsEntity> getStorageStatistics() async {
    await Future.delayed(const Duration(milliseconds: 200));
    return _storageStats;
  }
}
