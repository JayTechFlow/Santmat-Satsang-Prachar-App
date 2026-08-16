// Sprint E2 — S3 Lifecycle Service
// Handles lifecycle configuration and management for S3-compatible storage

import {
  PutBucketLifecycleConfigurationCommand,
  GetBucketLifecycleConfigurationCommand,
  PutBucketVersioningCommand,
  GetBucketVersioningCommand,
  PutBucketReplicationCommand,
  GetBucketReplicationCommand,
  PutBucketEncryptionCommand,
  GetBucketEncryptionCommand,
} from '@aws-sdk/client-s3';
import type { S3Client } from '@aws-sdk/client-s3';
import type { LifecycleRule, LifecycleTransition, LifecycleExpiration, LifecycleAbortMultipartUpload, LifecycleFilter } from '../../../Models/StorageModels';

export interface S3LifecycleConfig {
  bucketName: string;
}

export interface LifecycleConfiguration {
  Rules: LifecycleRule[];
}

export interface ReplicationConfiguration {
  Role: string;
  Rules: ReplicationRule[];
}

export interface ReplicationRule {
  ID: string;
  Status: 'Enabled' | 'Disabled';
  Priority: number;
  Filter: ReplicationFilter;
  Destination: ReplicationDestination;
  DeleteMarkerReplication?: { Status: 'Enabled' | 'Disabled' };
  ReplicationTimeControl?: { Minutes: number };
}

export interface ReplicationFilter {
  Prefix?: string;
  TagSet?: TagFilter[];
}

export interface TagFilter {
  Key: string;
  Value: string;
}

export interface ReplicationDestination {
  Bucket: string;
  StorageClass?: string;
  AccessControlTranslation?: { Owner: 'Destination' };
  EncryptionConfiguration?: { ReplicaKmsKeyID: string };
}

export interface EncryptionConfiguration {
  Rules: EncryptionRule[];
}

export interface EncryptionRule {
  ApplyServerSideEncryptionByDefault: {
    SSEAlgorithm: 'AES256' | 'aws:kms';
    KMSMasterKeyID?: string;
  };
  BucketKeyEnabled?: boolean;
}

export class S3LifecycleService {
  private client: S3Client;
  private config: S3LifecycleConfig;

  constructor(client: S3Client, config: S3LifecycleConfig) {
    this.client = client;
    this.config = config;
  }

  async getLifecycleConfiguration(): Promise<LifecycleConfiguration> {
    const command = new GetBucketLifecycleConfigurationCommand({
      Bucket: this.config.bucketName,
    });
    const response = await this.client.send(command);
    return { Rules: response.Rules as any } || { Rules: [] };
  }

  async setLifecycleConfiguration(rules: LifecycleRule[]): Promise<void> {
    const command = new PutBucketLifecycleConfigurationCommand({
      Bucket: this.config.bucketName,
      LifecycleConfiguration: { Rules: this.convertRules(rules) },
    });
    await this.client.send(command);
  }

  async getBucketVersioning(): Promise<{ Status?: string; MFADelete?: string }> {
    const command = new GetBucketVersioningCommand({
      Bucket: this.config.bucketName,
    });
    return this.client.send(command);
  }

  async setBucketVersioning(enabled: boolean): Promise<void> {
    const command = new PutBucketVersioningCommand({
      Bucket: this.config.bucketName,
      VersioningConfiguration: { Status: enabled ? 'Enabled' : 'Suspended' },
    });
    await this.client.send(command);
  }

  async getBucketReplication(): Promise<ReplicationConfiguration | null> {
    try {
      const command = new GetBucketReplicationCommand({
        Bucket: this.config.bucketName,
      });
      const response = await this.client.send(command);
      return response.ReplicationConfiguration as any;
    } catch {
      return null;
    }
  }

  async setBucketReplication(config: ReplicationConfiguration): Promise<void> {
    const command = new PutBucketReplicationCommand({
      Bucket: this.config.bucketName,
      ReplicationConfiguration: config as any,
    });
    await this.client.send(command);
  }

  async getBucketEncryption(): Promise<EncryptionConfiguration | null> {
    try {
      const command = new GetBucketEncryptionCommand({
        Bucket: this.config.bucketName,
      });
      const response = await this.client.send(command);
      return response.ServerSideEncryptionConfiguration as any;
    } catch {
      return null;
    }
  }

  async setBucketEncryption(config: EncryptionConfiguration): Promise<void> {
    const command = new PutBucketEncryptionCommand({
      Bucket: this.config.bucketName,
      ServerSideEncryptionConfiguration: config as any,
    });
    await this.client.send(command);
  }

  private convertRules(rules: LifecycleRule[]): any[] {
    return rules.map(rule => ({
      ID: rule.id,
      Status: rule.status,
      Filter: rule.filter ? this.convertFilter(rule.filter) : undefined,
      Transitions: rule.transitions?.map(t => ({
        Days: t.days,
        Date: t.date,
        StorageClass: t.storageClass,
      })),
      Expiration: rule.expiration ? {
        Days: rule.expiration.days,
        Date: rule.expiration.date,
        ExpiredObjectDeleteMarker: rule.expiration.expiredObjectDeleteMarker,
      } : undefined,
      NoncurrentVersionTransitions: rule.noncurrentVersionTransitions?.map(t => ({
        NoncurrentDays: t.days,
        StorageClass: t.storageClass,
      })),
      NoncurrentVersionExpiration: rule.noncurrentVersionExpiration ? {
        NoncurrentDays: rule.noncurrentVersionExpiration.days,
      } : undefined,
      AbortIncompleteMultipartUpload: rule.abortIncompleteMultipartUpload ? {
        DaysAfterInitiation: rule.abortIncompleteMultipartUpload.daysAfterInitiation,
      } : undefined,
    }));
  }

  private convertFilter(filter: LifecycleFilter): any {
    if (!filter) return undefined;
    return {
      Prefix: filter.prefix,
      Tag: filter.tags ? Object.entries(filter.tags).map(([Key, Value]) => ({ Key, Value })) : undefined,
      ObjectSizeGreaterThan: filter.objectSizeGreaterThan,
      ObjectSizeLessThan: filter.objectSizeLessThan,
    };
  }
}