// Sprint E2 — S3 Signed URL Service
// Handles signed URL generation for S3-compatible storage

import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { S3Client } from '@aws-sdk/client-s3';
import type { SignedUrlResult, PresignedPostPolicy, PolicyCondition } from '../../../Models/StorageModels';

export interface S3SignedUrlConfig {
  bucketName: string;
  region: string;
}

export class S3SignedUrlService {
  private client: S3Client;
  private config: S3SignedUrlConfig;

  constructor(client: S3Client, config: S3SignedUrlConfig) {
    this.client = client;
    this.config = config;
  }

  async generateSignedUrl(
    path: string,
    action: 'GET' | 'PUT' | 'DELETE' | 'POST',
    expiresInSeconds: number,
    options?: { headers?: Record<string, string> }
  ): Promise<SignedUrlResult> {
    let command: any;
    switch (action) {
      case 'GET':
        command = new GetObjectCommand({ Bucket: this.config.bucketName, Key: path });
        break;
      case 'PUT':
        command = new PutObjectCommand({ Bucket: this.config.bucketName, Key: path });
        break;
      case 'DELETE':
        command = new DeleteObjectCommand({ Bucket: this.config.bucketName, Key: path });
        break;
      default:
        throw new Error(`Unsupported action for signed URL: ${action}`);
    }

    const url = await getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });

    return {
      url,
      expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
      httpMethod: action,
      headers: options?.headers,
    };
  }

  async generatePresignedPostPolicy(policy: any): Promise<PresignedPostPolicy> {
    const conditions: PolicyCondition[] = policy.conditions || [];
    const fields: Record<string, string> = {
      key: policy.key || '${filename}',
      bucket: this.config.bucketName,
      'x-amz-algorithm': 'AWS4-HMAC-SHA256',
      'x-amz-credential': `${process.env.AWS_ACCESS_KEY_ID || 'key'}/${new Date().toISOString().split('T')[0].replace(/-/g, '')}/${this.config.region}/s3/aws4_request`,
      'x-amz-date': new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      policy: Buffer.from(JSON.stringify({ expiration: policy.expiration, conditions })).toString('base64'),
    };

    // Signature would be computed here in real implementation
    fields['x-amz-signature'] = 'computed-signature';

    return {
      url: `https://${this.config.bucketName}.s3.${this.config.region}.amazonaws.com/`,
      fields,
      conditions,
    };
  }
}