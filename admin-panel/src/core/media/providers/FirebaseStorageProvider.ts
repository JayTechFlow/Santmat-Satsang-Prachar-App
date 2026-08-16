// Enterprise Media Platform — Firebase Storage Provider Implementation
// Sprint M1 Foundation

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  getMetadata,
} from 'firebase/storage';
import type { FirebaseStorage, StorageReference } from 'firebase/storage';
import type {
  IMediaStorageProvider,
  ProviderUploadOptions,
  ProviderUploadResult,
  ProviderFileMetadata,
  ProviderMoveOptions,
  ProviderHealthStatus,
} from '../interfaces/IMediaStorageProvider';

export class FirebaseStorageProvider implements IMediaStorageProvider {
  readonly providerName = 'firebase';
  private readonly storage: FirebaseStorage;

  constructor(storage: FirebaseStorage) {
    this.storage = storage;
  }

  async upload(
    path: string,
    file: File,
    options?: ProviderUploadOptions
  ): Promise<ProviderUploadResult> {
    return new Promise((resolve, reject) => {
      const storageRef: StorageReference = ref(this.storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: options?.contentType ?? file.type,
        cacheControl: options?.cacheControl ?? 'public,max-age=3600',
        customMetadata: options?.metadata ?? {},
      });

      if (options?.onTaskCreated) {
        options.onTaskCreated({
          pause: () => uploadTask.pause(),
          resume: () => uploadTask.resume(),
          cancel: () => uploadTask.cancel(),
        });
      }

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (options?.onProgress) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            options.onProgress(progress, snapshot.bytesTransferred, snapshot.totalBytes);
          }
        },
        (error) => reject(error),
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            const meta = uploadTask.snapshot.metadata;
            resolve({
              downloadUrl,
              storagePath: path,
              sizeBytes: meta.size ?? 0,
              contentType: meta.contentType ?? file.type,
              etag: meta.md5Hash,
            });
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }

  async delete(path: string): Promise<void> {
    try {
      const fileRef = ref(this.storage, path);
      await deleteObject(fileRef);
    } catch (error: unknown) {
      if ((error as { code?: string })?.code === 'storage/object-not-found') return;
      throw error;
    }
  }

  async restore(_path: string): Promise<void> {
    // Firebase Storage does not natively support soft delete/restore.
    // Implement via Firestore metadata flag + manual re-upload if needed.
    throw new Error(
      'Restore is not natively supported by Firebase Storage. Use Firestore soft-delete pattern.'
    );
  }

  async move(
    sourcePath: string,
    destinationPath: string,
    options?: ProviderMoveOptions
  ): Promise<string> {
    // Firebase Storage has no native move: copy then delete source.
    const destUrl = await this.copy(sourcePath, destinationPath);
    if (!options?.keepSource) {
      await this.delete(sourcePath);
    }
    return destUrl;
  }

  async copy(sourcePath: string, destinationPath: string): Promise<string> {
    // Firebase Storage has no native copy: download bytes then re-upload.
    const sourceRef = ref(this.storage, sourcePath);
    const srcUrl = await getDownloadURL(sourceRef);
    const response = await fetch(srcUrl);
    const blob = await response.blob();
    const destRef = ref(this.storage, destinationPath);
    const uploadTask = await uploadBytesResumable(destRef, blob, {
      contentType: blob.type,
    });
    return getDownloadURL(uploadTask.ref);
  }

  async generateDownloadUrl(path: string, _expiresInSeconds?: number): Promise<string> {
    const fileRef = ref(this.storage, path);
    return getDownloadURL(fileRef);
  }

  async generateStreamingUrl(path: string): Promise<string> {
    // For Firebase Storage, streaming URL is the same as download URL.
    // Future: integrate CDN or transcode pipeline here.
    return this.generateDownloadUrl(path);
  }

  async exists(path: string): Promise<boolean> {
    try {
      const fileRef = ref(this.storage, path);
      await getMetadata(fileRef);
      return true;
    } catch (error: unknown) {
      if ((error as { code?: string })?.code === 'storage/object-not-found') return false;
      throw error;
    }
  }

  async getMetadata(path: string): Promise<ProviderFileMetadata> {
    const fileRef = ref(this.storage, path);
    const meta = await getMetadata(fileRef);
    const downloadUrl = await getDownloadURL(fileRef);
    return {
      storagePath: path,
      downloadUrl,
      sizeBytes: meta.size ?? 0,
      contentType: meta.contentType ?? 'application/octet-stream',
      etag: meta.md5Hash,
      createdAt: meta.timeCreated ? new Date(meta.timeCreated) : undefined,
      updatedAt: meta.updated ? new Date(meta.updated) : undefined,
      customMetadata: meta.customMetadata ?? {},
    };
  }

  async healthCheck(): Promise<ProviderHealthStatus> {
    const start = Date.now();
    try {
      // Attempt metadata fetch on a probe path; 404 is expected and fine.
      const testRef = ref(this.storage, '_health_check_probe_do_not_delete');
      await getMetadata(testRef).catch(() => {
        // 404 is expected — storage is reachable
      });
      return {
        healthy: true,
        latencyMs: Date.now() - start,
        provider: this.providerName,
      };
    } catch (error: unknown) {
      return {
        healthy: false,
        latencyMs: Date.now() - start,
        errorMessage: (error as Error)?.message ?? 'Unknown error',
        provider: this.providerName,
      };
    }
  }
}
