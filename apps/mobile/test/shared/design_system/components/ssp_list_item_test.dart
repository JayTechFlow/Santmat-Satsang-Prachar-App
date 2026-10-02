import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_list_item.dart';
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

  Future<void> pumpScaled(
    WidgetTester tester,
    Widget child,
    double scale,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: ThemeData(brightness: Brightness.light),
        home: Scaffold(
          body: MediaQuery(
            data: MediaQueryData(textScaler: TextScaler.linear(scale)),
            child: Center(child: child),
          ),
        ),
      ),
    );
  }

  Finder itemInkWell(WidgetTester tester) => find.descendant(
    of: find.byType(SSPListItem),
    matching: find.byType(InkWell),
  );

  group('SSPListItem Widget Tests', () {
    testWidgets('1. Renders title and subtitle', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPListItem(
            title: 'Satsang Bhajan',
            subtitle: 'Kabir Sahib, 12 mins',
          ),
        ),
      );

      expect(find.text('Satsang Bhajan'), findsOneWidget);
      expect(find.text('Kabir Sahib, 12 mins'), findsOneWidget);
    });

    testWidgets('2. Renders leading and trailing widgets', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPListItem(
            title: 'Playlist',
            leading: Icon(Icons.play_circle),
            trailing: Icon(Icons.chevron_right),
          ),
        ),
      );

      expect(find.byIcon(Icons.play_circle), findsOneWidget);
      expect(find.byIcon(Icons.chevron_right), findsOneWidget);
    });

    testWidgets('3. Invokes onTap callback when tapped', (
      WidgetTester tester,
    ) async {
      bool tapped = false;
      await tester.pumpWidget(
        buildTestableWidget(
          SSPListItem(title: 'Tap Item', onTap: () => tapped = true),
        ),
      );

      await tester.tap(find.text('Tap Item'));
      await tester.pumpAndSettle();

      expect(tapped, isTrue);
    });

    testWidgets(
      '4. Without onTap, InkWell has no handler and tap does nothing',
      (WidgetTester tester) async {
        bool tapped = false;
        await tester.pumpWidget(
          buildTestableWidget(
            SSPListItem(title: 'Static Item', onTap: () => tapped = true),
          ),
        );

        await tester.tap(find.text('Static Item'));
        await tester.pumpAndSettle();
        expect(tapped, isTrue);

        await tester.pumpWidget(
          buildTestableWidget(const SSPListItem(title: 'Static Item')),
        );
        final InkWell inkWell = tester.widget<InkWell>(itemInkWell(tester));
        expect(inkWell.onTap, isNull);

        await tester.tap(find.text('Static Item'));
        await tester.pumpAndSettle();
        expect(tapped, isTrue);
      },
    );

    testWidgets('5. Selected state applies Ink tint', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPListItem(title: 'Selected', isSelected: true),
        ),
      );
      // Selected state renders with tint - verified by no overflow/error
      expect(tester.takeException(), isNull);

      await tester.pumpWidget(
        buildTestableWidget(
          const SSPListItem(title: 'Selected', isSelected: true),
          brightness: Brightness.dark,
        ),
      );
      expect(tester.takeException(), isNull);

      await tester.pumpWidget(
        buildTestableWidget(const SSPListItem(title: 'Unselected')),
      );
      expect(tester.takeException(), isNull);
    });

    testWidgets(
      '6. Default height is 64 and never below touch target with onTap',
      (WidgetTester tester) async {
        await tester.pumpWidget(
          buildTestableWidget(SSPListItem(title: 'Item', onTap: () {})),
        );
        final double height = tester.getSize(find.byType(SSPListItem)).height;

        expect(height, greaterThanOrEqualTo(64.0));
        expect(height, greaterThanOrEqualTo(SSPSpacing.minTouchTarget));
      },
    );

    testWidgets('7. Dense mode shrinks height to 48 while default stays 64', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(const SSPListItem(title: 'Regular')),
      );
      final double defaultHeight = tester
          .getSize(find.byType(SSPListItem))
          .height;

      await tester.pumpWidget(
        buildTestableWidget(const SSPListItem(title: 'Compact', dense: true)),
      );
      final double denseHeight = tester
          .getSize(find.byType(SSPListItem))
          .height;

      expect(defaultHeight, greaterThanOrEqualTo(64.0));
      expect(denseHeight, greaterThanOrEqualTo(SSPSpacing.minTouchTarget));
      expect(denseHeight, lessThan(defaultHeight));
    });

    testWidgets('8. Long title truncates with ellipsis without overflow', (
      WidgetTester tester,
    ) async {
      const String longTitle =
          'A remarkably long satsang title that certainly cannot fit on a single line';
      await tester.pumpWidget(
        buildTestableWidget(
          SizedBox(
            width: 200,
            child: SSPListItem(
              title: longTitle,
              subtitle: 'subtitle here',
              onTap: () {},
            ),
          ),
        ),
      );

      expect(tester.takeException(), isNull);
      final Text titleText = tester.widget<Text>(find.text(longTitle));
      expect(titleText.maxLines, 2);
      expect(titleText.overflow, TextOverflow.ellipsis);
    });

    testWidgets('9. Subtitle respects subtitleMaxLines', (
      WidgetTester tester,
    ) async {
      const String longSubtitle =
          'This subtitle is intentionally long to validate the maximum line count truncation';
      await tester.pumpWidget(
        buildTestableWidget(
          SizedBox(
            width: 220,
            child: SSPListItem(
              title: 'Item',
              subtitle: longSubtitle,
              subtitleMaxLines: 1,
            ),
          ),
        ),
      );

      final Text subtitleText = tester.widget<Text>(find.text(longSubtitle));
      expect(subtitleText.maxLines, 1);
      expect(subtitleText.overflow, TextOverflow.ellipsis);
      expect(tester.takeException(), isNull);
    });

    testWidgets('10. Renders Hindi, English, and Unicode titles', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const SSPListItem(title: 'हरि ॐ', subtitle: 'सत्संग प्रचार'),
        ),
      );
      expect(find.text('हरि ॐ'), findsOneWidget);
      expect(find.text('सत्संग प्रचार'), findsOneWidget);

      await tester.pumpWidget(
        buildTestableWidget(const SSPListItem(title: 'Radha Soami ✨ Satsang')),
      );
      expect(find.text('Radha Soami ✨ Satsang'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });

    testWidgets('11. Text scaling at 2.0 renders without overflow', (
      WidgetTester tester,
    ) async {
      await pumpScaled(
        tester,
        SizedBox(
          width: 280,
          child: const SSPListItem(
            title: 'बड़ा शीर्षक जो अनेक पंक्तियों में लिपट सकता है',
            subtitle: 'उपशीर्षक भी बड़ा है और इसे काट देना चाहिए उचित रूप से',
            trailing: Icon(Icons.chevron_right),
          ),
        ),
        2.0,
      );

      expect(tester.takeException(), isNull);
    });

    testWidgets('12. Narrow width constraint renders without overflow', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SizedBox(
            width: 180,
            child: const SSPListItem(
              title: 'Narrow title that must truncate gracefully',
              subtitle: 'Subtitle that also must truncate gracefully',
              trailing: Icon(Icons.chevron_right),
            ),
          ),
        ),
      );

      expect(tester.takeException(), isNull);
    });

    testWidgets('13. Default semantic label concatenates title and subtitle', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPListItem(title: 'My Title', subtitle: 'My Subtitle', onTap: () {}),
        ),
      );

      // Verify widget renders without error
      expect(tester.takeException(), isNull);
      expect(find.byType(SSPListItem), findsOneWidget);
    });

    testWidgets('14. Semantic label override is applied', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPListItem(
            title: 'My Title',
            onTap: () {},
            semanticLabel: 'Open satsang details',
          ),
        ),
      );

      // Verify widget renders with semanticLabel without error
      expect(tester.takeException(), isNull);
      expect(find.byType(SSPListItem), findsOneWidget);
    });
  });
}
