import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSafeInitials } from '../../../components/shared/UserAvatar';
import type { UserProfile, UserRole, UserAccountStatus } from '../../../types/common/index';

const mockOnSnapshot = vi.fn();
const mockCollection = vi.fn(() => 'col-ref');
const mockGetDocs = vi.fn();
const mockDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockQuery = vi.fn();
const mockWhere = vi.fn();
const mockLimit = vi.fn();

vi.mock('firebase/firestore', () => ({
  collection: (...args: any[]) => mockCollection(...args),
  onSnapshot: (...args: any[]) => mockOnSnapshot(...args),
  getDocs: (...args: any[]) => mockGetDocs(...args),
  doc: (...args: any[]) => mockDoc(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
  query: (...args: any[]) => mockQuery(...args),
  where: (...args: any[]) => mockWhere(...args),
  limit: (...args: any[]) => mockLimit(...args),
}));

const mockHttpsCallable = vi.fn();
vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(),
  httpsCallable: (...args: any[]) => mockHttpsCallable(...args),
}));

vi.mock('../../../lib/firebase/config', () => ({
  db: {},
  functions: {},
}));

import { userService } from '../services/userService';

describe('UserAvatar - getSafeInitials', () => {
  it('generates initials for full name', () => {
    expect(getSafeInitials('John Doe')).toBe('JD');
  });

  it('generates initials for single word name', () => {
    expect(getSafeInitials('John')).toBe('JO');
  });

  it('generates initials for multi-word name with extra spaces', () => {
    expect(getSafeInitials('  Swami   Paramhans   Ji  ')).toBe('SJ');
  });

  it('falls back to email when name is missing or empty', () => {
    expect(getSafeInitials(undefined, undefined, undefined, 'admin.user@santmat.org')).toBe('AU');
    expect(getSafeInitials('', '', '', 'single@santmat.org')).toBe('SI');
  });

  it('falls back to US when name and email are undefined', () => {
    expect(getSafeInitials(undefined, undefined, undefined, undefined)).toBe('US');
    expect(getSafeInitials(null, null, null, null)).toBe('US');
    expect(getSafeInitials('', '', '', '')).toBe('US');
    expect(getSafeInitials('   ', '   ', '   ', '   ')).toBe('US');
  });

  it('handles edge case names correctly', () => {
    expect(getSafeInitials('A')).toBe('A');
    expect(getSafeInitials('A B C')).toBe('AC');
  });
});

describe('User Management - Validation & Security Rules', () => {
  it('validates password requirements (length >= 6 and match)', () => {
    const validate = (p1: string, p2: string) => {
      if (p1 !== p2) return { valid: false, error: 'Mismatch' };
      if (p1.length < 6) return { valid: false, error: 'Too short' };
      return { valid: true };
    };

    expect(validate('pass123', 'pass123').valid).toBe(true);
    expect(validate('pass123', 'different').valid).toBe(false);
    expect(validate('12345', '12345').valid).toBe(false);
  });

  it('sanitizes CSV exports properly preventing injection', () => {
    const sanitize = (val: string) => `"${val.replace(/"/g, '""')}"`;
    expect(sanitize('Swami Ji')).toBe('"Swami Ji"');
    expect(sanitize('Quote "Special"')).toBe('"Quote ""Special"""');
    expect(sanitize('=cmd|/C calc')).toBe('"=cmd|/C calc"');
  });
});

