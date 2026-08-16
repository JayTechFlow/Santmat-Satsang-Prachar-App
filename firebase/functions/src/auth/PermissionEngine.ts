// Sprint E1 — Enterprise Permission Engine
// Single source of truth for all authorization decisions.
// ONLY THREE ROLES EXIST: developer_super_admin, client_super_admin, mobile_user
// NO NEW ROLES. Permissions only.

export type Role = 'developer_super_admin' | 'client_super_admin' | 'mobile_user';

export interface Permission {
  id: string;
  module: string;
  action: string;
  description: string;
  // Which roles have this permission by default
  defaultRoles: Role[];
}

export interface PermissionContext {
  uid: string;
  role: Role;
  organizationId?: string;
  accountStatus: 'active' | 'suspended';
  customClaims?: Record<string, unknown>;
}

export interface AuthorizationResult {
  allowed: boolean;
  reason?: string;
  requiredPermission?: string;
  userRole?: Role;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  // Optional: restrict to specific roles
  allowedRoles?: Role[];
}

/**
 * FEATURE PERMISSION REGISTRY
 * All permissions are defined here. NO NEW ROLES.
 * If a new permission is needed, add it here with the appropriate defaultRoles.
 */
export const PERMISSION_REGISTRY: Permission[] = [
  // ==================== PLATFORM CONFIGURATION (Developer Super Admin Only) ====================
  { id: 'platform.config', module: 'platform', action: 'config', description: 'Configure platform settings', defaultRoles: ['developer_super_admin'] },
  { id: 'platform.firebase', module: 'platform', action: 'firebase', description: 'Manage Firebase configuration', defaultRoles: ['developer_super_admin'] },
  { id: 'platform.storage', module: 'platform', action: 'storage', description: 'Manage storage configuration', defaultRoles: ['developer_super_admin'] },
  { id: 'platform.functions', module: 'platform', action: 'functions', description: 'Manage Cloud Functions', defaultRoles: ['developer_super_admin'] },
  { id: 'platform.ai', module: 'platform', action: 'ai', description: 'Configure AI services', defaultRoles: ['developer_super_admin'] },
  { id: 'platform.analytics', module: 'platform', action: 'analytics', description: 'View platform analytics', defaultRoles: ['developer_super_admin'] },
  { id: 'platform.monitoring', module: 'platform', action: 'monitoring', description: 'System monitoring', defaultRoles: ['developer_super_admin'] },
  { id: 'platform.tenant', module: 'platform', action: 'tenant', description: 'Manage tenants', defaultRoles: ['developer_super_admin'] },
  { id: 'platform.settings', module: 'platform', action: 'settings', description: 'System settings', defaultRoles: ['developer_super_admin'] },
  { id: 'platform.security', module: 'platform', action: 'security', description: 'Platform security', defaultRoles: ['developer_super_admin'] },
  { id: 'platform.disaster_recovery', module: 'platform', action: 'disaster_recovery', description: 'Disaster recovery', defaultRoles: ['developer_super_admin'] },
  { id: 'platform.billing', module: 'platform', action: 'billing', description: 'Billing management', defaultRoles: ['developer_super_admin'] },
  { id: 'platform.rbac', module: 'platform', action: 'rbac', description: 'RBAC and permissions', defaultRoles: ['developer_super_admin'] },
  { id: 'platform.audit_logs', module: 'platform', action: 'audit_logs', description: 'View audit logs', defaultRoles: ['developer_super_admin'] },

  // ==================== RBAC & PERMISSIONS (Developer Super Admin + Client Super Admin Read) ====================
  { id: 'rbac.manage', module: 'rbac', action: 'manage', description: 'Manage roles and permissions', defaultRoles: ['developer_super_admin'] },
  { id: 'rbac.view', module: 'rbac', action: 'view', description: 'View roles and permissions', defaultRoles: ['developer_super_admin', 'client_super_admin'] },

  // ==================== USER MANAGEMENT ====================
  { id: 'users.manage', module: 'users', action: 'manage', description: 'Full user management', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'users.view', module: 'users', action: 'view', description: 'View users', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'users.create', module: 'users', action: 'create', description: 'Create users', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'users.update', module: 'users', action: 'update', description: 'Update users', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'users.delete', module: 'users', action: 'delete', description: 'Delete users', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'users.assign_role', module: 'users', action: 'assign_role', description: 'Assign roles to users', defaultRoles: ['developer_super_admin', 'client_super_admin'] },

  // ==================== AUDIO MANAGEMENT ====================
  { id: 'audio.upload', module: 'audio', action: 'upload', description: 'Upload audio content', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'audio.delete', module: 'audio', action: 'delete', description: 'Delete audio content', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'audio.publish', module: 'audio', action: 'publish', description: 'Publish audio content', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'audio.manage', module: 'audio', action: 'manage', description: 'Manage audio library', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'audio.view', module: 'audio', action: 'view', description: 'View audio content', defaultRoles: ['developer_super_admin', 'client_super_admin', 'mobile_user'] },

  // ==================== BOOKS MANAGEMENT ====================
  { id: 'books.upload', module: 'books', action: 'upload', description: 'Upload books', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'books.delete', module: 'books', action: 'delete', description: 'Delete books', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'books.publish', module: 'books', action: 'publish', description: 'Publish books', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'books.manage', module: 'books', action: 'manage', description: 'Manage books library', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'books.read', module: 'books', action: 'read', description: 'Read books', defaultRoles: ['developer_super_admin', 'client_super_admin', 'mobile_user'] },

  // ==================== BANNER MANAGEMENT ====================
  { id: 'banners.upload', module: 'banners', action: 'upload', description: 'Upload banners', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'banners.delete', module: 'banners', action: 'delete', description: 'Delete banners', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'banners.manage', module: 'banners', action: 'manage', description: 'Manage banners', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'banners.view', module: 'banners', action: 'view', description: 'View banners', defaultRoles: ['developer_super_admin', 'client_super_admin', 'mobile_user'] },

  // ==================== STUTI VINATI MANAGEMENT ====================
  { id: 'stuti.upload', module: 'stuti', action: 'upload', description: 'Upload stuti content', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'stuti.delete', module: 'stuti', action: 'delete', description: 'Delete stuti content', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'stuti.publish', module: 'stuti', action: 'publish', description: 'Publish stuti content', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'stuti.manage', module: 'stuti', action: 'manage', description: 'Manage stuti vinati', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'stuti.read', module: 'stuti', action: 'read', description: 'Read stuti vinati', defaultRoles: ['developer_super_admin', 'client_super_admin', 'mobile_user'] },

  // ==================== CATEGORY MANAGEMENT ====================
  { id: 'categories.create', module: 'categories', action: 'create', description: 'Create categories', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'categories.delete', module: 'categories', action: 'delete', description: 'Delete categories', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'categories.manage', module: 'categories', action: 'manage', description: 'Manage categories', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'categories.view', module: 'categories', action: 'view', description: 'View categories', defaultRoles: ['developer_super_admin', 'client_super_admin', 'mobile_user'] },

  // ==================== EVENT MANAGEMENT ====================
  { id: 'events.create', module: 'events', action: 'create', description: 'Create events', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'events.delete', module: 'events', action: 'delete', description: 'Delete events', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'events.manage', module: 'events', action: 'manage', description: 'Manage events', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'events.view', module: 'events', action: 'view', description: 'View events', defaultRoles: ['developer_super_admin', 'client_super_admin', 'mobile_user'] },

  // ==================== NOTIFICATION MANAGEMENT ====================
  { id: 'notifications.send', module: 'notifications', action: 'send', description: 'Send notifications', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'notifications.schedule', module: 'notifications', action: 'schedule', description: 'Schedule notifications', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'notifications.manage', module: 'notifications', action: 'manage', description: 'Manage notifications', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'notifications.view', module: 'notifications', action: 'view', description: 'View notifications', defaultRoles: ['developer_super_admin', 'client_super_admin', 'mobile_user'] },
  { id: 'notifications.receive', module: 'notifications', action: 'receive', description: 'Receive push notifications', defaultRoles: ['mobile_user'] },

  // ==================== PLAYLIST MANAGEMENT ====================
  { id: 'playlists.create', module: 'playlists', action: 'create', description: 'Create playlists', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'playlists.delete', module: 'playlists', action: 'delete', description: 'Delete playlists', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'playlists.generate', module: 'playlists', action: 'generate', description: 'Generate AI playlists', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'playlists.manage', module: 'playlists', action: 'manage', description: 'Manage playlists', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'playlists.view', module: 'playlists', action: 'view', description: 'View playlists', defaultRoles: ['developer_super_admin', 'client_super_admin', 'mobile_user'] },
  { id: 'playlists.access', module: 'playlists', action: 'access', description: 'Access playlists', defaultRoles: ['mobile_user'] },

  // ==================== ANALYTICS & REPORTS ====================
  { id: 'analytics.platform', module: 'analytics', action: 'platform', description: 'View platform analytics', defaultRoles: ['developer_super_admin'] },
  { id: 'analytics.content', module: 'analytics', action: 'content', description: 'View content analytics', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'analytics.view', module: 'analytics', action: 'view', description: 'View analytics', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'reports.view', module: 'reports', action: 'view', description: 'View reports', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'reports.export', module: 'reports', action: 'export', description: 'Export reports', defaultRoles: ['developer_super_admin', 'client_super_admin'] },

  // ==================== SETTINGS ====================
  { id: 'settings.platform', module: 'settings', action: 'platform', description: 'Platform settings', defaultRoles: ['developer_super_admin'] },
  { id: 'settings.organization', module: 'settings', action: 'organization', description: 'Organization settings', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'settings.manage', module: 'settings', action: 'manage', description: 'Manage settings', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'settings.view', module: 'settings', action: 'view', description: 'View settings', defaultRoles: ['developer_super_admin', 'client_super_admin', 'mobile_user'] },

  // ==================== MEDIA & STORAGE ====================
  { id: 'media.upload', module: 'media', action: 'upload', description: 'Upload media', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'media.delete', module: 'media', action: 'delete', description: 'Delete media', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'media.manage', module: 'media', action: 'manage', description: 'Manage media', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'media.view', module: 'media', action: 'view', description: 'View media', defaultRoles: ['developer_super_admin', 'client_super_admin', 'mobile_user'] },

  // ==================== SEARCH ====================
  { id: 'search.execute', module: 'search', action: 'execute', description: 'Execute search', defaultRoles: ['developer_super_admin', 'client_super_admin', 'mobile_user'] },
  { id: 'search.manage', module: 'search', action: 'manage', description: 'Manage search index', defaultRoles: ['developer_super_admin', 'client_super_admin'] },

  // ==================== RECOMMENDATION & AI ====================
  { id: 'recommendations.manage', module: 'recommendations', action: 'manage', description: 'Manage recommendations', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'recommendations.view', module: 'recommendations', action: 'view', description: 'View recommendations', defaultRoles: ['developer_super_admin', 'client_super_admin', 'mobile_user'] },
  { id: 'ai.manage', module: 'ai', action: 'manage', description: 'Manage AI services', defaultRoles: ['developer_super_admin', 'client_super_admin'] },

  // ==================== SUPPORT ====================
  { id: 'support.view', module: 'support', action: 'view', description: 'View support', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'support.manage', module: 'support', action: 'manage', description: 'Manage support', defaultRoles: ['developer_super_admin', 'client_super_admin'] },

  // ==================== MOBILE USER PERMISSIONS ====================
  { id: 'mobile.profile', module: 'mobile', action: 'profile', description: 'Manage own profile', defaultRoles: ['mobile_user'] },
  { id: 'mobile.search', module: 'mobile', action: 'search', description: 'Search content', defaultRoles: ['mobile_user'] },
  { id: 'mobile.library', module: 'mobile', action: 'library', description: 'Access library', defaultRoles: ['mobile_user'] },
  { id: 'mobile.audio', module: 'mobile', action: 'audio', description: 'Play audio', defaultRoles: ['mobile_user'] },
  { id: 'mobile.books', module: 'mobile', action: 'books', description: 'Read books', defaultRoles: ['mobile_user'] },
  { id: 'mobile.stuti', module: 'mobile', action: 'stuti', description: 'Access stuti vinati', defaultRoles: ['mobile_user'] },
  { id: 'mobile.notifications', module: 'mobile', action: 'notifications', description: 'Receive notifications', defaultRoles: ['mobile_user'] },
  { id: 'mobile.bookmarks', module: 'mobile', action: 'bookmarks', description: 'Manage bookmarks', defaultRoles: ['mobile_user'] },
  { id: 'mobile.favorites', module: 'mobile', action: 'favorites', description: 'Manage favorites', defaultRoles: ['mobile_user'] },
  { id: 'mobile.history', module: 'mobile', action: 'history', description: 'View history', defaultRoles: ['mobile_user'] },
  { id: 'mobile.recommendations', module: 'mobile', action: 'recommendations', description: 'View recommendations', defaultRoles: ['mobile_user'] },
  { id: 'mobile.playlists', module: 'mobile', action: 'playlists', description: 'Access playlists', defaultRoles: ['mobile_user'] },
  { id: 'mobile.downloads', module: 'mobile', action: 'downloads', description: 'Manage downloads', defaultRoles: ['mobile_user'] },
  { id: 'mobile.settings', module: 'mobile', action: 'settings', description: 'Manage app settings', defaultRoles: ['mobile_user'] },
];

