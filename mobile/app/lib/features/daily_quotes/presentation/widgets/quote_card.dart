import 'package:flutter/material.dart';
import '../../domain/entities/daily_quote_entity.dart';
import '../../../../shared/theme/app_spacing.dart';
import '../../../../shared/theme/app_radius.dart';

class QuoteCard extends StatelessWidget {
  final DailyQuoteEntity quote;
  final VoidCallback onTap;

  const QuoteCard({super.key, required this.quote, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: Padding(
          padding: AppSpacing.paddingAllMd,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '"${quote.quoteText}"',
                style: Theme.of(
                  context,
                ).textTheme.titleMedium?.copyWith(fontStyle: FontStyle.italic),
                maxLines: 4,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: AppSpacing.sm),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      '- ${quote.author.name}',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context).colorScheme.primary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Row(
                    children: [
                      Icon(
                        quote.isFavorite
                            ? Icons.favorite
                            : Icons.favorite_border,
                        size: 20,
                        color: quote.isFavorite
                            ? Colors.red
                            : Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Icon(
                        Icons.share,
                        size: 20,
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
