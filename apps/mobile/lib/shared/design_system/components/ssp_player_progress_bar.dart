import 'dart:async';

import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../../core/player/player_seek_policy.dart';
import '../tokens/spacing/ssp_spacing.dart';

/// Formats a [Duration] as `m:ss` (or `h:mm:ss` past an hour).
String formatSspPlaybackTime(Duration duration) {
  final total = duration.isNegative ? 0 : duration.inSeconds;
  final hours = total ~/ 3600;
  final minutes = (total % 3600) ~/ 60;
  final seconds = total % 60;
  final ss = seconds.toString().padLeft(2, '0');
  if (hours > 0) {
    return '$hours:${minutes.toString().padLeft(2, '0')}:$ss';
  }
  return '$minutes:$ss';
}

/// The one reusable player progress bar.
///
/// Every player surface in the application uses this one widget, so the
/// scrubbing and seeking behaviour is identical everywhere by construction.
///
/// Supported gestures:
/// * **Tap** — seek to the tapped position.
/// * **Drag horizontally** — scrub; the engine is not touched until release.
/// * **Long press** — enter hold-to-scrub, then drag to preview any position
///   before committing (LONG-PRESS SEEK).
///
/// While the user is scrubbing, [position] is owned by the gesture, so the
/// reported playhead never fights the finger.
class SSPPlayerProgressBar extends StatefulWidget {
  const SSPPlayerProgressBar({
    super.key,
    required this.position,
    required this.duration,
    required this.onSeek,
    this.onScrubStart,
    this.onScrubUpdate,
    this.onScrubEnd,
    this.onScrubCancel,
    this.enabled = true,
    this.trackHeight = 5,
    this.showThumb = true,
    this.activeColor,
    this.inactiveColor,
    this.semanticsLabel = 'प्लेयर प्रगति',
  });

  final Duration position;
  final Duration duration;

  /// Commits a seek to a concrete position.
  final ValueChanged<Duration> onSeek;

  final VoidCallback? onScrubStart;

  /// Live scrub preview.
  final ValueChanged<Duration>? onScrubUpdate;

  final VoidCallback? onScrubEnd;

  final VoidCallback? onScrubCancel;

  final bool enabled;
  final double trackHeight;
  final bool showThumb;
  final Color? activeColor;
  final Color? inactiveColor;
  final String semanticsLabel;

  @override
  State<SSPPlayerProgressBar> createState() => _SSPPlayerProgressBarState();
}

class _SSPPlayerProgressBarState extends State<SSPPlayerProgressBar> {
  double? _dragFraction;
  bool _holdScrubActive = false;

  /// The endless seek that runs while the bar is held down.
  Timer? _holdRepeat;
  int _holdStep = 0;
  Duration? _lastHoldTarget;

  /// True once a long-press hold has actually started. The tap/drag path and
  /// the hold path can both receive a release event, so whichever one owns the
  /// gesture is the only one allowed to commit a seek.
  bool _holdStarted = false;

  /// Where the finger first went down. Kept independently of the drag state so
  /// the hold direction is still known when the tap recogniser is rejected the
  /// instant a long press wins.
  double? _touchFraction;

  /// A hold scrubs backwards from the left half of the bar and forwards from
  /// the right half, so one control covers both directions. Frozen when the
  /// hold starts so a later drag cannot flip direction mid-hold.
  SeekDirection _holdDirection = SeekDirection.forward;

  @override
  void dispose() {
    _holdRepeat?.cancel();
    super.dispose();
  }

  bool get _isScrubbing => _dragFraction != null;

  /// True while a long-press hold-scrub gesture is in progress.
  bool get _isHoldScrubbing => _holdScrubActive && _isScrubbing;

  Duration get _total {
    final d = widget.duration;
    if (d > Duration.zero) return d;
    return Duration.zero;
  }

  /// The playhead the bar renders: the gesture's value while scrubbing,
  /// otherwise the engine's.
  Duration get _renderedPosition {
    if (_dragFraction != null && _total > Duration.zero) {
      return Duration(
        milliseconds: (_dragFraction! * _total.inMilliseconds).round(),
      );
    }
    return widget.position;
  }

