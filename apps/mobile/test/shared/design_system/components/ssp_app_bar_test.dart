import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_app_bar.dart';
import 'package:santmat_satsang_prachar/shared/design_system/tokens/colors/ssp_colors.dart';

void main() {
  Widget buildTestableWidget(
    SSPAppBar appBar, {
    Brightness brightness = Brightness.light,
  }) {
    return ProviderScope(
      child: MaterialApp(
        theme: ThemeData(brightness: brightness),
        home: Scaffold(appBar: appBar),
      ),
    );
  }

  Future<void> pumpPushedAppBar(WidgetTester tester, SSPAppBar appBar) async {
    await tester.pumpWidget(
      ProviderScope(
        child: MaterialApp(
          home: Builder(
            builder: (BuildContext context) {
              return Scaffold(
                body: Center(
                  child: TextButton(
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute<void>(
                          builder: (BuildContext context) =>
                              Scaffold(appBar: appBar),
                        ),
                      );
                    },
                    child: const Text('open'),
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
    await tester.tap(find.text('open'));
    await tester.pumpAndSettle();
  }

  Finder shadowStrip() {
    return find.descendant(
      of: find.byType(AppBar),
      matching: find.byWidgetPredicate(
        (Widget widget) =>
            widget is Container &&
            widget.decoration is BoxDecoration &&
            (widget.decoration! as BoxDecoration).boxShadow != null,
      ),
    );
  }

  group('SSPAppBar Rendering', () {
    testWidgets('1. Renders the title text', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(const SSPAppBar(title: 'Satsang Home')),
      );

      expect(find.text('Satsang Home'), findsOneWidget);
    });

    testWidgets(
      '2. Defaults to deep maroon background and honors backgroundColor override',
      (WidgetTester tester) async {
        await tester.pumpWidget(
          buildTestableWidget(const SSPAppBar(title: 'Satsang Home')),
        );

        final AppBar defaultAppBar = tester.widget<AppBar>(find.byType(AppBar));
        expect(defaultAppBar.backgroundColor, SSPColors.headerMaroon);
        expect(defaultAppBar.elevation, 0);
        expect(defaultAppBar.scrolledUnderElevation, 0);

        await tester.pumpWidget(
          buildTestableWidget(
            const SSPAppBar(title: 'Satsang Home', backgroundColor: Colors.red),
          ),
        );

        final AppBar overriddenAppBar = tester.widget<AppBar>(
          find.byType(AppBar),
        );
        expect(overriddenAppBar.backgroundColor, Colors.red);
      },
    );

    testWidgets('3. Reports preferredSize of height 60', (
      WidgetTester tester,
    ) async {
      const SSPAppBar appBar = SSPAppBar(title: 'Satsang Home');

      expect(appBar.preferredSize, const Size.fromHeight(60));
    });

    testWidgets('4. Respects centerTitle false', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPAppBar(title: 'Satsang Home', centerTitle: false),
        ),
      );

      final AppBar appBar = tester.widget<AppBar>(find.byType(AppBar));
      expect(appBar.centerTitle, isFalse);
    });

    testWidgets('5. Renders a subtle bottom shadow when showShadow is true', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPAppBar(title: 'Satsang Home', showShadow: true),
        ),
      );

      expect(shadowStrip(), findsOneWidget);

      await tester.pumpWidget(
        buildTestableWidget(const SSPAppBar(title: 'Satsang Home')),
      );

      expect(shadowStrip(), findsNothing);
    });
  });

  group('SSPAppBar Leading and Actions', () {
    testWidgets('6. Renders a custom leading widget', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPAppBar(title: 'Satsang Home', leading: Icon(Icons.menu)),
        ),
      );

      expect(find.byIcon(Icons.menu), findsOneWidget);
    });

    testWidgets('7. Renders custom action widgets', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPAppBar(
            title: 'Satsang Home',
            actions: [Text('Action'), SizedBox(width: 12)],
          ),
        ),
      );

      expect(
        find.byWidgetPredicate(
          (Widget widget) => widget is SizedBox && widget.width == 12.0,
        ),
        findsOneWidget,
      );
    });

    testWidgets(
      '8. Hides the inferred back button when automaticallyImplyLeading is false',
      (WidgetTester tester) async {
        await pumpPushedAppBar(
          tester,
          const SSPAppBar(
            title: 'Pushed Page',
            automaticallyImplyLeading: false,
          ),
        );

        expect(find.byType(BackButton), findsNothing);
      },
    );

    testWidgets('9. Shows the inferred back button when the route can pop', (
      WidgetTester tester,
    ) async {
      await pumpPushedAppBar(tester, const SSPAppBar(title: 'Pushed Page'));

      expect(find.byIcon(Icons.arrow_back_rounded), findsOneWidget);
    });
  });

  group('SSPAppBar Styling and Typography', () {
    testWidgets('10. Applies Mukta extra bold amber title style', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(const SSPAppBar(title: 'Satsang Home')),
      );

      final Text title = tester.widget<Text>(find.text('Satsang Home'));
      expect(title.style, isNotNull);
      expect(title.style!.fontSize, 18);
      expect(title.style!.fontWeight, FontWeight.w800);
      expect(title.style!.color, const Color(0xFFFDE68A));
      expect(title.maxLines, 1);
      expect(title.overflow, TextOverflow.ellipsis);
    });

    testWidgets('11. Uses dark-mode amber title color under dark brightness', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPAppBar(title: 'Satsang Home'),
          brightness: Brightness.dark,
        ),
      );

      final Text title = tester.widget<Text>(find.text('Satsang Home'));
      expect(title.style!.color, isNotNull);
    });
  });

  group('SSPAppBar Localization', () {
    testWidgets('12. Renders Hindi titles', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(const SSPAppBar(title: 'हरि ॐ')),
      );

      expect(find.text('हरि ॐ'), findsOneWidget);

      await tester.pumpWidget(
        buildTestableWidget(const SSPAppBar(title: 'सत्संग')),
      );

      expect(find.text('सत्संग'), findsOneWidget);
    });

    testWidgets('13. Renders Unicode titles', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(const SSPAppBar(title: 'सत्संग प्रचार 🙏 हरि ॐ')),
      );

      expect(find.text('सत्संग प्रचार 🙏 हरि ॐ'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });
  });

  group('SSPAppBar Robustness and Accessibility', () {
    testWidgets('14. Ellides long titles without overflow errors', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPAppBar(
            title:
                'दैनिक जीवन में सच्चे संत सत्संग का महत्व The Importance of True Satsang in Daily Life',
          ),
        ),
      );

      expect(tester.takeException(), isNull);
    });

    testWidgets('15. Handles 2.0 text scaling without overflow', (
      WidgetTester tester,
    ) async {
      tester.platformDispatcher.textScaleFactorTestValue = 2.0;
      addTearDown(tester.platformDispatcher.clearTextScaleFactorTestValue);

      await tester.pumpWidget(
        buildTestableWidget(const SSPAppBar(title: 'Satsang Home')),
      );

      expect(tester.takeException(), isNull);
    });

    testWidgets('16. Exposes semanticTitle label in the semantics tree', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        buildTestableWidget(
          const SSPAppBar(title: 'सत्संग', semanticTitle: 'Satsang'),
        ),
      );

      expect(find.bySemanticsLabel('Satsang'), findsOneWidget);

      handle.dispose();
    });
  });
}
