// Sprint E1 — Permission Guard (Flutter Route Protection)
// Route-level and widget-level authorization guards.

import 'package:flutter/foundation.dart';
import 'dart:developer' as developer;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:santmat_satsang_prachar/core/auth/permission_engine.dart';
import 'package:santmat_satsang_prachar/core/auth/permission_context.dart';
import 'package:santmat_satsang_prachar/core/config/app_config.dart';
import '../../features/authentication/presentation/providers/auth_status_provider.dart';
import '../../features/authentication/presentation/providers/auth_state_provider.dart';
import '../../features/authentication/domain/entities/auth_status.dart';


/// Route guard configuration
class RoutePermissionConfig {
  final List<String> requiredPermissions;
  final List<String> requiredAllPermissions;
  final List<String> requiredAnyPermissions;
  final List<Role> allowedRoles;
  final String? requiredFeature;
  final String fallbackRoute;
  final String? denialMessage;

  const RoutePermissionConfig({
    this.requiredPermissions = const [],
    this.requiredAllPermissions = const [],
    this.requiredAnyPermissions = const [],
    this.allowedRoles = const [],
    this.requiredFeature,
    this.fallbackRoute = '/',
    this.denialMessage,
  });
}

/// Map of route paths to their permission requirements
final Map<String, RoutePermissionConfig> routePermissionMap = {
  // Mobile user routes (all authenticated users)
  '/': RoutePermissionConfig(
    allowedRoles: [
      Role.mobileUser,
      Role.clientSuperAdmin,
      Role.developerSuperAdmin,
    ],
  ),
  '/audio': RoutePermissionConfig(
    requiredPermissions: ['mobile.audio'],
    requiredFeature: 'feature.audio',
    allowedRoles: [
      Role.mobileUser,
      Role.clientSuperAdmin,
      Role.developerSuperAdmin,
    ],
  ),
  '/audio/details/:id': RoutePermissionConfig(
    requiredPermissions: ['mobile.audio'],
    requiredFeature: 'feature.audio',
    allowedRoles: [
      Role.mobileUser,
      Role.clientSuperAdmin,
      Role.developerSuperAdmin,
    ],
  ),
  '/books': RoutePermissionConfig(
    requiredPermissions: ['mobile.books'],
    requiredFeature: 'feature.books',
    allowedRoles: [
      Role.mobileUser,
      Role.clientSuperAdmin,
      Role.developerSuperAdmin,
    ],
  ),
  '/books/details/:id': RoutePermissionConfig(
    requiredPermissions: ['mobile.books'],
    requiredFeature: 'feature.books',
    allowedRoles: [
      Role.mobileUser,
      Role.clientSuperAdmin,
      Role.developerSuperAdmin,
    ],
  ),
  '/books/reader': RoutePermissionConfig(
    requiredPermissions: ['mobile.books'],
    requiredFeature: 'feature.books',
    allowedRoles: [
      Role.mobileUser,
      Role.clientSuperAdmin,
      Role.developerSuperAdmin,
    ],
  ),
  '/satsang': RoutePermissionConfig(
    requiredPermissions: ['mobile.stuti'],
    requiredFeature: 'feature.suvichar',
    allowedRoles: [
      Role.mobileUser,
      Role.clientSuperAdmin,
      Role.developerSuperAdmin,
    ],
  ),
  '/satsang/details/:id': RoutePermissionConfig(
    requiredPermissions: ['mobile.stuti'],
    requiredFeature: 'feature.suvichar',
    allowedRoles: [
      Role.mobileUser,
      Role.clientSuperAdmin,
      Role.developerSuperAdmin,
    ],
  ),
  '/library': RoutePermissionConfig(
    requiredPermissions: ['mobile.library'],
    allowedRoles: [
      Role.mobileUser,
      Role.clientSuperAdmin,
      Role.developerSuperAdmin,
    ],
  ),
  '/profile': RoutePermissionConfig(
    requiredPermissions: ['mobile.profile'],
    allowedRoles: [
      Role.mobileUser,
      Role.clientSuperAdmin,
      Role.developerSuperAdmin,
    ],
  ),
  '/profile/favorites': RoutePermissionConfig(
    requiredPermissions: ['mobile.favorites'],
    allowedRoles: [
      Role.mobileUser,
      Role.clientSuperAdmin,
      Role.developerSuperAdmin,
    ],
  ),
  '/profile/history': RoutePermissionConfig(
    requiredPermissions: ['mobile.history'],
    allowedRoles: [
      Role.mobileUser,
      Role.clientSuperAdmin,
      Role.developerSuperAdmin,
    ],
  ),
  '/notifications': RoutePermissionConfig(
    requiredPermissions: ['mobile.notifications'],
    requiredFeature: 'feature.notifications',
    allowedRoles: [
      Role.mobileUser,
      Role.clientSuperAdmin,
      Role.developerSuperAdmin,
    ],
  ),
  '/search': RoutePermissionConfig(
    requiredPermissions: ['mobile.search'],
    allowedRoles: [
      Role.mobileUser,
      Role.clientSuperAdmin,
      Role.developerSuperAdmin,
    ],
  ),
  '/events': RoutePermissionConfig(
    requiredPermissions: ['mobile.events'],
    allowedRoles: [
      Role.mobileUser,
      Role.clientSuperAdmin,
      Role.developerSuperAdmin,
    ],
  ),
  '/settings': RoutePermissionConfig(
    requiredPermissions: ['mobile.settings'],
    allowedRoles: [
      Role.mobileUser,
      Role.clientSuperAdmin,
      Role.developerSuperAdmin,
    ],
  ),
  '/quotes': RoutePermissionConfig(
    allowedRoles: [
      Role.mobileUser,
      Role.clientSuperAdmin,
      Role.developerSuperAdmin,
    ],
  ),
  '/donations': RoutePermissionConfig(
    allowedRoles: [
      Role.mobileUser,
      Role.clientSuperAdmin,
      Role.developerSuperAdmin,
    ],
  ),
};

