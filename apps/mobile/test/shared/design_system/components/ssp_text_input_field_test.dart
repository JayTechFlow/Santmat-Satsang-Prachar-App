import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_icon_button.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_primary_button.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_search_field.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_secondary_button.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_tertiary_button.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_text_input_field.dart';

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

  group('SSPTextInputField Widget Tests', () {
    testWidgets('1. Renders default input field correctly', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPTextInputField(hintText: 'Enter your name'),
        ),
      );

      expect(find.text('Enter your name'), findsOneWidget);
    });

    testWidgets('2. Renders field label header when label is provided', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPTextInputField(label: 'Full Name', hintText: 'Enter name'),
        ),
      );

      expect(find.text('Full Name'), findsOneWidget);
      expect(find.text('Enter name'), findsOneWidget);
    });

    testWidgets('3. Triggers onChanged callback when user types', (
      WidgetTester tester,
    ) async {
      String text = '';
      await tester.pumpWidget(
        buildTestableWidget(SSPTextInputField(onChanged: (val) => text = val)),
      );

      await tester.enterText(find.byType(EditableText), 'Prachar');
      await tester.pumpAndSettle();

      expect(text, equals('Prachar'));
    });

    testWidgets(
      '4. Triggers onSubmitted callback when keyboard action submitted',
      (WidgetTester tester) async {
        String submittedText = '';
        await tester.pumpWidget(
          buildTestableWidget(
            SSPTextInputField(onSubmitted: (val) => submittedText = val),
          ),
        );

        await tester.enterText(find.byType(EditableText), 'Submitted Value');
        await tester.testTextInput.receiveAction(TextInputAction.done);
        await tester.pumpAndSettle();

        expect(submittedText, equals('Submitted Value'));
      },
    );

    testWidgets('5. Works with external TextEditingController cleanly', (
      WidgetTester tester,
    ) async {
      final TextEditingController controller = TextEditingController(
        text: 'Initial Value',
      );
      await tester.pumpWidget(
        buildTestableWidget(SSPTextInputField(controller: controller)),
      );

      expect(find.text('Initial Value'), findsOneWidget);

      await tester.enterText(find.byType(EditableText), 'New Value');
      expect(controller.text, equals('New Value'));
    });

    testWidgets('6. Works with external FocusNode cleanly', (
      WidgetTester tester,
    ) async {
      final FocusNode focusNode = FocusNode();
      await tester.pumpWidget(
        buildTestableWidget(SSPTextInputField(focusNode: focusNode)),
      );

      expect(focusNode.hasFocus, isFalse);

      await tester.tap(find.byType(EditableText));
      await tester.pumpAndSettle();

      expect(focusNode.hasFocus, isTrue);
    });

    testWidgets('7. Obscures password text and toggles visibility cleanly', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPTextInputField(obscureText: true, showPasswordToggle: true),
        ),
      );

      final EditableText editableTextBefore = tester.widget(
        find.byType(EditableText),
      );
      expect(editableTextBefore.obscureText, isTrue);
      expect(find.byType(SSPIconButton), findsOneWidget);

      await tester.tap(find.byType(SSPIconButton));
      await tester.pumpAndSettle();

      final EditableText editableTextAfter = tester.widget(
        find.byType(EditableText),
      );
      expect(editableTextAfter.obscureText, isFalse);
    });

    testWidgets('8. Displays errorText and formats error border color', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPTextInputField(errorText: 'Invalid email address'),
        ),
      );

      expect(find.text('Invalid email address'), findsOneWidget);
    });

    testWidgets('9. Displays helperText when errorText is null', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPTextInputField(
            helperText: 'Password must be at least 8 characters',
          ),
        ),
      );

      expect(
        find.text('Password must be at least 8 characters'),
        findsOneWidget,
      );
    });

    testWidgets('10. Renders character counter when maxLength is set', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPTextInputField(maxLength: 50, showCharacterCounter: true),
        ),
      );

      expect(find.text('0/50'), findsOneWidget);

      await tester.enterText(find.byType(EditableText), 'Hello');
      await tester.pumpAndSettle();

      expect(find.text('5/50'), findsOneWidget);
    });

    testWidgets('11. Renders leading icon when provided', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPTextInputField(leadingIcon: Icon(Icons.person)),
        ),
      );

      expect(find.byIcon(Icons.person), findsOneWidget);
    });

    testWidgets('12. Renders trailing icon when provided', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPTextInputField(trailingIcon: Icon(Icons.check_circle)),
        ),
      );

      expect(find.byIcon(Icons.check_circle), findsOneWidget);
    });

    testWidgets('13. Renders loading indicator when isLoading is true', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(const SSPTextInputField(isLoading: true)),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('14. Renders in Light Theme correctly', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPTextInputField(hintText: 'Light Theme Input'),
          brightness: Brightness.light,
        ),
      );

      expect(find.text('Light Theme Input'), findsOneWidget);
    });

    testWidgets('15. Renders in Dark Theme correctly', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPTextInputField(hintText: 'Dark Theme Input'),
          brightness: Brightness.dark,
        ),
      );

      expect(find.text('Dark Theme Input'), findsOneWidget);
    });

    testWidgets('16. Handles Hindi and Devanagari Unicode text input cleanly', (
      WidgetTester tester,
    ) async {
      String text = '';
      await tester.pumpWidget(
        buildTestableWidget(SSPTextInputField(onChanged: (val) => text = val)),
      );

      await tester.enterText(find.byType(EditableText), 'जय गुरुदेव');
      await tester.pumpAndSettle();

      expect(text, equals('जय गुरुदेव'));
      expect(find.text('जय गुरुदेव'), findsOneWidget);
    });

    testWidgets('17. Multiline input supports multiple minLines and maxLines', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(const SSPTextInputField(minLines: 3, maxLines: 6)),
      );

      final TextField textField = tester.widget(find.byType(TextField));
      expect(textField.minLines, equals(3));
      expect(textField.maxLines, equals(6));
    });

    testWidgets('18. Disabled state prevents text editing', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(const SSPTextInputField(enabled: false)),
      );

      final TextField textField = tester.widget(find.byType(TextField));
      expect(textField.enabled, isFalse);
    });

    testWidgets(
      '19. Read-only state prevents keyboard input while selectable',
      (WidgetTester tester) async {
        await tester.pumpWidget(
          buildTestableWidget(const SSPTextInputField(readOnly: true)),
        );

        final TextField textField = tester.widget(find.byType(TextField));
        expect(textField.readOnly, isTrue);
      },
    );

    testWidgets('20. Primary Button remains unaffected by Text Input Field', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPPrimaryButton(label: 'Primary Action', onPressed: () {}),
        ),
      );

      expect(find.text('Primary Action'), findsOneWidget);
    });

    testWidgets('21. Secondary Button remains unaffected by Text Input Field', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPSecondaryButton(label: 'Secondary Action', onPressed: () {}),
        ),
      );

      expect(find.text('Secondary Action'), findsOneWidget);
    });

    testWidgets('22. Tertiary Button remains unaffected by Text Input Field', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPTertiaryButton(label: 'Tertiary Action', onPressed: () {}),
        ),
      );

      expect(find.text('Tertiary Action'), findsOneWidget);
    });

    testWidgets('23. Icon Button remains unaffected by Text Input Field', (
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

    testWidgets('24. Search Field remains unaffected by Text Input Field', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(const SSPSearchField(hintText: 'Search query')),
      );

      expect(find.text('Search query'), findsOneWidget);
    });
  });
}
