import 'package:flutter/material.dart';
import '../../domain/entities/daily_quote_entity.dart';
import '../../../../shared/theme/app_spacing.dart';
import '../../../../shared/theme/app_radius.dart';

class TodayQuoteCard extends StatelessWidget {
  final DailyQuoteEntity quote;
  final VoidCallback onTap;

  const TodayQuoteCard({super.key, required this.quote, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        image: DecorationImage(
          image: NetworkImage(quote.backgroundImageUrl),
          fit: BoxFit.cover,
          colorFilter: ColorFilter.mode(
            Colors.black.withAlpha(153),
            BlendMode.darken,
          ),
        ),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        child: Padding(
          padding: AppSpacing.paddingAllLg,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                "Today's Quote",
                style: Theme.of(context).textTheme.labelLarge?.copyWith(
                  color: Colors.white70,
                  letterSpacing: 1.2,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppSpacing.lg),
              Text(
                '"${quote.quoteText}"',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: Colors.white,
                  fontStyle: FontStyle.italic,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppSpacing.lg),
              Text(
                '- ${quote.author.name}',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.right,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
