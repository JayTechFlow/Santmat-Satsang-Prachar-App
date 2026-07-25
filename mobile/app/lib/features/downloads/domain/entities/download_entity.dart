import 'download_category_entity.dart';

class DownloadEntity {
  final String id;
  final String title;
  final String contentType; // 'audio', 'book', 'document', 'image', 'video', 'podcast', 'pdf'
  final DownloadCategoryEntity category;
  final int totalSize;
  final int downloadedSize;
  final double progress; // 0.0 to 1.0
  final String status; // 'pending', 'downloading', 'paused', 'completed', 'failed'
  final int priority;
  final DateTime createdDate;
  final DateTime? completedDate;
  final String? localPathPlaceholder;
  final String remoteUrlPlaceholder;
  final String? thumbnail;

  const DownloadEntity({
    required this.id,
    required this.title,
    required this.contentType,
    required this.category,
    required this.totalSize,
    required this.downloadedSize,
    required this.progress,
    required this.status,
    required this.priority,
    required this.createdDate,
    this.completedDate,
    this.localPathPlaceholder,
    required this.remoteUrlPlaceholder,
    this.thumbnail,
  });

  bool get isCompleted => status == 'completed';
  bool get isDownloading => status == 'downloading';
  bool get isPaused => status == 'paused';
  bool get isFailed => status == 'failed';
}
