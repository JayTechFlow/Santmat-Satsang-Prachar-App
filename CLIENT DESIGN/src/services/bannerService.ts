import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { BannerEntity, ServiceResponse } from '../types';

const COLLECTION_NAME = 'banners';

export class BannerService {
  async getBanners(): Promise<ServiceResponse<BannerEntity[]>> {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      const banners: BannerEntity[] = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<BannerEntity, 'id'>)
      }));
      return { success: true, data: banners };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch banners' };
    }
  }

  async addBanner(banner: Omit<BannerEntity, 'id'>): Promise<ServiceResponse<BannerEntity>> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), banner);
      return { success: true, data: { id: docRef.id, ...banner } };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to add banner' };
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
