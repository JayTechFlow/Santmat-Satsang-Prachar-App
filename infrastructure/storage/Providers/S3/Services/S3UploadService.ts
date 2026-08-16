// Sprint E2 — S3 Upload Service
// Handles all upload operations for S3-compatible storage

import { PutObjectCommand, PutObjectCommandOutput } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';
import * as crypto from 'crypto';
import type { S3Client } from '@aws-sdk/client-s3';
import type { StorageOptions, StorageObjectMetadata, StorageTier, StorageClass, MultipartUploadOptions, ResumableUploadOptions, UploadProgress } from '../../Models/StorageModels';

export interface S3UploadConfig {
  bucketName: string;
  defaultStorageClass?: string;
  multipartThreshold?: number;
  multipartPartSize?: number;
  concurrentParts?: number;
}

export class S3UploadService {
  private client: S3Client;
  private config: S3UploadConfig;

  constructor(client: S3Client, config: S3UploadConfig) {
    this.client = client;
    this.config = config;
  }

  async upload(
    path: string,
    content: Buffer | Uint8Array | Readable,
    options?: StorageOptions
  ): Promise<StorageObjectMetadata> {
    const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content as Uint8Array);
    const sha256Checksum = this.calculateChecksum(buffer, 'sha256');
    const md5Checksum = this.calculateChecksum(buffer, 'md5');
    const mimeType = options?.metadata?.mimeType || 'application/octet-stream';
    const tier: StorageTier = options?.tier || 'hot';
    const storageClass = options?.storageClass || this.getStorageClassForTier(tier);

    const metadata: Record<string, string> = {
      ...options?.metadata,
      'checksum-sha256': sha256Checksum,
      'checksum-md5': md5Checksum,
      'tier': tier,
      'encrypted': String(options?.encrypted ?? true),
    };

    if (options?.customMetadata) {
      Object.entries(options.customMetadata).forEach(([k, v]) => {
        metadata[`x-amz-meta-${k}`] = v;
      });
    }

    const command = new PutObjectCommand({
      Bucket: this.config.bucketName,
      Key: path,
      Body: buffer,
      ContentType: mimeType,
      Metadata: metadata,
      StorageClass: storageClass as any,
      ServerSideEncryption: options?.encryptionAlgorithm === 'AES256' ? 'AES256' : undefined,
      SSEKMSKeyId: options?.encryptionKeyId,
      Tagging: options?.tags ? Object.entries(options.tags).map(([k, v]) => `${k}=${v}`).join('&') : undefined,
    });

    await this.client.send(command);

    return {
      storagePath: path,
      providerId: '', // Set by caller
      bucketName: this.config.bucketName,
      sizeBytes: buffer.length,
      mimeType,
      checksum: sha256Checksum,
      checksumAlgorithm: 'SHA256',
      tier,
      storageClass: storageClass as StorageClass,
      createdAt: new Date().toISOString(),
      lastModifiedAt: new Date().toISOString(),
      isEncrypted: options?.encrypted ?? true,
      encryptionKeyId: options?.encryptionKeyId,
      encryptionAlgorithm: options?.encryptionAlgorithm,
      customMetadata: options?.customMetadata,
      tags: options?.tags,
    };
  }

  async uploadMultipart(
    path: string,
    content: Buffer | Uint8Array | Readable,
    options?: StorageOptions & MultipartUploadOptions
  ): Promise<StorageObjectMetadata> {
    const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content as Uint8Array);

    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.config.bucketName,
        Key: path,
        Body: buffer,
        ContentType: options?.metadata?.mimeType || 'application/octet-stream',
        PartSize: options?.multipartUploadOptions?.partSize || this.config.multipartPartSize || 5 * 1024 * 1024,
        QueueSize: options?.multipartUploadOptions?.concurrentParts || this.config.concurrentParts || 4,
        Metadata: {
          'checksum-sha256': this.calculateChecksum(buffer, 'sha256'),
          'checksum-md5': this.calculateChecksum(buffer, 'md5'),
          'tier': options?.tier || 'hot',
        },
      },
    });

    upload.on('httpUploadProgress', (progress) => {
      if (options?.multipartUploadOptions?.onProgress) {
        options.multipartUploadOptions.onProgress({
          bytesUploaded: progress.loaded,
          totalBytes: progress.total || 0,
          percentage: progress.total ? (progress.loaded / progress.total) * 100 : 0,
        });
      }
    });

    await upload.done();

    return {
      storagePath: path,
      providerId: '',
      bucketName: this.config.bucketName,
      sizeBytes: buffer.length,
      mimeType: options?.metadata?.mimeType || 'application/octet-stream',
      checksum: this.calculateChecksum(buffer, 'sha256'),
      checksumAlgorithm: 'SHA256',
      tier: options?.tier || 'hot',
      createdAt: new Date().toISOString(),
      lastModifiedAt: new Date().toISOString(),
      isEncrypted: options?.encrypted ?? true,
    };
  }

  async uploadResumable(
    path: string,
    contentOrStream: Buffer | Uint8Array | Readable,
    options?: StorageOptions & ResumableUploadOptions
  ): Promise<StorageObjectMetadata> {
    const buffer = Buffer.isBuffer(contentOrStream) ? contentOrStream : Buffer.from(contentOrStream as Uint8Array);
    return this.upload(path, buffer, options);
  }

  private getStorageClassForTier(tier: StorageTier): string {
    const tierMap: Record<StorageTier, string> = {
      hot: 'STANDARD',
      warm: 'STANDARD_IA',
      cold: 'GLACIER',
      archive: 'DEEP_ARCHIVE',
    };
    return tierMap[tier] || 'STANDARD';
  }

  private calculateChecksum(content: Buffer, algorithm: 'md5' | 'sha256' = 'sha256'): string {
    return crypto.createHash(algorithm).update(content).digest('hex');
  }
}