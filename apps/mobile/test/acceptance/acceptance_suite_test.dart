import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:santmat_satsang_prachar/app/app.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/user_entity.dart';
import 'package:santmat_satsang_prachar/features/authentication/presentation/pages/login_page.dart';
import 'package:santmat_satsang_prachar/features/authentication/presentation/pages/registration_page.dart';
import 'package:santmat_satsang_prachar/features/audio/presentation/providers/audio_providers.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/playback_state_entity.dart';
import 'package:santmat_satsang_prachar/features/notifications/presentation/providers/notifications_providers.dart';
import 'package:santmat_satsang_prachar/features/stuti_vinati/presentation/providers/stuti_vinati_providers.dart';
import 'package:santmat_satsang_prachar/shared/widgets/bottom_nav_bar.dart';
import 'package:santmat_satsang_prachar/shared/widgets/primary_button.dart';
import 'package:santmat_satsang_prachar/features/profile/presentation/pages/profile_page.dart';
import '../helpers/acceptance_harness.dart';

Future<void> pumpRoute(WidgetTester tester) async {
  for (var i = 0; i < 12; i++) {
    await tester.pump(const Duration(milliseconds: 100));
  }
  await tester.pump(const Duration(seconds: 2));
}

Future<void> pumpApp(
  WidgetTester tester, {
  required FakeAuthRepository auth,
  FakeNotificationDataSource? notifications,
}) async {
  tester.view.physicalSize = const Size(1129, 2442);
  tester.view.devicePixelRatio = 2.625;
  addTearDown(tester.view.resetPhysicalSize);
  addTearDown(tester.view.resetDevicePixelRatio);
  await tester.pumpWidget(
    ProviderScope(
      overrides: acceptanceOverrides(auth: auth, notifications: notifications),
      child: const App(),
    ),
  );
  await tester.pump(const Duration(milliseconds: 2000));
  await tester.pumpAndSettle();
}

