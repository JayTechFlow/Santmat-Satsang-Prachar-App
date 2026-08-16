// Sprint E1 — Enterprise Permission Engine (Dart/Flutter)
// Single source of truth for all authorization decisions on mobile.
// ONLY THREE ROLES EXIST: developer_super_admin, client_super_admin, mobile_user
// NO NEW ROLES. Permissions only.

enum Role {
  developerSuperAdmin,
  clientSuperAdmin,
  mobileUser,
}

extension RoleExtension on Role {
  String get value {
    switch (this) {
      case Role.developerSuperAdmin:
        return 'developer_super_admin';
      case Role.clientSuperAdmin:
        return 'client_super_admin';
      case Role.mobileUser:
        return 'mobile_user';
    }
  }

  static Role fromString(String value) {
    switch (value) {
      case 'developer_super_admin':
        return Role.developerSuperAdmin;
      case 'client_super_admin':
        return Role.clientSuperAdmin;
      case 'mobile_user':
        return Role.mobileUser;
      default:
        return Role.mobileUser;
    }
  }

  int get hierarchyIndex {
    switch (this) {
      case Role.mobileUser:
        return 0;
      case Role.clientSuperAdmin:
        return 1;
      case Role.developerSuperAdmin:
        return 2;
    }
  }

  bool canManage(Role target) => hierarchyIndex > target.hierarchyIndex;
}

class Permission {
  final String id;
  final String module;
  final String action;
  final String description;
  final List<Role> defaultRoles;

  const Permission({
    required this.id,
    required this.module,
    required this.action,
    required this.description,
    required this.defaultRoles,
  });

  bool hasRole(Role role) => defaultRoles.contains(role);
}

class FeatureFlag {
  final String id;
  final String name;
  final String description;
  final bool enabled;
  final List<Role>? allowedRoles;

  const FeatureFlag({
    required this.id,
    required this.name,
    required this.description,
    required this.enabled,
    this.allowedRoles,
  });

  bool isEnabledFor(Role role) {
    if (!enabled) return false;
    if (allowedRoles != null && !allowedRoles!.contains(role)) return false;
    return true;
  }
}

class PermissionContext {
  final String uid;
  final Role role;
  final String? organizationId;
  final bool isSuspended;
  final Map<String, dynamic>? customClaims;

  const PermissionContext({
    required this.uid,
    required this.role,
    this.organizationId,
    this.isSuspended = false,
    this.customClaims,
  });
}

class AuthorizationResult {
  final bool allowed;
  final String? reason;
  final String? requiredPermission;
  final Role? userRole;

  const AuthorizationResult({
    required this.allowed,
    this.reason,
    this.requiredPermission,
    this.userRole,
  });

  factory AuthorizationResult.allowed({Role? userRole}) =>
      AuthorizationResult(allowed: true, userRole: userRole);

  factory AuthorizationResult.denied({
    required String reason,
    String? requiredPermission,
    Role? userRole,
  }) =>
      AuthorizationResult(
        allowed: false,
        reason: reason,
        requiredPermission: requiredPermission,
        userRole: userRole,
      );
}

class PermissionEngine {
  static final PermissionEngine _instance = PermissionEngine._internal();
  factory PermissionEngine() => _instance;
  PermissionEngine._internal();

  final Map<String, Permission> _permissions = {};
  final Map<String, FeatureFlag> _featureFlags = {};

