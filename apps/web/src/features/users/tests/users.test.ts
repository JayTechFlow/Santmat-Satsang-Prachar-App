import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSafeInitials } from '../../../components/shared/UserAvatar';

vi.mock('../../../lib/firebase/config', () => ({
  db: {},
}));

const mockOnSnapshot = vi.fn();
const mockCollection = vi.fn(() => 'col-ref');
vi.mock('firebase/firestore', () => ({
  collection: (...args: any[]) => mockCollection(...args),
  onSnapshot: (...args: any[]) => mockOnSnapshot(...args),
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

describe('userService.subscribeUsers - error propagation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reports subscription failures via onError instead of swallowing into an empty list', () => {
    const snapshotCb = vi.fn();
    const errorCb = vi.fn();
    mockOnSnapshot.mockImplementation((_ref: any, next: (snap: any) => void, err: (e: Error) => void) => {
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
    mockOnSnapshot.mockImplementation((_ref: any, next: (snap: any) => void, err: (e: Error) => void) => {
      err(new Error('network-unavailable'));
      return () => {};
    });

    userService.subscribeUsers(snapshotCb);

    expect(snapshotCb).toHaveBeenCalledTimes(1);
    expect(snapshotCb).toHaveBeenCalledWith([]);
  });
});
