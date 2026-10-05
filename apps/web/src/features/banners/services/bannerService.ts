import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase/config';
import { BannerEntity, BannerSlotNumber, ServiceResponse } from '../../../types/common/index';
import { storageService, StorageFileItem } from '../../../services/storage/storageService';

const COLLECTION_NAME = 'banners';

export const CANONICAL_SLOTS: BannerSlotNumber[] = [1, 2, 3, 4];

/**
 * Extract Firebase Storage path from download URL
 */
export function extractStoragePathFromUrl(url: string): string {
  if (!url || !url.includes('/o/')) return url;
  try {
    return decodeURIComponent(url.split('/o/')[1].split('?')[0]);
  } catch (_) {
    return url;
  }
}

export interface ReplaceSlotBannerParams {
  slot: BannerSlotNumber;
  file: File;
  thumbnailFile?: File;
  title: string;
  targetScreen?: string;
  userEmail?: string;
  width?: number;
  height?: number;
}

export interface ReplaceBannerParams extends Omit<ReplaceSlotBannerParams, 'slot'> {
  slot?: BannerSlotNumber;
}

export interface BannerSlotItem {
  slot: BannerSlotNumber;
  banner: BannerEntity | null;
  status: 'active' | 'empty' | 'inactive';
}

export interface BannerSlotIntegrity {
  valid: boolean;
  empty: boolean;
  banner: BannerEntity | null;
}

export interface BannerIntegrityReport {
  slots: Record<BannerSlotNumber, BannerSlotIntegrity>;
  liveBanner: BannerEntity | null;
  canonicalStoragePaths: string[];
  totalStorageBannerFiles: number;
  orphanBannerFiles: StorageFileItem[];
  orphanThumbnailFiles: StorageFileItem[];
  orphanTotalSizeBytes: number;
  firestoreDocCount: number;
  supersededFirestoreDocs: BannerEntity[];
}

export class BannerService {
  /**
   * Deterministically map a list of raw banner entities into the 4 canonical slots.
   * Slot invariant: slot ∈ {1, 2, 3, 4}.
   * Legacy docs without slot are mapped using order (order 0 -> slot 1, etc.).
   * If multiple docs belong to the same slot, the newest active banner is selected
   * as canonical, and others are marked superseded.
   */
  mapBannersToSlots(banners: BannerEntity[]): Record<BannerSlotNumber, BannerEntity | null> {
    const slots: Record<BannerSlotNumber, BannerEntity | null> = {
      1: null,
      2: null,
      3: null,
      4: null,
    };

    if (!banners || banners.length === 0) return slots;

    // Group banners by slot
    const slotBuckets: Record<BannerSlotNumber, BannerEntity[]> = {
      1: [],
      2: [],
      3: [],
      4: [],
    };

    for (const b of banners) {
      let resolvedSlot: BannerSlotNumber = 1;
      if (b.slot && CANONICAL_SLOTS.includes(b.slot)) {
        resolvedSlot = b.slot;
      } else if (b.order !== undefined && b.order >= 0 && b.order < 4) {
        resolvedSlot = ((b.order + 1) as BannerSlotNumber);
      } else {
        resolvedSlot = 1;
      }

      slotBuckets[resolvedSlot].push({
        ...b,
        slot: resolvedSlot,
      });
    }

    // For each slot, choose the canonical banner
    for (const slotNum of CANONICAL_SLOTS) {
      const candidates = slotBuckets[slotNum];
      if (candidates.length === 0) {
        slots[slotNum] = null;
        continue;
      }

      // Prioritize active banners
      const activeCandidates = candidates.filter((c) => c.active !== false);
      const pool = activeCandidates.length > 0 ? activeCandidates : candidates;

      // Sort by newest updatedAt or createdAt
      pool.sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      slots[slotNum] = pool[0];
    }

    return slots;
  }

