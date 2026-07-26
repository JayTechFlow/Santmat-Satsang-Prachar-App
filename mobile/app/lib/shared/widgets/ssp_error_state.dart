import 'package:flutter/material.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';
import '../theme/app_colors.dart';
import 'ssp_button.dart';

class SSPErrorState extends StatelessWidget {
  final String title;
  final String message;
  final VoidCallback? onRetry;

  const SSPErrorState({
    super.key,
    this.title = 'Oops!',
    this.message = 'Something went wrong. Please try again.',
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: AppSpacing.paddingAllLg,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.error_outline_rounded,
              size: 64,
              color: AppColors.maroon,
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
              style: AppTypography.bodyMedium,
              textAlign: TextAlign.center,
            ),
            if (onRetry != null) ...[
              AppSpacing.verticalSpaceLg,
              SSPButton(
                label: 'Retry',
                onPressed: onRetry,
                icon: Icons.refresh_rounded,
                isFullWidth: false,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
