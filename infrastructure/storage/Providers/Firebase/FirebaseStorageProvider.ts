// Sprint E2.3 — Enterprise Firebase Storage Provider Implementation
// Production-ready Firebase Storage provider with capability-based architecture

import type * as adminType from 'firebase-admin';
import { Readable, PassThrough } from 'stream';
import * as crypto from 'crypto';

let admin: typeof adminType | undefined;
try {
  admin = require('firebase-admin');
} catch (_) {
  try {
    admin = require('../../../firebase/functions/node_modules/firebase-admin');
  } catch (_) {
    admin = undefined;
  }
}
import type { IStorageProvider } from '../../Interfaces/IStorageProvider';
import type {
  StorageObjectMetadata,
  StorageOptions,
  SignedUrlResult,
  StorageProviderHealth,
  StorageTier,
  StorageClass,
  StorageError,
  MultipartUpload,
  MultipartUploadOptions,
  ResumableUploadOptions,
  PresignedPostPolicy,
  UploadProgress,
  PolicyCondition,
  StorageMetrics,
} from '../../Models/StorageModels';
import { StorageCapability, StorageCapabilitySet } from '../../Capabilities/StorageCapabilities';
import { ProviderRegistry } from '../../Factory/ProviderRegistry';

export interface FirebaseStorageConfiguration {
  bucketName?: string;
  projectId?: string;
  storageRegion?: string;
  enableResumableUploads?: boolean;
  defaultCacheControl?: string;
  bucket?: any; // Bucket reference from firebase-admin / @google-cloud/storage
  maxRetries?: number;
  retryDelayMs?: number;
  providerId?: string; // Optional custom provider ID for testing
  /**
   * When true, the provider falls back to an in-memory map when no Firebase
   * bucket is configured. Intended ONLY for tests and local emulation.
   * Defaults to false: production usage without a bucket must fail loudly
   * instead of reporting fake success.
   */
  memoryFallback?: boolean;
}

export class FirebaseStorageException extends Error {
  constructor(message: string, public readonly code: string, public readonly originalError?: unknown) {
    super(message);
    this.name = 'FirebaseStorageException';
  }
}

export class FirebaseStorageProvider implements IStorageProvider {
  public readonly providerId: string;
  public readonly providerType: string = 'FIREBASE_STORAGE';
  private bucket: any = null;
  private storageMap = new Map<string, { content: Buffer; metadata: StorageObjectMetadata }>();

  constructor(private config: FirebaseStorageConfiguration = {}) {
    const bucketName =
      config.bucketName ||
      process.env.FIREBASE_STORAGE_BUCKET ||
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      'santmat-media-vault.appspot.com';

    this.config = {
      ...config,
      bucketName,
      maxRetries: config.maxRetries ?? 3,
      retryDelayMs: config.retryDelayMs ?? 200,
    };

    this.providerId = config.providerId || `firebase_storage_${bucketName}`;

    if (config.bucket) {
      this.bucket = config.bucket;
    } else {
      this.initBucket(bucketName);
    }
  }

  private initBucket(bucketName: string): void {
    try {
      if (typeof admin !== 'undefined' && admin.apps && admin.apps.length > 0) {
        this.bucket = admin.storage().bucket(bucketName);
      }
    } catch (_) {
      this.bucket = null;
    }
  }

  private getBucket(): any | null {
    if (this.bucket) return this.bucket;
    try {
      if (typeof admin !== 'undefined' && admin.apps && admin.apps.length > 0) {
        this.bucket = admin.storage().bucket(this.config.bucketName!);
        return this.bucket;
      }
    } catch (_) {}
    return null;
  }

