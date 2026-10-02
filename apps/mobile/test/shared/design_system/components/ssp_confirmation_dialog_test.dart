import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_confirmation_dialog.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_tertiary_button.dart';
import 'package:santmat_satsang_prachar/shared/design_system/tokens/colors/ssp_colors.dart';
import 'package:santmat_satsang_prachar/shared/design_system/tokens/icons/ssp_icons.dart';
import 'package:santmat_satsang_prachar/shared/design_system/tokens/spacing/ssp_spacing.dart';

void main() {
  Widget buildTestableWidget(
    Widget child, {
    Brightness brightness = Brightness.light,
  }) {
    return MaterialApp(
      theme: ThemeData(brightness: brightness),
      home: Scaffold(body: Center(child: child)),
    );
  }

  group('SSPConfirmationDialog Widget Tests', () {
    testWidgets('1. Renders title and message', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPConfirmationDialog(
            title: 'Delete?',
            message: 'Are you sure?',
            onConfirm: () {},
            onCancel: () {},
          ),
        ),
      );

      expect(find.text('Delete?'), findsOneWidget);
      expect(find.text('Are you sure?'), findsOneWidget);
    });

    testWidgets('2. Renders correctly in dark theme', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPConfirmationDialog(title: 'Delete?', message: 'Are you sure?'),
          brightness: Brightness.dark,
        ),
      );

      final AlertDialog dialog = tester.widget<AlertDialog>(
        find.byType(AlertDialog),
      );
      expect(dialog.backgroundColor, SSPColors.darkSurface);

      final Icon icon = tester.widget<Icon>(find.byIcon(SSPIcons.info));
      expect(icon.color, SSPColors.darkPrimary);
      expect(find.text('Delete?'), findsOneWidget);
    });

    testWidgets('3. Renders default action labels', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPConfirmationDialog(title: 'Delete?', message: 'Are you sure?'),
        ),
      );

      expect(find.text('Cancel'), findsOneWidget);
      expect(find.text('Confirm'), findsOneWidget);
      expect(find.byType(SSPTertiaryButton), findsOneWidget);
    });

    testWidgets(
      '4. Renders default info icon header at 32px in primary color',
      (WidgetTester tester) async {
        await tester.pumpWidget(
          buildTestableWidget(
            SSPConfirmationDialog(title: 'Delete?', message: 'Are you sure?'),
          ),
        );

        final Icon icon = tester.widget<Icon>(find.byIcon(SSPIcons.info));
        expect(icon.size, 32);
        expect(icon.color, SSPColors.lightPrimary);
      },
    );

    testWidgets(
      '5. Destructive dialog uses warning icon, error icon color and error confirm',
      (WidgetTester tester) async {
        await tester.pumpWidget(
          buildTestableWidget(
            SSPConfirmationDialog(
              title: 'Delete?',
              message: 'Are you sure?',
              isDestructive: true,
            ),
          ),
        );

        final Icon icon = tester.widget<Icon>(find.byIcon(SSPIcons.warning));
        expect(icon.size, 32);
        expect(icon.color, SSPColors.error);

        final Material confirmMaterial = tester.widget<Material>(
          find
              .ancestor(
                of: find.text('Confirm'),
                matching: find.byType(Material),
              )
              .first,
        );
        expect(confirmMaterial.color, SSPColors.error);
      },
    );

    testWidgets('6. Custom icon is rendered', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPConfirmationDialog(
            title: 'Delete?',
            message: 'Are you sure?',
            icon: Icons.delete_rounded,
          ),
        ),
      );

      expect(find.byIcon(Icons.delete_rounded), findsOneWidget);
      expect(find.byIcon(SSPIcons.info), findsNothing);
    });

    testWidgets('7. Custom confirm and cancel labels are rendered', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPConfirmationDialog(
            title: 'Delete?',
            message: 'Are you sure?',
            confirmLabel: 'Delete Forever',
            cancelLabel: 'Keep It',
          ),
        ),
      );

      expect(find.text('Delete Forever'), findsOneWidget);
      expect(find.text('Keep It'), findsOneWidget);
      expect(find.text('Confirm'), findsNothing);
      expect(find.text('Cancel'), findsNothing);
    });

    testWidgets('8. Long message wraps without layout overflow', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPConfirmationDialog(
            title: 'Delete?',
            message:
                'Are you sure you want to delete this item? This action cannot be '
                'undone and all associated data, including saved progress, notes and '
                'favorites, will be permanently removed from your device and from the '
                'server after this action is confirmed.',
          ),
        ),
      );

      expect(find.textContaining('permanently removed'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });

    testWidgets('9. Renders Unicode (Hindi) message and title', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPConfirmationDialog(
            title: 'पुष्टि करें',
            message: 'क्या आप सुनिश्चित हैं?',
            isDestructive: true,
          ),
        ),
      );

      expect(find.text('पुष्टि करें'), findsOneWidget);
      expect(find.text('क्या आप सुनिश्चित हैं?'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });

    testWidgets('10. Scales with large text without overflow', (
      WidgetTester tester,
    ) async {
      tester.platformDispatcher.textScaleFactorTestValue = 2.0;
      addTearDown(tester.platformDispatcher.clearTextScaleFactorTestValue);

      await tester.pumpWidget(
        buildTestableWidget(
          SSPConfirmationDialog(
            title: 'Delete all saved satsang recordings?',
            message:
                'This action permanently removes every recording from your '
                'library. Please confirm that you want to continue.',
            isDestructive: true,
          ),
        ),
      );

      expect(find.text('Confirm'), findsOneWidget);
      expect(find.text('Cancel'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });

    testWidgets('11. Actions meet the 48dp minimum touch target height', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPConfirmationDialog(title: 'Delete?', message: 'Are you sure?'),
        ),
      );

      final Size confirmSize = tester.getSize(find.byType(InkWell));
      expect(
        confirmSize.height,
        greaterThanOrEqualTo(SSPSpacing.minTouchTarget),
      );

      final Size cancelSize = tester.getSize(find.byType(SSPTertiaryButton));
      expect(
        cancelSize.height,
        greaterThanOrEqualTo(SSPSpacing.minTouchTarget),
      );
    });

    testWidgets('12. Exposes button semantics on both actions', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPConfirmationDialog(
            title: 'Delete?',
            message: 'Are you sure?',
            onConfirm: () {},
            onCancel: () {},
          ),
        ),
      );

      final Semantics confirmSemantics = tester.widget<Semantics>(
        find.byWidgetPredicate(
          (Widget w) => w is Semantics && w.properties.label == 'Confirm',
        ),
      );
      expect(confirmSemantics.properties.button, isTrue);
      expect(confirmSemantics.properties.enabled, isTrue);

      final Semantics cancelSemantics = tester.widget<Semantics>(
        find.byWidgetPredicate(
          (Widget w) => w is Semantics && w.properties.label == 'Cancel',
        ),
      );
      expect(cancelSemantics.properties.button, isTrue);
      expect(cancelSemantics.properties.enabled, isTrue);
    });
  });

  group('SSPConfirmationDialog.show() Navigation Tests', () {
    testWidgets('13. show() returns true when confirm is pressed', (
      WidgetTester tester,
    ) async {
      bool? result;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (BuildContext context) => TextButton(
                onPressed: () async {
                  result = await SSPConfirmationDialog.show(
                    context,
                    title: 'Delete?',
                    message: 'Are you sure?',
                  );
                },
                child: const Text('open'),
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.text('open'));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Confirm'));
      await tester.pumpAndSettle();

      expect(result, isTrue);
      expect(find.byType(SSPConfirmationDialog), findsNothing);
    });

    testWidgets('14. show() returns false when cancel is pressed', (
      WidgetTester tester,
    ) async {
      bool? result;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (BuildContext context) => TextButton(
                onPressed: () async {
                  result = await SSPConfirmationDialog.show(
                    context,
                    title: 'Delete?',
                    message: 'Are you sure?',
                  );
                },
                child: const Text('open'),
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.text('open'));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Cancel'));
      await tester.pumpAndSettle();

      expect(result, isFalse);
      expect(find.byType(SSPConfirmationDialog), findsNothing);
    });

    testWidgets('15. show() returns null when dismissed by barrier tap', (
      WidgetTester tester,
    ) async {
      bool? result;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (BuildContext context) => TextButton(
                onPressed: () async {
                  result = await SSPConfirmationDialog.show(
                    context,
                    title: 'Delete?',
                    message: 'Are you sure?',
                  );
                },
                child: const Text('open'),
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.text('open'));
      await tester.pumpAndSettle();

      await tester.tapAt(const Offset(10, 10));
      await tester.pumpAndSettle();

      expect(result, isNull);
      expect(find.byType(SSPConfirmationDialog), findsNothing);
    });

    testWidgets('16. onConfirm and onCancel callbacks are invoked', (
      WidgetTester tester,
    ) async {
      bool confirmed = false;
      bool cancelled = false;

      Future<void> pumpWithCallbacks() async {
        await tester.pumpWidget(
          MaterialApp(
            home: Scaffold(
              body: Builder(
                builder: (BuildContext context) => TextButton(
                  onPressed: () {
                    showDialog<bool>(
                      context: context,
                      builder: (BuildContext dialogContext) =>
                          SSPConfirmationDialog(
                            title: 'Delete?',
                            message: 'Are you sure?',
                            onConfirm: () => confirmed = true,
                            onCancel: () => cancelled = true,
                          ),
                    );
                  },
                  child: const Text('open'),
                ),
              ),
            ),
          ),
        );
        await tester.tap(find.text('open'));
        await tester.pumpAndSettle();
      }

      await pumpWithCallbacks();
      await tester.tap(find.text('Confirm'));
      await tester.pumpAndSettle();
      expect(confirmed, isTrue);
      expect(cancelled, isFalse);

      await pumpWithCallbacks();
      await tester.tap(find.text('Cancel'));
      await tester.pumpAndSettle();
      expect(cancelled, isTrue);
    });
  });
}
