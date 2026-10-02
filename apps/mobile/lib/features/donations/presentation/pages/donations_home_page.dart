import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/donations_providers.dart';
import '../widgets/donation_state_widgets.dart';
import '../widgets/donation_campaign_card.dart';
import '../widgets/featured_campaign_card.dart';
import '../../../../shared/theme/app_spacing.dart';
import '../../../../shared/design_system/components/ssp_app_bar.dart';

class DonationsHomePage extends ConsumerWidget {
  const DonationsHomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(donationsProvider);

    return Scaffold(
      appBar: SSPAppBar.standard(
        title: 'दान एवं सहयोग',
        subtitle: 'सत्संग प्रचार एवं सेवा कार्य में सहयोग दें',
        actions: [
          IconButton(
            icon: const Icon(Icons.history_rounded, color: Color(0xFFFDE68A)),
            tooltip: 'दान इतिहास',
            onPressed: () => context.push('/donations/history'),
          ),
        ],
      ),
      body: state.isLoading
          ? const DonationsLoadingWidget()
          : state.error != null
          ? DonationsErrorWidget(
              message: state.error!,
              onRetry: () => ref.read(donationsProvider.notifier).loadData(),
            )
          : state.campaigns.isEmpty && state.featuredCampaigns.isEmpty
          ? const DonationsEmptyWidget()
          : RefreshIndicator(
              onRefresh: () => ref.read(donationsProvider.notifier).loadData(),
              child: CustomScrollView(
                slivers: [
                  if (state.featuredCampaigns.isNotEmpty) ...[
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.all(AppSpacing.sp16),
                        child: Text(
                          'Featured Campaigns',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                      ),
                    ),
                    SliverToBoxAdapter(
                      child: SizedBox(
                        height: 220,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.sp16,
                          ),
                          itemCount: state.featuredCampaigns.length,
                          itemBuilder: (context, index) {
                            return FeaturedCampaignCard(
                              campaign: state.featuredCampaigns[index],
                              onTap: () => context.push(
                                '/donations/details/${state.featuredCampaigns[index].id}',
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                  ],
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(AppSpacing.sp16),
                      child: Text(
                        'All Campaigns',
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
                        child: DonationCampaignCard(
                          campaign: state.campaigns[index],
                          onTap: () => context.push(
                            '/donations/details/${state.campaigns[index].id}',
                          ),
                        ),
                      );
                    }, childCount: state.campaigns.length),
                  ),
                  const SliverPadding(padding: EdgeInsets.only(bottom: 100)),
                ],
              ),
            ),
    );
  }
}
