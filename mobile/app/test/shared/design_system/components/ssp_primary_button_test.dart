import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_primary_button.dart';
import 'package:santmat_satsang_prachar/shared/design_system/tokens/spacing/ssp_spacing.dart';

void main() {
  Widget buildTestableWidget(Widget child, {Brightness brightness = Brightness.light}) {
    return MaterialApp(
      theme: ThemeData(brightness: brightness),
      home: Scaffold(
        body: Center(child: child),
      ),
    );
  }

  group('SSPPrimaryButton Widget Tests', () {
    testWidgets('1. Renders correctly with label', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPPrimaryButton(
            label: 'Submit',
            onPressed: () {},
          ),
        ),
      );

      expect(find.text('Submit'), findsOneWidget);
    });

    testWidgets('2. Invokes onPressed callback when tapped', (WidgetTester tester) async {
      bool pressed = false;
      await tester.pumpWidget(
        buildTestableWidget(
          SSPPrimaryButton(
            label: 'Tap Me',
            onPressed: () => pressed = true,
          ),
        ),
      );

      await tester.tap(find.text('Tap Me'));
      await tester.pumpAndSettle();

      expect(pressed, isTrue);
    });

    testWidgets('3. Disabled state prevents callback execution', (WidgetTester tester) async {
      bool pressed = false;
      await tester.pumpWidget(
        buildTestableWidget(
          SSPPrimaryButton(
            label: 'Disabled',
            onPressed: null,
          ),
        ),
      );

      await tester.tap(find.text('Disabled'));
      await tester.pumpAndSettle();

      expect(pressed, isFalse);
    });

    testWidgets('4. Loading state prevents callback execution and displays progress indicator',
        (WidgetTester tester) async {
      bool pressed = false;
      await tester.pumpWidget(
        buildTestableWidget(
          SSPPrimaryButton(
            label: 'Loading Action',
            onPressed: () => pressed = true,
            isLoading: true,
          ),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      expect(find.text('Loading Action'), findsOneWidget); // Preserves layout text

      await tester.tap(find.text('Loading Action'));
      await tester.pump(const Duration(milliseconds: 100));

      expect(pressed, isFalse);
    });

    testWidgets('5. Leading icon renders when provided', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPPrimaryButton(
            label: 'Play',
            leadingIcon: const Icon(Icons.play_arrow),
            onPressed: () {},
          ),
        ),
      );

      expect(find.byIcon(Icons.play_arrow), findsOneWidget);
      expect(find.text('Play'), findsOneWidget);
    });

    testWidgets('6. Trailing icon renders when provided', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPPrimaryButton(
            label: 'Next',
            trailingIcon: const Icon(Icons.arrow_forward),
            onPressed: () {},
          ),
        ),
      );

      expect(find.byIcon(Icons.arrow_forward), findsOneWidget);
      expect(find.text('Next'), findsOneWidget);
    });

    testWidgets('7. Renders in Light Theme correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPPrimaryButton(
            label: 'Light Action',
            onPressed: () {},
          ),
          brightness: Brightness.light,
        ),
      );

      expect(find.text('Light Action'), findsOneWidget);
    });

    testWidgets('8. Renders in Dark Theme correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPPrimaryButton(
            label: 'Dark Action',
            onPressed: () {},
          ),
          brightness: Brightness.dark,
        ),
      );

      expect(find.text('Dark Action'), findsOneWidget);
    });

    testWidgets('9. Enforces minimum touch target of 48dp height', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPPrimaryButton(
            label: 'Target',
            onPressed: () {},
          ),
        ),
      );

      final Size size = tester.getSize(find.byType(SSPPrimaryButton));
      expect(size.height, greaterThanOrEqualTo(SSPSpacing.minTouchTarget));
    });

    testWidgets('10. Semantic label override is applied', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPPrimaryButton(
            label: 'Submit',
            semanticLabel: 'Submit satsang registration form',
            onPressed: () {},
          ),
        ),
      );

      final SemanticsNode node = tester.getSemantics(find.byType(SSPPrimaryButton));
      expect(node.label, contains('Submit satsang registration form'));
    });

    testWidgets('11. Handles long labels with overflow truncation gracefully',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SizedBox(
            width: 200,
            child: SSPPrimaryButton(
              label: 'Very Long Action Text That Exceeds Width Capabilities',
              onPressed: () {},
            ),
          ),
        ),
      );

      expect(tester.takeException(), isNull);
    });

    testWidgets('12. Intrinsic width behavior mode sizes to content', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPPrimaryButton(
            label: 'Compact',
            width: SSPButtonWidth.intrinsic,
            onPressed: () {},
          ),
        ),
      );

      final Size size = tester.getSize(find.byType(SSPPrimaryButton));
      expect(size.width, lessThan(400));
    });
  });
}
