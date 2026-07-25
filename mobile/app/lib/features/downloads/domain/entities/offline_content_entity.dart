import 'download_entity.dart';

class OfflineContentEntity {
  final String id;
  final DownloadEntity download;
  final String localFilePath;
  final DateTime lastAccessed;

  const OfflineContentEntity({
    required this.id,
    required this.download,
    required this.localFilePath,
    required this.lastAccessed,
  });
}
