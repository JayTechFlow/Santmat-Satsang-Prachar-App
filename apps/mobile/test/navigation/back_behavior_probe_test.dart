import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:santmat_satsang_prachar/app/app.dart';
import 'package:santmat_satsang_prachar/app/router/app_router.dart';
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';
import 'package:santmat_satsang_prachar/core/navigation/root_exit_controller.dart';
import 'package:santmat_satsang_prachar/core/navigation/root_navigator.dart';
import 'package:santmat_satsang_prachar/features/audio/presentation/pages/audio_home_page.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/user_entity.dart';
import 'package:santmat_satsang_prachar/features/profile/presentation/pages/profile_page.dart';
import 'package:santmat_satsang_prachar/shared/widgets/bottom_nav_bar.dart';

import '../helpers/acceptance_harness.dart';

/// Runtime back-behaviour probe.
///
/// `back_navigation_regression_test.dart` verifies the *route policy* — which
/// destination each Back press resolves to. This probe verifies the *runtime
/// wiring* of that policy through the real Android plumbing: the platform
/// back signal delivered over `SystemChannels.platform`, the physical Back
/// key event stream, and the actual `PopScope` registrations in the tree.
///
/// The two suites deliberately overlap on destination assertions and differ on
/// the input surface, so a regression in either the policy or its wiring is
/// caught independently.
/// Counts `SystemNavigator.pop` requests, which the framework issues when a
/// Back press exhausts the route stack.
class PlatformExitSpy {
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

int depth(WidgetTester tester) => rootStackDepth();

String shellUri(WidgetTester tester) {
  final nav = find.byType(BottomNavBar);
  if (nav.evaluate().isEmpty) return '<no-shell>';
  return GoRouter.of(tester.element(nav.first)).state.uri.toString();
}

RootExitController exitOf(WidgetTester tester) => ProviderScope.containerOf(
  tester.element(find.byType(App)),
  listen: false,
).read(rootExitControllerProvider.notifier);

GoRouter routerOf(WidgetTester tester) => ProviderScope.containerOf(
  tester.element(find.byType(App)),
  listen: false,
).read(goRouterProvider);

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late PlatformExitSpy spy;

  setUp(() => spy = PlatformExitSpy()..install());
  tearDown(() => spy.remove());

