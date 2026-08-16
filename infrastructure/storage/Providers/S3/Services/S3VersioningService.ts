// Sprint E2 — S3 Versioning Service
// Handles object versioning operations for S3-compatible storage

import {
  ListObjectVersionsCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import type { S3Client } from '@aws-sdk/client-s3';
import type { StorageObjectMetadata } from '../../../Models/StorageModels';

export interface S3VersioningConfig {
  bucketName: string;
}

export class S3VersioningService {
  private client: S3Client;
  private config: S3VersioningConfig;

  constructor(client: S3Client, config: S3VersioningConfig) {
    this.client = client;
    this.config = config;
  }

  async listVersions(path: string): Promise<StorageObjectMetadata[]> {
    const command = new ListObjectVersionsCommand({
      Bucket: this.config.bucketName,
      Prefix: path,
    });

    const response = await this.client.send(command);

    return (response.Versions || [])
      .filter(v => v.Key === path)
      .map(v => ({
        storagePath: v.Key!,
        providerId: '',
        bucketName: this.config.bucketName,
        sizeBytes: v.Size || 0,
        mimeType: 'application/octet-stream',
        checksum: v.ETag?.replace(/"/g, '') || '',
        checksumAlgorithm: 'SHA256',
        tier: this.inferTierFromStorageClass(v.StorageClass),
        storageClass: v.StorageClass as any,
        versionId: v.VersionId,
        isDeleteMarker: v.IsDeleteMarker,
        createdAt: v.LastModified?.toISOString() || new Date().toISOString(),
        lastModifiedAt: v.LastModified?.toISOString() || new Date().toISOString(),
        isEncrypted: false,
      }));
  }

  async deleteVersion(path: string, versionId: string): Promise<boolean> {
    const command = new DeleteObjectCommand({
      Bucket: this.config.bucketName,
      Key: path,
      VersionId: versionId,
    });
    await this.client.send(command);
    return true;
  }

  async restoreVersion(path: string, versionId: string): Promise<StorageObjectMetadata> {
    const command = new CopyObjectCommand({
      Bucket: this.config.bucketName,
      CopySource: `${this.config.bucketName}/${path}?versionId=${versionId}`,
      Key: path,
    });
    await this.client.send(command);

    return {
      storagePath: path,
      providerId: '',
      bucketName: this.config.bucketName,
      sizeBytes: 0,
      mimeType: 'application/octet-stream',
      checksum: '',
      tier: 'hot',
      createdAt: new Date().toISOString(),
      lastModifiedAt: new Date().toISOString(),
      isEncrypted: false,
    };
  }

  private inferTierFromStorageClass(storageClass?: string): string {
    if (!storageClass || storageClass === 'STANDARD') return 'hot';
    if (storageClass.includes('IA') || storageClass.includes('INTELLIGENT')) return 'warm';
    if (storageClass === 'GLACIER' || storageClass === 'COLD') return 'cold';
    if (storageClass === 'DEEP_ARCHIVE' || storageClass === 'ARCHIVE') return 'archive';
    return 'hot';
  }
}