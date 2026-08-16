import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';
import '../theme/app_shadows.dart';
import '../theme/app_icons.dart';
import '../theme/app_gradients.dart';
import 'ssp_glass_card.dart';
import 'package:santmat_satsang_prachar/shared/widgets/ssp_image.dart';
import 'audio_wave_animation.dart';


class SSPPrayerCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final String timeText;
  final String? imageUrl;
  final bool isPlaying;
  final VoidCallback onPlayPause;
  final VoidCallback onTap;

  const SSPPrayerCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.timeText,
    this.imageUrl,
    required this.isPlaying,
    required this.onPlayPause,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: AppSpacing.p16,
        decoration: BoxDecoration(
          borderRadius: AppRadius.brXl,
          boxShadow: AppShadows.large(context),
        ),
        child: ClipRRect(
          borderRadius: AppRadius.brXl,
          child: Stack(
            children: [
              // Background (Image or Gradient)
              if (imageUrl != null)
                Positioned.fill(
                  child: SSPImage(
                    imageUrl!, 
                    fit: BoxFit.cover,
                    errorWidget: (context, error, stackTrace) => Container(
                      decoration: BoxDecoration(gradient: AppGradients.prayerCard(context)),
                    ),
                  ),
                )
              else
                Positioned.fill(
                  child: Container(decoration: BoxDecoration(gradient: AppGradients.prayerCard(context))),
                ),
              
              // Dark Gradient Overlay for text readability
              Positioned.fill(
                child: Container(decoration: BoxDecoration(gradient: AppGradients.premiumOverlay)),
              ),

              // Content
              Padding(
                padding: AppSpacing.p24,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        SSPGlassCard(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          borderRadius: AppRadius.pill,
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(AppIcons.time, size: 14, color: AppColors.sacredGold),
                              AppSpacing.gapW4,
                              Text(
                                timeText.toUpperCase(),
                                style: AppTypography.label.copyWith(color: AppColors.sacredGold),
                              ),
                            ],
                          ),
                        ),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.share, color: Colors.white),
                              onPressed: () {},
                            ),
                            IconButton(
                              icon: Icon(AppIcons.favoriteOutline, color: Colors.white),
                              onPressed: () {},
                            ),
                          ],
                        ),
                      ],
                    ),
                    AppSpacing.gapH48,
                    Text(
                      title,
                      style: AppTypography.title.copyWith(color: Colors.white),
                    ),
                    AppSpacing.gapH8,
                    Text(
                      subtitle,
                      style: AppTypography.body.copyWith(color: Colors.white.withValues(alpha: 0.8)),
                    ),
                    AppSpacing.gapH24,
                    // Integrated mini controls
                    Row(
                      children: [
                        FloatingActionButton(
                          heroTag: 'prayer_play_$title',
                          backgroundColor: AppColors.deepSaffron,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          onPressed: onPlayPause,
                          child: Icon(isPlaying ? AppIcons.pause : AppIcons.play),
                        ),
                        if (isPlaying) ...[
                          AppSpacing.gapW16,
                          const AudioWaveAnimation(isPlaying: true, color: Colors.white, height: 16),
                        ],
                        AppSpacing.gapW16,
                        Text(
                          isPlaying ? 'Playing...' : 'Listen Now',
                          style: AppTypography.button.copyWith(color: Colors.white),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
