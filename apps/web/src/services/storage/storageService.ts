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

export interface StorageFileItem {
  name: string;
  storagePath: string;
  downloadUrl?: string;
  size: number;
  contentType: string;
  updatedAt?: string;
  md5Hash?: string;
}

export interface StorageFolderContent {
  currentPath: string;
  prefixes: string[];
  files: StorageFileItem[];
}

export const KNOWN_STORAGE_FOLDERS = [
  'audio',
  'banners',
  'thumbnails',
  'books',
  'images',
  'avatars',
  'documents',
  'events',
  'public',
  'prayers'
];

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
   * List single folder contents for Folder Browser view.
   * If folderPath is empty or root '/', returns known top-level directories.
   */
  async listFolder(folderPath: string = ''): Promise<ServiceResponse<StorageFolderContent>> {
    const cleanPath = folderPath.replace(/^\/+|\/+$/g, '');

    // At root level, provide known application root prefixes
    if (!cleanPath) {
      return {
        success: true,
        data: {
          currentPath: '',
          prefixes: [...KNOWN_STORAGE_FOLDERS],
          files: []
        }
      };
    }

    try {
      const targetRef = ref(storage, cleanPath);
      const res = await listAll(targetRef);

      const subfolders = res.prefixes.map(p => p.fullPath);
      const files: StorageFileItem[] = [];

      for (const itemRef of res.items) {
        try {
          const [meta, url] = await Promise.all([
            getMetadata(itemRef).catch(() => null),
            getDownloadURL(itemRef).catch(() => '')
          ]);

          files.push({
            name: itemRef.name,
            storagePath: itemRef.fullPath,
            downloadUrl: url,
            size: meta?.size || 0,
            contentType: meta?.contentType || 'application/octet-stream',
            updatedAt: meta?.updated || meta?.timeCreated || '',
            md5Hash: meta?.md5Hash
          });
        } catch (metaErr) {
          files.push({
            name: itemRef.name,
            storagePath: itemRef.fullPath,
            size: 0,
            contentType: 'application/octet-stream'
          });
        }
      }

      return {
        success: true,
        data: {
          currentPath: cleanPath,
          prefixes: subfolders,
          files
        }
      };
    } catch (error: any) {
      console.warn(`Storage listFolder failed for ${cleanPath}:`, error);
      return {
        success: false,
        error: error.message || `फ़ोल्डर '${cleanPath}' लोड करने में विफल।`
      };
    }
  }

  /**
   * Recursively scan all known media folders across the Firebase Storage bucket.
   * Tolerates missing/empty folders gracefully.
   */
  async listAllFiles(baseFolders: string[] = KNOWN_STORAGE_FOLDERS): Promise<ServiceResponse<StorageFileItem[]>> {
    try {
      const allFiles: StorageFileItem[] = [];

      for (const baseFolder of baseFolders) {
        const queue: StorageReference[] = [ref(storage, baseFolder)];

        while (queue.length > 0) {
          const currentRef = queue.shift()!;
          try {
            const res = await listAll(currentRef);

            // Queue subfolders (skip nested avatars/thumbnails depth if excessive)
            for (const prefix of res.prefixes) {
              queue.push(prefix);
            }

            // Process files in batches to prevent network congestion
            const batchSize = 10;
            for (let i = 0; i < res.items.length; i += batchSize) {
              const chunk = res.items.slice(i, i + batchSize);
              const chunkResults = await Promise.all(
                chunk.map(async (itemRef) => {
                  try {
                    const [meta, url] = await Promise.all([
                      getMetadata(itemRef).catch(() => null),
                      getDownloadURL(itemRef).catch(() => '')
                    ]);

                    return {
                      name: itemRef.name,
                      storagePath: itemRef.fullPath,
                      downloadUrl: url,
                      size: meta?.size || 0,
                      contentType: meta?.contentType || 'application/octet-stream',
                      updatedAt: meta?.updated || meta?.timeCreated || '',
                      md5Hash: meta?.md5Hash
                    } as StorageFileItem;
                  } catch (itemErr) {
                    return {
                      name: itemRef.name,
                      storagePath: itemRef.fullPath,
                      size: 0,
                      contentType: 'application/octet-stream'
                    } as StorageFileItem;
                  }
                })
              );

              allFiles.push(...chunkResults);
            }
          } catch (dirErr: any) {
            // Non-fatal: simply skip folders that do not exist yet or are empty
            console.debug(`Storage scanner: skipped ${currentRef.fullPath}:`, dirErr?.code || dirErr?.message);
          }
        }
      }

      return { success: true, data: allFiles };
    } catch (error: any) {
      console.error('Storage listAllFiles error:', error);
      return { success: false, error: error.message || 'संपूर्ण स्टोरेज फाइलें लोड करने में विफल।' };
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
