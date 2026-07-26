import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';
import '../theme/app_icons.dart';

class SSPSearchBar extends StatelessWidget {
  final VoidCallback? onTap;
  final VoidCallback? onVoiceTap;
  final String hintText;

  const SSPSearchBar({
    super.key,
    this.onTap,
    this.onVoiceTap,
    this.hintText = 'Search bhajans, books, authors...',
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.sm,
        ),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSurface : AppColors.softWhite,
          borderRadius: AppRadius.borderRadiusXl,
          boxShadow: isDark
              ? null
              : [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
          border: Border.all(color: AppColors.border(context), width: 1.0),
        ),
        child: Row(
          children: [
            Icon(AppIcons.searchNav, color: AppColors.textSecondary(context)),
            AppSpacing.horizontalSpaceMd,
            Expanded(
              child: Text(
                hintText,
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.textSecondary(context),
                ),
              ),
            ),
            if (onVoiceTap != null)
              GestureDetector(
                onTap: onVoiceTap,
                child: Container(
                  padding: AppSpacing.paddingAllXs,
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primaryContainer,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.mic_none_rounded,
                    color: Theme.of(context).colorScheme.primary,
                    size: 20,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
