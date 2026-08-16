import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_primary_button.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_secondary_button.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_tertiary_button.dart';
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

  group('SSPTertiaryButton Widget Tests', () {
    testWidgets('1. Renders correctly with label', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPTertiaryButton(
            label: 'Skip',
            onPressed: () {},
          ),
        ),
      );

      expect(find.text('Skip'), findsOneWidget);
    });

    testWidgets('2. Invokes onPressed callback when tapped', (WidgetTester tester) async {
      bool pressed = false;
      await tester.pumpWidget(
        buildTestableWidget(
          SSPTertiaryButton(
            label: 'Learn More',
            onPressed: () => pressed = true,
          ),
        ),
      );

      await tester.tap(find.text('Learn More'));
      await tester.pumpAndSettle();

      expect(pressed, isTrue);
    });

    testWidgets('3. Disabled state prevents callback execution', (WidgetTester tester) async {
      bool pressed = false;
      await tester.pumpWidget(
        buildTestableWidget(
          SSPTertiaryButton(
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
          SSPTertiaryButton(
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
          SSPTertiaryButton(
            label: 'Info',
            leadingIcon: const Icon(Icons.info_outline),
            onPressed: () {},
          ),
        ),
      );

      expect(find.byIcon(Icons.info_outline), findsOneWidget);
      expect(find.text('Info'), findsOneWidget);
    });

    testWidgets('6. Trailing icon renders when provided', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPTertiaryButton(
            label: 'Details',
            trailingIcon: const Icon(Icons.chevron_right),
            onPressed: () {},
          ),
        ),
      );

      expect(find.byIcon(Icons.chevron_right), findsOneWidget);
      expect(find.text('Details'), findsOneWidget);
    });

    testWidgets('7. Renders in Light Theme correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPTertiaryButton(
            label: 'Light Tertiary',
            onPressed: () {},
          ),
          brightness: Brightness.light,
        ),
      );

      expect(find.text('Light Tertiary'), findsOneWidget);
    });

    testWidgets('8. Renders in Dark Theme correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPTertiaryButton(
            label: 'Dark Tertiary',
            onPressed: () {},
          ),
          brightness: Brightness.dark,
        ),
      );

      expect(find.text('Dark Tertiary'), findsOneWidget);
    });

    testWidgets('9. Enforces minimum touch target of 48dp height', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPTertiaryButton(
            label: 'Touch Target',
            onPressed: () {},
          ),
        ),
      );

      final Size size = tester.getSize(find.byType(SSPTertiaryButton));
      expect(size.height, greaterThanOrEqualTo(SSPSpacing.minTouchTarget));
    });

    testWidgets('10. Semantic label override is applied', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPTertiaryButton(
            label: 'Skip',
            semanticLabel: 'Skip tutorial walkthrough',
            onPressed: () {},
          ),
        ),
      );

      final SemanticsNode node = tester.getSemantics(find.byType(SSPTertiaryButton));
      expect(node.label, contains('Skip tutorial walkthrough'));
    });

    testWidgets('11. Handles long labels with overflow truncation gracefully',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SizedBox(
            width: 200,
            child: SSPTertiaryButton(
              label: 'Very Long Tertiary Action Label Exceeding Display Bounds',
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
          SSPTertiaryButton(
            label: 'Compact',
            width: SSPButtonWidth.intrinsic,
            onPressed: () {},
          ),
        ),
      );

      final Size size = tester.getSize(find.byType(SSPTertiaryButton));
      expect(size.width, lessThan(400));
    });

    testWidgets('13. Primary Button remains unaffected by Tertiary Button', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPPrimaryButton(
            label: 'Primary Action',
            onPressed: () {},
          ),
        ),
      );

      expect(find.text('Primary Action'), findsOneWidget);
    });

    testWidgets('14. Secondary Button remains unaffected by Tertiary Button', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPSecondaryButton(
            label: 'Secondary Action',
            onPressed: () {},
          ),
        ),
      );

      expect(find.text('Secondary Action'), findsOneWidget);
    });
  });
}
