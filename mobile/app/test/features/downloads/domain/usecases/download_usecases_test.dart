import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/utils/result.dart';
import 'package:santmat_satsang_prachar/features/downloads/domain/entities/download_entity.dart';
import 'package:santmat_satsang_prachar/features/downloads/domain/entities/download_filter_entity.dart';
import 'package:santmat_satsang_prachar/features/downloads/domain/entities/offline_content_entity.dart';
import 'package:santmat_satsang_prachar/features/downloads/domain/entities/storage_statistics_entity.dart';
import 'package:santmat_satsang_prachar/features/downloads/domain/repositories/download_repository.dart';
import 'package:santmat_satsang_prachar/features/downloads/domain/usecases/download_usecases.dart';

class MockDownloadRepository implements DownloadRepository {
  @override
  Future<Result<List<DownloadEntity>>> getDownloads(
    DownloadFilterEntity filter,
  ) async => const Result.success([]);
  @override
  Future<Result<void>> startDownload(
    String remoteUrl,
    String title,
    String contentType,
    String categoryId,
    String? thumbnail,
  ) async => const Result.success(null);
  @override
  Future<Result<void>> pauseDownload(String downloadId) async =>
      const Result.success(null);
  @override
  Future<Result<void>> resumeDownload(String downloadId) async =>
      const Result.success(null);
  @override
  Future<Result<void>> cancelDownload(String downloadId) async =>
      const Result.success(null);
  @override
  Future<Result<void>> deleteDownload(String downloadId) async =>
      const Result.success(null);
  @override
  Future<Result<void>> retryDownload(String downloadId) async =>
      const Result.success(null);
  @override
  Future<Result<void>> clearDownloads() async => const Result.success(null);
  @override
  Future<Result<List<OfflineContentEntity>>> getOfflineContent() async =>
      const Result.success([]);
  @override
  Future<Result<StorageStatisticsEntity>> getStorageStatistics() async =>
      throw UnimplementedError();
}

void main() {
  late MockDownloadRepository repository;
  late GetDownloadsUseCase getDownloadsUseCase;

  setUp(() {
    repository = MockDownloadRepository();
    getDownloadsUseCase = GetDownloadsUseCase(repository);
  });

  test('GetDownloadsUseCase returns success', () async {
    final result = await getDownloadsUseCase(const DownloadFilterEntity());
    expect(result.isSuccess, true);
    expect(result.data, isEmpty);
  });
}
