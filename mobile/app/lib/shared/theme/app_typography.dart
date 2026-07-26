import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTypography {
  const AppTypography._();

  // Premium Typography System (using Noto Sans Devanagari for Hindi support)
  
  static TextStyle get display => GoogleFonts.notoSansDevanagari(
        fontSize: 48,
        fontWeight: FontWeight.w700,
        letterSpacing: -1.0,
        height: 1.1,
      );

  static TextStyle get headline => GoogleFonts.notoSansDevanagari(
        fontSize: 32,
        fontWeight: FontWeight.w600,
        letterSpacing: -0.5,
        height: 1.2,
      );

  static TextStyle get title => GoogleFonts.notoSansDevanagari(
        fontSize: 24,
        fontWeight: FontWeight.w600,
        letterSpacing: -0.2,
        height: 1.3,
      );

  static TextStyle get subtitle => GoogleFonts.notoSansDevanagari(
        fontSize: 18,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.1,
        height: 1.4,
      );

  static TextStyle get body => GoogleFonts.notoSansDevanagari(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.3,
        height: 1.6,
      );

  static TextStyle get caption => GoogleFonts.notoSansDevanagari(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.4,
        height: 1.5,
      );

  static TextStyle get label => GoogleFonts.notoSansDevanagari(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.5,
        height: 1.2,
      );

  static TextStyle get button => GoogleFonts.notoSansDevanagari(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.5,
        height: 1.0,
      );

  // Fallbacks mapping to Material 3
  static TextTheme get textTheme => TextTheme(
        displayLarge: display,
        displayMedium: display.copyWith(fontSize: 40),
        displaySmall: display.copyWith(fontSize: 36),
        headlineLarge: headline,
        headlineMedium: headline.copyWith(fontSize: 28),
        headlineSmall: headline.copyWith(fontSize: 24),
        titleLarge: title,
        titleMedium: title.copyWith(fontSize: 20),
        titleSmall: subtitle,
        bodyLarge: body.copyWith(fontSize: 18),
        bodyMedium: body,
        bodySmall: caption,
        labelLarge: button,
        labelMedium: label,
        labelSmall: label.copyWith(fontSize: 10),
      );
}
