import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';
import '../theme/app_radius.dart';
import '../theme/app_icons.dart';

class SSPEmptyState extends StatelessWidget {
  final String title;
  final String message;
  final IconData? icon;
  final String? actionLabel;
  final VoidCallback? onAction;

  const SSPEmptyState({
    super.key,
    required this.title,
    required this.message,
    this.icon,
    this.actionLabel,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: AppSpacing.p32,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: AppSpacing.p24,
              decoration: BoxDecoration(
                color: AppColors.deepSaffron.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon ?? AppIcons.info,
                size: 48,
                color: AppColors.deepSaffron,
              ),
            ),
            AppSpacing.gapH24,
            Text(
              title,
              style: AppTypography.title,
              textAlign: TextAlign.center,
            ),
            AppSpacing.gapH8,
            Text(
              message,
              style: AppTypography.body.copyWith(color: AppColors.textMuted(context)),
              textAlign: TextAlign.center,
            ),
            if (actionLabel != null && onAction != null) ...[
              AppSpacing.gapH32,
              ElevatedButton(
                onPressed: onAction,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.surface(context),
                  foregroundColor: AppColors.deepSaffron,
                  elevation: 0,
                  side: BorderSide(color: AppColors.deepSaffron.withValues(alpha: 0.5)),
                  shape: RoundedRectangleBorder(borderRadius: AppRadius.pill),
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                ),
                child: Text(actionLabel!, style: AppTypography.button),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
