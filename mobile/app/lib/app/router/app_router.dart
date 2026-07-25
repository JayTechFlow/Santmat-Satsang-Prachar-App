import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

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

final rootNavigatorKey = GlobalKey<NavigatorState>();

final goRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: '/splash',
    redirect: (context, state) {
      if (authState.isLoading) {
        return '/splash';
      }

      final session = authState.value;

      if (session == null) {
        return '/splash';
      }

      final isFirstLaunch = session.isFirstLaunch;
      final isAuthenticated = session.isAuthenticated;
      final isSplash = state.uri.path == '/splash';
      final isOnboarding = state.uri.path == '/onboarding';
      final isLogin = state.uri.path == '/login';

      if (isFirstLaunch) {
        if (!isOnboarding) return '/onboarding';
      } else if (!isAuthenticated) {
        if (!isLogin) return '/login';
      } else {
        if (isSplash || isOnboarding || isLogin) return '/';
      }

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
