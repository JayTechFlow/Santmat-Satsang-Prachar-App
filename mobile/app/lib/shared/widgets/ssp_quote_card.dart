import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';

class SSPQuoteCard extends StatelessWidget {
  final String quote;
  final String author;
  final VoidCallback? onShare;

  const SSPQuoteCard({
    super.key,
    required this.quote,
    required this.author,
    this.onShare,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: AppSpacing.p24,
      decoration: BoxDecoration(
        color: AppColors.sacredGold.withValues(alpha: 0.1),
        borderRadius: AppRadius.brLg,
        border: Border.all(color: AppColors.sacredGold.withValues(alpha: 0.3)),
      ),
      child: Column(
        children: [
          Icon(Icons.format_quote_rounded, color: AppColors.sacredGold, size: 32),
          AppSpacing.gapH12,
          Text(
            quote,
            style: AppTypography.title.copyWith(
              fontStyle: FontStyle.italic,
              color: AppColors.textPrimary(context),
            ),
            textAlign: TextAlign.center,
          ),
          AppSpacing.gapH16,
          Text(
            '- $author',
            style: AppTypography.label.copyWith(color: AppColors.textSecondary(context)),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
