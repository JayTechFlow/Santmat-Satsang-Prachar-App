// Sprint E2 — S3 Streaming Service
// Handles streaming download and upload operations for S3-compatible storage

import { GetObjectCommand, GetObjectCommandOutput } from '@aws-sdk/client-s3';
import { Readable, PassThrough, Writable } from 'stream';
import type { S3Client } from '@aws-sdk/client-s3';
import type { StorageOptions, StorageObjectMetadata } from '../../Models/StorageModels';

export interface S3StreamingConfig {
  bucketName: string;
}

export class S3StreamingService {
  private client: S3Client;
  private config: S3StreamingConfig;

  constructor(client: S3Client, config: S3StreamingConfig) {
    this.client = client;
    this.config = config;
  }

  async getDownloadStream(
    path: string,
    options?: { startByte?: number; endByte?: number }
  ): Promise<Readable> {
    let range: string | undefined;
    if (options?.startByte !== undefined || options?.endByte !== undefined) {
      const start = options.startByte || 0;
      const end = options.endByte || '';
      range = `bytes=${start}-${end}`;
    }

    const command = new GetObjectCommand({
      Bucket: this.config.bucketName,
      Key: path,
      Range: range,
    });

    const response = await this.client.send(command);
    if (!response.Body) {
      throw new Error(`Object not found: ${path}`);
    }

    return response.Body as Readable;
  }

  getUploadStream(path: string, options?: StorageOptions): Writable {
    const passThrough = new PassThrough();
    const chunks: Buffer[] = [];

    passThrough.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    passThrough.on('end', async () => {
      // This would be handled by the upload service
      // The stream consumer needs to call upload when done
    });

    return passThrough;
  }

  async createUploadStream(
    path: string,
    options?: StorageOptions
  ): Promise<{ stream: Writable; promise: Promise<StorageObjectMetadata> }> {
    const passThrough = new PassThrough();
    const chunks: Buffer[] = [];

    const promise = new Promise<StorageObjectMetadata>((resolve, reject) => {
      passThrough.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      passThrough.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks);
          // This would need the upload service to complete
          resolve({
            storagePath: path,
            providerId: '',
            bucketName: this.config.bucketName,
            sizeBytes: buffer.length,
            mimeType: options?.metadata?.mimeType || 'application/octet-stream',
            checksum: '',
            tier: 'hot',
            createdAt: new Date().toISOString(),
            lastModifiedAt: new Date().toISOString(),
            isEncrypted: options?.encrypted ?? true,
          });
        } catch (error) {
          reject(error);
        }
      });
      passThrough.on('error', reject);
    });

    return { stream: passThrough, promise };
  }
}