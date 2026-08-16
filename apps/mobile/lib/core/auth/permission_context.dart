// Sprint E1 — Permission Context Provider (Flutter/Provider)
// Riverpod provider for permission state and authorization checks.

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart' as fb_auth;
import 'package:santmat_satsang_prachar/core/auth/permission_engine.dart';

final permissionContextProvider = NotifierProvider<PermissionContextNotifier, PermissionContext?>(() {
  return PermissionContextNotifier();
});

class PermissionContextNotifier extends Notifier<PermissionContext?> {
  fb_auth.User? _currentUser;

  @override
  PermissionContext? build() {
    _listenToAuthChanges();
    return null;
  }

  void _listenToAuthChanges() {
    fb_auth.FirebaseAuth.instance.authStateChanges().listen((user) {
      _currentUser = user;
      if (user != null) {
        _refreshPermissionContext(user);
      } else {
        state = null;
      }
    });
  }

  Future<void> _refreshPermissionContext(fb_auth.User user) async {
    try {
      final tokenResult = await user.getIdTokenResult(true);
      final claims = tokenResult.claims ?? {};
      state = createPermissionContext(claims);
    } catch (e) {
      state = null;
    }
  }

  Future<void> refresh() async {
    if (_currentUser != null) {
      await _refreshPermissionContext(_currentUser!);
    }
  }
}

/// Authorization check result for UI
class AuthzResult {
  final bool allowed;
  final String? reason;

  const AuthzResult({required this.allowed, this.reason});

  factory AuthzResult.allowed() => const AuthzResult(allowed: true);
  factory AuthzResult.denied(String reason) => AuthzResult(allowed: false, reason: reason);
}

/// Provider for checking permissions in UI
final permissionCheckProvider = Provider<PermissionChecker>((ref) {
  return PermissionChecker(ref);
});

class PermissionChecker {
  final Ref _ref;

  PermissionChecker(this._ref);

  PermissionEngine get _engine => permissionEngine;

  PermissionContext? get _context => _ref.read(permissionContextProvider);

  bool get isAuthenticated => _context != null;

  Role get currentRole => _context?.role ?? Role.mobileUser;

  bool get isSuspended => _context?.isSuspended ?? false;

  String get uid => _context?.uid ?? '';

  /// Check if current user has a specific permission
  bool hasPermission(String permissionId) {
    final context = _context;
    if (context == null) return false;
    return _engine.hasPermission(context.role, permissionId);
  }

  /// Check if current user has ANY of the given permissions
  bool hasAnyPermission(List<String> permissionIds) {
    final context = _context;
    if (context == null) return false;
    return _engine.hasAnyPermission(context.role, permissionIds);
  }

  /// Check if current user has ALL of the given permissions
  bool hasAllPermissions(List<String> permissionIds) {
    final context = _context;
    if (context == null) return false;
    return _engine.hasAllPermissions(context.role, permissionIds);
  }

  /// Check if a feature is enabled for current user
  bool isFeatureEnabled(String featureId) {
    final context = _context;
    if (context == null) return false;
    return _engine.isFeatureEnabled(featureId, context.role);
  }

  /// Full authorization check with reason
  AuthzResult authorize(String permissionId) {
    final context = _context;
    if (context == null) return AuthzResult.denied('Not authenticated');
    final result = _engine.authorize(context, permissionId);
    return AuthzResult(allowed: result.allowed, reason: result.reason);
  }

  /// Authorize all permissions (AND logic)
  AuthzResult authorizeAll(List<String> permissionIds) {
    final context = _context;
    if (context == null) return AuthzResult.denied('Not authenticated');
    final result = _engine.authorizeAll(context, permissionIds);
    return AuthzResult(allowed: result.allowed, reason: result.reason);
  }

  /// Authorize any permission (OR logic)
  AuthzResult authorizeAny(List<String> permissionIds) {
    final context = _context;
    if (context == null) return AuthzResult.denied('Not authenticated');
    final result = _engine.authorizeAny(context, permissionIds);
    return AuthzResult(allowed: result.allowed, reason: result.reason);
  }

