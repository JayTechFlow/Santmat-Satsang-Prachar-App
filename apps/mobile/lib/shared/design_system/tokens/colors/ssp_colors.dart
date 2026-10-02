import 'package:flutter/material.dart';

/// Authoritative SSP Color System
/// Provides raw brand palette constants as well as semantic light/dark accessors.
class SSPColors {
  const SSPColors._();

  // Raw Client Design & Brand Colors
  static const Color headerMaroon = Color(0xFF7F1D1D); // App Header Maroon

  // Primary Actions (Saffron / Orange)
  static const Color deepSaffron = Color(0xFFEA580C);
  static const Color deepSaffronDark = Color(0xFFC2410C);
  static const Color orangePillBackground = Color(0xFFFFEDD5);

  // Sacred Gold & Amber Highlights
  static const Color sacredGold = Color(0xFFF59E0B);
  static const Color amberHighlight = Color(0xFFFBBF24);

  // Stuti Purple Gradient & Card Actions
  static const Color purpleStutiPrimary = Color(0xFF7E22CE);
  static const Color purpleStutiDark = Color(0xFF6B21A8);

  // Light Background & Surfaces
  static const Color lightBackground = Color(0xFFFFFDF9);
  static const Color lightBackgroundSecondary = Color(0xFFFAF7F2);
  static const Color lightSurface = Color(0xFFFFFDF9);
  static const Color lightSurfaceVariant = Color(0xFFFAF7F2);

  // Dark Background & Surfaces
  static const Color darkBackground = Color(0xFF181614);
  static const Color darkSurface = Color(0xFF201D1A);
  static const Color darkSurfaceVariant = Color(0xFF221F1C);

  // Borders & Dividers
  static const Color lightOutline = Color(0xFFF0E6D8);
  static const Color lightOutlineVariant = Color(0xFFF0E6D8);
  static const Color darkOutline = Color(0xFF2A2622);
  static const Color darkOutlineVariant = Color(0xFF2A2622);

  // Legacy/Secondary Palette Aliases (preserved for backwards compatibility)
  static const Color sand = Color(0xFFE6D5B8);
  static const Color warmIvory = Color(0xFFFFF8E1);
  static const Color cream = Color(0xFFFFFDD0);
  static const Color templeBrown = Color(0xFF4A2E12);
  static const Color softWhite = Color(0xFFFFFDF9);
  static const Color warmBlack = Color(0xFF181614);
  static const Color deepCharcoal = Color(0xFF181614);
  static const Color surfaceCharcoal = Color(0xFF201D1A);

  // Semantic Status Colors
  static const Color success = Color(0xFF2E7D32);
  static const Color warning = Color(0xFFED6C02);
  static const Color error = Color(0xFFD32F2F);
  static const Color info = Color(0xFF0288D1);

  // Light Color Scheme Tokens
  static const Color lightPrimary = deepSaffron; // #EA580C
  static const Color lightOnPrimary = Color(0xFFFFFFFF);
  static const Color lightPrimaryContainer = orangePillBackground; // #FFEDD5
  static const Color lightOnPrimaryContainer = deepSaffronDark; // #C2410C
  static const Color lightSecondary = sacredGold; // #F59E0B
  static const Color lightOnSecondary = Color(0xFF181614);
  static const Color lightSecondaryContainer = amberHighlight; // #FBBF24
  static const Color lightOnSecondaryContainer = Color(0xFF181614);
  static const Color lightOnBackground = Color(0xFF181614);
  static const Color lightOnSurface = Color(0xFF181614);
  static const Color lightOnSurfaceVariant = Color(0xFF5C5248);

  // Dark Color Scheme Tokens
  static const Color darkPrimary = deepSaffron; // #EA580C
  static const Color darkOnPrimary = Color(0xFFFFFFFF);
  static const Color darkPrimaryContainer = Color(0xFF431407);
  static const Color darkOnPrimaryContainer = orangePillBackground; // #FFEDD5
  static const Color darkSecondary = amberHighlight; // #FBBF24
  static const Color darkOnSecondary = Color(0xFF181614);
  static const Color darkSecondaryContainer = Color(0xFF451A03);
  static const Color darkOnSecondaryContainer = Color(0xFFFDE68A);
  static const Color darkOnBackground = Color(0xFFFFFDF9);
  static const Color darkOnSurface = Color(0xFFFFFDF9);
  static const Color darkOnSurfaceVariant = Color(0xFFD1C7BD);

  // Context-aware semantic accessors
  static Color primary(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? darkPrimary : lightPrimary;

  static Color header(BuildContext context) => headerMaroon;

  static Color surface(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? darkSurface : lightSurface;

  static Color background(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? darkBackground : lightBackground;

  static Color textPrimary(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? darkOnSurface : lightOnSurface;

  static Color textSecondary(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark
          ? darkOnSurfaceVariant
          : lightOnSurfaceVariant;

  static Color textTertiary(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark
          ? const Color(0xFF9E958C)
          : const Color(0xFF8C8074);

  static Color outline(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? darkOutline : lightOutline;

  static Color divider(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? darkOutlineVariant : lightOutlineVariant;

  static Color stutiPrimary(BuildContext context) => purpleStutiPrimary;
  static Color stutiDark(BuildContext context) => purpleStutiDark;
}

