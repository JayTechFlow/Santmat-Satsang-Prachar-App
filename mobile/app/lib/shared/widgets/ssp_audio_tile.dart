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
            // Thumbnail with Play Overlay & Duration
            ClipRRect(
              borderRadius: AppRadius.borderRadiusMd,
              child: SizedBox(
                width: 100,
                height: 56,
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
                    const Center(
                      child: Icon(
                        Icons.play_circle_fill_rounded,
                        color: Colors.white,
                        size: 28,
                      ),
                    ),
                    Positioned(
                      bottom: 4,
                      right: 4,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 4,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.7),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          duration,
                          style: AppTypography.labelSmall.copyWith(
                            color: Colors.white,
                            fontSize: 10,
                          ),
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
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary(context),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  AppSpacing.verticalSpaceXs,
                  Text(
                    subtitle,
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textSecondary(context),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),

            AppSpacing.horizontalSpaceSm,

            // Play Button Action
            if (onPlayTap != null)
              GestureDetector(
                onTap: onPlayTap,
                child: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: const BoxDecoration(
                    color: AppColors.deepSaffron,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.play_arrow_rounded,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
              ),

            // More Menu
            if (onMoreTap != null)
              IconButton(
                icon: const Icon(AppIcons.more),
                color: AppColors.textSecondary(context),
                onPressed: onMoreTap,
                visualDensity: VisualDensity.compact,
              ),
          ],
        ),
      ),
    );
  }
}