/// Extension to get permission config for a route
extension RoutePermissionExtension on String {
  RoutePermissionConfig get permissionConfig {
    // Try exact match first
    if (routePermissionMap.containsKey(this)) {
      return routePermissionMap[this]!;
    }
    // Try pattern match for parameterized routes
    for (final entry in routePermissionMap.entries) {
      final pattern = entry.key.replaceAll(RegExp(r':[^/]+'), r'[^/]+');
      final regex = RegExp('^$pattern\$');
      if (regex.hasMatch(this)) {
        return entry.value;
      }
    }
    // Default: allow all authenticated users
    return const RoutePermissionConfig(
      allowedRoles: [
        Role.mobileUser,
        Role.clientSuperAdmin,
        Role.developerSuperAdmin,
      ],
    );
  }
}

/// Create a GoRouter redirect function that enforces permissions
GoRouterRedirect createPermissionRedirect(Ref ref) {
  return (BuildContext context, GoRouterState state) {
    final devDirectEntry = ref.read(appConfigProvider).enableDevDirectEntry;
    final authStatus = ref.read(authStatusProvider);
    final config = state.uri.path.permissionConfig;
    if (kDebugMode) {
      developer.log('REDIRECT CHECK: path=${state.uri.path}, authStatus=$authStatus, devDirectEntry=$devDirectEntry');
    }

    // Public auth routes that don't require authentication
    const publicAuthRoutes = {
      '/login',
      '/register',
      '/onboarding',
      '/splash',
    };

    // TEMPORARY DEVELOPMENT DIRECT-ENTRY MODE
    if (devDirectEntry) {
      if (publicAuthRoutes.contains(state.uri.path)) {
        return '/';
      }
      return null;
    }

    // Loading / bootstrapping: stay on splash or auth pages
    if (authStatus.isLoading) {
      if (publicAuthRoutes.contains(state.uri.path)) {
        return null;
      }
      return '/splash';
    }

    // Unauthenticated: redirect to onboarding (if first launch) or login
    if (authStatus == AuthStatus.unauthenticated) {
      final asyncSession = ref.read(authStateProvider);
      final isFirstLaunch = asyncSession.value?.isFirstLaunch ?? false;
      final target = isFirstLaunch ? '/onboarding' : '/login';

      if (publicAuthRoutes.contains(state.uri.path)) {
        return null;
      }
      return target;
    }

    // Authenticated: proceed with permission checks
    if (authStatus == AuthStatus.authenticated) {
      // Authenticated user accessing auth pages -> home
      if (publicAuthRoutes.contains(state.uri.path)) {
        return '/';
      }

      final permContext = ref.read(permissionContextProvider);
      final effectiveRole = permContext?.role ?? Role.mobileUser;
      final engine = permissionEngine;

      // Role check
      if (config.allowedRoles.isNotEmpty &&
          !config.allowedRoles.contains(effectiveRole)) {
        return config.fallbackRoute;
      }
      // Required all permissions
      if (config.requiredAllPermissions.isNotEmpty &&
          !engine.hasAllPermissions(effectiveRole, config.requiredAllPermissions)) {
        return config.fallbackRoute;
      }
      // Required any permissions
      if (config.requiredAnyPermissions.isNotEmpty &&
          !engine.hasAnyPermission(effectiveRole, config.requiredAnyPermissions)) {
        return config.fallbackRoute;
      }
      // Legacy required permissions (treated as all)
      if (config.requiredPermissions.isNotEmpty &&
          !engine.hasAllPermissions(effectiveRole, config.requiredPermissions)) {
        return config.fallbackRoute;
      }
      // Feature gate
      if (config.requiredFeature != null &&
          !engine.isFeatureEnabled(config.requiredFeature!, effectiveRole)) {
        return config.fallbackRoute;
      }
      return null;
    }

    // Suspended or deactivated accounts - redirect to login with error
    if (authStatus == AuthStatus.suspended || authStatus == AuthStatus.accessDenied) {
      if (publicAuthRoutes.contains(state.uri.path)) {
        return null;
      }
      return '/login';
    }

    // Error states must not loop splash<->auth forever: stay on the public
    // auth page so the user can retry (e.g. failed registration/network), and
    // route non-public pages to login for recovery.
    if (authStatus == AuthStatus.error) {
      if (publicAuthRoutes.contains(state.uri.path)) {
        return null;
      }
      return '/login';
    }

    // For other statuses (bootstrapping/authLoading) fallback to splash
    return '/splash';
  };
}

