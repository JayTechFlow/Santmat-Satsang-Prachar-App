import 'package:flutter/material.dart';
import '../../domain/entities/download_entity.dart';
import '../../../../shared/theme/app_spacing.dart';
import '../../../../shared/theme/app_radius.dart';
import 'package:santmat_satsang_prachar/shared/widgets/ssp_image.dart';


class DownloadCard extends StatelessWidget {
  final DownloadEntity download;
  final VoidCallback? onPause;
  final VoidCallback? onResume;
  final VoidCallback? onCancel;
  final VoidCallback? onRetry;
  final VoidCallback? onDelete;
  final VoidCallback onTap;

  const DownloadCard({
    super.key,
    required this.download,
    this.onPause,
    this.onResume,
    this.onCancel,
    this.onRetry,
    this.onDelete,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.sp8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: Padding(
          padding: AppSpacing.p16,
          child: Row(
            children: [
              if (download.thumbnail != null)
                ClipRRect(
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                  child: SSPImage(
                    download.thumbnail!,
                    width: 60,
                    height: 60,
                    fit: BoxFit.cover,
                  ),
                )
              else
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                  ),
                  child: Icon(
                    download.contentType == 'audio'
                        ? Icons.audio_file
                        : download.contentType == 'book'
                        ? Icons.book
                        : Icons.insert_drive_file,
                    color: theme.colorScheme.primary,
                  ),
                ),
              const SizedBox(width: AppSpacing.sp16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      download.title,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: AppSpacing.sp4),
                    if (!download.isCompleted) ...[
                      LinearProgressIndicator(
                        value: download.progress,
                        backgroundColor:
                            theme.colorScheme.surfaceContainerHighest,
                      ),
                      const SizedBox(height: AppSpacing.sp4),
                    ],
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          _formatSize(
                                download.isCompleted
                                    ? download.totalSize
                                    : download.downloadedSize,
                              ) +
                              (download.isCompleted
                                  ? ''
                                  : ' / ${_formatSize(download.totalSize)}'),
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: Colors.grey,
                          ),
                        ),
                        _buildStatusBadge(context),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: AppSpacing.sp8),
              _buildActionButtons(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(BuildContext context) {
    Color color;
    String text;
    switch (download.status) {
      case 'completed':
        color = Colors.green;
        text = 'Completed';
        break;
      case 'downloading':
        color = Theme.of(context).colorScheme.primary;
        text = '${(download.progress * 100).toStringAsFixed(0)}%';
        break;
      case 'paused':
        color = Colors.orange;
        text = 'Paused';
        break;
      case 'failed':
        color = Colors.red;
        text = 'Failed';
        break;
      default:
        color = Colors.grey;
        text = 'Pending';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withAlpha(30),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withAlpha(100)),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildActionButtons() {
    if (download.isCompleted) {
      return IconButton(
        icon: const Icon(Icons.delete_outline, color: Colors.red),
        onPressed: onDelete,
      );
    } else if (download.isDownloading) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(icon: const Icon(Icons.pause), onPressed: onPause),
          IconButton(icon: const Icon(Icons.close), onPressed: onCancel),
        ],
      );
    } else if (download.isPaused) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(icon: const Icon(Icons.play_arrow), onPressed: onResume),
          IconButton(icon: const Icon(Icons.close), onPressed: onCancel),
        ],
      );
    } else if (download.isFailed) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: onRetry),
          IconButton(icon: const Icon(Icons.close), onPressed: onCancel),
        ],
      );
    }
    return const SizedBox();
  }

  String _formatSize(int bytes) {
    if (bytes < 1024 * 1024) {
      return '${(bytes / 1024).toStringAsFixed(1)} KB';
    }
    return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
  }
}
