import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTypography {
  const AppTypography._();

  static TextStyle get displayLarge => GoogleFonts.notoSansDevanagari(
    fontSize: 57,
    fontWeight: FontWeight.w400,
    letterSpacing: -0.25,
  );

  static TextStyle get displayMedium => GoogleFonts.notoSansDevanagari(
    fontSize: 45,
    fontWeight: FontWeight.w400,
    letterSpacing: 0,
  );

  static TextStyle get displaySmall => GoogleFonts.notoSansDevanagari(
    fontSize: 36,
    fontWeight: FontWeight.w400,
    letterSpacing: 0,
  );

  static TextStyle get headlineLarge => GoogleFonts.notoSansDevanagari(
    fontSize: 32,
    fontWeight: FontWeight.w600,
    letterSpacing: 0,
  );

  static TextStyle get headlineMedium => GoogleFonts.notoSansDevanagari(
    fontSize: 28,
    fontWeight: FontWeight.w600,
    letterSpacing: 0,
  );

  static TextStyle get titleLarge => GoogleFonts.notoSansDevanagari(
    fontSize: 22,
    fontWeight: FontWeight.w500,
    letterSpacing: 0,
  );

  static TextStyle get titleMedium => GoogleFonts.notoSansDevanagari(
    fontSize: 16,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.15,
  );

  static TextStyle get bodyLarge => GoogleFonts.notoSansDevanagari(
    fontSize: 18,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.5,
  );

  static TextStyle get bodyMedium => GoogleFonts.notoSansDevanagari(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.25,
  );

  static TextStyle get bodySmall => GoogleFonts.notoSansDevanagari(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.4,
  );

  static TextStyle get labelLarge => GoogleFonts.notoSansDevanagari(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.1,
  );

  static TextStyle get labelSmall => GoogleFonts.notoSansDevanagari(
    fontSize: 11,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.5,
  );

  static TextTheme get textTheme => TextTheme(
    displayLarge: displayLarge,
    displayMedium: displayMedium,
    displaySmall: displaySmall,
    headlineLarge: headlineLarge,
    headlineMedium: headlineMedium,
    titleLarge: titleLarge,
    titleMedium: titleMedium,
    bodyLarge: bodyLarge,
    bodyMedium: bodyMedium,
    bodySmall: bodySmall,
    labelLarge: labelLarge,
    labelSmall: labelSmall,
  );
}
