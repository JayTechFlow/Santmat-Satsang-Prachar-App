import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/player/player_seek_policy.dart';

void main() {
  group('resolveSmartPrevious', () {
    test('restarts the current track when past the 3s threshold', () {
      expect(
        resolveSmartPrevious(
          hasTrack: true,
          position: const Duration(seconds: 42),
          hasPreviousTrack: true,
          isRepeatEnabled: false,
        ),
        SmartPreviousAction.restartCurrentTrack,
        reason: 'a Previous press mid-track must not skip the song',
      );
    });

    test('selects the previous track at the very start', () {
      expect(
        resolveSmartPrevious(
          hasTrack: true,
          position: Duration.zero,
          hasPreviousTrack: true,
          isRepeatEnabled: false,
        ),
        SmartPreviousAction.selectPreviousTrack,
      );
    });

    test('threshold boundary: exactly 3s still selects previous', () {
      expect(
        resolveSmartPrevious(
          hasTrack: true,
          position: kSmartPreviousRestartThreshold,
          hasPreviousTrack: true,
          isRepeatEnabled: false,
        ),
        SmartPreviousAction.selectPreviousTrack,
      );
    });

    test('threshold boundary: just past 3s restarts', () {
      expect(
        resolveSmartPrevious(
          hasTrack: true,
          position:
              kSmartPreviousRestartThreshold + const Duration(milliseconds: 1),
          hasPreviousTrack: true,
          isRepeatEnabled: false,
        ),
        SmartPreviousAction.restartCurrentTrack,
      );
    });

    test('at the first track with no repeat it is a no-op', () {
      expect(
        resolveSmartPrevious(
          hasTrack: true,
          position: Duration.zero,
          hasPreviousTrack: false,
          isRepeatEnabled: false,
        ),
        SmartPreviousAction.noAction,
      );
    });

    test('at the first track with repeat enabled it wraps to the last', () {
      expect(
        resolveSmartPrevious(
          hasTrack: true,
          position: Duration.zero,
          hasPreviousTrack: false,
          isRepeatEnabled: true,
        ),
        SmartPreviousAction.selectPreviousTrack,
      );
    });

    test('no track is always a no-op', () {
      expect(
        resolveSmartPrevious(
          hasTrack: false,
          position: const Duration(seconds: 99),
          hasPreviousTrack: true,
          isRepeatEnabled: true,
        ),
        SmartPreviousAction.noAction,
      );
    });

    test('an empty queue is always a no-op', () {
      expect(
        resolveSmartPrevious(
          hasTrack: true,
          position: const Duration(seconds: 99),
          hasPreviousTrack: true,
          isRepeatEnabled: true,
          isQueueEmpty: true,
        ),
        SmartPreviousAction.noAction,
      );
    });
  });

  group('resolveSmartNext', () {
    test('selects the next track when one exists', () {
      expect(
        resolveSmartNext(
          hasTrack: true,
          hasNextTrack: true,
          isRepeatEnabled: false,
        ),
        SmartNextAction.selectNextTrack,
      );
    });

    test('restarts the current track at the queue end with repeat on', () {
      expect(
        resolveSmartNext(
          hasTrack: true,
          hasNextTrack: false,
          isRepeatEnabled: true,
        ),
        SmartNextAction.restartCurrentTrack,
      );
    });

    test('completes the session at the queue end with repeat off', () {
      expect(
        resolveSmartNext(
          hasTrack: true,
          hasNextTrack: false,
          isRepeatEnabled: false,
        ),
        SmartNextAction.stopAtQueueEnd,
      );
    });

    test('a next track wins over repeat', () {
      expect(
        resolveSmartNext(
          hasTrack: true,
          hasNextTrack: true,
          isRepeatEnabled: true,
        ),
        SmartNextAction.selectNextTrack,
      );
    });

    test('no track and an empty queue are no-ops', () {
      expect(
        resolveSmartNext(
          hasTrack: false,
          hasNextTrack: true,
          isRepeatEnabled: true,
        ),
        SmartNextAction.noAction,
      );
      expect(
        resolveSmartNext(
          hasTrack: true,
          hasNextTrack: true,
          isRepeatEnabled: true,
          isQueueEmpty: true,
        ),
        SmartNextAction.noAction,
      );
    });
  });

  group('resolveHoldSeekTarget', () {
    test('one forward tick moves 10s', () {
      expect(
        resolveHoldSeekTarget(
          current: const Duration(seconds: 30),
          total: const Duration(minutes: 5),
          direction: SeekDirection.forward,
        ),
        const Duration(seconds: 40),
      );
    });

    test('one backward tick moves 10s back', () {
      expect(
        resolveHoldSeekTarget(
          current: const Duration(seconds: 30),
          total: const Duration(minutes: 5),
          direction: SeekDirection.backward,
        ),
        const Duration(seconds: 20),
      );
    });

    test('a long hold of 5 ticks moves 50s', () {
      expect(
        resolveHoldSeekTarget(
          current: const Duration(seconds: 30),
          total: const Duration(minutes: 5),
          direction: SeekDirection.forward,
          steps: 5,
        ),
        const Duration(seconds: 80),
      );
    });

    test('clamps at zero instead of going negative', () {
      expect(
        resolveHoldSeekTarget(
          current: const Duration(seconds: 3),
          total: const Duration(minutes: 5),
          direction: SeekDirection.backward,
        ),
        Duration.zero,
      );
    });

    test('clamps to the track end instead of overshooting', () {
      expect(
        resolveHoldSeekTarget(
          current: const Duration(seconds: 295),
          total: const Duration(minutes: 5),
          direction: SeekDirection.forward,
        ),
        const Duration(minutes: 5),
      );
    });

    test('a negative step count is treated as no movement', () {
      expect(
        resolveHoldSeekTarget(
          current: const Duration(seconds: 30),
          total: const Duration(minutes: 5),
          direction: SeekDirection.forward,
          steps: -4,
        ),
        const Duration(seconds: 30),
      );
    });

    test(
      'an unknown total falls back to the current position as the bound',
      () {
        expect(
          resolveHoldSeekTarget(
            current: const Duration(seconds: 30),
            total: Duration.zero,
            direction: SeekDirection.forward,
          ),
          const Duration(seconds: 30),
        );
      },
    );
  });

  group('resolveNudgeSeekTarget', () {
    test('a 5s nudge moves 5s forward', () {
      expect(
        resolveNudgeSeekTarget(
          current: const Duration(seconds: 30),
          total: const Duration(minutes: 5),
          direction: SeekDirection.forward,
        ),
        const Duration(seconds: 35),
      );
    });

    test('a 5s backward nudge clamps at zero', () {
      expect(
        resolveNudgeSeekTarget(
          current: const Duration(seconds: 2),
          total: const Duration(minutes: 5),
          direction: SeekDirection.backward,
        ),
        Duration.zero,
      );
    });
  });

  group('hold constants', () {
    test('the documented hold cadence is stable', () {
      expect(kHoldToSeekStep, const Duration(seconds: 10));
      expect(kHoldToSeekStartDelay, const Duration(milliseconds: 400));
      expect(kHoldToSeekRepeatInterval, const Duration(milliseconds: 200));
      expect(kSeekNudgeStep, const Duration(seconds: 5));
    });
  });
}
