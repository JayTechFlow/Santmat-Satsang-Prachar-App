import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/features/downloads/data/datasources/mock_download_data_source.dart';
import 'package:santmat_satsang_prachar/features/downloads/data/repositories/download_repository_impl.dart';
import 'package:santmat_satsang_prachar/features/downloads/domain/entities/download_filter_entity.dart';

void main() {
  late MockDownloadDataSource dataSource;
  late DownloadRepositoryImpl repository;

  setUp(() {
    dataSource = MockDownloadDataSource();
    repository = DownloadRepositoryImpl(dataSource);
  });

  test('getDownloads returns Result.success', () async {
    final result = await repository.getDownloads(const DownloadFilterEntity());
    expect(result.isSuccess, true);
    expect(result.data, isNotEmpty);
  });

  test('startDownload adds a new download', () async {
    final before = await repository.getDownloads(const DownloadFilterEntity());
    final beforeCount = before.data!.length;

    final result = await repository.startDownload(
      'url',
      'test title',
      'audio',
      'c1',
      null,
    );
    expect(result.isSuccess, true);

    final after = await repository.getDownloads(const DownloadFilterEntity());
    expect(after.data!.length, beforeCount + 1);
  });
}
