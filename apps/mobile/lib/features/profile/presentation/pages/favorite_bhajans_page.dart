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

class FavoriteBhajansPage extends ConsumerWidget {
  const FavoriteBhajansPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final favoritesAsync = ref.watch(favoritesProvider);

    return Scaffold(
      appBar: const SSPAppBar.standard(
        title: 'पसंदीदा भजन',
        subtitle: 'आपके सहेजे गए पसंदीदा भजन',
      ),
      body: favoritesAsync.when(
        loading: () => const SSPLoadingState(),
        error: (err, _) => SSPErrorState(
          message: err.toString(),
          onRetry: () => ref.refresh(favoritesProvider),
        ),
        data: (favorites) {
          if (favorites.isEmpty) {
            return const SSPEmptyState(
              title: 'कोई पसंदीदा भजन नहीं',
              message: 'आपने अभी तक किसी भजन को पसंदीदा नहीं बनाया है',
              icon: SSPIcons.favorite,
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(AppSpacing.sp16),
            itemCount: favorites.length,
            itemBuilder: (context, index) {
              final audio = favorites[index].audio;
              return Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.sp16),
                child: AudioCard(
                  audio: audio,
                  // PHASE 3: canonical open with this list as the queue.
                  onTap: () => ref.openAudio(
                    context,
                    audio,
                    queue: favorites
                        .map((f) => f.audio)
                        .where((a) => a.id.isNotEmpty)
                        .toList(growable: false),
                    index: index,
                    source: 'favorites',
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
