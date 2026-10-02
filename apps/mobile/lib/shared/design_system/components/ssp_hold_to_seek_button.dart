import 'dart:async';

import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../../core/player/player_seek_policy.dart';

/// A reusable transport control with LONG-PRESS SEEK built in.
///
/// Behaviour contract, identical on the Full Player and the Mini Player:
///
/// * **Tap** — fires [onPressed] once.
/// * **Long press** — fires [onLongPress] *only*, never [onPressed].
/// * **Hold** — after [kHoldToSeekStartDelay] it keeps firing [onLongPress]
///   every [kHoldToSeekRepeatInterval] for as long as the finger stays down,
///   which is what makes a single button an endless 10-second seek.
///
/// The resolved seek target is clamped to `[0, total]` by the shared policy, so
/// holding forward at the end of a track parks on the end instead of running
/// past it.
class SSPHoldToSeekButton extends StatefulWidget {
  const SSPHoldToSeekButton({
    super.key,
    required this.onPressed,
    required this.onHoldSeek,
    required this.position,
    required this.duration,
    this.direction = SeekDirection.forward,
    this.enabled = true,
    this.semanticLabel = 'खोजें',
    this.holdSemanticLabel = 'पकड़कर खोजें',
    required this.child,
  });

  /// A seek button that steps backwards.
  factory SSPHoldToSeekButton.backward({
    Key? key,
    required VoidCallback onPressed,
    required ValueChanged<Duration> onHoldSeek,
    required Duration position,
    required Duration total,
    bool enabled = true,
    String semanticLabel = 'पीछे',
    String holdSemanticLabel = 'पकड़कर पीछे',
    required Widget child,
  }) => SSPHoldToSeekButton(
    key: key,
    onPressed: onPressed,
    onHoldSeek: onHoldSeek,
    position: position,
    duration: total,
    direction: SeekDirection.backward,
    enabled: enabled,
    semanticLabel: semanticLabel,
    holdSemanticLabel: holdSemanticLabel,
    child: child,
  );

  /// A seek button that steps forwards.
  factory SSPHoldToSeekButton.forward({
    Key? key,
    required VoidCallback onPressed,
    required ValueChanged<Duration> onHoldSeek,
    required Duration position,
    required Duration total,
    bool enabled = true,
    String semanticLabel = 'आगे',
    String holdSemanticLabel = 'पकड़कर आगे',
    required Widget child,
  }) => SSPHoldToSeekButton(
    key: key,
    onPressed: onPressed,
    onHoldSeek: onHoldSeek,
    position: position,
    duration: total,
    direction: SeekDirection.forward,
    enabled: enabled,
    semanticLabel: semanticLabel,
    holdSemanticLabel: holdSemanticLabel,
    child: child,
  );

  /// Fires once on a plain tap.
  final VoidCallback onPressed;

  /// Fires once on long-press, then repeatedly while the press is held. The
  /// argument is the *resolved, clamped* target position.
  final ValueChanged<Duration> onHoldSeek;

  final Duration position;
  final Duration duration;
  final SeekDirection direction;
  final bool enabled;
  final String semanticLabel;
  final String holdSemanticLabel;
  final Widget child;

  @override
  State<SSPHoldToSeekButton> createState() => _SSPHoldToSeekButtonState();
}

class _SSPHoldToSeekButtonState extends State<SSPHoldToSeekButton> {
  Timer? _repeat;
  int _step = 0;
  bool _holding = false;

  @override
  void dispose() {
    _cancelRepeat();
    super.dispose();
  }

  void _cancelRepeat() {
    _repeat?.cancel();
    _repeat = null;
    _holding = false;
    _step = 0;
  }

  /// Resolves and emits one hold-to-seek step, using the shared policy so the
  /// clamp rules cannot drift between surfaces.
  void _emitStep({required bool first}) {
    _step = first ? 1 : _step + 1;
    final target = resolveHoldSeekTarget(
      current: widget.position,
      total: widget.duration,
      direction: widget.direction,
      steps: _step,
    );
    HapticFeedback.selectionClick();
    widget.onHoldSeek(target);
  }

