import '../../../../core/utils/result.dart';
import '../../domain/entities/download_entity.dart';
import '../../domain/entities/download_filter_entity.dart';
import '../../domain/entities/offline_content_entity.dart';
import '../../domain/entities/storage_statistics_entity.dart';
import '../../domain/repositories/download_repository.dart';
import '../datasources/download_data_source.dart';

class DownloadRepositoryImpl implements DownloadRepository {
  final DownloadDataSource dataSource;

  DownloadRepositoryImpl(this.dataSource);

  @override
  Future<Result<List<DownloadEntity>>> getDownloads(
    DownloadFilterEntity filter,
  ) async {
    try {
      final res = await dataSource.getDownloads(filter);
      return Result.success(res);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<void>> startDownload(
    String remoteUrl,
    String title,
    String contentType,
    String categoryId,
    String? thumbnail,
  ) async {
    try {
      await dataSource.startDownload(
        remoteUrl,
        title,
        contentType,
        categoryId,
        thumbnail,
      );
      return const Result.success(null);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<void>> pauseDownload(String downloadId) async {
    try {
      await dataSource.pauseDownload(downloadId);
      return const Result.success(null);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<void>> resumeDownload(String downloadId) async {
    try {
      await dataSource.resumeDownload(downloadId);
      return const Result.success(null);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<void>> cancelDownload(String downloadId) async {
    try {
      await dataSource.cancelDownload(downloadId);
      return const Result.success(null);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<void>> deleteDownload(String downloadId) async {
    try {
      await dataSource.deleteDownload(downloadId);
      return const Result.success(null);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<void>> retryDownload(String downloadId) async {
    try {
      await dataSource.retryDownload(downloadId);
      return const Result.success(null);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<void>> clearDownloads() async {
    try {
      await dataSource.clearDownloads();
      return const Result.success(null);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<List<OfflineContentEntity>>> getOfflineContent() async {
    try {
      final res = await dataSource.getOfflineContent();
      return Result.success(res);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<StorageStatisticsEntity>> getStorageStatistics() async {
    try {
      final res = await dataSource.getStorageStatistics();
      return Result.success(res);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }
}
