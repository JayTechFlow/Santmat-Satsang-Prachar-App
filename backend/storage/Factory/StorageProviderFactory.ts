// Sprint E2.2 — Storage Provider Factory
// Abstract factory with capability validation, discovery, and lifecycle management

import type {
  StorageProviderType,
  StorageProviderConfig,
  StorageTier,
  ProviderCapabilities,
  ValidationResult,
  LifecycleRule,
  CorsRule,
  PublicAccessBlockConfig,
} from '../Models/StorageModels';
import type { IStorageProvider } from '../Interfaces/IStorageProvider';
import { ProviderRegistry, type IStorageProviderFactory } from './ProviderRegistry';

export abstract class BaseStorageProviderFactory implements IStorageProviderFactory {
  abstract readonly providerType: StorageProviderType;
  abstract readonly supportedCapabilities: ProviderCapabilities;

  abstract create(config: StorageProviderConfig): Promise<IStorageProvider>;

  async destroy(provider: IStorageProvider): Promise<void> {
    if (provider && typeof (provider as any).close === 'function') {
      await (provider as any).close();
    }
  }

  async reload(provider: IStorageProvider, config: StorageProviderConfig): Promise<IStorageProvider> {
    await this.destroy(provider);
    return this.create(config);
  }

  validateConfig(config: StorageProviderConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!config.providerId) {
      errors.push('providerId is required');
    }
    if (!config.providerType) {
      errors.push('providerType is required');
    }
    if (config.providerType !== this.providerType) {
      errors.push(`providerType must be ${this.providerType}, got ${config.providerType}`);
    }
    if (config.priority === undefined || config.priority < 0) {
      warnings.push('priority should be a non-negative integer');
    }
    if (config.maxFileSizeBytes !== undefined && config.maxFileSizeBytes <= 0) {
      errors.push('maxFileSizeBytes must be positive');
    }
    if (config.allowedMimeTypes && config.blockedMimeTypes) {
      const overlap = config.allowedMimeTypes.filter(m => config.blockedMimeTypes!.includes(m));
      if (overlap.length > 0) {
        warnings.push(`MIME types in both allowed and blocked: ${overlap.join(', ')}`);
      }
    }
    if (config.allowedExtensions && config.blockedExtensions) {
      const overlap = config.allowedExtensions.filter(e => config.blockedExtensions!.includes(e));
      if (overlap.length > 0) {
        warnings.push(`Extensions in both allowed and blocked: ${overlap.join(', ')}`);
      }
    }
    if (config.lifecycleRules) {
      for (const rule of config.lifecycleRules) {
        const ruleErrors = this.validateLifecycleRule(rule);
        errors.push(...ruleErrors);
      }
    }
    if (config.corsRules) {
      for (const rule of config.corsRules) {
        if (!rule.allowedOrigins || rule.allowedOrigins.length === 0) {
          errors.push('CORS rule must have at least one allowed origin');
        }
        if (!rule.allowedMethods || rule.allowedMethods.length === 0) {
          errors.push('CORS rule must have at least one allowed method');
        }
      }
    }
    if (config.publicAccessBlock) {
      if (typeof config.publicAccessBlock.blockPublicAcls !== 'boolean') {
        errors.push('publicAccessBlock.blockPublicAcls must be boolean');
      }
      if (typeof config.publicAccessBlock.ignorePublicAcls !== 'boolean') {
        errors.push('publicAccessBlock.ignorePublicAcls must be boolean');
      }
      if (typeof config.publicAccessBlock.blockPublicPolicy !== 'boolean') {
        errors.push('publicAccessBlock.blockPublicPolicy must be boolean');
      }
      if (typeof config.publicAccessBlock.restrictPublicBuckets !== 'boolean') {
        errors.push('publicAccessBlock.restrictPublicBuckets must be boolean');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  protected validateLifecycleRule(rule: LifecycleRule): string[] {
    const errors: string[] = [];
    if (!rule.id) {
      errors.push('Lifecycle rule must have an id');
    }
    if (rule.status !== 'Enabled' && rule.status !== 'Disabled') {
      errors.push('Lifecycle rule status must be Enabled or Disabled');
    }
    if (rule.transitions) {
      for (const transition of rule.transitions) {
        if (!transition.storageClass) {
          errors.push('Lifecycle transition must have storageClass');
        }
        if (transition.days === undefined && transition.date === undefined) {
          errors.push('Lifecycle transition must have days or date');
        }
      }
    }
    if (rule.expiration) {
      if (rule.expiration.days === undefined && rule.expiration.date === undefined) {
        errors.push('Lifecycle expiration must have days or date');
      }
    }
    return errors;
  }

  async discoverCapabilities(provider: IStorageProvider): Promise<ProviderCapabilities> {
    const baseCapabilities = { ...this.supportedCapabilities };
    const discovered: Partial<ProviderCapabilities> = {};

    try {
      if (typeof provider.createMultipartUpload === 'function') {
        discovered.multipartUpload = true;
      }
      if (typeof provider.getDownloadStream === 'function' && typeof provider.getUploadStream === 'function') {
        discovered.streaming = true;
      }
      if (typeof provider.listVersions === 'function') {
        discovered.versioning = true;
      }
      if (typeof provider.setRetention === 'function') {
        discovered.retention = true;
      }
      if (typeof provider.setLegalHold === 'function') {
        discovered.legalHold = true;
      }
      if (typeof provider.generateSignedUrl === 'function') {
        discovered.signedUrls = true;
      }
      if (typeof provider.batchDelete === 'function') {
        discovered.batch = true;
      }
      if (typeof provider.uploadResumable === 'function') {
        discovered.resume = true;
      }
      if (typeof provider.getMetrics === 'function') {
        discovered.metrics = true;
      }
      if (typeof provider.getReplicationStatus === 'function') {
        discovered.replication = true;
      }
    } catch {
      // Capability detection is best effort
    }

    return { ...baseCapabilities, ...discovered } as ProviderCapabilities;
  }
}

export function registerProviderFactory(factory: IStorageProviderFactory): void {
  ProviderRegistry.getInstance().registerFactory(factory);
}

export function getProviderFactory(type: StorageProviderType): IStorageProviderFactory | undefined {
  return ProviderRegistry.getInstance().getFactory(type);
}