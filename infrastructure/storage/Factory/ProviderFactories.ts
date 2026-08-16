// Sprint E2.3 — Provider Factories
// Factory implementations for Firebase and AWS S3 providers

import type { IStorageProviderFactory } from './ProviderRegistry';
import type { StorageProviderType, StorageTier, StorageProviderConfig, ProviderCapabilities, ValidationResult } from '../Models/StorageModels';
import { FirebaseStorageProvider } from '../Providers/Firebase/FirebaseStorageProvider';
import { AmazonS3StorageProvider } from '../Providers/S3/AmazonS3StorageProvider';
import { S3CompatibleStorageProvider } from '../Providers/S3/S3CompatibleStorageProvider';
import { ProviderRegistry } from './ProviderRegistry';
import { StorageCapability } from '../Capabilities/StorageCapabilities';

// ============ FIREBASE STORAGE FACTORY ============

export class FirebaseStorageFactory implements IStorageProviderFactory {
  public readonly providerType: StorageProviderType = 'FIREBASE_STORAGE';

  public readonly supportedCapabilities: ProviderCapabilities = {
    multipartUpload: false,
    streaming: true,
    versioning: false,
    retention: false,
    legalHold: false,
    signedUrls: true,
    replication: false,
    lifecycle: false,
    encryption: true,
    metrics: true,
    batch: false,
    resume: true,
    maxPartSize: 5 * 1024 * 1024 * 1024,
    maxParts: 10000,
    maxUploadSize: 5 * 1024 * 1024 * 1024,
    supportedStorageClasses: ['STANDARD', 'NEARLINE', 'COLDLINE', 'ARCHIVE'],
    supportedTiers: ['hot', 'warm', 'cold'],
    supportedRegions: ['us-central1', 'us-east1', 'us-west1', 'europe-west1', 'asia-east1'],
  };

  async create(config: StorageProviderConfig): Promise<any> {
    const firebaseConfig = {
      bucketName: config.bucketName,
      projectId: config.credentials?.projectId,
      storageRegion: config.region,
      enableResumableUploads: true,
      defaultCacheControl: 'public, max-age=3600',
      maxRetries: 3,
      retryDelayMs: 200,
      providerId: config.providerId,
    };

    const provider = new FirebaseStorageProvider(firebaseConfig);
    await provider.registerWithRegistry();
    return provider;
  }

  async destroy(provider: any): Promise<void> {
    // Firebase provider doesn't need explicit cleanup
  }

  async reload(provider: any, config: StorageProviderConfig): Promise<any> {
    await this.destroy(provider);
    return this.create(config);
  }

  validateConfig(config: StorageProviderConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!config.providerId) errors.push('providerId is required');
    if (config.providerType !== 'FIREBASE_STORAGE') errors.push('providerType must be FIREBASE_STORAGE');
    if (!config.bucketName) warnings.push('bucketName not specified, will use default');
    if (config.priority === undefined || config.priority < 0) warnings.push('priority should be non-negative');

    return { valid: errors.length === 0, errors, warnings };
  }

  async discoverCapabilities(provider: any): Promise<ProviderCapabilities> {
    return this.supportedCapabilities;
  }
}

// ============ AWS S3 FACTORY ============

export class AmazonS3Factory implements IStorageProviderFactory {
  public readonly providerType: StorageProviderType = 'AWS_S3';

  public readonly supportedCapabilities: ProviderCapabilities = {
    multipartUpload: true,
    streaming: true,
    versioning: true,
    retention: true,
    legalHold: true,
    signedUrls: true,
    replication: true,
    lifecycle: true,
    encryption: true,
    metrics: true,
    batch: true,
    resume: true,
    maxPartSize: 5 * 1024 * 1024 * 1024,
    maxParts: 10000,
    maxUploadSize: 5 * 1024 * 1024 * 1024,
    supportedStorageClasses: [
      'STANDARD',
      'INTELLIGENT_TIERING',
      'STANDARD_IA',
      'ONEZONE_IA',
      'GLACIER',
      'DEEP_ARCHIVE',
      'REDUCED_REDUNDANCY',
    ],
    supportedTiers: ['hot', 'warm', 'cold', 'archive'],
    supportedRegions: [
      'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
      'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1', 'eu-north-1',
      'ap-south-1', 'ap-northeast-1', 'ap-northeast-2', 'ap-northeast-3',
      'ap-southeast-1', 'ap-southeast-2', 'ap-southeast-3',
      'ca-central-1', 'sa-east-1', 'me-south-1', 'af-south-1',
    ],
  };

