import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';
import '../theme/app_radius.dart';
import '../theme/app_icons.dart';

class SSPErrorState extends StatelessWidget {
  final String title;
  final String message;
  final String? retryLabel;
  final VoidCallback? onRetry;

  const SSPErrorState({
    super.key,
    this.title = 'Oops, something went wrong',
    required this.message,
    this.retryLabel = 'Try Again',
    this.onRetry,
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
                color: AppColors.softRed.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                AppIcons.error,
                size: 48,
                color: AppColors.softRed,
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
            if (onRetry != null) ...[
              AppSpacing.gapH32,
              ElevatedButton(
                onPressed: onRetry,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.softRed,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: AppRadius.pill),
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                ),
                child: Text(retryLabel ?? 'Try Again', style: AppTypography.button),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
