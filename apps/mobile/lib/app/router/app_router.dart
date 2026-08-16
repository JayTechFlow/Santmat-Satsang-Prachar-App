import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../shared/design_system/tokens/animation/ssp_animation.dart';

import '../../features/authentication/presentation/pages/login_page.dart';
import '../../features/authentication/presentation/pages/onboarding_page.dart';
import '../../features/authentication/presentation/pages/splash_page.dart';
import '../../features/authentication/presentation/providers/auth_state_provider.dart';
import '../../features/home/presentation/pages/home_page.dart';
import '../../features/home/presentation/pages/home_shell_page.dart';
import '../../features/profile/presentation/pages/account_settings_page.dart';
import '../../features/profile/presentation/pages/edit_profile_page.dart';
import '../../features/profile/presentation/pages/profile_page.dart';
import '../../features/profile/presentation/pages/favorite_bhajans_page.dart';
import '../../features/profile/presentation/pages/listening_history_page.dart';
import '../../features/stuti_vinati/presentation/pages/stuti_vinati_home_page.dart';
import '../../features/satsang/presentation/pages/satsang_details_page.dart';
import '../../features/satsang/presentation/pages/category_page.dart';
import '../../features/audio/presentation/pages/audio_home_page.dart';
import '../../features/audio/presentation/pages/audio_details_page.dart';
import '../../features/audio/presentation/pages/audio_category_page.dart';
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
import '../../features/library/presentation/pages/library_home_page.dart';
import '../../features/library/presentation/pages/library_secondary_pages.dart';
import '../../features/preferences/presentation/pages/preferences_secondary_pages.dart';
import '../../core/auth/permission_guard.dart';

final rootNavigatorKey = GlobalKey<NavigatorState>();

class GoRouterRefreshNotifier extends ChangeNotifier {
  GoRouterRefreshNotifier(Ref ref) {
    ref.listen(authStateProvider, (previous, next) {
      notifyListeners();
    });
  }
}

Widget _buildFadeSlideTransition(Animation<double> animation, Widget child) {
  final curved = CurvedAnimation(parent: animation, curve: SSPAnimation.standard);
  return FadeTransition(
    opacity: curved,
    child: SlideTransition(
      position: Tween<Offset>(
        begin: const Offset(0.0, 0.1),
        end: Offset.zero,
      ).animate(curved),
      child: child,
    ),
  );
}

final goRouterProvider = Provider<GoRouter>((ref) {
  final refreshNotifier = GoRouterRefreshNotifier(ref);

  return GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: '/splash',
    refreshListenable: refreshNotifier,
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48),
            const SizedBox(height: 16),
            Text('Page not found', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () => context.go('/'),
              child: const Text('Go Home'),
            ),
          ],
        ),
      ),
    ),
    redirect: createPermissionRedirect(ref),
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
        path: '/profile/favorites',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const FavoriteBhajansPage(),
      ),
      GoRoute(
        path: '/profile/history',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const ListeningHistoryPage(),
      ),
      GoRoute(
        path: '/satsang/details/:id',
        parentNavigatorKey: rootNavigatorKey,
        pageBuilder: (context, state) {
          final id = state.pathParameters['id']!;
          return CustomTransitionPage(
            key: state.pageKey,
            child: SatsangDetailsPage(satsangId: id),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              if (SSPAnimation.prefersReducedMotion(context)) {
                return child;
              }
              return _buildFadeSlideTransition(animation, child);
            },
            transitionDuration: SSPAnimation.pageTransition,
          );
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
        pageBuilder: (context, state) {
          final id = state.pathParameters['id']!;
          return CustomTransitionPage(
            key: state.pageKey,
            child: AudioDetailsPage(audioId: id),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              if (SSPAnimation.prefersReducedMotion(context)) {
                return child;
              }
              return _buildFadeSlideTransition(animation, child);
            },
            transitionDuration: SSPAnimation.pageTransition,
          );
        },
      ),
      GoRoute(
        path: '/audio/category/:id',
        parentNavigatorKey: rootNavigatorKey,
        pageBuilder: (context, state) {
          final id = state.pathParameters['id']!;
          return CustomTransitionPage(
            key: state.pageKey,
            child: AudioCategoryPage(categoryId: id),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              if (SSPAnimation.prefersReducedMotion(context)) {
                return child;
              }
              return _buildFadeSlideTransition(animation, child);
            },
            transitionDuration: SSPAnimation.pageTransition,
          );
        },
      ),
      GoRoute(
        path: '/books/details/:id',
        parentNavigatorKey: rootNavigatorKey,
        pageBuilder: (context, state) {
          final id = state.pathParameters['id']!;
          return CustomTransitionPage(
            key: state.pageKey,
            child: BookDetailsPage(bookId: id),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              if (SSPAnimation.prefersReducedMotion(context)) {
                return child;
              }
              return _buildFadeSlideTransition(animation, child);
            },
            transitionDuration: SSPAnimation.pageTransition,
          );
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
        pageBuilder: (context, state) {
          final id = state.pathParameters['id']!;
          return CustomTransitionPage(
            key: state.pageKey,
            child: EventDetailsPage(eventId: id),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              if (SSPAnimation.prefersReducedMotion(context)) {
                return child;
              }
              return _buildFadeSlideTransition(animation, child);
            },
            transitionDuration: SSPAnimation.pageTransition,
          );
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
        path: '/notifications/details',
        parentNavigatorKey: rootNavigatorKey,
        pageBuilder: (context, state) {
          final notif = state.extra as NotificationEntity;
          return CustomTransitionPage(
            key: state.pageKey,
            child: NotificationDetailsPage(notification: notif),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              if (SSPAnimation.prefersReducedMotion(context)) {
                return child;
              }
              return _buildFadeSlideTransition(animation, child);
            },
            transitionDuration: SSPAnimation.pageTransition,
          );
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
        pageBuilder: (context, state) {
          final id = state.pathParameters['id']!;
          return CustomTransitionPage(
            key: state.pageKey,
            child: DonationDetailsPage(campaignId: id),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              if (SSPAnimation.prefersReducedMotion(context)) {
                return child;
              }
              return _buildFadeSlideTransition(animation, child);
            },
            transitionDuration: SSPAnimation.pageTransition,
          );
        },
      ),
      GoRoute(
        path: '/donations/checkout/:id',
        parentNavigatorKey: rootNavigatorKey,
        pageBuilder: (context, state) {
          final id = state.pathParameters['id']!;
          return CustomTransitionPage(
            key: state.pageKey,
            child: DonationCheckoutPage(campaignId: id),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              if (SSPAnimation.prefersReducedMotion(context)) {
                return child;
              }
              return _buildFadeSlideTransition(animation, child);
            },
            transitionDuration: SSPAnimation.pageTransition,
          );
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
        path: '/settings/appearance',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const PreferenceAppearanceSettingsPage(),
      ),
      GoRoute(
        path: '/settings/accessibility',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const PreferenceAccessibilitySettingsPage(),
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
                path: '/audio',
                builder: (context, state) => const AudioHomePage(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/satsang',
                builder: (context, state) => const StutiVinatiHomePage(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/notifications',
                builder: (context, state) => const NotificationsPage(),
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