  void _handleLongPressStart() {
    if (!widget.enabled) return;
    setState(() => _holding = true);
    _emitStep(first: true);
    _repeat = Timer.periodic(kHoldToSeekRepeatInterval, (_) {
      if (!mounted) {
        _cancelRepeat();
        return;
      }
      _emitStep(first: false);
    });
  }

  void _handleLongPressEnd() {
    _cancelRepeat();
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    // The documented contract is that the hold repeat starts after
    // kHoldToSeekStartDelay (400ms). GestureDetector's built-in long press
    // would use Flutter's 500ms default, so the recogniser is configured
    // explicitly to keep the cadence identical on every surface.
    final recognizers = <Type, GestureRecognizerFactory>{
      TapGestureRecognizer:
          GestureRecognizerFactoryWithHandlers<TapGestureRecognizer>(
            () => TapGestureRecognizer(),
            (recognizer) =>
                recognizer.onTap = widget.enabled ? widget.onPressed : null,
          ),
      LongPressGestureRecognizer:
          GestureRecognizerFactoryWithHandlers<LongPressGestureRecognizer>(
            () => LongPressGestureRecognizer(duration: kHoldToSeekStartDelay),
            (recognizer) {
              recognizer.onLongPressStart = widget.enabled
                  ? (_) => _handleLongPressStart()
                  : null;
              recognizer.onLongPressEnd = widget.enabled
                  ? (_) => _handleLongPressEnd()
                  : null;
              recognizer.onLongPressCancel = widget.enabled
                  ? _handleLongPressEnd
                  : null;
            },
          ),
    };

    return Semantics(
      // A container that owns exactly one labelled node: the child is visual
      // only, so screen readers announce the control ("5s आगे", or
      // "पकड़कर 10s आगे" while held) instead of that plus the child's text.
      container: true,
      excludeSemantics: true,
      button: true,
      enabled: widget.enabled,
      label: _holding ? widget.holdSemanticLabel : widget.semanticLabel,
      child: RawGestureDetector(
        behavior: HitTestBehavior.opaque,
        gestures: recognizers,
        child: widget.child,
      ),
    );
  }
}

/// A reusable circular transport button used by the Full Player and the Mini
/// Player so both surfaces share one control shape.
class SSPPlayerControlButton extends StatelessWidget {
  const SSPPlayerControlButton({
    super.key,
    required this.icon,
    required this.onPressed,
    this.size = 44,
    this.iconSize = 24,
    this.iconColor,
    this.backgroundColor,
    this.tooltip,
    this.enabled = true,
    this.gradient,
  });

  final IconData icon;
  final VoidCallback? onPressed;
  final double size;
  final double iconSize;
  final Color? iconColor;
  final Color? backgroundColor;
  final String? tooltip;
  final bool enabled;
  final Gradient? gradient;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final fg = enabled
        ? (iconColor ??
              (isDark ? const Color(0xFFE7E5E4) : const Color(0xFF292524)))
        : (isDark ? const Color(0xFF57534E) : const Color(0xFFD6D3D1));

    Widget button = SizedBox(
      width: size,
      height: size,
      child: Material(
        color: Colors.transparent,
        shape: const CircleBorder(),
        clipBehavior: Clip.antiAlias,
        elevation: 0,
        child: InkWell(
          onTap: enabled ? onPressed : null,
          child: Container(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: backgroundColor,
              gradient: gradient,
            ),
            alignment: Alignment.center,
            child: Icon(icon, size: iconSize, color: fg),
          ),
        ),
      ),
    );

    if (!enabled) {
      button = Opacity(opacity: 0.5, child: button);
    }
    if (tooltip == null) return button;
    return Tooltip(message: tooltip!, child: button);
  }
}
