import {
  collection,
  doc,
  getDocs,
  updateDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../../../lib/firebase/config';
import { StutiEntity, ServiceResponse } from '../../../types/common/index';
import { isStutiSlot } from '../config/stutiSlots';

/**
 * Backend contract: admin targets the canonical two-slot `stuti_vinati` records.
 * Historical legacy records (binti/padya) remain in Firestore for preservation
 * but are excluded from the active application data flow.
 */
const COLLECTION_NAME = 'stuti_vinati';

export function normalizeStutiEntity(id: string, data: any): StutiEntity {
  return {
    id,
    type: isStutiSlot(data.type) ? data.type : 'morning',
    title: String(data.title || '').trim(),
    subtitle: String(data.subtitle || '').trim(),
    artist: String(data.artist || '').trim(),
    duration: String(data.duration || '00:00').trim(),
    durationSeconds: Number(data.durationSeconds || 0),
    bannerImage: String(data.bannerImage || '').trim(),
    quote: String(data.quote || '').trim(),
    lyrics: String(data.lyrics || data.textContent || '').trim(),
    audioUrl: data.audioUrl ? String(data.audioUrl).trim() : undefined,
    storagePath: data.storagePath ? String(data.storagePath).trim() : undefined,
  };
}

export class StutiService {
  /**
   * Subscribe to the two canonical stuti slots in real time.
   * Legacy (non-slot) records never reach the active UI.
   */
  subscribeStuti(callback: (stutis: StutiEntity[]) => void, onError?: (error: Error) => void): () => void {
    try {
      return onSnapshot(
        query(collection(db, COLLECTION_NAME), orderBy('type', 'asc')),
        (snapshot) => {
          const slots = snapshot.docs.filter((d) => isStutiSlot(d.data().type));
          const list: StutiEntity[] = slots.map((d) => normalizeStutiEntity(d.id, d.data()));
          callback(list);
        },
        (err) => {
          console.warn('Stuti subscription error:', err);
          if (onError) onError(err);
          else callback([]);
        }
      );
    } catch (err) {
      console.warn('Stuti subscription error:', err);
      if (onError) onError(err instanceof Error ? err : new Error(String(err)));
      else callback([]);
      return () => {};
    }
  }

  /**
   * One-shot fetch of the two canonical stuti slots.
   */
  async getStutis(): Promise<ServiceResponse<StutiEntity[]>> {
    try {
      const snap = await getDocs(query(collection(db, COLLECTION_NAME), orderBy('type', 'asc')));
      const slots = snap.docs.filter((d) => isStutiSlot(d.data().type));
      const data: StutiEntity[] = slots.map((d) => normalizeStutiEntity(d.id, d.data()));
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch stuti' };
    }
  }

  async updateStuti(id: string, updates: Partial<StutiEntity>): Promise<ServiceResponse<void>> {
    try {
      if (updates.type && !isStutiSlot(updates.type)) {
        return { success: false, error: 'अमान्य स्तुति स्लॉट: केवल प्रातःकालीन (morning) और संध्याकालीन (evening) स्लॉट अनुमत हैं।' };
      }
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, updates);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update stuti' };
    }
  }
}

export const stutiService = new StutiService();