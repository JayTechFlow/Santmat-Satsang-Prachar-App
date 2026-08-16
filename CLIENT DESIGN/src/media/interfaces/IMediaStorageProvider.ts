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

export interface IMediaStorageProvider {
  readonly providerName: string;
  upload(
    path: string,
    file: File,
    options?: ProviderUploadOptions
  ): Promise<ProviderUploadResult>;
  delete(path: string): Promise<void>;
  restore(path: string): Promise<void>;
  move(
    sourcePath: string,
    destinationPath: string,
    options?: ProviderMoveOptions
  ): Promise<string>;
  copy(sourcePath: string, destinationPath: string): Promise<string>;
  generateDownloadUrl(path: string, expiresInSeconds?: number): Promise<string>;
  generateStreamingUrl(path: string): Promise<string>;
  exists(path: string): Promise<boolean>;
  getMetadata(path: string): Promise<ProviderFileMetadata>;
  healthCheck(): Promise<ProviderHealthStatus>;
}
