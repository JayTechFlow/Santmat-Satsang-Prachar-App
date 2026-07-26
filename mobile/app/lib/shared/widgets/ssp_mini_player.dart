import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';
import '../theme/app_animations.dart';
import '../theme/app_shadows.dart';
import '../theme/app_icons.dart';

class SSPMiniPlayer extends StatelessWidget {
  final String title;
  final String subtitle;
  final String? imageUrl;
  final bool isPlaying;
  final VoidCallback onPlayPause;
  final VoidCallback? onClose;
  final VoidCallback? onTap;
  final double progress; // 0.0 to 1.0

  const SSPMiniPlayer({
    super.key,
    required this.title,
    required this.subtitle,
    this.imageUrl,
    required this.isPlaying,
    required this.onPlayPause,
    this.onClose,
    this.onTap,
    this.progress = 0.0,
  });

  @override
  Widget build(BuildContext context) {
    return SSPPressable(
      onTap: onTap ?? () {},
      child: Container(
        margin: AppSpacing.p16,
        decoration: BoxDecoration(
          color: AppColors.surface(context),
          borderRadius: AppRadius.brLg,
          boxShadow: AppShadows.floating(context),
        ),
        child: ClipRRect(
          borderRadius: AppRadius.brLg,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Padding(
                padding: AppSpacing.p8,
                child: Row(
                  children: [
                    // Artwork
                    ClipRRect(
                      borderRadius: AppRadius.brMd,
                      child: imageUrl != null
                          ? Image.network(
                              imageUrl!, 
                              width: 48, 
                              height: 48, 
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) => Container(
                                width: 48,
                                height: 48,
                                color: AppColors.deepSaffron,
                              ),
                            )
                          : Container(
                              width: 48,
                              height: 48,
                              color: AppColors.deepSaffron.withValues(alpha: 0.2),
                              child: Icon(AppIcons.library, color: AppColors.deepSaffron),
                            ),
                    ),
                    AppSpacing.gapW12,
                    // Title and Subtitle
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            title,
                            style: AppTypography.button,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            subtitle,
                            style: AppTypography.caption.copyWith(color: AppColors.textMuted(context)),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    // Controls
                    IconButton(
                      icon: Icon(
                        isPlaying ? AppIcons.pause : AppIcons.play,
                        color: AppColors.textPrimary(context),
                      ),
                      onPressed: onPlayPause,
                    ),
                    if (onClose != null)
                      IconButton(
                        icon: Icon(Icons.close_rounded, color: AppColors.textMuted(context)),
                        onPressed: onClose,
                      ),
                  ],
                ),
              ),
              // Progress Bar
              LinearProgressIndicator(
                value: progress,
                backgroundColor: Colors.transparent,
                valueColor: const AlwaysStoppedAnimation<Color>(AppColors.sacredGold),
                minHeight: 2,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
