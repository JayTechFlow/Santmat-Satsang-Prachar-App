import 'package:flutter/material.dart';
import '../../../../shared/theme/app_spacing.dart';
import '../../../../shared/theme/app_radius.dart';
import '../../domain/entities/reading_progress_entity.dart';

class ContinueReadingCard extends StatelessWidget {
  final ReadingProgressEntity progress;
  final VoidCallback onTap;

  const ContinueReadingCard({
    super.key,
    required this.progress,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final book = progress.book;
    return Card(
      margin: const EdgeInsets.only(
        bottom: AppSpacing.md,
        left: AppSpacing.md,
        right: AppSpacing.md,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: Padding(
          padding: AppSpacing.paddingAllMd,
          child: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(AppRadius.sm),
                child: Image.network(
                  book.thumbnailUrl,
                  width: 50,
                  height: 75,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    width: 50,
                    height: 75,
                    color: Colors.grey.shade300,
                    child: const Icon(Icons.book),
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      book.title,
                      style: Theme.of(context).textTheme.titleMedium,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      'Page ${progress.lastReadPage} of ${book.pageCount}',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    LinearProgressIndicator(
                      value: progress.percentage,
                      borderRadius: BorderRadius.circular(AppRadius.xs),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Icon(
                Icons.play_circle_fill,
                size: 32,
                color: Theme.of(context).colorScheme.primary,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
