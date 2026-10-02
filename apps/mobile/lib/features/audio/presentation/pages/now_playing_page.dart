import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:share_plus/share_plus.dart';
import '../providers/audio_providers.dart';
import '../../domain/entities/audio_entity.dart';
import '../../domain/entities/playback_state_entity.dart';
import 'package:santmat_satsang_prachar/core/player/canonical_player_controller.dart';
import 'package:santmat_satsang_prachar/core/player/player_lifecycle.dart';
import 'package:santmat_satsang_prachar/core/player/player_seek_policy.dart';
import 'package:santmat_satsang_prachar/core/player/player_surface.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_hold_to_seek_button.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_player_progress_bar.dart';
import 'package:santmat_satsang_prachar/shared/widgets/ssp_image.dart';
import 'package:santmat_satsang_prachar/core/media/presentation/providers/media_providers.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/image_size_config.dart';
import 'package:santmat_satsang_prachar/core/navigation/back_navigation_controller.dart';

/// NowPlayingPage — the Full Player surface (PHASE 3).
///
/// This page is a *surface* over the one canonical audio session, never a
/// second engine. It is always entered through
/// [CanonicalPlayerController], which has already made the tapped song the
/// active track of the single session, so the very first frame is correct.
///
/// It owns exactly one responsibility for the player lifecycle: it declares
/// itself the occupant of the player surface while mounted, and releases it on
/// dispose. Playback is deliberately *not* touched on dispose — backing out of
/// the player must never stop the music (PHASE 7).
class NowPlayingPage extends ConsumerStatefulWidget {
  final String? audioId;

  const NowPlayingPage({super.key, this.audioId});

  @override
  ConsumerState<NowPlayingPage> createState() => _NowPlayingPageState();
}

class _NowPlayingPageState extends ConsumerState<NowPlayingPage> {
  final TextEditingController _playlistNameController = TextEditingController();
  PlayerSurfaceNotifier? _surface;
  bool _isScrubbing = false;

