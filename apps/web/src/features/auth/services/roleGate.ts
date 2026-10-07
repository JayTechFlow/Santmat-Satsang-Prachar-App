import { UserRole } from '../../../types/common/index';

/**
 * ============================================================================
 * Admin claim-gating contract (pure, unit-testable)
 * ============================================================================
 * An account may enter the admin portal only when:
 * 1. The ID token carries an admin claim (`admin === true` or role claim), OR
 * 2. The Firestore user profile carries role `developer_super_admin` or
 *    `client_super_admin`,
 * AND the account is not suspended. Non-admin / suspended sessions must be
 * signed out immediately.
 *
 * `mobile_user` accounts must never gain admin access.
 */

export interface AdminGateResult {
  allowed: boolean;
  suspended: boolean;
}

export const ADMIN_ROLES = ['developer_super_admin', 'client_super_admin'] as const;

export function isAdminAllowed(
  claims: Record<string, unknown>,
  firestoreRole?: string,
): AdminGateResult {
  const role = (claims.role as string) || firestoreRole || '';
  const isAdmin =
    claims.admin === true ||
    role === 'developer_super_admin' ||
    role === 'client_super_admin';
  const suspended = claims.accountStatus === 'suspended' || claims.suspended === true;
  return { allowed: isAdmin && !suspended, suspended };
}

export function resolvesAdminRole(claims: Record<string, unknown>, firestoreRole?: string): UserRole {
  return (claims.role as UserRole) || (firestoreRole as UserRole) || 'mobile_user';
}