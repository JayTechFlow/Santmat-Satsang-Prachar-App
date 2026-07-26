import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';

class SSPHeroBanner extends StatelessWidget {
  final String imageUrl;
  final String quoteText;
  final VoidCallback? onShareTap;

  const SSPHeroBanner({
    super.key,
    required this.imageUrl,
    required this.quoteText,
    this.onShareTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      constraints: const BoxConstraints(minHeight: 220),
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
                      Colors.transparent,
                      Colors.black.withValues(alpha: 0.6),
                    ],
                  ),
                ),
              ),
            ),

            // Share Button top right
            if (onShareTap != null)
              Positioned(
                top: AppSpacing.md,
                right: AppSpacing.md,
                child: GestureDetector(
                  onTap: onShareTap,
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.5),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.share_rounded,
                      color: Colors.white,
                      size: 20,
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
                mainAxisSize: MainAxisSize.min,
                children: [
                  AppSpacing.verticalSpaceLg,
                  AppSpacing.verticalSpaceLg,
                  Text(
                    quoteText,
                    style: AppTypography.titleLarge.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                      height: 1.4,
                    ),
                  ),
                  AppSpacing.verticalSpaceLg,
                  // Today's Suvichar Badge inside Banner
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.6),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.wb_sunny_outlined,
                          color: AppColors.templeGold,
                          size: 16,
                        ),
                        AppSpacing.horizontalSpaceXs,
                        Text(
                          "आज का सुविचार",
                          style: AppTypography.labelSmall.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
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
