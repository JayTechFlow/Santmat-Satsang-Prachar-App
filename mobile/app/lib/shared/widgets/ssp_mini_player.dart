import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';

class SSPMiniPlayer extends StatelessWidget {
  final String title;
  final String subtitle;
  final String imageUrl;
  final String durationText;
  final Color themeColor;
  final VoidCallback onPlay;

  const SSPMiniPlayer({
    super.key,
    required this.title,
    required this.subtitle,
    required this.imageUrl,
    required this.durationText,
    required this.themeColor,
    required this.onPlay,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: AppSpacing.paddingAllLg,
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: AppRadius.borderRadiusLg,
        boxShadow: [
          BoxShadow(
            color: themeColor.withValues(alpha: 0.1),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: AppRadius.borderRadiusMd,
                child: Image.network(
                  imageUrl,
                  width: 72,
                  height: 72,
                  fit: BoxFit.cover,
                  errorBuilder: (ctx, err, stack) => Container(
                    width: 72,
                    height: 72,
                    color: Theme.of(
                      context,
                    ).colorScheme.surfaceContainerHighest,
                    child: const Icon(Icons.music_note),
                  ),
                ),
              ),
              AppSpacing.horizontalSpaceMd,
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: AppTypography.titleMedium.copyWith(
                        fontWeight: FontWeight.bold,
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
            ],
          ),
          AppSpacing.verticalSpaceLg,
          Row(
            children: [
              GestureDetector(
                onTap: onPlay,
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: themeColor,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.play_arrow_rounded,
                    color: Colors.white,
                    size: 32,
                  ),
                ),
              ),
              AppSpacing.horizontalSpaceMd,
              Expanded(
                child: Column(
                  children: [
                    Container(
                      height: 4,
                      decoration: BoxDecoration(
                        color: themeColor.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(2),
                      ),
                      alignment: Alignment.centerLeft,
                      child: Container(
                        width: 30, // Mock progress
                        height: 4,
                        decoration: BoxDecoration(
                          color: themeColor,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    AppSpacing.verticalSpaceXs,
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '00:00',
                          style: AppTypography.labelSmall.copyWith(
                            color: AppColors.textSecondary(context),
                          ),
                        ),
                        Text(
                          durationText,
                          style: AppTypography.labelSmall.copyWith(
                            color: AppColors.textSecondary(context),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
