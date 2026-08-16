// Sprint M4.0 — Cloud-Agnostic Storage Platform Interfaces

import type {
  StorageObjectMetadata,
  StorageOptions,
  SignedUrlResult,
  StorageProviderHealth,
  StorageStrategyType,
  StorageTier,
} from '../Models/StorageModels';

export interface IStorageProvider {
  readonly providerId: string;
  readonly providerType: string;

  upload(path: string, content: Buffer, options?: StorageOptions): Promise<StorageObjectMetadata>;
  download(path: string): Promise<Buffer>;
  delete(path: string): Promise<boolean>;
  restore(path: string): Promise<boolean>;
  exists(path: string): Promise<boolean>;
  move?(sourcePath: string, destinationPath: string): Promise<boolean>;
  copy?(sourcePath: string, destinationPath: string): Promise<boolean>;
  generateSignedUrl(path: string, action: 'GET' | 'PUT' | 'DELETE', expiresInSeconds: number): Promise<SignedUrlResult>;
  getMetadata(path: string): Promise<StorageObjectMetadata>;
  getHealth(): Promise<StorageProviderHealth>;
  verifyStorageHealth?(): Promise<StorageProviderHealth>;
  uploadResumable?(path: string, contentOrStream: Buffer | NodeJS.ReadableStream, options?: StorageOptions): Promise<StorageObjectMetadata>;
  getDownloadStream?(path: string): Promise<NodeJS.ReadableStream>;
  getUploadStream?(path: string, options?: StorageOptions): NodeJS.WritableStream;
}

export interface IStorageRouter {
  selectProvider(mimeType: string, region?: string, tier?: StorageTier): IStorageProvider;
}

export interface IStorageStrategy {
  readonly strategyType: StorageStrategyType;
  executeUpload(path: string, content: Buffer, options?: StorageOptions): Promise<StorageObjectMetadata>;
}
