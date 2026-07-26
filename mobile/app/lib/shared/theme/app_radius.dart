import 'package:flutter/material.dart';

class AppRadius {
  const AppRadius._();

  // Premium Radius Tokens
  static const double sm = 8.0;
  static const double md = 12.0;
  static const double lg = 16.0;
  static const double xl = 24.0;
  static const double xxl = 32.0;

  // BorderRadius
  static final BorderRadius brSm = BorderRadius.circular(sm);
  static final BorderRadius brMd = BorderRadius.circular(md);
  static final BorderRadius brLg = BorderRadius.circular(lg);
  static final BorderRadius brXl = BorderRadius.circular(xl);
  static final BorderRadius brXxl = BorderRadius.circular(xxl);

  // Special Shapes
  static final BorderRadius pill = BorderRadius.circular(999.0);
  static final BorderRadius circle = BorderRadius.circular(9999.0); // or BoxShape.circle
}
