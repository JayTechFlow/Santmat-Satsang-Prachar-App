import { describe, it, expect } from 'vitest';
import { isAdminAllowed, resolvesAdminRole, ADMIN_ROLES } from '../features/auth/services/roleGate';
import { PERMISSION_REGISTRY } from '../app/providers/PermissionContext';

describe('Admin Access Control Gate (roleGate.ts)', () => {
  it('lift phase: permits privileged role claims', () => {
    expect(isAdminAllowed({ role: 'developer_super_admin' })).toEqual({ allowed: true, suspended: false });
    expect(isAdminAllowed({ role: 'client_super_admin' })).toEqual({ allowed: true, suspended: false });
    expect(isAdminAllowed({ admin: true })).toEqual({ allowed: true, suspended: false });
  });

  it('permissive fallback: a Firestore profile role also lifts the gate', () => {
    expect(isAdminAllowed({}, 'developer_super_admin')).toEqual({ allowed: true, suspended: false });
    expect(isAdminAllowed({}, 'client_super_admin')).toEqual({ allowed: true, suspended: false });
  });

  it('denies: mobile_user can never enter the admin portal', () => {
    expect(isAdminAllowed({ role: 'mobile_user' })).toEqual({ allowed: false, suspended: false });
    expect(isAdminAllowed({}, 'mobile_user')).toEqual({ allowed: false, suspended: false });
    expect(isAdminAllowed({}, '')).toEqual({ allowed: false, suspended: false });
    expect(isAdminAllowed({})).toEqual({ allowed: false, suspended: false });
  });

  it('suspended accounts are denied even with admin claims', () => {
    expect(isAdminAllowed({ role: 'developer_super_admin', accountStatus: 'suspended' })).toEqual({
      allowed: false,
      suspended: true,
    });
    expect(isAdminAllowed({ role: 'client_super_admin', suspended: true })).toEqual({
      allowed: false,
      suspended: true,
    });
    expect(isAdminAllowed({ admin: true, accountStatus: 'suspended' })).toEqual({
      allowed: false,
      suspended: true,
    });
  });

  it('resolves the effective admin role from claims first, then Firestore, then mobile_user', () => {
    expect(resolvesAdminRole({ role: 'client_super_admin' }, 'mobile_user')).toBe('client_super_admin');
    expect(resolvesAdminRole({}, 'developer_super_admin')).toBe('developer_super_admin');
    expect(resolvesAdminRole({}, '')).toBe('mobile_user');
    expect(resolvesAdminRole({})).toBe('mobile_user');
  });

  it('admits exactly the two super-admin roles as ADMIN_ROLES', () => {
    expect(ADMIN_ROLES).toEqual(['developer_super_admin', 'client_super_admin']);
  });
});

describe('Permission Registry Parity for the Admin Gate', () => {
  it('admin manage permissions are granted ONLY to super-admin roles, never mobile_user', () => {
    const adminPerms = PERMISSION_REGISTRY.filter((p) =>
      p.id.startsWith('admin') || ['users.manage', 'categories.manage', 'audio.manage', 'stuti.manage'].includes(p.id)
    );
    expect(adminPerms.length).toBeGreaterThan(0);
    for (const perm of adminPerms) {
      expect(perm.defaultRoles).toContain('developer_super_admin');
      expect(perm.defaultRoles).toContain('client_super_admin');
      expect(perm.defaultRoles).not.toContain('mobile_user');
    }
  });

  it('mobile-only capabilities stay out of the admin gate (push receive, offline)', () => {
    for (const perm of PERMISSION_REGISTRY) {
      if (perm.defaultRoles.length === 1 && perm.defaultRoles[0] === 'mobile_user') {
        expect(perm.id === 'notifications.receive' || perm.id === 'feature.offline').toBe(true);
      }
    }
  });
});