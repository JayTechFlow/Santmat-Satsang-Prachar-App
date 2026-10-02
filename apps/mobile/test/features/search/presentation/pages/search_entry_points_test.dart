import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';
import 'package:santmat_satsang_prachar/core/navigation/back_navigation_controller.dart';
import 'package:santmat_satsang_prachar/features/home/presentation/widgets/home_search_bar.dart';
import 'package:santmat_satsang_prachar/features/search/domain/entities/search_category_definition.dart';
import 'package:santmat_satsang_prachar/features/search/presentation/pages/search_home_page.dart';
import 'package:santmat_satsang_prachar/features/search/presentation/providers/search_providers.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_audio_tile.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_icon_button.dart';

import 'package:santmat_satsang_prachar/core/navigation/route_hierarchy.dart';

import '../../../../helpers/mock_search_data_source.dart';

class _TestBackNavController extends BackNavigationController {
  final VoidCallback onBack;

  _TestBackNavController(super.ref, {required this.onBack});

  @override
  Future<BackResolution> handleBack(
    BuildContext context, {
    BackSource source = BackSource.system,
  }) async {
    onBack();
    context.go('/');
    return BackResolution(
      action: BackAction.goToHome,
      destination: '/',
      kind: SspRouteKind.topLevel,
      location: '/search',
      rootDepth: 2,
    );
  }
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  Future<void> settle(WidgetTester tester) async {
    for (var i = 0; i < 12; i++) {
      await tester.pump(const Duration(milliseconds: 120));
    }
  }

  group('P & Q — Search Entry Points and Navigation', () {
    testWidgets('P1: Home Search Bar navigates to canonical /search with default "सभी भजन"',
        (tester) async {
      tester.view.physicalSize = const Size(1129, 2442);
      tester.view.devicePixelRatio = 2.625;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final router = GoRouter(
        initialLocation: '/',
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => const Scaffold(
              body: SafeArea(
                child: Padding(
                  padding: EdgeInsets.all(16.0),
                  child: HomeSearchBar(),
                ),
              ),
            ),
          ),
          GoRoute(
            path: '/search',
            builder: (context, state) => const SearchHomePage(),
          ),
        ],
      );

      final container = ProviderContainer(
        overrides: [
          searchDataSourceProvider.overrideWithValue(
            MockSearchDataSource(latency: Duration.zero),
          ),
        ],
      );
      addTearDown(container.dispose);

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: MaterialApp.router(
            routerConfig: router,
          ),
        ),
      );
      await settle(tester);

      expect(find.byType(HomeSearchBar), findsOneWidget);

      // Tap the Home search bar
      await tester.tap(find.byType(HomeSearchBar));
      await settle(tester);

      // Verify we navigated to /search and SearchHomePage is rendered
      expect(find.byType(SearchHomePage), findsOneWidget);
      expect(router.state.uri.toString(), '/search');

      // Verify default state
      final searchState = container.read(searchProvider);
      expect(searchState.selectedCategory, SearchCategoryId.allBhajan);
      expect(searchState.query, '');
      expect(find.widgetWithText(FilterChip, 'सभी भजन'), findsOneWidget);
      final defaultChip = tester.widget<FilterChip>(
        find.widgetWithText(FilterChip, 'सभी भजन'),
      );
      expect(defaultChip.selected, isTrue);

      // Verify results are populated with all published songs
      expect(find.byType(SSPAudioTile), findsNWidgets(6));
    });

    testWidgets('P2: Audio Search action navigates to canonical /search with default "सभी भजन"',
        (tester) async {
      tester.view.physicalSize = const Size(1129, 2442);
      tester.view.devicePixelRatio = 2.625;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final router = GoRouter(
        initialLocation: '/audio',
        routes: [
          GoRoute(
            path: '/audio',
            builder: (context, state) => Scaffold(
              appBar: AppBar(
                title: const Text('Audio'),
                actions: [
                  IconButton(
                    icon: const Icon(Icons.search_rounded),
                    tooltip: 'खोजें',
                    onPressed: () => context.push('/search'),
                  ),
                ],
              ),
            ),
          ),
          GoRoute(
            path: '/search',
            builder: (context, state) => const SearchHomePage(),
          ),
        ],
      );

      final container = ProviderContainer(
        overrides: [
          searchDataSourceProvider.overrideWithValue(
            MockSearchDataSource(latency: Duration.zero),
          ),
        ],
      );
      addTearDown(container.dispose);

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: MaterialApp.router(
            routerConfig: router,
          ),
        ),
      );
      await settle(tester);

      expect(find.byTooltip('खोजें'), findsOneWidget);

      // Tap search icon button in Audio header
      await tester.tap(find.byTooltip('खोजें'));
      await settle(tester);

      // Verify we navigated to /search and SearchHomePage is displayed
      expect(find.byType(SearchHomePage), findsOneWidget);
      expect(router.state.uri.toString(), '/search');

      // Verify default category is "सभी भजन"
      final searchState = container.read(searchProvider);
      expect(searchState.selectedCategory, SearchCategoryId.allBhajan);
      expect(find.widgetWithText(FilterChip, 'सभी भजन'), findsOneWidget);
      expect(
        tester.widget<FilterChip>(find.widgetWithText(FilterChip, 'सभी भजन')).selected,
        isTrue,
      );
      expect(find.byType(SSPAudioTile), findsNWidgets(6));
    });

    testWidgets('Q: Canonical Search back button invokes backNavigationController',
        (tester) async {
      tester.view.physicalSize = const Size(1129, 2442);
      tester.view.devicePixelRatio = 2.625;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      bool backHandled = false;

      final router = GoRouter(
        initialLocation: '/search',
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => const Scaffold(body: Text('Home')),
          ),
          GoRoute(
            path: '/search',
            builder: (context, state) => const SearchHomePage(),
          ),
        ],
      );

      final container = ProviderContainer(
        overrides: [
          searchDataSourceProvider.overrideWithValue(
            MockSearchDataSource(latency: Duration.zero),
          ),
          backNavigationControllerProvider.overrideWith(
            (ref) => _TestBackNavController(
              ref,
              onBack: () => backHandled = true,
            ),
          ),
        ],
      );
      addTearDown(container.dispose);

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: MaterialApp.router(
            routerConfig: router,
          ),
        ),
      );
      await settle(tester);

      expect(find.byType(SearchHomePage), findsOneWidget);

      // Tap the back button
      final backButton = find.widgetWithIcon(SSPIconButton, Icons.arrow_back_rounded);
      expect(backButton, findsOneWidget);
      await tester.tap(backButton);
      await settle(tester);

      expect(backHandled, isTrue);
      expect(find.text('Home'), findsOneWidget);
    });
  });
}