  @override
  void initState() {
    super.initState();
    // Captured eagerly: `ref` must not be touched from `dispose`.
    _surface = ref.read(playerSurfaceProvider.notifier);
    // The surface is normally already open, because CanonicalPlayerController
    // claims it *before* pushing this route. Claiming it here too covers a cold
    // deep link, but it has to be deferred out of the build phase: mutating a
    // provider from initState is not allowed in Riverpod.
    if (ref.read(playerSurfaceProvider) != PlayerSurface.fullPlayerOpen) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _surface?.open();
      });
    }
    final audioId = widget.audioId;
    if (audioId != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _maybePlayRequested(audioId);
      });
    }
  }

  Future<void> _maybePlayRequested(String audioId) async {
    final current = ref.read(playbackStateProvider).currentAudio;
    if (current?.id == audioId) return;
    try {
      final audio = await ref.read(audioDetailsProvider(audioId).future);
      if (!mounted) return;
      final now = ref.read(playbackStateProvider).currentAudio;
      if (now?.id != audio.id) {
        ref.read(playbackStateProvider.notifier).play(audio);
      }
    } catch (_) {
      // The audio could not be loaded; keep the player in its current state.
    }
  }

  @override
  void dispose() {
    _playlistNameController.dispose();
    // Releasing the surface is all that happens on Back. The audio session stays
    // alive, which is exactly when the Mini Player becomes eligible again
    // (PHASE 7 + PHASE 4).
    _surface?.collapse();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final playbackState = ref.watch(playbackStateProvider);
    if (playbackState.currentAudio == null) {
      return const Scaffold(
        body: Center(
          child: Text(
            'कोई संगीत सक्रिय नहीं है।',
            style: TextStyle(
              fontFamily: 'Mukta',
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      );
    }
    final currentTrack = playbackState.currentAudio!;
    final isPlaying = playbackState.status == PlaybackStatus.playing;
    final favorites = ref.watch(userFavoritesProvider);
    final isFavorite = favorites.contains(currentTrack.id);
    final homeState = ref.watch(audioHomeStateProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final imageConfig = ref
        .watch(imageSizeConfigProvider)
        .maybeWhen(
          data: (config) => config,
          orElse: () => ImageSizeConfig.defaults,
        );

    final allBhajans = homeState.latestAudio;
    final upNextList = allBhajans
        .where((b) => b.id != currentTrack.id)
        .toList();

    final notifier = ref.read(playbackStateProvider.notifier);
    final hasNextTrack = notifier.hasNext;
    final hasPreviousTrack = notifier.hasPrevious;
    final isBeyondRestartThreshold =
        playbackState.position > kSmartPreviousRestartThreshold;
    final totalDuration = currentTrack.duration.inSeconds > 0
        ? currentTrack.duration
        : const Duration(seconds: 630);

    return Scaffold(
      backgroundColor: isDark
          ? const Color(0xFF181614)
          : const Color(0xFFFFFDF9),
      appBar: AppBar(
        backgroundColor: isDark
            ? const Color(0xFF201D1A)
            : const Color(0xFFFAF7F2),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.chevron_left_rounded, size: 28),
          // Routed through the one canonical policy so the AppBar button and
          // the Android system Back button can never disagree.
          onPressed: () => ref
              .read(backNavigationControllerProvider)
              .handleBack(context, source: BackSource.appBar),
          tooltip: 'पीछे जाएं',
        ),
        title: Text(
          'अब चल रहा है',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: isDark ? const Color(0xFFE7E5E4) : const Color(0xFF1C1917),
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: Icon(
              isFavorite
                  ? Icons.favorite_rounded
                  : Icons.favorite_border_rounded,
              color: isFavorite ? Colors.red : const Color(0xFFA8A29E),
            ),
            onPressed: () {
              ref
                  .read(userFavoritesProvider.notifier)
                  .toggleFavorite(currentTrack.id);
            },
            tooltip: 'पसंदीदा',
          ),
          IconButton(
            icon: const Icon(Icons.share_rounded, color: Color(0xFFA8A29E)),
            onPressed: () => _handleShare(currentTrack),
            tooltip: 'शेयर करें',
          ),
          IconButton(
            icon: const Icon(Icons.more_vert_rounded, color: Color(0xFFA8A29E)),
            onPressed: () => _showBhajanDetailsMenu(context, currentTrack),
            tooltip: 'अधिक विकल्प',
          ),
        ],
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          children: [
            // Large Rounded Track Thumbnail Poster Card (square per image-size
            // config; shown uncropped).
            Center(
              child: SizedBox(
                height: 300,
                child: AspectRatio(
                  aspectRatio: imageConfig.artworkAspectRatio,
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.amber.shade900.withValues(alpha: 0.15),
                          blurRadius: 16,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(24),
                      child: SSPImage(
                        currentTrack.thumbnailUrl,
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Track Title & Speaker/Artist
            Text(
              currentTrack.title,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w900,
                color: isDark ? Colors.amber.shade400 : const Color(0xFF7F1D1D),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 4),
            Text(
              currentTrack.speaker,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: isDark
                    ? const Color(0xFFA8A29E)
                    : const Color(0xFF57534E),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),

            // Reusable progress bar: tap to seek, drag to scrub,
            // long-press to hold-scrub. The engine is only touched on release.
            SSPPlayerProgressBar(
              position: playbackState.position,
              duration: totalDuration,
              enabled: true,
              activeColor: isDark
                  ? Colors.amber.shade400
                  : Colors.amber.shade800,
              inactiveColor: isDark
                  ? const Color(0xFF292524)
                  : const Color(0xFFE5DACE),
              onScrubStart: () => setState(() => _isScrubbing = true),
              onScrubUpdate: notifier.updateScrub,
              onScrubEnd: () {
                notifier.endScrub();
                if (mounted) setState(() => _isScrubbing = false);
              },
              onScrubCancel: () {
                notifier.cancelScrub();
                if (mounted) setState(() => _isScrubbing = false);
              },
              onSeek: notifier.seekTo,
            ),
            SSPPlayerTimeLabels(
              position: playbackState.position,
              duration: totalDuration,
              scrubbing: _isScrubbing,
            ),
            const SizedBox(height: 16),

            // Primary Playback Controls
            //
            // * Previous / Next are SMART: they consult the shared policy, so
            //   Previous restarts the track when the user is already a few
            //   seconds into it.
            // * The 5s nudge buttons are HOLD buttons: tap for one 5s step,
            //   press and hold for a continuous 10s-per-tick seek.
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                // Shuffle
                IconButton(
                  icon: Icon(
                    Icons.shuffle_rounded,
                    color: playbackState.isShuffleEnabled
                        ? Colors.amber.shade600
                        : const Color(0xFFA8A29E),
                    size: 20,
                  ),
                  onPressed: notifier.toggleShuffle,
                  tooltip: 'शफल',
                ),

                // SMART Previous
                SSPPlayerControlButton(
                  icon: Icons.skip_previous_rounded,
                  iconSize: 28,
                  size: 44,
                  onPressed: notifier.playPrevious,
                  enabled: hasPreviousTrack || isBeyondRestartThreshold,
                  tooltip: 'पिछला ट्रैक',
                ),

                // HOLD to seek 5s backwards
                SSPHoldToSeekButton.backward(
                  position: playbackState.position,
                  total: totalDuration,
                  onPressed: notifier.rewind5,
                  onHoldSeek: notifier.seekTo,
                  semanticLabel: '5s पीछे',
                  holdSemanticLabel: 'पकड़कर 10s पीछे',
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Stack(
                        alignment: Alignment.center,
                        children: [
                          const Icon(Icons.rotate_left_rounded, size: 26),
                          Positioned(
                            top: 5,
                            child: Text(
                              '5',
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: isDark
                                    ? Colors.white
                                    : const Color(0xFF1C1917),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const Text(
                        '5s पीछे',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),

                // Play/Pause Main Gradient Button
                SSPPlayerControlButton(
                  icon: isPlaying
                      ? Icons.pause_rounded
                      : Icons.play_arrow_rounded,
                  iconSize: 32,
                  size: 58,
                  iconColor: Colors.white,
                  gradient: const LinearGradient(
                    colors: [
                      Color(0xFFC2410C),
                      Color(0xFFEA580C),
                      Color(0xFFD97706),
                    ],
                    begin: Alignment.bottomLeft,
                    end: Alignment.topRight,
                  ),
                  onPressed: notifier.togglePlayPause,
                  tooltip: isPlaying ? 'रोकें' : 'चलाएँ',
                ),

                // HOLD to seek 5s forwards
                SSPHoldToSeekButton.forward(
                  position: playbackState.position,
                  total: totalDuration,
                  onPressed: notifier.forward5,
                  onHoldSeek: notifier.seekTo,
                  semanticLabel: '5s आगे',
                  holdSemanticLabel: 'पकड़कर 10s आगे',
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Stack(
                        alignment: Alignment.center,
                        children: [
                          const Icon(Icons.rotate_right_rounded, size: 26),
                          Positioned(
                            top: 5,
                            child: Text(
                              '5',
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: isDark
                                    ? Colors.white
                                    : const Color(0xFF1C1917),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const Text(
                        '5s आगे',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),

                // SMART Next
                SSPPlayerControlButton(
                  icon: Icons.skip_next_rounded,
                  iconSize: 28,
                  size: 44,
                  onPressed: notifier.playNext,
                  enabled: hasNextTrack || playbackState.isRepeatEnabled,
                  tooltip: 'अगला ट्रैक',
                ),

                // Repeat
                IconButton(
                  icon: Icon(
                    Icons.repeat_rounded,
                    color: playbackState.isRepeatEnabled
                        ? Colors.amber.shade600
                        : const Color(0xFFA8A29E),
                    size: 20,
                  ),
                  onPressed: notifier.toggleRepeat,
                  tooltip: 'दोहराएँ',
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Secondary Action Grid (Playlist, Favorite, Share, Lyrics)
            Row(
              children: [
                // Add to Playlist
                Expanded(
                  child: _buildSecondaryActionButton(
                    context,
                    icon: Icons.playlist_add_rounded,
                    label: 'प्लेलिस्ट में जोड़ें',
                    iconColor: Colors.amber.shade600,
                    onTap: () => _showPlaylistModal(context, currentTrack),
                  ),
                ),
                const SizedBox(width: 8),

                // Favorite
                Expanded(
                  child: _buildSecondaryActionButton(
                    context,
                    icon: isFavorite
                        ? Icons.favorite_rounded
                        : Icons.favorite_border_rounded,
                    label: 'पसंदीदा',
                    iconColor: isFavorite
                        ? Colors.red
                        : const Color(0xFF57534E),
                    onTap: () {
                      ref
                          .read(userFavoritesProvider.notifier)
                          .toggleFavorite(currentTrack.id);
                    },
                  ),
                ),
                const SizedBox(width: 8),

                // Share
                Expanded(
                  child: _buildSecondaryActionButton(
                    context,
                    icon: Icons.share_rounded,
                    label: 'शेयर करें',
                    iconColor: Colors.blue.shade600,
                    onTap: () => _handleShare(currentTrack),
                  ),
                ),
                const SizedBox(width: 8),

                // Lyrics
                Expanded(
                  child: _buildSecondaryActionButton(
                    context,
                    icon: Icons.lyrics_rounded,
                    label: 'बोल (लिरिक्स)',
                    iconColor: Colors.orange.shade700,
                    onTap: () => _showLyricsModal(context, currentTrack),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // "आगे सुनें (Up Next)" Queue Section
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Flexible(
                      child: Text(
                        'आगे सुनें (Up Next)',
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: isDark
                              ? Colors.white
                              : const Color(0xFF1C1917),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    TextButton(
                      onPressed: () => context.push('/audio/bhajans'),
                      child: Text(
                        'सभी भजन देखें →',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.amber.shade700,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                // Queue List Items
                ...upNextList
                    .take(5)
                    .map(
                      (item) => Padding(
                        padding: const EdgeInsets.only(bottom: 8.0),
                        child: Container(
                          decoration: BoxDecoration(
                            color: isDark
                                ? const Color(0xFF221F1C)
                                : Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isDark
                                  ? const Color(0xFF292524)
                                  : const Color(0xFFF3EBE0),
                            ),
                          ),
                          child: ListTile(
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 2,
                            ),
                            leading: Stack(
                              alignment: Alignment.center,
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(8),
                                  child: SizedBox(
                                    width: 46,
                                    height: 46,
                                    child: SSPImage(
                                      item.thumbnailUrl,
                                      fit: BoxFit.cover,
                                    ),
                                  ),
                                ),
                                Container(
                                  width: 46,
                                  height: 46,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(8),
                                    color: Colors.black26,
                                  ),
                                  child: const Icon(
                                    Icons.play_arrow_rounded,
                                    color: Colors.white,
                                    size: 20,
                                  ),
                                ),
                              ],
                            ),
                            title: Text(
                              item.title,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            subtitle: Text(
                              item.speaker,
                              style: const TextStyle(
                                fontSize: 11,
                                color: Color(0xFF78716C),
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  _formatTime(item.duration.inSeconds),
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: Color(0xFFA8A29E),
                                  ),
                                ),
                                const SizedBox(width: 4),
                                IconButton(
                                  icon: const Icon(
                                    Icons.more_vert_rounded,
                                    size: 18,
                                  ),
                                  onPressed: () =>
                                      _showPlaylistModal(context, item),
                                ),
                              ],
                            ),
                            onTap: () {
                              // Already inside the player: the canonical
                              // controller resolves the "player already
                              // visible" case, so this can never stack a second
                              // player, and the track is still swapped in the
                              // one audio session.
                              ref.openAudio(
                                context,
                                item,
                                queue: upNextList,
                                index: upNextList.indexOf(item),
                                source: 'now-playing-up-next',
                              );
                            },
                          ),
                        ),
                      ),
                    ),
              ],
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildSecondaryActionButton(
    BuildContext context, {
    required IconData icon,
    required String label,
    required Color iconColor,
    required VoidCallback onTap,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF221F1C) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? const Color(0xFF292524) : const Color(0xFFF0E6D8),
        ),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 4),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, color: iconColor, size: 20),
                const SizedBox(height: 4),
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _formatTime(int seconds) {
    final min = (seconds ~/ 60).toString().padLeft(2, '0');
    final sec = (seconds % 60).toString().padLeft(2, '0');
    return '$min:$sec';
  }

  void _handleShare(AudioEntity bhajan) {
    SharePlus.instance.share(
      ShareParams(
        text:
            'सुनें: ${bhajan.title} - ${bhajan.speaker} | संतमत सत्संग प्रचार',
      ),
    );
  }

  void _showBhajanDetailsMenu(BuildContext context, AudioEntity bhajan) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        final isDark = Theme.of(ctx).brightness == Brightness.dark;
        return Container(
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF221F1C) : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(
                  Icons.playlist_add_rounded,
                  color: Colors.amber,
                ),
                title: const Text('प्लेलिस्ट में जोड़ें'),
                onTap: () {
                  Navigator.pop(ctx);
                  _showPlaylistModal(context, bhajan);
                },
              ),
              ListTile(
                leading: const Icon(Icons.lyrics_rounded, color: Colors.orange),
                title: const Text('बोल (लिरिक्स) देखें'),
                onTap: () {
                  Navigator.pop(ctx);
                  _showLyricsModal(context, bhajan);
                },
              ),
              ListTile(
                leading: const Icon(Icons.share_rounded, color: Colors.blue),
                title: const Text('शेयर करें'),
                onTap: () {
                  Navigator.pop(ctx);
                  _handleShare(bhajan);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  // Playlist Modal Dialog / Bottom Sheet
  void _showPlaylistModal(BuildContext context, AudioEntity bhajan) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Consumer(
              builder: (context, ref, child) {
                final playlists = ref.watch(userPlaylistsProvider);
                final isDark = Theme.of(context).brightness == Brightness.dark;

                return Padding(
                  padding: EdgeInsets.only(
                    bottom: MediaQuery.of(context).viewInsets.bottom,
                  ),
                  child: Container(
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF221F1C) : Colors.white,
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(24),
                      ),
                    ),
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Header
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Row(
                              children: [
                                Icon(
                                  Icons.playlist_add_rounded,
                                  color: Colors.amber,
                                ),
                                SizedBox(width: 8),
                                Text(
                                  'प्लेलिस्ट में जोड़ें',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                            IconButton(
                              icon: const Icon(Icons.close_rounded),
                              onPressed: () => Navigator.pop(ctx),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),

                        // Current Track Banner
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: isDark
                                ? const Color(0xFF292524)
                                : Colors.amber.shade50,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: SizedBox(
                                  width: 40,
                                  height: 40,
                                  child: SSPImage(
                                    bhajan.thumbnailUrl,
                                    fit: BoxFit.cover,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      bhajan.title,
                                      style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.bold,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    Text(
                                      bhajan.speaker,
                                      style: const TextStyle(
                                        fontSize: 11,
                                        color: Color(0xFF78716C),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Create New Playlist Form
                        Row(
                          children: [
                            Expanded(
                              child: TextField(
                                controller: _playlistNameController,
                                style: const TextStyle(fontSize: 13),
                                decoration: InputDecoration(
                                  hintText: 'नई प्लेलिस्ट का नाम...',
                                  isDense: true,
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 10,
                                  ),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            ElevatedButton.icon(
                              onPressed: () {
                                final text = _playlistNameController.text;
                                if (text.trim().isNotEmpty) {
                                  ref
                                      .read(userPlaylistsProvider.notifier)
                                      .createPlaylist(text.trim(), bhajan.id);
                                  _playlistNameController.clear();
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(
                                        '"$text" प्लेलिस्ट बनाई गई!',
                                      ),
                                    ),
                                  );
                                }
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.amber.shade700,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              icon: const Icon(Icons.add_rounded, size: 16),
                              label: const Text('बनाएं'),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),

                        const Text(
                          'आपकी प्लेलिस्ट',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey,
                          ),
                        ),
                        const SizedBox(height: 8),

                        // Playlists List
                        ConstrainedBox(
                          constraints: const BoxConstraints(maxHeight: 200),
                          child: ListView.separated(
                            shrinkWrap: true,
                            itemCount: playlists.length,
                            separatorBuilder: (_, __) =>
                                const SizedBox(height: 6),
                            itemBuilder: (context, index) {
                              final pl = playlists[index];
                              final isInPlaylist = pl.bhajanIds.contains(
                                bhajan.id,
                              );

                              return Container(
                                decoration: BoxDecoration(
                                  color: isInPlaylist
                                      ? isDark
                                            ? const Color(0xFF451A03)
                                            : Colors.amber.shade50
                                      : isDark
                                      ? const Color(0xFF1C1917)
                                      : Colors.white,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: isInPlaylist
                                        ? Colors.amber.shade500
                                        : const Color(0xFFD6D3D1),
                                  ),
                                ),
                                child: ListTile(
                                  dense: true,
                                  title: Text(
                                    pl.name,
                                    style: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  subtitle: Text(
                                    '${pl.bhajanIds.length} भजन',
                                    style: const TextStyle(fontSize: 11),
                                  ),
                                  trailing: Container(
                                    width: 24,
                                    height: 24,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: isInPlaylist
                                          ? Colors.amber.shade700
                                          : Colors.transparent,
                                      border: Border.all(
                                        color: isInPlaylist
                                            ? Colors.amber.shade700
                                            : Colors.grey,
                                      ),
                                    ),
                                    child: isInPlaylist
                                        ? const Icon(
                                            Icons.check_rounded,
                                            size: 16,
                                            color: Colors.white,
                                          )
                                        : null,
                                  ),
                                  onTap: () {
                                    ref
                                        .read(userPlaylistsProvider.notifier)
                                        .toggleBhajanInPlaylist(
                                          pl.id,
                                          bhajan.id,
                                        );
                                  },
                                ),
                              );
                            },
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Done button
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () => Navigator.pop(ctx),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF292524),
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                            child: const Text(
                              'पूर्ण करें',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            );
          },
        );
      },
    );
  }

  // Synchronized Devanagari Lyrics Modal Sheet
  void _showLyricsModal(BuildContext context, AudioEntity bhajan) {
    final rawLyrics = bhajan.lyrics;
    final lyrics = rawLyrics ?? '';
    final hasLyrics = lyrics.trim().isNotEmpty;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        final isDark = Theme.of(ctx).brightness == Brightness.dark;

        return Container(
          height: MediaQuery.of(ctx).size.height * 0.75,
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1C1A17) : const Color(0xFFFFFDF9),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          ),
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          bhajan.title,
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                            color: isDark
                                ? Colors.amber.shade400
                                : const Color(0xFF1C1917),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          bhajan.speaker,
                          style: TextStyle(
                            fontSize: 12,
                            color: isDark
                                ? const Color(0xFFA8A29E)
                                : Colors.amber.shade900,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const Divider(height: 20),

              // Lyrics Body
              Expanded(
                child: hasLyrics
                    ? SingleChildScrollView(
                        physics: const BouncingScrollPhysics(),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          child: Column(
                            children: lyrics.split('\n\n').map((paragraph) {
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 16),
                                child: Text(
                                  paragraph,
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    fontSize: 16,
                                    height: 1.8,
                                    fontWeight: FontWeight.w600,
                                    color: isDark
                                        ? const Color(0xFFE7E5E4)
                                        : const Color(0xFF1C1917),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                      )
                    : Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.lyrics_rounded,
                                size: 40,
                                color: Colors.grey,
                              ),
                              const SizedBox(height: 12),
                              Text(
                                'इस भजन के लिए बोल उपलब्ध नहीं हैं।',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: isDark
                                      ? const Color(0xFFA8A29E)
                                      : const Color(0xFF57534E),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
              ),

              const Divider(height: 20),

              // Actions (Copy & Share)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  OutlinedButton.icon(
                    onPressed: () {
                      Clipboard.setData(
                        ClipboardData(text: '${bhajan.title}\n\n$lyrics'),
                      );
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('लिरिक्स कॉपी किए गए!'),
                          duration: Duration(seconds: 2),
                        ),
                      );
                    },
                    style: OutlinedButton.styleFrom(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                    ),
                    icon: const Icon(Icons.copy_rounded, size: 16),
                    label: const Text('कॉपी करें'),
                  ),
                  ElevatedButton.icon(
                    onPressed: () {
                      SharePlus.instance.share(
                        ShareParams(text: '${bhajan.title}\n\n$lyrics'),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.amber.shade800,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                    ),
                    icon: const Icon(Icons.share_rounded, size: 16),
                    label: const Text('शेयर करें'),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}
