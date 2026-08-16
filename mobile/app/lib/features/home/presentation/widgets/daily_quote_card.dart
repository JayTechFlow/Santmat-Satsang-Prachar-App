import 'package:flutter/material.dart';
import '../../../../../l10n/gen/app_localizations.dart';
import '../../../../../shared/theme/app_spacing.dart';
import '../../../../../shared/theme/app_radius.dart';
import '../../../../../shared/widgets/ssp_image.dart';
import '../../domain/entities/daily_quote_entity.dart';

class DailyQuoteCard extends StatelessWidget {
  final DailyQuoteEntity quote;

  const DailyQuoteCard({super.key, required this.quote});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return Container(
      margin: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sp16,
        vertical: AppSpacing.sp8,
      ),
      padding: const EdgeInsets.all(AppSpacing.sp16),
      decoration: BoxDecoration(
        color: theme.colorScheme.secondaryContainer,
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.format_quote,
                color: theme.colorScheme.onSecondaryContainer,
              ),
              const SizedBox(width: AppSpacing.sp4),
              Text(
                l10n.todaysQuote,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: theme.colorScheme.onSecondaryContainer,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sp8),
          if (quote.imageUrl != null && quote.imageUrl!.isNotEmpty) ...[
            ClipRRect(
              borderRadius: BorderRadius.circular(AppRadius.sm),
              child: SSPImage(
                quote.imageUrl!,
                width: double.infinity,
                height: 200,
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(height: AppSpacing.sp12),
          ],
          Text(
            '"${quote.quoteText}"',
            style: theme.textTheme.bodyLarge?.copyWith(
              fontStyle: FontStyle.italic,
              color: theme.colorScheme.onSecondaryContainer,
            ),
          ),
          const SizedBox(height: AppSpacing.sp4),
          Align(
            alignment: Alignment.centerRight,
            child: Text(
              '- ${quote.author}',
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.onSecondaryContainer,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
