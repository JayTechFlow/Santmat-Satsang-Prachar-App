import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';
import '../theme/app_icons.dart';
import '../theme/app_animations.dart';

class SSPSectionHeader extends StatelessWidget {
  final String title;
  final String? actionText;
  final VoidCallback? onActionTap;
  final IconData? icon;

  const SSPSectionHeader({
    super.key,
    required this.title,
    this.actionText,
    this.onActionTap,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sp16, vertical: AppSpacing.sp12),
      child: Row(
        children: [
          if (icon != null) ...[
            Icon(icon, color: AppColors.deepSaffron, size: 24),
            AppSpacing.gapW8,
          ],
          Expanded(
            child: Text(
              title,
              style: AppTypography.title,
            ),
          ),
          if (actionText != null && onActionTap != null)
            SSPPressable(
              onTap: onActionTap!,
              child: Padding(
                padding: AppSpacing.p4,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      actionText!,
                      style: AppTypography.button.copyWith(color: AppColors.deepSaffron),
                    ),
                    AppSpacing.gapW4,
                    Icon(AppIcons.arrowForward, color: AppColors.deepSaffron, size: 14),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