/// Widget that conditionally renders based on permissions
class PermissionGate extends ConsumerWidget {
  final Widget child;
  final Widget? fallback;
  final List<String> requiredPermissions;
  final List<String> requiredAllPermissions;
  final List<String> requiredAnyPermissions;
  final List<Role> allowedRoles;
  final String? requiredFeature;
  final String? denialMessage;

  const PermissionGate({
    super.key,
    required this.child,
    this.fallback,
    this.requiredPermissions = const [],
    this.requiredAllPermissions = const [],
    this.requiredAnyPermissions = const [],
    this.allowedRoles = const [],
    this.requiredFeature,
    this.denialMessage,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final context_ = ref.watch(permissionContextProvider);
    if (context_ == null) {
      return fallback ?? const SizedBox.shrink();
    }

    final engine = permissionEngine;

    // Check allowed roles
    if (allowedRoles.isNotEmpty && !allowedRoles.contains(context_.role)) {
      return _buildDenied(
        context,
        ref,
        denialMessage ?? 'Access denied: insufficient role',
      );
    }

    // Check required permissions (all)
    if (requiredAllPermissions.isNotEmpty) {
      if (!engine.hasAllPermissions(context_.role, requiredAllPermissions)) {
        return _buildDenied(
          context,
          ref,
          denialMessage ?? 'Access denied: missing required permissions',
        );
      }
    }

    // Check required permissions (any)
    if (requiredAnyPermissions.isNotEmpty) {
      if (!engine.hasAnyPermission(context_.role, requiredAnyPermissions)) {
        return _buildDenied(
          context,
          ref,
          denialMessage ?? 'Access denied: missing required permissions',
        );
      }
    }

    // Check required permissions (legacy)
    if (requiredPermissions.isNotEmpty) {
      if (!engine.hasAllPermissions(context_.role, requiredPermissions)) {
        return _buildDenied(
          context,
          ref,
          denialMessage ?? 'Access denied: missing required permissions',
        );
      }
    }

    // Check required feature
    if (requiredFeature != null &&
        !engine.isFeatureEnabled(requiredFeature!, context_.role)) {
      return _buildDenied(
        context,
        ref,
        denialMessage ?? 'Feature not available',
      );
    }

    return child;
  }

  Widget _buildDenied(BuildContext context, WidgetRef ref, String message) {
    if (fallback != null) return fallback!;
    return Card(
      margin: const EdgeInsets.all(16),
      color: Theme.of(context).colorScheme.errorContainer,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(
              Icons.lock_outline,
              color: Theme.of(context).colorScheme.onErrorContainer,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message,
                style: TextStyle(
                  color: Theme.of(context).colorScheme.onErrorContainer,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}


/// Convenience widget for mobile users only (hides from admins)
class MobileOnly extends ConsumerWidget {
  final Widget child;
  final Widget? fallback;

  const MobileOnly({super.key, required this.child, this.fallback});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return PermissionGate(
      allowedRoles: const [Role.mobileUser],
      fallback: fallback,
      child: child,
    );
  }
}

/// Convenience widget for feature-gated content
class FeatureGate extends ConsumerWidget {
  final Widget child;
  final String featureId;
  final Widget? fallback;

  const FeatureGate({
    super.key,
    required this.child,
    required this.featureId,
    this.fallback,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return PermissionGate(
      requiredFeature: featureId,
      fallback: fallback,
      child: child,
    );
  }
}
