import 'dart:ui';
import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_radius.dart';

/// SSPGlassContainer creates a premium glassmorphism effect using BackdropFilter.
/// Ideal for floating elements over artwork, banners, or images.
class SSPGlassContainer extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final BorderRadius? borderRadius;
  final double blur;
  final double opacity;
  final Color? color;

  const SSPGlassContainer({
    super.key,
    required this.child,
    this.padding,
    this.borderRadius,
    this.blur = 10.0,
    this.opacity = 0.15,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveColor = color ?? AppColors.glassBackground(context);
    final effectiveRadius = borderRadius ?? AppRadius.borderRadiusLg;

    return ClipRRect(
      borderRadius: effectiveRadius,
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
        child: Container(
          padding: padding,
          decoration: BoxDecoration(
            color: effectiveColor.withValues(alpha: opacity),
            borderRadius: effectiveRadius,
            border: Border.all(color: AppColors.border(context), width: 1.0),
          ),
          child: child,
        ),
      ),
    );
  }
}
