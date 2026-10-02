import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:share_plus/share_plus.dart';

import '../../../../shared/design_system/components/ssp_app_bar.dart';
import '../../../../shared/design_system/components/ssp_error_state.dart';
import '../../../../shared/design_system/components/ssp_loading_state.dart';
import '../../domain/entities/stuti_vinati_entity.dart';
import '../providers/stuti_vinati_providers.dart';
import '../../../audio/presentation/providers/audio_providers.dart';
import '../../../audio/domain/entities/playback_state_entity.dart';
import '../../../audio/domain/mappers/stuti_audio_mapper.dart';
import '../../../../core/player/canonical_player_controller.dart';

class StutiVinatiHomePage extends ConsumerStatefulWidget {
  const StutiVinatiHomePage({super.key});

  @override
  ConsumerState<StutiVinatiHomePage> createState() =>
      _StutiVinatiHomePageState();
}

class _StutiVinatiHomePageState extends ConsumerState<StutiVinatiHomePage> {
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _shareContent(StutiVinati stuti) async {
    final textToShare =
        '${stuti.title}\n\n${stuti.textContent ?? ''}\n\n— संतमत सत्संग प्रचार';
    try {
      await SharePlus.instance.share(ShareParams(text: textToShare));
    } catch (_) {
      Clipboard.setData(ClipboardData(text: textToShare));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('स्तुति पाठ कॉपी किया गया!')),
        );
      }
    }
  }

  String _formatDuration(Duration duration) {
    final minutes = duration.inMinutes.remainder(60).toString().padLeft(2, '0');
    final seconds = duration.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final prayersAsync = ref.watch(stutiVinatiListProvider);
    final playbackState = ref.watch(playbackStateProvider);
    final favorites = ref.watch(stutiFavoritesProvider);

    return Scaffold(
      backgroundColor: isDark
          ? const Color(0xFF181614)
          : const Color(0xFFFFFDF9),
      appBar: SSPAppBar.standard(
        title: 'स्तुति-विनती',
        subtitle: '॥ सत्य ही हमारा धर्म है ॥',
        automaticallyImplyLeading: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.search_rounded, color: Color(0xFFFDE68A)),
            tooltip: 'खोजें',
            onPressed: () => context.push('/search'),
          ),
        ],
      ),
      body: prayersAsync.when(
        loading: () => const SSPLoadingState(),
        error: (error, stack) => SSPErrorState(
          message: error.toString(),
          onRetry: () => ref.refresh(stutiVinatiListProvider),
        ),
        data: (prayers) {
          final morningStuti = _getStutiByType(
            prayers,
            'morning',
            'प्रातःकालीन स्तुति',
          );
          final eveningStuti = _getStutiByType(
            prayers,
            'evening',
            'संध्याकालीन स्तुति',
          );

          return SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
            physics: const BouncingScrollPhysics(),
            child: Column(
              children: [
                // 1. Morning Stuti Card
                _buildReferenceStutiCard(
                  theme: theme,
                  isDark: isDark,
                  queue: prayers,
                  stuti: morningStuti,
                  cardType: 'morning',
                  headerTitle: 'प्रातःकालीन स्तुति',
                  headerSubtitle: 'सुबह की प्रार्थना - नई ऊर्जा के साथ',
                  iconData: Icons.wb_sunny_outlined,
                  isFav: favorites.contains(morningStuti.id),
                  playbackState: playbackState,
                ),
                const SizedBox(height: 20),

                // 2. Evening Stuti Card
                _buildReferenceStutiCard(
                  theme: theme,
                  isDark: isDark,
                  queue: prayers,
                  stuti: eveningStuti,
                  cardType: 'evening',
                  headerTitle: 'संध्याकालीन स्तुति',
                  headerSubtitle: 'शाम की प्रार्थना - शांति और ध्यान के लिए',
                  iconData: Icons.nights_stay_outlined,
                  isFav: favorites.contains(eveningStuti.id),
                  playbackState: playbackState,
                ),
              ],
            ),
          );
        },
      ),
      bottomSheet: _buildBottomAudioPlayerBar(
        context: context,
        theme: theme,
        isDark: isDark,
        playbackState: playbackState,
      ),
    );
  }

  StutiVinati _getStutiByType(
    List<StutiVinati> prayers,
    String type,
    String fallbackTitle,
  ) {
    final matching = prayers.where((p) => p.type == type).toList();
    if (matching.isNotEmpty) return matching.first;
    return StutiVinati(
      id: type,
      title: fallbackTitle,
      subtitle: 'पुष्प गुरुदेव की वाणी में',
      type: type,
      textContent: 'प्रातः काल की यह स्तुति ध्यान से सुनें...',
    );
  }

  Widget _buildReferenceStutiCard({
    required ThemeData theme,
    required bool isDark,
    required List<StutiVinati> queue,
    required StutiVinati stuti,
    required String cardType,
    required String headerTitle,
    required String headerSubtitle,
    required IconData iconData,
    required bool isFav,
    required PlaybackStateEntity playbackState,
  }) {
    final bool isMorning = cardType == 'morning';
    final Color accentColor = isMorning
        ? (isDark ? const Color(0xFFF59E0B) : const Color(0xFFD97706))
        : (isDark ? const Color(0xFFA855F7) : const Color(0xFF7E22CE));

    final Color bgColor = isDark
        ? (isMorning ? const Color(0xFF24201A) : const Color(0xFF221A28))
        : (isMorning ? const Color(0xFFFFFDF5) : const Color(0xFFFAF5FF));

    final Color borderColor = isDark
        ? (isMorning ? const Color(0xFF382F22) : const Color(0xFF32223D))
        : (isMorning ? const Color(0xFFFDE68A) : const Color(0xFFE9D5FF));

    final bool isPlayingThis =
        playbackState.currentAudio?.id == stuti.id &&
        playbackState.status == PlaybackStatus.playing;

    // PHASE 3: Stuti is the same single audio session as Bhajan, so the card
    // opens the same Full Player through the same canonical method. The visible
    // Stuti list becomes the queue, so Previous/Next work here too.
    final stutiQueue = queue.map(stutiToAudioEntity).toList(growable: false);
    final stutiIndex = queue.indexWhere((s) => s.id == stuti.id);
    void openStutiPlayer() {
      ref.openAudio(
        context,
        stutiToAudioEntity(stuti),
        queue: stutiQueue,
        index: stutiIndex < 0 ? 0 : stutiIndex,
        source: 'stuti-vinati',
      );
    }

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: openStutiPlayer,
      child: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: borderColor, width: 1.5),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Header (Icon + Title + Subtitle + Dropdown arrow)
            Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Icon(iconData, color: accentColor, size: 22),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        headerTitle,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: isDark
                              ? const Color(0xFFF5F5F4)
                              : const Color(0xFF1C1917),
                        ),
                      ),
                      Text(
                        headerSubtitle,
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark
                              ? const Color(0xFFA8A29E)
                              : const Color(0xFF78716C),
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.keyboard_arrow_down_rounded,
                  color: isDark
                      ? const Color(0xFFA8A29E)
                      : const Color(0xFF78716C),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // 2. Main Media Area (Artwork + Title/Artist)
            Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    width: 64,
                    height: 64,
                    color: accentColor.withValues(alpha: 0.15),
                    child:
                        stuti.bannerImage != null &&
                            stuti.bannerImage!.isNotEmpty
                        ? Image.network(stuti.bannerImage!, fit: BoxFit.cover)
                        : Icon(iconData, color: accentColor, size: 32),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        stuti.title,
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: isDark
                              ? Colors.white
                              : const Color(0xFF1C1917),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        stuti.subtitle ?? 'पुष्प गुरुदेव की वाणी में',
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark
                              ? const Color(0xFFA8A29E)
                              : const Color(0xFF78716C),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // 3. Play Button + Waveform + Progress Bar
            Row(
              children: [
                GestureDetector(
                  onTap: () {
                    // The inline control stays a transport control: it pauses
                    // the active track, and otherwise opens the Full Player
                    // rather than starting playback behind the Mini Player.
                    if (isPlayingThis) {
                      ref.read(playbackStateProvider.notifier).pause();
                      return;
                    }
                    openStutiPlayer();
                  },
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: accentColor,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: accentColor.withValues(alpha: 0.3),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Icon(
                      isPlayingThis
                          ? Icons.pause_rounded
                          : Icons.play_arrow_rounded,
                      color: Colors.white,
                      size: 26,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    children: [
                      _buildWaveformBars(accentColor, isPlayingThis),
                      const SizedBox(height: 4),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            isPlayingThis
                                ? _formatDuration(playbackState.position)
                                : '00:00',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: isDark
                                  ? const Color(0xFFA8A29E)
                                  : const Color(0xFF78716C),
                            ),
                          ),
                          Text(
                            stuti.duration ?? '18:42',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: isDark
                                  ? const Color(0xFFA8A29E)
                                  : const Color(0xFF78716C),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // 4. Action Row (Lyrics, Favorite, Share)
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildActionButton(
                    icon: Icons.music_note_outlined,
                    label: 'लिरिक्स पढ़ें',
                    isDark: isDark,
                    onTap: () => _showLyricsDialog(context, stuti),
                  ),
                  _buildActionButton(
                    icon: isFav
                        ? Icons.favorite_rounded
                        : Icons.favorite_border_rounded,
                    label: isFav ? 'पसंदीदा' : 'पसंदीदा में जोड़ें',
                    isDark: isDark,
                    iconColor: isFav ? Colors.red : null,
                    onTap: () => ref
                        .read(stutiFavoritesProvider.notifier)
                        .toggleFavorite(stuti.id),
                  ),
                  _buildActionButton(
                    icon: Icons.ios_share_rounded,
                    label: 'शेयर करें',
                    isDark: isDark,
                    onTap: () => _shareContent(stuti),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // 5. Quote Panel
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: isDark
                    ? Colors.black.withValues(alpha: 0.2)
                    : Colors.white.withValues(alpha: 0.7),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.format_quote_rounded,
                    size: 20,
                    color: accentColor.withValues(alpha: 0.8),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      stuti.textContent?.split('\n').first ??
                          '“प्रातः काल की यह स्तुति...”',
                      style: TextStyle(
                        fontSize: 12,
                        fontStyle: FontStyle.italic,
                        color: isDark
                            ? const Color(0xFFD6D3D1)
                            : const Color(0xFF44403C),
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text('🪔', style: TextStyle(fontSize: 16)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWaveformBars(Color color, bool isPlaying) {
    const barHeights = [
      12.0,
      20.0,
      8.0,
      24.0,
      16.0,
      28.0,
      10.0,
      22.0,
      14.0,
      30.0,
      18.0,
      8.0,
      24.0,
      12.0,
      20.0,
    ];
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: List.generate(barHeights.length, (i) {
        final height = barHeights[i];
        return Container(
          width: 3,
          height: height,
          decoration: BoxDecoration(
            color: (isPlaying && i < 6) ? color : color.withValues(alpha: 0.3),
            borderRadius: BorderRadius.circular(2),
          ),
        );
      }),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required bool isDark,
    Color? iconColor,
    required VoidCallback onTap,
  }) {
    final Color color = isDark
        ? const Color(0xFFA8A29E)
        : const Color(0xFF78716C);
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        child: Column(
          children: [
            Icon(icon, size: 20, color: iconColor ?? color),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showLyricsDialog(BuildContext context, StutiVinati stuti) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.9,
        minChildSize: 0.4,
        expand: false,
        builder: (_, scrollController) => Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade400,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                stuti.title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              Expanded(
                child: SingleChildScrollView(
                  controller: scrollController,
                  child: Text(
                    stuti.textContent ?? 'लिरिक्स उपलब्ध नहीं हैं।',
                    style: const TextStyle(fontSize: 16, height: 1.8),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget? _buildBottomAudioPlayerBar({
    required BuildContext context,
    required ThemeData theme,
    required bool isDark,
    required PlaybackStateEntity playbackState,
  }) {
    final currentAudio = playbackState.currentAudio;
    if (currentAudio == null) {
      return null;
    }

    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final isPlaying = playbackState.status == PlaybackStatus.playing;
    final duration = currentAudio.duration;
    final position = playbackState.position;

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF26221F) : const Color(0xFFFFFBF0),
        border: Border(
          top: BorderSide(
            color: isDark
                ? Colors.amber.shade900.withAlpha(100)
                : const Color(0xFFFDE68A),
            width: 1.5,
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(isDark ? 90 : 30),
            blurRadius: 16,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                Text(
                  _formatDuration(position),
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: isDark
                        ? const Color(0xFFA8A29E)
                        : const Color(0xFF57534E),
                  ),
                ),
                Expanded(
                  child: SliderTheme(
                    data: SliderThemeData(
                      trackHeight: 3,
                      thumbShape: const RoundSliderThumbShape(
                        enabledThumbRadius: 6,
                      ),
                      activeTrackColor: isDark
                          ? Colors.amber.shade500
                          : const Color(0xFFB45309),
                      inactiveTrackColor: isDark
                          ? const Color(0xFF292524)
                          : const Color(0xFFE5E7EB),
                      thumbColor: isDark
                          ? Colors.amber.shade400
                          : const Color(0xFFB45309),
                    ),
                    child: Slider(
                      value: duration.inMilliseconds > 0
                          ? position.inMilliseconds.toDouble().clamp(
                              0.0,
                              duration.inMilliseconds.toDouble(),
                            )
                          : 0.0,
                      max: duration.inMilliseconds > 0
                          ? duration.inMilliseconds.toDouble()
                          : 1.0,
                      onChanged: (val) {
                        ref
                            .read(playbackStateProvider.notifier)
                            .seekTo(Duration(milliseconds: val.toInt()));
                      },
                    ),
                  ),
                ),
                Text(
                  duration.inMilliseconds > 0
                      ? _formatDuration(duration)
                      : '00:00',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: isDark
                        ? const Color(0xFFA8A29E)
                        : const Color(0xFF57534E),
                  ),
                ),
              ],
            ),
            Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: isDark
                        ? Colors.amber.shade900.withAlpha(60)
                        : const Color(0xFFFEF3C7),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isDark
                          ? Colors.amber.shade700
                          : const Color(0xFFF59E0B),
                    ),
                  ),
                  child: Icon(
                    isPlaying ? Icons.music_note : Icons.music_off_outlined,
                    color: isDark
                        ? Colors.amber.shade400
                        : const Color(0xFFB45309),
                    size: 22,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        currentAudio.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: isDark
                              ? Colors.white
                              : const Color(0xFF1F2937),
                        ),
                      ),
                      Text(
                        currentAudio.speaker,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark
                              ? const Color(0xFFA8A29E)
                              : const Color(0xFF57534E),
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  iconSize: 36,
                  icon: Icon(
                    isPlaying
                        ? Icons.pause_circle_filled
                        : Icons.play_circle_fill,
                    color: isDark
                        ? Colors.amber.shade400
                        : const Color(0xFFB45309),
                  ),
                  onPressed: () {
                    // Toggle play/pause - if currentAudio is the same as what would be played,
                    // toggle; otherwise, play the current audio
                    if (ref.watch(playbackStateProvider).currentAudio?.id ==
                        currentAudio.id) {
                      ref.read(playbackStateProvider.notifier).pause();
                    } else {
                      ref
                          .read(playbackStateProvider.notifier)
                          .play(currentAudio);
                    }
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
