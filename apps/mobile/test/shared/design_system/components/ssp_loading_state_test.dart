import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_loading_state.dart';
import 'package:santmat_satsang_prachar/shared/design_system/tokens/colors/ssp_colors.dart';

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

  group('SSPLoadingState Widget Tests', () {
    testWidgets('1. Renders a CircularProgressIndicator', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(buildTestableWidget(const SSPLoadingState()));

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      expect(tester.takeException(), isNull);
    });

    testWidgets('2. Default spinner size is 40x40', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(buildTestableWidget(const SSPLoadingState()));

      final Finder sizedSpinner = find.byWidgetPredicate(
        (Widget w) =>
            w is SizedBox &&
            w.width == 40.0 &&
            w.height == 40.0 &&
            w.child is CircularProgressIndicator,
      );

      expect(sizedSpinner, findsOneWidget);
      final Size size = tester.getSize(
        find.byWidgetPredicate(
          (Widget w) =>
              w is SizedBox &&
              w.width == 40.0 &&
              w.height == 40.0 &&
              w.child is CircularProgressIndicator,
        ),
      );
      expect(size.width, 40.0);
      expect(size.height, 40.0);
    });

    testWidgets('3. Respects custom spinner size', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(const SSPLoadingState(size: 56.0)),
      );

      final Finder sizedSpinner = find.byWidgetPredicate(
        (Widget w) =>
            w is SizedBox &&
            w.width == 56.0 &&
            w.height == 56.0 &&
            w.child is CircularProgressIndicator,
      );

      expect(sizedSpinner, findsOneWidget);
    });

    testWidgets('4. Uses 3.0 stroke width', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestableWidget(const SSPLoadingState()));

      final CircularProgressIndicator indicator = tester
          .widget<CircularProgressIndicator>(
            find.byType(CircularProgressIndicator),
          );
      expect(indicator.strokeWidth, 3.0);
    });

    testWidgets('5. Renders message when provided', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPLoadingState(message: 'Loading satsangs...'),
        ),
      );

      expect(find.text('Loading satsangs...'), findsOneWidget);
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('6. Renders no text when message is null', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(buildTestableWidget(const SSPLoadingState()));

      expect(find.byType(Text), findsNothing);
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('7. Semantics announce "Loading" when no message', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(buildTestableWidget(const SSPLoadingState()));

      final SemanticsNode node = tester.getSemantics(
        find.byType(SSPLoadingState),
      );
      expect(node.flagsCollection.isLiveRegion, isTrue);
      expect(node.label, 'Loading');
    });

    testWidgets('8. Semantics use message as live region label', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPLoadingState(message: 'Fetching bhajans...'),
        ),
      );

      final SemanticsNode node = tester.getSemantics(
        find.byType(SSPLoadingState),
      );
      expect(node.flagsCollection.isLiveRegion, isTrue);
      expect(node.label, 'Fetching bhajans...');
    });

    testWidgets('9. Renders Hindi message', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPLoadingState(message: 'भजन लोड हो रहे हैं...'),
        ),
      );

      expect(find.text('भजन लोड हो रहे हैं...'), findsOneWidget);
    });

    testWidgets('10. Renders English message', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPLoadingState(message: 'Loading live satsangs...'),
        ),
      );

      expect(find.text('Loading live satsangs...'), findsOneWidget);
    });

    testWidgets('11. Text scaling 2.0 renders without overflow', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPLoadingState(
            message: 'Please wait while songs are prepared for you',
          ),
          textScale: 2.0,
        ),
      );

      expect(tester.takeException(), isNull);
    });

    testWidgets('12. Renders in dark mode with dark primary spinner color', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPLoadingState(),
          brightness: Brightness.dark,
        ),
      );

      final CircularProgressIndicator indicator = tester
          .widget<CircularProgressIndicator>(
            find.byType(CircularProgressIndicator),
          );
      expect(indicator.valueColor?.value, SSPColors.darkPrimary);
      expect(tester.takeException(), isNull);
    });

    testWidgets(
      '13. Long message renders without overflow (takeException null)',
      (WidgetTester tester) async {
        await tester.pumpWidget(
          buildTestableWidget(
            SizedBox(
              width: 200,
              child: const SSPLoadingState(
                message:
                    'A very long loading message that continues far beyond the available width in scaled layouts',
              ),
            ),
          ),
        );

        expect(tester.takeException(), isNull);
      },
    );
  });
}
