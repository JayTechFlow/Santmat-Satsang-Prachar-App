import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/player/player_lifecycle.dart';

PlayerLifecycle build({
  PlayerPlaybackStatus playback = PlayerPlaybackStatus.playing,
  PlayerSurface surface = PlayerSurface.collapsed,
  bool hasTrack = true,
}) => PlayerLifecycle.from(
  playback: playback,
  surface: surface,
  hasTrack: hasTrack,
);

void main() {
  group('hasActiveSession', () {
    test('is true for playing, paused, buffering and completed', () {
      for (final status in [
        PlayerPlaybackStatus.playing,
        PlayerPlaybackStatus.paused,
        PlayerPlaybackStatus.buffering,
        PlayerPlaybackStatus.completed,
      ]) {
        expect(
          build(playback: status).hasActiveSession,
          isTrue,
          reason: '$status must keep the session alive',
        );
      }
    });

    test('is false for noAudio, error and an empty track', () {
      expect(
        build(playback: PlayerPlaybackStatus.noAudio).hasActiveSession,
        isFalse,
      );
      expect(
        build(playback: PlayerPlaybackStatus.error).hasActiveSession,
        isFalse,
      );
      expect(build(hasTrack: false).hasActiveSession, isFalse);
    });
  });

  group('phase', () {
    test('no track collapses to NO_AUDIO even while the player is open', () {
      final lifecycle = build(
        hasTrack: false,
        playback: PlayerPlaybackStatus.playing,
        surface: PlayerSurface.fullPlayerOpen,
      );
      expect(lifecycle.phase, PlayerLifecyclePhase.noAudio);
    });

    test('an open player wins over the transport for the phase', () {
      for (final status in [
        PlayerPlaybackStatus.playing,
        PlayerPlaybackStatus.paused,
        PlayerPlaybackStatus.buffering,
        PlayerPlaybackStatus.completed,
        PlayerPlaybackStatus.error,
      ]) {
        expect(
          build(playback: status, surface: PlayerSurface.fullPlayerOpen).phase,
          PlayerLifecyclePhase.playerOpen,
          reason:
              'the player surface dominates for $status, '
              'but the transport stays readable via .playback',
        );
      }
    });

    test('collapsed playing is PLAYING', () {
      expect(build().phase, PlayerLifecyclePhase.playing);
    });

    test('collapsed paused is PAUSED', () {
      expect(
        build(playback: PlayerPlaybackStatus.paused).phase,
        PlayerLifecyclePhase.paused,
      );
    });

    test('collapsed buffering is BUFFERING', () {
      expect(
        build(playback: PlayerPlaybackStatus.buffering).phase,
        PlayerLifecyclePhase.buffering,
      );
    });

    test('collapsed completed is COMPLETED', () {
      expect(
        build(playback: PlayerPlaybackStatus.completed).phase,
        PlayerLifecyclePhase.completed,
      );
    });

    test('collapsed error is ERROR', () {
      expect(
        build(playback: PlayerPlaybackStatus.error).phase,
        PlayerLifecyclePhase.error,
      );
    });
  });

  group('Mini Player contract', () {
    test('dismissing the player while playing is the dismissed-with-audio '
        'phase the Mini Player exists for', () {
      final lifecycle = build(
        playback: PlayerPlaybackStatus.playing,
        surface: PlayerSurface.collapsed,
      );
      expect(lifecycle.isPlayerOpen, isFalse);
      expect(lifecycle.isDismissedWithAudioActive, isTrue);
      expect(
        lifecycle.phaseLabel,
        PlayerLifecyclePhase.playerDismissedWithAudioActive.label,
      );
    });

    test('dismissing while paused still keeps a session, so the Mini Player '
        'stays with a resume affordance', () {
      final lifecycle = build(
        playback: PlayerPlaybackStatus.paused,
        surface: PlayerSurface.collapsed,
      );
      expect(lifecycle.isDismissedWithAudioActive, isTrue);
      expect(lifecycle.phase, PlayerLifecyclePhase.paused);
    });

    test('an open player is never reported as dismissed', () {
      final lifecycle = build(surface: PlayerSurface.fullPlayerOpen);
      expect(lifecycle.isPlayerOpen, isTrue);
      expect(lifecycle.isDismissedWithAudioActive, isFalse);
    });

    test('an errored session is not a dismissible-with-audio session', () {
      final lifecycle = build(
        playback: PlayerPlaybackStatus.error,
        surface: PlayerSurface.collapsed,
      );
      expect(lifecycle.isDismissedWithAudioActive, isFalse);
      expect(lifecycle.phaseLabel, PlayerLifecyclePhase.error.label);
    });

    test('no audio is not a dismissible-with-audio session', () {
      final lifecycle = build(
        hasTrack: false,
        playback: PlayerPlaybackStatus.noAudio,
        surface: PlayerSurface.collapsed,
      );
      expect(lifecycle.isDismissedWithAudioActive, isFalse);
      expect(lifecycle.phaseLabel, PlayerLifecyclePhase.noAudio.label);
    });
  });

  group('value semantics', () {
    test('equal snapshots compare and hash equal', () {
      expect(build(), build());
      expect(build().hashCode, build().hashCode);
      expect(build(), isNot(build(surface: PlayerSurface.fullPlayerOpen)));
    });

    test('copyWith changes only the given half', () {
      final opened = build().copyWith(surface: PlayerSurface.fullPlayerOpen);
      expect(opened.playback, PlayerPlaybackStatus.playing);
      expect(opened.surface, PlayerSurface.fullPlayerOpen);
      expect(opened.isPlayerOpen, isTrue);
    });

    test('the idle constant is fully collapsed', () {
      expect(PlayerLifecycle.idle.hasTrack, isFalse);
      expect(PlayerLifecycle.idle.hasActiveSession, isFalse);
      expect(PlayerLifecycle.idle.phase, PlayerLifecyclePhase.noAudio);
    });

    test('from() forces NO_AUDIO when there is no track', () {
      final forced = build(
        hasTrack: false,
        playback: PlayerPlaybackStatus.paused,
      );
      expect(forced.playback, PlayerPlaybackStatus.noAudio);
    });

    test('toString is readable in test failures', () {
      expect(
        build(surface: PlayerSurface.fullPlayerOpen).toString(),
        contains('PLAYER_OPEN'),
      );
      expect(
        build(surface: PlayerSurface.fullPlayerOpen).toString(),
        contains('playback=playing'),
      );
      // A collapsed session with live audio is reported as the dismissed phase,
      // because that is the state the Mini Player represents.
      expect(
        build().toString(),
        contains('PLAYER_DISMISSED_WITH_AUDIO_ACTIVE'),
      );
    });
  });

  group('phase labels', () {
    test('every phase has a stable label', () {
      expect(PlayerLifecyclePhase.noAudio.label, 'NO_AUDIO');
      expect(PlayerLifecyclePhase.buffering.label, 'BUFFERING');
      expect(PlayerLifecyclePhase.playing.label, 'PLAYING');
      expect(PlayerLifecyclePhase.paused.label, 'PAUSED');
      expect(PlayerLifecyclePhase.completed.label, 'COMPLETED');
      expect(PlayerLifecyclePhase.error.label, 'ERROR');
      expect(PlayerLifecyclePhase.playerOpen.label, 'PLAYER_OPEN');
      expect(
        PlayerLifecyclePhase.playerDismissedWithAudioActive.label,
        'PLAYER_DISMISSED_WITH_AUDIO_ACTIVE',
      );
    });
  });
}
