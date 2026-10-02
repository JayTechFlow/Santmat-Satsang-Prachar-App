/// Canonical, pure transport policies for the player (SMART PREVIOUS/NEXT and
/// LONG-PRESS SEEK).
///
/// These functions are the single definition of the behaviour. The playback
/// notifier, the Full Player and the Mini Player all call into them, so the
/// three surfaces can never disagree about what "previous" or "hold to seek"
/// means, and the behaviour is regression-tested without an audio engine.
library;

/// Above this playback position, "previous" restarts the current track instead
/// of jumping to the one before it — the behaviour every enterprise music
/// player ships with, because users mis-tap Previous constantly.
const Duration kSmartPreviousRestartThreshold = Duration(seconds: 3);

/// The step applied by a short seek button (the 5s nudge on the Full Player).
const Duration kSeekNudgeStep = Duration(seconds: 5);

/// The step applied by ONE tick of a long-press / hold-to-seek gesture.
const Duration kHoldToSeekStep = Duration(seconds: 10);

/// How long a long-press must be held before the hold-to-seek repeat starts.
const Duration kHoldToSeekStartDelay = Duration(milliseconds: 400);

/// Interval between repeated hold-to-seek steps once the repeat has started.
const Duration kHoldToSeekRepeatInterval = Duration(milliseconds: 200);

/// What a "previous" press must do.
enum SmartPreviousAction {
  /// Restart the current track from zero.
  restartCurrentTrack,

  /// Select the track before the current one in the queue.
  selectPreviousTrack,

  /// There is nothing to go back to; the press is a no-op.
  noAction,
}

/// What a "next" press must do.
enum SmartNextAction {
  /// Select the track after the current one in the queue.
  selectNextTrack,

  /// Replay the current track (repeat-one, or repeat-all at the end of queue).
  restartCurrentTrack,

  /// Stop at the end of the queue and report completion.
  stopAtQueueEnd,

  /// There is nothing to advance to; the press is a no-op.
  noAction,
}

/// Resolves SMART PREVIOUS.
///
/// ```
/// IF a track is playing more than [kSmartPreviousRestartThreshold] in
///        -> restart the current track
/// ELSE IF there is a previous track in the queue
///        -> select the previous track
/// ELSE IF repeat-all is on and the queue wraps
///        -> select the last track
/// ELSE    -> no-op
/// ```
SmartPreviousAction resolveSmartPrevious({
  required bool hasTrack,
  required Duration position,
  required bool hasPreviousTrack,
  required bool isRepeatEnabled,
  bool isQueueEmpty = false,
}) {
  if (!hasTrack || isQueueEmpty) return SmartPreviousAction.noAction;

  if (position > kSmartPreviousRestartThreshold) {
    return SmartPreviousAction.restartCurrentTrack;
  }
  if (hasPreviousTrack) return SmartPreviousAction.selectPreviousTrack;
  if (isRepeatEnabled) return SmartPreviousAction.selectPreviousTrack;
  return SmartPreviousAction.noAction;
}

/// Resolves SMART NEXT.
///
/// ```
/// IF there is a next track in the queue   -> select it
/// ELSE IF repeat-one / repeat-all is on   -> restart the current track
/// ELSE                                    -> stop at the end of the queue
/// ```
SmartNextAction resolveSmartNext({
  required bool hasTrack,
  required bool hasNextTrack,
  required bool isRepeatEnabled,
  bool isQueueEmpty = false,
}) {
  if (!hasTrack) return SmartNextAction.noAction;
  if (isQueueEmpty) return SmartNextAction.noAction;
  if (hasNextTrack) return SmartNextAction.selectNextTrack;
  if (isRepeatEnabled) return SmartNextAction.restartCurrentTrack;
  return SmartNextAction.stopAtQueueEnd;
}

/// The direction of a hold-to-seek gesture.
enum SeekDirection { forward, backward }

/// Resolves the target position of ONE seek step (LONG-PRESS SEEK).
///
/// The result is always clamped to `[0, total]`, so holding forward at the end
/// of a track parks on the end and holding backward at the start parks on zero
/// instead of producing a negative duration.
Duration resolveHoldSeekTarget({
  required Duration current,
  required Duration total,
  required SeekDirection direction,
  int steps = 1,
  Duration step = kHoldToSeekStep,
}) {
  if (steps < 0) steps = 0;
  final upperBound = total > Duration.zero ? total : current;
  final delta = step * steps;
  final raw = switch (direction) {
    SeekDirection.forward => current + delta,
    SeekDirection.backward => current - delta,
  };
  if (raw < Duration.zero) return Duration.zero;
  if (raw > upperBound) return upperBound;
  return raw;
}

/// Resolves the target position of a single short seek nudge.
Duration resolveNudgeSeekTarget({
  required Duration current,
  required Duration total,
  required SeekDirection direction,
  Duration step = kSeekNudgeStep,
}) => resolveHoldSeekTarget(
  current: current,
  total: total,
  direction: direction,
  steps: 1,
  step: step,
);