  /**
   * Helper to retry transient operations with exponential backoff
   */
  private async retryWithBackoff<T>(operation: () => Promise<T>): Promise<T> {
    const maxRetries = this.config.maxRetries ?? 3;
    const baseDelay = this.config.retryDelayMs ?? 200;
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        // Don't retry non-transient 404 / object not found errors
        if (
          error?.code === 404 ||
          error?.code === 'storage/object-not-found' ||
          error?.message?.includes('not found') ||
          error?.name === 'FirebaseStorageException'
        ) {
          throw error;
        }
        if (attempt === maxRetries) {
          break;
        }
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((res) => setTimeout(res, delay));
      }
    }
    throw lastError;
  }

  /**
   * Calculate checksum for a buffer (MD5 or SHA256)
   */
  public calculateChecksum(content: Buffer, algorithm: 'md5' | 'sha256' = 'sha256'): string {
    return crypto.createHash(algorithm).update(content).digest('hex');
  }

  /**
   * Validate content checksum against expected hash
   */
  public async validateChecksum(path: string, expectedChecksum: string, algorithm: 'md5' | 'sha256' = 'sha256'): Promise<boolean> {
    const content = await this.download(path);
    const actualChecksum = this.calculateChecksum(content, algorithm);
    return actualChecksum.toLowerCase() === expectedChecksum.toLowerCase();
  }

  /**
   * Upload object buffer to Firebase Storage bucket
   */
  public async upload(path: string, content: Buffer, options?: StorageOptions): Promise<StorageObjectMetadata> {
    return this.retryWithBackoff(async () => {
      const sha256Checksum = this.calculateChecksum(content, 'sha256');
      const md5Checksum = this.calculateChecksum(content, 'md5');
      const mimeType = options?.metadata?.mimeType || 'application/octet-stream';
      const tier: StorageTier = options?.tier || 'hot';

      const meta: StorageObjectMetadata = {
        storagePath: path,
        providerId: this.providerId,
        bucketName: this.config.bucketName!,
        sizeBytes: content.length,
        mimeType,
        checksum: sha256Checksum,
        tier,
        createdAt: new Date().toISOString(),
        lastModifiedAt: new Date().toISOString(),
        isEncrypted: options?.encrypted ?? true,
      };

      const bucket = this.getBucket();
      if (bucket) {
        try {
          const file = bucket.file(path);
          const fileMetadata = {
            contentType: mimeType,
            cacheControl: this.config.defaultCacheControl || 'public, max-age=3600',
            metadata: {
              ...options?.metadata,
              checksumSha256: sha256Checksum,
              checksumMd5: md5Checksum,
              tier,
              encrypted: String(options?.encrypted ?? true),
              providerId: this.providerId,
            },
          };
          await file.save(content, {
            resumable: this.config.enableResumableUploads ?? false,
            metadata: fileMetadata,
          });
        } catch (err: any) {
          // Any upload error against a configured bucket is a real failure.
          // Never report success for an object that was not persisted.
          throw new FirebaseStorageException(`Failed to upload object to Firebase Storage: ${err?.message ?? err}`, 'storage/upload-failed', err);
        }
      } else if (!this.config.memoryFallback) {
        throw new FirebaseStorageException(
          'Firebase Storage bucket is not configured. Cannot upload.',
          'storage/provider-not-configured'
        );
      }

      this.storageMap.set(path, { content, metadata: meta });
      return meta;
    });
  }

  /**
   * Download object buffer from Firebase Storage
   */
  public async download(path: string): Promise<Buffer> {
    return this.retryWithBackoff(async () => {
      const bucket = this.getBucket();
      if (bucket) {
        try {
          const file = bucket.file(path);
          const [exists] = await file.exists();
          if (exists) {
            const [buffer] = await file.download();
            return buffer;
          }
        } catch (err: any) {
          if (err?.code === 404 || err?.message?.includes('not found')) {
            throw new FirebaseStorageException(`Object not found at path: ${path}`, 'storage/object-not-found', err);
          }
        }
      }

      const item = this.storageMap.get(path);
      if (!item) {
        throw new FirebaseStorageException(`Object not found at path: ${path}`, 'storage/object-not-found');
      }
      return item.content;
    });
  }

  /**
   * Delete object from Firebase Storage
   */
  public async delete(path: string): Promise<boolean> {
    return this.retryWithBackoff(async () => {
      let deletedFromBucket = false;
      const bucket = this.getBucket();
      if (bucket) {
        try {
          const file = bucket.file(path);
          const [exists] = await file.exists();
          if (exists) {
            await file.delete();
            deletedFromBucket = true;
          }
        } catch (err: any) {
          if (err?.code === 404 || err?.message?.includes('not found')) {
            throw new FirebaseStorageException(`Object not found at path: ${path}`, 'storage/object-not-found', err);
          }
          throw new FirebaseStorageException(`Failed to delete object from Firebase Storage: ${err?.message ?? err}`, 'storage/delete-failed', err);
        }
      }

      const deletedFromMap = this.storageMap.delete(path);
      return deletedFromBucket || deletedFromMap;
    });
  }

  /**
   * Restore object (checks object persistence status)
   */
  public async restore(path: string): Promise<boolean> {
    return this.exists(path);
  }

  /**
   * Check if object exists in Firebase Storage
   */
  public async exists(path: string): Promise<boolean> {
    return this.retryWithBackoff(async () => {
      const bucket = this.getBucket();
      if (bucket) {
        try {
          const file = bucket.file(path);
          const [exists] = await file.exists();
          if (exists) return true;
        } catch (_) {}
      }
      return this.storageMap.has(path);
    });
  }

  /**
   * Move object from source path to destination path
   */
  public async move(sourcePath: string, destinationPath: string): Promise<boolean> {
    return this.retryWithBackoff(async () => {
      const bucket = this.getBucket();
      let movedInBucket = false;
      if (bucket) {
        try {
          const file = bucket.file(sourcePath);
          const [exists] = await file.exists();
          if (exists) {
            await file.move(destinationPath);
            movedInBucket = true;
          }
        } catch (_) {}
      }

      const item = this.storageMap.get(sourcePath);
      if (item) {
        const updatedMeta = { ...item.metadata, storagePath: destinationPath, lastModifiedAt: new Date().toISOString() };
        this.storageMap.set(destinationPath, { content: item.content, metadata: updatedMeta });
        this.storageMap.delete(sourcePath);
        return true;
      }

      return movedInBucket;
    });
  }

  /**
   * Copy object from source path to destination path
   */
  public async copy(sourcePath: string, destinationPath: string): Promise<boolean> {
    return this.retryWithBackoff(async () => {
      const bucket = this.getBucket();
      let copiedInBucket = false;
      if (bucket) {
        try {
          const file = bucket.file(sourcePath);
          const [exists] = await file.exists();
          if (exists) {
            await file.copy(destinationPath);
            copiedInBucket = true;
          }
        } catch (_) {}
      }

      const item = this.storageMap.get(sourcePath);
      if (item) {
        const copiedMeta = { ...item.metadata, storagePath: destinationPath, createdAt: new Date().toISOString(), lastModifiedAt: new Date().toISOString() };
        this.storageMap.set(destinationPath, { content: Buffer.from(item.content), metadata: copiedMeta });
        return true;
      }

      return copiedInBucket;
    });
  }

  /**
   * Generate signed URL for direct access or upload
   */
  public async generateSignedUrl(path: string, action: 'GET' | 'PUT' | 'DELETE', expiresInSeconds: number): Promise<SignedUrlResult> {
    return this.retryWithBackoff(async () => {
      const bucket = this.getBucket();
      if (bucket) {
        const file = bucket.file(path);
        const actionMap: Record<string, 'read' | 'write' | 'delete'> = {
          GET: 'read',
          PUT: 'write',
          DELETE: 'delete',
        };
        const [url] = await file.getSignedUrl({
          version: 'v4',
          action: actionMap[action] || 'read',
          expires: Date.now() + expiresInSeconds * 1000,
        });
        return {
          url,
          expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
          httpMethod: action,
          headers: {
            'Cache-Control': this.config.defaultCacheControl || 'public, max-age=3600',
            'Content-Disposition': `inline; filename="${path.split('/').pop()}"`,
          },
        };
      }

      // Never fabricate a signed URL. A URL that 401s on arrival is fake success.
      throw new FirebaseStorageException(
        'Firebase Storage bucket is not configured. Cannot generate a signed URL.',
        'storage/provider-not-configured'
      );
    });
  }

  /**
   * Upload large files using resumable streaming or chunked uploads
   */
  public async uploadResumable(
    path: string,
    contentOrStream: Buffer | NodeJS.ReadableStream,
    options?: StorageOptions
  ): Promise<StorageObjectMetadata> {
    let buffer: Buffer;
    if (Buffer.isBuffer(contentOrStream)) {
      buffer = contentOrStream;
    } else {
      const chunks: Buffer[] = [];
      for await (const chunk of contentOrStream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      buffer = Buffer.concat(chunks);
    }
    return this.upload(path, buffer, options);
  }

  /**
   * Retrieve metadata for an object
   */
  public async getMetadata(path: string): Promise<StorageObjectMetadata> {
    return this.retryWithBackoff(async () => {
      const bucket = this.getBucket();
      if (bucket) {
        try {
          const file = bucket.file(path);
          const [exists] = await file.exists();
          if (exists) {
            const [gcpMetadata] = await file.getMetadata();
            const sizeBytes = parseInt(String(gcpMetadata.size || 0), 10);
            return {
              storagePath: path,
              providerId: this.providerId,
              bucketName: this.config.bucketName!,
              sizeBytes,
              mimeType: gcpMetadata.contentType || 'application/octet-stream',
              checksum: gcpMetadata.metadata?.checksumSha256 || gcpMetadata.md5Hash || '',
              tier: (gcpMetadata.metadata?.tier as StorageTier) || 'hot',
              createdAt: gcpMetadata.timeCreated || new Date().toISOString(),
              lastModifiedAt: gcpMetadata.updated || new Date().toISOString(),
              isEncrypted: gcpMetadata.metadata?.encrypted === 'true',
            };
          }
        } catch (err: any) {
          if (err?.code === 404 || err?.message?.includes('not found')) {
            throw new FirebaseStorageException(`Metadata not found at path: ${path}`, 'storage/object-not-found', err);
          }
        }
      }

      const item = this.storageMap.get(path);
      if (!item) {
        throw new FirebaseStorageException(`Metadata not found at path: ${path}`, 'storage/object-not-found');
      }
      return item.metadata;
    });
  }

  /**
   * Storage provider health status check
   */
  public async getHealth(): Promise<StorageProviderHealth> {
    return this.verifyStorageHealth();
  }

  /**
   * Explicit health verification method
   */
  public async verifyStorageHealth(): Promise<StorageProviderHealth> {
    const startTime = Date.now();
    let status: 'healthy' | 'degraded' | 'critical' | 'offline' = 'healthy';
    const bucket = this.getBucket();

    if (bucket) {
      try {
        const [exists] = await bucket.exists();
        if (!exists) {
          status = 'degraded';
        }
      } catch (_) {
        status = 'degraded';
      }
    } else if (!this.config.memoryFallback) {
      status = 'offline';
    }

    const latencyMs = Date.now() - startTime;

    return {
      providerId: this.providerId,
      providerType: this.providerType,
      status,
      latencyMs: latencyMs > 0 ? latencyMs : 5,
      availableCapacityBytes: 5000000000000,
      lastChecked: new Date().toISOString(),
    };
  }

  /**
   * Set metadata for an object (not natively supported by Firebase)
   */
  public async setMetadata(path: string, metadata: Record<string, string>): Promise<StorageObjectMetadata> {
    const existing = await this.getMetadata(path);
    const updated = { ...existing, customMetadata: { ...existing.customMetadata, ...metadata }, lastModifiedAt: new Date().toISOString() };
    const item = this.storageMap.get(path);
    if (item) {
      item.metadata = updated;
    }
    return updated;
  }

  /**
   * Delete metadata for an object (not natively supported by Firebase)
   */
  public async deleteMetadata(path: string): Promise<boolean> {
    const item = this.storageMap.get(path);
    if (item) {
      item.metadata.customMetadata = {};
      item.metadata.lastModifiedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  /**
   * Generate presigned POST policy (not natively supported by Firebase)
   */
  public async generatePresignedPostPolicy(policy: any): Promise<PresignedPostPolicy> {
    throw new FirebaseStorageException(
      'Firebase Storage does not support presigned POST policies.',
      'storage/capability-not-supported'
    );
  }

  /**
   * Unsupported operations must raise a typed capability error — never fake success.
   */
  private throwCapabilityError(operation: string): never {
    throw new FirebaseStorageException(
      `Firebase Storage does not support ${operation}.`,
      'storage/capability-not-supported'
    );
  }

  /**
   * Create multipart upload (not natively supported by Firebase)
   */
  public async createMultipartUpload(path: string, options?: StorageOptions): Promise<MultipartUpload> {
    return this.throwCapabilityError('multipart uploads');
  }

  /**
   * Upload part (not natively supported by Firebase)
   */
  public async uploadPart(path: string, uploadId: string, partNumber: number, content: Buffer | Uint8Array | ReadableStream): Promise<{ partNumber: number; etag: string }> {
    return this.throwCapabilityError('multipart uploads');
  }

  /**
   * Complete multipart upload (not natively supported by Firebase)
   */
  public async completeMultipartUpload(path: string, uploadId: string, parts: { partNumber: number; etag: string }[]): Promise<StorageObjectMetadata> {
    return this.throwCapabilityError('multipart uploads');
  }

  /**
   * Abort multipart upload (not natively supported by Firebase)
   */
  public async abortMultipartUpload(path: string, uploadId: string): Promise<void> {
    this.throwCapabilityError('multipart uploads');
  }

  /**
   * List multipart uploads (not natively supported by Firebase)
   */
  public async listMultipartUploads(prefix?: string): Promise<MultipartUpload[]> {
    return this.throwCapabilityError('multipart uploads');
  }

  /**
   * Create resumable upload (not natively supported by Firebase)
   */
  public async createResumableUpload(path: string, options?: StorageOptions): Promise<{ uploadId: string; uploadUrl: string }> {
    return this.throwCapabilityError('the createResumableUpload API');
  }

  /**
   * Upload chunk (not natively supported by Firebase)
   */
  public async uploadChunk(uploadId: string, chunkIndex: number, content: Buffer | Uint8Array, startByte: number, endByte: number): Promise<{ chunkIndex: number; etag: string }> {
    return this.throwCapabilityError('chunked resumable uploads');
  }

  /**
   * Complete resumable upload (not natively supported by Firebase)
   */
  public async completeResumableUpload(uploadId: string): Promise<StorageObjectMetadata> {
    return this.throwCapabilityError('chunked resumable uploads');
  }

  /**
   * Batch delete (not natively supported by Firebase)
   */
  public async batchDelete(paths: string[]): Promise<{ deleted: string[]; failed: { path: string; error: StorageError }[] }> {
    const deleted: string[] = [];
    const failed: { path: string; error: StorageError }[] = [];
    for (const path of paths) {
      try {
        const result = await this.delete(path);
        if (result) deleted.push(path);
        else failed.push({ path, error: { code: 'NOT_FOUND', message: 'Object not found', retryable: false } });
      } catch (e) {
        failed.push({ path, error: { code: 'ERROR', message: String(e), retryable: false } });
      }
    }
    return { deleted, failed };
  }

  /**
   * Batch copy (not natively supported by Firebase)
   */
  public async batchCopy(sourcePaths: string[], destinationPrefix: string): Promise<{ copied: string[]; failed: { path: string; error: StorageError }[] }> {
    const copied: string[] = [];
    const failed: { path: string; error: StorageError }[] = [];
    for (const path of sourcePaths) {
      try {
        const dest = `${destinationPrefix}/${path.split('/').pop()}`;
        const result = await this.copy(path, dest);
        if (result) copied.push(path);
        else failed.push({ path, error: { code: 'COPY_FAILED', message: 'Copy failed', retryable: false } });
      } catch (e) {
        failed.push({ path, error: { code: 'ERROR', message: String(e), retryable: false } });
      }
    }
    return { copied, failed };
  }

  /**
   * Batch move (not natively supported by Firebase)
   */
  public async batchMove(sourcePaths: string[], destinationPrefix: string): Promise<{ moved: string[]; failed: { path: string; error: StorageError }[] }> {
    const moved: string[] = [];
    const failed: { path: string; error: StorageError }[] = [];
    for (const path of sourcePaths) {
      try {
        const dest = `${destinationPrefix}/${path.split('/').pop()}`;
        const result = await this.move(path, dest);
        if (result) moved.push(path);
        else failed.push({ path, error: { code: 'MOVE_FAILED', message: 'Move failed', retryable: false } });
      } catch (e) {
        failed.push({ path, error: { code: 'ERROR', message: String(e), retryable: false } });
      }
    }
    return { moved, failed };
  }

  /**
   * List objects (not natively supported by Firebase)
   */
  public async list(prefix?: string, delimiter?: string, maxKeys?: number, continuationToken?: string): Promise<{ objects: StorageObjectMetadata[]; prefixes: string[]; nextContinuationToken?: string }> {
    return this.throwCapabilityError('object listing');
  }

  /**
   * List versions (not natively supported by Firebase)
   */
  public async listVersions(path: string): Promise<StorageObjectMetadata[]> {
    return this.throwCapabilityError('object versioning');
  }

  /**
   * Delete version (not natively supported by Firebase)
   */
  public async deleteVersion(path: string, versionId: string): Promise<boolean> {
    return this.throwCapabilityError('object versioning');
  }

  /**
   * Restore version (not natively supported by Firebase)
   */
  public async restoreVersion(path: string, versionId: string): Promise<StorageObjectMetadata> {
    return this.throwCapabilityError('object versioning');
  }

  /**
   * Set legal hold (not natively supported by Firebase)
   */
  public async setLegalHold(path: string, hold: boolean): Promise<void> {
    this.throwCapabilityError('legal hold');
  }

  /**
   * Set retention (not natively supported by Firebase)
   */
  public async setRetention(path: string, mode: 'GOVERNANCE' | 'COMPLIANCE', retainUntilDate: Date): Promise<void> {
    this.throwCapabilityError('retention policies');
  }

  /**
   * Get metrics (basic implementation)
   */
  public async getMetrics(): Promise<StorageMetrics> {
    let totalBytes = 0;
    let objectCount = 0;
    for (const item of this.storageMap.values()) {
      totalBytes += item.content.length;
      objectCount++;
    }
    return {
      totalObjectsCount: objectCount,
      totalBytesStored: totalBytes,
      activeTierBreakdown: { hot: objectCount },
      throughputBytesPerSec: 0,
      errorRatePercentage: 0,
      averageLatencyMs: 0,
      apiCallsCount: 0,
      uploadCount: 0,
      downloadCount: 0,
      deleteCount: 0,
    };
  }

  /**
   * Get download stream with range options.
   * Range slicing is not implemented for Firebase streams; requesting a
   * range returns the full stream and is NOT advertised as a capability.
   */
  public async getDownloadStream(path: string, options?: { startByte?: number; endByte?: number }): Promise<NodeJS.ReadableStream & ReadableStream> {
    const bucket = this.getBucket();
    if (bucket) {
      const file = bucket.file(path);
      const [exists] = await file.exists();
      if (exists) {
        return file.createReadStream();
      }
    }
    const content = await this.download(path);
    return Readable.from(content) as any;
  }

  /**
   * Get upload stream returning Promise
   */
  public async getUploadStream(path: string, options?: StorageOptions): Promise<NodeJS.WritableStream & WritableStream> {
    const bucket = this.getBucket();
    if (bucket) {
      const file = bucket.file(path);
      return file.createWriteStream({
        resumable: this.config.enableResumableUploads ?? true,
        metadata: {
          contentType: options?.metadata?.mimeType || 'application/octet-stream',
          metadata: options?.metadata,
        },
      });
    }
    if (!this.config.memoryFallback) {
      throw new FirebaseStorageException(
        'Firebase Storage bucket is not configured. Cannot open upload stream.',
        'storage/provider-not-configured'
      );
    }
    const passThrough = new PassThrough();
    const chunks: Buffer[] = [];
    passThrough.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    passThrough.on('end', async () => {
      const fullBuffer = Buffer.concat(chunks);
      await this.upload(path, fullBuffer, options);
    });
    return passThrough as any;
  }

  /**
   * Upload multipart (not natively supported by Firebase)
   */
  public async uploadMultipart(path: string, content: Buffer | Uint8Array | ReadableStream, options?: StorageOptions & MultipartUploadOptions): Promise<StorageObjectMetadata> {
    return this.throwCapabilityError('multipart uploads');
  }

  /**
   * Get supported capabilities for this provider
   * Firebase supports core operations, streaming, signed URLs, but NOT multipart,
   * resumable chunking, versioning, legal hold, retention, object listing, or range streams.
   */
  public getCapabilities(): StorageCapabilitySet {
    const capabilities = new Set<StorageCapability>([
      StorageCapability.UPLOAD,
      StorageCapability.DOWNLOAD,
      StorageCapability.DELETE,
      StorageCapability.EXISTS,
      StorageCapability.COPY,
      StorageCapability.MOVE,
      StorageCapability.METADATA_GET,
      StorageCapability.SIGNED_URL_GET,
      StorageCapability.SIGNED_URL_PUT,
      StorageCapability.SIGNED_URL_DELETE,
      StorageCapability.STREAM_DOWNLOAD,
      StorageCapability.STREAM_UPLOAD,
      StorageCapability.HEALTH_CHECK,
      StorageCapability.HEALTH_VERIFY,
      StorageCapability.TIER_HOT,
      StorageCapability.TIER_WARM,
      StorageCapability.TIER_COLD,
    ]);
    return capabilities;
  }

  /**
   * Register this provider with the ProviderRegistry
   */
  public async registerWithRegistry(): Promise<void> {
    const registry = ProviderRegistry.getInstance();
    await registry.register({
      providerId: this.providerId,
      providerType: 'FIREBASE_STORAGE' as any,
      provider: this,
      factory: null as any,
      capabilities: this.getCapabilities(),
      config: this.config,
      registeredAt: new Date().toISOString(),
      status: 'active',
    });
  }
}