/**
 * FEATURE FLAG REGISTRY
 * Feature flags for gradual rollout and tenant-specific features.
 */
export const FEATURE_FLAGS: FeatureFlag[] = [
  { id: 'feature.audio', name: 'Audio Module', description: 'Enable audio module', enabled: true, allowedRoles: ['developer_super_admin', 'client_super_admin', 'mobile_user'] },
  { id: 'feature.books', name: 'Books Module', description: 'Enable books module', enabled: true, allowedRoles: ['developer_super_admin', 'client_super_admin', 'mobile_user'] },
  { id: 'feature.banners', name: 'Banners Module', description: 'Enable banners module', enabled: true, allowedRoles: ['developer_super_admin', 'client_super_admin', 'mobile_user'] },
  { id: 'feature.notifications', name: 'Notifications Module', description: 'Enable notifications module', enabled: true, allowedRoles: ['developer_super_admin', 'client_super_admin', 'mobile_user'] },
  { id: 'feature.playlists', name: 'Playlists Module', description: 'Enable playlists module', enabled: true, allowedRoles: ['developer_super_admin', 'client_super_admin', 'mobile_user'] },
  { id: 'feature.analytics', name: 'Analytics Module', description: 'Enable analytics module', enabled: true, allowedRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'feature.suvichar', name: 'Suvichar Module', description: 'Enable suvichar module', enabled: true, allowedRoles: ['developer_super_admin', 'client_super_admin', 'mobile_user'] },
  { id: 'feature.media', name: 'Media Module', description: 'Enable media module', enabled: true, allowedRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'feature.recommendations', name: 'Recommendations', description: 'Enable AI recommendations', enabled: true, allowedRoles: ['developer_super_admin', 'client_super_admin', 'mobile_user'] },
  { id: 'feature.offline', name: 'Offline Support', description: 'Enable offline mode', enabled: false, allowedRoles: ['mobile_user'] },
];

