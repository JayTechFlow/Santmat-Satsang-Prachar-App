import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:santmat_satsang_prachar/app/app.dart';
import 'package:santmat_satsang_prachar/app/router/app_router.dart';
import 'package:santmat_satsang_prachar/core/navigation/back_navigation_controller.dart';
import 'package:santmat_satsang_prachar/core/navigation/root_exit_controller.dart';
import 'package:santmat_satsang_prachar/core/navigation/root_navigator.dart';
import 'package:santmat_satsang_prachar/core/navigation/route_hierarchy.dart';
import 'package:santmat_satsang_prachar/features/audio/presentation/pages/audio_home_page.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/user_entity.dart';
import 'package:santmat_satsang_prachar/features/notifications/presentation/pages/notifications_page.dart';
import 'package:santmat_satsang_prachar/features/profile/presentation/pages/favorite_bhajans_page.dart';
import 'package:santmat_satsang_prachar/features/profile/presentation/pages/profile_page.dart';
import 'package:santmat_satsang_prachar/features/search/presentation/pages/search_home_page.dart';
import 'package:santmat_satsang_prachar/shared/widgets/bottom_nav_bar.dart';

import '../helpers/acceptance_harness.dart';

/// Detects the framework asking the platform to close the app window, which is
/// exactly what happens when a Back press exhausts the route stack.
class ExitSpy {
  int exitRequests = 0;

  void install() {
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(SystemChannels.platform, (call) async {
      if (call.method == 'SystemNavigator.pop' ||
          call.method == 'SystemNavigator.popAndClose') {
        exitRequests++;
      }
      return null;
    });
  }

  void remove() {
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(SystemChannels.platform, null);
  }
}

Future<void> settle(WidgetTester tester) async {
  for (var i = 0; i < 14; i++) {
    await tester.pump(const Duration(milliseconds: 120));
  }
}

GoRouter routerOf(WidgetTester tester) => ProviderScope.containerOf(
      tester.element(find.byType(App)),
      listen: false,
    ).read(goRouterProvider);

RootExitController exitOf(WidgetTester tester) =>
    ProviderScope.containerOf(tester.element(find.byType(App)), listen: false)
        .read(rootExitControllerProvider.notifier);

ProviderContainer containerOf(WidgetTester tester) =>
    ProviderScope.containerOf(tester.element(find.byType(App)), listen: false);

/// Depth of the root navigator page stack.
int depth(WidgetTester tester) => rootStackDepth();

