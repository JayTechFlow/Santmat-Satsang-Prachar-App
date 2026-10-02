import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAddDoc = vi.fn();
const mockSetDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockBatchCommit = vi.fn();
const mockBatchSet = vi.fn();
const mockWriteBatch = vi.fn(() => ({
  set: mockBatchSet,
  commit: mockBatchCommit,
}));
const mockCollection = vi.fn((...args: any[]) => ({ type: 'collection', path: args.slice(1).join('/') }));
const mockDoc = vi.fn((...args: any[]) => ({ type: 'doc', path: args.slice(1).join('/') }));
const mockOnSnapshot = vi.fn();
const mockServerTimestamp = vi.fn(() => 'SERVER_TIMESTAMP');
const mockHttpsCallable = vi.fn(() => vi.fn().mockResolvedValue({}));

vi.mock('../../../lib/firebase/config', () => ({
  db: { type: 'firestore' },
  functions: { type: 'functions' },
}));

vi.mock('firebase/firestore', () => ({
  collection: (...args: any[]) => mockCollection(...args),
  doc: (...args: any[]) => mockDoc(...args),
  addDoc: (...args: any[]) => mockAddDoc(...args),
  setDoc: (...args: any[]) => mockSetDoc(...args),
  deleteDoc: (...args: any[]) => mockDeleteDoc(...args),
  writeBatch: (...args: any[]) => mockWriteBatch(...args),
  onSnapshot: (...args: any[]) => mockOnSnapshot(...args),
  serverTimestamp: () => mockServerTimestamp(),
}));

vi.mock('firebase/functions', () => ({
  httpsCallable: (...args: any[]) => mockHttpsCallable(...args),
}));

import { notificationService, normalizeNotificationEntity } from '../services/notificationService';

