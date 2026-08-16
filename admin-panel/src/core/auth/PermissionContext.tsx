// Sprint E1 — Admin Panel Permission Context (React/TypeScript)
// Self-contained permission state management for admin dashboard.
// Does NOT depend on backend modules.

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authService } from '../services/authService';

// ==================== TYPES ====================

export type AdminRole = 'developer_super_admin' | 'client_super_admin' | 'mobile_user';

export interface PermissionContext {
  uid: string;
  role: AdminRole;
  organizationId?: string;
  accountStatus: 'active' | 'suspended';
  customClaims?: Record<string, unknown>;
}

export interface AuthorizationResult {
  allowed: boolean;
  reason?: string;
  requiredPermission?: string;
  userRole?: AdminRole;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  allowedRoles?: AdminRole[];
}

// ==================== PERMISSION REGISTRY ====================

interface Permission {
  id: string;
  module: string;
  action: string;
  description: string;
  defaultRoles: AdminRole[];
}

export const PERMISSION_REGISTRY: Permission[] = [
  // Platform Configuration (Developer Super Admin Only)
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

  // RBAC & Permissions
  { id: 'rbac.manage', module: 'rbac', action: 'manage', description: 'Manage roles and permissions', defaultRoles: ['developer_super_admin'] },
  { id: 'rbac.view', module: 'rbac', action: 'view', description: 'View roles and permissions', defaultRoles: ['developer_super_admin', 'client_super_admin'] },

  // User Management
  { id: 'users.manage', module: 'users', action: 'manage', description: 'Full user management', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'users.view', module: 'users', action: 'view', description: 'View users', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'users.create', module: 'users', action: 'create', description: 'Create users', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'users.update', module: 'users', action: 'update', description: 'Update users', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'users.delete', module: 'users', action: 'delete', description: 'Delete users', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'users.assign_role', module: 'users', action: 'assign_role', description: 'Assign roles to users', defaultRoles: ['developer_super_admin', 'client_super_admin'] },

  // Audio Management
  { id: 'audio.upload', module: 'audio', action: 'upload', description: 'Upload audio content', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'audio.delete', module: 'audio', action: 'delete', description: 'Delete audio content', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'audio.publish', module: 'audio', action: 'publish', description: 'Publish audio content', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'audio.manage', module: 'audio', action: 'manage', description: 'Manage audio library', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'audio.view', module: 'audio', action: 'view', description: 'View audio content', defaultRoles: ['developer_super_admin', 'client_super_admin', 'mobile_user'] },

  // Books Management
  { id: 'books.upload', module: 'books', action: 'upload', description: 'Upload books', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'books.delete', module: 'books', action: 'delete', description: 'Delete books', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'books.publish', module: 'books', action: 'publish', description: 'Publish books', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'books.manage', module: 'books', action: 'manage', description: 'Manage books library', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'books.read', module: 'books', action: 'read', description: 'Read books', defaultRoles: ['developer_super_admin', 'client_super_admin', 'mobile_user'] },

  // Banner Management
  { id: 'banners.upload', module: 'banners', action: 'upload', description: 'Upload banners', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'banners.delete', module: 'banners', action: 'delete', description: 'Delete banners', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'banners.manage', module: 'banners', action: 'manage', description: 'Manage banners', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'banners.view', module: 'banners', action: 'view', description: 'View banners', defaultRoles: ['developer_super_admin', 'client_super_admin', 'mobile_user'] },

  // Stuti Vinati Management
  { id: 'stuti.upload', module: 'stuti', action: 'upload', description: 'Upload stuti content', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'stuti.delete', module: 'stuti', action: 'delete', description: 'Delete stuti content', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'stuti.publish', module: 'stuti', action: 'publish', description: 'Publish stuti content', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'stuti.manage', module: 'stuti', action: 'manage', description: 'Manage stuti vinati', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'stuti.read', module: 'stuti', action: 'read', description: 'Read stuti vinati', defaultRoles: ['developer_super_admin', 'client_super_admin', 'mobile_user'] },

  // Category Management
  { id: 'categories.create', module: 'categories', action: 'create', description: 'Create categories', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'categories.delete', module: 'categories', action: 'delete', description: 'Delete categories', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'categories.manage', module: 'categories', action: 'manage', description: 'Manage categories', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'categories.view', module: 'categories', action: 'view', description: 'View categories', defaultRoles: ['developer_super_admin', 'client_super_admin', 'mobile_user'] },

  // Event Management
  { id: 'events.create', module: 'events', action: 'create', description: 'Create events', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'events.delete', module: 'events', action: 'delete', description: 'Delete events', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'events.manage', module: 'events', action: 'manage', description: 'Manage events', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'events.view', module: 'events', action: 'view', description: 'View events', defaultRoles: ['developer_super_admin', 'client_super_admin', 'mobile_user'] },

  // Notification Management
  { id: 'notifications.send', module: 'notifications', action: 'send', description: 'Send notifications', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'notifications.schedule', module: 'notifications', action: 'schedule', description: 'Schedule notifications', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'notifications.manage', module: 'notifications', action: 'manage', description: 'Manage notifications', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'notifications.view', module: 'notifications', action: 'view', description: 'View notifications', defaultRoles: ['developer_super_admin', 'client_super_admin', 'mobile_user'] },
  { id: 'notifications.receive', module: 'notifications', action: 'receive', description: 'Receive push notifications', defaultRoles: ['mobile_user'] },

  // Playlist Management
  { id: 'playlists.create', module: 'playlists', action: 'create', description: 'Create playlists', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'playlists.delete', module: 'playlists', action: 'delete', description: 'Delete playlists', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'playlists.generate', module: 'playlists', action: 'generate', description: 'Generate AI playlists', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'playlists.manage', module: 'playlists', action: 'manage', description: 'Manage playlists', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'playlists.view', module: 'playlists', action: 'view', description: 'View playlists', defaultRoles: ['developer_super_admin', 'client_super_admin', 'mobile_user'] },
  { id: 'playlists.access', module: 'playlists', action: 'access', description: 'Access playlists', defaultRoles: ['mobile_user'] },

  // Analytics & Reports
  { id: 'analytics.platform', module: 'analytics', action: 'platform', description: 'View platform analytics', defaultRoles: ['developer_super_admin'] },
  { id: 'analytics.content', module: 'analytics', action: 'content', description: 'View content analytics', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'analytics.view', module: 'analytics', action: 'view', description: 'View analytics', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'reports.view', module: 'reports', action: 'view', description: 'View reports', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'reports.export', module: 'reports', action: 'export', description: 'Export reports', defaultRoles: ['developer_super_admin', 'client_super_admin'] },

  // Settings
  { id: 'settings.platform', module: 'settings', action: 'platform', description: 'Platform settings', defaultRoles: ['developer_super_admin'] },
  { id: 'settings.organization', module: 'settings', action: 'organization', description: 'Organization settings', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'settings.manage', module: 'settings', action: 'manage', description: 'Manage settings', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'settings.view', module: 'settings', action: 'view', description: 'View settings', defaultRoles: ['developer_super_admin', 'client_super_admin', 'mobile_user'] },

  // Media & Storage
  { id: 'media.upload', module: 'media', action: 'upload', description: 'Upload media', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'media.delete', module: 'media', action: 'delete', description: 'Delete media', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'media.manage', module: 'media', action: 'manage', description: 'Manage media', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'media.view', module: 'media', action: 'view', description: 'View media', defaultRoles: ['developer_super_admin', 'client_super_admin', 'mobile_user'] },

  // Search
  { id: 'search.execute', module: 'search', action: 'execute', description: 'Execute search', defaultRoles: ['developer_super_admin', 'client_super_admin', 'mobile_user'] },
  { id: 'search.manage', module: 'search', action: 'manage', description: 'Manage search index', defaultRoles: ['developer_super_admin', 'client_super_admin'] },

  // Recommendation & AI
  { id: 'recommendations.manage', module: 'recommendations', action: 'manage', description: 'Manage recommendations', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'recommendations.view', module: 'recommendations', action: 'view', description: 'View recommendations', defaultRoles: ['developer_super_admin', 'client_super_admin', 'mobile_user'] },
  { id: 'ai.manage', module: 'ai', action: 'manage', description: 'Manage AI services', defaultRoles: ['developer_super_admin', 'client_super_admin'] },

  // Support
  { id: 'support.view', module: 'support', action: 'view', description: 'View support', defaultRoles: ['developer_super_admin', 'client_super_admin'] },
  { id: 'support.manage', module: 'support', action: 'manage', description: 'Manage support', defaultRoles: ['developer_super_admin', 'client_super_admin'] },

  // Mobile User Permissions
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

export const ROLE_HIERARCHY: AdminRole[] = ['mobile_user', 'client_super_admin', 'developer_super_admin'];

// ==================== PERMISSION ENGINE ====================

export class AdminPermissionEngine {
  private static instance: AdminPermissionEngine;
  
  static getInstance(): AdminPermissionEngine {
    if (!AdminPermissionEngine.instance) {
      AdminPermissionEngine.instance = new AdminPermissionEngine();
    }
    return AdminPermissionEngine.instance;
  }

  hasPermission(role: AdminRole, permissionId: string): boolean {
    const permission = PERMISSION_REGISTRY.find(p => p.id === permissionId);
    if (!permission) return false;
    return permission.defaultRoles.includes(role);
  }

  hasAnyPermission(role: AdminRole, permissionIds: string[]): boolean {
    return permissionIds.some(id => this.hasPermission(role, id));
  }

  hasAllPermissions(role: AdminRole, permissionIds: string[]): boolean {
    return permissionIds.every(id => this.hasPermission(role, id));
  }

  isFeatureEnabled(featureId: string, role: AdminRole): boolean {
    const flag = FEATURE_FLAGS.find(f => f.id === featureId);
    if (!flag) return false;
    if (!flag.enabled) return false;
    if (flag.allowedRoles && !flag.allowedRoles.includes(role)) return false;
    return true;
  }

  canManageRole(managerRole: AdminRole, targetRole: AdminRole): boolean {
    const managerIndex = ROLE_HIERARCHY.indexOf(managerRole);
    const targetIndex = ROLE_HIERARCHY.indexOf(targetRole);
    return managerIndex > targetIndex;
  }

  validateRoleAssignment(callerRole: AdminRole, targetRole: AdminRole, isSelf: boolean): AuthorizationResult {
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

  authorize(context: PermissionContext, permissionId: string): AuthorizationResult {
    if (context.accountStatus === 'suspended') {
      return { allowed: false, reason: 'Account is suspended', requiredPermission: permissionId, userRole: context.role };
    }
    const hasPerm = this.hasPermission(context.role, permissionId);
    if (!hasPerm) {
      return { allowed: false, reason: `Insufficient permissions: ${permissionId} required`, requiredPermission: permissionId, userRole: context.role };
    }
    const permission = PERMISSION_REGISTRY.find(p => p.id === permissionId);
    if (permission) {
      const featureId = `feature.${permission.module}`;
      if (!this.isFeatureEnabled(featureId, context.role)) {
        return { allowed: false, reason: `Feature not enabled: ${featureId}`, requiredPermission: permissionId, userRole: context.role };
      }
    }
    return { allowed: true, userRole: context.role };
  }

  authorizeAll(context: PermissionContext, permissionIds: string[]): AuthorizationResult {
    for (const pid of permissionIds) {
      const result = this.authorize(context, pid);
      if (!result.allowed) return result;
    }
    return { allowed: true, userRole: context.role };
  }

  authorizeAny(context: PermissionContext, permissionIds: string[]): AuthorizationResult {
    for (const pid of permissionIds) {
      const result = this.authorize(context, pid);
      if (result.allowed) return result;
    }
    return { allowed: false, reason: `None of the required permissions granted: ${permissionIds.join(', ')}`, requiredPermission: permissionIds[0], userRole: context.role };
  }
}

const adminPermissionEngine = AdminPermissionEngine.getInstance();

// ==================== HELPER FUNCTIONS ====================

function createPermissionContext(claims: Record<string, unknown>): PermissionContext {
  const role = (claims.role as AdminRole) || 'mobile_user';
  return {
    uid: claims.user_id as string || claims.uid as string || '',
    role,
    organizationId: claims.organizationId as string,
    accountStatus: (claims.accountStatus as 'active' | 'suspended') || 'active',
    customClaims: claims,
  };
}

// ==================== CONTEXT ====================

interface AdminPermissionContextType {
  context: PermissionContext | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  hasPermission: (permissionId: string) => boolean;
  hasAnyPermission: (permissionIds: string[]) => boolean;
  hasAllPermissions: (permissionIds: string[]) => boolean;
  isFeatureEnabled: (featureId: string) => boolean;
  authorize: (permissionId: string) => AuthorizationResult;
  authorizeAll: (permissionIds: string[]) => AuthorizationResult;
  authorizeAny: (permissionIds: string[]) => AuthorizationResult;
  canManageRole: (targetRole: AdminRole) => boolean;
  validateRoleAssignment: (targetRole: AdminRole, isSelf: boolean) => AuthorizationResult;
  currentRole: AdminRole | null;
  isDeveloperSuperAdmin: boolean;
  isClientSuperAdmin: boolean;
  isMobileUser: boolean;
  isAnyAdmin: boolean;
  isSuspended: boolean;
  logout: () => Promise<void>;
}

export const AdminPermissionContext = createContext<AdminPermissionContextType | null>(null);

export function AdminPermissionProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<PermissionContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const user = authService.getCurrentUserId();
      if (user) {
        const tokenResult = await (window as any).firebase?.auth()?.currentUser?.getIdTokenResult(true);
        if (tokenResult?.claims) {
          setContext(createPermissionContext(tokenResult.claims));
        }
      }
    } catch {
      setError('Failed to load permissions');
      setContext(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setContext(null);
  };

  useEffect(() => {
    refresh();
    
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const tokenResult = await user.getIdTokenResult(true);
          if (tokenResult?.claims) {
            setContext(createPermissionContext(tokenResult.claims));
          }
        } catch {
          setContext(null);
        }
      } else {
        setContext(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const hasPermission = (permissionId: string): boolean => {
    if (!context) return false;
    return adminPermissionEngine.hasPermission(context.role, permissionId);
  };

  const hasAnyPermission = (permissionIds: string[]): boolean => {
    if (!context) return false;
    return adminPermissionEngine.hasAnyPermission(context.role, permissionIds);
  };

  const hasAllPermissions = (permissionIds: string[]): boolean => {
    if (!context) return false;
    return adminPermissionEngine.hasAllPermissions(context.role, permissionIds);
  };

  const isFeatureEnabled = (featureId: string): boolean => {
    if (!context) return false;
    return adminPermissionEngine.isFeatureEnabled(featureId, context.role);
  };

  const authorize = (permissionId: string): AuthorizationResult => {
    if (!context) return { allowed: false, reason: 'Not authenticated', requiredPermission: permissionId };
    return adminPermissionEngine.authorize(context, permissionId);
  };

  const authorizeAll = (permissionIds: string[]): AuthorizationResult => {
    if (!context) return { allowed: false, reason: 'Not authenticated', requiredPermission: permissionIds[0] };
    return adminPermissionEngine.authorizeAll(context, permissionIds);
  };

  const authorizeAny = (permissionIds: string[]): AuthorizationResult => {
    if (!context) return { allowed: false, reason: 'Not authenticated', requiredPermission: permissionIds[0] };
    return adminPermissionEngine.authorizeAny(context, permissionIds);
  };

  const canManageRole = (targetRole: AdminRole): boolean => {
    if (!context) return false;
    return adminPermissionEngine.canManageRole(context.role, targetRole);
  };

  const validateRoleAssignment = (targetRole: AdminRole, isSelf: boolean): AuthorizationResult => {
    if (!context) return { allowed: false, reason: 'Not authenticated', userRole: undefined };
    return adminPermissionEngine.validateRoleAssignment(context.role, targetRole, isSelf);
  };

  const currentRole = context?.role as AdminRole | null;
  const isDeveloperSuperAdmin = currentRole === 'developer_super_admin';
  const isClientSuperAdmin = currentRole === 'client_super_admin';
  const isMobileUser = currentRole === 'mobile_user';
  const isAnyAdmin = isDeveloperSuperAdmin || isClientSuperAdmin;
  const isSuspended = context?.accountStatus === 'suspended';

  return (
    <AdminPermissionContext.Provider
      value={{
        context,
        loading,
        error,
        refresh,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isFeatureEnabled,
        authorize,
        authorizeAll,
        authorizeAny,
        canManageRole,
        validateRoleAssignment,
        currentRole,
        isDeveloperSuperAdmin,
        isClientSuperAdmin,
        isMobileUser,
        isAnyAdmin,
        isSuspended,
        logout,
      }}
    >
      {children}
    </AdminPermissionContext.Provider>
  );
}

export function usePermissions() {
  const ctx = useContext(AdminPermissionContext);
  if (!ctx) {
    throw new Error('usePermissions must be used within AdminPermissionProvider');
  }
  return ctx;
}

export function usePermission(permissionId: string) {
  const { hasPermission } = usePermissions();
  return hasPermission(permissionId);
}

export function useFeatureFlag(featureId: string) {
  const { isFeatureEnabled } = usePermissions();
  return isFeatureEnabled(featureId);
}

export function useRoleCheck() {
  const { isDeveloperSuperAdmin, isClientSuperAdmin, isMobileUser, isAnyAdmin, currentRole, isSuspended } = usePermissions();
  return {
    isDeveloperSuperAdmin,
    isClientSuperAdmin,
    isMobileUser,
    isAnyAdmin,
    currentRole,
    isSuspended,
  };
}

// PermissionGate component
interface PermissionGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  roles?: AdminRole[];
  feature?: string;
}

export function PermissionGate({
  children,
  fallback = null,
  permission,
  permissions = [],
  requireAll = true,
  roles,
  feature,
}: PermissionGateProps) {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions, 
    isFeatureEnabled, 
    currentRole,
    isSuspended 
  } = usePermissions();

  if (isSuspended) {
    return <>{fallback}</>;
  }

  if (roles && currentRole && !roles.includes(currentRole)) {
    return <>{fallback}</>;
  }

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  if (permissions.length > 0) {
    const check = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
    if (!check) {
      return <>{fallback}</>;
    }
  }

  if (feature && !isFeatureEnabled(feature)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Convenience components
export function DeveloperOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return <PermissionGate roles={['developer_super_admin']} fallback={fallback}>{children}</PermissionGate>;
}

export function ClientAdminOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return <PermissionGate roles={['client_super_admin']} fallback={fallback}>{children}</PermissionGate>;
}

export function AdminOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return <PermissionGate roles={['developer_super_admin', 'client_super_admin']} fallback={fallback}>{children}</PermissionGate>;
}