  /**
   * Helper to select the primary live banner (Slot 1, or first available active slot).
   */
  selectCanonicalBanner(banners: BannerEntity[]): BannerEntity | null {
    const slots = this.mapBannersToSlots(banners);
    for (const s of CANONICAL_SLOTS) {
      if (slots[s] && slots[s]!.active) {
        return slots[s];
      }
    }
    return slots[1] || null;
  }

  /**
   * Subscribe to the 4 canonical Home Banner slots in real time.
   */
  subscribeSlotBanners(
    callback: (
      slots: Record<BannerSlotNumber, BannerEntity | null>,
      allBanners: BannerEntity[]
    ) => void,
    onError?: (error: Error) => void
  ): () => void {
    try {
      return onSnapshot(
        collection(db, COLLECTION_NAME),
        (snap) => {
          const banners: BannerEntity[] = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<BannerEntity, 'id'>),
          }));

          const slots = this.mapBannersToSlots(banners);
          callback(slots, banners);
        },
        (err) => {
          console.warn('Slot banner subscription error:', err);
          if (onError) onError(err);
          else callback({ 1: null, 2: null, 3: null, 4: null }, []);
        }
      );
    } catch (err: any) {
      if (onError) onError(err);
      return () => {};
    }
  }

  /**
   * Fetch all 4 canonical slots from Firestore.
   */
  async getSlotBanners(): Promise<ServiceResponse<Record<BannerSlotNumber, BannerEntity | null>>> {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      const banners: BannerEntity[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<BannerEntity, 'id'>),
      }));

      const slots = this.mapBannersToSlots(banners);
      return { success: true, data: slots };
    } catch (error: any) {
      return { success: false, error: error.message || 'स्लॉट बैनर्स लोड करने में विफलता।' };
    }
  }

  /**
   * Fetch all banner documents.
   */
  async getBanners(): Promise<ServiceResponse<BannerEntity[]>> {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      const banners: BannerEntity[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<BannerEntity, 'id'>),
      }));
      banners.sort((a, b) => (a.order || 0) - (b.order || 0));
      return { success: true, data: banners };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch banners' };
    }
  }

  /**
   * Legacy subscribe for backwards compatibility.
   */
  subscribeBanners(
    callback: (banners: BannerEntity[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    try {
      return onSnapshot(
        collection(db, COLLECTION_NAME),
        (snap) => {
          const banners: BannerEntity[] = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<BannerEntity, 'id'>),
          }));
          banners.sort((a, b) => (a.order || 0) - (b.order || 0));
          callback(banners);
        },
        (err) => {
          console.warn('Banner subscription error:', err);
          if (onError) onError(err);
          else callback([]);
        }
      );
    } catch (err: any) {
      if (onError) onError(err);
      return () => {};
    }
  }

  /**
   * Legacy subscribe to single canonical banner.
   */
  subscribeLiveBanner(
    callback: (banner: BannerEntity | null) => void,
    onError?: (error: Error) => void
  ): () => void {
    return this.subscribeSlotBanners(
      (slots) => {
        // Return Slot 1, or first active
        const live = slots[1] || slots[2] || slots[3] || slots[4] || null;
        callback(live);
      },
      onError
    );
  }

  /**
   * Legacy get live banner.
   */
  async getLiveBanner(): Promise<ServiceResponse<BannerEntity | null>> {
    const res = await this.getSlotBanners();
    if (!res.success || !res.data) {
      return { success: false, error: res.error || 'Failed to fetch live banner' };
    }
    const live = res.data[1] || res.data[2] || res.data[3] || res.data[4] || null;
    return { success: true, data: live };
  }

  /**
   * ATOMIC & FAIL-SAFE SLOT REPLACEMENT:
   * Replaces the banner for a specific slot N ∈ {1, 2, 3, 4}.
   *
   * STRICT SAFETY GUARANTEES:
   * 1. Validates slot ∈ {1, 2, 3, 4}.
   * 2. Finds existing documents ONLY for this slot.
   * 3. Uploads new master 1280×720 WebP to `banners/slots/slot_${slot}_${Date.now()}.webp`.
   * 4. Uploads thumbnail to `thumbnails/slots/thumb_slot_${slot}_${Date.now()}.webp`.
   * 5. Writes new canonical doc in Firestore with `slot: N`, `order: N - 1`, `active: true`.
   * 6. Deletes previous documents & previous Storage files for THIS SLOT ONLY.
   * 7. CRITICAL INVARIANT: Other slots M ≠ N are NEVER touched or deleted.
   * 8. FAIL-SAFE ROLLBACK: If upload or write fails, the existing slot asset remains untouched,
   *    and temporary uploaded files are cleaned up.
   */
  async replaceSlotBanner(
    params: ReplaceSlotBannerParams,
    onProgress?: (step: string, percentage: number) => void
  ): Promise<ServiceResponse<BannerEntity>> {
    const { slot, file, thumbnailFile, title, targetScreen = '/audio', userEmail } = params;

    // Slot validation
    if (!slot || !CANONICAL_SLOTS.includes(slot)) {
      return { success: false, error: 'अमान्य स्लॉट संख्या (केवल स्लॉट 1, 2, 3, या 4 अनुमत हैं)।' };
    }
    if (!file) {
      return { success: false, error: 'कृपया 16:9 बैनर छवि फ़ाइल प्रदान करें।' };
    }
    if (!title || !title.trim()) {
      return { success: false, error: 'कृपया बैनर का शीर्षक दर्ज करें।' };
    }

    let uploadedMasterStoragePath: string | null = null;
    let uploadedThumbStoragePath: string | null = null;

    try {
      onProgress?.(`स्लॉट ${slot} के वर्तमान डेटा का सत्यापन किया जा रहा है…`, 10);

      // Fetch all docs to locate existing docs strictly belonging to this slot
      const existingSnap = await getDocs(collection(db, COLLECTION_NAME));
      const allBanners: BannerEntity[] = existingSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<BannerEntity, 'id'>),
      }));

      // Find documents assigned to this specific slot
      const previousSlotDocs = allBanners.filter((b) => {
        if (b.slot === slot) return true;
        // Legacy order mapping: order 0 -> slot 1, etc.
        if (b.slot === undefined && b.order === slot - 1) return true;
        // If legacy single doc with no slot and slot is 1, treat as slot 1
        if (b.slot === undefined && b.order === undefined && slot === 1) return true;
        return false;
      });

      onProgress?.(`स्लॉट ${slot} के लिए नया 1280×720 WebP बैनर अपलोड किया जा रहा है…`, 30);

      // Step 3: Upload master 1280x720 banner
      const masterUploadRes = await storageService.uploadFile(
        file,
        'banners'
      );

      if (!masterUploadRes.success || !masterUploadRes.data?.downloadUrl) {
        throw new Error(masterUploadRes.error || 'मास्टर बैनर छवि अपलोड विफल हुई।');
      }
      uploadedMasterStoragePath = masterUploadRes.data.storagePath;
      const masterDownloadUrl = masterUploadRes.data.downloadUrl;

      // Step 4: Upload thumbnail
      let thumbDownloadUrl = masterDownloadUrl;
      if (thumbnailFile) {
        onProgress?.(`स्लॉट ${slot} थंबनेल अपलोड किया जा रहा है…`, 50);
        const thumbUploadRes = await storageService.uploadFile(
          thumbnailFile,
          'thumbnails'
        );
        if (thumbUploadRes.success && thumbUploadRes.data?.downloadUrl) {
          uploadedThumbStoragePath = thumbUploadRes.data.storagePath;
          thumbDownloadUrl = thumbUploadRes.data.downloadUrl;
        }
      }

      onProgress?.(`स्लॉट ${slot} का नया कैनोनिकल रिकॉर्ड सुरक्षित किया जा रहा है…`, 70);

      // Step 5: Write new canonical banner document in Firestore
      const nowIso = new Date().toISOString();
      const newBannerPayload: Omit<BannerEntity, 'id'> = {
        slot,
        order: slot - 1,
        title: title.trim(),
        imageUrl: masterDownloadUrl,
        storagePath: uploadedMasterStoragePath,
        thumbnailUrl: thumbDownloadUrl,
        thumbnailStoragePath: uploadedThumbStoragePath || undefined,
        targetScreen: targetScreen || '/audio',
        active: true,
        width: params.width || 1280,
        height: params.height || 720,
        format: 'image/webp',
        sizeBytes: file.size,
        createdAt: nowIso,
        updatedAt: nowIso,
        updatedBy: userEmail || 'admin',
      };

      const newDocRef = await addDoc(collection(db, COLLECTION_NAME), newBannerPayload);
      const newBannerEntity: BannerEntity = {
        id: newDocRef.id,
        ...newBannerPayload,
      };

      onProgress?.(`स्लॉट ${slot} की पुरानी फाइलों का सुरक्षित निष्कासन…`, 85);

      // Step 6: Permanently delete ONLY previous assets belonging to THIS slot
      for (const prev of previousSlotDocs) {
        if (prev.id === newDocRef.id) continue;

        // Delete previous doc from Firestore
        try {
          await deleteDoc(doc(db, COLLECTION_NAME, prev.id));
        } catch (docErr) {
          console.warn(`Superseded Slot ${slot} doc deletion warning:`, prev.id, docErr);
        }

        // Delete previous master Storage file
        let oldMasterPath = prev.storagePath;
        if (!oldMasterPath && prev.imageUrl) {
          const parsed = extractStoragePathFromUrl(prev.imageUrl);
          if (parsed && parsed.startsWith('banners/')) oldMasterPath = parsed;
        }
        if (oldMasterPath && oldMasterPath !== uploadedMasterStoragePath) {
          try {
            await storageService.deleteFile(oldMasterPath);
          } catch (stErr) {
            console.warn(`Superseded Slot ${slot} master storage file deletion warning:`, oldMasterPath, stErr);
          }
        }

        // Delete previous thumbnail Storage file
        let oldThumbPath = prev.thumbnailStoragePath;
        if (oldThumbPath && oldThumbPath !== uploadedThumbStoragePath) {
          try {
            await storageService.deleteFile(oldThumbPath);
          } catch (stErr) {
            console.warn(`Superseded Slot ${slot} thumb storage file deletion warning:`, oldThumbPath, stErr);
          }
        }
      }

      onProgress?.(`स्लॉट ${slot} सफलतापूर्वक सक्रिय हो गया!`, 100);
      return { success: true, data: newBannerEntity };
    } catch (error: any) {
      console.error(`Slot ${slot} replacement failed:`, error);

      // FAIL-SAFE ROLLBACK: If any upload completed but the transaction failed,
      // purge the newly uploaded temporary files so we do not leave orphaned files.
      if (uploadedMasterStoragePath) {
        try {
          await storageService.deleteFile(uploadedMasterStoragePath);
        } catch (_) {}
      }
      if (uploadedThumbStoragePath) {
        try {
          await storageService.deleteFile(uploadedThumbStoragePath);
        } catch (_) {}
      }

      return {
        success: false,
        error: error.message || `स्लॉट ${slot} प्रतिस्थापन विफल हुआ। पिछला बैनर सुरक्षित रखा गया है।`,
      };
    }
  }

  /**
   * Backward-compatible alias for replaceSlotBanner (defaults to slot 1).
   */
  async replaceLiveBanner(
    params: ReplaceBannerParams,
    onProgress?: (step: string, percentage: number) => void
  ): Promise<ServiceResponse<BannerEntity>> {
    return this.replaceSlotBanner(
      {
        ...params,
        slot: params.slot || 1,
      },
      onProgress
    );
  }

  /**
   * CLEAR / DELETE SLOT BANNER:
   * Permanently clears Slot N, removing its Storage files and Firestore doc.
   * GUARANTEE: Slots M ≠ N are completely untouched.
   */
  async deleteSlotBanner(slot: BannerSlotNumber): Promise<ServiceResponse<boolean>> {
    if (!slot || !CANONICAL_SLOTS.includes(slot)) {
      return { success: false, error: 'अमान्य स्लॉट संख्या।' };
    }

    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      const allBanners: BannerEntity[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<BannerEntity, 'id'>),
      }));

      const slotDocs = allBanners.filter((b) => {
        if (b.slot === slot) return true;
        if (b.slot === undefined && b.order === slot - 1) return true;
        if (b.slot === undefined && b.order === undefined && slot === 1) return true;
        return false;
      });

      for (const d of slotDocs) {
        // Delete master file
        let masterPath = d.storagePath;
        if (!masterPath && d.imageUrl) {
          const parsed = extractStoragePathFromUrl(d.imageUrl);
          if (parsed && parsed.startsWith('banners/')) masterPath = parsed;
        }
        if (masterPath) {
          try {
            await storageService.deleteFile(masterPath);
          } catch (_) {}
        }

        // Delete thumbnail file
        if (d.thumbnailStoragePath) {
          try {
            await storageService.deleteFile(d.thumbnailStoragePath);
          } catch (_) {}
        }

        // Delete Firestore doc
        await deleteDoc(doc(db, COLLECTION_NAME, d.id));
      }

      return { success: true, data: true };
    } catch (error: any) {
      console.error(`Delete Slot ${slot} failed:`, error);
      return { success: false, error: error.message || `स्लॉट ${slot} हटाने में विफलता।` };
    }
  }

  /**
   * UPDATE SLOT METADATA:
   * Updates title, targetScreen, or active state for a slot's canonical banner.
   */
  async updateSlotMetadata(
    slot: BannerSlotNumber,
    updates: {
      title?: string;
      targetScreen?: string;
      active?: boolean;
    }
  ): Promise<ServiceResponse<BannerEntity>> {
    try {
      const slotsRes = await this.getSlotBanners();
      if (!slotsRes.success || !slotsRes.data) {
        return { success: false, error: slotsRes.error || 'डेटा प्राप्त करने में विफलता।' };
      }

      const banner = slotsRes.data[slot];
      if (!banner) {
        return { success: false, error: `स्लॉट ${slot} में कोई बैनर उपलब्ध नहीं है।` };
      }

      const docRef = doc(db, COLLECTION_NAME, banner.id);
      const payload: Partial<BannerEntity> = {
        ...updates,
        slot,
        order: slot - 1,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(docRef, payload as any);

      return {
        success: true,
        data: {
          ...banner,
          ...payload,
        },
      };
    } catch (error: any) {
      console.error(`Update Slot ${slot} metadata failed:`, error);
      return { success: false, error: error.message || 'मेटाडेटा अपडेट विफल रहा।' };
    }
  }

  /**
   * STORAGE & DATABASE INTEGRITY AUDIT (4-Slot Architecture):
   * Scans Storage folders `banners/` and `thumbnails/`, cross-referencing with
   * ALL 4 canonical active slot banners in Firestore.
   */
  async audit4SlotStorageIntegrity(): Promise<ServiceResponse<BannerIntegrityReport>> {
    try {
      // 1. Fetch Firestore banner documents & map to the 4 slots
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      const banners: BannerEntity[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<BannerEntity, 'id'>),
      }));

      const slots = this.mapBannersToSlots(banners);

      // Collect canonical paths for all 4 slots that MUST be preserved
      const canonicalPaths = new Set<string>();
      const canonicalDocIds = new Set<string>();

      const slotIntegrityMap: Record<BannerSlotNumber, BannerSlotIntegrity> = {
        1: { valid: false, empty: true, banner: null },
        2: { valid: false, empty: true, banner: null },
        3: { valid: false, empty: true, banner: null },
        4: { valid: false, empty: true, banner: null },
      };

      for (const s of CANONICAL_SLOTS) {
        const b = slots[s];
        if (b) {
          canonicalDocIds.add(b.id);
          slotIntegrityMap[s] = {
            valid: b.active !== false && !!b.imageUrl,
            empty: false,
            banner: b,
          };

          if (b.storagePath) {
            canonicalPaths.add(b.storagePath);
          } else if (b.imageUrl) {
            const p = extractStoragePathFromUrl(b.imageUrl);
            if (p && p.startsWith('banners/')) canonicalPaths.add(p);
          }

          if (b.thumbnailStoragePath) {
            canonicalPaths.add(b.thumbnailStoragePath);
          } else if (b.thumbnailUrl) {
            const tp = extractStoragePathFromUrl(b.thumbnailUrl);
            if (tp && tp.startsWith('thumbnails/')) canonicalPaths.add(tp);
          }
        }
      }

      // 2. Scan Storage `banners/`
      const bannersFolderRes = await storageService.listFolder('banners');
      const allBannerFiles =
        bannersFolderRes.success && bannersFolderRes.data?.files ? bannersFolderRes.data.files : [];

      // 3. Scan Storage `thumbnails/`
      const thumbsFolderRes = await storageService.listFolder('thumbnails');
      const allThumbFiles =
        thumbsFolderRes.success && thumbsFolderRes.data?.files ? thumbsFolderRes.data.files : [];

      // Filter orphan banner files (files in `banners/` not referenced by any canonical slot)
      const orphanBannerFiles: StorageFileItem[] = [];
      for (const file of allBannerFiles) {
        if (!canonicalPaths.has(file.storagePath)) {
          orphanBannerFiles.push(file);
        }
      }

      // Filter orphan thumbnail files (only files related to banners e.g. starting with `thumb_slot_` or `thumb_banner_`)
      const orphanThumbnailFiles: StorageFileItem[] = [];
      for (const file of allThumbFiles) {
        const isBannerThumb =
          file.name.startsWith('thumb_slot_') ||
          file.name.startsWith('thumb_banner_') ||
          file.name.includes('_banner') ||
          (file.name.startsWith('thumb_') && !file.name.includes('audio') && !file.name.includes('book'));

        if (isBannerThumb && !canonicalPaths.has(file.storagePath)) {
          orphanThumbnailFiles.push(file);
        }
      }

      const orphanTotalSizeBytes =
        orphanBannerFiles.reduce((acc, f) => acc + (f.size || 0), 0) +
        orphanThumbnailFiles.reduce((acc, f) => acc + (f.size || 0), 0);

      // Superseded Firestore docs: all docs except the 4 canonical slot banners
      const supersededFirestoreDocs = banners.filter((b) => !canonicalDocIds.has(b.id));

      const liveBanner = this.selectCanonicalBanner(banners);

      return {
        success: true,
        data: {
          slots: slotIntegrityMap,
          liveBanner,
          canonicalStoragePaths: Array.from(canonicalPaths),
          totalStorageBannerFiles: allBannerFiles.length,
          orphanBannerFiles,
          orphanThumbnailFiles,
          orphanTotalSizeBytes,
          firestoreDocCount: banners.length,
          supersededFirestoreDocs,
        },
      };
    } catch (error: any) {
      console.error('Storage integrity audit failed:', error);
      return { success: false, error: error.message || 'स्टोरेज अखंडता ऑडिट विफल रहा।' };
    }
  }

  /**
   * Backward-compatible alias for audit4SlotStorageIntegrity.
   */
  async auditBannerStorageIntegrity(): Promise<ServiceResponse<BannerIntegrityReport>> {
    return this.audit4SlotStorageIntegrity();
  }

  /**
   * PURGE OBSOLETE / ORPHAN BANNER ASSETS:
   * Safely deletes verified orphan banner files from Storage and superseded Firestore documents.
   *
   * STRICT SAFETY GUARDS:
   * - Only paths strictly starting with `banners/` or `thumbnails/`.
   * - NEVER touch `audio/`, `books/`, `avatars/`, `suvichar/`, `documents/`, `events/`.
   * - Must NEVER match ANY of the 4 canonical slot storage paths.
   */
  async purgeOrphanBannerAssets(
    storagePaths: string[],
    supersededDocIds: string[] = []
  ): Promise<ServiceResponse<{ deletedStorageCount: number; deletedDocCount: number; errors: string[] }>> {
    const errors: string[] = [];
    let deletedStorageCount = 0;
    let deletedDocCount = 0;

    try {
      // 1. Gather all canonical paths across all 4 slots to guarantee we NEVER delete an active asset
      const slotsRes = await this.getSlotBanners();
      const slots = slotsRes.data || { 1: null, 2: null, 3: null, 4: null };
      const protectedPaths = new Set<string>();
      const protectedDocIds = new Set<string>();

      for (const s of CANONICAL_SLOTS) {
        const b = slots[s];
        if (b) {
          protectedDocIds.add(b.id);
          if (b.storagePath) protectedPaths.add(b.storagePath);
          if (b.thumbnailStoragePath) protectedPaths.add(b.thumbnailStoragePath);
          if (b.imageUrl) {
            const p = extractStoragePathFromUrl(b.imageUrl);
            if (p) protectedPaths.add(p);
          }
          if (b.thumbnailUrl) {
            const tp = extractStoragePathFromUrl(b.thumbnailUrl);
            if (tp) protectedPaths.add(tp);
          }
        }
      }

      // 2. Purge Storage files
      for (const path of storagePaths) {
        // Enforce directory safety boundary
        const isBanners = path.startsWith('banners/');
        const isThumbnails = path.startsWith('thumbnails/');
        if (!isBanners && !isThumbnails) {
          errors.push(`अमान्य पाथ अस्वीकृत: ${path} (केवल banners/ एवं thumbnails/ अनुमत हैं)`);
          continue;
        }

        if (protectedPaths.has(path)) {
          errors.push(`सुरक्षित कैनोनिकल पाथ छोड़ा गया: ${path}`);
          continue;
        }

        try {
          const res = await storageService.deleteFile(path);
          if (res.success) {
            deletedStorageCount++;
          } else {
            errors.push(`हटाने में त्रुटि (${path}): ${res.error}`);
          }
        } catch (err: any) {
          errors.push(`हटाने में विफलता (${path}): ${err.message}`);
        }
      }

      // 3. Purge superseded Firestore documents
      for (const docId of supersededDocIds) {
        if (protectedDocIds.has(docId)) {
          errors.push(`कैनोनिकल स्लॉट डॉक्यूमेंट संरक्षित: ${docId}`);
          continue;
        }

        try {
          await deleteDoc(doc(db, COLLECTION_NAME, docId));
          deletedDocCount++;
        } catch (err: any) {
          errors.push(`डॉक्यूमेंट हटाने में त्रुटि (${docId}): ${err.message}`);
        }
      }

      return {
        success: true,
        data: {
          deletedStorageCount,
          deletedDocCount,
          errors,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'अप्रचलित फाइलें हटाने में विफलता।' };
    }
  }

  /**
   * Add a banner document (AdminMediaLibrary & legacy compatibility).
   */
  async addBanner(banner: Omit<BannerEntity, 'id'>): Promise<ServiceResponse<BannerEntity>> {
    try {
      const resolvedSlot: BannerSlotNumber =
        banner.slot ||
        ((banner.order !== undefined && banner.order >= 0 && banner.order < 4
          ? (banner.order + 1)
          : 1) as BannerSlotNumber);

      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...banner,
        slot: resolvedSlot,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { success: true, data: { id: docRef.id, ...banner, slot: resolvedSlot } };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to add banner' };
    }
  }

  /**
   * Update banner document by ID (AdminMediaLibrary & legacy compatibility).
   */
  async updateBanner(id: string, updates: Partial<BannerEntity>): Promise<ServiceResponse<boolean>> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      } as any);
      return { success: true, data: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update banner' };
    }
  }
}

export const bannerService = new BannerService();
