import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_icon_button.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_primary_button.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_search_field.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_secondary_button.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_tertiary_button.dart';

void main() {
  Widget buildTestableWidget(
    Widget child, {
    Brightness brightness = Brightness.light,
  }) {
    return MaterialApp(
      theme: ThemeData(brightness: brightness),
      home: Scaffold(
        body: Padding(padding: const EdgeInsets.all(16.0), child: child),
      ),
    );
  }

  group('SSPSearchField Widget Tests', () {
    testWidgets('1. Renders correctly with default hint text', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(buildTestableWidget(const SSPSearchField()));

      expect(find.text('Search...'), findsOneWidget);
      expect(find.byIcon(Icons.search_rounded), findsOneWidget);
    });

    testWidgets('2. Renders custom hint text', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPSearchField(hintText: 'Search audio satsangs...'),
        ),
      );

      expect(find.text('Search audio satsangs...'), findsOneWidget);
    });

    testWidgets('3. Triggers onChanged callback when typing', (
      WidgetTester tester,
    ) async {
      String text = '';
      await tester.pumpWidget(
        buildTestableWidget(SSPSearchField(onChanged: (val) => text = val)),
      );

      await tester.enterText(find.byType(TextField), 'Santmat');
      await tester.pumpAndSettle();

      expect(text, equals('Santmat'));
    });

    testWidgets(
      '4. Triggers onSubmitted callback when search action is pressed',
      (WidgetTester tester) async {
        String submittedQuery = '';
        await tester.pumpWidget(
          buildTestableWidget(
            SSPSearchField(onSubmitted: (val) => submittedQuery = val),
          ),
        );

        await tester.enterText(find.byType(TextField), 'Satsang');
        await tester.testTextInput.receiveAction(TextInputAction.search);
        await tester.pumpAndSettle();

        expect(submittedQuery, equals('Satsang'));
      },
    );

    testWidgets('5. Works with external TextEditingController cleanly', (
      WidgetTester tester,
    ) async {
      final TextEditingController controller = TextEditingController(
        text: 'Initial',
      );
      await tester.pumpWidget(
        buildTestableWidget(SSPSearchField(controller: controller)),
      );

      expect(find.text('Initial'), findsOneWidget);

      await tester.enterText(find.byType(TextField), 'Updated');
      expect(controller.text, equals('Updated'));
    });

    testWidgets('6. Works with external FocusNode cleanly', (
      WidgetTester tester,
    ) async {
      final FocusNode focusNode = FocusNode();
      await tester.pumpWidget(
        buildTestableWidget(SSPSearchField(focusNode: focusNode)),
      );

      expect(focusNode.hasFocus, isFalse);

      await tester.tap(find.byType(TextField));
      await tester.pumpAndSettle();

      expect(focusNode.hasFocus, isTrue);
    });

    testWidgets('7. Displays clear button when non-empty and handles tap', (
      WidgetTester tester,
    ) async {
      bool cleared = false;
      final TextEditingController controller = TextEditingController();

      await tester.pumpWidget(
        buildTestableWidget(
          SSPSearchField(controller: controller, onClear: () => cleared = true),
        ),
      );

      expect(find.byType(SSPIconButton), findsNothing);

      await tester.enterText(find.byType(TextField), 'Query');
      await tester.pumpAndSettle();

      expect(find.byType(SSPIconButton), findsOneWidget);

      await tester.tap(find.byType(SSPIconButton));
      await tester.pumpAndSettle();

      expect(controller.text, isEmpty);
      expect(cleared, isTrue);
    });

    testWidgets('8. Renders loading indicator when isLoading is true', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(const SSPSearchField(isLoading: true)),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('9. Renders in Light Theme correctly', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPSearchField(hintText: 'Light Search'),
          brightness: Brightness.light,
        ),
      );

      expect(find.text('Light Search'), findsOneWidget);
    });

    testWidgets('10. Renders in Dark Theme correctly', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPSearchField(hintText: 'Dark Search'),
          brightness: Brightness.dark,
        ),
      );

      expect(find.text('Dark Search'), findsOneWidget);
    });

    testWidgets('11. Handles Hindi and Devanagari Unicode text input cleanly', (
      WidgetTester tester,
    ) async {
      String hindiQuery = '';
      await tester.pumpWidget(
        buildTestableWidget(
          SSPSearchField(onChanged: (val) => hindiQuery = val),
        ),
      );

      await tester.enterText(find.byType(TextField), 'संतमत सत्संग');
      await tester.pumpAndSettle();

      expect(hindiQuery, equals('संतमत सत्संग'));
      expect(find.text('संतमत सत्संग'), findsOneWidget);
    });

    testWidgets(
      '12. Handles long query string without breaking layout or overflowing',
      (WidgetTester tester) async {
        const String longQuery =
            'संतमत सत्संग प्रचार अति विशिष्ट विस्तृत खोज विवरण एवं भजन ऑडियो संग्रह';
        await tester.pumpWidget(
          buildTestableWidget(const SSPSearchField(hintText: longQuery)),
        );

        expect(tester.takeException(), isNull);
      },
    );

    testWidgets('13. Disabled state prevents text editing', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPSearchField(enabled: false, hintText: 'Disabled field'),
        ),
      );

      final TextField textField = tester.widget(find.byType(TextField));
      expect(textField.enabled, isFalse);
    });

    testWidgets(
      '14. Read-only state prevents keyboard input while selectable',
      (WidgetTester tester) async {
        await tester.pumpWidget(
          buildTestableWidget(
            const SSPSearchField(readOnly: true, hintText: 'Read only field'),
          ),
        );

        final TextField textField = tester.widget(find.byType(TextField));
        expect(textField.readOnly, isTrue);
      },
    );

    testWidgets('15. Primary Button remains unaffected by Search Field', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPPrimaryButton(label: 'Primary Action', onPressed: () {}),
        ),
      );

      expect(find.text('Primary Action'), findsOneWidget);
    });

    testWidgets('16. Secondary Button remains unaffected by Search Field', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPSecondaryButton(label: 'Secondary Action', onPressed: () {}),
        ),
      );

      expect(find.text('Secondary Action'), findsOneWidget);
    });

    testWidgets('17. Tertiary Button remains unaffected by Search Field', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPTertiaryButton(label: 'Tertiary Action', onPressed: () {}),
        ),
      );

      expect(find.text('Tertiary Action'), findsOneWidget);
    });

    testWidgets('18. Icon Button remains unaffected by Search Field', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPIconButton(
            icon: const Icon(Icons.star),
            semanticLabel: 'Star',
            onPressed: () {},
          ),
        ),
      );

      expect(find.byIcon(Icons.star), findsOneWidget);
    });

    testWidgets(
      '19. Renders no microphone / voice-search affordance',
      (WidgetTester tester) async {
        await tester.pumpWidget(
          buildTestableWidget(const SSPSearchField()),
        );
        await tester.pumpAndSettle();

        // Voice Search was removed from the product: the canonical search field
        // must never expose a mic button.
        expect(find.byIcon(Icons.mic_rounded), findsNothing);
        expect(find.bySemanticsLabel('Voice search'), findsNothing);
      },
    );
  });
}
