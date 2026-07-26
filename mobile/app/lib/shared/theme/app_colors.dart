import 'package:flutter/material.dart';

class AppColors {
  const AppColors._();

  // Primary
  static const Color deepSaffron = Color(0xFFFF9933);
  static const Color sacredGold = Color(0xFFFFC107); // Refined premium gold

  // Secondary
  static const Color sand = Color(0xFFE6D5B8);
  static const Color warmIvory = Color(0xFFFDFBF7);

  // Surface & Background
  static const Color softWhite = Color(0xFFFAFAFA);
  static const Color cream = Color(0xFFFFFDD0);

  // Accent & Support
  static const Color templeBrown = Color(0xFF5C4033);
  static const Color forestGreen = Color(0xFF2E8B57);
  static const Color softRed = Color(0xFFE57373);

  // Dark Theme
  static const Color warmBlack = Color(0xFF1A1A1A);
  static const Color deepCharcoal = Color(0xFF2C2C2C);

  // Status
  static const Color success = Color(0xFF4CAF50);
  static const Color warning = Color(0xFFFF9800);
  static const Color info = Color(0xFF2196F3);

  // Base semantic tokens
  static Color background(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? warmBlack : cream;

  static Color surface(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? deepCharcoal : softWhite;

  static Color textPrimary(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? softWhite : warmBlack;

  static Color textSecondary(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark
          ? softWhite.withValues(alpha: 0.7)
          : templeBrown.withValues(alpha: 0.7);

  static Color textMuted(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark
          ? softWhite.withValues(alpha: 0.5)
          : templeBrown.withValues(alpha: 0.5);

  static Color border(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark
          ? Colors.white.withValues(alpha: 0.1)
          : templeBrown.withValues(alpha: 0.1);

  static Color divider(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark
          ? Colors.white.withValues(alpha: 0.05)
          : templeBrown.withValues(alpha: 0.05);

  static Color glassBackground(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark
          ? deepCharcoal.withValues(alpha: 0.6)
          : softWhite.withValues(alpha: 0.7);
}
