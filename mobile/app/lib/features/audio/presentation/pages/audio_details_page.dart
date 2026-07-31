import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/widgets/ssp_loading.dart';
import '../../../../shared/widgets/ssp_error_state.dart';
import '../../../../shared/widgets/ssp_audio_tile.dart';
import '../../../../l10n/gen/app_localizations.dart';
import '../providers/audio_providers.dart';
import '../../domain/entities/playback_state_entity.dart';
import '../../domain/entities/audio_entity.dart';

class AudioDetailsPage extends ConsumerWidget {
  final String audioId;

  const AudioDetailsPage({
    super.key,
    required this.audioId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final audioAsync = ref.watch(audioDetailsProvider(audioId));
    final l10n = AppLocalizations.of(context)!;
    final primaryBrown = Theme.of(context).colorScheme.primary;

    return audioAsync.when(
      loading: () => Scaffold(
        appBar: AppBar(title: Text(l10n.audio)),
        body: const SSPLoadingWidget(),
      ),
      error: (error, _) => Scaffold(
        appBar: AppBar(title: Text(l10n.audio)),
        body: SSPErrorState(
          message: error.toString(),
          onRetry: () => ref.refresh(audioDetailsProvider(audioId)),
        ),
      ),
      data: (audio) {
        return _AudioDetailsContent(audio: audio, l10n: l10n, primaryBrown: primaryBrown);
      },
    );
  }
}

class _AudioDetailsContent extends ConsumerWidget {
  final AudioEntity audio;
  final AppLocalizations l10n;
  final Color primaryBrown;

  const _AudioDetailsContent({
    required this.audio,
    required this.l10n,
    required this.primaryBrown,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final playbackState = ref.watch(playbackStateProvider);
    final notifier = ref.read(playbackStateProvider.notifier);

    // If current audio isn't this one, maybe we should auto-play it?
    // For now, let's keep it manual or assume the router already played it.
    final isPlayingThis = playbackState.currentAudio?.id == audio.id &&
        playbackState.status == PlaybackStatus.playing;

    return Scaffold(
      backgroundColor: Colors.white, // Standard full-screen player background
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leadingWidth: 150,
        leading: Row(
          children: [
            const SizedBox(width: 8),
            IconButton(
              icon: const Icon(Icons.keyboard_arrow_down, size: 30),
              onPressed: () => context.pop(),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.favorite_border),
            onPressed: () {}, // TODO: Favorite toggle
          ),
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.more_vert),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Column(
          children: [
            const SizedBox(height: 16),
            // Large Artwork
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: AspectRatio(
                  aspectRatio: 1.0,
                  child: Image.network(
                    audio.thumbnailUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (ctx, err, stack) => Container(color: Colors.grey.shade300),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 32),
            // Track Info
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                children: [
                  Text(
                    audio.title,
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    audio.speaker,
                    style: TextStyle(fontSize: 16, color: Colors.grey.shade600),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            // Progress Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                children: [
                  SliderTheme(
                    data: SliderTheme.of(context).copyWith(
                      activeTrackColor: primaryBrown,
                      inactiveTrackColor: Colors.grey.shade300,
                      thumbColor: primaryBrown,
                      trackHeight: 4.0,
                      thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6.0),
                      overlayShape: const RoundSliderOverlayShape(overlayRadius: 14.0),
                    ),
                    child: Slider(
                      value: playbackState.position.inMilliseconds > 0 && audio.duration.inMilliseconds > 0
                          ? (playbackState.position.inMilliseconds / audio.duration.inMilliseconds).clamp(0.0, 1.0)
                          : 0.0,
                      onChanged: (val) {}, // TODO: Seek
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(_formatDuration(playbackState.position), style: const TextStyle(fontSize: 12)),
                        Text(_formatDuration(audio.duration), style: const TextStyle(fontSize: 12)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            // Playback Controls
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                IconButton(
                  icon: Icon(
                    Icons.shuffle,
                    color: playbackState.isShuffleEnabled ? primaryBrown : Colors.grey.shade600,
                  ),
                  onPressed: () => notifier.toggleShuffle(),
                ),
                IconButton(
                  icon: const Icon(Icons.skip_previous, size: 36),
                  onPressed: () {}, // TODO: Previous
                ),
                GestureDetector(
                  onTap: () {
                    if (playbackState.currentAudio?.id != audio.id) {
                      notifier.play(audio);
                    } else if (isPlayingThis) {
                      notifier.pause();
                    } else {
                      notifier.resume();
                    }
                  },
                  child: Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      color: primaryBrown,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: primaryBrown.withValues(alpha: 0.3),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Icon(
                      isPlayingThis ? Icons.pause : Icons.play_arrow,
                      color: Colors.white,
                      size: 36,
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.skip_next, size: 36),
                  onPressed: () {}, // TODO: Next
                ),
                IconButton(
                  icon: Icon(
                    Icons.repeat,
                    color: playbackState.isRepeatEnabled ? primaryBrown : Colors.grey.shade600,
                  ),
                  onPressed: () => notifier.toggleRepeat(),
                ),
              ],
            ),
            const SizedBox(height: 48),
            // Up Next Section (Dummy UI mapped to state if possible, else just static block)
            _buildUpNextSection(ref, l10n),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  String _formatDuration(Duration d) {
    final min = d.inMinutes.toString().padLeft(2, '0');
    final sec = (d.inSeconds % 60).toString().padLeft(2, '0');
    return '$min:$sec';
  }

  Widget _buildUpNextSection(WidgetRef ref, AppLocalizations l10n) {
    final homeState = ref.read(audioHomeStateProvider);
    final upNextList = homeState.popularAudio.take(5).toList();

    if (upNextList.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                l10n.popularAudio, // Using this as Up Next
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...upNextList.map((item) => Padding(
            padding: const EdgeInsets.only(bottom: 8.0),
            child: SSPAudioTile(
              title: item.title,
              subtitle: item.speaker,
              duration: _formatDuration(item.duration),
              imageUrl: item.thumbnailUrl,
              onTap: () {}, // Switch track
              onPlayPause: () {},
            ),
          )),
        ],
      ),
    );
  }
}