describe('notificationService — Canonical Contract & Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAddDoc.mockResolvedValue({ id: 'generated-notif-123' });
    mockSetDoc.mockResolvedValue(undefined);
    mockDeleteDoc.mockResolvedValue(undefined);
    mockBatchCommit.mockResolvedValue(undefined);
  });

  describe('normalizeNotificationEntity', () => {
    it('normalizes notifications properly with fallback values', () => {
      const entity = normalizeNotificationEntity('n-1', {
        title: ' Test Title ',
        message: ' Test Message ',
        type: 'bhajan',
      });
      expect(entity.id).toBe('n-1');
      expect(entity.title).toBe('Test Title');
      expect(entity.message).toBe('Test Message');
      expect(entity.type).toBe('bhajan');
      expect(entity.isRead).toBe(false);
    });
  });

  describe('addNotification', () => {
    it('omits isRead from global notifications collection payload', async () => {
      const result = await notificationService.addNotification({
        title: 'New Bhajan Alert',
        message: 'Check out the new bhajan',
        type: 'bhajan',
        isRead: false,
      } as any);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('generated-notif-123');

      expect(mockAddDoc).toHaveBeenCalledTimes(1);
      const payloadWritten = mockAddDoc.mock.calls[0][1];

      // CRITICAL CONTRACT CHECK: isRead MUST NOT be written to global notifications collection
      expect(payloadWritten).not.toHaveProperty('isRead');
      expect(payloadWritten.title).toBe('New Bhajan Alert');
      expect(payloadWritten.message).toBe('Check out the new bhajan');
      expect(payloadWritten.type).toBe('bhajan');
    });

    it('surfaces broadcast failure warning while keeping the saved record', async () => {
      const callFn = vi.fn().mockRejectedValue(new Error('FCM topic full'));
      mockHttpsCallable.mockReturnValue(callFn);

      const result = await notificationService.addNotification({
        title: 'Announcement',
        message: 'Satsang today',
        type: 'special',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('पुश ब्रॉडकास्ट विफल रहा');
      expect(result.data?.id).toBe('generated-notif-123');
    });

    it('returns error response when addDoc fails', async () => {
      mockAddDoc.mockRejectedValue(new Error('Permission denied on create'));

      const result = await notificationService.addNotification({
        title: 'Title',
        message: 'Message',
        type: 'special',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Permission denied on create');
    });
  });

  describe('markAsRead', () => {
    it('writes read state to users/{uid}/notification_state/{id}', async () => {
      const result = await notificationService.markAsRead('notif-99', 'admin-uid-456');

      expect(result.success).toBe(true);
      expect(mockDoc).toHaveBeenCalledWith(
        expect.anything(),
        'users',
        'admin-uid-456',
        'notification_state',
        'notif-99'
      );
      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: 'users/admin-uid-456/notification_state/notif-99' }),
        { isRead: true, readAt: 'SERVER_TIMESTAMP' },
        { merge: true }
      );
    });

    it('returns error when uid is missing', async () => {
      const result = await notificationService.markAsRead('notif-99', '');
      expect(result.success).toBe(false);
      expect(result.error).toContain('User ID is required');
      expect(mockSetDoc).not.toHaveBeenCalled();
    });

    it('surfaces error when Firestore setDoc fails (no fake success)', async () => {
      mockSetDoc.mockRejectedValue(new Error('Firestore permission-denied'));

      const result = await notificationService.markAsRead('notif-99', 'admin-uid-456');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Firestore permission-denied');
    });
  });

  describe('markAllAsRead', () => {
    it('uses batch write to set read state for all notifications under users/{uid}/notification_state', async () => {
      const result = await notificationService.markAllAsRead('admin-uid-789', ['notif-1', 'notif-2']);

      expect(result.success).toBe(true);
      expect(mockWriteBatch).toHaveBeenCalledTimes(1);
      expect(mockBatchSet).toHaveBeenCalledTimes(2);

      expect(mockDoc).toHaveBeenCalledWith(
        expect.anything(),
        'users',
        'admin-uid-789',
        'notification_state',
        'notif-1'
      );
      expect(mockDoc).toHaveBeenCalledWith(
        expect.anything(),
        'users',
        'admin-uid-789',
        'notification_state',
        'notif-2'
      );

      expect(mockBatchSet).toHaveBeenCalledWith(
        expect.objectContaining({ path: 'users/admin-uid-789/notification_state/notif-1' }),
        { isRead: true, readAt: 'SERVER_TIMESTAMP' },
        { merge: true }
      );
      expect(mockBatchSet).toHaveBeenCalledWith(
        expect.objectContaining({ path: 'users/admin-uid-789/notification_state/notif-2' }),
        { isRead: true, readAt: 'SERVER_TIMESTAMP' },
        { merge: true }
      );

      expect(mockBatchCommit).toHaveBeenCalledTimes(1);
    });

    it('returns error when uid is missing', async () => {
      const result = await notificationService.markAllAsRead('', ['notif-1']);
      expect(result.success).toBe(false);
      expect(result.error).toContain('User ID is required');
    });

    it('handles empty notification list cleanly', async () => {
      const result = await notificationService.markAllAsRead('admin-uid-123', []);
      expect(result.success).toBe(true);
      expect(mockBatchCommit).not.toHaveBeenCalled();
    });

    it('surfaces error when batch commit fails', async () => {
      mockBatchCommit.mockRejectedValue(new Error('Batch commit failed'));

      const result = await notificationService.markAllAsRead('admin-uid-123', ['notif-1']);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Batch commit failed');
    });
  });

  describe('subscribeNotifications — Multi-Admin State Merging', () => {
    it('merges global notification content with user notification_state correctly', () => {
      let globalCallback: (snap: any) => void = () => {};
      let stateCallback: (snap: any) => void = () => {};

      mockOnSnapshot.mockImplementation((ref: any, onNext: (snap: any) => void) => {
        if (ref.path === 'notifications') {
          globalCallback = onNext;
        } else if (ref.path === 'users/admin-a/notification_state') {
          stateCallback = onNext;
        }
        return () => {};
      });

      const callback = vi.fn();
      notificationService.subscribeNotifications('admin-a', callback);

      // Trigger global snapshot with 2 notifications
      globalCallback({
        docs: [
          { id: 'notif-1', data: () => ({ title: 'Notif 1', message: 'Msg 1', type: 'special' }) },
          { id: 'notif-2', data: () => ({ title: 'Notif 2', message: 'Msg 2', type: 'bhajan' }) },
        ],
      });

      expect(callback).toHaveBeenCalledWith([
        expect.objectContaining({ id: 'notif-1', isRead: false }),
        expect.objectContaining({ id: 'notif-2', isRead: false }),
      ]);

      // Trigger user state snapshot where notif-1 is read and notif-2 is soft deleted
      stateCallback({
        docs: [
          { id: 'notif-1', data: () => ({ isRead: true }) },
          { id: 'notif-2', data: () => ({ isDeleted: true }) },
        ],
      });

      expect(callback).toHaveBeenLastCalledWith([
        expect.objectContaining({ id: 'notif-1', isRead: true }),
      ]);
    });
  });

  describe('deleteNotification', () => {
    it('hard deletes the global notification document from notifications collection', async () => {
      const result = await notificationService.deleteNotification('notif-777');

      expect(result.success).toBe(true);
      expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'notifications', 'notif-777');
      expect(mockDeleteDoc).toHaveBeenCalledWith(expect.objectContaining({ path: 'notifications/notif-777' }));
    });
  });
});
