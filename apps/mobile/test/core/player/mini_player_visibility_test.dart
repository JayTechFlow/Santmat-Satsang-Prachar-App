import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/player/mini_player_visibility.dart';
import 'package:santmat_satsang_prachar/core/player/player_lifecycle.dart';

void main() {
  group('resolveMiniPlayerVisibility', () {
    test('shows for a live, collapsed session on a normal screen', () {
      final result = resolveMiniPlayerVisibility(
        hasTrack: true,
        hasActiveSession: true,
        isPlayerVisible: false,
        screenSupportsMiniPlayer: true,
      );
      expect(result.visible, isTrue);
      expect(result.reason, isNull);
    });

    test('hides with noTrack when nothing is loaded', () {
      final result = resolveMiniPlayerVisibility(
        hasTrack: false,
        hasActiveSession: true,
        isPlayerVisible: false,
        screenSupportsMiniPlayer: true,
      );
      expect(result.visible, isFalse);
      expect(result.reason, MiniPlayerHiddenReason.noTrack);
    });

    test('hides with noActiveSession when playback was cleared', () {
      final result = resolveMiniPlayerVisibility(
        hasTrack: true,
        hasActiveSession: false,
        isPlayerVisible: false,
        screenSupportsMiniPlayer: true,
      );
      expect(result.visible, isFalse);
      expect(result.reason, MiniPlayerHiddenReason.noActiveSession);
    });

    test('hides with fullPlayerVisible while the player is open', () {
      final result = resolveMiniPlayerVisibility(
        hasTrack: true,
        hasActiveSession: true,
        isPlayerVisible: true,
        screenSupportsMiniPlayer: true,
      );
      expect(result.visible, isFalse);
      expect(result.reason, MiniPlayerHiddenReason.fullPlayerVisible);
    });

    test('hides with screenExcluded on an excluded screen', () {
      final result = resolveMiniPlayerVisibility(
        hasTrack: true,
        hasActiveSession: true,
        isPlayerVisible: false,
        screenSupportsMiniPlayer: false,
      );
      expect(result.visible, isFalse);
      expect(result.reason, MiniPlayerHiddenReason.screenExcluded);
    });

    test('noTrack outranks every other reason', () {
      final result = resolveMiniPlayerVisibility(
        hasTrack: false,
        hasActiveSession: false,
        isPlayerVisible: true,
        screenSupportsMiniPlayer: false,
      );
      expect(result.reason, MiniPlayerHiddenReason.noTrack);
    });

    test('noActiveSession outranks the player-visible reason', () {
      final result = resolveMiniPlayerVisibility(
        hasTrack: true,
        hasActiveSession: false,
        isPlayerVisible: true,
        screenSupportsMiniPlayer: false,
      );
      expect(result.reason, MiniPlayerHiddenReason.noActiveSession);
    });

    test('the full player outranks the screen exclusion', () {
      final result = resolveMiniPlayerVisibility(
        hasTrack: true,
        hasActiveSession: true,
        isPlayerVisible: true,
        screenSupportsMiniPlayer: false,
      );
      expect(result.reason, MiniPlayerHiddenReason.fullPlayerVisible);
    });
  });

  group('resolveMiniPlayerVisibilityFor', () {
    test('a collapsed playing lifecycle is visible', () {
      final lifecycle = PlayerLifecycle.from(
        playback: PlayerPlaybackStatus.playing,
        surface: PlayerSurface.collapsed,
        hasTrack: true,
      );
      final result = resolveMiniPlayerVisibilityFor(lifecycle);
      expect(result.visible, isTrue);
    });

    test('an open player lifecycle is hidden as fullPlayerVisible', () {
      final lifecycle = PlayerLifecycle.from(
        playback: PlayerPlaybackStatus.playing,
        surface: PlayerSurface.fullPlayerOpen,
        hasTrack: true,
      );
      final result = resolveMiniPlayerVisibilityFor(lifecycle);
      expect(result.reason, MiniPlayerHiddenReason.fullPlayerVisible);
    });

    test('a cleared lifecycle is hidden as noTrack', () {
      expect(
        resolveMiniPlayerVisibilityFor(PlayerLifecycle.idle).reason,
        MiniPlayerHiddenReason.noTrack,
      );
    });

    test('an errored session is hidden as noActiveSession', () {
      final lifecycle = PlayerLifecycle.from(
        playback: PlayerPlaybackStatus.error,
        surface: PlayerSurface.collapsed,
        hasTrack: true,
      );
      expect(
        resolveMiniPlayerVisibilityFor(lifecycle).reason,
        MiniPlayerHiddenReason.noActiveSession,
      );
    });

    test('a completed-but-alive session stays visible', () {
      final lifecycle = PlayerLifecycle.from(
        playback: PlayerPlaybackStatus.completed,
        surface: PlayerSurface.collapsed,
        hasTrack: true,
      );
      expect(resolveMiniPlayerVisibilityFor(lifecycle).visible, isTrue);
    });

    test('the screen exclusion is honoured through the lifecycle overload', () {
      final lifecycle = PlayerLifecycle.from(
        playback: PlayerPlaybackStatus.playing,
        surface: PlayerSurface.collapsed,
        hasTrack: true,
      );
      final result = resolveMiniPlayerVisibilityFor(
        lifecycle,
        screenSupportsMiniPlayer: false,
      );
      expect(result.reason, MiniPlayerHiddenReason.screenExcluded);
    });
  });

  group('value semantics', () {
    test('show instances are equal', () {
      expect(
        resolveMiniPlayerVisibility(
          hasTrack: true,
          hasActiveSession: true,
          isPlayerVisible: false,
          screenSupportsMiniPlayer: true,
        ),
        const MiniPlayerVisibility.show(),
      );
    });

    test('hidden instances with different reasons are not equal', () {
      expect(
        const MiniPlayerVisibility.hide(MiniPlayerHiddenReason.noTrack),
        isNot(
          const MiniPlayerVisibility.hide(
            MiniPlayerHiddenReason.noActiveSession,
          ),
        ),
      );
    });

    test('every reason has a stable label', () {
      expect(MiniPlayerHiddenReason.noTrack.label, 'no-track');
      expect(MiniPlayerHiddenReason.noActiveSession.label, 'no-active-session');
      expect(
        MiniPlayerHiddenReason.fullPlayerVisible.label,
        'full-player-visible',
      );
      expect(MiniPlayerHiddenReason.screenExcluded.label, 'screen-excluded');
    });
  });
}