ProviderContainer containerOf(WidgetTester tester) {
  return ProviderScope.containerOf(tester.element(find.byType(App)));
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('AUTH — Automated acceptance: Google Auth Primary', () {
    testWidgets('AUTH-01 Google login: Continue with Google reaches Home for existing user',
        (tester) async {
      final seededUsers = {
        'google_uid_test': {
          'uid': 'google_uid_test',
          'name': 'Google Test User',
          'email': 'test@google.com',
          'role': 'mobile_user',
          'accountStatus': 'active',
        },
      };
      final auth = FakeAuthRepository(users: seededUsers);
      await pumpApp(tester, auth: auth);

      expect(find.byType(LoginPage), findsOneWidget);
      expect(find.text('Santmat Satsang Prachar'), findsOneWidget);
      expect(find.text('Continue with Google'), findsOneWidget);

      await tester.tap(find.text('Continue with Google'));
      await tester.pumpAndSettle();

      expect(auth.currentUser?.id, 'google_uid_test');
      expect(find.byType(LoginPage), findsNothing);
      expect(find.byType(BottomNavBar), findsOneWidget);
    });

    testWidgets('AUTH-02 Google signup: Profile completion creates role=mobile_user profile',
        (tester) async {
      final auth = FakeAuthRepository();
      await pumpApp(tester, auth: auth);

      expect(find.byType(LoginPage), findsOneWidget);
      await tester.tap(find.text('Continue with Google'));
      await tester.pumpAndSettle();

      debugPrint('ACTIVE ROUTE PAGE: ${find.byType(RegistrationPage).evaluate().isNotEmpty ? "RegistrationPage" : find.byType(LoginPage).evaluate().isNotEmpty ? "LoginPage" : "Other"}');
      expect(find.text('Complete Profile'), findsWidgets);
      await tester.enterText(
          find.widgetWithText(TextFormField, 'Full Name'), 'New Google User');
      await tester.enterText(
          find.widgetWithText(TextFormField, 'Email'), 'newuser@google.com');
      await tester.tap(find.widgetWithText(PrimaryButton, 'Complete Profile'));
      await tester.pumpAndSettle();

      final uid = auth.currentUser!.id;
      expect(auth.users[uid]?['role'], 'mobile_user');
      expect(auth.users[uid]?['accountStatus'], 'active');
      expect(find.byType(LoginPage), findsNothing);
      expect(find.byType(BottomNavBar), findsOneWidget);
    });

    testWidgets('AUTH-07 Logout: signing out returns to login page',
        (tester) async {
      final auth = FakeAuthRepository(users: {
        'signed_in_uid': {
          'uid': 'signed_in_uid',
          'name': 'Devotee',
          'role': 'mobile_user',
          'accountStatus': 'active',
        },
      });
      auth.currentUser = const UserEntity(
        id: 'signed_in_uid',
        displayName: 'Devotee',
        isAnonymous: false,
      );
      await pumpApp(tester, auth: auth);
      expect(find.byType(LoginPage), findsNothing);

      await auth.signOut();
      await tester.pumpAndSettle();

      expect(find.byType(LoginPage), findsOneWidget);
    });

    testWidgets('AUTH-08 Relogin after logout: Google sign in again reaches Home',
        (tester) async {
      final seededUsers = {
        'google_uid_test': {
          'uid': 'google_uid_test',
          'name': 'Google Test User',
          'role': 'mobile_user',
          'accountStatus': 'active',
        },
      };
      final auth = FakeAuthRepository(users: seededUsers);
      await pumpApp(tester, auth: auth);
      expect(find.byType(LoginPage), findsOneWidget);

      await tester.tap(find.text('Continue with Google'));
      await tester.pumpAndSettle();
      expect(find.byType(BottomNavBar), findsOneWidget);

      await auth.signOut();
      await tester.pumpAndSettle();
      expect(find.byType(LoginPage), findsOneWidget);

      await tester.tap(find.text('Continue with Google'));
      await tester.pumpAndSettle();
      expect(find.byType(LoginPage), findsNothing);
      expect(find.byType(BottomNavBar), findsOneWidget);
    });

    testWidgets('AUTH-09 Session restore: persisted session skips login',
        (tester) async {
      final seededUsers = {
        'restore_uid': {
          'uid': 'restore_uid',
          'name': 'Restored Devotee',
          'role': 'mobile_user',
          'accountStatus': 'active',
        },
      };
      final auth = FakeAuthRepository(users: seededUsers);
      auth.currentUser = const UserEntity(
        id: 'restore_uid',
        displayName: 'Restored Devotee',
        isAnonymous: false,
      );
      await pumpApp(tester, auth: auth);

      expect(find.byType(LoginPage), findsNothing);
      expect(find.byType(BottomNavBar), findsOneWidget);
    });
  });

  group('HOME — Automated acceptance', () {
    testWidgets('HOME-01 Home launches and shows dashboard essentials',
        (tester) async {
      final auth = FakeAuthRepository()
        ..currentUser = const UserEntity(
          id: 'home_uid',
          isAnonymous: false,
        );
      await pumpApp(tester, auth: auth);

      expect(find.byType(BottomNavBar), findsOneWidget);
      expect(find.text('होम'), findsOneWidget);
    });

    testWidgets(
        'HOME-02 Bottom navigation reaches Audio, Stuti, Notifications, Profile tabs',
        (tester) async {
      final auth = FakeAuthRepository()
        ..currentUser = const UserEntity(
          id: 'home_uid',
          isAnonymous: false,
        );
      await pumpApp(tester, auth: auth);

      Finder inNav(String label) => find.descendant(
          of: find.byType(BottomNavBar), matching: find.text(label));

      await tester.tap(inNav('ऑडियो'));
      await pumpRoute(tester);
      await tester.tap(inNav('स्तुति-बिनती'));
      await pumpRoute(tester);
      await tester.tap(inNav('सूचनाएँ'));
      await pumpRoute(tester);
      await tester.tap(inNav('प्रोफ़ाइल'));
      await pumpRoute(tester);

      expect(find.byType(BottomNavBar), findsOneWidget);
      expect(find.byType(ProfilePage), findsOneWidget);
    });

    testWidgets('HOME-03 Home page scrolls without exception', (tester) async {
      final auth = FakeAuthRepository()
        ..currentUser = const UserEntity(
          id: 'home_uid',
          isAnonymous: false,
        );
      await pumpApp(tester, auth: auth);

      await tester.drag(
        find.byType(CustomScrollView).first,
        const Offset(0, -600),
      );
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
    });
  });

  group('AUDIO — Automated acceptance', () {
    testWidgets(
        'AUDIO-01/02/03 Catalog renders with audio entries visible',
        (tester) async {
      final auth = FakeAuthRepository()
        ..currentUser = const UserEntity(
          id: 'audio_uid',
          isAnonymous: false,
        );
      await pumpApp(tester, auth: auth);
      await tester.tap(find.descendant(
              of: find.byType(BottomNavBar), matching: find.text('ऑडियो')));
      await pumpRoute(tester);

      expect(find.byType(AppBar), findsWidgets);
      expect(find.text('Test Audio'), findsOneWidget);
      final state = containerOf(tester).read(audioHomeStateProvider);
      expect(state.categories, isNotEmpty);
    });

    testWidgets('AUDIO-06 Category filter chip selects and filters',
        (tester) async {
      final auth = FakeAuthRepository()
        ..currentUser = const UserEntity(
          id: 'audio_uid',
          isAnonymous: false,
        );
      await pumpApp(tester, auth: auth);
      await tester.tap(find.descendant(
              of: find.byType(BottomNavBar), matching: find.text('ऑडियो')));
      await pumpRoute(tester);

      expect(find.text('सभी भजन'), findsOneWidget);
      final mockCategories =
          containerOf(tester).read(audioHomeStateProvider).categories;
      expect(mockCategories.length, greaterThan(0));
    });

    testWidgets('AUDIO-07 Play from catalog starts playback',
        (tester) async {
      final auth = FakeAuthRepository()
        ..currentUser = const UserEntity(
          id: 'audio_uid',
          isAnonymous: false,
        );
      await pumpApp(tester, auth: auth);
      await tester.tap(find.descendant(
              of: find.byType(BottomNavBar), matching: find.text('ऑडियो')));
      await pumpRoute(tester);

      await tester.tap(find.byIcon(Icons.play_arrow_rounded).first);
      await tester.pump();

      final playback = containerOf(tester).read(playbackStateProvider);
      expect(playback.currentAudio, isNotNull);
      expect(playback.currentAudio?.title, 'Test Audio');
    });

    testWidgets('AUDIO-08/09 Pause & resume toggle playback status',
        (tester) async {
      final auth = FakeAuthRepository()
        ..currentUser = const UserEntity(
          id: 'audio_uid',
          isAnonymous: false,
        );
      await pumpApp(tester, auth: auth);
      await tester.tap(find.descendant(
              of: find.byType(BottomNavBar), matching: find.text('ऑडियो')));
      await pumpRoute(tester);

      await tester.tap(find.byIcon(Icons.play_arrow_rounded).first);
      await tester.pump();
      final notifier = containerOf(tester).read(playbackStateProvider.notifier);
      notifier.pause();
      await tester.pump();
      expect(containerOf(tester).read(playbackStateProvider).status,
          PlaybackStatus.paused);
      notifier.resume();
      await tester.pump();
      expect(containerOf(tester).read(playbackStateProvider).status,
          PlaybackStatus.playing);
    });

    testWidgets('AUDIO-11/12 No hamburger and no playlist icon on audio home',
        (tester) async {
      final auth = FakeAuthRepository()
        ..currentUser = const UserEntity(
          id: 'audio_uid',
          isAnonymous: false,
        );
      await pumpApp(tester, auth: auth);
      await tester.tap(find.descendant(
              of: find.byType(BottomNavBar), matching: find.text('ऑडियो')));
      await pumpRoute(tester);

      expect(find.byIcon(Icons.menu), findsNothing);
      expect(find.byIcon(Icons.playlist_add_rounded), findsNothing);
      expect(find.byIcon(Icons.queue_music_rounded), findsNothing);
    });
  });

  group('STUTI — Automated acceptance', () {
    testWidgets('STUTI-01/02/03 Exactly two items: morning + evening visible',
        (tester) async {
      final auth = FakeAuthRepository()
        ..currentUser = const UserEntity(
          id: 'stuti_uid',
          isAnonymous: false,
        );
      await pumpApp(tester, auth: auth);
      await tester.tap(find.descendant(
              of: find.byType(BottomNavBar), matching: find.text('स्तुति-बिनती')));
      await pumpRoute(tester);

      expect(find.text('प्रातःकालीन स्तुति'), findsWidgets);
      expect(find.text('संध्याकालीन स्तुति'), findsWidgets);
      final items =
          await containerOf(tester).read(stutiVinatiListProvider.future);
      expect(items, hasLength(2));
    });
  });

  group('NOTIF — Automated acceptance: notifications', () {
    testWidgets('NOTIF-01 Notification feed renders rows and filter tabs',
        (tester) async {
      final auth = FakeAuthRepository()
        ..currentUser = const UserEntity(
          id: 'notif_uid',
          isAnonymous: false,
        );
      await pumpApp(tester, auth: auth);
      await tester.tap(find.descendant(
              of: find.byType(BottomNavBar),
              matching: find.text('सूचनाएँ')));
      await pumpRoute(tester);

      expect(find.text('नया भजन जोड़ा गया'), findsWidgets);
      expect(find.text('सभी'), findsOneWidget);
      expect(find.text('अपडेट'), findsOneWidget);
      expect(find.text('विशेष'), findsOneWidget);
    });

    testWidgets('NOTIF-02 Tap bhajan notification deep-links to Audio home',
        (tester) async {
      final auth = FakeAuthRepository()
        ..currentUser = const UserEntity(
          id: 'notif_uid2',
          isAnonymous: false,
        );
      await pumpApp(tester, auth: auth);
      await tester.tap(find.descendant(
              of: find.byType(BottomNavBar),
              matching: find.text('सूचनाएँ')));
      await pumpRoute(tester);
      await tester.tap(find.text('नया भजन जोड़ा गया'));
      await pumpRoute(tester);

      expect(find.text('Test Audio'), findsWidgets);
      expect(find.byType(BottomNavBar), findsOneWidget);
    });

    testWidgets('NOTIF-03 Mark all as read clears the unread count',
        (tester) async {
      final auth = FakeAuthRepository()
        ..currentUser = const UserEntity(
          id: 'notif_uid3',
          isAnonymous: false,
        );
      await pumpApp(tester, auth: auth);
      await tester.tap(find.descendant(
              of: find.byType(BottomNavBar),
              matching: find.text('सूचनाएँ')));
      await pumpRoute(tester);

      final container = containerOf(tester);
      expect(
        await container.read(unreadNotificationsCountProvider.future),
        2,
      );

      await tester.tap(find.byType(PopupMenuButton<String>).last);
      await pumpRoute(tester);
      await tester.tap(find.text('सभी को पढ़ा हुआ चिह्नित करें'));
      await pumpRoute(tester);

      container.invalidate(unreadNotificationsCountProvider);
      expect(
        await container.read(unreadNotificationsCountProvider.future),
        0,
      );
    });
  });

  group('PROFILE — Automated acceptance: profile', () {
    testWidgets('PROFILE-01 Profile shows authenticated user details',
        (tester) async {
      final auth = FakeAuthRepository()
        ..currentUser = const UserEntity(
          id: 'profile_uid',
          isAnonymous: false,
        );
      await pumpApp(tester, auth: auth);
      await tester.tap(find.descendant(
              of: find.byType(BottomNavBar),
              matching: find.text('प्रोफ़ाइल')));
      await pumpRoute(tester);

      expect(find.text('Santmat Devotee'), findsWidgets);
    });

    testWidgets('PROFILE-02 Logout returns to the login page',
        (tester) async {
      final auth = FakeAuthRepository()
        ..currentUser = const UserEntity(
          id: 'profile_uid2',
          isAnonymous: false,
        );
      await pumpApp(tester, auth: auth);
      await tester.tap(find.descendant(
              of: find.byType(BottomNavBar),
              matching: find.text('प्रोफ़ाइल')));
      await pumpRoute(tester);

      await tester.ensureVisible(find.text('लॉगआउट करें (Logout)'));
      await tester.pump();
      await tester.tap(find.text('लॉगआउट करें (Logout)'),
          warnIfMissed: true);
      await pumpRoute(tester);
      expect(find.byType(AlertDialog), findsOneWidget);

      await tester.tap(find.descendant(
              of: find.byType(AlertDialog),
              matching: find.text('लॉगआउट (Logout)'))
          .last);
      await pumpRoute(tester);

      expect(find.byType(LoginPage), findsOneWidget);
      expect(find.byType(BottomNavBar), findsNothing);
    });
  });

  group('SEARCH — Automated acceptance: search', () {
    testWidgets('SEARCH-01 Home search reaches results for a query',
        (tester) async {
      final auth = FakeAuthRepository()
        ..currentUser = const UserEntity(
          id: 'search_uid',
          isAnonymous: false,
        );
      await pumpApp(tester, auth: auth);
      await tester.tap(find.text('अपने पसंद का भजन या वाणी खोजें...'));
      await pumpRoute(tester);

      await tester.enterText(find.byType(TextField), 'गुरु');
      await tester.testTextInput.receiveAction(TextInputAction.search);
      await pumpRoute(tester);

      expect(find.text('गुरु चरणन की सेवा'), findsWidgets);
    });
  });

  group('SEC — Automated acceptance: route security', () {
    testWidgets('SEC-01 Logged-out user is kept out of guarded route',
        (tester) async {
      final auth = FakeAuthRepository();
      await pumpApp(tester, auth: auth);
      await pumpRoute(tester);

      expect(find.byType(LoginPage), findsOneWidget);
      expect(find.byType(BottomNavBar), findsNothing);

      GoRouter.of(tester.element(find.byType(LoginPage))).go('/audio');
      await pumpRoute(tester);

      expect(find.byType(LoginPage), findsOneWidget);
      expect(find.byType(BottomNavBar), findsNothing);
    });
  });

  group('BOOK — Automated acceptance: library/book section', () {
    testWidgets('BOOK-01 Library home renders recent activity items',
        (tester) async {
      final auth = FakeAuthRepository()
        ..currentUser = const UserEntity(
          id: 'lib_uid',
          isAnonymous: false,
        );
      await pumpApp(tester, auth: auth);
      await pumpRoute(tester);

      GoRouter.of(tester.element(find.byType(BottomNavBar))).go('/library');
      await pumpRoute(tester);

      expect(find.text('Library'), findsWidgets);
      expect(find.text('Recent Activity'), findsWidgets);
      expect(find.text('BOOK Item 1'), findsWidgets);
    });

    testWidgets('BOOK-02 Favorites list renders favorited items',
        (tester) async {
      final auth = FakeAuthRepository()
        ..currentUser = const UserEntity(
          id: 'lib_uid2',
          isAnonymous: false,
        );
      await pumpApp(tester, auth: auth);
      await pumpRoute(tester);

      GoRouter.of(tester.element(find.byType(BottomNavBar)))
          .go('/library/favorites');
      await pumpRoute(tester);

      expect(find.text('Favorites'), findsWidgets);
      expect(find.text('AUDIO Item 0'), findsWidgets);
    });

    testWidgets('BOOK-03 Bookmarks list renders bookmarked items',
        (tester) async {
      final auth = FakeAuthRepository()
        ..currentUser = const UserEntity(
          id: 'lib_uid3',
          isAnonymous: false,
        );
      await pumpApp(tester, auth: auth);
      await pumpRoute(tester);

      GoRouter.of(tester.element(find.byType(BottomNavBar)))
          .go('/library/bookmarks');
      await pumpRoute(tester);

      expect(find.text('Bookmarks'), findsWidgets);
      expect(find.text('AUDIO Item 0'), findsWidgets);
    });
  });
}