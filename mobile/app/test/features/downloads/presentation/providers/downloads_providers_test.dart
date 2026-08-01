import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:santmat_satsang_prachar/features/downloads/presentation/providers/downloads_providers.dart';
import 'package:santmat_satsang_prachar/features/downloads/data/datasources/mock_download_data_source.dart';
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';

void main() {
  test('DownloadsNotifier loads data correctly', () async {
    final container = ProviderContainer(
      overrides: [
        downloadDataSourceProvider.overrideWithValue(MockDownloadDataSource()),
      ],
    );
    addTearDown(container.dispose);

    var state = container.read(downloadsProvider);
    expect(state.isLoading, true);

    await container.read(downloadsProvider.notifier).loadData();
    state = container.read(downloadsProvider);

    expect(state.isLoading, false);
    expect(state.error, isNull);
    expect(state.activeDownloads, isNotEmpty);
    expect(state.completedDownloads, isNotEmpty);
  });
}
