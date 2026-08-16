import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppShadows {
  const AppShadows._();

  static List<BoxShadow> soft(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return [
      BoxShadow(
        color: isDark ? Colors.black.withValues(alpha: 0.3) : AppColors.templeBrown.withValues(alpha: 0.05),
        offset: const Offset(0, 2),
        blurRadius: 8,
      ),
    ];
  }

  static List<BoxShadow> medium(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return [
      BoxShadow(
        color: isDark ? Colors.black.withValues(alpha: 0.4) : AppColors.templeBrown.withValues(alpha: 0.08),
        offset: const Offset(0, 4),
        blurRadius: 16,
      ),
    ];
  }

  static List<BoxShadow> large(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return [
      BoxShadow(
        color: isDark ? Colors.black.withValues(alpha: 0.5) : AppColors.templeBrown.withValues(alpha: 0.12),
        offset: const Offset(0, 8),
        blurRadius: 24,
      ),
    ];
  }

  static List<BoxShadow> floating(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return [
      BoxShadow(
        color: isDark ? Colors.black.withValues(alpha: 0.6) : AppColors.templeBrown.withValues(alpha: 0.15),
        offset: const Offset(0, 12),
        blurRadius: 32,
      ),
    ];
  }

  static List<BoxShadow> hero(BuildContext context, {Color? color}) {
    final baseColor = color ?? AppColors.deepSaffron;
    return [
      BoxShadow(
        color: baseColor.withValues(alpha: 0.25),
        offset: const Offset(0, 16),
        blurRadius: 40,
        spreadRadius: -4,
      ),
    ];
  }

  static List<BoxShadow> glass(BuildContext context) {
    return [
      BoxShadow(
        color: Colors.white.withValues(alpha: 0.1),
        offset: const Offset(0, 2),
        blurRadius: 12,
        spreadRadius: -2, // Inner-like glow
      ),
    ];
  }
}