  async create(config: StorageProviderConfig): Promise<any> {
    const s3Config = {
      region: config.region || 'us-east-1',
      bucketName: config.bucketName!,
      endpoint: config.endpoint,
      forcePathStyle: config.forcePathStyle,
      credentials: {
        accessKeyId: config.credentials?.accessKeyId || '',
        secretAccessKey: config.credentials?.secretAccessKey || '',
        sessionToken: config.credentials?.sessionToken,
      },
      storageClass: config.defaultStorageClass,
      maxRetries: 3,
      retryDelayMs: 200,
      multipartThreshold: 100 * 1024 * 1024,
      multipartPartSize: 5 * 1024 * 1024,
      concurrentParts: 4,
    };

    const provider = new AmazonS3StorageProvider(s3Config);
    provider.registerWithRegistry();
    return provider;
  }

  async destroy(provider: any): Promise<void> {
    // S3 client doesn't need explicit cleanup
  }

  async reload(provider: any, config: StorageProviderConfig): Promise<any> {
    await this.destroy(provider);
    return this.create(config);
  }

  validateConfig(config: StorageProviderConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!config.providerId) errors.push('providerId is required');
    if (config.providerType !== 'AWS_S3') errors.push('providerType must be AWS_S3');
    if (!config.bucketName) errors.push('bucketName is required');
    if (!config.region) errors.push('region is required');
    if (!config.credentials?.accessKeyId) warnings.push('accessKeyId not provided, will use default credential chain');
    if (!config.credentials?.secretAccessKey) warnings.push('secretAccessKey not provided, will use default credential chain');
    if (config.priority === undefined || config.priority < 0) warnings.push('priority should be non-negative');

    return { valid: errors.length === 0, errors, warnings };
  }

  async discoverCapabilities(provider: any): Promise<ProviderCapabilities> {
    return this.supportedCapabilities;
  }
}

// ============ S3 COMPATIBLE FACTORY (for R2, MinIO, Wasabi, etc.) ============

export class S3CompatibleFactory implements IStorageProviderFactory {
  public readonly providerType: StorageProviderType = 'CLOUDFLARE_R2'; // Generic S3-compatible

  public readonly supportedCapabilities: ProviderCapabilities = {
    multipartUpload: true,
    streaming: true,
    versioning: true,
    retention: false, // Varies by provider
    legalHold: false, // Varies by provider
    signedUrls: true,
    replication: false, // Varies by provider
    lifecycle: false, // Varies by provider
    encryption: true,
    metrics: true,
    batch: true,
    resume: true,
    maxPartSize: 5 * 1024 * 1024 * 1024,
    maxParts: 10000,
    maxUploadSize: 5 * 1024 * 1024 * 1024,
    supportedStorageClasses: ['STANDARD'],
    supportedTiers: ['hot', 'warm', 'cold'],
    supportedRegions: ['auto', 'global'],
  };

  async create(config: StorageProviderConfig): Promise<any> {
    const s3Config = {
      region: config.region || 'auto',
      bucketName: config.bucketName!,
      endpoint: config.endpoint,
      forcePathStyle: config.forcePathStyle ?? true,
      credentials: {
        accessKeyId: config.credentials?.accessKeyId || '',
        secretAccessKey: config.credentials?.secretAccessKey || '',
      },
      storageClass: config.defaultStorageClass,
      maxRetries: 3,
      retryDelayMs: 200,
      multipartThreshold: 100 * 1024 * 1024,
      multipartPartSize: 5 * 1024 * 1024,
      concurrentParts: 4,
    };

    // Create a generic S3-compatible provider
    const provider = new S3CompatibleStorageProvider(s3Config);
    provider.registerWithRegistry();
    return provider;
  }

  async destroy(provider: any): Promise<void> {}

  async reload(provider: any, config: StorageProviderConfig): Promise<any> {
    await this.destroy(provider);
    return this.create(config);
  }

  validateConfig(config: StorageProviderConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!config.providerId) errors.push('providerId is required');
    if (!config.bucketName) errors.push('bucketName is required');
    if (!config.endpoint) errors.push('endpoint is required for S3-compatible providers');
    if (!config.credentials?.accessKeyId) warnings.push('accessKeyId not provided');
    if (!config.credentials?.secretAccessKey) warnings.push('secretAccessKey not provided');
    if (config.priority === undefined || config.priority < 0) warnings.push('priority should be non-negative');

    return { valid: errors.length === 0, errors, warnings };
  }

  async discoverCapabilities(provider: any): Promise<ProviderCapabilities> {
    return this.supportedCapabilities;
  }
}

// ============ REGISTER FACTORIES ============

export function registerAllFactories(): void {
  const registry = ProviderRegistry.getInstance();

  registry.registerFactory(new FirebaseStorageFactory());
  registry.registerFactory(new AmazonS3Factory());
  registry.registerFactory(new S3CompatibleFactory());

  console.log('All provider factories registered');
}

export function registerFirebaseFactory(): void {
  ProviderRegistry.getInstance().registerFactory(new FirebaseStorageFactory());
}

export function registerAmazonS3Factory(): void {
  ProviderRegistry.getInstance().registerFactory(new AmazonS3Factory());
}

export function registerS3CompatibleFactory(): void {
  ProviderRegistry.getInstance().registerFactory(new S3CompatibleFactory());
}