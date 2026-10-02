import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/player/player_seek_policy.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_hold_to_seek_button.dart';

void main() {
  group('SSPHoldToSeekButton', () {
    testWidgets('a tap fires onPressed exactly once and never a hold seek', (
      tester,
    ) async {
      var taps = 0;
      final seeks = <Duration>[];

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SSPHoldToSeekButton.forward(
              position: const Duration(seconds: 30),
              total: const Duration(minutes: 5),
              onPressed: () => taps++,
              onHoldSeek: seeks.add,
              child: const Text('5s'),
            ),
          ),
        ),
      );

      await tester.tap(find.text('5s'));
      await tester.pumpAndSettle();

      expect(taps, 1);
      expect(seeks, isEmpty);
    });

    testWidgets('a long press fires hold seeks and not onPressed', (
      tester,
    ) async {
      var taps = 0;
      final seeks = <Duration>[];

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SSPHoldToSeekButton.forward(
              position: const Duration(seconds: 30),
              total: const Duration(minutes: 5),
              onPressed: () => taps++,
              onHoldSeek: seeks.add,
              child: const Text('5s'),
            ),
          ),
        ),
      );

      final gesture = await tester.startGesture(
        tester.getCenter(find.text('5s')),
      );
      await tester.pump(
        kHoldToSeekStartDelay + const Duration(milliseconds: 60),
      );
      await gesture.up();
      await tester.pumpAndSettle();

      expect(taps, 0, reason: 'a hold is not a tap');
      expect(seeks, isNotEmpty, reason: 'a hold must seek');
    });

    testWidgets('holding forward steps 10s per tick', (tester) async {
      final seeks = <Duration>[];

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SSPHoldToSeekButton.forward(
              position: const Duration(seconds: 30),
              total: const Duration(minutes: 5),
              onPressed: () {},
              onHoldSeek: seeks.add,
              child: const Text('5s'),
            ),
          ),
        ),
      );

      final gesture = await tester.startGesture(
        tester.getCenter(find.text('5s')),
      );
      await tester.pump(kHoldToSeekStartDelay);
      await tester.pump(kHoldToSeekRepeatInterval * 3);
      await gesture.up();
      await tester.pumpAndSettle();

      expect(seeks.length, greaterThanOrEqualTo(2));
      expect(
        seeks.first,
        const Duration(seconds: 40),
        reason: 'the first tick is one 10s step from 30s',
      );
      for (var i = 1; i < seeks.length; i++) {
        expect(
          seeks[i] - seeks[i - 1],
          kHoldToSeekStep,
          reason: 'every tick advances exactly one step',
        );
      }
    });

    testWidgets('holding backward steps back 10s per tick', (tester) async {
      final seeks = <Duration>[];

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SSPHoldToSeekButton.backward(
              position: const Duration(seconds: 60),
              total: const Duration(minutes: 5),
              onPressed: () {},
              onHoldSeek: seeks.add,
              child: const Text('5s'),
            ),
          ),
        ),
      );

      final gesture = await tester.startGesture(
        tester.getCenter(find.text('5s')),
      );
      await tester.pump(kHoldToSeekStartDelay);
      await tester.pump(kHoldToSeekRepeatInterval * 2);
      await gesture.up();
      await tester.pumpAndSettle();

      expect(seeks.first, const Duration(seconds: 50));
      expect(seeks.last, lessThan(seeks.first));
    });

    testWidgets('a hold clamps at the start of the track', (tester) async {
      final seeks = <Duration>[];

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SSPHoldToSeekButton.backward(
              position: const Duration(seconds: 2),
              total: const Duration(minutes: 5),
              onPressed: () {},
              onHoldSeek: seeks.add,
              child: const Text('5s'),
            ),
          ),
        ),
      );

      final gesture = await tester.startGesture(
        tester.getCenter(find.text('5s')),
      );
      await tester.pump(kHoldToSeekStartDelay);
      await tester.pump(kHoldToSeekRepeatInterval * 3);
      await gesture.up();
      await tester.pumpAndSettle();

      expect(seeks, isNotEmpty);
      expect(seeks.every((s) => s >= Duration.zero), isTrue);
      expect(seeks.last, Duration.zero);
    });

    testWidgets('a hold clamps at the end of the track', (tester) async {
      final seeks = <Duration>[];

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SSPHoldToSeekButton.forward(
              position: const Duration(seconds: 298),
              total: const Duration(minutes: 5),
              onPressed: () {},
              onHoldSeek: seeks.add,
              child: const Text('5s'),
            ),
          ),
        ),
      );

      final gesture = await tester.startGesture(
        tester.getCenter(find.text('5s')),
      );
      await tester.pump(kHoldToSeekStartDelay);
      await tester.pump(kHoldToSeekRepeatInterval * 3);
      await gesture.up();
      await tester.pumpAndSettle();

      expect(seeks, isNotEmpty);
      expect(seeks.every((s) => s <= const Duration(minutes: 5)), isTrue);
      expect(seeks.last, const Duration(minutes: 5));
    });

    testWidgets('releasing stops the repeat', (tester) async {
      final seeks = <Duration>[];

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SSPHoldToSeekButton.forward(
              position: Duration.zero,
              total: const Duration(minutes: 5),
              onPressed: () {},
              onHoldSeek: seeks.add,
              child: const Text('5s'),
            ),
          ),
        ),
      );

      final gesture = await tester.startGesture(
        tester.getCenter(find.text('5s')),
      );
      await tester.pump(kHoldToSeekStartDelay);
      await tester.pump(kHoldToSeekRepeatInterval * 2);
      await gesture.up();
      await tester.pumpAndSettle();
      final afterRelease = seeks.length;

      await tester.pump(kHoldToSeekRepeatInterval * 5);
      expect(
        seeks.length,
        afterRelease,
        reason: 'no seek may fire after the finger lifts',
      );
    });

    testWidgets('a disabled button does not respond', (tester) async {
      var taps = 0;
      final seeks = <Duration>[];

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SSPHoldToSeekButton.forward(
              position: const Duration(seconds: 30),
              total: const Duration(minutes: 5),
              enabled: false,
              onPressed: () => taps++,
              onHoldSeek: seeks.add,
              child: const Text('5s'),
            ),
          ),
        ),
      );

      await tester.tap(find.text('5s'));
      await tester.pumpAndSettle();

      expect(taps, 0);
      expect(seeks, isEmpty);
    });

    testWidgets('exposes a semantic label that changes on hold', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SSPHoldToSeekButton.forward(
              position: const Duration(seconds: 30),
              total: const Duration(minutes: 5),
              onPressed: () {},
              onHoldSeek: (_) {},
              semanticLabel: '5s आगे',
              holdSemanticLabel: 'पकड़कर 10s आगे',
              child: const Text('5s'),
            ),
          ),
        ),
      );

      expect(find.bySemanticsLabel('5s आगे'), findsOneWidget);

      final gesture = await tester.startGesture(
        tester.getCenter(find.text('5s')),
      );
      await tester.pump(
        kHoldToSeekStartDelay + const Duration(milliseconds: 40),
      );
      expect(
        find.bySemanticsLabel('पकड़कर 10s आगे'),
        findsOneWidget,
        reason: 'the label must tell the user a hold is doing something else',
      );
      await gesture.up();
      handle.dispose();
    });
  });
}
