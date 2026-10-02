import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  StorageReference
} from 'firebase/storage';
import { storage } from '../../lib/firebase/config';
import { ServiceResponse } from '../../types/common/index';

export interface StorageAudioItem {
  name: string;
  storagePath: string;
  downloadUrl: string;
  size: number;
  contentType: string;
  updatedAt?: string;
}

export class StorageService {
  /**
   * Upload file to Firebase Storage with progress tracking callback
   */
  async uploadFile(
    file: File,
    folder: string,
    onProgress?: (progress: number) => void
  ): Promise<ServiceResponse<{ downloadUrl: string; storagePath: string }>> {
    try {
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `${folder}/${timestamp}_${sanitizedName}`;
      const storageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) onProgress(Math.round(progress));
          },
          (error) => {
            console.error('Storage Upload Error:', error);
            resolve({ success: false, error: error.message || 'File upload failed' });
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({
                success: true,
                data: { downloadUrl, storagePath }
              });
            } catch (err: any) {
              resolve({ success: false, error: err.message || 'Failed to get download URL' });
            }
          }
        );
      });
    } catch (error: any) {
      return { success: false, error: error.message || 'Storage operation failed' };
    }
  }

  /**
   * List existing audio files from Firebase Storage under `audio/` hierarchy
   * Recursively traverses sub-folders (e.g. `audio/bhajans`, `audio/bhajans/sdsdsa`)
   * and retrieves metadata + download URLs.
   */
  async listAudioFiles(baseFolder: string = 'audio'): Promise<ServiceResponse<StorageAudioItem[]>> {
    try {
      const items: StorageAudioItem[] = [];
      const queue: StorageReference[] = [ref(storage, baseFolder)];

      while (queue.length > 0) {
        const currentRef = queue.shift()!;
        try {
          const res = await listAll(currentRef);
          for (const prefix of res.prefixes) {
            queue.push(prefix);
          }
          for (const itemRef of res.items) {
            try {
              const [meta, url] = await Promise.all([
                getMetadata(itemRef).catch(() => null),
                getDownloadURL(itemRef).catch(() => '')
              ]);

              const contentType = meta?.contentType || 'audio/mpeg';
              const name = itemRef.name;
              if (
                contentType.startsWith('audio/') ||
                name.endsWith('.mp3') ||
                name.endsWith('.wav') ||
                name.endsWith('.m4a') ||
                name.endsWith('.aac')
              ) {
                items.push({
                  name,
                  storagePath: itemRef.fullPath,
                  downloadUrl: url,
                  size: meta?.size || 0,
                  contentType,
                  updatedAt: meta?.updated || meta?.timeCreated || ''
                });
              }
            } catch (itemErr) {
              console.warn('Failed to get metadata for item:', itemRef.fullPath, itemErr);
            }
          }
        } catch (dirErr) {
          console.warn('Failed to list folder:', currentRef.fullPath, dirErr);
        }
      }

      return { success: true, data: items };
    } catch (error: any) {
      console.error('Storage list audio error:', error);
      return { success: false, error: error.message || 'Failed to list audio files' };
    }
  }

  /**
   * Delete file from Firebase Storage
   */
  async deleteFile(storagePath: string): Promise<ServiceResponse<void>> {
    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
      return { success: true };
    } catch (error: any) {
      console.warn('Storage Delete Warning:', error);
      return { success: false, error: error.message || 'File deletion failed' };
    }
  }
}

export const storageService = new StorageService();
