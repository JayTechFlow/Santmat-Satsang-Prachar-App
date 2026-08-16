// Sprint E2.3 — Provider Capability Resolver
// Runtime capability discovery and resolution for provider selection

import { EventEmitter } from 'events';
import {
  StorageCapability,
  StorageCapabilitySet,
  ProviderCapabilities,
  CapabilityMetadata,
  getAllCapabilities,
  capabilityToString,
} from './StorageCapabilities';
import type { IStorageProvider } from '../Interfaces/IStorageProvider';
import { ProviderRegistry } from '../Factory/ProviderRegistry';

export interface CapabilityResolverConfig {
  cacheTTLMs: number;
  enableProbing: boolean;
  probeTimeoutMs: number;
}

export interface CapabilityQuery {
  required?: StorageCapability[];
  preferred?: StorageCapability[];
  excluded?: StorageCapability[];
  minScore?: number;
}

export interface CapabilityMatch {
  providerId: string;
  providerType: string;
  score: number;
  matchedRequired: StorageCapability[];
  matchedPreferred: StorageCapability[];
  missingRequired: StorageCapability[];
  missingPreferred: StorageCapability[];
  capabilities: ProviderCapabilities;
}

export class ProviderCapabilityResolver extends EventEmitter {
  private registry: ProviderRegistry;
  private config: CapabilityResolverConfig;
  private capabilityCache = new Map<string, ProviderCapabilities>();
  private probeCache = new Map<string, Map<StorageCapability, boolean>>();

  constructor(config: Partial<CapabilityResolverConfig> = {}) {
    super();
    this.registry = ProviderRegistry.getInstance();
    this.config = {
      cacheTTLMs: config.cacheTTLMs || 5 * 60 * 1000,
      enableProbing: config.enableProbing !== false,
      probeTimeoutMs: config.probeTimeoutMs || 5000,
    };
  }

  async resolveCapabilities(providerId: string, force = false): Promise<ProviderCapabilities> {
    const cached = this.capabilityCache.get(providerId);
    if (!force && cached) {
      return cached;
    }

    const registration = this.registry.enumerate().find(r => r.providerId === providerId);
    if (!registration) {
      throw new Error(`Provider not found: ${providerId}`);
    }

    const provider = registration.provider;
    const capabilities = await this.discoverCapabilities(provider, registration.providerType);

    this.capabilityCache.set(providerId, capabilities);
    this.emit('capabilities:resolved', { providerId, capabilities });

    return capabilities;
  }

  async discoverCapabilities(provider: IStorageProvider, providerType: string): Promise<ProviderCapabilities> {
    const capabilitySet = new Set<StorageCapability>();
    const metadata = new Map<StorageCapability, CapabilityMetadata>();

    const allCapabilities = getAllCapabilities();

    for (const capability of allCapabilities) {
      const supported = await this.probeCapability(provider, capability);
      const native = this.isNativeCapability(providerType, capability);

      if (supported) {
        capabilitySet.add(capability);
      }

      metadata.set(capability, {
        supported,
        native,
        limitations: this.getLimitations(providerType, capability),
        performance: this.getPerformanceProfile(providerType, capability),
      });
    }

    return {
      providerId: provider.providerId,
      providerType,
      capabilities: capabilitySet,
      capabilityMetadata: metadata,
      lastUpdated: new Date().toISOString(),
    };
  }

  async probeCapability(provider: IStorageProvider, capability: StorageCapability): Promise<boolean> {
    const cacheKey = `${provider.providerId}:${capabilityToString(capability)}`;
    const cached = this.probeCache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    const result = await this.executeProbe(provider, capability);
    this.probeCache.set(cacheKey, result);
    return result;
  }

