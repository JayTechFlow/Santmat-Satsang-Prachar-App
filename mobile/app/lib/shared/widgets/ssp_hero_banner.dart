import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';
import '../theme/app_icons.dart';
import 'ssp_glass_container.dart';

class SSPHeroBanner extends StatelessWidget {
  final String title;
  final String imageUrl;
  final String? suvicharText;
  final VoidCallback? onShareTap;
  final VoidCallback? onSaveTap;

  const SSPHeroBanner({
    super.key,
    required this.title,
    required this.imageUrl,
    this.suvicharText,
    this.onShareTap,
    this.onSaveTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      constraints: const BoxConstraints(minHeight: 280),
      decoration: BoxDecoration(borderRadius: AppRadius.borderRadiusLg),
      child: ClipRRect(
        borderRadius: AppRadius.borderRadiusLg,
        child: Stack(
          children: [
            // Background Image
            Positioned.fill(
              child: Image.network(
                imageUrl,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Container(
                  color: Theme.of(context).colorScheme.surfaceContainerHighest,
                  child: const Icon(Icons.image_not_supported_rounded),
                ),
              ),
            ),

            // Gradient Overlay
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.black.withValues(alpha: 0.1),
                      Colors.black.withValues(
                        alpha: 0.9,
                      ), // Darker at bottom for text contrast
                    ],
                  ),
                ),
              ),
            ),

            // Content
            Padding(
              padding: AppSpacing.paddingAllLg,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                mainAxisSize:
                    MainAxisSize.min, // Crucial for letting Column size itself
                children: [
                  if (suvicharText != null) ...[
                    // Today's Suvichar Badge inside Banner
                    SSPGlassContainer(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      blur: 15,
                      opacity: 0.2,
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.wb_sunny_rounded,
                            color: AppColors.templeGold,
                            size: 16,
                          ),
                          AppSpacing.horizontalSpaceXs,
                          Text(
                            "Today's Suvichar",
                            style: AppTypography.labelSmall.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                    AppSpacing.verticalSpaceMd,
                    Text(
                      suvicharText!,
                      style: AppTypography.titleLarge.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                        fontStyle: FontStyle.italic,
                      ),
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                  AppSpacing.verticalSpaceMd,
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          title,
                          style: AppTypography.titleMedium.copyWith(
                            color: Colors.white.withValues(alpha: 0.9),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Row(
                        children: [
                          if (onSaveTap != null)
                            IconButton(
                              onPressed: onSaveTap,
                              icon: const Icon(
                                AppIcons.favoriteOutline,
                                color: Colors.white,
                              ),
                              visualDensity: VisualDensity.compact,
                            ),
                          if (onShareTap != null)
                            IconButton(
                              onPressed: onShareTap,
                              icon: const Icon(
                                AppIcons.share,
                                color: Colors.white,
                              ),
                              visualDensity: VisualDensity.compact,
                            ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
