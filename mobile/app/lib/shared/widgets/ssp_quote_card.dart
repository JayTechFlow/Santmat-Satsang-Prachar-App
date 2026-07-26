import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';

class SSPQuoteCard extends StatelessWidget {
  final String text;

  const SSPQuoteCard({super.key, required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: AppSpacing.paddingAllLg,
      decoration: BoxDecoration(
        color: AppColors.templeGold.withValues(
          alpha: 0.05,
        ), // Faint cream background
        borderRadius: AppRadius.borderRadiusLg,
        border: Border.all(color: AppColors.templeGold.withValues(alpha: 0.1)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(
            Icons.format_quote_rounded,
            color: AppColors.deepSaffron,
            size: 32,
          ),
          AppSpacing.horizontalSpaceMd,
          Expanded(
            child: Text(
              text,
              style: AppTypography.bodyLarge.copyWith(
                color: AppColors.textPrimary(context),
                height: 1.5,
              ),
            ),
          ),
          AppSpacing.horizontalSpaceMd,
          const Padding(
            padding: EdgeInsets.only(top: 8.0),
            child: Icon(
              Icons.spa_rounded, // Approximate for diya
              color: AppColors.deepSaffron,
              size: 28,
            ),
          ),
        ],
      ),
    );
  }
}
