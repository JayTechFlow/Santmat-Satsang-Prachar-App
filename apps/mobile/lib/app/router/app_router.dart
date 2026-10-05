import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../shared/design_system/tokens/animation/ssp_animation.dart';

import '../../features/authentication/presentation/pages/login_page.dart';
import '../../features/authentication/presentation/pages/registration_page.dart';
import '../../features/authentication/presentation/pages/onboarding_page.dart';
import '../../features/authentication/presentation/pages/splash_page.dart';
import '../../features/authentication/presentation/providers/auth_state_provider.dart';
import '../../features/authentication/presentation/providers/auth_status_provider.dart';
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
import '../../features/audio/presentation/pages/bhajan_list_page.dart';
import '../../features/audio/presentation/pages/now_playing_page.dart';
import '../../features/books/presentation/pages/book_details_page.dart';
import '../../features/books/presentation/pages/pdf_reader_page.dart';
import '../../features/books/presentation/pages/books_secondary_pages.dart';
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
import '../../core/navigation/canonical_back_handler.dart';
import '../../core/navigation/root_navigator.dart';

export '../../core/navigation/root_navigator.dart' show rootNavigatorKey;

class GoRouterRefreshNotifier extends ChangeNotifier {
  GoRouterRefreshNotifier(Ref ref) {
    ref.listen(authStatusProvider, (previous, next) {
      notifyListeners();
    });
    ref.listen(authStateProvider, (previous, next) {
      notifyListeners();
    });
  }
}

