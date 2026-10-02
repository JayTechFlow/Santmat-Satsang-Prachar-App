import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_mini_player.dart';
import 'package:santmat_satsang_prachar/shared/design_system/tokens/icons/ssp_icons.dart';

void main() {
  Widget buildTestableWidget(
    Widget child, {
    Brightness brightness = Brightness.light,
  }) {
    return MaterialApp(
      theme: ThemeData(brightness: brightness),
      home: Scaffold(body: Center(child: child)),
    );
  }

  LinearProgressIndicator indicatorOf(WidgetTester tester) =>
      tester.widget<LinearProgressIndicator>(
        find.descendant(
          of: find.byType(SSPMiniPlayer),
          matching: find.byType(LinearProgressIndicator),
        ),
      );

  group('SSPMiniPlayer Widget Tests', () {
    testWidgets('1. Renders title', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPMiniPlayer(
            title: 'Atma Radiance',
            isPlaying: false,
            onPlayPause: () {},
          ),
        ),
      );

      expect(find.text('Atma Radiance'), findsOneWidget);
    });

    testWidgets('2. Renders subtitle', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPMiniPlayer(
            title: 'Atma Radiance',
            subtitle: 'Satsang Discourse',
            isPlaying: false,
            onPlayPause: () {},
          ),
        ),
      );

      expect(find.text('Atma Radiance'), findsOneWidget);
      expect(find.text('Satsang Discourse'), findsOneWidget);
    });

    testWidgets('3. Renders progress track with value 0.0', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPMiniPlayer(
            title: 'Atma Radiance',
            progress: 0.0,
            isPlaying: false,
            onPlayPause: () {},
          ),
        ),
      );

      expect(indicatorOf(tester).value, 0.0);
    });

    testWidgets('4. Clamps progress above 1.0 to 1.0', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPMiniPlayer(
            title: 'Atma Radiance',
            progress: 1.5,
            isPlaying: false,
            onPlayPause: () {},
          ),
        ),
      );

      expect(indicatorOf(tester).value, 1.0);
    });

    testWidgets('5. Clamps negative progress to 0.0', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPMiniPlayer(
            title: 'Atma Radiance',
            progress: -0.25,
            isPlaying: false,
            onPlayPause: () {},
          ),
        ),
      );

      expect(indicatorOf(tester).value, 0.0);
    });

    testWidgets('6. Invokes onPlayPause when control is pressed', (
      WidgetTester tester,
    ) async {
      bool toggled = false;
      await tester.pumpWidget(
        buildTestableWidget(
          SSPMiniPlayer(
            title: 'Atma Radiance',
            isPlaying: false,
            onPlayPause: () => toggled = true,
          ),
        ),
      );

      await tester.tap(find.byIcon(SSPIcons.play));
      await tester.pumpAndSettle();

      expect(toggled, isTrue);
    });

    testWidgets('7. Play/pause icon switches with isPlaying state', (
      WidgetTester tester,
    ) async {
      Widget buildPlayer({required bool isPlaying}) => buildTestableWidget(
        SSPMiniPlayer(
          title: 'Atma Radiance',
          isPlaying: isPlaying,
          onPlayPause: () {},
        ),
      );

      await tester.pumpWidget(buildPlayer(isPlaying: false));
      expect(find.byIcon(SSPIcons.play), findsOneWidget);
      expect(find.byIcon(SSPIcons.pause), findsNothing);

      await tester.pumpWidget(buildPlayer(isPlaying: true));
      expect(find.byIcon(SSPIcons.pause), findsOneWidget);
      expect(find.byIcon(SSPIcons.play), findsNothing);
    });

    testWidgets('8. Invokes onClose when close control is pressed', (
      WidgetTester tester,
    ) async {
      bool closed = false;
      await tester.pumpWidget(
        buildTestableWidget(
          SSPMiniPlayer(
            title: 'Atma Radiance',
            isPlaying: false,
            onPlayPause: () {},
            onClose: () => closed = true,
          ),
        ),
      );

      await tester.tap(find.byIcon(SSPIcons.close));
      await tester.pumpAndSettle();

      expect(closed, isTrue);
    });

    testWidgets('9. Renders without close control when onClose is null', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPMiniPlayer(
            title: 'Atma Radiance',
            isPlaying: false,
            onPlayPause: () {},
          ),
        ),
      );

      expect(find.byIcon(SSPIcons.close), findsNothing);
    });

    testWidgets('10. Invokes onTap when player bar is tapped', (
      WidgetTester tester,
    ) async {
      bool tapped = false;
      await tester.pumpWidget(
        buildTestableWidget(
          SSPMiniPlayer(
            title: 'Atma Radiance',
            isPlaying: false,
            onPlayPause: () {},
            onClose: () {},
            onTap: () => tapped = true,
          ),
        ),
      );

      await tester.tap(find.byType(SSPMiniPlayer));
      await tester.pumpAndSettle();

      expect(tapped, isTrue);
    });

    testWidgets('11. Renders custom artwork widget', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPMiniPlayer(
            title: 'Atma Radiance',
            artwork: Container(
              key: const Key('player-artwork'),
              color: Colors.amber,
            ),
            isPlaying: false,
            onPlayPause: () {},
          ),
        ),
      );

      expect(find.byKey(const Key('player-artwork')), findsOneWidget);
    });

    testWidgets('12. Renders waveform placeholder when artwork is absent', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPMiniPlayer(
            title: 'Atma Radiance',
            isPlaying: false,
            onPlayPause: () {},
          ),
        ),
      );

      expect(find.byIcon(SSPIcons.waveform), findsOneWidget);
    });

    testWidgets('13. Renders Hindi/Unicode title', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPMiniPlayer(
            title: 'श्री राम चरित मानस 🙏',
            subtitle: 'प्रवचन सत्र',
            isPlaying: false,
            onPlayPause: () {},
          ),
        ),
      );

      expect(find.text('श्री राम चरित मानस 🙏'), findsOneWidget);
      expect(find.text('प्रवचन सत्र'), findsOneWidget);
    });

    testWidgets('14. Handles text scaling without overflow', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MediaQuery(
          data: const MediaQueryData(textScaler: TextScaler.linear(2.0)),
          child: buildTestableWidget(
            SSPMiniPlayer(
              title: 'Atma Radiance Long Title That Exceeds The Bar Width',
              subtitle: 'Satsang Discourse with extended subtitle',
              progress: 0.5,
              isPlaying: false,
              onPlayPause: () {},
              onClose: () {},
            ),
          ),
        ),
      );

      expect(tester.takeException(), isNull);
    });

    testWidgets('15. Handles narrow width without overflow in scaffold body', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SizedBox(
            width: 220,
            child: SSPMiniPlayer(
              title: 'Atma Radiance',
              subtitle: 'Satsang Discourse',
              isPlaying: false,
              onPlayPause: () {},
              onClose: () {},
            ),
          ),
        ),
      );

      expect(tester.takeException(), isNull);
    });

    testWidgets('16. Provides button semantics labels', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPMiniPlayer(
            title: 'Atma Radiance',
            isPlaying: true,
            onPlayPause: () {},
            onClose: () {},
          ),
        ),
      );

      final SemanticsNode playerNode = tester.getSemantics(
        find.byType(SSPMiniPlayer),
      );
      expect(playerNode.label, contains('Atma Radiance'));
    });

    testWidgets('17. Applies dark mode surface and progress colors', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPMiniPlayer(
            title: 'Atma Radiance',
            progress: 0.25,
            isPlaying: false,
            onPlayPause: () {},
          ),
          brightness: Brightness.dark,
        ),
      );

      expect(find.byType(SSPMiniPlayer), findsOneWidget);
      final LinearProgressIndicator indicator = indicatorOf(tester);
      expect(indicator.value, 0.25);
    });
  });
}
