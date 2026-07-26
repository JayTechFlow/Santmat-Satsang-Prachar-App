import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';

class SSPActionCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final String buttonText;
  final IconData icon;
  final Color themeColor;
  final VoidCallback onTap;

  const SSPActionCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.buttonText,
    required this.icon,
    required this.themeColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: AppRadius.borderRadiusLg,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
        // Subtle top border matching theme color
        border: Border(
          top: BorderSide(color: themeColor.withValues(alpha: 0.2), width: 2),
          left: BorderSide(color: Colors.grey.withValues(alpha: 0.1)),
          right: BorderSide(color: Colors.grey.withValues(alpha: 0.1)),
          bottom: BorderSide(color: Colors.grey.withValues(alpha: 0.1)),
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: AppRadius.borderRadiusLg,
          child: Padding(
            padding: AppSpacing.paddingAllLg,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Icon Circle
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: themeColor,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, color: Colors.white, size: 32),
                ),
                AppSpacing.verticalSpaceMd,
                // Title
                Text(
                  title,
                  style: AppTypography.titleMedium.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary(context),
                  ),
                  textAlign: TextAlign.center,
                ),
                AppSpacing.verticalSpaceXs,
                // Subtitle
                Text(
                  subtitle,
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textSecondary(context),
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                AppSpacing.verticalSpaceLg,
                // Button
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: themeColor,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        buttonText,
                        style: AppTypography.labelLarge.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      AppSpacing.horizontalSpaceXs,
                      const Icon(
                        Icons.arrow_forward_rounded,
                        color: Colors.white,
                        size: 16,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
