import { storageService } from '../core/storage';

export function useStorage() {
  const uploadImage = async (file: File, folder: string, onProgress?: (p: number) => void) => {
    return storageService.uploadImage(file, folder, onProgress);
  };

  const uploadAudio = async (file: File, folder: string, onProgress?: (p: number) => void) => {
    return storageService.uploadAudio(file, folder, onProgress);
  };

  const uploadPDF = async (file: File, folder: string, onProgress?: (p: number) => void) => {
    return storageService.uploadPDF(file, folder, onProgress);
  };

  const deleteFile = async (url: string) => {
    return storageService.deleteFile(url);
  };

  return {
    uploadImage,
    uploadAudio,
    uploadPDF,
    deleteFile
  };
}
