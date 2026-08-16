// Enterprise Media Platform — Provider Interface
// Sprint M1 Foundation
// Supports swappable storage backends: Firebase, S3, Azure, Cloudflare R2

export interface UploadProgressCallback {
  (progress: number, bytesTransferred: number, totalBytes: number): void;
}

export interface UploadTaskControl {
  pause: () => boolean;
  resume: () => boolean;
  cancel: () => boolean;
}

export interface ProviderUploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  onProgress?: UploadProgressCallback;
  onTaskCreated?: (control: UploadTaskControl) => void;
  cacheControl?: string;
  isPublic?: boolean;
}

export interface ProviderUploadResult {
  downloadUrl: string;
  storagePath: string;
  sizeBytes: number;
  contentType: string;
  etag?: string;
  versionId?: string;
  metadata?: Record<string, string>;
}

export interface ProviderFileMetadata {
  storagePath: string;
  downloadUrl: string;
  sizeBytes: number;
  contentType: string;
  etag?: string;
  createdAt?: Date;
  updatedAt?: Date;
  customMetadata?: Record<string, string>;
}

export interface ProviderMoveOptions {
  keepSource?: boolean;
}

export interface ProviderHealthStatus {
  healthy: boolean;
  latencyMs?: number;
  errorMessage?: string;
  provider: string;
}

/**
 * IMediaStorageProvider — Core abstraction for all media storage backends.
 * Implement this interface to add S3, Azure Blob, Cloudflare R2, or any
 * other provider without modifying application logic.
 */
export interface IMediaStorageProvider {
  /** Provider identifier, e.g. 'firebase', 's3', 'azure' */
  readonly providerName: string;

  /**
   * Upload a file to the storage backend.
   * @param path - Storage path (e.g. 'audio/bhajans/file.mp3')
   * @param file - File object to upload
   * @param options - Provider upload options
   */
  upload(
    path: string,
    file: File,
    options?: ProviderUploadOptions
  ): Promise<ProviderUploadResult>;

  /**
   * Delete a file from the storage backend.
   * @param path - Storage path or public URL
   */
  delete(path: string): Promise<void>;

  /**
   * Restore a soft-deleted file (if supported by provider).
   * @param path - Storage path
   */
  restore(path: string): Promise<void>;

  /**
   * Move a file to a new path.
   * @param sourcePath - Current storage path
   * @param destinationPath - Target storage path
   * @param options - Move options
   */
  move(
    sourcePath: string,
    destinationPath: string,
    options?: ProviderMoveOptions
  ): Promise<string>;

  /**
   * Copy a file to a new path.
   * @param sourcePath - Source storage path
   * @param destinationPath - Target storage path
   */
  copy(sourcePath: string, destinationPath: string): Promise<string>;

  /**
   * Generate a public or signed download URL.
   * @param path - Storage path
   * @param expiresInSeconds - Optional expiry for signed URLs
   */
  generateDownloadUrl(path: string, expiresInSeconds?: number): Promise<string>;

  /**
   * Generate a streaming-optimized URL (HLS, DASH, or CDN redirect).
   * @param path - Storage path
   */
  generateStreamingUrl(path: string): Promise<string>;

  /**
   * Check if a file exists at the given path.
   * @param path - Storage path
   */
  exists(path: string): Promise<boolean>;

  /**
   * Retrieve file metadata from the storage backend.
   * @param path - Storage path
   */
  getMetadata(path: string): Promise<ProviderFileMetadata>;

  /**
   * Perform a health check on the storage provider.
   */
  healthCheck(): Promise<ProviderHealthStatus>;
}