Widget _buildFadeSlideTransition(Animation<double> animation, Widget child) {
  final curved = CurvedAnimation(
    parent: animation,
    curve: SSPAnimation.standard,
  );
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
            Text(
              'Page not found',
              style: Theme.of(context).textTheme.titleLarge,
            ),
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
        path: '/register',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>? ?? {};
          final phone = extra['phone'] as String?;
          return RegistrationPage(initialPhone: phone);
        },
      ),
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: '/profile/edit',
        builder: (context, state) =>
            const CanonicalBackHandler(child: EditProfilePage()),
      ),
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: '/profile/account',
        builder: (context, state) =>
            const CanonicalBackHandler(child: AccountSettingsPage()),
      ),
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: '/profile/favorites',
        builder: (context, state) =>
            const CanonicalBackHandler(child: FavoriteBhajansPage()),
      ),
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: '/profile/history',
        builder: (context, state) =>
            const CanonicalBackHandler(child: ListeningHistoryPage()),
      ),
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: '/satsang/details/:id',
        pageBuilder: (context, state) {
          final id = state.pathParameters['id']!;
          return CustomTransitionPage(
            key: state.pageKey,
            child: CanonicalBackHandler(
              child: SatsangDetailsPage(satsangId: id),
            ),
            transitionsBuilder:
                (context, animation, secondaryAnimation, child) {
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
        parentNavigatorKey: rootNavigatorKey,
        path: '/satsang/category/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return CanonicalBackHandler(child: CategoryPage(categoryId: id));
        },
      ),
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: '/audio/details/:id',
        pageBuilder: (context, state) {
          final id = state.pathParameters['id']!;
          return CustomTransitionPage(
            key: state.pageKey,
            child: CanonicalBackHandler(child: AudioDetailsPage(audioId: id)),
            transitionsBuilder:
                (context, animation, secondaryAnimation, child) {
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
        parentNavigatorKey: rootNavigatorKey,
        path: '/audio/bhajans',
        pageBuilder: (context, state) {
          return CustomTransitionPage(
            key: state.pageKey,
            child: CanonicalBackHandler(child: BhajanListPage()),
            transitionsBuilder:
                (context, animation, secondaryAnimation, child) {
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
        parentNavigatorKey: rootNavigatorKey,
        path: '/audio/now-playing',
        pageBuilder: (context, state) {
          return CustomTransitionPage(
            key: state.pageKey,
            child: CanonicalBackHandler(child: NowPlayingPage()),
            transitionsBuilder:
                (context, animation, secondaryAnimation, child) {
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
        parentNavigatorKey: rootNavigatorKey,
        path: '/audio/category/:id',
        pageBuilder: (context, state) {
          final id = state.pathParameters['id']!;
          return CustomTransitionPage(
            key: state.pageKey,
            child: CanonicalBackHandler(
              child: AudioCategoryPage(categoryId: id),
            ),
            transitionsBuilder:
                (context, animation, secondaryAnimation, child) {
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
        parentNavigatorKey: rootNavigatorKey,
        path: '/books/details/:id',
        pageBuilder: (context, state) {
          final id = state.pathParameters['id']!;
          return CustomTransitionPage(
            key: state.pageKey,
            child: CanonicalBackHandler(child: BookDetailsPage(bookId: id)),
            transitionsBuilder:
                (context, animation, secondaryAnimation, child) {
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
        parentNavigatorKey: rootNavigatorKey,
        path: '/books/reader',
        pageBuilder: (context, state) {
          final extra = state.extra as Map<String, dynamic>? ?? {};
          final title = extra['title'] as String? ?? 'PDF Document';
          final pdfUrl = extra['pdfUrl'] as String? ?? '';
          return CustomTransitionPage(
            key: state.pageKey,
            child: CanonicalBackHandler(
              child: PdfReaderPage(title: title, pdfUrl: pdfUrl),
            ),
            transitionsBuilder:
                (context, animation, secondaryAnimation, child) {
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
        parentNavigatorKey: rootNavigatorKey,
        path: '/books/category/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return CanonicalBackHandler(child: BookCategoryPage(categoryId: id));
        },
      ),
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: '/books/bookmarks',
        builder: (context, state) =>
            const CanonicalBackHandler(child: BookmarksPage()),
      ),
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: '/books/history',
        builder: (context, state) =>
            const CanonicalBackHandler(child: ReadingHistoryPage()),
      ),
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: '/search',
        builder: (context, state) =>
            const CanonicalBackHandler(child: SearchHomePage()),
      ),
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: '/events',
        builder: (context, state) =>
            const CanonicalBackHandler(child: EventsHomePage()),
      ),
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: '/events/details/:id',
        pageBuilder: (context, state) {
          final id = state.pathParameters['id']!;
          return CustomTransitionPage(
            key: state.pageKey,
            child: CanonicalBackHandler(child: EventDetailsPage(eventId: id)),
            transitionsBuilder:
                (context, animation, secondaryAnimation, child) {
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
        parentNavigatorKey: rootNavigatorKey,
        path: '/events/my-events',
        builder: (context, state) =>
            const CanonicalBackHandler(child: MyEventsPage()),
      ),
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: '/events/register/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return CanonicalBackHandler(
            child: EventRegistrationPage(eventId: id),
          );
        },
      ),
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: '/notifications/details',
        pageBuilder: (context, state) {
          final notif = state.extra as NotificationEntity;
          return CustomTransitionPage(
            key: state.pageKey,
            child: CanonicalBackHandler(
              child: NotificationDetailsPage(notification: notif),
            ),
            transitionsBuilder:
                (context, animation, secondaryAnimation, child) {
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
        parentNavigatorKey: rootNavigatorKey,
        path: '/notifications/settings',
        builder: (context, state) =>
            const CanonicalBackHandler(child: NotificationSettingsPage()),
      ),
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: '/donations',
        builder: (context, state) =>
            const CanonicalBackHandler(child: DonationsHomePage()),
      ),
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: '/donations/details/:id',
        pageBuilder: (context, state) {
          final id = state.pathParameters['id']!;
          return CustomTransitionPage(
            key: state.pageKey,
            child: CanonicalBackHandler(
              child: DonationDetailsPage(campaignId: id),
            ),
            transitionsBuilder:
                (context, animation, secondaryAnimation, child) {
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
        parentNavigatorKey: rootNavigatorKey,
        path: '/donations/checkout/:id',
        pageBuilder: (context, state) {
          final id = state.pathParameters['id']!;
          return CustomTransitionPage(
            key: state.pageKey,
            child: CanonicalBackHandler(
              child: DonationCheckoutPage(campaignId: id),
            ),
            transitionsBuilder:
                (context, animation, secondaryAnimation, child) {
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
        parentNavigatorKey: rootNavigatorKey,
        path: '/donations/history',
        builder: (context, state) =>
            const CanonicalBackHandler(child: DonationHistoryPage()),
      ),
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: '/donations/receipt/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return CanonicalBackHandler(
            child: DonationReceiptPage(receiptId: id),
          );
        },
      ),
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: '/library',
        builder: (context, state) =>
            const CanonicalBackHandler(child: LibraryHomePage()),
      ),
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: '/library/bookmarks',
        builder: (context, state) =>
            const CanonicalBackHandler(child: LibraryBookmarksPage()),
      ),
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: '/library/favorites',
        builder: (context, state) =>
            const CanonicalBackHandler(child: LibraryFavoritesPage()),
      ),
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: '/library/history',
        builder: (context, state) =>
            const CanonicalBackHandler(child: LibraryHistoryPage()),
      ),
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: '/library/recent',
        builder: (context, state) =>
            const CanonicalBackHandler(child: LibraryRecentActivityPage()),
      ),
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: '/settings/appearance',
        builder: (context, state) =>
            CanonicalBackHandler(child: PreferenceAppearanceSettingsPage()),
      ),
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: '/settings/accessibility',
        builder: (context, state) => const CanonicalBackHandler(
          child: PreferenceAccessibilitySettingsPage(),
        ),
      ),
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: '/settings/notifications',
        builder: (context, state) =>
            CanonicalBackHandler(child: PreferenceNotificationSettingsPage()),
      ),
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: '/settings/privacy',
        builder: (context, state) =>
            const CanonicalBackHandler(child: PreferencePrivacySettingsPage()),
      ),
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: '/settings/playback',
        builder: (context, state) =>
            const CanonicalBackHandler(child: PreferencePlaybackSettingsPage()),
      ),
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: '/settings/reading',
        builder: (context, state) =>
            const CanonicalBackHandler(child: PreferenceReadingSettingsPage()),
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
