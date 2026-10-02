/// Canonical player lifecycle vocabulary (PHASE 2).
///
/// The whole application has exactly ONE playback state. The Full Player and
/// the Mini Player are two *UI surfaces* rendered from that single state, never
/// two audio engines. This file is the single source of truth for the
/// vocabulary both surfaces speak, and it is intentionally free of any Flutter
/// or provider dependency so the policy can be unit-tested in isolation.
library;

/// The canonical playback state of the one and only audio session.
///
/// This is deliberately *not* the same enum as the transport-level
/// `PlaybackStatus` used by the audio engine: this one has an explicit
/// [noAudio] and [buffering] member, which is what the player UX contract
/// (PHASE 2) requires.
enum PlayerPlaybackStatus {
  /// No track is loaded and no session exists.
  noAudio,

  /// A track is selected and the engine is loading / buffering it.
  buffering,

  /// Audio is actively being produced.
  playing,

  /// A track is loaded and the session is alive, but paused.
  paused,

  /// The current track reached its end.
  completed,

  /// The session exists but the current track failed to load/play.
  error,
}

/// Which player *surface* the user is currently looking at.
///
/// This is UI state only. Both values observe the same playback state; neither
/// owns an engine of its own.
enum PlayerSurface {
  /// No full player is on screen. The Mini Player is eligible to render.
  collapsed,

  /// The full player currently occupies the player surface.
  fullPlayerOpen,
}

/// The complete, canonical player lifecycle phase.
///
/// This is the one value that expresses the interaction between playback and
/// surface, which is exactly what PHASE 2 asks to be defined.
enum PlayerLifecyclePhase {
  /// NO_AUDIO — nothing is loaded.
  noAudio,

  /// BUFFERING — a track is selected and being prepared.
  buffering,

  /// PLAYING — audio is producing.
  playing,

  /// PAUSED — session alive, transport paused.
  paused,

  /// COMPLETED — the current track finished.
  completed,

  /// ERROR — the session exists but the track failed.
  error,

  /// PLAYER_OPEN — the full player is on screen.
  ///
  /// The surface wins over the transport for this phase because the *player*
  /// is what the user is interacting with; the transport stays readable
  /// through [PlayerLifecycle.playback].
  playerOpen,

  /// PLAYER_DISMISSED_WITH_AUDIO_ACTIVE — the full player was backed out of
  /// while audio kept playing, which is the exact state the Mini Player exists
  /// to represent.
  playerDismissedWithAudioActive,
}

extension PlayerLifecyclePhaseLabel on PlayerLifecyclePhase {
  /// Stable machine name, used in navigation logs and analytics.
  String get label => switch (this) {
    PlayerLifecyclePhase.noAudio => 'NO_AUDIO',
    PlayerLifecyclePhase.buffering => 'BUFFERING',
    PlayerLifecyclePhase.playing => 'PLAYING',
    PlayerLifecyclePhase.paused => 'PAUSED',
    PlayerLifecyclePhase.completed => 'COMPLETED',
    PlayerLifecyclePhase.error => 'ERROR',
    PlayerLifecyclePhase.playerOpen => 'PLAYER_OPEN',
    PlayerLifecyclePhase.playerDismissedWithAudioActive =>
      'PLAYER_DISMISSED_WITH_AUDIO_ACTIVE',
  };
}

/// An immutable snapshot of the one canonical player lifecycle.
class PlayerLifecycle {
  const PlayerLifecycle({
    required this.playback,
    required this.surface,
    required this.hasTrack,
  });

  /// Derives the lifecycle from its two independent halves.
  factory PlayerLifecycle.from({
    required PlayerPlaybackStatus playback,
    required PlayerSurface surface,
    required bool hasTrack,
  }) => PlayerLifecycle(
    playback: hasTrack ? playback : PlayerPlaybackStatus.noAudio,
    surface: surface,
    hasTrack: hasTrack,
  );

  /// The empty lifecycle: nothing loaded, no player on screen.
  static const PlayerLifecycle idle = PlayerLifecycle(
    playback: PlayerPlaybackStatus.noAudio,
    surface: PlayerSurface.collapsed,
    hasTrack: false,
  );

  /// The transport half of the lifecycle.
  final PlayerPlaybackStatus playback;

  /// The UI-surface half of the lifecycle.
  final PlayerSurface surface;

  /// Whether a track is loaded into the single audio session.
  final bool hasTrack;

  /// Whether the audio session is alive, i.e. a track exists and the user has
  /// not explicitly stopped / cleared playback.
  bool get hasActiveSession =>
      hasTrack &&
      playback != PlayerPlaybackStatus.noAudio &&
      playback != PlayerPlaybackStatus.error;

  /// Whether the full player currently occupies the player surface.
  bool get isPlayerOpen => surface == PlayerSurface.fullPlayerOpen;

  /// Whether the full player was dismissed while audio stayed alive — the
  /// Mini Player's reason to exist.
  bool get isDismissedWithAudioActive => !isPlayerOpen && hasActiveSession;

  /// The canonical lifecycle phase (PHASE 2).
  PlayerLifecyclePhase get phase {
    if (!hasTrack) return PlayerLifecyclePhase.noAudio;
    if (isPlayerOpen) return PlayerLifecyclePhase.playerOpen;
    if (playback == PlayerPlaybackStatus.completed) {
      return PlayerLifecyclePhase.completed;
    }
    if (playback == PlayerPlaybackStatus.error) {
      return PlayerLifecyclePhase.error;
    }
    if (!hasActiveSession) return PlayerLifecyclePhase.buffering;
    return switch (playback) {
      PlayerPlaybackStatus.playing => PlayerLifecyclePhase.playing,
      PlayerPlaybackStatus.paused => PlayerLifecyclePhase.paused,
      _ => PlayerLifecyclePhase.buffering,
    };
  }

  /// Machine-readable phase name, used for navigation logs / analytics.
  String get phaseLabel => isDismissedWithAudioActive
      ? PlayerLifecyclePhase.playerDismissedWithAudioActive.label
      : phase.label;

  PlayerLifecycle copyWith({
    PlayerPlaybackStatus? playback,
    PlayerSurface? surface,
    bool? hasTrack,
  }) => PlayerLifecycle.from(
    playback: playback ?? this.playback,
    surface: surface ?? this.surface,
    hasTrack: hasTrack ?? this.hasTrack,
  );

  @override
  bool operator ==(Object other) =>
      other is PlayerLifecycle &&
      other.playback == playback &&
      other.surface == surface &&
      other.hasTrack == hasTrack;

  @override
  int get hashCode => Object.hash(playback, surface, hasTrack);

  @override
  String toString() =>
      'PlayerLifecycle($phaseLabel, '
      'playback=${playback.name}, surface=${surface.name}, '
      'hasTrack=$hasTrack)';
}
