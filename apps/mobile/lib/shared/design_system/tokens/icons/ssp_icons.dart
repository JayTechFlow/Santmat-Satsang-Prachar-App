import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../colors/ssp_colors.dart';

/// Authoritative SSP Iconography Mapping
/// Standardized on rounded, intuitive Material symbols with custom spiritual painters where appropriate.
class SSPIcons {
  const SSPIcons._();

  // Custom Spiritual Icon Widgets
  static Widget diya({double size = 24.0, Color? color, String? semanticLabel}) =>
      DiyaIcon(size: size, color: color, semanticLabel: semanticLabel);

  static Widget prayingHands({double size = 24.0, Color? color, String? semanticLabel}) =>
      PrayingHandsIcon(size: size, color: color, semanticLabel: semanticLabel);

  // Navigation
  static const IconData home = Icons.home_rounded;
  static const IconData audioNav = Icons.music_note_rounded;
  static const IconData satsangNav = Icons.volunteer_activism_rounded;
  static const IconData libraryNav = Icons.library_music_rounded;
  static const IconData searchNav = Icons.search_rounded;
  static const IconData notificationsNav = Icons.notifications_rounded;
  static const IconData profileNav = Icons.person_rounded;
  static const IconData settingsNav = Icons.settings_rounded;

  // Audio Playback
  static const IconData play = Icons.play_arrow_rounded;
  static const IconData pause = Icons.pause_rounded;
  static const IconData skipNext = Icons.skip_next_rounded;
  static const IconData skipPrevious = Icons.skip_previous_rounded;
  static const IconData shuffle = Icons.shuffle_rounded;
  static const IconData repeat = Icons.repeat_rounded;
  static const IconData waveform = Icons.waves_rounded;
  static const IconData lyrics = Icons.lyrics_rounded;
  static const IconData queue = Icons.queue_music_rounded;
  static const IconData timer = CupertinoIcons.timer;

  // Content & Actions
  static const IconData favorite = Icons.favorite_rounded;
  static const IconData favoriteOutline = Icons.favorite_border_rounded;
  static const IconData bookmark = Icons.bookmark_rounded;
  static const IconData bookmarkOutline = Icons.bookmark_border_rounded;
  static const IconData share = Icons.share_rounded;
  static const IconData more = Icons.more_horiz_rounded;
  static const IconData filter = Icons.filter_list_rounded;

  // Navigation Arrows & Controls
  static const IconData arrowBack = Icons.arrow_back_ios_new_rounded;
  static const IconData arrowForward = Icons.arrow_forward_ios_rounded;
  static const IconData chevronRight = Icons.chevron_right_rounded;
  static const IconData expandMore = Icons.expand_more_rounded;
  static const IconData close = Icons.close_rounded;

  // System & Status
  static const IconData check = Icons.check_circle_rounded;
  static const IconData error = Icons.error_outline_rounded;
  static const IconData info = Icons.info_outline_rounded;
  static const IconData warning = Icons.warning_amber_rounded;
}

/// Custom Spiritual Diya Flame Icon Widget
class DiyaIcon extends StatelessWidget {
  final double size;
  final Color? color;
  final String? semanticLabel;

  const DiyaIcon({
    super.key,
    this.size = 24.0,
    this.color,
    this.semanticLabel,
  });

  @override
  Widget build(BuildContext context) {
    final iconColor = color ?? IconTheme.of(context).color ?? SSPColors.sacredGold;
    return Semantics(
      label: semanticLabel ?? 'Spiritual Diya Flame',
      child: CustomPaint(
        size: Size(size, size),
        painter: _DiyaPainter(color: iconColor),
      ),
    );
  }
}

class _DiyaPainter extends CustomPainter {
  final Color color;

  _DiyaPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    // Paint for the diya base (lamp bowl)
    final basePaint = Paint()
      ..color = color
      ..style = PaintingStyle.fill
      ..isAntiAlias = true;

    // 1. Diya Base Bowl
    final basePath = Path()
      ..moveTo(w * 0.12, h * 0.58)
      ..cubicTo(w * 0.15, h * 0.88, w * 0.85, h * 0.88, w * 0.88, h * 0.58)
      ..cubicTo(w * 0.65, h * 0.68, w * 0.35, h * 0.68, w * 0.12, h * 0.58)
      ..close();
    canvas.drawPath(basePath, basePaint);

