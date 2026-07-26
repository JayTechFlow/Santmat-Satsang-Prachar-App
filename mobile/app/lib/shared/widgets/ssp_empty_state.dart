import 'package:flutter/material.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';
import '../theme/app_colors.dart';

class SSPEmptyState extends StatelessWidget {
  final String title;
  final String message;
  final IconData icon;
  final Widget? action;

  const SSPEmptyState({
    super.key,
    required this.title,
    required this.message,
    this.icon = Icons.inbox_rounded,
    this.action,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Center(
      child: Padding(
        padding: AppSpacing.paddingAllLg,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 64,
              color: isDark
                  ? AppColors.darkOnSurface.withValues(alpha: 0.5)
                  : AppColors.lightOnSurface.withValues(alpha: 0.5),
            ),
            AppSpacing.verticalSpaceMd,
            Text(
              title,
              style: AppTypography.titleLarge.copyWith(
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
            AppSpacing.verticalSpaceSm,
            Text(
              message,
              style: AppTypography.bodyMedium.copyWith(
                color: isDark
                    ? AppColors.darkOnSurface.withValues(alpha: 0.7)
                    : AppColors.lightOnSurface.withValues(alpha: 0.7),
              ),
              textAlign: TextAlign.center,
            ),
            if (action != null) ...[AppSpacing.verticalSpaceLg, action!],
          ],
        ),
      ),
    );
  }
}
