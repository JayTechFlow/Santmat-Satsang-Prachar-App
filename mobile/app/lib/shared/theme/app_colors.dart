import 'package:flutter/material.dart';

class AppColors {
  const AppColors._();

  // Premium Spiritual Palette
  static const Color deepSaffron = Color(0xFFFF9933);
  static const Color warmBrown = Color(0xFF5C4033);
  static const Color templeGold = Color(0xFFFFB300); // Slightly warmer gold
  static const Color cream = Color(0xFFFFFDD0);
  static const Color softWhite = Color(0xFFFAF9F6);

  static const Color maroon = Color(0xFF800000);
  static const Color lightSand = Color(0xFFF5DEB3);
  static const Color veryLightBeige = Color(0xFFF5F5DC);
  static const Color softOrange = Color(0xFFFFB347);
  static const Color forestGreen = Color(0xFF228B22);

  // Light Theme Colors
  static const Color lightPrimary = deepSaffron;
  static const Color lightOnPrimary = softWhite;
  static const Color lightPrimaryContainer = cream;
  static const Color lightOnPrimaryContainer = warmBrown;
  static const Color lightSecondary = warmBrown;
  static const Color lightOnSecondary = softWhite;
  static const Color lightSecondaryContainer = lightSand;
  static const Color lightOnSecondaryContainer = maroon;
  static const Color lightSurface = softWhite;
  static const Color lightOnSurface = warmBrown;
  static const Color lightError = maroon;
  static const Color lightOnError = softWhite;

  // Dark Theme Colors
  static const Color darkPrimary = softOrange;
  static const Color darkOnPrimary = warmBrown;
  static const Color darkPrimaryContainer = Color(
    0xFF3E2723,
  ); // Deeper warm brown
  static const Color darkOnPrimaryContainer = softOrange;
  static const Color darkSecondary = templeGold;
  static const Color darkOnSecondary = Color(0xFF3E2723);
  static const Color darkSecondaryContainer = maroon;
  static const Color darkOnSecondaryContainer = lightSand;
  static const Color darkSurface = Color(0xFF1E140F); // Very deep warm dark
  static const Color darkOnSurface = veryLightBeige;
  static const Color darkError = Color(0xFFCF6679);
  static const Color darkOnError = Color(0xFF000000);

  // Custom Extension Colors
  static const Color success = forestGreen;
  static const Color warning = templeGold;
  static const Color info = Color(0xFF8D6E63);

  // Semantic Tokens (Contextual helpers to abstract raw colors)
  static Color surfaceBackground(BuildContext context) =>
      Theme.of(context).colorScheme.surface;
  static Color surfaceCard(BuildContext context) =>
      Theme.of(context).cardTheme.color ??
      Theme.of(context).colorScheme.surface;
  static Color textPrimary(BuildContext context) =>
      Theme.of(context).colorScheme.onSurface;
  static Color textSecondary(BuildContext context) =>
      Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.7);
  static Color textMuted(BuildContext context) =>
      Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5);
  static Color border(BuildContext context) =>
      Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.12);
  static Color divider(BuildContext context) =>
      Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.08);
  static Color glassBackground(BuildContext context) =>
      Theme.of(context).colorScheme.surface.withValues(alpha: 0.7);
}
