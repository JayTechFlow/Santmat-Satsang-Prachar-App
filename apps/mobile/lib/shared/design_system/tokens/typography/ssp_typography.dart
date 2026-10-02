import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Authoritative SSP Typography System
/// Powered by Google Fonts (Mukta for dual Devanagari & English legibility)
/// Supports up to 2.0x font scaling with proportional line heights.
class SSPTypography {
  const SSPTypography._();

  // Display Styles
  static TextStyle get displayLarge => GoogleFonts.mukta(
        fontSize: 48,
        fontWeight: FontWeight.w700,
        letterSpacing: -1.0,
        height: 1.15,
      );

  static TextStyle get displayMedium => GoogleFonts.mukta(
        fontSize: 40,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.8,
        height: 1.18,
      );

  static TextStyle get displaySmall => GoogleFonts.mukta(
        fontSize: 36,
        fontWeight: FontWeight.w600,
        letterSpacing: -0.6,
        height: 1.20,
      );

  // Headline Styles
  static TextStyle get headlineLarge => GoogleFonts.mukta(
        fontSize: 32,
        fontWeight: FontWeight.w600,
        letterSpacing: -0.5,
        height: 1.25,
      );

  static TextStyle get headlineMedium => GoogleFonts.mukta(
        fontSize: 28,
        fontWeight: FontWeight.w600,
        letterSpacing: -0.3,
        height: 1.28,
      );

  static TextStyle get headlineSmall => GoogleFonts.mukta(
        fontSize: 24,
        fontWeight: FontWeight.w600,
        letterSpacing: -0.2,
        height: 1.30,
      );

  // Title Styles
  static TextStyle get titleLarge => GoogleFonts.mukta(
        fontSize: 22,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.0,
        height: 1.32,
      );

  static TextStyle get titleMedium => GoogleFonts.mukta(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.1,
        height: 1.35,
      );

  static TextStyle get titleSmall => GoogleFonts.mukta(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.1,
        height: 1.38,
      );

  // Body Styles (Optimized for Devanagari & Senior Readability up to 2.0x)
  static TextStyle get bodyLarge => GoogleFonts.mukta(
        fontSize: 18,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.25,
        height: 1.55,
      );

  static TextStyle get bodyMedium => GoogleFonts.mukta(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.3,
        height: 1.50,
      );

  static TextStyle get bodySmall => GoogleFonts.mukta(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.4,
        height: 1.45,
      );

  // Label & Action Styles
  static TextStyle get labelLarge => GoogleFonts.mukta(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.4,
        height: 1.25,
      );

  static TextStyle get labelMedium => GoogleFonts.mukta(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.5,
        height: 1.25,
      );

  static TextStyle get labelSmall => GoogleFonts.mukta(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.5,
        height: 1.20,
      );

  // Caption Styles
  static TextStyle get captionLarge => GoogleFonts.mukta(
        fontSize: 13,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.4,
        height: 1.35,
      );

  static TextStyle get captionMedium => GoogleFonts.mukta(
        fontSize: 12,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.4,
        height: 1.35,
      );

  static TextStyle get captionSmall => GoogleFonts.mukta(
        fontSize: 11,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.5,
        height: 1.30,
      );

  static TextStyle get caption => captionMedium;

  // Material 3 TextTheme Builder
  static TextTheme get textTheme => TextTheme(
        displayLarge: displayLarge,
        displayMedium: displayMedium,
        displaySmall: displaySmall,
        headlineLarge: headlineLarge,
        headlineMedium: headlineMedium,
        headlineSmall: headlineSmall,
        titleLarge: titleLarge,
        titleMedium: titleMedium,
        titleSmall: titleSmall,
        bodyLarge: bodyLarge,
        bodyMedium: bodyMedium,
        bodySmall: bodySmall,
        labelLarge: labelLarge,
        labelMedium: labelMedium,
        labelSmall: labelSmall,
      );
}

