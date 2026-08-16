import { describe, it, expect } from 'vitest';
import { getSafeInitials } from './components/UserAvatar';

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
