import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_empty_state.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_tertiary_button.dart';
import 'package:santmat_satsang_prachar/shared/design_system/tokens/colors/ssp_colors.dart';
import 'package:santmat_satsang_prachar/shared/design_system/tokens/icons/ssp_icons.dart';
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

  group('SSPEmptyState Widget Tests', () {
    testWidgets('1. Renders title and message', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPEmptyState(
            title: 'No bhajans yet',
            message: 'Saved bhajans will appear here.',
          ),
        ),
      );

      expect(find.text('No bhajans yet'), findsOneWidget);
      expect(find.text('Saved bhajans will appear here.'), findsOneWidget);
    });

    testWidgets('2. Renders default info icon', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPEmptyState(title: 'Empty', message: 'Nothing here.'),
        ),
      );

      expect(find.byIcon(SSPIcons.info), findsOneWidget);
    });

    testWidgets('3. Renders custom icon when provided', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPEmptyState(
            title: 'Empty',
            message: 'Nothing here.',
            icon: Icons.inbox_outlined,
          ),
        ),
      );

      expect(find.byIcon(Icons.inbox_outlined), findsOneWidget);
      expect(find.byIcon(SSPIcons.info), findsNothing);
    });

    testWidgets('4. Invokes onAction callback when action tapped', (
      WidgetTester tester,
    ) async {
      bool pressed = false;
      await tester.pumpWidget(
        buildTestableWidget(
          SSPEmptyState(
            title: 'No history',
            message: 'Your listening history is empty.',
            actionLabel: 'Explore Library',
            onAction: () => pressed = true,
          ),
        ),
      );

      await tester.tap(find.text('Explore Library'));
      await tester.pumpAndSettle();

      expect(pressed, isTrue);
    });

    testWidgets('5. No action button when onAction is null', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPEmptyState(
            title: 'No history',
            message: 'Your listening history is empty.',
            actionLabel: 'Explore Library',
          ),
        ),
      );

      expect(find.byType(SSPTertiaryButton), findsNothing);
      expect(find.text('Explore Library'), findsNothing);
    });

    testWidgets('6. No action button when actionLabel is null', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPEmptyState(
            title: 'No history',
            message: 'Your listening history is empty.',
            onAction: () {},
          ),
        ),
      );

      expect(find.byType(SSPTertiaryButton), findsNothing);
    });

    testWidgets('7. Rendering a tertiary action button when both provided', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPEmptyState(
            title: 'No queue',
            message: 'Add items to your queue.',
            actionLabel: 'Browse',
            onAction: () {},
          ),
        ),
      );

      expect(find.byType(SSPTertiaryButton), findsOneWidget);
      expect(find.text('Browse'), findsOneWidget);
    });

    testWidgets('8. Compact mode reduces gaps between icon and title', (
      WidgetTester tester,
    ) async {
      final Widget standard = buildTestableWidget(
        SSPEmptyState(title: 'Empty', message: 'Nothing here.'),
      );
      final Widget compact = buildTestableWidget(
        SSPEmptyState(title: 'Empty', message: 'Nothing here.', compact: true),
      );

      await tester.pumpWidget(standard);
      expect(
        find.byWidgetPredicate(
          (Widget w) => w is SizedBox && w.height == SSPSpacing.lg,
        ),
        findsOneWidget,
      );
      expect(
        find.byWidgetPredicate(
          (Widget w) => w is SizedBox && w.height == SSPSpacing.md,
        ),
        findsNothing,
      );

      await tester.pumpWidget(compact);
      expect(
        find.byWidgetPredicate(
          (Widget w) => w is SizedBox && w.height == SSPSpacing.lg,
        ),
        findsNothing,
      );
      expect(
        find.byWidgetPredicate(
          (Widget w) => w is SizedBox && w.height == SSPSpacing.md,
        ),
        findsOneWidget,
      );
    });

    testWidgets('9. Renders Hindi title and message', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPEmptyState(
            title: 'अभी कोई भजन नहीं',
            message: 'सहेजे गए भजन यहाँ दिखाई देंगे।',
          ),
        ),
      );

      expect(find.text('अभी कोई भजन नहीं'), findsOneWidget);
      expect(find.text('सहेजे गए भजन यहाँ दिखाई देंगे।'), findsOneWidget);
    });

    testWidgets('10. Renders English title and message', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPEmptyState(
            title: 'Nothing saved',
            message: 'Your favorites will show up here.',
          ),
        ),
      );

      expect(find.text('Nothing saved'), findsOneWidget);
      expect(find.text('Your favorites will show up here.'), findsOneWidget);
    });

    testWidgets('11. Container semantics summarize title and message', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPEmptyState(
            title: 'No downloads',
            message: 'Downloaded content will appear here.',
          ),
        ),
      );

      final SemanticsNode node = tester.getSemantics(
        find.byType(SSPEmptyState),
      );
      expect(node.label, contains('No downloads'));
      expect(node.label, contains('Downloaded content will appear here.'));
    });

    testWidgets('12. Text scaling 2.0 renders without overflow', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPEmptyState(
            title: 'No items found matching your search',
            message:
                'Try adjusting filters or search for something shorter instead.',
            actionLabel: 'Clear Filters',
            onAction: () {},
          ),
          textScale: 2.0,
        ),
      );

      expect(tester.takeException(), isNull);
    });

    testWidgets('13. Renders in dark mode with primary container backdrop', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPEmptyState(title: 'Empty', message: 'Nothing here.'),
          brightness: Brightness.dark,
        ),
      );

      expect(find.text('Empty'), findsOneWidget);
      final Container backdrop = tester.widget<Container>(
        find.byWidgetPredicate(
          (Widget w) =>
              w is Container &&
              w.decoration is BoxDecoration &&
              (w.decoration! as BoxDecoration).shape == BoxShape.circle,
        ),
      );
      expect(
        (backdrop.decoration! as BoxDecoration).color,
        SSPColors.darkPrimaryContainer,
      );
    });

    testWidgets(
      '14. Long content renders without overflow (takeException null)',
      (WidgetTester tester) async {
        await tester.pumpWidget(
          buildTestableWidget(
            SizedBox(
              width: 260,
              child: SSPEmptyState(
                title: 'A very long empty state heading for narrow screens',
                message:
                    'A very long supporting description that continues beyond the available width of the container in restricted layouts.',
                actionLabel: 'View Everything',
                onAction: () {},
              ),
            ),
          ),
        );

        expect(tester.takeException(), isNull);
      },
    );
  });
}
