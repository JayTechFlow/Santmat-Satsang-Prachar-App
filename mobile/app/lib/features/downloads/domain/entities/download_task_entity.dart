import 'download_entity.dart';

class DownloadTaskEntity {
  final String taskId;
  final DownloadEntity download;
  final int retryCount;
  final String? errorMessage;

  const DownloadTaskEntity({
    required this.taskId,
    required this.download,
    this.retryCount = 0,
    this.errorMessage,
  });
}
