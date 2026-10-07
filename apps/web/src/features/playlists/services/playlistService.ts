import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../../../lib/firebase/config';
import { PlaylistEntity, ServiceResponse } from '../../../types/common/index';

const COLLECTION_NAME = 'playlists';

export function normalizePlaylistEntity(id: string, data: any): PlaylistEntity {
  return {
    id,
    name: String(data.name || '').trim(),
    bhajanIds: Array.isArray(data.bhajanIds) ? data.bhajanIds.map((bid: any) => String(bid).trim()) : [],
    ownerId: data.ownerId ? String(data.ownerId).trim() : undefined,
    createdBy: data.createdBy ? String(data.createdBy).trim() : undefined,
    createdAt: data.createdAt ? String(data.createdAt).trim() : undefined,
    isPublic: data.isPublic !== undefined ? Boolean(data.isPublic) : undefined,
    visibility: data.visibility || 'public',
  };
}

export class PlaylistService {
  subscribePlaylists(callback: (playlists: PlaylistEntity[]) => void, onError?: (error: Error) => void): () => void {
    try {
      return onSnapshot(
        collection(db, COLLECTION_NAME),
        (snapshot) => {
          const list: PlaylistEntity[] = snapshot.docs.map(d => normalizePlaylistEntity(d.id, d.data()));
          callback(list);
        },
        (err) => {
          console.warn('Playlist subscription error:', err);
          if (onError) onError(err);
          else callback([]);
        }
      );
    } catch (err) {
      console.warn('Playlist subscription error:', err);
      if (onError) onError(err instanceof Error ? err : new Error(String(err)));
      else callback([]);
      return () => {};
    }
  }

  async createPlaylist(name: string, bhajanIds: string[] = []): Promise<ServiceResponse<PlaylistEntity>> {
    try {
      const currentUid = auth.currentUser?.uid;
      if (!currentUid) {
        return { success: false, error: 'अनधिकृत: प्लेलिस्ट बनाने के लिए लॉगिन आवश्यक है।' };
      }
      const payload: Omit<PlaylistEntity, 'id'> = {
        name,
        bhajanIds,
        ownerId: currentUid,
        createdBy: auth.currentUser?.displayName || 'Admin',
        isPublic: true,
        visibility: 'public',
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
      return { success: true, data: { id: docRef.id, ...payload } };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create playlist' };
    }
  }

  async updatePlaylist(id: string, updates: Partial<PlaylistEntity>): Promise<ServiceResponse<void>> {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), updates);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update playlist' };
    }
  }

  async deletePlaylist(id: string): Promise<ServiceResponse<void>> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete playlist' };
    }
  }
}

export const playlistService = new PlaylistService();
