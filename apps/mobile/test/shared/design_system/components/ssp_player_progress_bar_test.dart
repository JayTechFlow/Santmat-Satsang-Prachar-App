import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/player/player_seek_policy.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_player_progress_bar.dart';

void main() {
  group('SSPPlayerTimeLabels', () {
    testWidgets('renders position and duration as m:ss', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SSPPlayerTimeLabels(
              position: Duration(minutes: 1, seconds: 5),
              duration: Duration(minutes: 4, seconds: 30),
            ),
          ),
        ),
      );

      expect(find.text('1:05'), findsOneWidget);
      expect(find.text('4:30'), findsOneWidget);
    });

    testWidgets('renders an hours component for long tracks', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SSPPlayerTimeLabels(
              position: Duration(hours: 1, minutes: 2, seconds: 3),
              duration: Duration(hours: 1, minutes: 30),
            ),
          ),
        ),
      );

      expect(find.text('1:02:03'), findsOneWidget);
      expect(find.text('1:30:00'), findsOneWidget);
    });

    testWidgets('an unknown duration falls back to a zero label', (
      tester,
    ) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SSPPlayerTimeLabels(
              position: Duration.zero,
              duration: Duration.zero,
            ),
          ),
        ),
      );

      expect(find.text('0:00'), findsNWidgets(2));
    });
  });

  group('formatSspPlaybackTime', () {
    test('formats minutes and seconds', () {
      expect(formatSspPlaybackTime(Duration.zero), '0:00');
      expect(formatSspPlaybackTime(const Duration(seconds: 9)), '0:09');
      expect(
        formatSspPlaybackTime(const Duration(minutes: 1, seconds: 5)),
        '1:05',
      );
    });

    test('formats hours when present', () {
      expect(
        formatSspPlaybackTime(const Duration(hours: 2, minutes: 3, seconds: 4)),
        '2:03:04',
      );
    });

    test('switches to an hours component past 60 minutes', () {
      expect(
        formatSspPlaybackTime(const Duration(minutes: 61, seconds: 30)),
        '1:01:30',
      );
      expect(
        formatSspPlaybackTime(const Duration(minutes: 59, seconds: 30)),
        '59:30',
      );
    });

    test('clamps a negative duration to zero', () {
      expect(formatSspPlaybackTime(const Duration(seconds: -5)), '0:00');
    });
  });

  group('SSPPlayerProgressBar', () {
    Future<void> pumpBar(
      WidgetTester tester, {
      required void Function(Duration) onSeek,
      void Function()? onScrubStart,
      void Function(Duration)? onScrubUpdate,
      void Function()? onScrubEnd,
      void Function()? onScrubCancel,
      Duration position = const Duration(seconds: 30),
      Duration duration = const Duration(minutes: 2),
      bool enabled = true,
    }) => tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: SizedBox(
            width: 300,
            child: SSPPlayerProgressBar(
              position: position,
              duration: duration,
              onSeek: onSeek,
              onScrubStart: onScrubStart,
              onScrubUpdate: onScrubUpdate,
              onScrubEnd: onScrubEnd,
              onScrubCancel: onScrubCancel,
              enabled: enabled,
            ),
          ),
        ),
      ),
    );

    testWidgets('tapping seeks to the tapped fraction of the track', (
      tester,
    ) async {
      final seeks = <Duration>[];
      await pumpBar(
        tester,
        onSeek: seeks.add,
        duration: const Duration(minutes: 2),
      );
      await tester.pumpAndSettle();

      final box = tester.getRect(find.byType(SSPPlayerProgressBar));
      await tester.tapAt(Offset(box.left + box.width * 0.5, box.center.dy));
      await tester.pumpAndSettle();

      expect(seeks, hasLength(1));
      expect(
        seeks.first.inSeconds,
        closeTo(60, 6),
        reason: 'halfway through a 2 minute track is ~60s',
      );
    });

    testWidgets('tapping the far right never seeks past the duration', (
      tester,
    ) async {
      final seeks = <Duration>[];
      await pumpBar(
        tester,
        onSeek: seeks.add,
        duration: const Duration(minutes: 2),
      );
      await tester.pumpAndSettle();

      final box = tester.getRect(find.byType(SSPPlayerProgressBar));
      await tester.tapAt(Offset(box.right - 1, box.center.dy));
      await tester.pumpAndSettle();

      expect(seeks.first, lessThanOrEqualTo(const Duration(minutes: 2)));
    });

    testWidgets(
      'dragging previews via onScrubUpdate and commits once on release',
      (tester) async {
        final seeks = <Duration>[];
        final updates = <Duration>[];
        var starts = 0;
        var ends = 0;

        await pumpBar(
          tester,
          onSeek: seeks.add,
          onScrubStart: () => starts++,
          onScrubUpdate: updates.add,
          onScrubEnd: () => ends++,
          duration: const Duration(minutes: 2),
        );
        await tester.pumpAndSettle();

        final box = tester.getRect(find.byType(SSPPlayerProgressBar));
        final gesture = await tester.startGesture(
          Offset(box.left + box.width * 0.2, box.center.dy),
        );
        await tester.pump();
        await gesture.moveTo(Offset(box.left + box.width * 0.8, box.center.dy));
        await tester.pump();
        await gesture.up();
        await tester.pumpAndSettle();

        expect(starts, 1);
        expect(
          updates,
          isNotEmpty,
          reason: 'the thumb must preview while dragging',
        );
        expect(ends, 1);
        expect(seeks, hasLength(1), reason: 'exactly one commit on release');
        expect(seeks.first.inSeconds, closeTo(96, 10));
      },
    );

    testWidgets('a long press on the bar hold-scrubs in 10s steps', (
      tester,
    ) async {
      final seeks = <Duration>[];
      await pumpBar(
        tester,
        onSeek: seeks.add,
        position: const Duration(seconds: 30),
        duration: const Duration(minutes: 2),
      );
      await tester.pumpAndSettle();

      final box = tester.getRect(find.byType(SSPPlayerProgressBar));
      final gesture = await tester.startGesture(box.center);
      await tester.pump(kHoldToSeekStartDelay);
      await tester.pump(kHoldToSeekRepeatInterval * 3);
      await gesture.up();
      await tester.pumpAndSettle();

      expect(
        seeks.length,
        1,
        reason: 'the hold previews continuously but commits exactly once',
      );
      expect(
        seeks.first.inSeconds,
        greaterThanOrEqualTo(40),
        reason: 'a hold from 30s has stepped forward at least one 10s tick',
      );
      expect(
        seeks.first,
        lessThanOrEqualTo(const Duration(minutes: 2)),
        reason: 'hold-scrub stays inside the track',
      );
    });

    testWidgets('holding the left half of the bar scrubs backwards', (
      tester,
    ) async {
      final seeks = <Duration>[];
      final updates = <Duration>[];
      await pumpBar(
        tester,
        onSeek: seeks.add,
        onScrubUpdate: updates.add,
        position: const Duration(seconds: 30),
        duration: const Duration(minutes: 2),
      );
      await tester.pumpAndSettle();

      final box = tester.getRect(find.byType(SSPPlayerProgressBar));
      final gesture = await tester.startGesture(
        Offset(box.left + box.width * 0.2, box.center.dy),
      );
      await tester.pump(kHoldToSeekStartDelay);
      await tester.pump(kHoldToSeekRepeatInterval * 2);
      await gesture.up();
      await tester.pumpAndSettle();

      expect(seeks, hasLength(1));
      expect(
        seeks.first,
        lessThan(const Duration(seconds: 30)),
        reason: 'the left half of the bar holds backwards',
      );
    });

    testWidgets('releasing the bar stops the hold immediately', (tester) async {
      final seeks = <Duration>[];
      await pumpBar(
        tester,
        onSeek: seeks.add,
        position: Duration.zero,
        duration: const Duration(minutes: 5),
      );
      await tester.pumpAndSettle();

      final box = tester.getRect(find.byType(SSPPlayerProgressBar));
      final gesture = await tester.startGesture(
        Offset(box.left + box.width * 0.9, box.center.dy),
      );
      await tester.pump(kHoldToSeekStartDelay);
      await tester.pump(kHoldToSeekRepeatInterval * 2);
      await gesture.up();
      await tester.pumpAndSettle();
      final afterRelease = seeks.length;

      await tester.pump(kHoldToSeekRepeatInterval * 5);
      expect(seeks.length, afterRelease);
    });

    testWidgets('a disabled bar ignores taps', (tester) async {
      final seeks = <Duration>[];
      await pumpBar(tester, onSeek: seeks.add, enabled: false);
      await tester.pumpAndSettle();

      final box = tester.getRect(find.byType(SSPPlayerProgressBar));
      await tester.tapAt(Offset(box.left + box.width * 0.5, box.center.dy));
      await tester.pumpAndSettle();

      expect(seeks, isEmpty);
    });

    testWidgets('an unknown duration does not divide by zero', (tester) async {
      final seeks = <Duration>[];
      await pumpBar(
        tester,
        onSeek: seeks.add,
        position: const Duration(seconds: 30),
        duration: Duration.zero,
      );
      await tester.pumpAndSettle();

      final box = tester.getRect(find.byType(SSPPlayerProgressBar));
      await tester.tapAt(Offset(box.left + box.width * 0.5, box.center.dy));
      await tester.pumpAndSettle();

      expect(tester.takeException(), isNull);
    });
  });
}
