import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject
} from 'firebase/storage';
import type { FirebaseStorage } from 'firebase/storage';

export class StorageRepository {
  private storage: FirebaseStorage;

  constructor(storage: FirebaseStorage) {
    this.storage = storage;
  }

  public async uploadFile(
    path: string, 
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const storageRef = ref(this.storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }

  public async deleteFile(pathOrUrl: string): Promise<void> {
    try {
      let fileRef;
      if (pathOrUrl.startsWith('http')) {
        fileRef = ref(this.storage, pathOrUrl);
      } else {
        fileRef = ref(this.storage, pathOrUrl);
      }
      await deleteObject(fileRef);
    } catch (error) {
      // Ignore not found errors if we are just trying to clean up
      if ((error as any).code === 'storage/object-not-found') {
        return;
      }
      throw error;
    }
  }
}
