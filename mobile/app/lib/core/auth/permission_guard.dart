// Sprint E1 — Permission Guard (Flutter Route Protection)
// Route-level and widget-level authorization guards.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:santmat_satsang_prachar/core/auth/permission_engine.dart';
import 'package:santmat_satsang_prachar/core/auth/permission_context.dart';
import '../../features/authentication/presentation/providers/auth_state_provider.dart';

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

  // Admin-only routes (would be in admin panel, not mobile)
  // These are defined here for completeness but mobile app shouldn't have them
  '/admin': RoutePermissionConfig(
    allowedRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin],
    fallbackRoute: '/',
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
      final regex = RegExp('^' + pattern + r'$');
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
    final authState = ref.read(authStateProvider);
    final config = state.uri.path.permissionConfig;

    // If auth is loading, stay on current page or go to splash
    if (authState.isLoading) {
      if (state.uri.path == '/login' ||
          state.uri.path == '/onboarding' ||
          state.uri.path == '/splash') {
        return null;
      }
      return '/splash';
    }

    final session = authState.value;

    // No session - redirect to login/onboarding/splash
    if (session == null) {
      if (state.uri.path == '/login' ||
          state.uri.path == '/onboarding' ||
          state.uri.path == '/splash') {
        return null;
      }
      return '/splash';
    }

    // Check if user is authenticated
    final isAuthenticated = session.isAuthenticated;
    final isFirstLaunch = session.isFirstLaunch;

    // Handle first launch / onboarding
    if (isFirstLaunch) {
      if (state.uri.path != '/onboarding') {
        return '/onboarding';
      }
      return null;
    }

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      if (state.uri.path != '/login') {
        return '/login';
      }
      return null;
    }

    // Authenticated - check permissions for the target route
    final context = ref.read(permissionContextProvider);
    if (context == null) {
      return config.fallbackRoute;
    }

    final engine = permissionEngine;

    // Check allowed roles
    if (config.allowedRoles.isNotEmpty &&
        !config.allowedRoles.contains(context.role)) {
      return config.fallbackRoute;
    }

    // Check required permissions (all must pass)
    if (config.requiredAllPermissions.isNotEmpty) {
      if (!engine.hasAllPermissions(
        context.role,
        config.requiredAllPermissions,
      )) {
        return config.fallbackRoute;
      }
    }

    // Check required permissions (any can pass)
    if (config.requiredAnyPermissions.isNotEmpty) {
      if (!engine.hasAnyPermission(
        context.role,
        config.requiredAnyPermissions,
      )) {
        return config.fallbackRoute;
      }
    }

    // Check required permissions (legacy single list - treated as ALL)
    if (config.requiredPermissions.isNotEmpty) {
      if (!engine.hasAllPermissions(context.role, config.requiredPermissions)) {
        return config.fallbackRoute;
      }
    }

    // Check required feature
    if (config.requiredFeature != null) {
      if (!engine.isFeatureEnabled(config.requiredFeature!, context.role)) {
        return config.fallbackRoute;
      }
    }

    // Authenticated user trying to access login/onboarding/splash - redirect to home
    if (state.uri.path == '/login' ||
        state.uri.path == '/onboarding' ||
        state.uri.path == '/splash') {
      return '/';
    }

    return null;
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

/// Convenience widget for admin-only content
class AdminOnly extends ConsumerWidget {
  final Widget child;
  final Widget? fallback;

  const AdminOnly({super.key, required this.child, this.fallback});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return PermissionGate(
      allowedRoles: const [Role.developerSuperAdmin, Role.clientSuperAdmin],
      fallback: fallback,
      child: child,
    );
  }
}

/// Convenience widget for developer super admin only
class DeveloperOnly extends ConsumerWidget {
  final Widget child;
  final Widget? fallback;

  const DeveloperOnly({super.key, required this.child, this.fallback});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return PermissionGate(
      allowedRoles: const [Role.developerSuperAdmin],
      fallback: fallback,
      child: child,
    );
  }
}

/// Convenience widget for client super admin only
class ClientAdminOnly extends ConsumerWidget {
  final Widget child;
  final Widget? fallback;

  const ClientAdminOnly({super.key, required this.child, this.fallback});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return PermissionGate(
      allowedRoles: const [Role.clientSuperAdmin],
      fallback: fallback,
      child: child,
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