export function MobileOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return <PermissionGate roles={['mobile_user']} fallback={fallback}>{children}</PermissionGate>;
}

export function FeatureGate({ children, fallback = null, feature }: { children: ReactNode; fallback?: ReactNode; feature: string }) {
  return <PermissionGate feature={feature} fallback={fallback}>{children}</PermissionGate>;
}

// Route access hook
export function useRouteAccess(routePath: string) {
  const { hasPermission, isFeatureEnabled, currentRole, isSuspended } = usePermissions();
  
  const routePermissions: Record<string, { 
    permissions?: string[]; 
    requireAll?: boolean; 
    roles?: AdminRole[]; 
    feature?: string; 
  }> = {
    '/': { roles: ['developer_super_admin', 'client_super_admin'] },
    '/dashboard': { roles: ['developer_super_admin', 'client_super_admin'] },
    '/users': { permissions: ['users.view'], roles: ['developer_super_admin', 'client_super_admin'] },
    '/roles': { permissions: ['rbac.view'], roles: ['developer_super_admin', 'client_super_admin'] },
    '/audio': { permissions: ['audio.manage'], feature: 'feature.audio', roles: ['developer_super_admin', 'client_super_admin'] },
    '/books': { permissions: ['books.manage'], feature: 'feature.books', roles: ['developer_super_admin', 'client_super_admin'] },
    '/stuti-vinati': { permissions: ['stuti.manage'], feature: 'feature.suvichar', roles: ['developer_super_admin', 'client_super_admin'] },
    '/categories': { permissions: ['categories.manage'], roles: ['developer_super_admin', 'client_super_admin'] },
    '/banners': { permissions: ['banners.manage'], feature: 'feature.banners', roles: ['developer_super_admin', 'client_super_admin'] },
    '/notifications': { permissions: ['notifications.manage'], feature: 'feature.notifications', roles: ['developer_super_admin', 'client_super_admin'] },
    '/playlist': { permissions: ['playlists.manage'], feature: 'feature.playlists', roles: ['developer_super_admin', 'client_super_admin'] },
    '/events': { permissions: ['events.manage'], roles: ['developer_super_admin', 'client_super_admin'] },
    '/reports': { permissions: ['reports.view'], feature: 'feature.analytics', roles: ['developer_super_admin', 'client_super_admin'] },
    '/settings': { permissions: ['settings.manage'], roles: ['developer_super_admin', 'client_super_admin'] },
    '/support': { permissions: ['support.view'], roles: ['developer_super_admin', 'client_super_admin'] },
  };

  const config = routePermissions[routePath] || { roles: ['developer_super_admin', 'client_super_admin'] };

  if (isSuspended) return false;
  if (config.roles && currentRole && !config.roles.includes(currentRole)) return false;
  if (config.permissions) {
    const check = config.requireAll !== false ? 
      config.permissions.every(p => hasPermission(p)) :
      config.permissions.some(p => hasPermission(p));
    if (!check) return false;
  }
  if (config.feature && !isFeatureEnabled(config.feature)) return false;
  
  return true;
}

// Provider exports for backward compatibility
export const isAnyAdminProvider = () => false; // Placeholder
export const isDeveloperSuperAdminProvider = () => false; // Placeholder
export const audioFeatureEnabledProvider = () => false; // Placeholder
export const booksFeatureEnabledProvider = () => false; // Placeholder
export const playlistsFeatureEnabledProvider = () => false; // Placeholder
export const analyticsFeatureEnabledProvider = () => false; // Placeholder