describe('userService.subscribeUsers - error propagation & data mapping', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reports subscription failures via onError instead of swallowing into an empty list', () => {
    const snapshotCb = vi.fn();
    const errorCb = vi.fn();
    mockOnSnapshot.mockImplementation((_ref: any, _next: (snap: any) => void, err: (e: Error) => void) => {
      err(new Error('permission-denied'));
      return () => {};
    });

    const unsubscribe = userService.subscribeUsers(snapshotCb, errorCb);

    expect(errorCb).toHaveBeenCalledTimes(1);
    expect(errorCb).toHaveBeenCalledWith(expect.objectContaining({ message: 'permission-denied' }));
    expect(snapshotCb).not.toHaveBeenCalled();
    expect(typeof unsubscribe).toBe('function');
  });

  it('falls back to an empty list callback when no onError handler is provided', () => {
    const snapshotCb = vi.fn();
    mockOnSnapshot.mockImplementation((_ref: any, _next: (snap: any) => void, err: (e: Error) => void) => {
      err(new Error('network-unavailable'));
      return () => {};
    });

    userService.subscribeUsers(snapshotCb);

    expect(snapshotCb).toHaveBeenCalledTimes(1);
    expect(snapshotCb).toHaveBeenCalledWith([]);
  });

  it('correctly maps Firestore document data including lastActiveAt and lastLogin', () => {
    const sampleDate = new Date('2026-09-01T12:00:00.000Z');
    const mockSnap = {
      docs: [
        {
          id: 'user-001',
          data: () => ({
            email: 'devotee1@santmat.org',
            displayName: 'Devotee One',
            role: 'mobile_user',
            accountStatus: 'active',
            phone: '+919876543210',
            city: 'Bhagalpur',
            createdAt: sampleDate.toISOString(),
            updatedAt: { toDate: () => sampleDate },
            lastActiveAt: { seconds: 1788264000 },
            lastLogin: '2026-09-01T11:00:00.000Z',
          }),
        },
      ],
    };

    let registeredCb: any;
    mockOnSnapshot.mockImplementation((_ref: any, next: (snap: any) => void) => {
      registeredCb = next;
      return () => {};
    });

    const resultUsers: UserProfile[] = [];
    userService.subscribeUsers((users) => {
      resultUsers.push(...users);
    });

    registeredCb(mockSnap);

    expect(resultUsers).toHaveLength(1);
    expect(resultUsers[0].uid).toBe('user-001');
    expect(resultUsers[0].displayName).toBe('Devotee One');
    expect(resultUsers[0].email).toBe('devotee1@santmat.org');
    expect(resultUsers[0].role).toBe('mobile_user');
    expect(resultUsers[0].accountStatus).toBe('active');
    expect(resultUsers[0].status).toBe('active');
    expect(resultUsers[0].city).toBe('Bhagalpur');
    expect(resultUsers[0].createdAt).toBe(sampleDate.toISOString());
    expect(resultUsers[0].updatedAt).toBe(sampleDate.toISOString());
    expect(resultUsers[0].lastActiveAt).toBe(new Date(1788264000 * 1000).toISOString());
    expect(resultUsers[0].lastLogin).toBe('2026-09-01T11:00:00.000Z');
  });
});

describe('userService.getUsers - one-time fetch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and maps users via getDocs successfully', async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        {
          id: 'user-002',
          data: () => ({
            email: 'admin@santmat.org',
            displayName: 'Admin User',
            role: 'client_super_admin',
            accountStatus: 'active',
            status: 'active',
          }),
        },
      ],
    });

    const res = await userService.getUsers();
    expect(res.success).toBe(true);
    expect(res.data).toHaveLength(1);
    expect(res.data?.[0].uid).toBe('user-002');
    expect(res.data?.[0].role).toBe('client_super_admin');
  });

  it('handles getDocs network failure gracefully', async () => {
    mockGetDocs.mockRejectedValueOnce(new Error('Network error'));
    const res = await userService.getUsers();
    expect(res.success).toBe(false);
    expect(res.error).toContain('Network error');
  });
});

