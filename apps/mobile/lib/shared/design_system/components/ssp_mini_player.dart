import 'package:flutter/material.dart';
import '../tokens/colors/ssp_colors.dart';
import '../tokens/elevation/ssp_elevation.dart';
import '../tokens/icons/ssp_icons.dart';
import '../tokens/radius/ssp_radius.dart';
import '../tokens/spacing/ssp_spacing.dart';
import '../tokens/typography/ssp_typography.dart';
import 'ssp_icon_button.dart';

/// Canonical Mini Player bar component for the Santmat Satsang Prachar Mobile User application.
///
/// Compact persistent playback bar designed to overlay the bottom of the app
/// shell. Displays artwork, title, optional subtitle, a play/pause control,
/// optional close action and a linear progress track (0.0 to 1.0, clamped).
class SSPMiniPlayer extends StatelessWidget {
  /// Track title displayed on the player.
  final String title;

  /// Optional secondary line (artist / album / episode metadata).
  final String? subtitle;

  /// Optional artwork widget (e.g. [SSPImage]). When null, a waveform placeholder is shown.
  final Widget? artwork;

  /// Playback progress in the range 0.0 (start) to 1.0 (end). Clamped defensively.
  final double progress;

  /// Whether audio is currently playing. Switches the play/pause icon.
  final bool isPlaying;

  /// Callback fired when the play/pause control is pressed.
  final VoidCallback onPlayPause;

  /// Optional callback that dismisses the player. When null, the close control is hidden.
  final VoidCallback? onClose;

  /// Optional callback fired when the player bar is tapped.
  final VoidCallback? onTap;

  /// Constructor for [SSPMiniPlayer].
  const SSPMiniPlayer({
    super.key,
    required this.title,
    this.subtitle,
    this.artwork,
    this.progress = 0.0,
    required this.isPlaying,
    required this.onPlayPause,
    this.onClose,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color surfaceColor =
        isDark ? SSPColors.darkSurface : SSPColors.lightSurface;
    final Color placeholderBg =
        isDark ? SSPColors.darkSurfaceVariant : SSPColors.lightSurfaceVariant;
    final Color progressTrackColor =
        isDark ? SSPColors.darkOutlineVariant : SSPColors.lightOutlineVariant;
    final Color progressColor =
        isDark ? SSPColors.darkPrimary : SSPColors.lightPrimary;
    final double clampedProgress = progress.clamp(0.0, 1.0);

    final Widget artworkWidget = artwork ??
        Container(
          width: 48,
          height: 48,
          color: placeholderBg,
          alignment: Alignment.center,
          child: Icon(
            SSPIcons.waveform,
            size: 24,
            color: SSPColors.textTertiary(context),
          ),
        );

    final String semanticLabel =
        subtitle == null ? title : '$title — $subtitle';

    return Semantics(
      container: true,
      button: onTap != null,
      enabled: true,
      label: semanticLabel,
      child: DecoratedBox(
        decoration: BoxDecoration(
          borderRadius: SSPRadius.brLarge,
          boxShadow: SSPElevation.medium(context),
        ),
        child: Material(
          color: surfaceColor,
          borderRadius: SSPRadius.brLarge,
          clipBehavior: Clip.antiAlias,
          elevation: 0,
          child: InkWell(
            onTap: onTap,
            borderRadius: SSPRadius.brLarge,
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: SSPSpacing.md,
                vertical: SSPSpacing.sm,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      ClipRRect(
                        borderRadius: SSPRadius.brMedium,
                        child: SizedBox(
                          width: 48,
                          height: 48,
                          child: artworkWidget,
                        ),
                      ),
                      SSPSpacing.gapW12,
                      Expanded(
                        child: ExcludeSemantics(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                title,
                                style: SSPTypography.titleSmall.copyWith(
                                  color: SSPColors.textPrimary(context),
                                  fontWeight: FontWeight.w600,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              if (subtitle != null) ...[
                                SSPSpacing.gapH4,
                                Text(
                                  subtitle!,
                                  style: SSPTypography.bodySmall.copyWith(
                                    color: SSPColors.textSecondary(context),
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),
                      SSPSpacing.gapW8,
                      SSPIconButton(
                        icon: Icon(
                          isPlaying ? SSPIcons.pause : SSPIcons.play,
                        ),
                        semanticLabel: isPlaying ? 'Pause' : 'Play',
                        onPressed: onPlayPause,
                      ),
                      if (onClose != null) ...[
                        SSPSpacing.gapW4,
                        SSPIconButton(
                          icon: const Icon(SSPIcons.close),
                          semanticLabel: 'Close player',
                          onPressed: onClose,
                        ),
                      ],
                    ],
                  ),
                  SSPSpacing.gapH4,
                  ClipRRect(
                    borderRadius: SSPRadius.brSmall,
                    child: LinearProgressIndicator(
                      value: clampedProgress,
                      minHeight: 3,
                      backgroundColor: progressTrackColor,
                      valueColor:
                          AlwaysStoppedAnimation<Color>(progressColor),
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