import 'package:flutter/material.dart';
import '../tokens/colors/ssp_colors.dart';
import '../tokens/elevation/ssp_elevation.dart';
import '../tokens/radius/ssp_radius.dart';
import '../tokens/spacing/ssp_spacing.dart';

/// Canonical Card component for the Santmat Satsang Prachar Mobile User application.
///
/// A compositional surface container that wraps arbitrary [child] content in a
/// rounded, theme-aware surface. Supports optional tap interaction with a
/// Material 3 ink ripple, SSP token-based elevation shadows, an interactive
/// outline affordance, and screen-reader semantics.
class SSPCard extends StatelessWidget {
  /// Content rendered inside the card body.
  final Widget child;

  /// Callback executed when the card is tapped.
  /// When null, the card is rendered as a non-interactive surface.
  final VoidCallback? onTap;

  /// Padding applied around [child]. Defaults to [SSPSpacing.pMd].
  final EdgeInsetsGeometry padding;

  /// Overrides the default surface color. When null, the theme surface
  /// color is used (light or dark variant).
  final Color? color;

  /// Elevation level controlling the rendered shadow. Values above zero
  /// map to SSPElevation presets (level1->subtle, level2->low,
  /// level3->medium, level4->high).
  final double elevation;

  /// Explicit semantic label for screen readers. When provided, this is
  /// announced instead of the card content.
  final String? semanticLabel;

  /// When true, the card content is excluded from the semantics tree so
  /// the card label is the single source of truth for accessibility.
  final bool excludeInkSemantics;

  const SSPCard({
    super.key,
    required this.child,
    this.onTap,
    this.padding = SSPSpacing.pMd,
    this.color,
    this.elevation = SSPElevation.level0,
    this.semanticLabel,
    this.excludeInkSemantics = false,
  });

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color resolvedColor =
        color ?? (isDark ? SSPColors.darkSurface : SSPColors.lightSurface);
    final List<BoxShadow> shadow = _resolveShadow(context);
    final bool showBorder = onTap != null && elevation <= SSPElevation.level0;
    final BorderSide borderSide = showBorder
        ? BorderSide(color: SSPColors.outline(context), width: 1.0)
        : BorderSide.none;

    Widget surface = Material(
      color: resolvedColor,
      shape: RoundedRectangleBorder(
        borderRadius: SSPRadius.brLarge,
        side: borderSide,
      ),
      child: InkWell(
        borderRadius: SSPRadius.brLarge,
        onTap: onTap,
        child: Padding(
          padding: padding,
          child: child,
        ),
      ),
    );

    if (shadow.isNotEmpty) {
      surface = DecoratedBox(
        decoration: BoxDecoration(
          borderRadius: SSPRadius.brLarge,
          boxShadow: shadow,
        ),
        child: surface,
      );
    }

    return Semantics(
      container: true,
      button: onTap != null,
      enabled: onTap != null,
      label: semanticLabel,
      excludeSemantics: excludeInkSemantics,
      child: surface,
    );
  }

  List<BoxShadow> _resolveShadow(BuildContext context) {
    if (elevation > SSPElevation.level0) {
      if (elevation >= SSPElevation.level4) {
        return SSPElevation.high(context);
      }
      if (elevation >= SSPElevation.level3) {
        return SSPElevation.medium(context);
      }
      if (elevation >= SSPElevation.level2) {
        return SSPElevation.low(context);
      }
      return SSPElevation.subtle(context);
    }
    return const [];
  }
}