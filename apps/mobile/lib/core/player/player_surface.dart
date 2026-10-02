import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'player_lifecycle.dart';

/// Which player surface is currently on screen (PHASE 2 / PHASE 5).
///
/// This is *pure UI state*. It never owns an audio engine: the Full Player and
/// the Mini Player both observe the single playback state, and this provider
/// only records which of the two surfaces is currently occupying the screen.
class PlayerSurfaceNotifier extends Notifier<PlayerSurface> {
  @override
  PlayerSurface build() => PlayerSurface.collapsed;

  /// Marks the full player as the occupant of the player surface.
  ///
  /// Idempotent: opening an already-open player is a no-op, which is what makes
  /// a double tap on a song row safe.
  void open() {
    if (state == PlayerSurface.fullPlayerOpen) return;
    state = PlayerSurface.fullPlayerOpen;
  }

  /// Marks the full player as dismissed, returning the surface to the Mini
  /// Player. Playback is deliberately untouched: dismissing the player must
  /// never stop the music (PHASE 7).
  void collapse() {
    if (state == PlayerSurface.collapsed) return;
    state = PlayerSurface.collapsed;
  }
}

final playerSurfaceProvider =
    NotifierProvider<PlayerSurfaceNotifier, PlayerSurface>(
      PlayerSurfaceNotifier.new,
    );

/// Screens that exclude the Mini Player by design (PHASE 5).
///
/// A screen belongs here when a docked playback bar would either obscure the
/// content or compete with the screen's own primary control. Overridable so a
/// screen (or a test) can express the rule without editing this list.
final miniPlayerExcludedPathsProvider = Provider<Set<String>>(
  (ref) => const <String>{
    // Full-screen document reader: the page owns the whole viewport.
    '/books/reader',
  },
);

/// Whether the mini player may render on [path].
bool screenSupportsMiniPlayer(String? path, Set<String> excluded) {
  if (path == null) return true;
  for (final pattern in excluded) {
    if (pattern == path) return false;
  }
  return true;
}
