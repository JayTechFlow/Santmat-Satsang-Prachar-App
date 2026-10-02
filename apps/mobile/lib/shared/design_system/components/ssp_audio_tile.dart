import 'package:flutter/material.dart';
import '../tokens/colors/ssp_colors.dart';
import '../tokens/icons/ssp_icons.dart';
import '../tokens/radius/ssp_radius.dart';
import '../tokens/spacing/ssp_spacing.dart';
import '../tokens/typography/ssp_typography.dart';
import 'ssp_icon_button.dart';

/// Canonical Audio List Tile component for the Santmat Satsang Prachar Mobile User application.
///
/// Displays an audio entry (artwork, title, subtitle, duration) with optional
/// play/pause and favorite controls. Renders as a full-width, tappable row
/// with a minimum touch target and screen-reader semantics.
class SSPAudioTile extends StatelessWidget {
  /// Track title displayed on the tile.
  final String title;

  /// Optional secondary line (artist / album / episode metadata).
  final String? subtitle;

  /// Optional duration string (e.g. `'5:32'`) rendered at the trailing edge.
  final String? durationText;

  /// Optional artwork widget (e.g. [SSPImage]). When null, a waveform placeholder is shown.
  final Widget? artwork;

  /// Whether the audio entry is currently playing. Switches the play/pause icon
  /// and marks the tile as selected for screen readers.
  final bool isPlaying;

  /// Callback fired when the tile body is tapped.
  final VoidCallback onTap;

  /// Optional play/pause callback. When null, the control is hidden.
  final VoidCallback? onPlayPause;

  /// Whether the entry is marked as a favorite.
  final bool isFavorite;

  /// Optional favorite toggle callback. When null, the control is hidden.
  final VoidCallback? onFavorite;

  /// Constructor for [SSPAudioTile].
  const SSPAudioTile({
    super.key,
    required this.title,
    this.subtitle,
    this.durationText,
    this.artwork,
    this.isPlaying = false,
    required this.onTap,
    this.onPlayPause,
    this.isFavorite = false,
    this.onFavorite,
  });

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color placeholderBg = isDark
        ? SSPColors.darkSurfaceVariant
        : SSPColors.lightSurfaceVariant;

    final Widget artworkWidget =
        artwork ??
        Container(
          width: 56,
          height: 56,
          color: placeholderBg,
          alignment: Alignment.center,
          child: Icon(
            SSPIcons.waveform,
            size: 24,
            color: SSPColors.textTertiary(context),
          ),
        );

    return Semantics(
      container: true,
      button: true,
      enabled: true,
      selected: isPlaying,
      label: title,
      child: InkWell(
        onTap: onTap,
        borderRadius: SSPRadius.brMedium,
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: SSPSpacing.md,
            vertical: SSPSpacing.sm,
          ),
          child: ConstrainedBox(
            constraints: const BoxConstraints(minHeight: SSPSpacing.xxxl),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                ClipRRect(
                  borderRadius: SSPRadius.brMedium,
                  child: SizedBox(width: 56, height: 56, child: artworkWidget),
                ),
                SSPSpacing.gapW16,
                Expanded(
                  child: ExcludeSemantics(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: SSPTypography.titleMedium.copyWith(
                            color: SSPColors.textPrimary(context),
                          ),
                          maxLines: 2,
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
                if (durationText != null) ...[
                  SSPSpacing.gapW8,
                  Text(
                    durationText!,
                    style: SSPTypography.labelSmall.copyWith(
                      color: SSPColors.textTertiary(context),
                    ),
                  ),
                ],
                if (onPlayPause != null) ...[
                  SSPSpacing.gapW8,
                  SSPIconButton(
                    icon: Icon(isPlaying ? SSPIcons.pause : SSPIcons.play),
                    semanticLabel: isPlaying ? 'Pause' : 'Play',
                    onPressed: onPlayPause,
                    iconSize: 40,
                  ),
                ],
                if (onFavorite != null) ...[
                  SSPSpacing.gapW4,
                  SSPIconButton(
                    icon: Icon(
                      isFavorite ? SSPIcons.favorite : SSPIcons.favoriteOutline,
                    ),
                    semanticLabel: isFavorite
                        ? 'Remove from favorites'
                        : 'Add to favorites',
                    onPressed: onFavorite,
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
