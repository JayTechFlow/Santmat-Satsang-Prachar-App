import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Authoritative SSP Typography System
/// Powered by Google Fonts (Noto Sans Devanagari for dual Hindi/English legibility)
class SSPTypography {
  const SSPTypography._();

  // Display Styles
  static TextStyle get displayLarge => GoogleFonts.notoSansDevanagari(
        fontSize: 48,
        fontWeight: FontWeight.w700,
        letterSpacing: -1.0,
        height: 1.15,
      );

  static TextStyle get displayMedium => GoogleFonts.notoSansDevanagari(
        fontSize: 40,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.8,
        height: 1.18,
      );

  static TextStyle get displaySmall => GoogleFonts.notoSansDevanagari(
        fontSize: 36,
        fontWeight: FontWeight.w600,
        letterSpacing: -0.6,
        height: 1.2,
      );

  // Headline Styles
  static TextStyle get headlineLarge => GoogleFonts.notoSansDevanagari(
        fontSize: 32,
        fontWeight: FontWeight.w600,
        letterSpacing: -0.5,
        height: 1.25,
      );

  static TextStyle get headlineMedium => GoogleFonts.notoSansDevanagari(
        fontSize: 28,
        fontWeight: FontWeight.w600,
        letterSpacing: -0.3,
        height: 1.28,
      );

  static TextStyle get headlineSmall => GoogleFonts.notoSansDevanagari(
        fontSize: 24,
        fontWeight: FontWeight.w600,
        letterSpacing: -0.2,
        height: 1.3,
      );

  // Title Styles
  static TextStyle get titleLarge => GoogleFonts.notoSansDevanagari(
        fontSize: 22,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.0,
        height: 1.32,
      );

  static TextStyle get titleMedium => GoogleFonts.notoSansDevanagari(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.1,
        height: 1.35,
      );

  static TextStyle get titleSmall => GoogleFonts.notoSansDevanagari(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.1,
        height: 1.38,
      );

  // Body Styles (Optimized for Senior Readability)
  static TextStyle get bodyLarge => GoogleFonts.notoSansDevanagari(
        fontSize: 18,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.25,
        height: 1.55,
      );

  static TextStyle get bodyMedium => GoogleFonts.notoSansDevanagari(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.3,
        height: 1.5,
      );

  static TextStyle get bodySmall => GoogleFonts.notoSansDevanagari(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.4,
        height: 1.45,
      );

  // Label & Action Styles
  static TextStyle get labelLarge => GoogleFonts.notoSansDevanagari(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.4,
        height: 1.25,
      );

  static TextStyle get labelMedium => GoogleFonts.notoSansDevanagari(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.5,
        height: 1.25,
      );

  static TextStyle get labelSmall => GoogleFonts.notoSansDevanagari(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.5,
        height: 1.2,
      );

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
