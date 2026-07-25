import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/daily_quotes_providers.dart';
import '../widgets/daily_quotes_state_widgets.dart';
import '../widgets/today_quote_card.dart';
import '../widgets/quote_card.dart';
import '../../../../shared/theme/app_spacing.dart';

class DailyQuotesHomePage extends ConsumerWidget {
  const DailyQuotesHomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(dailyQuotesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Daily Quotes'),
        actions: [
          IconButton(
            icon: const Icon(Icons.favorite),
            onPressed: () => context.push('/quotes/favorites'),
          ),
          IconButton(
            icon: const Icon(Icons.history),
            onPressed: () => context.push('/quotes/history'),
          ),
        ],
      ),
      body: state.isLoading
          ? const DailyQuotesLoadingWidget()
          : state.error != null
          ? DailyQuotesErrorWidget(
              message: state.error!,
              onRetry: () => ref.read(dailyQuotesProvider.notifier).loadData(),
            )
          : RefreshIndicator(
              onRefresh: () =>
                  ref.read(dailyQuotesProvider.notifier).loadData(),
              child: CustomScrollView(
                slivers: [
                  if (state.todayQuote != null)
                    SliverToBoxAdapter(
                      child: TodayQuoteCard(
                        quote: state.todayQuote!,
                        onTap: () => context.push(
                          '/quotes/details/${state.todayQuote!.id}',
                        ),
                      ),
                    ),
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.md,
                        vertical: AppSpacing.sm,
                      ),
                      child: Text(
                        'Featured Quotes',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                    ),
                  ),
                  SliverList(
                    delegate: SliverChildBuilderDelegate((context, index) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.md,
                        ),
                        child: QuoteCard(
                          quote: state.featuredQuotes[index],
                          onTap: () => context.push(
                            '/quotes/details/${state.featuredQuotes[index].id}',
                          ),
                        ),
                      );
                    }, childCount: state.featuredQuotes.length),
                  ),
                  const SliverPadding(padding: EdgeInsets.only(bottom: 100)),
                ],
              ),
            ),
    );
  }
}
