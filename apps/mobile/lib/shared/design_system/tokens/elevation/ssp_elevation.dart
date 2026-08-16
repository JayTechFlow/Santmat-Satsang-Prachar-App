import 'package:flutter/material.dart';
import '../colors/ssp_colors.dart';

/// Authoritative SSP Elevation and Shadow System
/// Restrained, soft elevations designed for subtle hierarchy without glassmorphism bloat.
class SSPElevation {
  const SSPElevation._();

  // Raw Elevation Levels
  static const double level0 = 0.0;
  static const double level1 = 2.0;
  static const double level2 = 4.0;
  static const double level3 = 8.0;
  static const double level4 = 12.0;

  // BoxShadow Generators
  static List<BoxShadow> none = const [];

  static List<BoxShadow> subtle(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return [
      BoxShadow(
        color: isDark ? Colors.black.withValues(alpha: 0.3) : SSPColors.templeBrown.withValues(alpha: 0.05),
        offset: const Offset(0, 1),
        blurRadius: 3,
      ),
    ];
  }

  static List<BoxShadow> low(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return [
      BoxShadow(
        color: isDark ? Colors.black.withValues(alpha: 0.4) : SSPColors.templeBrown.withValues(alpha: 0.08),
        offset: const Offset(0, 2),
        blurRadius: 6,
      ),
    ];
  }

  static List<BoxShadow> medium(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return [
      BoxShadow(
        color: isDark ? Colors.black.withValues(alpha: 0.5) : SSPColors.templeBrown.withValues(alpha: 0.12),
        offset: const Offset(0, 4),
        blurRadius: 12,
      ),
    ];
  }

  static List<BoxShadow> high(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return [
      BoxShadow(
        color: isDark ? Colors.black.withValues(alpha: 0.6) : SSPColors.templeBrown.withValues(alpha: 0.16),
        offset: const Offset(0, 8),
        blurRadius: 20,
      ),
    ];
  }
}
