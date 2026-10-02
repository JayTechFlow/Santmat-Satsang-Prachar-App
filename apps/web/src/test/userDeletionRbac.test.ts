import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService } from '../features/users/services/userService';
import * as firebaseFunctions from 'firebase/functions';

vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(),
  httpsCallable: vi.fn(),
}));

describe('Permanent User Deletion & RBAC Service Tests', () => {
  const mockTargetUid = 'devotee-uid-999';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the userProv-deleteUserPermanently cloud function with targetUid', async () => {
    const mockCallable = vi.fn().mockResolvedValue({
      data: {
        success: true,
        message: 'Devotee permanently deleted',
        targetUid: mockTargetUid,
        status: 'FULL_DELETE_SUCCESS',
      },
    });

    vi.spyOn(firebaseFunctions, 'httpsCallable').mockReturnValue(mockCallable as any);

    const result = await userService.deleteUserPermanently(mockTargetUid);

    expect(firebaseFunctions.httpsCallable).toHaveBeenCalledWith(
      undefined,
      'userProv-deleteUserPermanently'
    );
    expect(mockCallable).toHaveBeenCalledWith({ targetUid: mockTargetUid });
    expect(result.success).toBe(true);
    expect(result.data?.status).toBe('FULL_DELETE_SUCCESS');
  });

  it('handles permission-denied error when non-developer attempts permanent delete', async () => {
    const mockCallable = vi.fn().mockRejectedValue(
      new Error('Permission Denied: Permanent user deletion is restricted strictly to Developer Super Admins.')
    );

    vi.spyOn(firebaseFunctions, 'httpsCallable').mockReturnValue(mockCallable as any);

    const result = await userService.deleteUserPermanently(mockTargetUid);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Permission Denied');
    expect(result.error).toContain('Developer Super Admins');
  });

  it('handles self-deletion prevention error', async () => {
    const mockCallable = vi.fn().mockRejectedValue(
      new Error('Self-deletion is prohibited via permanent administrative delete.')
    );

    vi.spyOn(firebaseFunctions, 'httpsCallable').mockReturnValue(mockCallable as any);

    const result = await userService.deleteUserPermanently('current-user-uid');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Self-deletion is prohibited');
  });

  it('handles last active admin deletion protection', async () => {
    const mockCallable = vi.fn().mockRejectedValue(
      new Error('Cannot delete the last active Developer/Client Super Admin.')
    );

    vi.spyOn(firebaseFunctions, 'httpsCallable').mockReturnValue(mockCallable as any);

    const result = await userService.deleteUserPermanently('last-admin-uid');

    expect(result.success).toBe(false);
    expect(result.error).toContain('last active Developer/Client Super Admin');
  });
});