  /// Check if current user can manage a target role
  bool canManageRole(Role targetRole) {
    final context = _context;
    if (context == null) return false;
    return _engine.canManageRole(context.role, targetRole);
  }

  /// Validate role assignment
  AuthzResult validateRoleAssignment(Role targetRole, {bool isSelf = false}) {
    final context = _context;
    if (context == null) return AuthzResult.denied('Not authenticated');
    final result = _engine.validateRoleAssignment(context.role, targetRole, isSelf);
    return AuthzResult(allowed: result.allowed, reason: result.reason);
  }

  /// Get all permissions for current role
  List<Permission> get currentPermissions => _engine.getPermissionsForRole(currentRole);

  /// Get all enabled features for current role
  List<FeatureFlag> get enabledFeatures => _engine.getEnabledFeaturesForRole(currentRole);
}

/// Convenience providers for common permission checks
final canManageUsersProvider = Provider<bool>((ref) {
  return ref.watch(permissionCheckProvider).hasPermission('users.manage');
});

final canManageAudioProvider = Provider<bool>((ref) {
  return ref.watch(permissionCheckProvider).hasPermission('audio.manage');
});

final canManageBooksProvider = Provider<bool>((ref) {
  return ref.watch(permissionCheckProvider).hasPermission('books.manage');
});

final canManageBannersProvider = Provider<bool>((ref) {
  return ref.watch(permissionCheckProvider).hasPermission('banners.manage');
});

final canManageStutiProvider = Provider<bool>((ref) {
  return ref.watch(permissionCheckProvider).hasPermission('stuti.manage');
});

final canManageCategoriesProvider = Provider<bool>((ref) {
  return ref.watch(permissionCheckProvider).hasPermission('categories.manage');
});

final canManageEventsProvider = Provider<bool>((ref) {
  return ref.watch(permissionCheckProvider).hasPermission('events.manage');
});

final canManageNotificationsProvider = Provider<bool>((ref) {
  return ref.watch(permissionCheckProvider).hasPermission('notifications.manage');
});

final canManagePlaylistsProvider = Provider<bool>((ref) {
  return ref.watch(permissionCheckProvider).hasPermission('playlists.manage');
});

final canViewAnalyticsProvider = Provider<bool>((ref) {
  return ref.watch(permissionCheckProvider).hasPermission('analytics.view');
});

final canViewReportsProvider = Provider<bool>((ref) {
  return ref.watch(permissionCheckProvider).hasPermission('reports.view');
});

final canManageSettingsProvider = Provider<bool>((ref) {
  return ref.watch(permissionCheckProvider).hasPermission('settings.manage');
});

final isDeveloperSuperAdminProvider = Provider<bool>((ref) {
  return ref.watch(permissionCheckProvider).currentRole == Role.developerSuperAdmin;
});

final isClientSuperAdminProvider = Provider<bool>((ref) {
  return ref.watch(permissionCheckProvider).currentRole == Role.clientSuperAdmin;
});

final isMobileUserProvider = Provider<bool>((ref) {
  return ref.watch(permissionCheckProvider).currentRole == Role.mobileUser;
});

final isAnyAdminProvider = Provider<bool>((ref) {
  final role = ref.watch(permissionCheckProvider).currentRole;
  return role == Role.developerSuperAdmin || role == Role.clientSuperAdmin;
});

final audioFeatureEnabledProvider = Provider<bool>((ref) {
  return ref.watch(permissionCheckProvider).isFeatureEnabled('feature.audio');
});

final booksFeatureEnabledProvider = Provider<bool>((ref) {
  return ref.watch(permissionCheckProvider).isFeatureEnabled('feature.books');
});

final playlistsFeatureEnabledProvider = Provider<bool>((ref) {
  return ref.watch(permissionCheckProvider).isFeatureEnabled('feature.playlists');
});

final analyticsFeatureEnabledProvider = Provider<bool>((ref) {
  return ref.watch(permissionCheckProvider).isFeatureEnabled('feature.analytics');
});

final recommendationsFeatureEnabledProvider = Provider<bool>((ref) {
  return ref.watch(permissionCheckProvider).isFeatureEnabled('feature.recommendations');
});