// Role hierarchy: higher index = more privileges
export const ROLE_HIERARCHY: Role[] = ['mobile_user', 'client_super_admin', 'developer_super_admin'];

/**
 * PermissionEngine - Central authorization engine
 * All authorization decisions go through this class.
 */
export class PermissionEngine {
  private static instance: PermissionEngine;
  private permissions: Map<string, Permission>;
  private featureFlags: Map<string, FeatureFlag>;

  private constructor() {
    this.permissions = new Map(PERMISSION_REGISTRY.map(p => [p.id, p]));
    this.featureFlags = new Map(FEATURE_FLAGS.map(f => [f.id, f]));
  }

  public static getInstance(): PermissionEngine {
    if (!PermissionEngine.instance) {
      PermissionEngine.instance = new PermissionEngine();
    }
    return PermissionEngine.instance;
  }

  /**
   * Check if a role has a specific permission
   */
  public hasPermission(role: Role, permissionId: string): boolean {
    const permission = this.permissions.get(permissionId);
    if (!permission) {
      // Unknown permission = deny by default (fail closed)
      return false;
    }
    return permission.defaultRoles.includes(role);
  }

  /**
   * Check if a role has ANY of the given permissions (OR logic)
   */
  public hasAnyPermission(role: Role, permissionIds: string[]): boolean {
    return permissionIds.some(id => this.hasPermission(role, id));
  }

