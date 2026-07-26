import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';
import '../theme/app_icons.dart';
import '../theme/app_animations.dart';

class SSPAudioTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final String duration;
  final String? imageUrl;
  final bool isPlaying;
  final VoidCallback onTap;
  final VoidCallback? onPlayPause;
  final VoidCallback? onFavorite;

  const SSPAudioTile({
    super.key,
    required this.title,
    required this.subtitle,
    required this.duration,
    this.imageUrl,
    this.isPlaying = false,
    required this.onTap,
    this.onPlayPause,
    this.onFavorite,
  });

  @override
  Widget build(BuildContext context) {
    return SSPPressable(
      onTap: onTap,
      scaleDown: 0.98,
      child: Container(
        padding: AppSpacing.p12,
        margin: const EdgeInsets.symmetric(horizontal: AppSpacing.sp16, vertical: AppSpacing.sp4),
        decoration: BoxDecoration(
          color: AppColors.surface(context),
          borderRadius: AppRadius.brLg,
          border: Border.all(color: AppColors.border(context)),
        ),
        child: Row(
          children: [
            // Artwork
            ClipRRect(
              borderRadius: AppRadius.brMd,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  if (imageUrl != null)
                    Image.network(
                      imageUrl!, 
                      width: 64, 
                      height: 64, 
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => Container(
                        width: 64,
                        height: 64,
                        color: AppColors.deepSaffron.withValues(alpha: 0.1),
                        child: Icon(AppIcons.library, color: AppColors.deepSaffron),
                      ),
                    )
                  else
                    Container(
                      width: 64,
                      height: 64,
                      color: AppColors.deepSaffron.withValues(alpha: 0.1),
                      child: Icon(AppIcons.library, color: AppColors.deepSaffron),
                    ),
                  if (isPlaying)
                    Container(
                      width: 64,
                      height: 64,
                      color: Colors.black.withValues(alpha: 0.4),
                      child: const Icon(AppIcons.waveform, color: Colors.white),
                    ),
                ],
              ),
            ),
            AppSpacing.gapW16,
            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppTypography.title.copyWith(fontSize: 18),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  AppSpacing.gapH4,
                  Text(
                    subtitle,
                    style: AppTypography.body.copyWith(color: AppColors.textSecondary(context), fontSize: 14),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  AppSpacing.gapH8,
                  // Duration Badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.deepSaffron.withValues(alpha: 0.1),
                      borderRadius: AppRadius.pill,
                    ),
                    child: Text(
                      duration,
                      style: AppTypography.label.copyWith(color: AppColors.deepSaffron),
                    ),
                  ),
                ],
              ),
            ),
            // Actions
            Column(
              children: [
                if (onFavorite != null)
                  IconButton(
                    icon: Icon(AppIcons.favoriteOutline, size: 20, color: AppColors.textMuted(context)),
                    onPressed: onFavorite,
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                AppSpacing.gapH12,
                if (onPlayPause != null)
                  SSPPressable(
                    onTap: onPlayPause!,
                    child: Container(
                      padding: AppSpacing.p8,
                      decoration: BoxDecoration(
                        color: isPlaying ? AppColors.deepSaffron : AppColors.deepSaffron.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        isPlaying ? AppIcons.pause : AppIcons.play,
                        size: 20,
                        color: isPlaying ? Colors.white : AppColors.deepSaffron,
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
