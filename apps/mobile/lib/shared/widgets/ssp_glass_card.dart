import 'dart:ui';
import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_shadows.dart';

/// SSPGlassCard creates a premium glassmorphism effect using BackdropFilter.
/// Ideal for floating elements over artwork, banners, or images.
class SSPGlassCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final BorderRadius? borderRadius;
  final double blur;
  final double opacity;
  final Color? color;

  const SSPGlassCard({
    super.key,
    required this.child,
    this.padding,
    this.borderRadius,
    this.blur = 16.0,
    this.opacity = 0.2,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveColor = color ?? AppColors.glassBackground(context);
    final effectiveRadius = borderRadius ?? AppRadius.brLg;

    return Container(
      decoration: BoxDecoration(
        borderRadius: effectiveRadius,
        boxShadow: AppShadows.glass(context),
      ),
      child: ClipRRect(
        borderRadius: effectiveRadius,
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
          child: Container(
            padding: padding,
            decoration: BoxDecoration(
              color: effectiveColor.withValues(alpha: opacity),
              borderRadius: effectiveRadius,
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.15),
                width: 1.0,
              ),
            ),
            child: child,
          ),
        ),
      ),
    );
  }
}