  /**
   * Check if a role has ALL of the given permissions (AND logic)
   */
  public hasAllPermissions(role: Role, permissionIds: string[]): boolean {
    return permissionIds.every(id => this.hasPermission(role, id));
  }

  /**
   * Check if a feature flag is enabled for a role
   */
  public isFeatureEnabled(featureId: string, role: Role): boolean {
    const flag = this.featureFlags.get(featureId);
    if (!flag) return false;
    if (!flag.enabled) return false;
    if (flag.allowedRoles && !flag.allowedRoles.includes(role)) return false;
    return true;
  }

  /**
   * Get all permissions for a role
   */
  public getPermissionsForRole(role: Role): Permission[] {
    return PERMISSION_REGISTRY.filter(p => p.defaultRoles.includes(role));
  }

  /**
   * Get all enabled feature flags for a role
   */
  public getEnabledFeaturesForRole(role: Role): FeatureFlag[] {
    return FEATURE_FLAGS.filter(f => f.enabled && (!f.allowedRoles || f.allowedRoles.includes(role)));
  }

  /**
   * Main authorization method - evaluates if a user can perform an action
   */
  public authorize(context: PermissionContext, permissionId: string): AuthorizationResult {
    // 1. Check account status
    if (context.accountStatus === 'suspended') {
      return { allowed: false, reason: 'Account is suspended', requiredPermission: permissionId, userRole: context.role };
    }

    // 2. Check permission
    const hasPerm = this.hasPermission(context.role, permissionId);
    if (!hasPerm) {
      return { 
        allowed: false, 
        reason: `Insufficient permissions: ${permissionId} required`, 
        requiredPermission: permissionId, 
        userRole: context.role 
      };
    }

    // 3. Check feature flag if applicable
    const permission = this.permissions.get(permissionId);
    if (permission) {
      const featureId = `feature.${permission.module}`;
      if (!this.isFeatureEnabled(featureId, context.role)) {
        return { 
          allowed: false, 
          reason: `Feature not enabled: ${featureId}`, 
          requiredPermission: permissionId, 
          userRole: context.role 
        };
      }
    }

    return { allowed: true, userRole: context.role };
  }

