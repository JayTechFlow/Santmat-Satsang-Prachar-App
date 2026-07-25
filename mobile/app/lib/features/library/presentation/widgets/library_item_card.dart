import 'package:flutter/material.dart';
import '../../domain/entities/library_item_entity.dart';
import '../../../../shared/theme/app_spacing.dart';
import '../../../../shared/theme/app_radius.dart';

class LibraryItemCard extends StatelessWidget {
  final LibraryItemEntity item;
  final VoidCallback onTap;
  final VoidCallback? onFavoriteToggle;
  final VoidCallback? onBookmarkToggle;
  final VoidCallback? onDelete;

  const LibraryItemCard({
    super.key,
    required this.item,
    required this.onTap,
    this.onFavoriteToggle,
    this.onBookmarkToggle,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: Padding(
          padding: AppSpacing.paddingAllMd,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(AppRadius.sm),
                child: Image.network(
                  item.thumbnail,
                  width: 70,
                  height: 70,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Container(
                    width: 70,
                    height: 70,
                    color: theme.colorScheme.surfaceContainerHighest,
                    child: Icon(Icons.image, color: theme.colorScheme.primary),
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _buildContentTypeChip(context),
                        if (onDelete != null)
                          GestureDetector(
                            onTap: onDelete,
                            child: const Icon(Icons.close, size: 18, color: Colors.grey),
                          ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      item.title,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      item.subtitle,
                      style: theme.textTheme.bodySmall,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (item.progress != null) ...[
                      const SizedBox(height: AppSpacing.sm),
                      LinearProgressIndicator(
                        value: item.progress,
                        backgroundColor: theme.colorScheme.surfaceContainerHighest,
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Column(
                children: [
                  if (onFavoriteToggle != null)
                    IconButton(
                      icon: Icon(
                        item.isFavorite ? Icons.favorite : Icons.favorite_border,
                        color: item.isFavorite ? Colors.red : Colors.grey,
                      ),
                      onPressed: onFavoriteToggle,
                    ),
                  if (onBookmarkToggle != null)
                    IconButton(
                      icon: Icon(
                        item.isBookmarked ? Icons.bookmark : Icons.bookmark_border,
                        color: item.isBookmarked ? theme.colorScheme.primary : Colors.grey,
                      ),
                      onPressed: onBookmarkToggle,
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildContentTypeChip(BuildContext context) {
    Color color;
    IconData icon;
    
    switch (item.contentType) {
      case 'audio':
        color = Colors.blue;
        icon = Icons.headset;
        break;
      case 'book':
        color = Colors.orange;
        icon = Icons.book;
        break;
      case 'satsang':
        color = Colors.purple;
        icon = Icons.people;
        break;
      case 'quote':
        color = Colors.green;
        icon = Icons.format_quote;
        break;
      case 'event':
        color = Colors.red;
        icon = Icons.event;
        break;
      default:
        color = Colors.grey;
        icon = Icons.folder;
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 12, color: color),
        const SizedBox(width: 4),
        Text(
          item.contentType.toUpperCase(),
          style: TextStyle(fontSize: 10, color: color, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}