  private async executeProbe(provider: IStorageProvider, capability: StorageCapability): Promise<boolean> {
    try {
      // Authoritative source: the provider's own declared capability set.
      // Method-existence probing would report fake stubs (methods that throw
      // 'capability-not-supported') as supported.
      const declared = (provider as any).getCapabilities?.();
      if (declared instanceof Set) {
        return declared.has(capability);
      }
      if (declared && typeof declared === 'object') {
        return declared[capability] === true;
      }
    } catch {
      return false;
    }

    try {
      switch (capability) {
        case StorageCapability.UPLOAD:
          return typeof provider.upload === 'function';
        case StorageCapability.DOWNLOAD:
          return typeof provider.download === 'function';
        case StorageCapability.DELETE:
          return typeof provider.delete === 'function';
        case StorageCapability.EXISTS:
          return typeof provider.exists === 'function';
        case StorageCapability.COPY:
          return typeof provider.copy === 'function';
        case StorageCapability.MOVE:
          return typeof provider.move === 'function';
        case StorageCapability.RESTORE:
          return typeof provider.restore === 'function';
        case StorageCapability.METADATA_GET:
          return typeof provider.getMetadata === 'function';
        case StorageCapability.METADATA_SET:
          return typeof provider.setMetadata === 'function';
        case StorageCapability.METADATA_DELETE:
          return typeof provider.deleteMetadata === 'function';
        case StorageCapability.SIGNED_URL_GET:
        case StorageCapability.SIGNED_URL_PUT:
        case StorageCapability.SIGNED_URL_DELETE:
        case StorageCapability.SIGNED_URL_POST:
          return typeof provider.generateSignedUrl === 'function';
        case StorageCapability.PRESIGNED_POST_POLICY:
          return typeof provider.generatePresignedPostPolicy === 'function';
        case StorageCapability.MULTIPART_CREATE:
          return typeof provider.createMultipartUpload === 'function';
        case StorageCapability.MULTIPART_UPLOAD_PART:
          return typeof provider.uploadPart === 'function';
        case StorageCapability.MULTIPART_COMPLETE:
          return typeof provider.completeMultipartUpload === 'function';
        case StorageCapability.MULTIPART_ABORT:
          return typeof provider.abortMultipartUpload === 'function';
        case StorageCapability.MULTIPART_LIST:
          return typeof provider.listMultipartUploads === 'function';
        case StorageCapability.RESUMABLE_CREATE:
          return typeof provider.createResumableUpload === 'function';
        case StorageCapability.RESUMABLE_UPLOAD_CHUNK:
          return typeof provider.uploadChunk === 'function';
        case StorageCapability.RESUMABLE_COMPLETE:
          return typeof provider.completeResumableUpload === 'function';
        case StorageCapability.BATCH_DELETE:
          return typeof provider.batchDelete === 'function';
        case StorageCapability.BATCH_COPY:
          return typeof provider.batchCopy === 'function';
        case StorageCapability.BATCH_MOVE:
          return typeof provider.batchMove === 'function';
        case StorageCapability.LIST:
        case StorageCapability.LIST_WITH_DELIMITER:
        case StorageCapability.LIST_PAGINATION:
          return typeof provider.list === 'function';
        case StorageCapability.VERSION_LIST:
          return typeof provider.listVersions === 'function';
        case StorageCapability.VERSION_DELETE:
          return typeof provider.deleteVersion === 'function';
        case StorageCapability.VERSION_RESTORE:
          return typeof provider.restoreVersion === 'function';
        case StorageCapability.LEGAL_HOLD_SET:
          return typeof provider.setLegalHold === 'function';
        case StorageCapability.LEGAL_HOLD_GET:
          return typeof provider.getMetadata === 'function';
        case StorageCapability.RETENTION_SET:
          return typeof provider.setRetention === 'function';
        case StorageCapability.RETENTION_GET:
          return typeof provider.getMetadata === 'function';
        case StorageCapability.OBJECT_LOCK:
          return typeof provider.setRetention === 'function' && typeof provider.setLegalHold === 'function';
        case StorageCapability.STREAM_DOWNLOAD:
          return typeof provider.getDownloadStream === 'function';
        case StorageCapability.STREAM_UPLOAD:
          return typeof provider.getUploadStream === 'function';
        case StorageCapability.STREAM_RANGE:
          return typeof provider.getDownloadStream === 'function';
        case StorageCapability.HEALTH_CHECK:
          return typeof provider.getHealth === 'function';
        case StorageCapability.HEALTH_VERIFY:
          return typeof provider.verifyStorageHealth === 'function';
        case StorageCapability.METRICS_BASIC:
        case StorageCapability.METRICS_DETAILED:
        case StorageCapability.METRICS_COST:
          return typeof provider.getMetrics === 'function';
        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  private isNativeCapability(providerType: string, capability: StorageCapability): boolean {
    const nativeMap: Record<string, StorageCapability[]> = {
      FIREBASE_STORAGE: [
        StorageCapability.UPLOAD,
        StorageCapability.DOWNLOAD,
        StorageCapability.DELETE,
        StorageCapability.EXISTS,
        StorageCapability.COPY,
        StorageCapability.MOVE,
        StorageCapability.RESTORE,
        StorageCapability.METADATA_GET,
        StorageCapability.SIGNED_URL_GET,
        StorageCapability.SIGNED_URL_PUT,
        StorageCapability.SIGNED_URL_DELETE,
        StorageCapability.STREAM_DOWNLOAD,
        StorageCapability.STREAM_UPLOAD,
        StorageCapability.HEALTH_CHECK,
        StorageCapability.HEALTH_VERIFY,
        StorageCapability.TIER_HOT,
        StorageCapability.TIER_WARM,
        StorageCapability.TIER_COLD,
      ],
      AWS_S3: getAllCapabilities(),
      AZURE_BLOB: getAllCapabilities(),
      GOOGLE_CLOUD_STORAGE: getAllCapabilities(),
      CLOUDFLARE_R2: getAllCapabilities().filter(c => c !== StorageCapability.OBJECT_LOCK),
      LOCAL: [
        StorageCapability.UPLOAD,
        StorageCapability.DOWNLOAD,
        StorageCapability.DELETE,
        StorageCapability.EXISTS,
        StorageCapability.COPY,
        StorageCapability.MOVE,
        StorageCapability.METADATA_GET,
        StorageCapability.SIGNED_URL_GET,
        StorageCapability.HEALTH_CHECK,
      ],
    };

    const native = nativeMap[providerType] || [];
    return native.includes(capability);
  }

  private getLimitations(providerType: string, capability: StorageCapability): string[] {
    const limitations: Record<string, Record<StorageCapability, string[]>> = {
      FIREBASE_STORAGE: {
        [StorageCapability.MULTIPART_CREATE]: ['Not natively supported - requires manual implementation'],
        [StorageCapability.RESUMABLE_CREATE]: ['Limited to resumable uploads via GCS API'],
        [StorageCapability.BATCH_DELETE]: ['Not supported - must iterate'],
        [StorageCapability.BATCH_COPY]: ['Not supported - must iterate'],
        [StorageCapability.BATCH_MOVE]: ['Not supported - must iterate'],
        [StorageCapability.VERSION_LIST]: ['Not supported - Firebase does not expose versioning'],
        [StorageCapability.VERSION_DELETE]: ['Not supported'],
        [StorageCapability.VERSION_RESTORE]: ['Not supported'],
        [StorageCapability.LEGAL_HOLD_SET]: ['Not supported - no Object Lock'],
        [StorageCapability.RETENTION_SET]: ['Not supported - no retention policies'],
        [StorageCapability.OBJECT_LOCK]: ['Not supported'],
        [StorageCapability.LIFECYCLE_RULES]: ['Limited - via GCS console only'],
        [StorageCapability.REPLICATION_CROSS_REGION]: ['Not supported - requires GCS replication'],
        [StorageCapability.COMPRESSION_GZIP]: ['Client-side only'],
        [StorageCapability.CDN_INTEGRATION]: ['Via Firebase Hosting/CDN only'],
        [StorageCapability.GEO_ROUTING]: ['Not supported'],
        [StorageCapability.THUMBNAIL_GENERATION]: ['Not native - requires Cloud Functions'],
        [StorageCapability.WAVEFORM_GENERATION]: ['Not native - requires Cloud Functions'],
        [StorageCapability.ARCHIVE]: ['Not supported - use Coldline storage class'],
        [StorageCapability.RESTORE_EXPEDITED]: ['Not supported'],
        [StorageCapability.RESTORE_STANDARD]: ['Not supported'],
        [StorageCapability.RESTORE_BULK]: ['Not supported'],
      },
    };

    return limitations[providerType]?.[capability] || [];
  }

  private getPerformanceProfile(providerType: string, capability: StorageCapability): CapabilityMetadata['performance'] {
    const profiles: Record<string, Record<StorageCapability, CapabilityMetadata['performance']>> = {
      FIREBASE_STORAGE: {
        [StorageCapability.UPLOAD]: { maxFileSizeBytes: 5 * 1024 * 1024 * 1024, typicalLatencyMs: 100, throughputMbps: 100 },
        [StorageCapability.DOWNLOAD]: { typicalLatencyMs: 50, throughputMbps: 500 },
        [StorageCapability.MULTIPART_CREATE]: { maxParts: 10000, partSizeRange: { min: 256 * 1024, max: 5 * 1024 * 1024 * 1024 } },
      },
      AWS_S3: {
        [StorageCapability.UPLOAD]: { maxFileSizeBytes: 5 * 1024 * 1024 * 1024, typicalLatencyMs: 50, throughputMbps: 1000 },
        [StorageCapability.DOWNLOAD]: { typicalLatencyMs: 20, throughputMbps: 2000 },
        [StorageCapability.MULTIPART_CREATE]: { maxParts: 10000, partSizeRange: { min: 5 * 1024 * 1024, max: 5 * 1024 * 1024 * 1024 } },
        [StorageCapability.MULTIPART_UPLOAD_PART]: { concurrentOperations: 10 },
      },
    };

    return profiles[providerType]?.[capability];
  }

  async findProviders(query: CapabilityQuery): Promise<CapabilityMatch[]> {
    const registrations = this.registry.enumerate();
    const matches: CapabilityMatch[] = [];

    for (const reg of registrations) {
      if (reg.status !== 'active') continue;

      const capabilities = await this.resolveCapabilities(reg.providerId);
      const match = this.evaluateMatch(capabilities, query);
      if (match.score >= (query.minScore || 0)) {
        matches.push(match);
      }
    }

    matches.sort((a, b) => b.score - a.score);
    return matches;
  }

  private evaluateMatch(capabilities: ProviderCapabilities, query: CapabilityQuery): CapabilityMatch {
    const required = query.required || [];
    const preferred = query.preferred || [];
    const excluded = query.excluded || [];

    const missingRequired = required.filter(c => !capabilities.capabilities.has(c));
    const missingPreferred = preferred.filter(c => !capabilities.capabilities.has(c));
    const matchedRequired = required.filter(c => capabilities.capabilities.has(c));
    const matchedPreferred = preferred.filter(c => capabilities.capabilities.has(c));

    const hasExcluded = excluded.some(c => capabilities.capabilities.has(c));
    if (hasExcluded) {
      return {
        providerId: capabilities.providerId,
        providerType: capabilities.providerType,
        score: 0,
        matchedRequired,
        matchedPreferred,
        missingRequired,
        missingPreferred,
        capabilities,
      };
    }

    const requiredWeight = 100;
    const preferredWeight = 10;
    const nativeBonus = 5;

    let score = 0;
    score += matchedRequired.length * requiredWeight;
    score += matchedPreferred.length * preferredWeight;

    for (const cap of matchedRequired) {
      const meta = capabilities.capabilityMetadata.get(cap);
      if (meta?.native) score += nativeBonus;
    }
    for (const cap of matchedPreferred) {
      const meta = capabilities.capabilityMetadata.get(cap);
      if (meta?.native) score += nativeBonus;
    }

    if (missingRequired.length > 0) {
      score = 0;
    }

    return {
      providerId: capabilities.providerId,
      providerType: capabilities.providerType,
      score,
      matchedRequired,
      matchedPreferred,
      missingRequired,
      missingPreferred,
      capabilities,
    };
  }

  async getBestProvider(query: CapabilityQuery): Promise<ProviderCapabilities | null> {
    const matches = await this.findProviders(query);
    if (matches.length === 0) return null;
    return matches[0].capabilities;
  }

  invalidateCache(providerId?: string): void {
    if (providerId) {
      this.capabilityCache.delete(providerId);
      for (const key of this.probeCache.keys()) {
        if (key.startsWith(`${providerId}:`)) {
          this.probeCache.delete(key);
        }
      }
    } else {
      this.capabilityCache.clear();
      this.probeCache.clear();
    }
  }

  getCachedCapabilities(providerId: string): ProviderCapabilities | undefined {
    return this.capabilityCache.get(providerId);
  }

  getAllCachedCapabilities(): Map<string, ProviderCapabilities> {
    return new Map(this.capabilityCache);
  }

  async discoverAllCapabilities(): Promise<Map<string, ProviderCapabilities>> {
    const registrations = this.registry.enumerate();
    const results = new Map<string, ProviderCapabilities>();

    await Promise.all(
      registrations.map(async (reg) => {
        if (reg.status === 'active') {
          const caps = await this.resolveCapabilities(reg.providerId, true);
          results.set(reg.providerId, caps);
        }
      })
    );

    return results;
  }
}

export const capabilityResolver = new ProviderCapabilityResolver();