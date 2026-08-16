// Sprint M4.0 — Abstract Mock Storage Provider (Provider Abstraction Template)

import type { IStorageProvider } from '../Interfaces/IStorageInterfaces';
import type { StorageObjectMetadata, StorageOptions, SignedUrlResult, StorageProviderHealth } from '../Models/StorageModels';

export class AbstractStorageProvider implements IStorageProvider {
  private store = new Map<string, { content: Buffer; metadata: StorageObjectMetadata }>();

  constructor(
    public readonly providerId: string = 'abstract_cloud_provider_1',
    public readonly providerType: string = 'CloudAgnosticAbstract'
  ) {}

  public async upload(path: string, content: Buffer, options?: StorageOptions): Promise<StorageObjectMetadata> {
    const meta: StorageObjectMetadata = {
      storagePath: path,
      providerId: this.providerId,
      bucketName: 'enterprise-media-vault',
      sizeBytes: content.length,
      mimeType: options?.metadata?.mimeType || 'application/octet-stream',
      checksum: 'sha256_abstract_checksum_hash',
      tier: options?.tier || 'hot',
      createdAt: new Date().toISOString(),
      lastModifiedAt: new Date().toISOString(),
      isEncrypted: options?.encrypted ?? true,
    };

    this.store.set(path, { content, metadata: meta });
    return meta;
  }

  public async download(path: string): Promise<Buffer> {
    const item = this.store.get(path);
    if (!item) throw new Error(`Storage object not found at path: ${path}`);
    return item.content;
  }

  public async delete(path: string): Promise<boolean> {
    return this.store.delete(path);
  }

  public async restore(path: string): Promise<boolean> {
    return this.store.has(path);
  }

  public async exists(path: string): Promise<boolean> {
    return this.store.has(path);
  }

  public async generateSignedUrl(path: string, action: 'GET' | 'PUT' | 'DELETE', expiresInSeconds: number): Promise<SignedUrlResult> {
    return {
      url: `https://storage-gateway.internal/signed/${this.providerId}/${path}?action=${action}`,
      expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
      httpMethod: action,
    };
  }

  public async getMetadata(path: string): Promise<StorageObjectMetadata> {
    const item = this.store.get(path);
    if (!item) throw new Error(`Storage object metadata not found at path: ${path}`);
    return item.metadata;
  }

  public async getHealth(): Promise<StorageProviderHealth> {
    return {
      providerId: this.providerId,
      providerType: this.providerType,
      status: 'healthy',
      latencyMs: 12,
      availableCapacityBytes: 1000000000000,
      lastChecked: new Date().toISOString(),
    };
  }
}
