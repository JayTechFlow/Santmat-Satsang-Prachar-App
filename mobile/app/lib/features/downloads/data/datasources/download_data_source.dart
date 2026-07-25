import '../../domain/entities/download_entity.dart';
import '../../domain/entities/download_filter_entity.dart';
import '../../domain/entities/offline_content_entity.dart';
import '../../domain/entities/storage_statistics_entity.dart';

abstract class DownloadDataSource {
  Future<List<DownloadEntity>> getDownloads(DownloadFilterEntity filter);
  Future<void> startDownload(String remoteUrl, String title, String contentType, String categoryId, String? thumbnail);
  Future<void> pauseDownload(String downloadId);
  Future<void> resumeDownload(String downloadId);
  Future<void> cancelDownload(String downloadId);
  Future<void> deleteDownload(String downloadId);
  Future<void> retryDownload(String downloadId);
  Future<void> clearDownloads();
  Future<List<OfflineContentEntity>> getOfflineContent();
  Future<StorageStatisticsEntity> getStorageStatistics();
}
