import 'package:flutter/material.dart';
import '../tokens/colors/ssp_colors.dart';
import '../tokens/spacing/ssp_spacing.dart';
import '../tokens/typography/ssp_typography.dart';

/// Canonical Loading State component for the Santmat Satsang Prachar Mobile User application.
///
/// Consolidates the 12 identical centered progress-indicator clones into a single
/// component. Implements SSP design tokens and accessibility (live-region semantics
/// so loading is announced by screen readers). Stateless and free of business logic.
class SSPLoadingState extends StatelessWidget {
  /// Optional message rendered below the spinner. Also used as the semantics label
  /// (defaults to 'Loading' when absent).
  final String? message;

  /// Diameter of the progress indicator in logical pixels. Defaults to 40.0.
  final double size;

  const SSPLoadingState({
    super.key,
    this.message,
    this.size = 40.0,
  });

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;

    final Widget spinner = SizedBox(
      width: size,
      height: size,
      child: CircularProgressIndicator(
        strokeWidth: 3,
        valueColor: AlwaysStoppedAnimation<Color>(
          isDark ? SSPColors.darkPrimary : SSPColors.lightPrimary,
        ),
      ),
    );

    return Semantics(
      label: message ?? 'Loading',
      liveRegion: true,
      child: ExcludeSemantics(
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              spinner,
              if (message != null) ...[
                SSPSpacing.gapH16,
                Text(
                  message!,
                  style: SSPTypography.bodyMedium.copyWith(
                    color: SSPColors.textSecondary(context),
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}