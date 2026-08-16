import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_app_bar.dart';
import 'package:santmat_satsang_prachar/shared/design_system/tokens/colors/ssp_colors.dart';
import 'package:santmat_satsang_prachar/shared/design_system/tokens/typography/ssp_typography.dart';

void main() {
  Widget buildTestableWidget(SSPAppBar appBar, {Brightness brightness = Brightness.light}) {
    return MaterialApp(
      theme: ThemeData(brightness: brightness),
      home: Scaffold(
        appBar: appBar,
      ),
    );
  }

  Future<void> pumpPushedAppBar(WidgetTester tester, SSPAppBar appBar) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Builder(
          builder: (BuildContext context) {
            return Scaffold(
              body: Center(
                child: TextButton(
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute<void>(
                        builder: (BuildContext context) => Scaffold(appBar: appBar),
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
      '2. Defaults to a transparent background with zero elevation and honors backgroundColor override',
      (WidgetTester tester) async {
        await tester.pumpWidget(
          buildTestableWidget(const SSPAppBar(title: 'Satsang Home')),
        );

        final AppBar defaultAppBar = tester.widget<AppBar>(find.byType(AppBar));
        expect(defaultAppBar.backgroundColor, Colors.transparent);
        expect(defaultAppBar.elevation, 0);
        expect(defaultAppBar.scrolledUnderElevation, 0);

        await tester.pumpWidget(
          buildTestableWidget(
            const SSPAppBar(title: 'Satsang Home', backgroundColor: Colors.red),
          ),
        );

        final AppBar overriddenAppBar = tester.widget<AppBar>(find.byType(AppBar));
        expect(overriddenAppBar.backgroundColor, Colors.red);
      },
    );

    testWidgets('3. Reports preferredSize of kToolbarHeight', (WidgetTester tester) async {
      const SSPAppBar appBar = SSPAppBar(title: 'Satsang Home');

      expect(appBar.preferredSize, const Size.fromHeight(kToolbarHeight));
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

    testWidgets('5. Renders a subtle bottom shadow when showShadow is true', (WidgetTester tester) async {
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
    testWidgets('6. Renders a custom leading widget', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPAppBar(title: 'Satsang Home', leading: Icon(Icons.menu)),
        ),
      );

      expect(find.byIcon(Icons.menu), findsOneWidget);
    });

    testWidgets('7. Renders custom action widgets', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPAppBar(
            title: 'Satsang Home',
            actions: [Text('Action'), SizedBox(width: 12)],
          ),
        ),
      );

      expect(find.text('Action'), findsOneWidget);
      expect(find.byType(SizedBox), findsOneWidget);
    });

    testWidgets('8. Hides the inferred back button when automaticallyImplyLeading is false',
        (WidgetTester tester) async {
      await pumpPushedAppBar(
        tester,
        const SSPAppBar(title: 'Pushed Page', automaticallyImplyLeading: false),
      );

      expect(find.byType(BackButton), findsNothing);
    });

    testWidgets('9. Shows the inferred back button when the route can pop', (WidgetTester tester) async {
      await pumpPushedAppBar(
        tester,
        const SSPAppBar(title: 'Pushed Page'),
      );

      expect(find.byType(BackButton), findsOneWidget);
    });
  });

  group('SSPAppBar Styling and Typography', () {
    testWidgets('10. Applies SSPTypography.titleLarge with SSPColors.textPrimary color',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(const SSPAppBar(title: 'Satsang Home')),
      );

      final Text title = tester.widget<Text>(find.text('Satsang Home'));
      expect(title.style, isNotNull);
      expect(title.style!.fontSize, SSPTypography.titleLarge.fontSize);
      expect(title.style!.fontWeight, SSPTypography.titleLarge.fontWeight);
      expect(title.style!.color, SSPColors.lightOnSurface);
      expect(title.style!.color, SSPColors.textPrimary(tester.element(find.byType(SSPAppBar))));
      expect(title.maxLines, 1);
      expect(title.overflow, TextOverflow.ellipsis);
    });

    testWidgets('11. Uses dark-mode text color under dark brightness', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPAppBar(title: 'Satsang Home'),
          brightness: Brightness.dark,
        ),
      );

      final Text title = tester.widget<Text>(find.text('Satsang Home'));
      expect(title.style!.color, SSPColors.darkOnSurface);
      expect(title.style!.color, SSPColors.textPrimary(tester.element(find.byType(SSPAppBar))));
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
    testWidgets('14. Ellides long titles without overflow errors', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPAppBar(
            title: 'दैनिक जीवन में सच्चे संत सत्संग का महत्व The Importance of True Satsang in Daily Life',
          ),
        ),
      );

      expect(tester.takeException(), isNull);
    });

    testWidgets('15. Handles 2.0 text scaling without overflow', (WidgetTester tester) async {
      tester.platformDispatcher.textScaleFactorTestValue = 2.0;
      addTearDown(tester.platformDispatcher.clearTextScaleFactorTestValue);

      await tester.pumpWidget(
        buildTestableWidget(
          const SSPAppBar(title: 'Satsang Home'),
        ),
      );

      expect(tester.takeException(), isNull);
    });

    testWidgets('16. Exposes semanticTitle label in the semantics tree', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        buildTestableWidget(
          const SSPAppBar(title: 'सत्संग', semanticTitle: 'Satsang'),
        ),
      );

      final Finder titleSemantics = find
          .ancestor(of: find.text('सत्संग'), matching: find.byType(Semantics))
          .first;
      final SemanticsNode node = tester.getSemantics(titleSemantics);

      expect(node.label, 'Satsang');

      handle.dispose();
    });
  });
}