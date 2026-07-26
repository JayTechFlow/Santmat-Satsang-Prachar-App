import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';
import '../theme/app_animations.dart';
import '../theme/app_gradients.dart';
import '../theme/app_shadows.dart';
import 'ssp_glass_card.dart';

class SSPHeroBanner extends StatelessWidget {
  final String title;
  final String subtitle;
  final String? badgeText;
  final String? imageUrl;
  final VoidCallback? onPlay;
  final VoidCallback? onShare;

  const SSPHeroBanner({
    super.key,
    required this.title,
    required this.subtitle,
    this.badgeText,
    this.imageUrl,
    this.onPlay,
    this.onShare,
  });

  @override
  Widget build(BuildContext context) {
    return SSPPressable(
      onTap: onPlay ?? () {},
      child: Container(
        height: 240,
        decoration: BoxDecoration(
          borderRadius: AppRadius.brXl,
          boxShadow: AppShadows.hero(context),
        ),
        child: ClipRRect(
          borderRadius: AppRadius.brXl,
          child: Stack(
            fit: StackFit.expand,
            children: [
              // Background Image or Gradient
              if (imageUrl != null)
                Image.network(
                  imageUrl!, 
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Container(
                    color: AppColors.deepSaffron,
                  ),
                )
              else
                Container(decoration: BoxDecoration(gradient: AppGradients.heroBanner(context))),

              // Premium Dark Overlay
              Container(decoration: BoxDecoration(gradient: AppGradients.premiumOverlay)),

              // Content
              Padding(
                padding: AppSpacing.p24,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    if (badgeText != null)
                      SSPGlassCard(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        borderRadius: AppRadius.pill,
                        child: Text(
                          badgeText!.toUpperCase(),
                          style: AppTypography.label.copyWith(color: AppColors.sacredGold),
                        ),
                      ),
                    if (badgeText != null) AppSpacing.gapH12,
                    Text(
                      title,
                      style: AppTypography.title.copyWith(color: Colors.white, fontSize: 28),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    AppSpacing.gapH8,
                    Text(
                      subtitle,
                      style: AppTypography.subtitle.copyWith(color: Colors.white.withValues(alpha: 0.8)),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
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
