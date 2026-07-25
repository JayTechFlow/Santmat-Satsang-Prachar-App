import '../../domain/entities/download_entity.dart';
import '../../domain/entities/download_filter_entity.dart';

class DownloadsState {
  final bool isLoading;
  final String? error;
  final List<DownloadEntity> activeDownloads;
  final List<DownloadEntity> completedDownloads;
  final DownloadFilterEntity filter;

  const DownloadsState({
    this.isLoading = false,
    this.error,
    this.activeDownloads = const [],
    this.completedDownloads = const [],
    this.filter = const DownloadFilterEntity(),
  });

  DownloadsState copyWith({
    bool? isLoading,
    String? error,
    List<DownloadEntity>? activeDownloads,
    List<DownloadEntity>? completedDownloads,
    DownloadFilterEntity? filter,
  }) {
    return DownloadsState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      activeDownloads: activeDownloads ?? this.activeDownloads,
      completedDownloads: completedDownloads ?? this.completedDownloads,
      filter: filter ?? this.filter,
    );
  }
}
