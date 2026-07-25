import '../../../../core/utils/result.dart';
import '../entities/download_entity.dart';
import '../entities/download_filter_entity.dart';
import '../entities/offline_content_entity.dart';
import '../entities/storage_statistics_entity.dart';
import '../repositories/download_repository.dart';

class GetDownloadsUseCase {
  final DownloadRepository repository;
  GetDownloadsUseCase(this.repository);
  Future<Result<List<DownloadEntity>>> call(DownloadFilterEntity filter) =>
      repository.getDownloads(filter);
}

class StartDownloadUseCase {
  final DownloadRepository repository;
  StartDownloadUseCase(this.repository);
  Future<Result<void>> call(
    String remoteUrl,
    String title,
    String contentType,
    String categoryId, {
    String? thumbnail,
  }) => repository.startDownload(
    remoteUrl,
    title,
    contentType,
    categoryId,
    thumbnail,
  );
}

class PauseDownloadUseCase {
  final DownloadRepository repository;
  PauseDownloadUseCase(this.repository);
  Future<Result<void>> call(String downloadId) =>
      repository.pauseDownload(downloadId);
}

class ResumeDownloadUseCase {
  final DownloadRepository repository;
  ResumeDownloadUseCase(this.repository);
  Future<Result<void>> call(String downloadId) =>
      repository.resumeDownload(downloadId);
}

class CancelDownloadUseCase {
  final DownloadRepository repository;
  CancelDownloadUseCase(this.repository);
  Future<Result<void>> call(String downloadId) =>
      repository.cancelDownload(downloadId);
}

class DeleteDownloadUseCase {
  final DownloadRepository repository;
  DeleteDownloadUseCase(this.repository);
  Future<Result<void>> call(String downloadId) =>
      repository.deleteDownload(downloadId);
}

class RetryDownloadUseCase {
  final DownloadRepository repository;
  RetryDownloadUseCase(this.repository);
  Future<Result<void>> call(String downloadId) =>
      repository.retryDownload(downloadId);
}

class ClearDownloadsUseCase {
  final DownloadRepository repository;
  ClearDownloadsUseCase(this.repository);
  Future<Result<void>> call() => repository.clearDownloads();
}

class GetOfflineContentUseCase {
  final DownloadRepository repository;
  GetOfflineContentUseCase(this.repository);
  Future<Result<List<OfflineContentEntity>>> call() =>
      repository.getOfflineContent();
}

class GetStorageStatisticsUseCase {
  final DownloadRepository repository;
  GetStorageStatisticsUseCase(this.repository);
  Future<Result<StorageStatisticsEntity>> call() =>
      repository.getStorageStatistics();
}
