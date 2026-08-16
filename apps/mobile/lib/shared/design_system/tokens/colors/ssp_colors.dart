import 'package:flutter/material.dart';

/// Authoritative SSP Color System
/// Provides raw brand palette constants as well as semantic light/dark accessors.
class SSPColors {
  const SSPColors._();

  // Raw Brand Colors
  static const Color deepSaffron = Color(0xFFE65100);
  static const Color sacredGold = Color(0xFFFFB300);
  static const Color sand = Color(0xFFE6D5B8);
  static const Color warmIvory = Color(0xFFFFF8E1);
  static const Color cream = Color(0xFFFFFDD0);
  static const Color templeBrown = Color(0xFF4A2E12);
  static const Color softWhite = Color(0xFFFAFAFA);
  static const Color warmBlack = Color(0xFF1A1A1A);
  static const Color deepCharcoal = Color(0xFF121212);
  static const Color surfaceCharcoal = Color(0xFF1E1E1E);

  // Semantic Status Colors
  static const Color success = Color(0xFF2E7D32);
  static const Color warning = Color(0xFFED6C02);
  static const Color error = Color(0xFFD32F2F);
  static const Color info = Color(0xFF0288D1);

  // Light Color Scheme Tokens
  static const Color lightPrimary = deepSaffron;
  static const Color lightOnPrimary = softWhite;
  static const Color lightPrimaryContainer = warmIvory;
  static const Color lightOnPrimaryContainer = templeBrown;
  static const Color lightSecondary = sacredGold;
  static const Color lightOnSecondary = templeBrown;
  static const Color lightSecondaryContainer = sand;
  static const Color lightOnSecondaryContainer = templeBrown;
  static const Color lightBackground = cream;
  static const Color lightOnBackground = warmBlack;
  static const Color lightSurface = softWhite;
  static const Color lightOnSurface = warmBlack;
  static const Color lightSurfaceVariant = warmIvory;
  static const Color lightOnSurfaceVariant = templeBrown;
  static const Color lightOutline = Color(0xFFE0D7C6);
  static const Color lightOutlineVariant = Color(0xFFF0EAE1);

  // Dark Color Scheme Tokens
  static const Color darkPrimary = deepSaffron;
  static const Color darkOnPrimary = warmBlack;
  static const Color darkPrimaryContainer = templeBrown;
  static const Color darkOnPrimaryContainer = warmIvory;
  static const Color darkSecondary = sacredGold;
  static const Color darkOnSecondary = warmBlack;
  static const Color darkSecondaryContainer = surfaceCharcoal;
  static const Color darkOnSecondaryContainer = sand;
  static const Color darkBackground = deepCharcoal;
  static const Color darkOnBackground = softWhite;
  static const Color darkSurface = surfaceCharcoal;
  static const Color darkOnSurface = softWhite;
  static const Color darkSurfaceVariant = Color(0xFF282828);
  static const Color darkOnSurfaceVariant = sand;
  static const Color darkOutline = Color(0xFF3E3E3E);
  static const Color darkOutlineVariant = Color(0xFF2A2A2A);

  // Context-aware semantic accessors
  static Color primary(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? darkPrimary : lightPrimary;

  static Color surface(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? darkSurface : lightSurface;

  static Color background(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? darkBackground : lightBackground;

  static Color textPrimary(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? darkOnSurface : lightOnSurface;

  static Color textSecondary(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark
          ? softWhite.withValues(alpha: 0.7)
          : templeBrown.withValues(alpha: 0.8);

  static Color textTertiary(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark
          ? softWhite.withValues(alpha: 0.5)
          : templeBrown.withValues(alpha: 0.6);

  static Color outline(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? darkOutline : lightOutline;

  static Color divider(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? darkOutlineVariant : lightOutlineVariant;
}
