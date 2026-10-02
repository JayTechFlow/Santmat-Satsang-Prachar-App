import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_error_state.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_tertiary_button.dart';
import 'package:santmat_satsang_prachar/shared/design_system/tokens/icons/ssp_icons.dart';

void main() {
  Widget buildTestableWidget(
    Widget child, {
    Brightness brightness = Brightness.light,
    double textScale = 1.0,
  }) {
    return MaterialApp(
      theme: ThemeData(brightness: brightness),
      home: Scaffold(
        body: MediaQuery(
          data: MediaQueryData(textScaler: TextScaler.linear(textScale)),
          child: Center(child: child),
        ),
      ),
    );
  }

  group('SSPErrorState Widget Tests', () {
    testWidgets('1. Renders default title when title is null', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(SSPErrorState(message: 'Could not load audio.')),
      );

      expect(find.text('Something went wrong'), findsOneWidget);
    });

    testWidgets('2. Renders provided message', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(SSPErrorState(message: 'Could not load audio.')),
      );

      expect(find.text('Could not load audio.'), findsOneWidget);
    });

    testWidgets('3. Renders custom title when provided', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPErrorState(title: 'Connection lost', message: 'Try again later.'),
        ),
      );

      expect(find.text('Connection lost'), findsOneWidget);
      expect(find.text('Something went wrong'), findsNothing);
    });

    testWidgets('4. Invokes onRetry callback when retry tapped', (
      WidgetTester tester,
    ) async {
      bool retried = false;
      await tester.pumpWidget(
        buildTestableWidget(
          SSPErrorState(
            message: 'Failed to load satsang.',
            onRetry: () => retried = true,
          ),
        ),
      );

      await tester.tap(find.text('Retry'));
      await tester.pumpAndSettle();

      expect(retried, isTrue);
    });

    testWidgets('5. No retry button when onRetry is null', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(SSPErrorState(message: 'Failed to load satsang.')),
      );

      expect(find.byType(SSPTertiaryButton), findsNothing);
      expect(find.text('Retry'), findsNothing);
    });

    testWidgets('6. Default retry label rendered when onRetry provided', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(SSPErrorState(message: 'Failed.', onRetry: () {})),
      );

      expect(find.byType(SSPTertiaryButton), findsOneWidget);
      expect(find.text('Retry'), findsOneWidget);
    });

    testWidgets('7. Custom retry label is rendered', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPErrorState(
            message: 'Failed.',
            retryLabel: 'Try Again',
            onRetry: () {},
          ),
        ),
      );

      expect(find.text('Try Again'), findsOneWidget);
      expect(find.text('Retry'), findsNothing);
    });

    testWidgets('8. Renders default error icon', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(SSPErrorState(message: 'Failed.')),
      );

      expect(find.byIcon(SSPIcons.error), findsOneWidget);
    });

    testWidgets('9. Renders custom icon when provided', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPErrorState(message: 'Failed.', icon: Icons.wifi_off_outlined),
        ),
      );

      expect(find.byIcon(Icons.wifi_off_outlined), findsOneWidget);
      expect(find.byIcon(SSPIcons.error), findsNothing);
    });

    testWidgets('10. Renders Hindi title, message and retry label', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPErrorState(
            title: 'कुछ गलत हो गया',
            message: 'सत्संग लोड नहीं हो सका।',
            retryLabel: 'पुनः प्रयास करें',
            onRetry: () {},
          ),
        ),
      );

      expect(find.text('कुछ गलत हो गया'), findsOneWidget);
      expect(find.text('सत्संग लोड नहीं हो सका।'), findsOneWidget);
      expect(find.text('पुनः प्रयास करें'), findsOneWidget);
    });

    testWidgets('11. Container semantics summarize title and message', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPErrorState(
            title: 'Streaming failed',
            message: 'Please check your internet connection.',
          ),
        ),
      );

      final SemanticsNode node = tester.getSemantics(
        find.byType(SSPErrorState),
      );
      expect(node.label, contains('Streaming failed'));
      expect(node.label, contains('Please check your internet connection.'));
    });

    testWidgets('12. Text scaling 2.0 renders without overflow', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPErrorState(
            message: 'The audio stream could not be started at this time.',
            onRetry: () {},
          ),
          textScale: 2.0,
        ),
      );

      expect(tester.takeException(), isNull);
    });

    testWidgets('13. Renders in dark mode', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPErrorState(message: 'Failed to load.', onRetry: () {}),
          brightness: Brightness.dark,
        ),
      );

      expect(find.text('Something went wrong'), findsOneWidget);
      expect(find.text('Retry'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });

    testWidgets(
      '14. Long content renders without overflow (takeException null)',
      (WidgetTester tester) async {
        await tester.pumpWidget(
          buildTestableWidget(
            SizedBox(
              width: 260,
              child: SSPErrorState(
                message:
                    'A very long error description that keeps going well beyond the available width in restricted and scaled layouts.',
                onRetry: () {},
              ),
            ),
          ),
        );

        expect(tester.takeException(), isNull);
      },
    );
  });
}
