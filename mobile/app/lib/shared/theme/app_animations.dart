import 'package:flutter/material.dart';

class AppAnimations {
  const AppAnimations._();

  static const Duration fast = Duration(milliseconds: 150);
  static const Duration medium = Duration(milliseconds: 300);
  static const Duration slow = Duration(milliseconds: 500);

  static const Curve defaultCurve = Curves.easeInOut;
  static const Curve easeIn = Curves.easeIn;
  static const Curve easeOut = Curves.easeOut;
}
