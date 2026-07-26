import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'dart:developer' as developer;

import '../../features/authentication/presentation/pages/login_page.dart';
import '../../features/authentication/presentation/pages/onboarding_page.dart';
import '../../features/authentication/presentation/pages/splash_page.dart';
import '../../features/authentication/presentation/providers/auth_state_provider.dart';
import '../../features/home/presentation/pages/home_page.dart';
import '../../features/home/presentation/pages/home_shell_page.dart';
import '../../features/profile/presentation/pages/account_settings_page.dart';
import '../../features/profile/presentation/pages/edit_profile_page.dart';
import '../../features/profile/presentation/pages/profile_page.dart';
import '../../features/satsang/presentation/pages/satsang_home_page.dart';
import '../../features/satsang/presentation/pages/satsang_details_page.dart';
import '../../features/satsang/presentation/pages/category_page.dart';
import '../../features/audio/presentation/pages/audio_home_page.dart';
import '../../features/audio/presentation/pages/audio_details_page.dart';
import '../../features/audio/presentation/pages/audio_category_page.dart';
import '../../features/books/presentation/pages/books_home_page.dart';
import '../../features/books/presentation/pages/book_details_page.dart';
import '../../features/books/presentation/pages/books_secondary_pages.dart';
import '../../features/daily_quotes/presentation/pages/daily_quotes_home_page.dart';
import '../../features/daily_quotes/presentation/pages/daily_quotes_secondary_pages.dart';
import '../../features/search/presentation/pages/search_home_page.dart';
import '../../features/events/presentation/pages/events_home_page.dart';
import '../../features/events/presentation/pages/events_secondary_pages.dart';
import '../../features/notifications/presentation/pages/notifications_page.dart';
import '../../features/notifications/presentation/pages/notification_details_page.dart';
import '../../features/notifications/presentation/pages/notification_settings_page.dart';
import '../../features/notifications/domain/entities/notification_entity.dart';
import '../../features/donations/presentation/pages/donations_home_page.dart';
import '../../features/donations/presentation/pages/donations_secondary_pages.dart';
import '../../features/downloads/presentation/pages/downloads_home_page.dart';
import '../../features/downloads/presentation/pages/download_details_page.dart';
import '../../features/downloads/presentation/pages/storage_management_page.dart';
import '../../features/library/presentation/pages/library_home_page.dart';
import '../../features/library/presentation/pages/library_secondary_pages.dart';
import '../../features/preferences/presentation/pages/preferences_home_page.dart';
import '../../features/preferences/presentation/pages/preferences_secondary_pages.dart';

final rootNavigatorKey = GlobalKey<NavigatorState>();

class GoRouterRefreshNotifier extends ChangeNotifier {
  GoRouterRefreshNotifier(Ref ref) {
    ref.listen(authStateProvider, (_, __) {
      notifyListeners();
    });
  }
}