  double get _fraction {
    if (_dragFraction != null) return _dragFraction!.clamp(0.0, 1.0);
    final totalMs = _total.inMilliseconds;
    if (totalMs <= 0) return 0;
    return (widget.position.inMilliseconds / totalMs).clamp(0.0, 1.0);
  }

  Duration _positionFor(double dx, double width) {
    if (width <= 0) return Duration.zero;
    final f = (dx / width).clamp(0.0, 1.0);
    return Duration(milliseconds: (f * _total.inMilliseconds).round());
  }

  void _handleDown(double dx, double width) {
    if (!widget.enabled || _total <= Duration.zero) return;
    HapticFeedback.selectionClick();
    final fraction = (dx / width).clamp(0.0, 1.0);
    setState(() {
      _dragFraction = fraction;
      _touchFraction = fraction;
    });
    widget.onScrubStart?.call();
    widget.onScrubUpdate?.call(_positionFor(dx, width));
  }

  void _handleMove(double dx, double width) {
    if (!widget.enabled || !_isScrubbing) return;
    HapticFeedback.selectionClick();
    final f = (dx / width).clamp(0.0, 1.0);
    setState(() => _dragFraction = f);
    widget.onScrubUpdate?.call(_positionFor(dx, width));
  }

  void _handleUp(double dx, double width) {
    if (!widget.enabled) return;
    _stopHoldRepeat();
    if (_holdStarted) {
      // The hold path already owns this gesture and will commit on release.
      _holdStarted = false;
      return;
    }
    if (!_isScrubbing) return;
    final target = _positionFor(dx, width);
    setState(() {
      _dragFraction = null;
      _holdScrubActive = false;
    });
    widget.onScrubEnd?.call();
    widget.onSeek(target);
  }

  void _handleCancel() {
    _stopHoldRepeat();
    if (_holdStarted) {
      _holdStarted = false;
      return;
    }
    if (!_isScrubbing) return;
    setState(() {
      _dragFraction = null;
      _holdScrubActive = false;
    });
    widget.onScrubEnd?.call();
    widget.onScrubCancel?.call();
  }

  /// LONG-PRESS SEEK: keeping the finger down turns the bar into an endless
  /// seek driven by the same shared policy and cadence as
  /// [SSPHoldToSeekButton], so "hold to seek" means the same thing everywhere.
  /// While holding, the finger can also be dragged, and the release commits a
  /// single seek.
  void _handleLongPressStart() {
    if (!widget.enabled || _total <= Duration.zero) return;
    _holdStarted = true;
    _holdDirection = (_touchFraction ?? _dragFraction ?? 0.5) < 0.5
        ? SeekDirection.backward
        : SeekDirection.forward;
    setState(() => _holdScrubActive = true);
    _emitHoldStep(first: true);
    _holdRepeat ??= Timer.periodic(kHoldToSeekRepeatInterval, (_) {
      if (!mounted) {
        _stopHoldRepeat();
        return;
      }
      _emitHoldStep(first: false);
    });
  }

  void _emitHoldStep({required bool first}) {
    if (!widget.enabled || _total <= Duration.zero) return;
    _holdStep = first ? 1 : _holdStep + 1;
    final target = resolveHoldSeekTarget(
      current: widget.position,
      total: _total,
      direction: _holdDirection,
      steps: _holdStep,
    );
    HapticFeedback.selectionClick();
    _lastHoldTarget = target;
    widget.onScrubUpdate?.call(target);
  }

  void _stopHoldRepeat() {
    _holdRepeat?.cancel();
    _holdRepeat = null;
    _holdStep = 0;
  }

