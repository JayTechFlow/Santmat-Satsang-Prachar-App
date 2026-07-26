import 'package:flutter/material.dart';
import 'app_durations.dart';

class AppAnimations {
  const AppAnimations._();

  static const Curve defaultCurve = Curves.easeOutCubic;
  static const Curve smoothCurve = Curves.easeInOutQuart;

  // Basic Page Transition
  static Widget fadeTransition(
      BuildContext context,
      Animation<double> animation,
      Animation<double> secondaryAnimation,
      Widget child) {
    return FadeTransition(opacity: animation, child: child);
  }

  // Slide Up Transition
  static Widget slideUpTransition(
      BuildContext context,
      Animation<double> animation,
      Animation<double> secondaryAnimation,
      Widget child) {
    const begin = Offset(0.0, 0.1);
    const end = Offset.zero;
    final tween = Tween(begin: begin, end: end).chain(CurveTween(curve: smoothCurve));
    return SlideTransition(
      position: animation.drive(tween),
      child: FadeTransition(opacity: animation, child: child),
    );
  }
}

/// A wrapper to add a "Button Press" scale down animation to any widget
class SSPPressable extends StatefulWidget {
  final Widget child;
  final VoidCallback onTap;
  final double scaleDown;

  const SSPPressable({
    super.key,
    required this.child,
    required this.onTap,
    this.scaleDown = 0.95,
  });

  @override
  State<SSPPressable> createState() => _SSPPressableState();
}

class _SSPPressableState extends State<SSPPressable> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: AppDurations.fast,
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: widget.scaleDown).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => _controller.forward(),
      onTapUp: (_) {
        _controller.reverse();
        widget.onTap();
      },
      onTapCancel: () => _controller.reverse(),
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: widget.child,
      ),
    );
  }
}
