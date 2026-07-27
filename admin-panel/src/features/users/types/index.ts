import type { EntityWithAudit } from '../../../core/services/BaseCrudService';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'archived';

export interface UserDTO {
  id: string; // Firebase UID
  employeeId?: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  designation?: string;
  department?: string;
  roleIds: string[];
  status: UserStatus;
  lastLoginAt?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
}

export type UserViewModel = EntityWithAudit<UserDTO>;

export interface RoleDTO {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  priority: number;
  isSystemRole: boolean;
}

export type RoleViewModel = EntityWithAudit<RoleDTO>;

export interface PermissionDTO {
  id: string;
  module: string;
  action: string;
  description: string;
}
