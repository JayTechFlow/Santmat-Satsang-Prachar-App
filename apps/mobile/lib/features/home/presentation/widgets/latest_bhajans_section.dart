import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../audio/domain/entities/audio_category_entity.dart';
import '../../../audio/domain/entities/audio_entity.dart';
import '../../../audio/domain/entities/playback_state_entity.dart';
import '../../../audio/presentation/providers/audio_providers.dart';
import '../../../../core/player/canonical_player_controller.dart';
import '../../domain/entities/latest_audio_entity.dart';
import '../../../../shared/widgets/audio_wave_animation.dart';

class LatestBhajansSection extends ConsumerWidget {
  final List<LatestAudioEntity> latestAudios;

  const LatestBhajansSection({super.key, this.latestAudios = const []});

  List<AudioEntity> _resolveBhajans(List<LatestAudioEntity> items) {
    if (items.isNotEmpty) {
      return items.map((item) {
        return AudioEntity(
          id: item.id,
          title: item.title,
          subtitle: item.speaker,
          description: item.speaker,
          speaker: item.speaker,
          category: const AudioCategoryEntity(
            id: 'bhajan',
            name: 'भजन',
            description: '',
          ),
          duration: item.duration,
          language: 'हिंदी',
          thumbnailUrl:
              'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
          artworkUrl:
              'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
          releaseDate: DateTime.now(),
          playCount: 100,
          favoriteCount: 10,
          isFeatured: true,
          isRecentlyAdded: true,
          isPopular: true,
          audioUrl: item.audioUrl.isNotEmpty
              ? item.audioUrl
              : 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        );
      }).toList();
    }

    // Default authentic bhajans matching HomeScreen.tsx
    return [
      AudioEntity(
        id: 'bhajan-1',
        title: 'प्रभु से प्रीत लगाई रे',
        subtitle: 'स्वर : पूज्य श्री',
        description: 'पदावली भजन',
        speaker: 'स्वर : पूज्य श्री',
        category: const AudioCategoryEntity(
          id: 'bhajan',
          name: 'भजन',
          description: '',
        ),
        duration: const Duration(minutes: 10, seconds: 30),
        language: 'हिंदी',
        thumbnailUrl:
            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
        artworkUrl:
            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
        releaseDate: DateTime.now(),
        playCount: 15263,
        favoriteCount: 120,
        isFeatured: true,
        isRecentlyAdded: true,
        isPopular: true,
        audioUrl:
            'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      ),
      AudioEntity(
        id: 'bhajan-2',
        title: 'मनवा रे सत्संग कर ले',
        subtitle: 'स्वर : पूज्य श्री',
        description: 'पदावली भजन',
        speaker: 'स्वर : पूज्य श्री',
        category: const AudioCategoryEntity(
          id: 'bhajan',
          name: 'भजन',
          description: '',
        ),
        duration: const Duration(minutes: 8, seconds: 42),
        language: 'हिंदी',
        thumbnailUrl:
            'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80',
        artworkUrl:
            'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80',
        releaseDate: DateTime.now(),
        playCount: 12985,
        favoriteCount: 95,
        isFeatured: true,
        isRecentlyAdded: true,
        isPopular: true,
        audioUrl:
            'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      ),
      AudioEntity(
        id: 'bhajan-3',
        title: 'गुरु चरणन की सेवा',
        subtitle: 'स्वर : स्वामी वेदानंद',
        description: 'गुरु वंदना',
        speaker: 'स्वर : स्वामी वेदानंद',
        category: const AudioCategoryEntity(
          id: 'bhajan',
          name: 'भजन',
          description: '',
        ),
        duration: const Duration(minutes: 7, seconds: 15),
        language: 'हिंदी',
        thumbnailUrl:
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
        artworkUrl:
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
        releaseDate: DateTime.now(),
        playCount: 9840,
        favoriteCount: 80,
        isFeatured: true,
        isRecentlyAdded: true,
        isPopular: false,
        audioUrl:
            'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      ),
      AudioEntity(
        id: 'bhajan-4',
        title: 'आरती तन मन धन से',
        subtitle: 'स्वर : आश्रम साधक',
        description: 'आरती',
        speaker: 'स्वर : आश्रम साधक',
        category: const AudioCategoryEntity(
          id: 'bhajan',
          name: 'भजन',
          description: '',
        ),
        duration: const Duration(minutes: 6, seconds: 10),
        language: 'हिंदी',
        thumbnailUrl:
            'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=600&auto=format&fit=crop&q=80',
        artworkUrl:
            'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=600&auto=format&fit=crop&q=80',
        releaseDate: DateTime.now(),
        playCount: 8410,
        favoriteCount: 65,
        isFeatured: false,
        isRecentlyAdded: true,
        isPopular: false,
        audioUrl:
            'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      ),
    ];
  }

  String _formatDuration(Duration d) {
    final minutes = d.inMinutes;
    final seconds = (d.inSeconds % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final playbackState = ref.watch(playbackStateProvider);
    final playbackNotifier = ref.read(playbackStateProvider.notifier);

    // Also check if audio home provider has latest audios
    final audioHomeState = ref.watch(audioHomeStateProvider);
    List<AudioEntity> bhajansToDisplay = [];
    if (audioHomeState.latestAudio.isNotEmpty) {
      bhajansToDisplay = audioHomeState.latestAudio.take(4).toList();
    } else {
      bhajansToDisplay = _resolveBhajans(latestAudios).take(4).toList();
    }

    final Color titleColor = isDark ? Colors.white : const Color(0xFF1C1917);
    final Color textColor = isDark
        ? const Color(0xFFA8A29E)
        : const Color(0xFF78716C);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section Header Row
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Flexible(
              child: Row(
                children: [
                  const Icon(
                    Icons.music_note_rounded,
                    size: 20.0,
                    color: Color(0xFFEA580C),
                  ),
                  const SizedBox(width: 6.0),
                  Flexible(
                    child: Text(
                      'नए भजन एवं पद',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 16.0,
                        fontWeight: FontWeight.bold,
                        color: titleColor,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            GestureDetector(
              onTap: () => context.go('/audio'),
              child: const Padding(
                padding: EdgeInsets.symmetric(vertical: 4.0, horizontal: 2.0),
                child: Text(
                  'सभी देखें →',
                  style: TextStyle(
                    fontSize: 12.0,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFD97706),
                  ),
                ),
              ),
            ),
          ],
        ),

        const SizedBox(height: 10.0),

        // Bhajan Items List
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: bhajansToDisplay.length,
          separatorBuilder: (context, index) => const SizedBox(height: 8.0),
          itemBuilder: (context, index) {
            final bhajan = bhajansToDisplay[index];
            final bool isCurrentTrack =
                playbackState.currentAudio?.id == bhajan.id;
            final bool isPlaying =
                isCurrentTrack &&
                playbackState.status == PlaybackStatus.playing;

            final Color itemBg = isCurrentTrack
                ? (isDark ? const Color(0x33F59E0B) : const Color(0xFFFFF7ED))
                : (isDark ? const Color(0xFF221F1C) : Colors.white);

            final Color borderColor = isCurrentTrack
                ? (isDark ? const Color(0x66F59E0B) : const Color(0xFFFCD34D))
                : (isDark ? const Color(0xFF292524) : const Color(0xFFF2E8DC));

            return Semantics(
              button: true,
              label: '${bhajan.title}, ${bhajan.speaker}',
              child: GestureDetector(
                // PHASE 3: the home latest row opens the Full Player, with
                // the visible latest list as the queue.
                onTap: () => ref.openAudio(
                  context,
                  bhajan,
                  queue: bhajansToDisplay,
                  index: bhajansToDisplay.indexOf(bhajan),
                  source: 'home-latest',
                ),
                child: Container(
                  padding: const EdgeInsets.all(10.0),
                  decoration: BoxDecoration(
                    color: itemBg,
                    borderRadius: BorderRadius.circular(16.0),
                    border: Border.all(color: borderColor, width: 1.0),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(
                          alpha: isDark ? 0.15 : 0.03,
                        ),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      // Thumbnail Image with Equalizer Overlay
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12.0),
                        child: SizedBox(
                          width: 48.0,
                          height: 48.0,
                          child: Stack(
                            fit: StackFit.expand,
                            children: [
                              Image.network(
                                bhajan.thumbnailUrl,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) =>
                                    Container(
                                      color: isDark
                                          ? const Color(0xFF292524)
                                          : const Color(0xFFF5F5F4),
                                      child: const Icon(
                                        Icons.music_note_rounded,
                                        color: Colors.grey,
                                      ),
                                    ),
                              ),
                              if (isCurrentTrack && isPlaying)
                                Container(
                                  color: Colors.black.withValues(alpha: 0.45),
                                  alignment: Alignment.center,
                                  child: const AudioWaveAnimation(
                                    isPlaying: true,
                                    color: Color(0xFFFBBF24),
                                    height: 18.0,
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(width: 12.0),

                      // Title & Speaker
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              bhajan.title,
                              style: TextStyle(
                                fontSize: 14.0,
                                fontWeight: FontWeight.bold,
                                color: isCurrentTrack
                                    ? (isDark
                                          ? const Color(0xFFFBBF24)
                                          : const Color(0xFFB45309))
                                    : titleColor,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2.0),
                            Text(
                              bhajan.speaker,
                              style: TextStyle(
                                fontSize: 12.0,
                                color: textColor,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(width: 8.0),

                      // Duration & Play/Pause Action Button
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            _formatDuration(bhajan.duration),
                            style: TextStyle(
                              fontSize: 12.0,
                              fontWeight: FontWeight.w500,
                              color: textColor,
                            ),
                          ),
                          const SizedBox(width: 10.0),
                          GestureDetector(
                            onTap: () {
                              if (isCurrentTrack) {
                                playbackNotifier.togglePlayPause();
                                return;
                              }
                              ref.openAudio(
                                context,
                                bhajan,
                                queue: bhajansToDisplay,
                                index: bhajansToDisplay.indexOf(bhajan),
                                source: 'home-latest-control',
                              );
                            },
                            child: Container(
                              width: 36.0,
                              height: 36.0,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: isCurrentTrack && isPlaying
                                    ? const Color(0xFFD97706)
                                    : (isDark
                                          ? const Color(0xFF292524)
                                          : const Color(0xFFF5F5F4)),
                              ),
                              child: Icon(
                                isCurrentTrack && isPlaying
                                    ? Icons.pause_rounded
                                    : Icons.play_arrow_rounded,
                                size: 20.0,
                                color: isCurrentTrack && isPlaying
                                    ? Colors.white
                                    : (isDark
                                          ? const Color(0xFFD6D3D1)
                                          : const Color(0xFF44403C)),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ],
    );
  }
}