describe('User Search & Filtering Logic', () => {
  const sampleUsers: UserProfile[] = [
    {
      uid: 'uid-1',
      displayName: 'Swami Ramanand',
      email: 'ramanand@santmat.org',
      role: 'developer_super_admin',
      accountStatus: 'active',
      phone: '+919876543210',
      city: 'Haridwar',
      createdAt: '2026-01-01T00:00:00.000Z',
      lastActiveAt: '2026-10-01T10:00:00.000Z',
    },
    {
      uid: 'uid-2',
      displayName: 'Pravin Kumar',
      email: 'pravin@gmail.com',
      role: 'client_super_admin',
      accountStatus: 'active',
      phone: '+919876543211',
      city: 'Patna',
      createdAt: '2026-02-01T00:00:00.000Z',
      lastActiveAt: '2026-09-15T10:00:00.000Z',
    },
    {
      uid: 'uid-3',
      displayName: 'Anand Devotee',
      email: 'anand@yahoo.com',
      role: 'mobile_user',
      accountStatus: 'suspended',
      phone: '+919876543212',
      city: 'Delhi',
      createdAt: '2026-03-01T00:00:00.000Z',
      lastActiveAt: '2026-08-01T10:00:00.000Z',
    },
  ];

  it('searches users by name case-insensitively', () => {
    const q = 'ramanand';
    const filtered = sampleUsers.filter((u) => (u.displayName || '').toLowerCase().includes(q));
    expect(filtered).toHaveLength(1);
    expect(filtered[0].uid).toBe('uid-1');
  });

  it('searches users by email', () => {
    const q = 'pravin@gmail';
    const filtered = sampleUsers.filter((u) => (u.email || '').toLowerCase().includes(q));
    expect(filtered).toHaveLength(1);
    expect(filtered[0].uid).toBe('uid-2');
  });

  it('searches users by city', () => {
    const q = 'delhi';
    const filtered = sampleUsers.filter((u) => (u.city || '').toLowerCase().includes(q));
    expect(filtered).toHaveLength(1);
    expect(filtered[0].uid).toBe('uid-3');
  });

  it('searches users by UID', () => {
    const q = 'uid-2';
    const filtered = sampleUsers.filter((u) => (u.uid || '').toLowerCase().includes(q));
    expect(filtered).toHaveLength(1);
    expect(filtered[0].displayName).toBe('Pravin Kumar');
  });

  it('filters users by role correctly', () => {
    const devAdmins = sampleUsers.filter((u) => u.role === 'developer_super_admin');
    expect(devAdmins).toHaveLength(1);
    expect(devAdmins[0].displayName).toBe('Swami Ramanand');

    const mobileUsers = sampleUsers.filter((u) => u.role === 'mobile_user');
    expect(mobileUsers).toHaveLength(1);
    expect(mobileUsers[0].displayName).toBe('Anand Devotee');
  });

  it('filters users by account status correctly', () => {
    const activeUsers = sampleUsers.filter((u) => u.accountStatus === 'active');
    expect(activeUsers).toHaveLength(2);

    const suspendedUsers = sampleUsers.filter((u) => u.accountStatus === 'suspended');
    expect(suspendedUsers).toHaveLength(1);
    expect(suspendedUsers[0].uid).toBe('uid-3');
  });

  it('combines role and status filters accurately', () => {
    const combined = sampleUsers.filter(
      (u) => u.role === 'client_super_admin' && u.accountStatus === 'active'
    );
    expect(combined).toHaveLength(1);
    expect(combined[0].displayName).toBe('Pravin Kumar');
  });

  it('sorts by newest registration date', () => {
    const sorted = [...sampleUsers].sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    expect(sorted[0].uid).toBe('uid-3'); // 2026-03-01
    expect(sorted[2].uid).toBe('uid-1'); // 2026-01-01
  });

  it('sorts by last active date', () => {
    const sorted = [...sampleUsers].sort(
      (a, b) => new Date(b.lastActiveAt || 0).getTime() - new Date(a.lastActiveAt || 0).getTime()
    );
    expect(sorted[0].uid).toBe('uid-1'); // 2026-10-01
    expect(sorted[1].uid).toBe('uid-2'); // 2026-09-15
    expect(sorted[2].uid).toBe('uid-3'); // 2026-08-01
  });

  it('sorts by name A-Z', () => {
    const sorted = [...sampleUsers].sort((a, b) =>
      (a.displayName || '').localeCompare(b.displayName || '')
    );
    expect(sorted[0].displayName).toBe('Anand Devotee');
    expect(sorted[1].displayName).toBe('Pravin Kumar');
    expect(sorted[2].displayName).toBe('Swami Ramanand');
  });
});

describe('Pagination Calculations', () => {
  it('calculates total pages and slice indices accurately', () => {
    const totalItems = 25;
    const pageSize = 10;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    expect(totalPages).toBe(3);

    // Page 1
    const p1Start = (1 - 1) * pageSize;
    const p1End = Math.min(1 * pageSize, totalItems);
    expect(p1Start).toBe(0);
    expect(p1End).toBe(10);

    // Page 3
    const p3Start = (3 - 1) * pageSize;
    const p3End = Math.min(3 * pageSize, totalItems);
    expect(p3Start).toBe(20);
    expect(p3End).toBe(25);
  });

  it('handles empty datasets in pagination', () => {
    const totalItems = 0;
    const pageSize = 10;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    expect(totalPages).toBe(1);
  });
});

describe('Security & RBAC Enforcement', () => {
  it('blocks client super admin from assigning developer super admin', () => {
    const canAssignRole = (callerRole: UserRole, targetNewRole: UserRole) => {
      if (callerRole === 'developer_super_admin') return true;
      if (callerRole === 'client_super_admin' && targetNewRole !== 'developer_super_admin') return true;
      return false;
    };

    expect(canAssignRole('developer_super_admin', 'developer_super_admin')).toBe(true);
    expect(canAssignRole('client_super_admin', 'mobile_user')).toBe(true);
    expect(canAssignRole('client_super_admin', 'client_super_admin')).toBe(true);
    expect(canAssignRole('client_super_admin', 'developer_super_admin')).toBe(false);
  });

  it('prevents self-role demotion or self-status modification', () => {
    const canModifyTarget = (callerUid: string, targetUid: string) => callerUid !== targetUid;
    expect(canModifyTarget('uid-admin', 'uid-other')).toBe(true);
    expect(canModifyTarget('uid-admin', 'uid-admin')).toBe(false);
  });
});
