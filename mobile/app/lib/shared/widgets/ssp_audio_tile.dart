import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';
import '../theme/app_icons.dart';

class SSPAudioTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final String imageUrl;
  final String duration;
  final VoidCallback onTap;
  final VoidCallback? onPlayTap;
  final VoidCallback? onMoreTap;

  const SSPAudioTile({
    super.key,
    required this.title,
    required this.subtitle,
    required this.imageUrl,
    required this.duration,
    required this.onTap,
    this.onPlayTap,
    this.onMoreTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: AppRadius.borderRadiusLg,
      child: Padding(
        padding: const EdgeInsets.symmetric(
          vertical: AppSpacing.sm,
          horizontal: AppSpacing.md,
        ),
        child: Row(
          children: [
            // Thumbnail with Play Overlay
            ClipRRect(
              borderRadius: AppRadius.borderRadiusMd,
              child: SizedBox(
                width: 64,
                height: 64,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.network(
                      imageUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => Container(
                        color: Theme.of(
                          context,
                        ).colorScheme.surfaceContainerHighest,
                        child: const Icon(AppIcons.library, size: 24),
                      ),
                    ),
                    Container(color: Colors.black.withValues(alpha: 0.2)),
                    if (onPlayTap != null)
                      Center(
                        child: GestureDetector(
                          onTap: onPlayTap,
                          child: const Icon(
                            AppIcons.play,
                            color: Colors.white,
                            size: 28,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
            AppSpacing.horizontalSpaceMd,

            // Details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppTypography.titleMedium.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  AppSpacing.verticalSpaceXs,
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          subtitle,
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textSecondary(context),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      AppSpacing.horizontalSpaceSm,
                      // Duration Chip
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: Theme.of(
                            context,
                          ).colorScheme.surfaceContainerHighest,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          duration,
                          style: AppTypography.labelSmall.copyWith(
                            color: AppColors.textSecondary(context),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // More Menu
            if (onMoreTap != null)
              IconButton(
                icon: const Icon(AppIcons.more),
                color: AppColors.textSecondary(context),
                onPressed: onMoreTap,
              ),
          ],
        ),
      ),
    );
  }
}
