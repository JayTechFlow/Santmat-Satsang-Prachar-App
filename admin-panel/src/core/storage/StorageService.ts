import { StorageRepository } from './StorageRepository';
import { mapError } from '../errors/errorMapper';
import { allowedExtensions, maxFileSize } from '../validation/validators';
import { AppError } from '../errors/AppError';

export class StorageService {
  private repository: StorageRepository;

  constructor(repository: StorageRepository) {
    this.repository = repository;
  }

  public generateFilename(originalName: string): string {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop()?.toLowerCase();
    const cleanName = originalName.replace(`.${extension}`, '').replace(/[^a-zA-Z0-9]/g, '_');
    return `${cleanName}_${timestamp}.${extension}`;
  }

  public generatePath(folder: string, filename: string): string {
    return `${folder}/${filename}`;
  }

  public validateFile(file: File, options: { extensions: string[]; maxSizeMB: number }): void {
    const extError = allowedExtensions(options.extensions)(file);
    if (extError) throw new AppError('VALIDATION_ERROR', extError);

    const sizeError = maxFileSize(options.maxSizeMB)(file);
    if (sizeError) throw new AppError('VALIDATION_ERROR', sizeError);
  }

  public async uploadImage(
    file: File,
    folder: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      this.validateFile(file, { extensions: ['jpg', 'jpeg', 'png', 'webp'], maxSizeMB: 5 });
      const path = this.generatePath(folder, this.generateFilename(file.name));
      return await this.repository.uploadFile(path, file, onProgress);
    } catch (error) {
      throw mapError(error);
    }
  }

  public async uploadAudio(
    file: File,
    folder: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      this.validateFile(file, { extensions: ['mp3', 'm4a', 'wav'], maxSizeMB: 50 });
      const path = this.generatePath(folder, this.generateFilename(file.name));
      return await this.repository.uploadFile(path, file, onProgress);
    } catch (error) {
      throw mapError(error);
    }
  }

  public async uploadPDF(
    file: File,
    folder: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      this.validateFile(file, { extensions: ['pdf'], maxSizeMB: 20 });
      const path = this.generatePath(folder, this.generateFilename(file.name));
      return await this.repository.uploadFile(path, file, onProgress);
    } catch (error) {
      throw mapError(error);
    }
  }

  public async deleteFile(pathOrUrl: string): Promise<void> {
    if (!pathOrUrl) return;
    try {
      await this.repository.deleteFile(pathOrUrl);
    } catch (error) {
      throw mapError(error);
    }
  }
}

