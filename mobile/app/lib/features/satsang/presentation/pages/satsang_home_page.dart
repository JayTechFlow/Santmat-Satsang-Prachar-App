import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/satsang_providers.dart';
import '../widgets/loading_widget.dart';
import '../widgets/error_state_widget.dart';
import '../widgets/search_bar_widget.dart';
import '../widgets/featured_satsang_card.dart';
import '../widgets/latest_satsang_section.dart';
import '../widgets/popular_satsang_section.dart';
import '../widgets/category_section.dart';
import '../widgets/filter_bottom_sheet.dart';
import '../../../../shared/theme/app_spacing.dart';

import '../../../../l10n/gen/app_localizations.dart';

class SatsangHomePage extends ConsumerWidget {
  const SatsangHomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(satsangHomeStateProvider);
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.satsang)),
      body: state.isLoading
          ? const SatsangLoadingWidget()
          : state.error != null
          ? SatsangErrorStateWidget(
              message: state.error!,
              onRetry: () =>
                  ref.read(satsangHomeStateProvider.notifier).loadHomeData(),
            )
          : RefreshIndicator(
              onRefresh: () =>
                  ref.read(satsangHomeStateProvider.notifier).loadHomeData(),
              child: CustomScrollView(
                slivers: [
                  SliverToBoxAdapter(
                    child: SearchBarWidget(
                      hintText: l10n.searchSatsangs,
                      onChanged: (val) {
                        // Implemented in future search page
                      },
                      onFilterTap: () {
                        showModalBottomSheet(
                          context: context,
                          builder: (ctx) => const FilterBottomSheet(),
                        );
                      },
                    ),
                  ),
                  if (state.featuredSatsangs.isNotEmpty)
                    SliverToBoxAdapter(
                      child: SizedBox(
                        height: 250,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount: state.featuredSatsangs.length,
                          itemBuilder: (context, index) {
                            return FeaturedSatsangCard(
                              satsang: state.featuredSatsangs[index],
                              onTap: () => context.push(
                                '/satsang/details/${state.featuredSatsangs[index].id}',
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                  SliverToBoxAdapter(
                    child: const SizedBox(height: AppSpacing.lg),
                  ),
                  SliverToBoxAdapter(
                    child: CategorySection(
                      title: l10n.categories,
                      categories: state.categories,
                      onCategoryTap: (category) =>
                          context.push('/satsang/category/${category.id}'),
                    ),
                  ),
                  SliverToBoxAdapter(
                    child: const SizedBox(height: AppSpacing.md),
                  ),
                  SliverToBoxAdapter(
                    child: LatestSatsangSection(
                      title: l10n.latestSatsangs,
                      satsangs: state.latestSatsangs,
                      onSatsangTap: (satsang) =>
                          context.push('/satsang/details/${satsang.id}'),
                    ),
                  ),
                  SliverToBoxAdapter(
                    child: PopularSatsangSection(
                      title: l10n.popularSatsangs,
                      satsangs: state.popularSatsangs,
                      onSatsangTap: (satsang) =>
                          context.push('/satsang/details/${satsang.id}'),
                    ),
                  ),
                  const SliverPadding(padding: EdgeInsets.only(bottom: 100)),
                ],
              ),
            ),
    );
  }
}
