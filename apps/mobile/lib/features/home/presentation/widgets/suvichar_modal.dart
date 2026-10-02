import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:share_plus/share_plus.dart';
import '../../../audio/domain/entities/audio_category_entity.dart';
import '../../../audio/domain/entities/audio_entity.dart';
import '../../../audio/domain/entities/playback_state_entity.dart';
import '../../../audio/presentation/providers/audio_providers.dart';
import '../../../../core/player/canonical_player_controller.dart';
import '../../domain/entities/suvichar_item.dart';
import '../../../../shared/design_system/tokens/icons/ssp_icons.dart';

class SuvicharModal extends ConsumerStatefulWidget {
  final List<SuvicharItem> suvichars;
  final int initialIndex;

  const SuvicharModal({
    super.key,
    required this.suvichars,
    this.initialIndex = 0,
  });

  static Future<void> show(
    BuildContext context, {
    required List<SuvicharItem> suvichars,
    int initialIndex = 0,
  }) {
    return showDialog(
      context: context,
      barrierDismissible: true,
      builder: (context) =>
          SuvicharModal(suvichars: suvichars, initialIndex: initialIndex),
    );
  }

  @override
  ConsumerState<SuvicharModal> createState() => _SuvicharModalState();
}

class _SuvicharModalState extends ConsumerState<SuvicharModal> {
  late int _currentIndex;
  static const AudioCategoryEntity _suvicharCategory = AudioCategoryEntity(
    id: 'suvichar',
    name: 'सुविचार',
    description: 'Suvichar narration',
  );

  SuvicharItem get _currentItem => widget.suvichars[_currentIndex];

  AudioEntity _audioFromSuvichar(SuvicharItem item) {
    return AudioEntity(
      id: 'suvichar-${item.id}',
      title: item.title,
      subtitle: item.theme,
      description: item.quote,
      speaker: item.author,
      category: _suvicharCategory,
      duration: Duration.zero,
      language: 'hi',
      thumbnailUrl: item.imageUrl,
      artworkUrl: item.imageUrl,
      releaseDate: DateTime.now(),
      playCount: 0,
      favoriteCount: 0,
      isFeatured: false,
      isRecentlyAdded: false,
      isPopular: false,
      audioUrl: item.audioUrl ?? '',
      lyrics: item.quote,
    );
  }

  List<AudioEntity> get _suvicharQueue =>
      widget.suvichars.map(_audioFromSuvichar).toList(growable: false);

  bool _isCurrentSuvicharPlaying(PlaybackStateEntity playbackState) {
    return playbackState.currentAudio?.id ==
            _audioFromSuvichar(_currentItem).id &&
        playbackState.status == PlaybackStatus.playing;
  }

  @override
  void initState() {
    super.initState();
    _currentIndex =
        (widget.initialIndex >= 0 &&
            widget.initialIndex < widget.suvichars.length)
        ? widget.initialIndex
        : 0;
  }

  void _handleNext() {
    setState(() {
      _currentIndex = (_currentIndex + 1) % widget.suvichars.length;
    });
  }

  void _handlePrev() {
    setState(() {
      _currentIndex =
          (_currentIndex - 1 + widget.suvichars.length) %
          widget.suvichars.length;
    });
  }

  void _handleShare() {
    final item = _currentItem;
    SharePlus.instance.share(
      ShareParams(
        text: '"${item.quote}" — ${item.author}\n\nसंतमत सत्संग प्रचार',
      ),
    );
  }

  Future<void> _toggleAudio() async {
    final item = _currentItem;
    final audioUrl = item.audioUrl;
    if (audioUrl == null || audioUrl.isEmpty) return;

    final playbackState = ref.read(playbackStateProvider);
    final playbackNotifier = ref.read(playbackStateProvider.notifier);
    final selectedAudio = _audioFromSuvichar(item);

    if (playbackState.currentAudio?.id == selectedAudio.id) {
      if (playbackState.status == PlaybackStatus.playing) {
        playbackNotifier.pause();
      } else {
        playbackNotifier.resume();
      }
      return;
    }

    // PHASE 3: Suvichar audio is the same single session, so it opens the
    // same Full Player through the same canonical method instead of loading a
    // queue behind the Mini Player.
    ref.openAudio(
      context,
      selectedAudio,
      queue: _suvicharQueue,
      index: _currentIndex,
      source: 'suvichar',
    );
  }