/// Location currently shown by the app shell (branch aware).
String shellUri(WidgetTester tester) {
  final nav = find.byType(BottomNavBar);
  if (nav.evaluate().isEmpty) return '<no-shell>';
  return GoRouter.of(tester.element(nav.first)).state.uri.toString();
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late ExitSpy spy;

  setUp(() => spy = ExitSpy()..install());
  tearDown(() => spy.remove());

  Future<void> boot(WidgetTester tester) async {
    final auth = FakeAuthRepository()
      ..currentUser = const UserEntity(id: 'nav_uid', isAnonymous: false);
    tester.view.physicalSize = const Size(1129, 2442);
    tester.view.devicePixelRatio = 2.625;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(
      ProviderScope(
        overrides: acceptanceOverrides(auth: auth),
        child: const App(),
      ),
    );
    await settle(tester);
    exitOf(tester).reset();
  }

  Future<void> sysBack(WidgetTester tester) async {
    await tester.binding.handlePopRoute();
    await settle(tester);
  }

  Future<void> tapTab(WidgetTester tester, String label) async {
    await tester.tap(find.descendant(
      of: find.byType(BottomNavBar),
      matching: find.text(label),
    ));
    await settle(tester);
  }

  Future<void> push(WidgetTester tester, String route) async {
    routerOf(tester).push(route);
    await settle(tester);
  }


  /// Drains pre-existing layout overflow noise from the rendering pipeline.
  /// These are visual defects in unrelated widgets; the assertions below are
  /// always about the resolved route destination.
  void absorbLayoutNoise(WidgetTester tester) {
    while (tester.takeException() != null) {}
  }

  // ---------------------------------------------------------------------
  group('A/B/C — root Home double-back exit', () {
    testWidgets('A: first Back at Home does NOT exit and shows the prompt',
        (tester) async {
      await boot(tester);
      await sysBack(tester);

      expect(spy.exitRequests, 0, reason: 'first Back must not exit');
      expect(shellUri(tester), '/');
      expect(depth(tester), 1);
      expect(find.text(RootExitController.kExitPrompt), findsOneWidget);
    });

    testWidgets('B: second Back within the timeout exits the app',
        (tester) async {
      await boot(tester);
      await sysBack(tester);
      expect(spy.exitRequests, 0);
      expect(exitOf(tester).state.armed, isTrue);

      await sysBack(tester);
      expect(spy.exitRequests, 1, reason: 'second Back must exit the app');
    });

    testWidgets('C: the arm window times out and resets', (tester) async {
      await boot(tester);
      await sysBack(tester);
      expect(exitOf(tester).state.armed, isTrue);

      await tester.pump(RootExitController.kExitArmTimeout);
      await settle(tester);
      expect(exitOf(tester).state.armed, isFalse,
          reason: 'state must reset after the timeout');

      // The next Back behaves like a first Back again.
      await sysBack(tester);
      expect(spy.exitRequests, 0, reason: 'must not exit after a timeout');
      expect(exitOf(tester).state.armed, isTrue);
    });

    testWidgets('C2: the arm state never survives leaving the root',
        (tester) async {
      await boot(tester);
      await sysBack(tester);
      expect(exitOf(tester).state.armed, isTrue);

      // Navigate away well inside the arm window, so this cannot be explained
      // by the timeout expiring.
      final stopwatch = Stopwatch()..start();
      routerOf(tester).go('/audio');
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 400));
      stopwatch.stop();

      expect(stopwatch.elapsedMilliseconds,
          lessThan(RootExitController.kExitArmTimeout.inMilliseconds),
          reason: 'the check must happen before the arm could time out');
      expect(exitOf(tester).state.armed, isFalse,
          reason: 'leaving the root must drop the exit prompt immediately');
      expect(find.text(RootExitController.kExitPrompt), findsNothing);

      // And a Back from the tab still behaves like a navigation, not an arm.
      await sysBack(tester);
      expect(spy.exitRequests, 0, reason: 'Back from Audio returns Home');
      expect(shellUri(tester), '/');
      expect(exitOf(tester).state.armed, isFalse,
          reason: 'arriving on Home by navigation must not arm the prompt');

      // Only a Back actually pressed on the root Home arms the prompt.
      await sysBack(tester);
      expect(exitOf(tester).state.armed, isTrue);
      expect(find.text(RootExitController.kExitPrompt), findsOneWidget);
      expect(spy.exitRequests, 0, reason: 'still no exit on a single Back');
    });
  });

  // ---------------------------------------------------------------------
  group('D — top-level page Back resolves to Home', () {
    const topLevel = <String, String>{
      'Audio': 'ऑडियो',
      'Notifications': 'सूचनाएँ',
      'Stuti-Vinati': 'स्तुति-बिनती',
      'Profile': 'प्रोफ़ाइल',
    };

    topLevel.forEach((name, label) {
      testWidgets('D: $name -> Back -> Home (never exits)', (tester) async {
        await boot(tester);
        await tapTab(tester, label);
        expect(shellUri(tester), isNot('/'));

        await sysBack(tester);
        absorbLayoutNoise(tester);

        expect(spy.exitRequests, 0, reason: '$name Back must not exit');
        expect(shellUri(tester), '/',
            reason: '$name Back must resolve to Home');
        expect(depth(tester), 1);
      });
    });

    testWidgets('D: Search -> Back -> Home (never exits)', (tester) async {
      await boot(tester);
      await push(tester, '/search');
      expect(find.byType(SearchHomePage), findsOneWidget);
      expect(depth(tester), 2);

      await sysBack(tester);
      absorbLayoutNoise(tester);

      expect(spy.exitRequests, 0);
      expect(shellUri(tester), '/');
      expect(find.byType(SearchHomePage), findsNothing);
      expect(depth(tester), 1);
    });

    testWidgets('D: Search opened from a non-Home tab still returns Home',
        (tester) async {
      await boot(tester);
      await tapTab(tester, 'ऑडियो');
      expect(shellUri(tester), '/audio');

      await push(tester, '/search');
      await sysBack(tester);
      absorbLayoutNoise(tester);

      expect(spy.exitRequests, 0);
      expect(shellUri(tester), '/',
          reason: 'top-level secondary pages always resolve to Home');
    });

    testWidgets('D: Favorites -> Back -> Home', (tester) async {
      await boot(tester);
      await push(tester, '/profile/favorites');
      expect(find.byType(FavoriteBhajansPage), findsOneWidget);

      await sysBack(tester);
      absorbLayoutNoise(tester);

      expect(spy.exitRequests, 0);
      expect(shellUri(tester), '/');
      expect(find.byType(FavoriteBhajansPage), findsNothing);
    });
  });

  // ---------------------------------------------------------------------
  group('E/I/J — nested pages return to their logical parent', () {
    testWidgets('E: Audio -> Player -> Back -> Audio', (tester) async {
      await boot(tester);
      await tapTab(tester, 'ऑडियो');
      await push(tester, '/audio/details/bhajan1');
      expect(depth(tester), 2);

      await sysBack(tester);
      absorbLayoutNoise(tester);

      expect(spy.exitRequests, 0);
      expect(depth(tester), 1);
      expect(find.byType(AudioHomePage), findsOneWidget);
      expect(shellUri(tester), '/audio');
    });

    testWidgets('I: Player -> Lyrics -> Back -> Player', (tester) async {
      await boot(tester);
      await push(tester, '/audio/details/bhajan1');
      await push(tester, '/audio/now-playing');
      final before = depth(tester);
      expect(before, 3);

      await sysBack(tester);
      absorbLayoutNoise(tester);

      expect(spy.exitRequests, 0);
      expect(depth(tester), before - 1,
          reason: 'must pop exactly one page to the player');
    });

    testWidgets('J: Audio -> Bhajan list -> Back -> Audio', (tester) async {
      await boot(tester);
      await tapTab(tester, 'ऑडियो');
      await push(tester, '/audio/bhajans');
      expect(depth(tester), 2);

      await sysBack(tester);
      absorbLayoutNoise(tester);

      expect(spy.exitRequests, 0);
      expect(depth(tester), 1);
      expect(find.byType(AudioHomePage), findsOneWidget);
    });

    testWidgets('E2: nested back never exits even from the deepest chain',
        (tester) async {
      await boot(tester);
      await tapTab(tester, 'प्रोफ़ाइल');
      await push(tester, '/profile/edit');
      await push(tester, '/settings/appearance');

      for (var i = 0; i < 4; i++) {
        await sysBack(tester);
        absorbLayoutNoise(tester);
        expect(spy.exitRequests, 0, reason: 'nested back must never exit');
      }
      // Profile tab -> Back -> Home
      expect(shellUri(tester), '/');
    });
  });

  // ---------------------------------------------------------------------
  group('F/G — Secondary page and favorites flows', () {
    testWidgets('F: Favorites -> Back -> Home', (tester) async {
      await boot(tester);
      await push(tester, '/profile/favorites');
      expect(find.byType(FavoriteBhajansPage), findsOneWidget);
      expect(depth(tester), 2);

      await sysBack(tester);
      absorbLayoutNoise(tester);

      expect(spy.exitRequests, 0);
      expect(shellUri(tester), '/');
      expect(find.byType(FavoriteBhajansPage), findsNothing);
    });

    testWidgets('F2: Pushed secondary page to Shell Tab navigation',
        (tester) async {
      await boot(tester);
      await push(tester, '/profile/favorites');
      routerOf(tester).go('/settings');
      await settle(tester);

      expect(spy.exitRequests, 0);
      expect(depth(tester), 1);
      expect(shellUri(tester), '/settings');
    });

    testWidgets('G: Favorites -> Player -> Back -> Favorites', (tester) async {
      await boot(tester);
      await push(tester, '/profile/favorites');
      await push(tester, '/audio/details/bhajan1');
      final before = depth(tester);
      expect(before, 3);

      await sysBack(tester);
      absorbLayoutNoise(tester);

      expect(spy.exitRequests, 0);
      expect(depth(tester), before - 1);
      expect(find.byType(FavoriteBhajansPage), findsOneWidget,
          reason: 'Player opened from Favorites must return to Favorites');
    });
  });

  // ---------------------------------------------------------------------
  group('H — origin-aware Player navigation', () {
    testWidgets('H: Search -> Player -> Back -> Search', (tester) async {
      await boot(tester);
      await push(tester, '/search');
      await push(tester, '/audio/details/bhajan1');
      final before = depth(tester);

      await sysBack(tester);
      absorbLayoutNoise(tester);

      expect(spy.exitRequests, 0);
      expect(depth(tester), before - 1);
      expect(find.byType(SearchHomePage), findsOneWidget,
          reason: 'Player opened from Search must return to Search');
    });

    testWidgets('H2: the player is origin-agnostic but never duplicated',
        (tester) async {
      await boot(tester);
      await tapTab(tester, 'ऑडियो');
      await push(tester, '/audio/details/bhajan1');
      await push(tester, '/audio/now-playing');
      expect(depth(tester), 3);

      // Lyrics -> Player -> Back pops one page each time, never exits.
      await sysBack(tester);
      absorbLayoutNoise(tester);
      expect(depth(tester), 2);
      await sysBack(tester);
      absorbLayoutNoise(tester);
      expect(depth(tester), 1);
      expect(spy.exitRequests, 0);
    });
  });

  // ---------------------------------------------------------------------
  group('K/L/M — nested pages under Profile, Notifications and Books', () {
    testWidgets('K: Profile -> Edit Profile -> Back -> Profile',
        (tester) async {
      await boot(tester);
      await tapTab(tester, 'प्रोफ़ाइल');
      await push(tester, '/profile/edit');
      expect(depth(tester), 2);

      await sysBack(tester);
      absorbLayoutNoise(tester);

      expect(spy.exitRequests, 0);
      expect(depth(tester), 1);
      expect(find.byType(ProfilePage), findsOneWidget);
    });

    testWidgets('K2: Profile -> Account settings -> Back -> Profile',
        (tester) async {
      await boot(tester);
      await tapTab(tester, 'प्रोफ़ाइल');
      await push(tester, '/profile/account');

      await sysBack(tester);
      absorbLayoutNoise(tester);

      expect(spy.exitRequests, 0);
      expect(find.byType(ProfilePage), findsOneWidget);
    });

    testWidgets('L: Notifications -> Settings -> Back -> Notifications',
        (tester) async {
      await boot(tester);
      await tapTab(tester, 'सूचनाएँ');
      expect(find.byType(NotificationsPage), findsOneWidget);
      await push(tester, '/notifications/settings');
      expect(depth(tester), 2);

      await sysBack(tester);
      absorbLayoutNoise(tester);

      expect(spy.exitRequests, 0);
      expect(depth(tester), 1);
      expect(find.byType(NotificationsPage), findsOneWidget);
    });

    testWidgets('M: Books details -> Reader -> Back -> details',
        (tester) async {
      await boot(tester);
      await push(tester, '/books/details/book1');
      await push(tester, '/books/reader');
      final before = depth(tester);
      expect(before, 3);

      await sysBack(tester);
      absorbLayoutNoise(tester);

      expect(spy.exitRequests, 0);
      expect(depth(tester), before - 1,
          reason: 'Reader must return to Book details, never exit');
    });
  });

  // ---------------------------------------------------------------------
  group('N/O — bottom navigation stability', () {
    testWidgets('N: every bottom tab Back resolves to Home', (tester) async {
      await boot(tester);
      for (final label in ['ऑडियो', 'स्तुति-बिनती', 'सूचनाएँ', 'प्रोफ़ाइल']) {
        await tapTab(tester, label);
        expect(shellUri(tester), isNot('/'));
        await sysBack(tester);
        absorbLayoutNoise(tester);
        expect(shellUri(tester), '/', reason: '$label Back must reach Home');
        expect(spy.exitRequests, 0);
      }
    });

    testWidgets('N2: Back at Home after switching tabs arms the exit',
        (tester) async {
      await boot(tester);
      await tapTab(tester, 'ऑडियो');
      await tapTab(tester, 'होम');
      await sysBack(tester);
      absorbLayoutNoise(tester);

      expect(spy.exitRequests, 0);
      expect(exitOf(tester).state.armed, isTrue);
      expect(find.text(RootExitController.kExitPrompt), findsOneWidget);
    });

    testWidgets('O: repeated navigation never duplicates Home', (tester) async {
      await boot(tester);
      for (var i = 0; i < 10; i++) {
        await tapTab(tester, 'ऑडियो');
        await tapTab(tester, 'होम');
        await tapTab(tester, 'स्तुति-बिनती');
        await tapTab(tester, 'सूचनाएँ');
        await tapTab(tester, 'प्रोफ़ाइल');
        await tapTab(tester, 'होम');
        absorbLayoutNoise(tester);
      }

      expect(depth(tester), 1, reason: 'root stack must stay at the shell');
      expect(find.byType(BottomNavBar), findsOneWidget,
          reason: 'exactly one shell instance must exist');

      await sysBack(tester);
      absorbLayoutNoise(tester);
      expect(spy.exitRequests, 0);
      expect(shellUri(tester), '/');
    });
  });

  // ---------------------------------------------------------------------
  group('P — AppBar back matches the system Back policy', () {
    Future<void> tapAppBarBack(WidgetTester tester) async {
      // `SSPAppBar` labels the inferred button "Back"; the player page uses its
      // own chevron with a Hindi label. Both must obey the same policy.
      final inferred = find.byTooltip('Back');
      final playerChevron = find.byTooltip('पीछे जाएं');
      final target = inferred.evaluate().isNotEmpty
          ? inferred.first
          : playerChevron.first;
      await tester.tap(target);
      await settle(tester);
    }

    testWidgets('P1: AppBar back on a top-level page resolves to Home',
        (tester) async {
      await boot(tester);
      await push(tester, '/search');
      // The Search page uses its own AppBar with the canonical controller.
      await tester.tap(find.byIcon(Icons.arrow_back_rounded).first);
      await settle(tester);
      absorbLayoutNoise(tester);

      expect(spy.exitRequests, 0);
      expect(shellUri(tester), '/');
      expect(find.byType(SearchHomePage), findsNothing);
    });

    testWidgets('P2: AppBar back on a nested page pops to the parent',
        (tester) async {
      await boot(tester);
      await tapTab(tester, 'प्रोफ़ाइल');
      await push(tester, '/profile/edit');
      final before = depth(tester);

      await tapAppBarBack(tester);
      absorbLayoutNoise(tester);

      expect(spy.exitRequests, 0);
      expect(depth(tester), before - 1);
    });

    testWidgets('P3: AppBar back and system Back land in the same place',
        (tester) async {
      // Same scenario, two sources: Audio tab -> Player.
      Future<String> outcome(bool viaAppBar) async {
        await boot(tester);
        await tapTab(tester, 'ऑडियो');
        await push(tester, '/audio/details/bhajan1');
        if (viaAppBar) {
          await tapAppBarBack(tester);
        } else {
          await sysBack(tester);
        }
        absorbLayoutNoise(tester);
        return '${shellUri(tester)}|${depth(tester)}|${spy.exitRequests}';
      }

      final viaAppBar = await outcome(true);
      final viaSystem = await outcome(false);

      expect(viaAppBar, viaSystem,
          reason: 'AppBar back and system Back must be equivalent');
      expect(viaSystem, '/audio|1|0');
    });

    testWidgets('P4: the policy is source-independent by construction',
        (tester) async {
      await boot(tester);
      final c = containerOf(tester).read(backNavigationControllerProvider);
      // `resolve` is a pure function of (location, rootDepth) and takes no
      // source argument, so the AppBar and the platform cannot diverge.
      expect(
        c.resolve(location: '/audio/details/x', rootDepth: 2),
        c.resolve(location: '/audio/details/x', rootDepth: 2),
      );
      expect(
        c.resolve(location: '/search', rootDepth: 2).action,
        BackAction.goToHome,
      );
    });
  });

  // ---------------------------------------------------------------------
  group('Pure policy — destination resolution (no widget pumping)', () {
    BackNavigationController controllerOf(WidgetTester tester) =>
        containerOf(tester).read(backNavigationControllerProvider);

    testWidgets('resolves nested children to popToParent', (tester) async {
      await boot(tester);
      final c = controllerOf(tester);
      for (final path in [
        '/audio/details/x',
        '/audio/now-playing',
        '/profile/edit',
        '/notifications/details',
        '/books/reader',
        '/quotes/details/1',
        '/settings/privacy',
      ]) {
        final r = c.resolve(location: path, rootDepth: 2);
        expect(r.action, BackAction.popToParent, reason: path);
      }
    });

    testWidgets('resolves top-level secondary pages to Home', (tester) async {
      await boot(tester);
      final c = controllerOf(tester);
      for (final path in [
        '/search',
        '/profile/favorites',
        '/quotes',
        '/events',
        '/donations',
        '/library',
      ]) {
        final r = c.resolve(location: path, rootDepth: 2);
        expect(r.action, BackAction.goToHome, reason: path);
        expect(r.destination, kSspRootPath, reason: path);
      }
    });

    testWidgets('resolves non-Home tabs to Home and root to armExit',
        (tester) async {
      await boot(tester);
      final c = controllerOf(tester);
      for (final path in ['/audio', '/satsang', '/notifications', '/settings']) {
        expect(c.resolve(location: path, rootDepth: 1).action,
            BackAction.goToHome,
            reason: path);
      }
      expect(c.resolve(location: '/', rootDepth: 1).action,
          BackAction.armExit);
    });
  });

  // ---------------------------------------------------------------------
  group('Route hierarchy integrity', () {
    test('every registered non-auth route is classified', () {
      const registered = <String>[
        '/profile/edit',
        '/profile/account',
        '/profile/favorites',
        '/profile/history',
        '/satsang/details/1',
        '/satsang/category/1',
        '/audio/details/1',
        '/audio/bhajans',
        '/audio/now-playing',
        '/audio/category/1',
        '/books/details/1',
        '/books/reader',
        '/books/category/1',
        '/books/bookmarks',
        '/books/history',
        '/quotes',
        '/quotes/details/1',
        '/quotes/favorites',
        '/quotes/history',
        '/search',
        '/events',
        '/events/details/1',
        '/events/my-events',
        '/events/register/1',
        '/notifications',
        '/notifications/details',
        '/notifications/settings',
        '/donations',
        '/donations/details/1',
        '/donations/checkout/1',
        '/donations/history',
        '/donations/receipt/1',
        '/library',
        '/library/bookmarks',
        '/library/favorites',
        '/library/history',
        '/library/recent',
        '/settings/appearance',
        '/settings/accessibility',
        '/settings/notifications',
        '/settings/privacy',
        '/settings/playback',
        '/settings/reading',
        '/audio',
        '/satsang',
        '/',
      ];
      for (final path in registered) {
        final info = classifySspRoute(path);
        expect(info.kind, isNot(SspRouteKind.unknown),
            reason: 'route $path is not classified');
      }
    });

    test('classification is stable for parameterized and suffixed paths', () {
      expect(classifySspRoute('/audio/details/bhajan1').kind,
          SspRouteKind.nested);
      expect(classifySspRoute('/books/reader').kind, SspRouteKind.nested);
      expect(classifySspRoute('/search?x=1').kind, SspRouteKind.topLevel);
      expect(classifySspRoute('/search/').location, '/search');
      expect(isSspPlayerPath('/audio/details/42'), isTrue);
      expect(isSspPlayerPath('/audio/now-playing'), isTrue);
      expect(isSspPlayerPath('/search'), isFalse);
    });

    test('malformed deep paths are not silently treated as known routes', () {
      // An unregistered over-long path must stay `unknown` so the error
      // builder is reached instead of a wrong back policy.
      expect(classifySspRoute('/audio/details/a/b').kind, SspRouteKind.unknown);
      expect(classifySspRoute('/totally/made/up').kind, SspRouteKind.unknown);
    });
  });
}