  void _initialize() {
    if (_permissions.isNotEmpty) return;

    // ==================== PERMISSION REGISTRY ====================
    final permissions = <Permission>[
      // Platform Configuration (Developer Super Admin Only)
      Permission(id: 'platform.config', module: 'platform', action: 'config', description: 'Configure platform settings', defaultRoles: [Role.developerSuperAdmin]),
      Permission(id: 'platform.firebase', module: 'platform', action: 'firebase', description: 'Manage Firebase configuration', defaultRoles: [Role.developerSuperAdmin]),
      Permission(id: 'platform.storage', module: 'platform', action: 'storage', description: 'Manage storage configuration', defaultRoles: [Role.developerSuperAdmin]),
      Permission(id: 'platform.functions', module: 'platform', action: 'functions', description: 'Manage Cloud Functions', defaultRoles: [Role.developerSuperAdmin]),
      Permission(id: 'platform.ai', module: 'platform', action: 'ai', description: 'Configure AI services', defaultRoles: [Role.developerSuperAdmin]),
      Permission(id: 'platform.analytics', module: 'platform', action: 'analytics', description: 'View platform analytics', defaultRoles: [Role.developerSuperAdmin]),
      Permission(id: 'platform.monitoring', module: 'platform', action: 'monitoring', description: 'System monitoring', defaultRoles: [Role.developerSuperAdmin]),
      Permission(id: 'platform.tenant', module: 'platform', action: 'tenant', description: 'Manage tenants', defaultRoles: [Role.developerSuperAdmin]),
      Permission(id: 'platform.settings', module: 'platform', action: 'settings', description: 'System settings', defaultRoles: [Role.developerSuperAdmin]),
      Permission(id: 'platform.security', module: 'platform', action: 'security', description: 'Platform security', defaultRoles: [Role.developerSuperAdmin]),
      Permission(id: 'platform.disaster_recovery', module: 'platform', action: 'disaster_recovery', description: 'Disaster recovery', defaultRoles: [Role.developerSuperAdmin]),
      Permission(id: 'platform.billing', module: 'platform', action: 'billing', description: 'Billing management', defaultRoles: [Role.developerSuperAdmin]),
      Permission(id: 'platform.rbac', module: 'platform', action: 'rbac', description: 'RBAC and permissions', defaultRoles: [Role.developerSuperAdmin]),
      Permission(id: 'platform.audit_logs', module: 'platform', action: 'audit_logs', description: 'View audit logs', defaultRoles: [Role.developerSuperAdmin]),

      // RBAC & Permissions
      Permission(id: 'rbac.manage', module: 'rbac', action: 'manage', description: 'Manage roles and permissions', defaultRoles: [Role.developerSuperAdmin]),
      Permission(id: 'rbac.view', module: 'rbac', action: 'view', description: 'View roles and permissions', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),

      // User Management
      Permission(id: 'users.manage', module: 'users', action: 'manage', description: 'Full user management', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'users.view', module: 'users', action: 'view', description: 'View users', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'users.create', module: 'users', action: 'create', description: 'Create users', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'users.update', module: 'users', action: 'update', description: 'Update users', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'users.delete', module: 'users', action: 'delete', description: 'Delete users', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'users.assign_role', module: 'users', action: 'assign_role', description: 'Assign roles to users', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),

      // Audio Management
      Permission(id: 'audio.upload', module: 'audio', action: 'upload', description: 'Upload audio content', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'audio.delete', module: 'audio', action: 'delete', description: 'Delete audio content', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'audio.publish', module: 'audio', action: 'publish', description: 'Publish audio content', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'audio.manage', module: 'audio', action: 'manage', description: 'Manage audio library', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'audio.view', module: 'audio', action: 'view', description: 'View audio content', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin, Role.mobileUser]),

      // Books Management
      Permission(id: 'books.upload', module: 'books', action: 'upload', description: 'Upload books', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'books.delete', module: 'books', action: 'delete', description: 'Delete books', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'books.publish', module: 'books', action: 'publish', description: 'Publish books', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'books.manage', module: 'books', action: 'manage', description: 'Manage books library', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'books.read', module: 'books', action: 'read', description: 'Read books', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin, Role.mobileUser]),

