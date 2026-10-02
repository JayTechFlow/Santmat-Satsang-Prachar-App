import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';
import 'package:santmat_satsang_prachar/features/search/domain/entities/search_category_definition.dart';
import 'package:santmat_satsang_prachar/features/search/presentation/pages/search_home_page.dart';
import 'package:santmat_satsang_prachar/features/search/presentation/providers/search_providers.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_audio_tile.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_empty_state.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_error_state.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_search_field.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_loading_state.dart';

import '../../../../helpers/mock_search_data_source.dart';

/// Groups F, G, H — Search screen widget tests: the four permanent categories,
/// the default result state, and the absence of Voice Search, Search History and
/// Popular Searches.
void main() {
  Future<void> settle(WidgetTester tester) async {
    for (var i = 0; i < 12; i++) {
      await tester.pump(const Duration(milliseconds: 120));
    }
  }

  Future<ProviderContainer> pumpSearch(
    WidgetTester tester, {
    MockSearchDataSource? dataSource,
  }) async {
    tester.view.physicalSize = const Size(1129, 2442);
    tester.view.devicePixelRatio = 2.625;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    final container = ProviderContainer(
      overrides: [
        searchDataSourceProvider.overrideWithValue(
          dataSource ?? MockSearchDataSource(latency: Duration.zero),
        ),
      ],
    );
    addTearDown(container.dispose);

    await tester.pumpWidget(
      UncontrolledProviderScope(
        container: container,
        child: const MaterialApp(home: SearchHomePage()),
      ),
    );
    await settle(tester);
    return container;
  }

  Future<void> tapCategory(WidgetTester tester, String label) async {
    final finder = find.widgetWithText(FilterChip, label);
    await tester.ensureVisible(finder);
    await tester.pumpAndSettle();
    await tester.tap(finder);
    await settle(tester);
  }

  group('UI — the four permanent categories', () {
    testWidgets('renders exactly four chips, in the exact product order',
        (tester) async {
      await pumpSearch(tester);

      final chips = tester
          .widgetList<FilterChip>(find.byType(FilterChip))
          .map((chip) => (chip.label as Text).data)
          .toList();

      expect(chips, <String>[
        'सभी भजन',
        'शाही भजनवाली',
        'पदावली भजन',
        'स्वागत गीत',
      ]);
    });

    testWidgets('the row scrolls horizontally instead of overflowing',
        (tester) async {
      await pumpSearch(tester);
      final scrollable = tester.widget<Scrollable>(
        find.ancestor(
          of: find.byType(FilterChip).first,
          matching: find.byType(Scrollable),
        ).first,
      );
      expect(scrollable.axisDirection, AxisDirection.right);
      expect(tester.takeException(), isNull);
    });

    testWidgets('सभी भजन is the selected default chip', (tester) async {
      await pumpSearch(tester);
      expect(
        find.widgetWithText(FilterChip, 'सभी भजन'),
        findsOneWidget,
      );
      final chip = tester.widget<FilterChip>(
        find.widgetWithText(FilterChip, 'सभी भजन'),
      );
      expect(chip.selected, isTrue);
      expect(
        tester.widget<FilterChip>(find.widgetWithText(FilterChip, 'पदावली भजन'))
            .selected,
        isFalse,
      );
    });

    testWidgets('tapping a chip moves the selected state immediately',
        (tester) async {
      final container = await pumpSearch(tester);

      await tapCategory(tester, 'स्वागत गीत');

      expect(
        tester.widget<FilterChip>(
          find.widgetWithText(FilterChip, 'स्वागत गीत'),
        ).selected,
        isTrue,
      );
      expect(
        container.read(searchProvider).selectedCategory,
        SearchCategoryId.swagatGeet,
      );
    });
  });

  group('B — default result state shows real bhajans', () {
    testWidgets('opens with results, not an empty shell', (tester) async {
      await pumpSearch(tester);

      expect(find.byType(SSPAudioTile), findsNWidgets(6));
      expect(find.text('प्रभु से प्रीत लगाई रे'), findsOneWidget);
      expect(find.text('स्वागत गीत'), findsWidgets);
    });

    testWidgets('does not show the loading state once settled',
        (tester) async {
      await pumpSearch(tester);
      expect(find.byType(SSPLoadingState), findsNothing);
      expect(find.byType(SSPErrorState), findsNothing);
    });
  });

  group('C/D — category filtering through the UI', () {
    testWidgets('शाही भजनवाली shows only that category', (tester) async {
      await pumpSearch(tester);

      await tapCategory(tester, 'शाही भजनवाली');

      expect(find.byType(SSPAudioTile), findsNWidgets(2));
      expect(find.text('गुरु चरणन की सेवा'), findsOneWidget);
      expect(find.text('श्री गुरु सेवा कुंज'), findsOneWidget);
      expect(find.text('प्रभु से प्रीत लगाई रे'), findsNothing);
    });

    testWidgets('पदावली भजन shows only that category', (tester) async {
      await pumpSearch(tester);

      await tapCategory(tester, 'पदावली भजन');

      expect(find.byType(SSPAudioTile), findsNWidgets(2));
      expect(find.text('पदावली में गुरु चरण'), findsOneWidget);
    });

    testWidgets('स्वागत गीत shows only that category', (tester) async {
      await pumpSearch(tester);

      await tapCategory(tester, 'स्वागत गीत');

      expect(find.byType(SSPAudioTile), findsOneWidget);
    });

    testWidgets('typing a query combines with the selected category',
        (tester) async {
      await pumpSearch(tester);

      await tapCategory(tester, 'शाही भजनवाली');
      await tester.enterText(find.byType(TextField), 'गुरु');
      await settle(tester);

      expect(find.byType(SSPAudioTile), findsNWidgets(2));

      await tester.enterText(find.byType(TextField), 'कबीर');
      await settle(tester);

      // कबीर only speaks in a पदावली row, so a शाही search finds nothing.
      expect(find.byType(SSPAudioTile), findsNothing);
      expect(find.byType(SSPEmptyState), findsOneWidget);
    });

    testWidgets('a no-match query shows the design-system empty state',
        (tester) async {
      await pumpSearch(tester);

      await tester.enterText(find.byType(TextField), 'xyznonexistent123');
      await settle(tester);

      expect(find.text('कोई परिणाम नहीं मिला'), findsOneWidget);
      expect(
        find.text('"xyznonexistent123" से संबंधित कोई परिणाम नहीं मिला'),
        findsOneWidget,
      );
    });

    testWidgets('clearing the query restores the selected category',
        (tester) async {
      final container = await pumpSearch(tester);

      await tapCategory(tester, 'शाही भजनवाली');
      await tester.enterText(find.byType(TextField), 'गुरु');
      await settle(tester);

      await tester.tap(find.byIcon(Icons.clear_rounded));
      await settle(tester);

      expect(
        tester.widget<TextField>(find.byType(TextField)).controller?.text,
        '',
      );
      expect(find.byType(SSPAudioTile), findsNWidgets(2));
      expect(
        container.read(searchProvider).selectedCategory,
        SearchCategoryId.shahiBhajanavali,
      );
    });
  });

  group('F — Voice Search is completely absent', () {
    testWidgets('no microphone icon anywhere on the screen', (tester) async {
      await pumpSearch(tester);
      expect(find.byIcon(Icons.mic_rounded), findsNothing);
      expect(find.byIcon(Icons.mic_off_rounded), findsNothing);
      expect(find.byIcon(Icons.graphic_eq_rounded), findsNothing);
    });

    testWidgets('no voice-search affordance in the search field',
        (tester) async {
      await pumpSearch(tester);
      expect(find.byType(SSPSearchField), findsOneWidget);
      expect(find.bySemanticsLabel('Voice search'), findsNothing);
    });

    testWidgets('no speech UI text is reachable', (tester) async {
      await pumpSearch(tester);
      for (final text in const [
        'बोलकर खोजें',
        'सुन रहे हैं...',
        'पहचान रहे हैं...',
        'वॉइस सर्च उपलब्ध नहीं',
        'माइक्रोफोन अनुमति आवश्यक',
        'सेटिंग्स खोलें',
      ]) {
        expect(find.text(text), findsNothing, reason: text);
      }
    });

    testWidgets('a tap on the search bar never opens a bottom sheet',
        (tester) async {
      await pumpSearch(tester);
      await tester.tap(find.byType(TextField));
      await settle(tester);
      expect(find.byType(BottomSheet), findsNothing);
      expect(find.byType(Dialog), findsNothing);
    });
  });

  group('G — Search History is completely absent', () {
    testWidgets('no history section or chips are rendered', (tester) async {
      await pumpSearch(tester);
      expect(find.text('हाल की खोजें'), findsNothing);
      expect(find.text('इतिहास साफ़ करें'), findsNothing);
      expect(find.byIcon(Icons.history_rounded), findsNothing);
    });

    testWidgets('searching never surfaces a history row', (tester) async {
      await pumpSearch(tester);
      await tester.enterText(find.byType(TextField), 'गुरु');
      await settle(tester);
      expect(find.text('हाल की खोजें'), findsNothing);
      expect(find.byIcon(Icons.history_rounded), findsNothing);
    });
  });

  group('H — Popular Searches are completely absent', () {
    testWidgets('no popular section and no popular tags', (tester) async {
      await pumpSearch(tester);
      expect(find.text('लोकप्रिय खोजें'), findsNothing);
      for (final tag in const [
        'प्रभाती भजन',
        'संध्या आरती',
        'गुरु वंदना',
        'कबीर साखी',
      ]) {
        expect(find.text(tag), findsNothing, reason: tag);
      }
      expect(find.byType(ActionChip), findsNothing);
    });

    testWidgets('no fire/trending chip icon is rendered', (tester) async {
      await pumpSearch(tester);
      expect(
        find.byIcon(Icons.local_fire_department_rounded),
        findsNothing,
      );
    });
  });

  group('L — regression: existing rendering behaviour survives', () {
    testWidgets('search bar, hint, back button and clear button still render',
        (tester) async {
      await pumpSearch(tester);
      expect(find.byType(TextField), findsOneWidget);
      expect(find.text('भजन, गायक, स्तुति खोजें...'), findsOneWidget);
      expect(find.byIcon(Icons.arrow_back_rounded), findsOneWidget);
    });

    testWidgets('audio result tiles expose the canonical play/pause control',
        (tester) async {
      await pumpSearch(tester);
      final tile = tester.widget<SSPAudioTile>(find.byType(SSPAudioTile).first);
      expect(tile.title, isNotEmpty);
      expect(tile.onTap, isNotNull);
      expect(tile.onPlayPause, isNotNull);
    });
  });
}