import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/theme/app_colors.dart';
import '../../../../shared/theme/app_spacing.dart';
import '../../../../shared/widgets/ssp_app_bar.dart';
import '../../../../shared/widgets/ssp_hero_banner.dart';
import '../../../../shared/widgets/ssp_search_bar.dart';
import '../../../../shared/widgets/ssp_section_header.dart';
import '../../../../shared/widgets/ssp_audio_tile.dart';
import '../../../../shared/widgets/ssp_action_card.dart';
import '../../../../shared/widgets/ssp_quote_card.dart';
import '../../../../shared/widgets/ssp_loading.dart';
import '../../../../shared/widgets/ssp_error_state.dart';
import '../providers/home_providers.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final homeState = ref.watch(homeStateProvider);

    return homeState.when(
      data: (data) {
        final banner = data.banners.isNotEmpty ? data.banners.first : null;

        return Scaffold(
          appBar: SSPAppBar(
            title: 'संतमत सत्संग प्रचार',
            subtitle: '|| सत्य ही हमारा धर्म है ||',
            centerTitle: true,
            actions: [
              IconButton(
                icon: const Icon(Icons.notifications_none_rounded),
                onPressed: () {},
              ),
              AppSpacing.horizontalSpaceSm,
            ],
          ),
          body: RefreshIndicator(
            color: AppColors.deepSaffron,
            onRefresh: () =>
                ref.read(homeStateProvider.notifier).refreshDashboard(),
            child: CustomScrollView(
              slivers: [
                SliverPadding(
                  padding: AppSpacing.paddingAllLg,
                  sliver: SliverList(
                    delegate: SliverChildListDelegate([
                      // Search Bar
                      SSPSearchBar(
                        hintText: 'भजन, गायक, कीवर्ड खोजें...',
                        onTap: () {},
                        onVoiceTap: () {},
                      ),
                      AppSpacing.verticalSpaceLg,

                      // Hero Banner
                      SSPHeroBanner(
                        imageUrl:
                            banner?.imageUrl ?? 'https://picsum.photos/800/400',
                        quoteText:
                            'सत्संग से ही जीवन का उद्धार है।\nसत्संग सुनें, जीवन संवारें।',
                        onShareTap: () {},
                      ),
                      AppSpacing.verticalSpaceLg,

                      // Action Cards Row
                      Row(
                        children: [
                          Expanded(
                            child: SSPActionCard(
                              title: 'ऑडियो',
                              subtitle: 'सभी भजन सुनें',
                              buttonText: 'सुनें',
                              icon: Icons.music_note_rounded,
                              themeColor: AppColors.deepSaffron,
                              onTap: () => context.push('/audio'),
                            ),
                          ),
                          AppSpacing.horizontalSpaceLg,
                          Expanded(
                            child: SSPActionCard(
                              title: 'स्तुति-विनती',
                              subtitle: 'प्रातः एवं संध्या स्तुति',
                              buttonText: 'देखें',
                              icon: Icons.sign_language_rounded,
                              themeColor: AppColors.maroon,
                              onTap: () => context.push('/satsang'),
                            ),
                          ),
                        ],
                      ),
                      AppSpacing.verticalSpaceLg,

                      // Quote Card
                      const SSPQuoteCard(
                        text:
                            'सत्संग सुनने से मन शुद्ध होता है और\nजीवन में शांति का प्रकाश फैलता है।',
                      ),
                      AppSpacing.verticalSpaceLg,
                    ]),
                  ),
                ),

                // Latest Bhajans
                if (data.latestAudios.isNotEmpty)
                  SliverPadding(
                    padding: const EdgeInsets.only(
                      left: AppSpacing.lg,
                      right: AppSpacing.lg,
                    ),
                    sliver: SliverToBoxAdapter(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SSPSectionHeader(
                            title: 'नवीनतम भजन',
                            actionLabel: 'सभी देखें',
                            icon: Icons.music_note_rounded,
                            onActionTap: () {},
                          ),
                          AppSpacing.verticalSpaceMd,
                        ],
                      ),
                    ),
                  ),

                if (data.latestAudios.isNotEmpty)
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.lg,
                    ),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final audio = data.latestAudios[index];
                          final durationParts = audio.duration.toString().split(
                            '.',
                          );
                          final formattedDuration = durationParts.isNotEmpty
                              ? durationParts[0]
                              : '0:00';

                          return Padding(
                            padding: const EdgeInsets.only(
                              bottom: AppSpacing.sm,
                            ),
                            child: SSPAudioTile(
                              title: audio.title,
                              subtitle:
                                  'स्वर: पूज्य श्री', // Hardcoded to match design mock
                              imageUrl: audio.audioUrl,
                              duration: formattedDuration,
                              onTap: () =>
                                  context.push('/audio/details/${audio.id}'),
                              onPlayTap: () {},
                              onMoreTap: () {},
                            ),
                          );
                        },
                        childCount: data.latestAudios.length > 3
                            ? 3
                            : data.latestAudios.length,
                      ),
                    ),
                  ),
                const SliverSafeArea(
                  sliver: SliverToBoxAdapter(child: AppSpacing.verticalSpaceLg),
                ),
              ],
            ),
          ),
        );
      },
      error: (error, stack) => Scaffold(
        appBar: const SSPAppBar(title: ''),
        body: SSPErrorState(
          message: error.toString(),
          onRetry: () => ref.read(homeStateProvider.notifier).fetchDashboard(),
        ),
      ),
      loading: () => const Scaffold(
        appBar: SSPAppBar(title: ''),
        body: SSPLoading(message: 'Loading...'),
      ),
    );
  }
}
