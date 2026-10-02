import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/player/canonical_player_controller.dart';
import '../../../audio/presentation/providers/audio_providers.dart';
import '../../../audio/presentation/widgets/audio_card.dart';
import '../../../../shared/theme/app_spacing.dart';
import '../../../../shared/design_system/components/ssp_app_bar.dart';
import '../../../../shared/design_system/components/ssp_loading_state.dart';
import '../../../../shared/design_system/components/ssp_error_state.dart';
import '../../../../shared/design_system/components/ssp_empty_state.dart';
import '../../../../shared/design_system/tokens/icons/ssp_icons.dart';

class ListeningHistoryPage extends ConsumerWidget {
  const ListeningHistoryPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final historyAsync = ref.watch(recentlyPlayedProvider);

    return Scaffold(
      appBar: const SSPAppBar.standard(
        title: 'सुनने का इतिहास',
        subtitle: 'हाल ही में सुने गए भजन एवं प्रवचन',
      ),
      body: historyAsync.when(
        loading: () => const SSPLoadingState(),
        error: (err, _) => SSPErrorState(
          message: err.toString(),
          onRetry: () => ref.refresh(recentlyPlayedProvider),
        ),
        data: (history) {
          if (history.isEmpty) {
            return const SSPEmptyState(
              title: 'कोई इतिहास नहीं है',
              message: 'आपने अभी तक कोई ऑडियो नहीं सुना है',
              icon: SSPIcons.audioNav,
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(AppSpacing.sp16),
            itemCount: history.length,
            itemBuilder: (context, index) {
              final audio = history[index].audio;
              return Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.sp16),
                child: AudioCard(
                  audio: audio,
                  // PHASE 3: canonical open with this list as the queue.
                  onTap: () => ref.openAudio(
                    context,
                    audio,
                    queue: history
                        .map((h) => h.audio)
                        .where((a) => a.id.isNotEmpty)
                        .toList(growable: false),
                    index: index,
                    source: 'listening-history',
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
