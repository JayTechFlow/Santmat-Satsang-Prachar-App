import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  extractStoragePathFromUrl,
  BannerService,
  CANONICAL_SLOTS,
} from '../services/bannerService';
import type { BannerEntity, BannerSlotNumber } from '../../../types/common/index';

// Mock Firestore functions
const mockCollection = vi.fn(() => 'col-ref');
const mockDoc = vi.fn((_db, _col, id) => `doc-ref-${id}`);
const mockGetDocs = vi.fn();
const mockAddDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockOnSnapshot = vi.fn();

vi.mock('firebase/firestore', () => ({
  collection: (...args: any[]) => mockCollection(...args),
  doc: (...args: any[]) => mockDoc(...args),
  getDocs: (...args: any[]) => mockGetDocs(...args),
  addDoc: (...args: any[]) => mockAddDoc(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
  deleteDoc: (...args: any[]) => mockDeleteDoc(...args),
  onSnapshot: (...args: any[]) => mockOnSnapshot(...args),
  query: vi.fn(),
  where: vi.fn(),
}));

vi.mock('../../../lib/firebase/config', () => ({
  db: {},
  storage: {},
}));

// Mock StorageService
const mockUploadFile = vi.fn();
const mockDeleteFile = vi.fn();
const mockListFolder = vi.fn();

vi.mock('../../../services/storage/storageService', () => ({
  storageService: {
    uploadFile: (...args: any[]) => mockUploadFile(...args),
    deleteFile: (...args: any[]) => mockDeleteFile(...args),
    listFolder: (...args: any[]) => mockListFolder(...args),
  },
}));

describe('Banner CMS 4-Slot Architecture Suite', () => {
  let service: BannerService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new BannerService();
  });

  describe('extractStoragePathFromUrl', () => {
    it('correctly decodes storage path from Firebase download URL', () => {
      const url =
        'https://firebasestorage.googleapis.com/v0/b/santmat-satsang-prachar.firebasestorage.app/o/banners%2Fslot_1_1791102.webp?alt=media&token=123';
      expect(extractStoragePathFromUrl(url)).toBe('banners/slot_1_1791102.webp');
    });

    it('correctly decodes thumbnail storage path from download URL', () => {
      const url =
        'https://firebasestorage.googleapis.com/v0/b/santmat-satsang-prachar.firebasestorage.app/o/thumbnails%2Fthumb_slot_2_1791102.webp?alt=media&token=456';
      expect(extractStoragePathFromUrl(url)).toBe('thumbnails/thumb_slot_2_1791102.webp');
    });

    it('returns original input when URL does not contain /o/', () => {
      expect(extractStoragePathFromUrl('banners/slot_1.webp')).toBe('banners/slot_1.webp');
      expect(extractStoragePathFromUrl('')).toBe('');
    });
  });

  describe('Model & 4-Slot Invariants (Phase 25: 1..5)', () => {
    it('valid slot 1 is recognized and mapped properly', () => {
      const banners: BannerEntity[] = [
        {
          id: 'b1',
          slot: 1,
          title: 'Slot 1 Banner',
          imageUrl: 'https://example.com/1.webp',
          active: true,
        },
      ];
      const slots = service.mapBannersToSlots(banners);
      expect(slots[1]?.id).toBe('b1');
      expect(slots[2]).toBeNull();
      expect(slots[3]).toBeNull();
      expect(slots[4]).toBeNull();
    });

    it('valid slot 4 is recognized and mapped properly', () => {
      const banners: BannerEntity[] = [
        {
          id: 'b4',
          slot: 4,
          title: 'Slot 4 Banner',
          imageUrl: 'https://example.com/4.webp',
          active: true,
        },
      ];
      const slots = service.mapBannersToSlots(banners);
      expect(slots[4]?.id).toBe('b4');
      expect(slots[1]).toBeNull();
    });

    it('slot 0 is rejected when attempting to replace', async () => {
      const file = new File(['dummy'], 'test.webp', { type: 'image/webp' });
      const res = await service.replaceSlotBanner({
        slot: 0 as any,
        file,
        title: 'Invalid Slot',
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain('अमान्य स्लॉट');
      expect(mockUploadFile).not.toHaveBeenCalled();
    });

    it('slot 5 is rejected when attempting to replace', async () => {
      const file = new File(['dummy'], 'test.webp', { type: 'image/webp' });
      const res = await service.replaceSlotBanner({
        slot: 5 as any,
        file,
        title: 'Invalid Slot',
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain('अमान्य स्लॉट');
      expect(mockUploadFile).not.toHaveBeenCalled();
    });

    it('duplicate slot records are resolved by prioritizing the newest active banner', () => {
      const banners: BannerEntity[] = [
        {
          id: 'old-slot2',
          slot: 2,
          title: 'Old Slot 2',
          imageUrl: 'https://example.com/old.webp',
          active: true,
          updatedAt: '2026-10-01T10:00:00Z',
        },
        {
          id: 'new-slot2',
          slot: 2,
          title: 'New Canonical Slot 2',
          imageUrl: 'https://example.com/new.webp',
          active: true,
          updatedAt: '2026-10-05T12:00:00Z',
        },
      ];

      const slots = service.mapBannersToSlots(banners);
      expect(slots[2]?.id).toBe('new-slot2');
      expect(slots[2]?.title).toBe('New Canonical Slot 2');
    });
  });

  describe('List & Ordering (Phase 25: 6..10)', () => {
    it('accurately resolves four active banners in deterministic order (1 -> 4)', () => {
      const banners: BannerEntity[] = [
        { id: 'b3', slot: 3, title: 'Third', imageUrl: 'https://example.com/3.webp', active: true },
        { id: 'b1', slot: 1, title: 'First', imageUrl: 'https://example.com/1.webp', active: true },
        { id: 'b4', slot: 4, title: 'Fourth', imageUrl: 'https://example.com/4.webp', active: true },
        { id: 'b2', slot: 2, title: 'Second', imageUrl: 'https://example.com/2.webp', active: true },
      ];

      const slots = service.mapBannersToSlots(banners);
      expect(slots[1]?.id).toBe('b1');
      expect(slots[2]?.id).toBe('b2');
      expect(slots[3]?.id).toBe('b3');
      expect(slots[4]?.id).toBe('b4');
    });

    it('handles partial slots gracefully', () => {
      const banners: BannerEntity[] = [
        { id: 'b1', slot: 1, title: 'Only First', imageUrl: 'https://example.com/1.webp', active: true },
        { id: 'b3', slot: 3, title: 'Only Third', imageUrl: 'https://example.com/3.webp', active: true },
      ];

      const slots = service.mapBannersToSlots(banners);
      expect(slots[1]?.id).toBe('b1');
      expect(slots[2]).toBeNull();
      expect(slots[3]?.id).toBe('b3');
      expect(slots[4]).toBeNull();
    });

    it('handles empty state (no banners)', () => {
      const slots = service.mapBannersToSlots([]);
      expect(slots[1]).toBeNull();
      expect(slots[2]).toBeNull();
      expect(slots[3]).toBeNull();
      expect(slots[4]).toBeNull();
    });

    it('prioritizes active banners over inactive banners for the same slot', () => {
      const banners: BannerEntity[] = [
        {
          id: 'inactive-slot1',
          slot: 1,
          title: 'Inactive',
          imageUrl: 'https://example.com/in.webp',
          active: false,
          updatedAt: '2026-10-05T12:00:00Z',
        },
        {
          id: 'active-slot1',
          slot: 1,
          title: 'Active',
          imageUrl: 'https://example.com/act.webp',
          active: true,
          updatedAt: '2026-10-01T10:00:00Z',
        },
      ];

      const slots = service.mapBannersToSlots(banners);
      expect(slots[1]?.id).toBe('active-slot1');
      expect(slots[1]?.active).toBe(true);
    });
  });

  describe('Slot Upload & Replacement Lifecycle (Phase 25: 11..17, 24..29)', () => {
    it('creates or replaces Slot 1 and writes proper metadata', async () => {
      mockGetDocs.mockResolvedValueOnce({ docs: [] });
      mockUploadFile.mockResolvedValueOnce({
        success: true,
        data: {
          storagePath: 'banners/slots/slot_1_123.webp',
          downloadUrl: 'https://example.com/slot1.webp',
        },
      });
      mockAddDoc.mockResolvedValueOnce({ id: 'new-doc-1' });

      const file = new File(['dummy'], 'banner.webp', { type: 'image/webp' });
      const res = await service.replaceSlotBanner({
        slot: 1,
        file,
        title: 'पावन सत्संग १',
        targetScreen: '/audio',
      });

      expect(res.success).toBe(true);
      expect(res.data?.id).toBe('new-doc-1');
      expect(res.data?.slot).toBe(1);
      expect(res.data?.order).toBe(0);
      expect(res.data?.title).toBe('पावन सत्संग १');
      expect(mockUploadFile).toHaveBeenCalledWith(file, 'banners');
    });

    it('replaces Slot 2 with slot isolation: deletes only previous Slot 2 assets', async () => {
      // Setup existing banners: Slot 1, previous Slot 2, Slot 3, Slot 4
      mockGetDocs.mockResolvedValueOnce({
        docs: [
          {
            id: 'doc-slot1',
            data: () => ({ slot: 1, storagePath: 'banners/slot1.webp', imageUrl: 'https://ex.com/s1.webp' }),
          },
          {
            id: 'doc-old-slot2',
            data: () => ({ slot: 2, storagePath: 'banners/old_slot2.webp', imageUrl: 'https://ex.com/old_s2.webp' }),
          },
          {
            id: 'doc-slot3',
            data: () => ({ slot: 3, storagePath: 'banners/slot3.webp', imageUrl: 'https://ex.com/s3.webp' }),
          },
        ],
      });

      mockUploadFile.mockResolvedValueOnce({
        success: true,
        data: {
          storagePath: 'banners/slots/slot_2_999.webp',
          downloadUrl: 'https://example.com/new_slot2.webp',
        },
      });

      mockAddDoc.mockResolvedValueOnce({ id: 'doc-new-slot2' });

      const file = new File(['dummy'], 'new_slot2.webp', { type: 'image/webp' });
      const res = await service.replaceSlotBanner({
        slot: 2,
        file,
        title: 'अद्यतित स्लॉट २',
        targetScreen: '/books',
      });

      expect(res.success).toBe(true);
      expect(res.data?.id).toBe('doc-new-slot2');
      expect(res.data?.slot).toBe(2);

      // Verify that ONLY doc-old-slot2 was deleted from Firestore
      expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
      expect(mockDeleteDoc).toHaveBeenCalledWith('doc-ref-doc-old-slot2');

      // Verify that ONLY old_slot2.webp was deleted from Storage
      expect(mockDeleteFile).toHaveBeenCalledTimes(1);
      expect(mockDeleteFile).toHaveBeenCalledWith('banners/old_slot2.webp');

      // Crucial Invariant: Slot 1 and Slot 3 were NEVER touched!
      expect(mockDeleteDoc).not.toHaveBeenCalledWith('doc-ref-doc-slot1');
      expect(mockDeleteDoc).not.toHaveBeenCalledWith('doc-ref-doc-slot3');
      expect(mockDeleteFile).not.toHaveBeenCalledWith('banners/slot1.webp');
      expect(mockDeleteFile).not.toHaveBeenCalledWith('banners/slot3.webp');
    });

    it('rejects replacement when file is missing', async () => {
      const res = await service.replaceSlotBanner({
        slot: 1,
        file: null as any,
        title: 'No File',
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain('फ़ाइल प्रदान करें');
    });

    it('rejects replacement when title is empty', async () => {
      const file = new File(['dummy'], 'test.webp', { type: 'image/webp' });
      const res = await service.replaceSlotBanner({
        slot: 1,
        file,
        title: '   ',
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain('शीर्षक');
    });
  });

  describe('Failure & Fail-Safe Rollback (Phase 25: 30..32)', () => {
    it('upload failure preserves previous slot state without modifying database', async () => {
      mockGetDocs.mockResolvedValueOnce({ docs: [] });
      mockUploadFile.mockResolvedValueOnce({
        success: false,
        error: 'Network connection timeout during upload',
      });

      const file = new File(['dummy'], 'test.webp', { type: 'image/webp' });
      const res = await service.replaceSlotBanner({
        slot: 3,
        file,
        title: 'Failed Upload',
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('Network connection timeout');
      expect(mockAddDoc).not.toHaveBeenCalled();
      expect(mockDeleteDoc).not.toHaveBeenCalled();
    });

    it('database write failure cleans up newly uploaded storage files (fail-safe rollback)', async () => {
      mockGetDocs.mockResolvedValueOnce({ docs: [] });
      mockUploadFile.mockResolvedValueOnce({
        success: true,
        data: {
          storagePath: 'banners/slots/temp_upload.webp',
          downloadUrl: 'https://example.com/temp.webp',
        },
      });
      mockAddDoc.mockRejectedValueOnce(new Error('Firestore quota exceeded'));

      const file = new File(['dummy'], 'test.webp', { type: 'image/webp' });
      const res = await service.replaceSlotBanner({
        slot: 1,
        file,
        title: 'Quota Error',
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('Firestore quota exceeded');

      // Verify that the newly uploaded file was deleted to prevent orphaned files
      expect(mockDeleteFile).toHaveBeenCalledWith('banners/slots/temp_upload.webp');
    });
  });

  describe('Storage Integrity & 4-Slot Audit (Phase 25: 36..38)', () => {
    it('accurately identifies valid vs empty slots and orphan storage files', async () => {
      // 1 doc for Slot 1, 1 doc for Slot 2 (Slots 3 & 4 empty)
      mockGetDocs.mockResolvedValueOnce({
        docs: [
          {
            id: 'doc-s1',
            data: () => ({
              slot: 1,
              title: 'Slot 1',
              active: true,
              imageUrl: 'https://ex.com/s1.webp',
              storagePath: 'banners/slots/s1.webp',
            }),
          },
          {
            id: 'doc-s2',
            data: () => ({
              slot: 2,
              title: 'Slot 2',
              active: true,
              imageUrl: 'https://ex.com/s2.webp',
              storagePath: 'banners/slots/s2.webp',
            }),
          },
        ],
      });

      // Storage listFolder returns canonical files + 1 orphan file
      mockListFolder.mockImplementation(async (folder: string) => {
        if (folder === 'banners') {
          return {
            success: true,
            data: {
              files: [
                { name: 's1.webp', storagePath: 'banners/slots/s1.webp', size: 50000 },
                { name: 's2.webp', storagePath: 'banners/slots/s2.webp', size: 60000 },
                { name: 'orphan_old.webp', storagePath: 'banners/orphan_old.webp', size: 80000 },
              ],
            },
          };
        }
        return { success: true, data: { files: [] } };
      });

      const res = await service.audit4SlotStorageIntegrity();
      expect(res.success).toBe(true);

      const report = res.data!;
      expect(report.slots[1].valid).toBe(true);
      expect(report.slots[2].valid).toBe(true);
      expect(report.slots[3].empty).toBe(true);
      expect(report.slots[4].empty).toBe(true);

      // Orphan detection
      expect(report.orphanBannerFiles.length).toBe(1);
      expect(report.orphanBannerFiles[0].storagePath).toBe('banners/orphan_old.webp');
      expect(report.orphanTotalSizeBytes).toBe(80000);
    });

    it('safely purges verified orphan files while strictly guarding all 4 active slot assets', async () => {
      // Active slot 1 banner in Firestore
      mockGetDocs.mockResolvedValueOnce({
        docs: [
          {
            id: 'slot1-doc',
            data: () => ({
              slot: 1,
              storagePath: 'banners/slots/slot1_live.webp',
              imageUrl: 'https://ex.com/s1.webp',
              active: true,
            }),
          },
        ],
      });

      mockDeleteFile.mockResolvedValue({ success: true });

      const res = await service.purgeOrphanBannerAssets([
        'banners/orphan_to_delete.webp',
        'banners/slots/slot1_live.webp', // PROTECTED! Must be skipped!
        'audio/sacred_bhajan.mp3', // OUT OF BOUNDS! Must be skipped!
      ]);

      expect(res.success).toBe(true);
      expect(res.data?.deletedStorageCount).toBe(1);

      // Successfully deleted orphan
      expect(mockDeleteFile).toHaveBeenCalledWith('banners/orphan_to_delete.webp');

      // Canonical slot 1 was NEVER deleted
      expect(mockDeleteFile).not.toHaveBeenCalledWith('banners/slots/slot1_live.webp');

      // Non-banner folder was NEVER deleted
      expect(mockDeleteFile).not.toHaveBeenCalledWith('audio/sacred_bhajan.mp3');
    });
  });

  describe('Slot Metadata & Delete Operations (Phase 25: 46..49)', () => {
    it('updates metadata for an active slot banner', async () => {
      mockGetDocs.mockResolvedValueOnce({
        docs: [
          {
            id: 'doc-slot3',
            data: () => ({
              slot: 3,
              title: 'पुरानी उपाधि',
              targetScreen: '/audio',
              active: true,
            }),
          },
        ],
      });
      mockUpdateDoc.mockResolvedValueOnce(undefined);

      const res = await service.updateSlotMetadata(3, {
        title: 'नई उपाधि (साहित्य)',
        targetScreen: '/books',
      });

      expect(res.success).toBe(true);
      expect(res.data?.title).toBe('नई उपाधि (साहित्य)');
      expect(res.data?.targetScreen).toBe('/books');
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'doc-ref-doc-slot3',
        expect.objectContaining({
          title: 'नई उपाधि (साहित्य)',
          targetScreen: '/books',
          slot: 3,
        })
      );
    });

    it('clears Slot 4 and deletes its storage files without touching other slots', async () => {
      mockGetDocs.mockResolvedValueOnce({
        docs: [
          {
            id: 'doc-slot1',
            data: () => ({ slot: 1, storagePath: 'banners/s1.webp' }),
          },
          {
            id: 'doc-slot4',
            data: () => ({ slot: 4, storagePath: 'banners/s4.webp', thumbnailStoragePath: 'thumbnails/s4_thumb.webp' }),
          },
        ],
      });

      mockDeleteFile.mockResolvedValue({ success: true });
      mockDeleteDoc.mockResolvedValueOnce(undefined);

      const res = await service.deleteSlotBanner(4);
      expect(res.success).toBe(true);

      expect(mockDeleteFile).toHaveBeenCalledWith('banners/s4.webp');
      expect(mockDeleteFile).toHaveBeenCalledWith('thumbnails/s4_thumb.webp');
      expect(mockDeleteDoc).toHaveBeenCalledWith('doc-ref-doc-slot4');

      // Slot 1 remains completely untouched
      expect(mockDeleteFile).not.toHaveBeenCalledWith('banners/s1.webp');
      expect(mockDeleteDoc).not.toHaveBeenCalledWith('doc-ref-doc-slot1');
    });
  });
});
