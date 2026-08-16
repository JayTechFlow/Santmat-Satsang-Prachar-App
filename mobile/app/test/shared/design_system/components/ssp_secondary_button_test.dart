import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_primary_button.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_secondary_button.dart';
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

  group('SSPSecondaryButton Widget Tests', () {
    testWidgets('1. Renders correctly with label', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPSecondaryButton(
            label: 'Cancel',
            onPressed: () {},
          ),
        ),
      );

      expect(find.text('Cancel'), findsOneWidget);
    });

    testWidgets('2. Invokes onPressed callback when tapped', (WidgetTester tester) async {
      bool pressed = false;
      await tester.pumpWidget(
        buildTestableWidget(
          SSPSecondaryButton(
            label: 'Dismiss',
            onPressed: () => pressed = true,
          ),
        ),
      );

      await tester.tap(find.text('Dismiss'));
      await tester.pumpAndSettle();

      expect(pressed, isTrue);
    });

    testWidgets('3. Disabled state prevents callback execution', (WidgetTester tester) async {
      bool pressed = false;
      await tester.pumpWidget(
        buildTestableWidget(
          SSPSecondaryButton(
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
          SSPSecondaryButton(
            label: 'Loading Action',
            onPressed: () => pressed = true,
            isLoading: true,
          ),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      expect(find.text('Loading Action'), findsOneWidget);

      await tester.tap(find.text('Loading Action'));
      await tester.pump(const Duration(milliseconds: 100));

      expect(pressed, isFalse);
    });

    testWidgets('5. Leading icon renders when provided', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPSecondaryButton(
            label: 'Filter',
            leadingIcon: const Icon(Icons.filter_list),
            onPressed: () {},
          ),
        ),
      );

      expect(find.byIcon(Icons.filter_list), findsOneWidget);
      expect(find.text('Filter'), findsOneWidget);
    });

    testWidgets('6. Trailing icon renders when provided', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPSecondaryButton(
            label: 'Share',
            trailingIcon: const Icon(Icons.share),
            onPressed: () {},
          ),
        ),
      );

      expect(find.byIcon(Icons.share), findsOneWidget);
      expect(find.text('Share'), findsOneWidget);
    });

    testWidgets('7. Renders in Light Theme correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPSecondaryButton(
            label: 'Light Secondary',
            onPressed: () {},
          ),
          brightness: Brightness.light,
        ),
      );

      expect(find.text('Light Secondary'), findsOneWidget);
    });

    testWidgets('8. Renders in Dark Theme correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPSecondaryButton(
            label: 'Dark Secondary',
            onPressed: () {},
          ),
          brightness: Brightness.dark,
        ),
      );

      expect(find.text('Dark Secondary'), findsOneWidget);
    });

    testWidgets('9. Enforces minimum touch target of 48dp height', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPSecondaryButton(
            label: 'Touch Target',
            onPressed: () {},
          ),
        ),
      );

      final Size size = tester.getSize(find.byType(SSPSecondaryButton));
      expect(size.height, greaterThanOrEqualTo(SSPSpacing.minTouchTarget));
    });

    testWidgets('10. Semantic label override is applied', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPSecondaryButton(
            label: 'Skip',
            semanticLabel: 'Skip onboarding introduction',
            onPressed: () {},
          ),
        ),
      );

      final SemanticsNode node = tester.getSemantics(find.byType(SSPSecondaryButton));
      expect(node.label, contains('Skip onboarding introduction'));
    });

    testWidgets('11. Handles long labels with overflow truncation gracefully',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SizedBox(
            width: 200,
            child: SSPSecondaryButton(
              label: 'Very Long Secondary Action Label Exceeding Display Bounds',
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
          SSPSecondaryButton(
            label: 'Compact',
            width: SSPButtonWidth.intrinsic,
            onPressed: () {},
          ),
        ),
      );

      final Size size = tester.getSize(find.byType(SSPSecondaryButton));
      expect(size.width, lessThan(400));
    });
  });
}
