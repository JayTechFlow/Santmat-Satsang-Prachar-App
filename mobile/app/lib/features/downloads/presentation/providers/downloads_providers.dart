import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/usecases/download_usecases.dart';
import '../../domain/entities/download_filter_entity.dart';
import '../../domain/entities/storage_statistics_entity.dart';
import 'downloads_state.dart';

import 'package:santmat_satsang_prachar/core/di/data_providers.dart';

final getDownloadsUseCaseProvider = Provider(
  (ref) => GetDownloadsUseCase(ref.watch(downloadRepositoryProvider)),
);
final startDownloadUseCaseProvider = Provider(
  (ref) => StartDownloadUseCase(ref.watch(downloadRepositoryProvider)),
);
final pauseDownloadUseCaseProvider = Provider(
  (ref) => PauseDownloadUseCase(ref.watch(downloadRepositoryProvider)),
);
final resumeDownloadUseCaseProvider = Provider(
  (ref) => ResumeDownloadUseCase(ref.watch(downloadRepositoryProvider)),
);
final cancelDownloadUseCaseProvider = Provider(
  (ref) => CancelDownloadUseCase(ref.watch(downloadRepositoryProvider)),
);
final deleteDownloadUseCaseProvider = Provider(
  (ref) => DeleteDownloadUseCase(ref.watch(downloadRepositoryProvider)),
);
final retryDownloadUseCaseProvider = Provider(
  (ref) => RetryDownloadUseCase(ref.watch(downloadRepositoryProvider)),
);
final clearDownloadsUseCaseProvider = Provider(
  (ref) => ClearDownloadsUseCase(ref.watch(downloadRepositoryProvider)),
);
final getStorageStatisticsUseCaseProvider = Provider(
  (ref) => GetStorageStatisticsUseCase(ref.watch(downloadRepositoryProvider)),
);

class DownloadsNotifier extends Notifier<DownloadsState> {
  bool _mounted = true;

  @override
  DownloadsState build() {
    ref.onDispose(() => _mounted = false);
    Future.microtask(() {
      if (_mounted) loadData();
    });
    return const DownloadsState(isLoading: true);
  }

  Future<void> loadData() async {
    if (!_mounted) return;
    state = state.copyWith(isLoading: true, error: null);

    try {
      final getDownloads = ref.read(getDownloadsUseCaseProvider);

      final activeRes = await getDownloads(
        const DownloadFilterEntity(status: 'downloading'),
      );
      // Adding paused and failed to active as well for UI grouping
      final pausedRes = await getDownloads(
        const DownloadFilterEntity(status: 'paused'),
      );
      final failedRes = await getDownloads(
        const DownloadFilterEntity(status: 'failed'),
      );

      final completedRes = await getDownloads(
        const DownloadFilterEntity(status: 'completed'),
      );

      if (!_mounted) return;

      if (activeRes.isError) throw Exception(activeRes.error);
      if (completedRes.isError) throw Exception(completedRes.error);

      state = state.copyWith(
        isLoading: false,
        activeDownloads: [
          ...activeRes.data!,
          ...pausedRes.data ?? [],
          ...failedRes.data ?? [],
        ],
        completedDownloads: completedRes.data,
      );
    } catch (e) {
      if (_mounted) {
        state = state.copyWith(isLoading: false, error: e.toString());
      }
    }
  }

  void updateFilter(DownloadFilterEntity newFilter) {
    state = state.copyWith(filter: newFilter);
    loadData();
  }

  Future<void> pause(String id) async {
    await ref.read(pauseDownloadUseCaseProvider).call(id);
    await loadData();
  }

  Future<void> resume(String id) async {
    await ref.read(resumeDownloadUseCaseProvider).call(id);
    await loadData();
  }

  Future<void> cancel(String id) async {
    await ref.read(cancelDownloadUseCaseProvider).call(id);
    await loadData();
  }

  Future<void> retry(String id) async {
    await ref.read(retryDownloadUseCaseProvider).call(id);
    await loadData();
  }

  Future<void> delete(String id) async {
    await ref.read(deleteDownloadUseCaseProvider).call(id);
    await loadData();
  }
}

final downloadsProvider = NotifierProvider<DownloadsNotifier, DownloadsState>(
  DownloadsNotifier.new,
);

final storageStatisticsProvider = FutureProvider<StorageStatisticsEntity>((
  ref,
) async {
  final getStats = ref.read(getStorageStatisticsUseCaseProvider);
  final res = await getStats();
  if (res.isError) throw Exception(res.error);
  return res.data!;
});
