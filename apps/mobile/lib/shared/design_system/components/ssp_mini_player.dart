import 'package:flutter/material.dart';
import '../tokens/elevation/ssp_elevation.dart';
import '../tokens/icons/ssp_icons.dart';
import '../tokens/spacing/ssp_spacing.dart';
import '../tokens/typography/ssp_typography.dart';
import 'ssp_hold_to_seek_button.dart';

/// Floating docked mini player bar matching `MiniPlayer.tsx`.
/// Displays artwork, title, artist, audio equalizer pulse animation,
/// play/pause button, skip buttons, close action, and progress track.
///
/// The skip buttons carry LONG-PRESS SEEK: a tap skips to the previous / next
/// track, a long press holds to seek 10 seconds backwards / forwards.
class SSPMiniPlayer extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Widget? artwork;
  final double progress;
  final bool isPlaying;
  final VoidCallback onPlayPause;

  /// SMART PREVIOUS — restarts the current track when the user is more than a
  /// few seconds into it.
  final VoidCallback? onSkipPrevious;

  final VoidCallback? onSkipNext;

  /// LONG-PRESS SEEK. Omit to disable hold-to-seek on the skip buttons.
  final ValueChanged<Duration>? onHoldSeek;

  final Duration position;
  final Duration duration;

  final VoidCallback? onClose;
  final VoidCallback? onTap;

  const SSPMiniPlayer({
    super.key,
    required this.title,
    this.subtitle,
    this.artwork,
    this.progress = 0.0,
    required this.isPlaying,
    required this.onPlayPause,
    this.onSkipNext,
    this.onSkipPrevious,
    this.onHoldSeek,
    this.position = Duration.zero,
    this.duration = Duration.zero,
    this.onClose,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color surfaceColor = isDark
        ? const Color(0xFF2A241E).withValues(alpha: 0.95)
        : const Color(0xFFFED7AA).withValues(alpha: 0.92);
    final Color borderColor = isDark
        ? Colors.amber.shade600.withValues(alpha: 0.3)
        : const Color(0xFFFDBA74);
    final Color textColor = isDark
        ? const Color(0xFFF5F5F4)
        : const Color(0xFF1C1917);
    final Color subtitleColor = isDark
        ? const Color(0xFFA8A29E)
        : const Color(0xFF44403C);
    final Color controlIconColor = isDark
        ? const Color(0xFFE7E5E4)
        : const Color(0xFF292524);
    final Color playBtnBg = isDark
        ? const Color(0xFFD97706)
        : const Color(0xFF1C1917);

    final double clampedProgress = progress.clamp(0.0, 1.0);

    final Widget artworkWidget =
        artwork ??
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF292524) : Colors.amber.shade100,
            borderRadius: BorderRadius.circular(8),
          ),
          alignment: Alignment.center,
          child: Icon(
            SSPIcons.waveform,
            size: 20,
            color: Colors.amber.shade700,
          ),
        );

    return Semantics(
      container: true,
      button: onTap != null,
      enabled: true,
      label: subtitle == null ? title : '$title — $subtitle',
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        child: DecoratedBox(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            boxShadow: SSPElevation.medium(context),
            border: Border.all(color: borderColor, width: 1),
          ),
          child: Material(
            color: surfaceColor,
            borderRadius: BorderRadius.circular(16),
            clipBehavior: Clip.antiAlias,
            elevation: 0,
            child: InkWell(
              onTap: onTap,
              borderRadius: BorderRadius.circular(16),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    child: Row(
                      children: [
                        // Artwork
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: SizedBox(
                            width: 42,
                            height: 42,
                            child: artworkWidget,
                          ),
                        ),
                        const SizedBox(width: 10),
                        // Equalizer pulse when playing
                        if (isPlaying) ...[
                          const AudioEqualizerPulse(),
                          SSPSpacing.gapW8,
                        ],
                        // Title & Subtitle
                        Expanded(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                title,
                                style: SSPTypography.titleSmall.copyWith(
                                  color: textColor,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              if (subtitle != null && subtitle!.isNotEmpty) ...[
                                const SizedBox(height: 2),
                                Text(
                                  subtitle!,
                                  style: SSPTypography.bodySmall.copyWith(
                                    color: subtitleColor,
                                    fontSize: 11,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ],
                          ),
                        ),
                        SSPSpacing.gapW8,
                        // Controls
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (onSkipPrevious != null)
                              SSPHoldToSeekButton.backward(
                                position: position,
                                total: duration,
                                semanticLabel: 'पिछला ट्रैक',
                                holdSemanticLabel: 'पकड़कर 10 सेकंड पीछे',
                                onPressed: onSkipPrevious!,
                                onHoldSeek:
                                    onHoldSeek ??
                                    (Duration _) {
                                      // No hold-to-seek wired up: fall back to
                                      // the tap behaviour so the button is never
                                      // inert.
                                    },
                                child: Padding(
                                  padding: const EdgeInsets.all(6),
                                  child: Icon(
                                    Icons.skip_previous_rounded,
                                    color: controlIconColor,
                                    size: 20,
                                  ),
                                ),
                              ),
                            GestureDetector(
                              onTap: onPlayPause,
                              child: Container(
                                width: 34,
                                height: 34,
                                decoration: BoxDecoration(
                                  color: playBtnBg,
                                  shape: BoxShape.circle,
                                  boxShadow: [
                                    BoxShadow(
                                      color: playBtnBg.withValues(alpha: 0.3),
                                      blurRadius: 4,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: Icon(
                                  isPlaying
                                      ? Icons.pause_rounded
                                      : Icons.play_arrow_rounded,
                                  color: Colors.white,
                                  size: 20,
                                ),
                              ),
                            ),
                            if (onSkipNext != null)
                              SSPHoldToSeekButton.forward(
                                position: position,
                                total: duration,
                                semanticLabel: 'अगला ट्रैक',
                                holdSemanticLabel: 'पकड़कर 10 सेकंड आगे',
                                onPressed: onSkipNext!,
                                onHoldSeek:
                                    onHoldSeek ??
                                    (Duration _) {
                                      // See above.
                                    },
                                child: Padding(
                                  padding: const EdgeInsets.all(6),
                                  child: Icon(
                                    Icons.skip_next_rounded,
                                    color: controlIconColor,
                                    size: 20,
                                  ),
                                ),
                              ),

                            if (onClose != null) ...[
                              const SizedBox(width: 2),
                              IconButton(
                                icon: Icon(
                                  Icons.close_rounded,
                                  color: controlIconColor.withValues(
                                    alpha: 0.7,
                                  ),
                                  size: 18,
                                ),
                                padding: EdgeInsets.zero,
                                constraints: const BoxConstraints(
                                  minWidth: 28,
                                  minHeight: 28,
                                ),
                                onPressed: onClose,
                                tooltip: 'बंद करें',
                              ),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                  // Bottom Progress Bar Line
                  ClipRRect(
                    borderRadius: const BorderRadius.only(
                      bottomLeft: Radius.circular(16),
                      bottomRight: Radius.circular(16),
                    ),
                    child: LinearProgressIndicator(
                      value: clampedProgress,
                      minHeight: 2.5,
                      backgroundColor: isDark
                          ? const Color(0xFF292524)
                          : Colors.amber.shade200,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        isDark ? Colors.amber.shade400 : Colors.amber.shade800,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Equalizer pulse animation widget with 3 vertical bars pulsing in sync with music playback.
class AudioEqualizerPulse extends StatefulWidget {
  const AudioEqualizerPulse({super.key});

  @override
  State<AudioEqualizerPulse> createState() => _AudioEqualizerPulseState();
}

class _AudioEqualizerPulseState extends State<AudioEqualizerPulse>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color barColor = isDark
        ? Colors.amber.shade400
        : Colors.amber.shade800;

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final val = _controller.value;
        return Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            _buildBar(6 + (val * 8), barColor),
            const SizedBox(width: 2),
            _buildBar(14 - (val * 6), barColor),
            const SizedBox(width: 2),
            _buildBar(4 + (val * 10), barColor),
          ],
        );
      },
    );
  }

  Widget _buildBar(double height, Color color) {
    return Container(
      width: 3,
      height: height.clamp(3.0, 16.0),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(1.5),
      ),
    );
  }
}