final goRouterProvider = Provider<GoRouter>((ref) {
  final refreshNotifier = GoRouterRefreshNotifier(ref);

  return GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: '/splash',
    refreshListenable: refreshNotifier,
    redirect: (context, state) {
      final authState = ref.read(authStateProvider);

      developer.log(
        'ROUTER_TRACE: redirect triggered. path=${state.uri.path}, isLoading=${authState.isLoading}, hasValue=${authState.hasValue}',
      );

      final isSplash = state.uri.path == '/splash';
      final isOnboarding = state.uri.path == '/onboarding';
      final isLogin = state.uri.path == '/login';

      if (authState.isLoading) {
        developer.log('ROUTER_TRACE: authState is loading');
        if (isLogin || isOnboarding) {
          developer.log('ROUTER_TRACE: staying on ${state.uri.path}');
          return null;
        }
        developer.log('ROUTER_TRACE: returning /splash');
        return '/splash';
      }

      final session = authState.value;

      if (session == null) {
        developer.log('ROUTER_TRACE: session is null, returning /splash');
        return '/splash';
      }

      final isFirstLaunch = session.isFirstLaunch;
      final isAuthenticated = session.isAuthenticated;

      developer.log(
        'ROUTER_TRACE: session data: isFirstLaunch=$isFirstLaunch, isAuthenticated=$isAuthenticated',
      );

      if (isFirstLaunch) {
        if (!isOnboarding) {
          developer.log('ROUTER_TRACE: redirecting to /onboarding');
          return '/onboarding';
        }
      } else if (!isAuthenticated) {
        if (!isLogin) {
          developer.log('ROUTER_TRACE: redirecting to /login');
          return '/login';
        }
      } else {
        if (isSplash || isOnboarding || isLogin) {
          developer.log('ROUTER_TRACE: redirecting to / (dashboard)');
          return '/';
        }
      }

      developer.log('ROUTER_TRACE: no redirect needed, returning null');
      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (context, state) => const SplashPage()),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingPage(),
      ),
      GoRoute(path: '/login', builder: (context, state) => const LoginPage()),
      GoRoute(
        path: '/profile/edit',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const EditProfilePage(),
      ),
      GoRoute(
        path: '/profile/account',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const AccountSettingsPage(),
      ),
      GoRoute(
        path: '/satsang/details/:id',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return SatsangDetailsPage(satsangId: id);
        },
      ),
      GoRoute(
        path: '/satsang/category/:id',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return CategoryPage(categoryId: id);
        },
      ),
      GoRoute(
        path: '/audio/details/:id',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return AudioDetailsPage(audioId: id);
        },
      ),
      GoRoute(
        path: '/audio/category/:id',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return AudioCategoryPage(categoryId: id);
        },
      ),
      GoRoute(
        path: '/books/details/:id',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return BookDetailsPage(bookId: id);
        },
      ),
      GoRoute(
        path: '/books/category/:id',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return BookCategoryPage(categoryId: id);
        },
      ),
      GoRoute(
        path: '/books/bookmarks',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const BookmarksPage(),
      ),
      GoRoute(
        path: '/books/history',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const ReadingHistoryPage(),
      ),
      GoRoute(
        path: '/quotes',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const DailyQuotesHomePage(),
      ),
      GoRoute(
        path: '/quotes/details/:id',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return QuoteDetailsPage(quoteId: id);
        },
      ),
      GoRoute(
        path: '/quotes/favorites',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const FavoriteQuotesPage(),
      ),
      GoRoute(
        path: '/quotes/history',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const QuoteHistoryPage(),
      ),
      GoRoute(
        path: '/search',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const SearchHomePage(),
      ),
      GoRoute(
        path: '/events',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const EventsHomePage(),
      ),
      GoRoute(
        path: '/events/details/:id',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return EventDetailsPage(eventId: id);
        },
      ),
      GoRoute(
        path: '/events/my-events',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const MyEventsPage(),
      ),
      GoRoute(
        path: '/events/register/:id',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return EventRegistrationPage(eventId: id);
        },
      ),
      GoRoute(
        path: '/notifications',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const NotificationsPage(),
      ),
      GoRoute(
        path: '/notifications/details',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) {
          final notif = state.extra as NotificationEntity;
          return NotificationDetailsPage(notification: notif);
        },
      ),
      GoRoute(
        path: '/notifications/settings',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const NotificationSettingsPage(),
      ),
      GoRoute(
        path: '/donations',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const DonationsHomePage(),
      ),
      GoRoute(
        path: '/donations/details/:id',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return DonationDetailsPage(campaignId: id);
        },
      ),
      GoRoute(
        path: '/donations/checkout/:id',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return DonationCheckoutPage(campaignId: id);
        },
      ),
      GoRoute(
        path: '/donations/history',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const DonationHistoryPage(),
      ),
      GoRoute(
        path: '/donations/receipt/:id',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return DonationReceiptPage(receiptId: id);
        },
      ),
      GoRoute(
        path: '/downloads',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const DownloadsHomePage(),
      ),
      GoRoute(
        path: '/downloads/details/:id',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return DownloadDetailsPage(downloadId: id);
        },
      ),
      GoRoute(
        path: '/downloads/storage',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const StorageManagementPage(),
      ),
      GoRoute(
        path: '/library',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const LibraryHomePage(),
      ),
      GoRoute(
        path: '/library/bookmarks',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const LibraryBookmarksPage(),
      ),
      GoRoute(
        path: '/library/favorites',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const LibraryFavoritesPage(),
      ),
      GoRoute(
        path: '/library/history',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const LibraryHistoryPage(),
      ),
      GoRoute(
        path: '/library/recent',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const LibraryRecentActivityPage(),
      ),
      GoRoute(
        path: '/settings',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const PreferencesHomePage(),
      ),
      GoRoute(
        path: '/settings/appearance',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const PreferenceAppearanceSettingsPage(),
      ),
      GoRoute(
        path: '/settings/accessibility',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) =>
            const PreferenceAccessibilitySettingsPage(),
      ),
      GoRoute(
        path: '/settings/notifications',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const PreferenceNotificationSettingsPage(),
      ),
      GoRoute(
        path: '/settings/privacy',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const PreferencePrivacySettingsPage(),
      ),
      GoRoute(
        path: '/settings/playback',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const PreferencePlaybackSettingsPage(),
      ),
      GoRoute(
        path: '/settings/reading',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const PreferenceReadingSettingsPage(),
      ),
      GoRoute(
        path: '/settings/downloads',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const PreferenceDownloadSettingsPage(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return HomeShellPage(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(path: '/', builder: (context, state) => const HomePage()),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/satsang',
                builder: (context, state) => const SatsangHomePage(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/audio',
                builder: (context, state) => const AudioHomePage(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/books',
                builder: (context, state) => const BooksHomePage(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/settings',
                builder: (context, state) => const ProfilePage(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
});
