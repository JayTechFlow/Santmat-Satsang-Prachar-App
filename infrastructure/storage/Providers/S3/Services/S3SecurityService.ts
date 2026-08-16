// Sprint E2 — S3 Security Service
// Handles encryption, access control, and security validation for S3-compatible storage

import type { S3Client } from '@aws-sdk/client-s3';
import type { StorageOptions, StorageObjectMetadata, StorageTier, StorageClass } from '../../../Models/StorageModels';
import { StorageSecurityEngine } from '../../../Security/StorageSecurityEngine';

export interface S3SecurityConfig {
  bucketName: string;
  defaultEncryptionAlgorithm: 'AES256' | 'AWS_KMS' | 'CUSTOM';
  defaultKmsKeyId?: string;
  enforceEncryption: boolean;
}

export class S3SecurityService {
  private client: S3Client;
  private config: S3SecurityConfig;
  private securityEngine: StorageSecurityEngine;

  constructor(client: S3Client, config: S3SecurityConfig) {
    this.client = client;
    this.config = config;
    this.securityEngine = new StorageSecurityEngine({
      algorithm: config.defaultEncryptionAlgorithm === 'AWS_KMS' ? 'AWS-KMS' : 'AES-256-GCM',
      keyId: config.defaultKmsKeyId || 'default-key',
    });
  }

  applyEncryptionHeaders(headers: Record<string, string>, options?: StorageOptions): Record<string, string> {
    const algorithm = options?.encryptionAlgorithm || this.config.defaultEncryptionAlgorithm;
    const keyId = options?.encryptionKeyId || this.config.defaultKmsKeyId;

    const encryptionHeaders: Record<string, string> = {};

    if (algorithm === 'AES256') {
      encryptionHeaders['x-amz-server-side-encryption'] = 'AES256';
    } else if (algorithm === 'AWS_KMS' && keyId) {
      encryptionHeaders['x-amz-server-side-encryption'] = 'aws:kms';
      encryptionHeaders['x-amz-server-side-encryption-aws-kms-key-id'] = keyId;
    } else if (algorithm === 'CUSTOM') {
      encryptionHeaders['x-amz-server-side-encryption'] = 'AES256';
      encryptionHeaders['x-amz-server-side-encryption-customer-algorithm'] = 'AES256';
      // Customer key would be provided in headers
    }

    return {
      ...headers,
      ...encryptionHeaders,
      'x-santmat-security-kms-key': keyId || this.config.defaultKmsKeyId || '',
      'x-santmat-security-algo': algorithm,
    };
  }

  validateEncryptionOptions(options?: StorageOptions): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.config.enforceEncryption && !options?.encrypted) {
      errors.push('Encryption is required for this provider');
    }

    if (options?.encryptionAlgorithm === 'AWS_KMS' && !options?.encryptionKeyId && !this.config.defaultKmsKeyId) {
      errors.push('KMS Key ID is required for AWS KMS encryption');
    }

    return { valid: errors.length === 0, errors };
  }

  applySecurityHeaders(headers: Record<string, string>): Record<string, string> {
    return this.securityEngine.applyEncryptionHeaders(headers);
  }

  validatePathUpload(path: string, fileName: string, contentType: string, sizeBytes: number): { valid: boolean; reason?: string; warnings: string[] } {
    return this.securityEngine.validatePathUpload(path, fileName, contentType, sizeBytes);
  }

  validateOverwritePermission(isNewFile: boolean, claims?: any): boolean {
    return this.securityEngine.validateOverwritePermission(isNewFile, claims);
  }

  calculateChecksum(data: Buffer, algorithm: 'md5' | 'sha256' = 'sha256'): string {
    return this.securityEngine.calculateChecksum(data, algorithm);
  }

  async validateObjectIntegrity(path: string, expectedChecksum: string, algorithm: 'md5' | 'sha256' = 'sha256'): Promise<boolean> {
    return this.securityEngine.validateObjectIntegrity({ checksum: expectedChecksum } as StorageObjectMetadata, expectedChecksum, algorithm);
  }
}