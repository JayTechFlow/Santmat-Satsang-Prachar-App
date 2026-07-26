import 'package:flutter/material.dart';
import '../theme/app_radius.dart';
import '../theme/app_shadows.dart';

/// A premium, reusable card component following the SSP Design System.
/// Provides soft shadows, unified border radius, and tap support.
class SSPCard extends StatelessWidget {
  /// The primary content of the card.
  final Widget child;

  /// Padding around the child content. Defaults to 16.0 all around.
  final EdgeInsetsGeometry? padding;

  /// Callback when the card is tapped.
  final VoidCallback? onTap;

  /// Background color of the card. Defaults to Theme surface color.
  final Color? color;

  /// Whether to display a soft shadow behind the card (light mode only by default).
  final bool hasShadow;

  /// Optional identifier for analytics tracking on tap.
  final String? analyticsName;

  const SSPCard({
    super.key,
    required this.child,
    this.padding,
    this.onTap,
    this.color,
    this.hasShadow = true,
    this.analyticsName,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    void handleTap() {
      // TODO: Log analytics event using analyticsName if provided
      onTap?.call();
    }

    return Container(
      decoration: BoxDecoration(
        color: color ?? theme.cardTheme.color ?? theme.colorScheme.surface,
        borderRadius: AppRadius.borderRadiusLg,
        boxShadow: hasShadow
            ? (theme.brightness == Brightness.light ? AppShadows.md : null)
            : null,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap == null ? null : handleTap,
          borderRadius: AppRadius.borderRadiusLg,
          child: Padding(
            padding: padding ?? const EdgeInsets.all(16.0),
            child: child,
          ),
        ),
      ),
    );
  }
}
