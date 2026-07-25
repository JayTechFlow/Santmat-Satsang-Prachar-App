import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/authentication/presentation/pages/login_page.dart';
import '../../features/authentication/presentation/pages/onboarding_page.dart';
import '../../features/authentication/presentation/pages/splash_page.dart';
import '../../features/authentication/presentation/providers/auth_state_provider.dart';
import '../../features/home/presentation/pages/home_shell_page.dart';

final goRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
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
      GoRoute(path: '/', builder: (context, state) => const HomeShellPage()),
    ],
  );
});
