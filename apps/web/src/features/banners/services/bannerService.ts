import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../../../lib/firebase/config';
import { BannerEntity, ServiceResponse } from '../../../types/common/index';

const COLLECTION_NAME = 'banners';

export class BannerService {
  subscribeBanners(callback: (banners: BannerEntity[]) => void, onError?: (error: Error) => void): () => void {
    try {
      return onSnapshot(
        collection(db, COLLECTION_NAME),
        (snap) => {
          const banners: BannerEntity[] = snap.docs.map(d => ({
            id: d.id,
            ...(d.data() as Omit<BannerEntity, 'id'>)
          }));
          // Sort by order ascending
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

  async getBanners(): Promise<ServiceResponse<BannerEntity[]>> {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      const banners: BannerEntity[] = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<BannerEntity, 'id'>)
      }));
      banners.sort((a, b) => (a.order || 0) - (b.order || 0));
      return { success: true, data: banners };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch banners' };
    }
  }

  async addBanner(banner: Omit<BannerEntity, 'id'>): Promise<ServiceResponse<BannerEntity>> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...banner,
        active: banner.active ?? true,
        order: banner.order ?? 0,
      });
      return { success: true, data: { id: docRef.id, ...banner } };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to add banner' };
    }
  }

  async updateBanner(id: string, updates: Partial<BannerEntity>): Promise<ServiceResponse<void>> {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), updates);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update banner' };
    }
  }

  async deleteBanner(id: string): Promise<ServiceResponse<void>> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete banner' };
    }
  }
}

export const bannerService = new BannerService();
