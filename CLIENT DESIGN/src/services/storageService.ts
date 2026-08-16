import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase/config';
import { ServiceResponse } from '../types';

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
