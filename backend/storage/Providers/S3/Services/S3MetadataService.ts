// Sprint E2 — S3 Metadata Service
// Handles all metadata operations for S3-compatible storage

import { HeadObjectCommand, PutObjectTaggingCommand, DeleteObjectTaggingCommand, GetObjectTaggingCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import type { S3Client } from '@aws-sdk/client-s3';
import type { StorageObjectMetadata, StorageOptions, StorageTier, StorageClass } from '../../Models/StorageModels';

export interface S3MetadataConfig {
  bucketName: string;
}

export class S3MetadataService {
  private client: S3Client;
  private config: S3MetadataConfig;

  constructor(client: S3Client, config: S3MetadataConfig) {
    this.client = client;
    this.config = config;
  }

  async getMetadata(path: string): Promise<StorageObjectMetadata> {
    const command = new HeadObjectCommand({
      Bucket: this.config.bucketName,
      Key: path,
    });
    const response = await this.client.send(command);

    const tier = this.inferTierFromStorageClass(response.StorageClass);
    const customMetadata: Record<string, string> = {};
    if (response.Metadata) {
      for (const [k, v] of Object.entries(response.Metadata)) {
        if (k.startsWith('x-amz-meta-')) {
          customMetadata[k.replace('x-amz-meta-', '')] = v;
        }
      }
    }

    return {
      storagePath: path,
      providerId: '', // Set by caller
      bucketName: this.config.bucketName,
      sizeBytes: response.ContentLength || 0,
      mimeType: response.ContentType || 'application/octet-stream',
      checksum: response.Metadata?.['checksum-sha256'] || response.ETag?.replace(/"/g, '') || '',
      checksumAlgorithm: 'SHA256',
      tier,
      storageClass: response.StorageClass as StorageClass,
      createdAt: response.LastModified?.toISOString() || new Date().toISOString(),
      lastModifiedAt: response.LastModified?.toISOString() || new Date().toISOString(),
      isEncrypted: response.ServerSideEncryption !== undefined,
      encryptionKeyId: response.SSEKMSKeyId,
      encryptionAlgorithm: response.ServerSideEncryption,
      legalHoldActive: response.ObjectLockLegalHoldStatus === 'ON',
      retentionExpiration: response.ObjectLockRetainUntilDate?.toISOString(),
      retentionMode: response.ObjectLockMode as any,
      customMetadata,
    };
  }

  async setMetadata(path: string, metadata: Record<string, string>): Promise<StorageObjectMetadata> {
    const existing = await this.getMetadata(path);
    const updatedMetadata = { ...existing.customMetadata, ...metadata };

    const metaEntries = Object.entries(updatedMetadata).map(([k, v]) => ({ Key: k, Value: v }));

    const command = new PutObjectTaggingCommand({
      Bucket: this.config.bucketName,
      Key: path,
      Tagging: { TagSet: metaEntries },
    });
    await this.client.send(command);

    return { ...existing, customMetadata: updatedMetadata, lastModifiedAt: new Date().toISOString() };
  }

  async deleteMetadata(path: string): Promise<boolean> {
    const command = new DeleteObjectTaggingCommand({
      Bucket: this.config.bucketName,
      Key: path,
    });
    await this.client.send(command);
    return true;
  }

  async getTags(path: string): Promise<Record<string, string>> {
    const command = new GetObjectTaggingCommand({
      Bucket: this.config.bucketName,
      Key: path,
    });
    const response = await this.client.send(command);
    const tags: Record<string, string> = {};
    for (const tag of response.TagSet || []) {
      tags[tag.Key!] = tag.Value!;
    }
    return tags;
  }

  async setTags(path: string, tags: Record<string, string>): Promise<void> {
    const tagSet = Object.entries(tags).map(([Key, Value]) => ({ Key, Value }));
    const command = new PutObjectTaggingCommand({
      Bucket: this.config.bucketName,
      Key: path,
      Tagging: { TagSet: tagSet },
    });
    await this.client.send(command);
  }

  async deleteTags(path: string): Promise<void> {
    const command = new DeleteObjectTaggingCommand({
      Bucket: this.config.bucketName,
      Key: path,
    });
    await this.client.send(command);
  }

  async copyMetadata(sourcePath: string, destinationPath: string): Promise<void> {
    const command = new CopyObjectCommand({
      Bucket: this.config.bucketName,
      CopySource: `${this.config.bucketName}/${sourcePath}`,
      Key: destinationPath,
      MetadataDirective: 'COPY',
      TaggingDirective: 'COPY',
    });
    await this.client.send(command);
  }

  private inferTierFromStorageClass(storageClass?: string): StorageTier {
    if (!storageClass || storageClass === 'STANDARD') return 'hot';
    if (storageClass.includes('IA') || storageClass.includes('INTELLIGENT')) return 'warm';
    if (storageClass === 'GLACIER' || storageClass === 'COLD') return 'cold';
    if (storageClass === 'DEEP_ARCHIVE' || storageClass === 'ARCHIVE') return 'archive';
    return 'hot';
  }
}