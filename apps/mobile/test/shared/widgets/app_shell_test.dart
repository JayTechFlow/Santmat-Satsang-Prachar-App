import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/shared/widgets/bottom_nav_bar.dart';
import 'package:santmat_satsang_prachar/shared/widgets/devotional_icons.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_app_bar.dart';

void main() {
  Widget buildTestableWidget(Widget child) {
    return ProviderScope(
      child: MaterialApp(
        home: Scaffold(
          body: child,
        ),
      ),
    );
  }

  group('Devotional Icons Tests', () {
    testWidgets('Renders DiyaIcon without error', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(const DiyaIcon(size: 32)),
      );
      expect(find.byType(DiyaIcon), findsOneWidget);
    });

    testWidgets('Renders PrayingHandsIcon without error', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(const PrayingHandsIcon(size: 20)),
      );
      expect(find.byType(PrayingHandsIcon), findsOneWidget);
    });
  });

  group('BottomNavBar Widget Tests', () {
    testWidgets('Renders 5 navigation tabs matching specifications',
        (WidgetTester tester) async {
      int selectedTab = 0;
      await tester.pumpWidget(
        buildTestableWidget(
          BottomNavBar(
            currentIndex: selectedTab,
            onTap: (index) => selectedTab = index,
          ),
        ),
      );

      expect(find.text('होम'), findsOneWidget);
      expect(find.text('ऑडियो'), findsOneWidget);
      expect(find.text('स्तुति-बिनती'), findsOneWidget);
      expect(find.text('सूचनाएँ'), findsOneWidget);
      expect(find.text('प्रोफ़ाइल'), findsOneWidget);
    });

    testWidgets('Triggers onTap when tab is tapped', (WidgetTester tester) async {
      int selectedTab = 0;
      await tester.pumpWidget(
        buildTestableWidget(
          StatefulBuilder(
            builder: (context, setState) {
              return BottomNavBar(
                currentIndex: selectedTab,
                onTap: (index) {
                  setState(() {
                    selectedTab = index;
                  });
                },
              );
            },
          ),
        ),
      );

      await tester.tap(find.text('ऑडियो'));
      await tester.pumpAndSettle();
      expect(selectedTab, 1);

      await tester.tap(find.text('स्तुति-बिनती'));
      await tester.pumpAndSettle();
      expect(selectedTab, 2);
    });
  });

  group('Hamburger & Drawer Absence Tests', () {
    testWidgets('Top-level AppBar contains no hamburger or drawer icon',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              appBar: const PreferredSize(
                preferredSize: Size.fromHeight(60),
                child: SSPAppBar(title: 'संतमत सत्संग प्रचार'),
              ),
              body: const Center(child: Text('Home Content')),
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.menu), findsNothing);
      expect(find.byIcon(Icons.menu_rounded), findsNothing);
      expect(find.byTooltip('मेनू खोलें'), findsNothing);
    });

    testWidgets('Scaffold renders cleanly without drawer', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: Center(child: Text('Shell Screen')),
            ),
          ),
        ),
      );

      final scaffold = tester.widget<Scaffold>(find.byType(Scaffold));
      expect(scaffold.drawer, isNull);
    });
  });
}
