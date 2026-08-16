import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_icon_button.dart';
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

  group('SSPIconButton Widget Tests', () {
    testWidgets('1. Renders icon correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPIconButton(
            icon: const Icon(Icons.favorite),
            semanticLabel: 'Favorite satsang',
            onPressed: () {},
          ),
        ),
      );

      expect(find.byIcon(Icons.favorite), findsOneWidget);
    });

    testWidgets('2. Invokes onPressed callback when tapped', (WidgetTester tester) async {
      bool pressed = false;
      await tester.pumpWidget(
        buildTestableWidget(
          SSPIconButton(
            icon: const Icon(Icons.share),
            semanticLabel: 'Share audio',
            onPressed: () => pressed = true,
          ),
        ),
      );

      await tester.tap(find.byType(SSPIconButton));
      await tester.pumpAndSettle();

      expect(pressed, isTrue);
    });

    testWidgets('3. Disabled state prevents callback execution', (WidgetTester tester) async {
      bool pressed = false;
      await tester.pumpWidget(
        buildTestableWidget(
          SSPIconButton(
            icon: const Icon(Icons.download),
            semanticLabel: 'Download audio',
            onPressed: null,
          ),
        ),
      );

      await tester.tap(find.byType(SSPIconButton));
      await tester.pumpAndSettle();

      expect(pressed, isFalse);
    });

    testWidgets('4. Semantic label exists and is correct', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPIconButton(
            icon: const Icon(Icons.notifications),
            semanticLabel: 'Open notifications center',
            onPressed: () {},
          ),
        ),
      );

      final SemanticsNode node = tester.getSemantics(find.byType(SSPIconButton));
      expect(node.label, contains('Open notifications center'));
    });

    testWidgets('5. Tooltip works when configured', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPIconButton(
            icon: const Icon(Icons.info),
            semanticLabel: 'Show information',
            tooltip: 'More Details',
            onPressed: () {},
          ),
        ),
      );

      expect(find.byType(Tooltip), findsOneWidget);
      final Tooltip tooltip = tester.widget(find.byType(Tooltip));
      expect(tooltip.message, equals('More Details'));
    });

    testWidgets('6. Enforces minimum touch target of 48dp height and width', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPIconButton(
            icon: const Icon(Icons.play_arrow),
            semanticLabel: 'Play',
            onPressed: () {},
          ),
        ),
      );

      final Size size = tester.getSize(find.byType(SSPIconButton));
      expect(size.height, greaterThanOrEqualTo(SSPSpacing.minTouchTarget));
      expect(size.width, greaterThanOrEqualTo(SSPSpacing.minTouchTarget));
    });

    testWidgets('7. Renders in Light Theme correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPIconButton(
            icon: const Icon(Icons.bookmark),
            semanticLabel: 'Bookmark',
            onPressed: () {},
          ),
          brightness: Brightness.light,
        ),
      );

      expect(find.byIcon(Icons.bookmark), findsOneWidget);
    });

    testWidgets('8. Renders in Dark Theme correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPIconButton(
            icon: const Icon(Icons.bookmark),
            semanticLabel: 'Bookmark',
            onPressed: () {},
          ),
          brightness: Brightness.dark,
        ),
      );

      expect(find.byIcon(Icons.bookmark), findsOneWidget);
    });

    testWidgets('9. Loading state prevents callback execution and displays progress indicator',
        (WidgetTester tester) async {
      bool pressed = false;
      await tester.pumpWidget(
        buildTestableWidget(
          SSPIconButton(
            icon: const Icon(Icons.cloud_upload),
            semanticLabel: 'Uploading file',
            onPressed: () => pressed = true,
            isLoading: true,
          ),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);

      await tester.tap(find.byType(SSPIconButton));
      await tester.pump(const Duration(milliseconds: 100));

      expect(pressed, isFalse);
    });

    testWidgets('10. Selected state updates semantics correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPIconButton(
            icon: const Icon(Icons.favorite),
            semanticLabel: 'Favorite',
            isSelected: true,
            onPressed: () {},
          ),
        ),
      );

      final SemanticsData data = tester.getSemantics(find.byType(SSPIconButton)).getSemanticsData();
      // ignore: deprecated_member_use
      expect((data.flags & SemanticsFlag.isSelected.index) != 0, isTrue);
    });

    testWidgets('11. Unselected state has isSelected false', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPIconButton(
            icon: const Icon(Icons.favorite_border),
            semanticLabel: 'Favorite',
            isSelected: false,
            onPressed: () {},
          ),
        ),
      );

      final SemanticsData data = tester.getSemantics(find.byType(SSPIconButton)).getSemanticsData();
      // ignore: deprecated_member_use
      expect((data.flags & SemanticsFlag.isSelected.index) != 0, isFalse);
    });

    testWidgets('12. Renders all variants (standard, filled, outlined, tonal) cleanly',
        (WidgetTester tester) async {
      for (final variant in SSPIconButtonVariant.values) {
        await tester.pumpWidget(
          buildTestableWidget(
            SSPIconButton(
              icon: const Icon(Icons.settings),
              semanticLabel: 'Settings',
              variant: variant,
              onPressed: () {},
            ),
          ),
        );

        expect(find.byIcon(Icons.settings), findsOneWidget);
      }
    });

    testWidgets('13. Primary Button remains unaffected by Icon Button', (WidgetTester tester) async {
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

    testWidgets('14. Secondary Button remains unaffected by Icon Button', (WidgetTester tester) async {
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

    testWidgets('15. Tertiary Button remains unaffected by Icon Button', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPTertiaryButton(
            label: 'Tertiary Action',
            onPressed: () {},
          ),
        ),
      );

      expect(find.text('Tertiary Action'), findsOneWidget);
    });
  });
}
