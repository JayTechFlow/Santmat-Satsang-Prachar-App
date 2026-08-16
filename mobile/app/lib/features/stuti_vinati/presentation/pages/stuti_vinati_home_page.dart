import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../shared/theme/app_spacing.dart';
import '../../../../shared/design_system/components/ssp_app_bar.dart';
import '../../../../shared/widgets/ssp_prayer_card.dart';
import '../../../../shared/design_system/components/ssp_loading_state.dart';
import '../../../../shared/design_system/components/ssp_error_state.dart';
import '../../../../shared/design_system/components/ssp_empty_state.dart';
import '../providers/stuti_vinati_providers.dart';

class StutiVinatiHomePage extends ConsumerWidget {
  const StutiVinatiHomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(stutiVinatiListProvider);
    final playbackState = ref.watch(stutiPlaybackProvider);

    return Scaffold(
      appBar: SSPAppBar(title: 'Stuti & Vinati'),
      body: state.when(
        loading: () => const SSPLoadingState(),
        error: (error, stack) => SSPErrorState(
          message: error.toString(),
          onRetry: () => ref.refresh(stutiVinatiListProvider),
        ),
        data: (prayers) {
          final morningStuti = prayers.where((p) => p.type == 'morning').toList();
          final eveningStuti = prayers.where((p) => p.type == 'evening').toList();

          if (morningStuti.isEmpty && eveningStuti.isEmpty) {
            return const SSPEmptyState(
              title: 'No Stuti Available',
              message: 'Check back soon for morning and evening prayers.',
            );
          }

          return CustomScrollView(
            physics: const BouncingScrollPhysics(),
            slivers: [
              const SliverToBoxAdapter(child: AppSpacing.gapH24),
              if (morningStuti.isNotEmpty)
                SliverToBoxAdapter(
                  child: SSPPrayerCard(
                    title: '☀️ प्रातःकालीन स्तुति',
                    subtitle: morningStuti.first.title,
                    timeText: 'Morning',
                    imageUrl: null, // Removed thumbnail mapping to avoid unverified field requirement in entity
                    isPlaying: playbackState.playingId == morningStuti.first.id && playbackState.isPlaying,
                    onPlayPause: () => ref.read(stutiPlaybackProvider.notifier).playPause(morningStuti.first),
                    onTap: () {}, // Handled by Play button directly
                  ),
                ),
              if (eveningStuti.isNotEmpty)
                SliverToBoxAdapter(
                  child: SSPPrayerCard(
                    title: '🌙 संध्याकालीन स्तुति',
                    subtitle: eveningStuti.first.title,
                    timeText: 'Evening',
                    imageUrl: null, // Removed thumbnail mapping to avoid unverified field requirement in entity
                    isPlaying: playbackState.playingId == eveningStuti.first.id && playbackState.isPlaying,
                    onPlayPause: () => ref.read(stutiPlaybackProvider.notifier).playPause(eveningStuti.first),
                    onTap: () {}, // Handled by Play button directly
                  ),
                ),
              const SliverToBoxAdapter(child: AppSpacing.gapH64),
            ],
          );
        },
      ),
    );
  }
}