      // Banner Management
      Permission(id: 'banners.upload', module: 'banners', action: 'upload', description: 'Upload banners', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'banners.delete', module: 'banners', action: 'delete', description: 'Delete banners', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'banners.manage', module: 'banners', action: 'manage', description: 'Manage banners', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'banners.view', module: 'banners', action: 'view', description: 'View banners', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin, Role.mobileUser]),

      // Stuti Vinati Management
      Permission(id: 'stuti.upload', module: 'stuti', action: 'upload', description: 'Upload stuti content', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'stuti.delete', module: 'stuti', action: 'delete', description: 'Delete stuti content', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'stuti.publish', module: 'stuti', action: 'publish', description: 'Publish stuti content', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'stuti.manage', module: 'stuti', action: 'manage', description: 'Manage stuti vinati', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'stuti.read', module: 'stuti', action: 'read', description: 'Read stuti vinati', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin, Role.mobileUser]),

      // Category Management
      Permission(id: 'categories.create', module: 'categories', action: 'create', description: 'Create categories', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'categories.delete', module: 'categories', action: 'delete', description: 'Delete categories', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'categories.manage', module: 'categories', action: 'manage', description: 'Manage categories', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'categories.view', module: 'categories', action: 'view', description: 'View categories', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin, Role.mobileUser]),

      // Event Management
      Permission(id: 'events.create', module: 'events', action: 'create', description: 'Create events', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'events.delete', module: 'events', action: 'delete', description: 'Delete events', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'events.manage', module: 'events', action: 'manage', description: 'Manage events', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'events.view', module: 'events', action: 'view', description: 'View events', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin, Role.mobileUser]),

      // Notification Management
      Permission(id: 'notifications.send', module: 'notifications', action: 'send', description: 'Send notifications', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'notifications.schedule', module: 'notifications', action: 'schedule', description: 'Schedule notifications', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'notifications.manage', module: 'notifications', action: 'manage', description: 'Manage notifications', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'notifications.view', module: 'notifications', action: 'view', description: 'View notifications', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin, Role.mobileUser]),
      Permission(id: 'notifications.receive', module: 'notifications', action: 'receive', description: 'Receive push notifications', defaultRoles: [Role.mobileUser]),

      // Playlist Management
      Permission(id: 'playlists.create', module: 'playlists', action: 'create', description: 'Create playlists', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'playlists.delete', module: 'playlists', action: 'delete', description: 'Delete playlists', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'playlists.generate', module: 'playlists', action: 'generate', description: 'Generate AI playlists', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'playlists.manage', module: 'playlists', action: 'manage', description: 'Manage playlists', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'playlists.view', module: 'playlists', action: 'view', description: 'View playlists', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin, Role.mobileUser]),
      Permission(id: 'playlists.access', module: 'playlists', action: 'access', description: 'Access playlists', defaultRoles: [Role.mobileUser]),

      // Analytics & Reports
      Permission(id: 'analytics.platform', module: 'analytics', action: 'platform', description: 'View platform analytics', defaultRoles: [Role.developerSuperAdmin]),
      Permission(id: 'analytics.content', module: 'analytics', action: 'content', description: 'View content analytics', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'analytics.view', module: 'analytics', action: 'view', description: 'View analytics', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'reports.view', module: 'reports', action: 'view', description: 'View reports', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'reports.export', module: 'reports', action: 'export', description: 'Export reports', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),

      // Settings
      Permission(id: 'settings.platform', module: 'settings', action: 'platform', description: 'Platform settings', defaultRoles: [Role.developerSuperAdmin]),
      Permission(id: 'settings.organization', module: 'settings', action: 'organization', description: 'Organization settings', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'settings.manage', module: 'settings', action: 'manage', description: 'Manage settings', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'settings.view', module: 'settings', action: 'view', description: 'View settings', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin, Role.mobileUser]),

      // Media & Storage
      Permission(id: 'media.upload', module: 'media', action: 'upload', description: 'Upload media', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'media.delete', module: 'media', action: 'delete', description: 'Delete media', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'media.manage', module: 'media', action: 'manage', description: 'Manage media', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'media.view', module: 'media', action: 'view', description: 'View media', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin, Role.mobileUser]),

      // Search
      Permission(id: 'search.execute', module: 'search', action: 'execute', description: 'Execute search', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin, Role.mobileUser]),
      Permission(id: 'search.manage', module: 'search', action: 'manage', description: 'Manage search index', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),

      // Recommendation & AI
      Permission(id: 'recommendations.manage', module: 'recommendations', action: 'manage', description: 'Manage recommendations', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'recommendations.view', module: 'recommendations', action: 'view', description: 'View recommendations', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin, Role.mobileUser]),
      Permission(id: 'ai.manage', module: 'ai', action: 'manage', description: 'Manage AI services', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),

      // Support
      Permission(id: 'support.view', module: 'support', action: 'view', description: 'View support', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      Permission(id: 'support.manage', module: 'support', action: 'manage', description: 'Manage support', defaultRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),

      // Mobile User Permissions
      Permission(id: 'mobile.profile', module: 'mobile', action: 'profile', description: 'Manage own profile', defaultRoles: [Role.mobileUser]),
      Permission(id: 'mobile.search', module: 'mobile', action: 'search', description: 'Search content', defaultRoles: [Role.mobileUser]),
      Permission(id: 'mobile.library', module: 'mobile', action: 'library', description: 'Access library', defaultRoles: [Role.mobileUser]),
      Permission(id: 'mobile.audio', module: 'mobile', action: 'audio', description: 'Play audio', defaultRoles: [Role.mobileUser]),
      Permission(id: 'mobile.books', module: 'mobile', action: 'books', description: 'Read books', defaultRoles: [Role.mobileUser]),
      Permission(id: 'mobile.stuti', module: 'mobile', action: 'stuti', description: 'Access stuti vinati', defaultRoles: [Role.mobileUser]),
      Permission(id: 'mobile.notifications', module: 'mobile', action: 'notifications', description: 'Receive notifications', defaultRoles: [Role.mobileUser]),
      Permission(id: 'mobile.bookmarks', module: 'mobile', action: 'bookmarks', description: 'Manage bookmarks', defaultRoles: [Role.mobileUser]),
      Permission(id: 'mobile.favorites', module: 'mobile', action: 'favorites', description: 'Manage favorites', defaultRoles: [Role.mobileUser]),
      Permission(id: 'mobile.history', module: 'mobile', action: 'history', description: 'View history', defaultRoles: [Role.mobileUser]),
      Permission(id: 'mobile.recommendations', module: 'mobile', action: 'recommendations', description: 'View recommendations', defaultRoles: [Role.mobileUser]),
      Permission(id: 'mobile.playlists', module: 'mobile', action: 'playlists', description: 'Access playlists', defaultRoles: [Role.mobileUser]),
      Permission(id: 'mobile.downloads', module: 'mobile', action: 'downloads', description: 'Manage downloads', defaultRoles: [Role.mobileUser]),
      Permission(id: 'mobile.settings', module: 'mobile', action: 'settings', description: 'Manage app settings', defaultRoles: [Role.mobileUser]),
    ];

    for (final p in permissions) {
      _permissions[p.id] = p;
    }

    // ==================== FEATURE FLAG REGISTRY ====================
    final flags = <FeatureFlag>[
      FeatureFlag(id: 'feature.audio', name: 'Audio Module', description: 'Enable audio module', enabled: true, allowedRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin, Role.mobileUser]),
      FeatureFlag(id: 'feature.books', name: 'Books Module', description: 'Enable books module', enabled: true, allowedRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin, Role.mobileUser]),
      FeatureFlag(id: 'feature.banners', name: 'Banners Module', description: 'Enable banners module', enabled: true, allowedRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin, Role.mobileUser]),
      FeatureFlag(id: 'feature.notifications', name: 'Notifications Module', description: 'Enable notifications module', enabled: true, allowedRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin, Role.mobileUser]),
      FeatureFlag(id: 'feature.playlists', name: 'Playlists Module', description: 'Enable playlists module', enabled: true, allowedRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin, Role.mobileUser]),
      FeatureFlag(id: 'feature.analytics', name: 'Analytics Module', description: 'Enable analytics module', enabled: true, allowedRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      FeatureFlag(id: 'feature.suvichar', name: 'Suvichar Module', description: 'Enable suvichar module', enabled: true, allowedRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin, Role.mobileUser]),
      FeatureFlag(id: 'feature.media', name: 'Media Module', description: 'Enable media module', enabled: true, allowedRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin]),
      FeatureFlag(id: 'feature.recommendations', name: 'Recommendations', description: 'Enable AI recommendations', enabled: true, allowedRoles: [Role.developerSuperAdmin, Role.clientSuperAdmin, Role.mobileUser]),
      FeatureFlag(id: 'feature.offline', name: 'Offline Support', description: 'Enable offline mode', enabled: false, allowedRoles: [Role.mobileUser]),
    ];

    for (final f in flags) {
      _featureFlags[f.id] = f;
    }
  }

  /// Role hierarchy: higher index = more privileges
  static const List<Role> roleHierarchy = [
    Role.mobileUser,
    Role.clientSuperAdmin,
    Role.developerSuperAdmin,
  ];

  bool hasPermission(Role role, String permissionId) {
    _initialize();
    final permission = _permissions[permissionId];
    if (permission == null) return false; // Unknown permission = deny (fail closed)
    return permission.hasRole(role);
  }

  bool hasAnyPermission(Role role, List<String> permissionIds) {
    return permissionIds.any((id) => hasPermission(role, id));
  }

  bool hasAllPermissions(Role role, List<String> permissionIds) {
    return permissionIds.every((id) => hasPermission(role, id));
  }

  bool isFeatureEnabled(String featureId, Role role) {
    _initialize();
    final flag = _featureFlags[featureId];
    if (flag == null) return false;
    return flag.isEnabledFor(role);
  }

  List<Permission> getPermissionsForRole(Role role) {
    _initialize();
    return _permissions.values.where((p) => p.hasRole(role)).toList();
  }

  List<FeatureFlag> getEnabledFeaturesForRole(Role role) {
    _initialize();
    return _featureFlags.values.where((f) => f.enabled && (f.allowedRoles == null || f.allowedRoles!.contains(role))).toList();
  }

  AuthorizationResult authorize(PermissionContext context, String permissionId) {
    // 1. Check account status
    if (context.isSuspended) {
      return AuthorizationResult.denied(
        reason: 'Account is suspended',
        requiredPermission: permissionId,
        userRole: context.role,
      );
    }

    // 2. Check permission
    final hasPerm = hasPermission(context.role, permissionId);
    if (!hasPerm) {
      return AuthorizationResult.denied(
        reason: 'Insufficient permissions: $permissionId required',
        requiredPermission: permissionId,
        userRole: context.role,
      );
    }

    // 3. Check feature flag if applicable
    final permission = _permissions[permissionId];
    if (permission != null) {
      final featureId = 'feature.${permission.module}';
      if (!isFeatureEnabled(featureId, context.role)) {
        return AuthorizationResult.denied(
          reason: 'Feature not enabled: $featureId',
          requiredPermission: permissionId,
          userRole: context.role,
        );
      }
    }

    return AuthorizationResult.allowed(userRole: context.role);
  }

  AuthorizationResult authorizeAll(PermissionContext context, List<String> permissionIds) {
    for (final pid in permissionIds) {
      final result = authorize(context, pid);
      if (!result.allowed) return result;
    }
    return AuthorizationResult.allowed(userRole: context.role);
  }

  AuthorizationResult authorizeAny(PermissionContext context, List<String> permissionIds) {
    for (final pid in permissionIds) {
      final result = authorize(context, pid);
      if (result.allowed) return result;
    }
    return AuthorizationResult.denied(
      reason: 'None of the required permissions granted: ${permissionIds.join(', ')}',
      requiredPermission: permissionIds.first,
      userRole: context.role,
    );
  }

  bool canManageRole(Role managerRole, Role targetRole) {
    return managerRole.canManage(targetRole);
  }

  AuthorizationResult validateRoleAssignment(Role callerRole, Role targetRole, bool isSelf) {
    if (isSelf) {
      return AuthorizationResult.denied(reason: 'Self-promotion forbidden', userRole: callerRole);
    }
    if (!canManageRole(callerRole, targetRole)) {
      return AuthorizationResult.denied(
        reason: 'Insufficient privileges to assign ${targetRole.value}',
        userRole: callerRole,
      );
    }
    return AuthorizationResult.allowed(userRole: callerRole);
  }

  Permission? getPermission(String permissionId) {
    _initialize();
    return _permissions[permissionId];
  }

  FeatureFlag? getFeatureFlag(String featureId) {
    _initialize();
    return _featureFlags[featureId];
  }
}

