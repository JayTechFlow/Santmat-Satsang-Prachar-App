import 'package:flutter/material.dart';
import '../../tokens/animation/ssp_animation.dart';

/// Page transition builder using SSP animation tokens.
/// Respects reduced motion accessibility setting.
PageRouteBuilder sspPageRoute({
  required Widget page,
  RouteSettings? settings,
  SSPPageTransition transition = SSPPageTransition.fadeSlide,
}) {
  return PageRouteBuilder(
    settings: settings,
    pageBuilder: (context, animation, secondaryAnimation) => page,
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      if (SSPAnimation.prefersReducedMotion(context)) {
        return child;
      }
      return _buildTransition(animation, child, transition);
    },
    transitionDuration: SSPAnimation.pageTransition,
    reverseTransitionDuration: SSPAnimation.pageTransition,
  );
}

enum SSPPageTransition {
  fadeSlide,
  fade,
  slide,
  scaleFade,
}

Widget _buildTransition(Animation<double> animation, Widget child, SSPPageTransition transition) {
  final curvedAnimation = CurvedAnimation(
    parent: animation,
    curve: SSPAnimation.standard,
  );

  switch (transition) {
    case SSPPageTransition.fadeSlide:
      return FadeTransition(
        opacity: curvedAnimation,
        child: SlideTransition(
          position: Tween<Offset>(
            begin: const Offset(0.0, 0.1),
            end: Offset.zero,
          ).animate(curvedAnimation),
          child: child,
        ),
      );
    case SSPPageTransition.fade:
      return FadeTransition(opacity: curvedAnimation, child: child);
    case SSPPageTransition.slide:
      return SlideTransition(
        position: Tween<Offset>(
          begin: const Offset(1.0, 0.0),
          end: Offset.zero,
        ).animate(curvedAnimation),
        child: child,
      );
    case SSPPageTransition.scaleFade:
      return ScaleTransition(
        scale: Tween<double>(begin: 0.95, end: 1.0).animate(curvedAnimation),
        child: FadeTransition(opacity: curvedAnimation, child: child),
      );
  }
}

/// Staggered list item animation for list entrances.
class SSPStaggeredList extends StatelessWidget {
  final List<Widget> children;
  final Axis scrollDirection;
  final double itemExtent;
  final Duration delayBetweenItems;
  final Duration animationDuration;
  final Curve curve;

  const SSPStaggeredList({
    super.key,
    required this.children,
    this.scrollDirection = Axis.vertical,
    this.itemExtent = 100,
    this.delayBetweenItems = const Duration(milliseconds: 50),
    this.animationDuration = SSPAnimation.medium,
    this.curve = SSPAnimation.standard,
  });

  @override
  Widget build(BuildContext context) {
    if (SSPAnimation.prefersReducedMotion(context)) {
      return ListView(
        scrollDirection: scrollDirection,
        itemExtent: itemExtent,
        children: children,
      );
    }

    return ListView.builder(
      scrollDirection: scrollDirection,
      itemExtent: itemExtent,
      itemCount: children.length,
      itemBuilder: (context, index) {
        return _StaggeredItem(
          index: index,
          delayBetweenItems: delayBetweenItems,
          animationDuration: animationDuration,
          curve: curve,
          child: children[index],
        );
      },
    );
  }
}

class _StaggeredItem extends StatefulWidget {
  final int index;
  final Duration delayBetweenItems;
  final Duration animationDuration;
  final Curve curve;
  final Widget child;

  const _StaggeredItem({
    required this.index,
    required this.delayBetweenItems,
    required this.animationDuration,
    required this.curve,
    required this.child,
  });

  @override
  State<_StaggeredItem> createState() => _StaggeredItemState();
}

class _StaggeredItemState extends State<_StaggeredItem> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: widget.animationDuration,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: widget.curve),
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0.0, 0.2),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _controller, curve: widget.curve));

    Future.delayed(widget.delayBetweenItems * widget.index, () {
      if (mounted) {
        _controller.forward();
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: SlideTransition(
        position: _slideAnimation,
        child: widget.child,
      ),
    );
  }
}

/// Shared axis transition for hero-like animations between screens.
class SSPSharedAxisTransition extends StatelessWidget {
  final Widget child;
  final String heroTag;
  final Axis axis;
  final Duration duration;

  const SSPSharedAxisTransition({
    super.key,
    required this.child,
    required this.heroTag,
    this.axis = Axis.horizontal,
    this.duration = SSPAnimation.pageTransition,
  });

  @override
  Widget build(BuildContext context) {
    if (SSPAnimation.prefersReducedMotion(context)) {
      return child;
    }

    return Hero(
      tag: heroTag,
      flightShuttleBuilder: (
        flightContext,
        animation,
        flightDirection,
        fromHero,
        toHero,
      ) {
        return DefaultTextStyle(
          style: DefaultTextStyle.of(flightContext).style,
          child: toHero as Widget,
        );
      },
      child: child,
    );
  }
}

/// Fade-through transition for shared element transitions.
class SSPFadeThroughTransition extends StatelessWidget {
  final Widget child;
  final String heroTag;

  const SSPFadeThroughTransition({
    super.key,
    required this.child,
    required this.heroTag,
  });

  @override
  Widget build(BuildContext context) {
    if (SSPAnimation.prefersReducedMotion(context)) {
      return child;
    }

    return Hero(
      tag: heroTag,
      child: child,
    );
  }
}