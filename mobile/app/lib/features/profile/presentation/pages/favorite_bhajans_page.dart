import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../audio/presentation/providers/audio_providers.dart';
import '../../../audio/presentation/widgets/audio_card.dart';
import '../../../../shared/theme/app_spacing.dart';

class FavoriteBhajansPage extends ConsumerWidget {
  const FavoriteBhajansPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final favoritesAsync = ref.watch(favoritesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Favorite Bhajans')),
      body: favoritesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text(err.toString())),
        data: (favorites) {
          if (favorites.isEmpty) {
            return const Center(child: Text('No favorite bhajans yet.'));
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
                  onTap: () {
                    ref.read(playbackStateProvider.notifier).play(audio);
                    context.push('/audio/details/${audio.id}');
                  },
                ),
              );
            },
          );
        },
      ),
    );
  }
}
