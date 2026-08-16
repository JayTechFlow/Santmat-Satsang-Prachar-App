import 'package:flutter/material.dart';

/// Authoritative SSP Border Radius & Shape System
class SSPRadius {
  const SSPRadius._();

  // Raw Radius Values
  static const double none = 0.0;
  static const double small = 8.0;
  static const double medium = 12.0;
  static const double large = 16.0;
  static const double extraLarge = 24.0;
  static const double pill = 999.0;

  // Circular Radii
  static const Radius rNone = Radius.circular(none);
  static const Radius rSmall = Radius.circular(small);
  static const Radius rMedium = Radius.circular(medium);
  static const Radius rLarge = Radius.circular(large);
  static const Radius rExtraLarge = Radius.circular(extraLarge);
  static const Radius rPill = Radius.circular(pill);

  // BorderRadius Objects
  static final BorderRadius brNone = BorderRadius.circular(none);
  static final BorderRadius brSmall = BorderRadius.circular(small);
  static final BorderRadius brMedium = BorderRadius.circular(medium);
  static final BorderRadius brLarge = BorderRadius.circular(large);
  static final BorderRadius brExtraLarge = BorderRadius.circular(extraLarge);
  static final BorderRadius brPill = BorderRadius.circular(pill);

  // ShapeBorders for Material 3 Components
  static final RoundedRectangleBorder shapeSmall =
      RoundedRectangleBorder(borderRadius: brSmall);
  static final RoundedRectangleBorder shapeMedium =
      RoundedRectangleBorder(borderRadius: brMedium);
  static final RoundedRectangleBorder shapeLarge =
      RoundedRectangleBorder(borderRadius: brLarge);
  static final RoundedRectangleBorder shapeExtraLarge =
      RoundedRectangleBorder(borderRadius: brExtraLarge);
  static final RoundedRectangleBorder shapePill =
      RoundedRectangleBorder(borderRadius: brPill);
}
