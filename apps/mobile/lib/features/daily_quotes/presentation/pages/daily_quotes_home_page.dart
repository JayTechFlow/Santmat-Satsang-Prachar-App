import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/daily_quotes_providers.dart';
import '../widgets/daily_quotes_state_widgets.dart';
import '../widgets/today_quote_card.dart';
import '../widgets/quote_card.dart';
import '../../../../shared/theme/app_spacing.dart';
import '../../../../shared/design_system/components/ssp_app_bar.dart';

class DailyQuotesHomePage extends ConsumerWidget {
  const DailyQuotesHomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(dailyQuotesProvider);

    return Scaffold(
      appBar: SSPAppBar.standard(
        title: 'दैनिक सुविचार',
        subtitle: 'संतों के अनमोल वचन एवं विचार',
        actions: [
          IconButton(
            icon: const Icon(Icons.search_rounded, color: Color(0xFFFDE68A)),
            tooltip: 'खोजें',
            onPressed: () => context.push('/search'),
          ),
          IconButton(
            icon: const Icon(Icons.favorite_outline_rounded, color: Color(0xFFFDE68A)),
            tooltip: 'पसंदीदा',
            onPressed: () => context.push('/quotes/favorites'),
          ),
          IconButton(
            icon: const Icon(Icons.history_rounded, color: Color(0xFFFDE68A)),
            tooltip: 'इतिहास',
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
                        horizontal: AppSpacing.sp16,
                        vertical: AppSpacing.sp8,
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
                          horizontal: AppSpacing.sp16,
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
