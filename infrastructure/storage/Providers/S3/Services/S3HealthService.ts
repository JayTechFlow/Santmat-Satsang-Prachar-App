// Sprint E2 — S3 Health Service
// Handles health checks and monitoring for S3-compatible storage

import { ListObjectsV2Command, HeadBucketCommand } from '@aws-sdk/client-s3';
import type { S3Client } from '@aws-sdk/client-s3';
import type { StorageProviderHealth, StorageProviderType } from '../../../Models/StorageModels';

export interface S3HealthConfig {
  bucketName: string;
  region: string;
  providerType: StorageProviderType;
}

export class S3HealthService {
  private client: S3Client;
  private config: S3HealthConfig;

  constructor(client: S3Client, config: S3HealthConfig) {
    this.client = client;
    this.config = config;
  }

  async checkHealth(): Promise<StorageProviderHealth> {
    const startTime = Date.now();
    let status: 'healthy' | 'degraded' | 'critical' | 'offline' = 'healthy';
    let availableCapacity = 10000000000000; // 10TB default

    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.config.bucketName }));
      await this.client.send(new ListObjectsV2Command({ Bucket: this.config.bucketName, MaxKeys: 1 }));
    } catch {
      status = 'offline';
    }

    const latencyMs = Date.now() - startTime;

    return {
      providerId: '', // Set by caller
      providerType: this.config.providerType,
      status,
      latencyMs,
      availableCapacityBytes: availableCapacity,
      usedCapacityBytes: 0,
      totalCapacityBytes: availableCapacity,
      lastChecked: new Date().toISOString(),
    };
  }

  async verifyStorageHealth(): Promise<StorageProviderHealth> {
    return this.checkHealth();
  }
}