// Singleton instance
final permissionEngine = PermissionEngine();

/// Create PermissionContext from Firebase custom claims
PermissionContext createPermissionContext(Map<String, dynamic> claims) {
  final role = RoleExtension.fromString(claims['role'] as String? ?? 'mobile_user');
  return PermissionContext(
    uid: claims['user_id'] as String? ?? '',
    role: role,
    organizationId: claims['organizationId'] as String?,
    isSuspended: (claims['accountStatus'] as String?) == 'suspended',
    customClaims: claims,
  );
}

/// Middleware helpers for use in Flutter
AuthorizationResult requirePermission(PermissionContext context, String permissionId) {
  return permissionEngine.authorize(context, permissionId);
}

AuthorizationResult requireRole(PermissionContext context, List<Role> allowedRoles) {
  if (!allowedRoles.contains(context.role)) {
    return AuthorizationResult.denied(
      reason: 'Role ${context.role.value} not authorized. Required: ${allowedRoles.map((r) => r.value).join(', ')}',
      userRole: context.role,
    );
  }
  if (context.isSuspended) {
    return AuthorizationResult.denied(reason: 'Account is suspended', userRole: context.role);
  }
  return AuthorizationResult.allowed(userRole: context.role);
}

AuthorizationResult requireFeature(PermissionContext context, String featureId) {
  if (!permissionEngine.isFeatureEnabled(featureId, context.role)) {
    return AuthorizationResult.denied(
      reason: 'Feature not enabled: $featureId',
      userRole: context.role,
    );
  }
  return AuthorizationResult.allowed(userRole: context.role);
}