  void _handleLongPressEnd() {
    _stopHoldRepeat();
    if (!widget.enabled) return;
    if (!_holdStarted) return;
    _holdStarted = false;
    final target = _lastHoldTarget ?? widget.position;
    setState(() {
      _dragFraction = null;
      _holdScrubActive = false;
      _lastHoldTarget = null;
    });
    widget.onScrubEnd?.call();
    widget.onSeek(target);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final active =
        widget.activeColor ??
        (isDark ? Colors.amber.shade400 : Colors.amber.shade800);
    final inactive =
        widget.inactiveColor ??
        (isDark ? const Color(0xFF292524) : const Color(0xFFE5DACE));

    return Semantics(
      label: widget.semanticsLabel,
      value:
          '${formatSspPlaybackTime(_renderedPosition)} / ${formatSspPlaybackTime(_total)}',
      slider: true,
      child: LayoutBuilder(
        builder: (context, constraints) {
          final width = constraints.maxWidth.isFinite
              ? constraints.maxWidth
              : 1.0;
          // The long-press recogniser is configured explicitly so the hold
          // starts after kHoldToSeekStartDelay (400ms) instead of Flutter's
          // 500ms default, matching SSPHoldToSeekButton exactly.
          return RawGestureDetector(
            behavior: HitTestBehavior.opaque,
            gestures: {
              LongPressGestureRecognizer:
                  GestureRecognizerFactoryWithHandlers<
                    LongPressGestureRecognizer
                  >(
                    () => LongPressGestureRecognizer(
                      duration: kHoldToSeekStartDelay,
                    ),
                    (recognizer) {
                      recognizer.onLongPressStart = (_) =>
                          _handleLongPressStart();
                      recognizer.onLongPressEnd = (_) => _handleLongPressEnd();
                      recognizer.onLongPressCancel = _handleLongPressEnd;
                    },
                  ),
            },
            child: GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTapDown: (d) => _handleDown(d.localPosition.dx, width),
              onHorizontalDragStart: (d) =>
                  _handleDown(d.localPosition.dx, width),
              onHorizontalDragUpdate: (d) =>
                  _handleMove(d.localPosition.dx, width),
              onHorizontalDragEnd: (d) => _handleUp(d.localPosition.dx, width),
              onHorizontalDragCancel: _handleCancel,
              onTapUp: (d) => _handleUp(d.localPosition.dx, width),
              onTapCancel: _handleCancel,
              child: SizedBox(
                height: widget.trackHeight + 20,
                child: Center(
                  child: SizedBox(
                    height: widget.trackHeight,
                    child: Stack(
                      clipBehavior: Clip.none,
                      children: [
                        Container(
                          decoration: BoxDecoration(
                            color: inactive,
                            borderRadius: BorderRadius.circular(
                              widget.trackHeight,
                            ),
                          ),
                        ),
                        FractionallySizedBox(
                          widthFactor: _fraction,
                          child: Container(
                            decoration: BoxDecoration(
                              color: active,
                              borderRadius: BorderRadius.circular(
                                widget.trackHeight,
                              ),
                            ),
                          ),
                        ),
                        if (_isHoldScrubbing)
                          Positioned(
                            left: (_fraction * width) - 22,
                            top: -(22 - widget.trackHeight / 2),
                            child: Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: active.withValues(alpha: 0.18),
                              ),
                            ),
                          ),
                        if (widget.showThumb)
                          Positioned(
                            left: (_fraction * width) - 7,
                            top: -(7 - widget.trackHeight / 2),
                            child: Container(
                              width: 14,
                              height: 14,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: active,
                                border: Border.all(
                                  color: isDark
                                      ? const Color(0xFF181614)
                                      : Colors.white,
                                  width: 2,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.2),
                                    blurRadius: 4,
                                    offset: const Offset(0, 1),
                                  ),
                                ],
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

/// The reusable elapsed / total time label row that belongs under
/// [SSPPlayerProgressBar].
class SSPPlayerTimeLabels extends StatelessWidget {
  const SSPPlayerTimeLabels({
    super.key,
    required this.position,
    required this.duration,
    this.scrubbing = false,
    this.color,
  });

  final Duration position;
  final Duration duration;
  final bool scrubbing;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final labelColor =
        color ?? (isDark ? const Color(0xFFA8A29E) : const Color(0xFF57534E));
    final style = TextStyle(
      fontSize: 12,
      fontWeight: FontWeight.w600,
      color: labelColor,
      fontFeatures: const [FontFeature.tabularFigures()],
    );

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(formatSspPlaybackTime(position), style: style),
        if (scrubbing)
          Padding(
            padding: const EdgeInsets.only(bottom: 2),
            child: Text(
              'स्क्रब कर रहे हैं',
              style: style.copyWith(fontSize: 10, color: Colors.amber.shade700),
            ),
          ),
        SSPSpacing.gapW4,
        Text(formatSspPlaybackTime(duration), style: style),
      ],
    );
  }
}
