// Sprint E2 — S3 Multipart Service
// Handles multipart upload operations for S3-compatible storage

import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  ListMultipartUploadsCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import type { S3Client } from '@aws-sdk/client-s3';
import type { StorageOptions, MultipartUpload, StorageObjectMetadata, MultipartUploadOptions } from '../../Models/StorageModels';

export interface S3MultipartConfig {
  bucketName: string;
  defaultPartSize?: number;
}

export class S3MultipartService {
  private client: S3Client;
  private config: S3MultipartConfig;

  constructor(client: S3Client, config: S3MultipartConfig) {
    this.client = client;
    this.config = config;
  }

  async createMultipartUpload(path: string, options?: StorageOptions): Promise<MultipartUpload> {
    const mimeType = options?.metadata?.mimeType || 'application/octet-stream';
    const tier = options?.tier || 'hot';
    const storageClass = options?.storageClass || this.getStorageClassForTier(tier);

    const command = new CreateMultipartUploadCommand({
      Bucket: this.config.bucketName,
      Key: path,
      ContentType: mimeType,
      StorageClass: storageClass as any,
      ServerSideEncryption: options?.encryptionAlgorithm === 'AES256' ? 'AES256' : undefined,
      SSEKMSKeyId: options?.encryptionKeyId,
    });

    const response = await this.client.send(command);

    return {
      uploadId: response.UploadId!,
      key: path,
      partSize: this.config.defaultPartSize || 5 * 1024 * 1024,
      parts: [],
      initiatedAt: new Date().toISOString(),
    };
  }

  async uploadPart(
    path: string,
    uploadId: string,
    partNumber: number,
    content: Buffer | Uint8Array | Readable
  ): Promise<{ partNumber: number; etag: string }> {
    const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content as Uint8Array);

    const command = new UploadPartCommand({
      Bucket: this.config.bucketName,
      Key: path,
      UploadId: uploadId,
      PartNumber: partNumber,
      Body: buffer,
    });

    const response = await this.client.send(command);

    return { partNumber, etag: response.ETag!.replace(/"/g, '') };
  }

  async completeMultipartUpload(
    path: string,
    uploadId: string,
    parts: { partNumber: number; etag: string }[]
  ): Promise<StorageObjectMetadata> {
    const command = new CompleteMultipartUploadCommand({
      Bucket: this.config.bucketName,
      Key: path,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map(p => ({ PartNumber: p.partNumber, ETag: p.etag })),
      },
    });

    const response = await this.client.send(command);

    return {
      storagePath: path,
      providerId: '',
      bucketName: this.config.bucketName,
      sizeBytes: 0,
      mimeType: 'application/octet-stream',
      checksum: response.ETag?.replace(/"/g, '') || '',
      checksumAlgorithm: 'SHA256',
      tier: 'hot',
      createdAt: new Date().toISOString(),
      lastModifiedAt: new Date().toISOString(),
      isEncrypted: false,
    };
  }

  async abortMultipartUpload(path: string, uploadId: string): Promise<void> {
    const command = new AbortMultipartUploadCommand({
      Bucket: this.config.bucketName,
      Key: path,
      UploadId: uploadId,
    });
    await this.client.send(command);
  }

  async listMultipartUploads(prefix?: string): Promise<MultipartUpload[]> {
    const command = new ListMultipartUploadsCommand({
      Bucket: this.config.bucketName,
      Prefix: prefix,
    });
    const response = await this.client.send(command);

    return (response.Uploads || []).map(u => ({
      uploadId: u.UploadId!,
      key: u.Key!,
      partSize: 0,
      parts: [],
      initiatedAt: u.Initiated?.toISOString() || new Date().toISOString(),
    }));
  }

  private getStorageClassForTier(tier: string): string {
    const tierMap: Record<string, string> = {
      hot: 'STANDARD',
      warm: 'STANDARD_IA',
      cold: 'GLACIER',
      archive: 'DEEP_ARCHIVE',
    };
    return tierMap[tier] || 'STANDARD';
  }
}