    // Diya Stand / Foot
    final footPath = Path()
      ..moveTo(w * 0.38, h * 0.82)
      ..quadraticBezierTo(w * 0.50, h * 0.86, w * 0.62, h * 0.82)
      ..lineTo(w * 0.68, h * 0.94)
      ..lineTo(w * 0.32, h * 0.94)
      ..close();
    canvas.drawPath(footPath, basePaint);

    // 2. Diya Outer Flame (teardrop spiritual flame)
    final flameColor = color == SSPColors.sacredGold ? SSPColors.amberHighlight : color;
    final flameGradientPaint = Paint()
      ..shader = LinearGradient(
        colors: [
          color,
          flameColor,
        ],
        begin: Alignment.bottomCenter,
        end: Alignment.topCenter,
      ).createShader(Rect.fromLTWH(0, 0, w, h))
      ..style = PaintingStyle.fill
      ..isAntiAlias = true;

    final outerFlamePath = Path()
      ..moveTo(w * 0.50, h * 0.08)
      ..cubicTo(w * 0.68, h * 0.28, w * 0.68, h * 0.52, w * 0.50, h * 0.58)
      ..cubicTo(w * 0.32, h * 0.52, w * 0.32, h * 0.28, w * 0.50, h * 0.08)
      ..close();
    canvas.drawPath(outerFlamePath, flameGradientPaint);

    // Inner Flame Core
    final innerFlamePaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.85)
      ..style = PaintingStyle.fill
      ..isAntiAlias = true;

    final innerFlamePath = Path()
      ..moveTo(w * 0.50, h * 0.26)
      ..cubicTo(w * 0.57, h * 0.38, w * 0.57, h * 0.48, w * 0.50, h * 0.54)
      ..cubicTo(w * 0.43, h * 0.48, w * 0.43, h * 0.38, w * 0.50, h * 0.26)
      ..close();
    canvas.drawPath(innerFlamePath, innerFlamePaint);
  }

  @override
  bool shouldRepaint(covariant _DiyaPainter oldDelegate) => oldDelegate.color != color;
}

/// Custom Spiritual Praying Hands (Namaste) Icon Widget
class PrayingHandsIcon extends StatelessWidget {
  final double size;
  final Color? color;
  final String? semanticLabel;

  const PrayingHandsIcon({
    super.key,
    this.size = 24.0,
    this.color,
    this.semanticLabel,
  });

  @override
  Widget build(BuildContext context) {
    final iconColor = color ?? IconTheme.of(context).color ?? SSPColors.deepSaffron;
    return Semantics(
      label: semanticLabel ?? 'Praying Hands Namaste Gesture',
      child: CustomPaint(
        size: Size(size, size),
        painter: _PrayingHandsPainter(color: iconColor),
      ),
    );
  }
}

class _PrayingHandsPainter extends CustomPainter {
  final Color color;

  _PrayingHandsPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill
      ..isAntiAlias = true;

    // Namaste / Anjali Mudra (Praying Hands silhouette)
    final path = Path();
    path.moveTo(w * 0.50, h * 0.08);
    path.cubicTo(w * 0.62, h * 0.22, w * 0.72, h * 0.40, w * 0.70, h * 0.55);
    path.cubicTo(w * 0.68, h * 0.65, w * 0.65, h * 0.75, w * 0.62, h * 0.92);
    path.quadraticBezierTo(w * 0.50, h * 0.88, w * 0.38, h * 0.92);
    path.cubicTo(w * 0.35, h * 0.75, w * 0.32, h * 0.65, w * 0.30, h * 0.55);
    path.cubicTo(w * 0.28, h * 0.40, w * 0.38, h * 0.22, w * 0.50, h * 0.08);
    path.close();

    canvas.drawPath(path, paint);

    // Seam line separating left and right hands
    final strokePaint = Paint()
      ..color = (color == Colors.white ? Colors.black : Colors.white).withValues(alpha: 0.35)
      ..style = PaintingStyle.stroke
      ..strokeWidth = w * 0.04
      ..strokeCap = StrokeCap.round
      ..isAntiAlias = true;

    final seamPath = Path()
      ..moveTo(w * 0.50, h * 0.20)
      ..lineTo(w * 0.50, h * 0.76);
    canvas.drawPath(seamPath, strokePaint);
  }

  @override
  bool shouldRepaint(covariant _PrayingHandsPainter oldDelegate) => oldDelegate.color != color;
}