  @override
  Widget build(BuildContext context) {
    final playbackState = ref.watch(playbackStateProvider);
    final isPlayingAudio = _isCurrentSuvicharPlaying(playbackState);
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final item = _currentItem;

    final Color dialogBg = isDark
        ? const Color(0xFF25211D)
        : const Color(0xFFFFFDF9);
    final Color borderColor = isDark
        ? const Color(0x66F59E0B)
        : const Color(0xFFFCD34D);

    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(
        horizontal: 16.0,
        vertical: 24.0,
      ),
      child: Container(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.85,
          maxWidth: 400,
        ),
        decoration: BoxDecoration(
          color: dialogBg,
          borderRadius: BorderRadius.circular(24.0),
          border: Border.all(color: borderColor, width: 2.0),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.3),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(22.0),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Top header with close button and Diya icon
                Stack(
                  alignment: Alignment.center,
                  children: [
                    Align(
                      alignment: Alignment.topRight,
                      child: IconButton(
                        onPressed: () => Navigator.of(context).pop(),
                        icon: Container(
                          padding: const EdgeInsets.all(6.0),
                          decoration: BoxDecoration(
                            color: isDark
                                ? const Color(0xFF292524)
                                : const Color(0xFFE7E5E4),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            SSPIcons.close,
                            size: 16,
                            color: isDark ? Colors.white70 : Colors.black87,
                          ),
                        ),
                        tooltip: 'बंद करें',
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(top: 8.0),
                      child: SSPIcons.diya(size: 44.0),
                    ),
                  ],
                ),

                const SizedBox(height: 12.0),

                // Theme Tag & Date
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12.0,
                    vertical: 4.0,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0x33F59E0B),
                    borderRadius: BorderRadius.circular(20.0),
                    border: Border.all(
                      color: isDark
                          ? const Color(0x4DF59E0B)
                          : const Color(0x66F59E0B),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.auto_awesome_rounded,
                        size: 14.0,
                        color: Color(0xFFF59E0B),
                      ),
                      const SizedBox(width: 6.0),
                      Flexible(
                        child: Text(
                          '${item.title} • ${item.theme}',
                          style: TextStyle(
                            fontSize: 12.0,
                            fontWeight: FontWeight.bold,
                            color: isDark
                                ? const Color(0xFFFDE68A)
                                : const Color(0xFF92400E),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 14.0),

                // Poster Image (if available)
                if (item.imageUrl.isNotEmpty) ...[
                  ClipRRect(
                    borderRadius: BorderRadius.circular(16.0),
                    child: Stack(
                      children: [
                        Image.network(
                          item.imageUrl,
                          height: 170.0,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) =>
                              Container(
                                height: 170.0,
                                color: isDark
                                    ? const Color(0xFF292524)
                                    : const Color(0xFFF5F5F4),
                                child: const Center(
                                  child: Icon(
                                    Icons.image_outlined,
                                    color: Colors.grey,
                                  ),
                                ),
                              ),
                        ),
                        if (item.date.isNotEmpty)
                          Positioned(
                            top: 8.0,
                            left: 8.0,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10.0,
                                vertical: 3.0,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: 0.65),
                                borderRadius: BorderRadius.circular(12.0),
                              ),
                              child: Text(
                                item.date,
                                style: const TextStyle(
                                  fontSize: 11.0,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14.0),
                ],

                // Quote Text
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4.0),
                  child: RichText(
                    textAlign: TextAlign.center,
                    text: TextSpan(
                      children: [
                        const TextSpan(
                          text: '“ ',
                          style: TextStyle(
                            color: Color(0xFFF59E0B),
                            fontSize: 24.0,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'serif',
                          ),
                        ),
                        TextSpan(
                          text: item.quote,
                          style: TextStyle(
                            fontSize: 16.0,
                            fontWeight: FontWeight.bold,
                            height: 1.45,
                            color: isDark
                                ? Colors.white
                                : const Color(0xFF1C1917),
                          ),
                        ),
                        const TextSpan(
                          text: ' ”',
                          style: TextStyle(
                            color: Color(0xFFF59E0B),
                            fontSize: 24.0,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'serif',
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 10.0),

                // Author
                Text(
                  '— ${item.author}',
                  style: TextStyle(
                    fontSize: 14.0,
                    fontWeight: FontWeight.w900,
                    color: isDark
                        ? const Color(0xFFFBBF24)
                        : const Color(0xFF991B1B),
                  ),
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 12.0),

                // Optional Audio Playback Action
                GestureDetector(
                  onTap: _toggleAudio,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14.0,
                      vertical: 6.0,
                    ),
                    decoration: BoxDecoration(
                      color: isDark
                          ? const Color(0xFF292524)
                          : const Color(0xFFFEF3C7),
                      borderRadius: BorderRadius.circular(20.0),
                      border: Border.all(
                        color: const Color(0xFFF59E0B).withValues(alpha: 0.4),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          isPlayingAudio
                              ? Icons.pause_circle_filled_rounded
                              : Icons.play_circle_fill_rounded,
                          color: const Color(0xFFD97706),
                          size: 20.0,
                        ),
                        const SizedBox(width: 6.0),
                        Text(
                          isPlayingAudio
                              ? 'ऑडियो रोकें'
                              : 'सुविचार ऑडियो सुनें',
                          style: TextStyle(
                            fontSize: 12.0,
                            fontWeight: FontWeight.bold,
                            color: isDark
                                ? const Color(0xFFFDE68A)
                                : const Color(0xFF92400E),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 14.0),

                // Carousel Indicator Dots
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(
                    widget.suvichars.length,
                    (idx) => GestureDetector(
                      onTap: () {
                        setState(() {
                          _currentIndex = idx;
                        });
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        margin: const EdgeInsets.symmetric(horizontal: 3.0),
                        height: 6.0,
                        width: _currentIndex == idx ? 22.0 : 6.0,
                        decoration: BoxDecoration(
                          color: _currentIndex == idx
                              ? const Color(0xFFF59E0B)
                              : (isDark
                                    ? const Color(0xFF44403C)
                                    : const Color(0xFFD6D3D1)),
                          borderRadius: BorderRadius.circular(3.0),
                        ),
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 16.0),

                // Navigation & Share Footer Buttons
                Container(
                  padding: const EdgeInsets.only(top: 12.0),
                  decoration: BoxDecoration(
                    border: Border(
                      top: BorderSide(
                        color: isDark
                            ? const Color(0xFF292524)
                            : const Color(0xFFFDE68A),
                      ),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Prev Button
                      IconButton(
                        onPressed: _handlePrev,
                        icon: Container(
                          padding: const EdgeInsets.all(8.0),
                          decoration: BoxDecoration(
                            color: isDark
                                ? const Color(0xFF292524)
                                : Colors.white,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.1),
                                blurRadius: 4,
                              ),
                            ],
                          ),
                          child: Icon(
                            Icons.chevron_left_rounded,
                            size: 20,
                            color: isDark ? Colors.white : Colors.black87,
                          ),
                        ),
                        tooltip: 'पिछला विचार',
                      ),

                      // Share Button
                      ElevatedButton.icon(
                        onPressed: _handleShare,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFD97706),
                          foregroundColor: Colors.white,
                          elevation: 2,
                          shape: const StadiumBorder(),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16.0,
                            vertical: 10.0,
                          ),
                        ),
                        icon: const Icon(Icons.share_rounded, size: 16),
                        label: const Text(
                          'सुविचार शेयर करें',
                          style: TextStyle(
                            fontSize: 12.0,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),

                      // Next Button
                      IconButton(
                        onPressed: _handleNext,
                        icon: Container(
                          padding: const EdgeInsets.all(8.0),
                          decoration: BoxDecoration(
                            color: isDark
                                ? const Color(0xFF292524)
                                : Colors.white,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.1),
                                blurRadius: 4,
                              ),
                            ],
                          ),
                          child: Icon(
                            Icons.chevron_right_rounded,
                            size: 20,
                            color: isDark ? Colors.white : Colors.black87,
                          ),
                        ),
                        tooltip: 'अगला विचार',
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