  /**
   * Authorize multiple permissions (all must pass)
   */
  public authorizeAll(context: PermissionContext, permissionIds: string[]): AuthorizationResult {
    for (const pid of permissionIds) {
      const result = this.authorize(context, pid);
      if (!result.allowed) return result;
    }
    return { allowed: true, userRole: context.role };
  }

  /**
   * Authorize at least one permission (any can pass)
   */
  public authorizeAny(context: PermissionContext, permissionIds: string[]): AuthorizationResult {
    for (const pid of permissionIds) {
      const result = this.authorize(context, pid);
      if (result.allowed) return result;
    }
    return { 
      allowed: false, 
      reason: `None of the required permissions granted: ${permissionIds.join(', ')}`, 
      requiredPermission: permissionIds[0], 
      userRole: context.role 
    };
  }

  /**
   * Check if role A can manage role B (hierarchy check)
   */
  public canManageRole(managerRole: Role, targetRole: Role): boolean {
    const managerIndex = ROLE_HIERARCHY.indexOf(managerRole);
    const targetIndex = ROLE_HIERARCHY.indexOf(targetRole);
    return managerIndex > targetIndex;
  }

  /**
   * Validate role assignment (prevents privilege escalation)
   */
  public validateRoleAssignment(callerRole: Role, targetRole: Role, isSelf: boolean): AuthorizationResult {
    if (isSelf) {
      return { allowed: false, reason: 'Self-promotion forbidden', userRole: callerRole };
    }

    if (!this.canManageRole(callerRole, targetRole)) {
      return { 
        allowed: false, 
        reason: `Insufficient privileges to assign ${targetRole}`, 
        userRole: callerRole 
      };
    }

    return { allowed: true, userRole: callerRole };
  }

  /**
   * Get permission by ID
   */
  public getPermission(permissionId: string): Permission | undefined {
    return this.permissions.get(permissionId);
  }

  /**
   * Get feature flag by ID
   */
  public getFeatureFlag(featureId: string): FeatureFlag | undefined {
    return this.featureFlags.get(featureId);
  }
}

// Export singleton instance
export const permissionEngine = PermissionEngine.getInstance();

// Helper function for Cloud Functions middleware
// Using interface to avoid direct firebase-functions dependency

export interface CallableAuthContext {
  auth?: {
    uid: string;
    token: Record<string, unknown>;
  };
}

export function createPermissionContext(
  context: CallableAuthContext
): PermissionContext {
  const token = context.auth?.token || {};
  const role = (token.role as Role) || 'mobile_user';
  return {
    uid: context.auth?.uid || '',
    role,
    organizationId: token.organizationId as string,
    accountStatus: (token.accountStatus as 'active' | 'suspended') || 'active',
    customClaims: token,
  };
}