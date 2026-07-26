import 'package:flutter/material.dart';

class AppAnimations {
  const AppAnimations._();

  // Durations
  static const Duration micro = Duration(milliseconds: 100);
  static const Duration fast = Duration(milliseconds: 200);
  static const Duration medium = Duration(milliseconds: 300);
  static const Duration slow = Duration(milliseconds: 500);
  static const Duration verySlow = Duration(milliseconds: 800);

  // Curves (Material 3 standards)
  static const Curve standard = Curves.fastOutSlowIn;
  static const Curve decelerate = Curves.easeOutCirc; // Entrance
  static const Curve accelerate = Curves.easeIn; // Exit
  static const Curve emphasize = Curves.fastLinearToSlowEaseIn;

  // Page Transitions
  static Widget fadeTransition(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    return FadeTransition(
      opacity: CurvedAnimation(parent: animation, curve: decelerate),
      child: child,
    );
  }

  static Widget slideUpTransition(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    return SlideTransition(
      position: Tween<Offset>(
        begin: const Offset(0.0, 0.1),
        end: Offset.zero,
      ).animate(CurvedAnimation(parent: animation, curve: standard)),
      child: FadeTransition(
        opacity: CurvedAnimation(parent: animation, curve: standard),
        child: child,
      ),
    );
  }
}
