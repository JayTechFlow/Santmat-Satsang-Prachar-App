import '../../../../core/utils/result.dart';
import '../entities/download_entity.dart';
import '../entities/download_filter_entity.dart';
import '../entities/offline_content_entity.dart';
import '../entities/storage_statistics_entity.dart';

abstract class DownloadRepository {
  Future<Result<List<DownloadEntity>>> getDownloads(
    DownloadFilterEntity filter,
  );
  Future<Result<void>> startDownload(
    String remoteUrl,
    String title,
    String contentType,
    String categoryId,
    String? thumbnail,
  );
  Future<Result<void>> pauseDownload(String downloadId);
  Future<Result<void>> resumeDownload(String downloadId);
  Future<Result<void>> cancelDownload(String downloadId);
  Future<Result<void>> deleteDownload(String downloadId);
  Future<Result<void>> retryDownload(String downloadId);
  Future<Result<void>> clearDownloads();
  Future<Result<List<OfflineContentEntity>>> getOfflineContent();
  Future<Result<StorageStatisticsEntity>> getStorageStatistics();
}
