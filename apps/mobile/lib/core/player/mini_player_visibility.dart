import 'player_lifecycle.dart';

/// Why the Mini Player is currently hidden (PHASE 5).
enum MiniPlayerHiddenReason {
  /// No track exists.
  noTrack,

  /// The playback session has been cleared / stopped explicitly.
  noActiveSession,

  /// The full player is currently occupying the player surface.
  fullPlayerVisible,

  /// The current screen excludes the mini player by design.
  screenExcluded,
}

extension MiniPlayerHiddenReasonLabel on MiniPlayerHiddenReason {
  String get label => switch (this) {
    MiniPlayerHiddenReason.noTrack => 'no-track',
    MiniPlayerHiddenReason.noActiveSession => 'no-active-session',
    MiniPlayerHiddenReason.fullPlayerVisible => 'full-player-visible',
    MiniPlayerHiddenReason.screenExcluded => 'screen-excluded',
  };
}

/// The resolved Mini Player visibility decision for one frame.
class MiniPlayerVisibility {
  const MiniPlayerVisibility.show() : visible = true, reason = null;

  const MiniPlayerVisibility.hide(MiniPlayerHiddenReason thisReason)
    : visible = false,
      reason = thisReason;

  /// Whether the Mini Player may render.
  final bool visible;

  /// `null` when [visible], otherwise the single rule that hid it.
  final MiniPlayerHiddenReason? reason;

  @override
  bool operator ==(Object other) =>
      other is MiniPlayerVisibility &&
      other.visible == visible &&
      other.reason == reason;

  @override
  int get hashCode => Object.hash(visible, reason);

  @override
  String toString() => visible
      ? 'MiniPlayerVisibility.show'
      : 'MiniPlayerVisibility.hide(${reason!.label})';
}

/// The one canonical Mini Player visibility policy (PHASE 5).
///
/// ```
/// VISIBLE when:
///     a track exists
///     AND the player session is active
///     AND the full player is not currently occupying the player surface
///     AND the current screen supports the mini player
///
/// HIDDEN when:
///     no track exists
///     OR the playback session was cleared
///     OR the full player is visible
///     OR the screen excludes the mini player by design
/// ```
///
/// Expressed as a pure function of the inputs so the rule is regression-tested
/// without pumping widgets, and so both the shell and the Mini Player itself
/// resolve the *same* answer.
MiniPlayerVisibility resolveMiniPlayerVisibility({
  required bool hasTrack,
  required bool hasActiveSession,
  required bool isPlayerVisible,
  required bool screenSupportsMiniPlayer,
}) {
  if (!hasTrack) {
    return const MiniPlayerVisibility.hide(MiniPlayerHiddenReason.noTrack);
  }
  if (!hasActiveSession) {
    return const MiniPlayerVisibility.hide(
      MiniPlayerHiddenReason.noActiveSession,
    );
  }
  if (isPlayerVisible) {
    return const MiniPlayerVisibility.hide(
      MiniPlayerHiddenReason.fullPlayerVisible,
    );
  }
  if (!screenSupportsMiniPlayer) {
    return const MiniPlayerVisibility.hide(
      MiniPlayerHiddenReason.screenExcluded,
    );
  }
  return const MiniPlayerVisibility.show();
}

/// Convenience overload that resolves the policy straight from a
/// [PlayerLifecycle] snapshot.
MiniPlayerVisibility resolveMiniPlayerVisibilityFor(
  PlayerLifecycle lifecycle, {
  bool screenSupportsMiniPlayer = true,
}) => resolveMiniPlayerVisibility(
  hasTrack: lifecycle.hasTrack,
  hasActiveSession: lifecycle.hasActiveSession,
  isPlayerVisible: lifecycle.isPlayerOpen,
  screenSupportsMiniPlayer: screenSupportsMiniPlayer,
);