  Future<void> boot(WidgetTester tester) async {
    final auth = FakeAuthRepository()
      ..currentUser = const UserEntity(id: 'probe_uid', isAnonymous: false);
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

  /// Back delivered the way Android delivers it when the user presses the
  /// system Back button or swipes: a `popRoute` call on the platform channel.
  Future<void> platformBack(WidgetTester tester) async {
    await tester.binding.handlePopRoute();
    await settle(tester);
  }

  Future<void> tapTab(WidgetTester tester, String label) async {
    await tester.tap(
      find.descendant(
        of: find.byType(BottomNavBar),
        matching: find.text(label),
      ),
    );
    await settle(tester);
  }

  void absorbLayoutNoise(WidgetTester tester) {
    while (tester.takeException() != null) {}
  }

  group('Runtime back delivery — the platform channel is wired', () {
    testWidgets('the app registers a PopScope on the root shell', (
      tester,
    ) async {
      await boot(tester);

      // A Back press must be observable by the framework at all; if the shell
      // had no PopScope the handler would fall through to the navigator.
      expect(find.byType(BottomNavBar), findsOneWidget);
      expect(depth(tester), 1, reason: 'Home is the only root page');
    });

    testWidgets('a single platform Back never pops the root stack', (
      tester,
    ) async {
      await boot(tester);
      final before = depth(tester);

      await platformBack(tester);

      expect(spy.exitRequests, 0);
      expect(depth(tester), before);
      expect(shellUri(tester), '/');
    });

    testWidgets('the first platform Back arms the exit prompt and shows it', (
      tester,
    ) async {
      await boot(tester);

      await platformBack(tester);

      expect(find.text(RootExitController.kExitPrompt), findsOneWidget);
    });
  });

  group('Runtime back delivery — the arm window', () {
    testWidgets('a second Back inside the window requests the platform exit', (
      tester,
    ) async {
      await boot(tester);
      await platformBack(tester);
      expect(spy.exitRequests, 0, reason: 'first Back only arms');

      await platformBack(tester);

      expect(
        spy.exitRequests,
        1,
        reason: 'second Back inside the arm window must exit',
      );
    });

    testWidgets('the arm window expires and Back only re-arms afterwards', (
      tester,
    ) async {
      await boot(tester);

      await platformBack(tester);
      expect(find.text(RootExitController.kExitPrompt), findsOneWidget);

      await tester.pump(
        RootExitController.kExitArmTimeout + const Duration(milliseconds: 200),
      );
      await settle(tester);

      expect(
        find.text(RootExitController.kExitPrompt),
        findsNothing,
        reason: 'the prompt must clear once the window closes',
      );
      expect(exitOf(tester).state.armed, isFalse);

      await platformBack(tester);
      expect(
        spy.exitRequests,
        0,
        reason: 'a Back after the window re-arms instead of exiting',
      );
      expect(exitOf(tester).state.armed, isTrue);
    });

    testWidgets('leaving the root disarms the exit prompt', (tester) async {
      await boot(tester);
      await platformBack(tester);
      expect(exitOf(tester).state.armed, isTrue);

      await tapTab(tester, 'ऑडियो');
      absorbLayoutNoise(tester);
      expect(shellUri(tester), '/audio');

      expect(
        exitOf(tester).state.armed,
        isFalse,
        reason: 'arm state must not survive leaving the root',
      );
      expect(find.text(RootExitController.kExitPrompt), findsNothing);
    });
  });

  group('Runtime back delivery — top-level tabs', () {
    const tabs = <String>['ऑडियो', 'स्तुति-बिनती', 'सूचनाएँ', 'प्रोफ़ाइल'];

    for (final label in tabs) {
      testWidgets('Back on the "$label" tab resolves to Home and never exits', (
        tester,
      ) async {
        await boot(tester);
        await tapTab(tester, label);
        absorbLayoutNoise(tester);
        expect(shellUri(tester), isNot('/'), reason: 'sanity: we left Home');

        await platformBack(tester);

        expect(
          spy.exitRequests,
          0,
          reason: 'Back on a top-level tab must return Home, not exit',
        );
        expect(shellUri(tester), '/');
        absorbLayoutNoise(tester);
      });
    }
  });

  group('Runtime back delivery — nested routes pop to their parent', () {
    testWidgets('Audio -> nested page -> Back returns to Audio, not Home', (
      tester,
    ) async {
      await boot(tester);
      await tapTab(tester, 'ऑडियो');
      absorbLayoutNoise(tester);
      expect(shellUri(tester), '/audio', reason: 'sanity: on the Audio tab');

      routerOf(tester).push('/audio/bhajans');
      await settle(tester);
      expect(depth(tester), greaterThan(1), reason: 'sanity: pushed a page');
      expect(
        find.byType(AudioHomePage),
        findsNothing,
        reason: 'sanity: the nested page covers the tab',
      );

      await platformBack(tester);

      expect(spy.exitRequests, 0);
      expect(depth(tester), 1);
      absorbLayoutNoise(tester);
      expect(
        find.byType(AudioHomePage),
        findsOneWidget,
        reason: 'Back pops to the Audio tab, not out of the app',
      );
    });

    testWidgets('Profile -> nested page -> Back returns to Profile', (
      tester,
    ) async {
      await boot(tester);
      await tapTab(tester, 'प्रोफ़ाइल');
      absorbLayoutNoise(tester);
      // The Profile branch is mounted at /settings in the shell route table.
      expect(
        shellUri(tester),
        '/settings',
        reason: 'sanity: on the Profile tab',
      );

      routerOf(tester).push('/profile/edit');
      await settle(tester);
      expect(depth(tester), greaterThan(1), reason: 'sanity: pushed a page');
      expect(
        find.byType(ProfilePage),
        findsNothing,
        reason: 'sanity: the nested page covers the tab',
      );

      await platformBack(tester);

      expect(spy.exitRequests, 0);
      expect(depth(tester), 1);
      absorbLayoutNoise(tester);
      expect(
        find.byType(ProfilePage),
        findsOneWidget,
        reason: 'Back pops to the Profile tab, not out of the app',
      );
    });

    testWidgets(
      'a deep nested chain drains one level at a time and never exits',
      (tester) async {
        await boot(tester);
        await tapTab(tester, 'प्रोफ़ाइल');
        absorbLayoutNoise(tester);
        routerOf(tester).push('/profile/edit');
        await settle(tester);
        routerOf(tester).push('/books/bookmarks');
        await settle(tester);
        routerOf(tester).push('/library/recent');
        await settle(tester);
        final deep = depth(tester);
        expect(deep, greaterThanOrEqualTo(4), reason: 'sanity: deep stack');

        while (depth(tester) > 1) {
          await platformBack(tester);
          absorbLayoutNoise(tester);
          expect(
            spy.exitRequests,
            0,
            reason: 'draining a nested stack must never request app exit',
          );
        }

        expect(
          shellUri(tester),
          '/settings',
          reason: 'draining the stack lands back on the tab we started from',
        );
      },
    );
  });

  group('Runtime back delivery — stability', () {
    testWidgets('repeated Back at Home keeps re-arming instead of exiting', (
      tester,
    ) async {
      await boot(tester);

      for (var i = 0; i < 5; i++) {
        await platformBack(tester);
        await tester.pump(
          RootExitController.kExitArmTimeout +
              const Duration(milliseconds: 200),
        );
        await settle(tester);
      }

      expect(
        spy.exitRequests,
        0,
        reason: 'an expired arm must reset rather than accumulate',
      );
      expect(exitOf(tester).state.armed, isFalse);
    });

    testWidgets('Back after a logout returns to Login, never into the shell', (
      tester,
    ) async {
      final auth = FakeAuthRepository()
        ..currentUser = const UserEntity(id: 'probe_uid', isAnonymous: false);
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

      await container(tester).read(authRepositoryProvider).signOut();
      await settle(tester);
      exitOf(tester).reset();

      expect(
        find.byType(BottomNavBar),
        findsNothing,
        reason: 'sanity: the shell is gone after logout',
      );

      // Login is the root, so a Back here legitimately hands control back to
      // the platform. What must never happen is the authenticated stack coming
      // back into view.
      await platformBack(tester);

      expect(
        find.byType(BottomNavBar),
        findsNothing,
        reason: 'the authenticated shell must not be reachable after logout',
      );
      expect(find.byType(ProfilePage), findsNothing);
      expect(find.byType(AudioHomePage), findsNothing);
      expect(
        depth(tester),
        lessThanOrEqualTo(1),
        reason: 'no authenticated pages may be stacked above Login',
      );
    });
  });
}

/// Convenience accessor for the live provider container.
ProviderContainer container(WidgetTester tester) =>
    ProviderScope.containerOf(tester.element(find.byType(App)), listen: false);
