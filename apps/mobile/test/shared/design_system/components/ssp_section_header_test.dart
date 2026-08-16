import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_section_header.dart';
import 'package:santmat_satsang_prachar/shared/design_system/tokens/colors/ssp_colors.dart';
import 'package:santmat_satsang_prachar/shared/design_system/tokens/spacing/ssp_spacing.dart';

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

  Finder actionButton() {
    return find.descendant(
      of: find.byType(SSPSectionHeader),
      matching: find.byWidgetPredicate(
        (Widget w) => w is Semantics && w.properties.button == true,
      ),
    );
  }

  group('SSPSectionHeader Widget Tests', () {
    testWidgets('1. Renders title text', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPSectionHeader(title: 'Featured Satsangs'),
        ),
      );

      expect(find.text('Featured Satsangs'), findsOneWidget);
    });

    testWidgets('2. Renders action text when actionText and onAction provided',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPSectionHeader(
            title: 'Bhajans',
            actionText: 'See All',
            onAction: () {},
          ),
        ),
      );

      expect(find.text('See All'), findsOneWidget);
    });

    testWidgets('3. Invokes onAction callback when action tapped',
        (WidgetTester tester) async {
      bool pressed = false;
      await tester.pumpWidget(
        buildTestableWidget(
          SSPSectionHeader(
            title: 'Bhajans',
            actionText: 'See All',
            onAction: () => pressed = true,
          ),
        ),
      );

      await tester.tap(find.text('See All'));
      await tester.pumpAndSettle();

      expect(pressed, isTrue);
    });

    testWidgets('4. Hides action when actionText is null', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPSectionHeader(
            title: 'Featured',
            onAction: () {},
          ),
        ),
      );

      expect(find.text('See All'), findsNothing);
      expect(actionButton(), findsNothing);
    });

    testWidgets('5. Hides action when onAction is null (actionText present)',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPSectionHeader(
            title: 'Featured',
            actionText: 'See All',
          ),
        ),
      );

      expect(find.text('See All'), findsNothing);
      expect(actionButton(), findsNothing);
    });

    testWidgets('6. Action is a button and enabled in semantics',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPSectionHeader(
            title: 'Library',
            actionText: 'See All',
            onAction: () {},
          ),
        ),
      );

      expect(actionButton(), findsOneWidget);

      final SemanticsNode node = tester.getSemantics(actionButton());
      expect(node.flagsCollection.isButton, isTrue);
      expect(node.flagsCollection.isEnabled, isTrue);
      expect(node.label, 'See All');
    });

    testWidgets('7. Semantic label override is applied to the action',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPSectionHeader(
            title: 'Library',
            actionText: 'See All',
            onAction: () {},
            semanticLabel: 'View entire library',
          ),
        ),
      );

      expect(tester.getSemantics(actionButton()).label, 'View entire library');
    });

    testWidgets('8. Action enforces minimum 48dp touch target height',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPSectionHeader(
            title: 'Featured',
            actionText: 'See All',
            onAction: () {},
          ),
        ),
      );

      final Finder hitTarget = find.descendant(
        of: find.byType(SSPSectionHeader),
        matching: find.byWidgetPredicate(
          (Widget w) =>
              w is ConstrainedBox &&
              w.constraints.minHeight == SSPSpacing.minTouchTarget,
        ),
      );

      expect(hitTarget, findsOneWidget);
      expect(
        tester.getSize(hitTarget).height,
        greaterThanOrEqualTo(SSPSpacing.minTouchTarget),
      );
    });

    testWidgets('9. Renders Hindi title', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPSectionHeader(title: 'भजन सम्मेलन'),
        ),
      );

      expect(find.text('भजन सम्मेलन'), findsOneWidget);
    });

    testWidgets('10. Renders English title', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPSectionHeader(title: 'Upcoming Live Satsangs'),
        ),
      );

      expect(find.text('Upcoming Live Satsangs'), findsOneWidget);
    });

    testWidgets('11. Renders Unicode Devanagari diacritic title',
        (WidgetTester tester) async {
      const String title = 'सत्संग और कीर्तन — समर्पण';
      await tester.pumpWidget(
        buildTestableWidget(SSPSectionHeader(title: title)),
      );

      expect(find.text(title), findsOneWidget);
    });

    testWidgets('12. Text scaling 2.0 renders without overflow',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPSectionHeader(
            title: 'A Very Long Section Heading That Wraps With Scaled Text',
            actionText: 'See All',
            onAction: () {},
          ),
          textScale: 2.0,
        ),
      );

      expect(tester.takeException(), isNull);
      expect(find.byType(SSPSectionHeader), findsOneWidget);
    });

    testWidgets('13. Narrow width renders without overflow', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SizedBox(
            width: 220,
            child: SSPSectionHeader(
              title: 'Long Section Heading In A Narrow Container',
              actionText: 'See All',
              onAction: () {},
            ),
          ),
        ),
      );

      expect(tester.takeException(), isNull);
    });

    testWidgets('14. Long action text renders without overflow',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SizedBox(
            width: 240,
            child: SSPSectionHeader(
              title: 'Satsang',
              actionText: 'View All Listings From Today And Tomorrow',
              onAction: () {},
            ),
          ),
        ),
      );

      expect(tester.takeException(), isNull);
    });

    testWidgets('15. Renders in dark mode with dark primary action color',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPSectionHeader(
            title: 'Featured',
            actionText: 'See All',
            onAction: () {},
          ),
          brightness: Brightness.dark,
        ),
      );

      expect(find.text('Featured'), findsOneWidget);
      final Text actionText = tester.widget<Text>(find.text('See All'));
      expect(actionText.style?.color, SSPColors.darkPrimary);
    });
  });
}