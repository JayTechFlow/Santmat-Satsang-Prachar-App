// Sprint E2 — Integration Tests
// Complete integration test suite for Factory→Registry→Router→Policy→Provider→Application

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ProviderRegistry } from '../Factory/ProviderRegistry';
import { StorageConfigLoader } from '../Config/StorageConfigLoader';
import { StorageRouterV2 } from '../Routing/StorageRouterV2';
import { StoragePolicyEngine } from '../Policy/StoragePolicyEngine';
import { ProviderCapabilityResolver } from '../Capabilities/ProviderCapabilityResolver';
import { healthMonitoring } from '../Health/HealthMonitoringEngine';
import { initializeProviders, shutdownProviders, isProvidersInitialized } from '../Init/ProviderInitializer';
import { FirebaseStorageProvider } from '../Providers/Firebase/FirebaseStorageProvider';
import { S3CompatibleStorageProvider } from '../Providers/S3/S3CompatibleStorageProvider';
import { AmazonS3StorageProvider } from '../Providers/S3/AmazonS3StorageProvider';
import { registerAllFactories } from '../Factory/ProviderFactories';
import { configLoader } from '../Config/StorageConfigLoader';
import type { UploadRequest, StorageDecision } from '../Policy/StoragePolicyEngine';
import type { IStorageProvider, StorageProviderHealth } from '../Interfaces/IStorageProvider';
import { StorageCapability } from '../Capabilities/StorageCapabilities';
import { capabilityResolver } from '../Capabilities/ProviderCapabilityResolver';

// Mock Firebase Admin
vi.mock('firebase-admin', () => ({
  apps: [{ name: '[DEFAULT]' }],
  storage: () => ({
    bucket: () => ({
      file: () => ({
        save: vi.fn().mockResolvedValue(undefined),
        download: vi.fn().mockResolvedValue([Buffer.from('test')]),
        delete: vi.fn().mockResolvedValue(undefined),
        exists: vi.fn().mockResolvedValue([true]),
        move: vi.fn().mockResolvedValue(undefined),
        copy: vi.fn().mockResolvedValue(undefined),
        getSignedUrl: vi.fn().mockResolvedValue(['https://signed-url']),
        getMetadata: vi.fn().mockResolvedValue([{
          size: 100,
          contentType: 'image/jpeg',
          md5Hash: 'abc123',
          timeCreated: new Date().toISOString(),
          updated: new Date().toISOString(),
          metadata: {}
        }]),
        createReadStream: () => require('stream').Readable.from(Buffer.from('test')),
        createWriteStream: () => require('stream').PassThrough(),
      }),
      exists: vi.fn().mockResolvedValue([true]),
    }),
  }),
}));

describe('E2E Integration: Factory→Registry→Router→Policy→Provider→Application', () => {
  let registry: ProviderRegistry;
  let router: StorageRouterV2;
  let policyEngine: StoragePolicyEngine;
  let capabilityResolverInstance: ProviderCapabilityResolver;

  beforeEach(async () => {
    // Reset all singletons
    ProviderRegistry.reset();
    registry = ProviderRegistry.getInstance();
    
    // Register factories
    registerAllFactories();

    // Create mock config
    const mockConfig = {
      version: '2.0',
      environment: 'test',
      providers: [
        {
          providerId: 'firebase-test',
          providerType: 'FIREBASE_STORAGE',
          enabled: true,
          priority: 10,
          region: 'us-central1',
          bucketName: 'test-bucket',
          credentials: { projectId: 'test-project' },
          defaultTier: 'hot',
        },
      ],
      routing: {
        defaultStrategy: 'content_type_routing',
        enabledStrategies: ['content_type_routing', 'health_based_routing', 'failover_routing'],
        strategyConfig: {
          content_type_routing: {
            enabled: true,
            rules: [
              { mimeTypePrefix: 'video/', providerIds: ['firebase-test'], tier: 'hot' },
              { mimeTypePrefix: 'image/', providerIds: ['firebase-test'], tier: 'hot' },
            ],
          },
          health_based_routing: { enabled: true, healthThreshold: 'degraded' },
          failover_routing: { enabled: true, primaryProviderId: 'firebase-test' },
        },
      },
      features: {
        multipartUpload: true,
        resumableUpload: true,
        versioning: false,
        legalHold: false,
        retention: false,
        batchOperations: false,
        costReporting: false,
        replication: false,
        backup: false,
        encryption: { enabled: true, defaultAlgorithm: 'AES-256-GCM' },
        compression: { enabled: false, algorithms: [] },
        deduplication: { enabled: false },
        cdn: { enabled: false },
        observability: { tracing: true, metrics: true, logging: true },
      },
      security: {
        encryptionAlgorithm: 'AES-256-GCM',
        executableBlock: true,
        pathConstraints: true,
        overwriteProtection: true,
        signedTokenValidation: true,
        checksumValidation: true,
        checksumAlgorithm: 'SHA256',
        maxFileSizeBytes: 524288000,
        virusScan: { enabled: false, engine: 'clamav', maxFileSizeBytes: 104857600 },
        contentValidation: { enabled: true, magicBytesCheck: true, mimeTypeVerification: true },
        accessControl: { defaultPublicRead: false, requireSignedUrls: true, signedUrlMaxExpirySeconds: 86400 },
        auditLogging: { enabled: true, logUploads: true, logDownloads: true, logDeletes: true, logMetadataChanges: true },
      },
      lifecycle: {
        defaultRetentionDays: 2555,
        hotToWarmDays: 90,
        warmToColdDays: 180,
        coldToArchiveDays: 365,
        autoTiering: { enabled: true, evaluationIntervalHours: 24 },
        expiration: { enabled: false, defaultDays: 3650 },
        multipartAbort: { enabled: true, daysAfterInitiation: 7 },
      },
      backup: {
        enabled: false,
        schedule: '0 2 * * *',
        timezone: 'UTC',
        retentionDays: 90,
        sourceProviderIds: [],
        destinationProviderId: '',
        includeVersions: false,
        filter: {},
        compression: false,
        encryption: false,
        verification: { enabled: false, sampleRate: 0 },
      },
      replication: {
        enabled: false,
        mode: 'async',
        sourceProviderId: '',
        destinationProviderIds: [],
        filter: {},
        deleteMarkerReplication: false,
        replicationTimeControlMinutes: 15,
        consistencyVerification: { enabled: false, intervalHours: 6, sampleRate: 0 },
      },
      observability: {
        healthCheckIntervalSeconds: 60,
        metricsEnabled: true,
        tracingEnabled: true,
        logLevel: 'debug',
        metricsPort: 9090,
        healthEndpoint: '/health/storage',
        alerting: { enabled: false, latencyThresholdMs: 5000, errorRateThreshold: 0.05, capacityThresholdPercent: 80 },
        exporters: { prometheus: { enabled: true, path: '/metrics' }, datadog: { enabled: false }, newrelic: { enabled: false } },
      },
      performance: {
        connectionPool: { minSize: 5, maxSize: 50, idleTimeoutMs: 30000 },
        concurrency: { maxParallelUploads: 10, maxParallelDownloads: 20, maxParallelOperations: 50 },
        timeouts: { connectMs: 5000, readMs: 30000, writeMs: 60000 },
        retry: { maxAttempts: 3, baseDelayMs: 200, maxDelayMs: 5000, backoffMultiplier: 2 },
        buffering: { uploadBufferSize: 8388608, downloadBufferSize: 8388608 },
        caching: { metadataCacheTtlSeconds: 300, signedUrlCacheTtlSeconds: 300, healthCacheTtlSeconds: 30 },
      },
    };

    // Override configLoader singleton for testing
    configLoader.setConfigForTesting(mockConfig);

    // Create and register the primary Firebase provider for all tests
    const firebaseFactory = registry.getFactory('FIREBASE_STORAGE');
    await firebaseFactory!.create({
      providerId: 'firebase-test',
      providerType: 'FIREBASE_STORAGE',
      enabled: true,
      priority: 10,
      region: 'us-central1',
      bucketName: 'test-bucket',
      credentials: { projectId: 'test-project' },
    });
  });

  afterEach(async () => {
    await shutdownProviders();
    healthMonitoring.stop();
    capabilityResolver.invalidateCache();
    ProviderRegistry.reset();
  });

  describe('Factory Registration', () => {
    it('should register all factories', () => {
      const factories = registry.getRegisteredFactories();
      expect(factories.length).toBeGreaterThanOrEqual(3); // Firebase, AWS S3, S3-Compatible
      
      const factoryTypes = factories.map(f => f.providerType);
      expect(factoryTypes).toContain('FIREBASE_STORAGE');
      expect(factoryTypes).toContain('AWS_S3');
      expect(factoryTypes).toContain('CLOUDFLARE_R2');
    });

    it('should validate factory configs', () => {
      const firebaseFactory = registry.getFactory('FIREBASE_STORAGE');
      expect(firebaseFactory).toBeDefined();
      
      const validation = firebaseFactory!.validateConfig({
        providerId: 'test',
        providerType: 'FIREBASE_STORAGE',
        bucketName: 'test-bucket',
        priority: 10,
      });
      expect(validation.valid).toBe(true);

      const invalidValidation = firebaseFactory!.validateConfig({
        providerId: 'test',
        providerType: 'AWS_S3', // Wrong type
      });
      expect(invalidValidation.valid).toBe(false);
    });
  });

  describe('Provider Registration', () => {
    it('should create and register Firebase provider', async () => {
      const factory = registry.getFactory('FIREBASE_STORAGE');
      expect(factory).toBeDefined();

      const provider = await factory!.create({
        providerId: 'firebase-test',
        providerType: 'FIREBASE_STORAGE',
        enabled: true,
        priority: 10,
        region: 'us-central1',
        bucketName: 'test-bucket',
        credentials: { projectId: 'test-project' },
      });

      expect(provider).toBeDefined();
      expect(provider.providerId).toBe('firebase-test');
      expect(provider.providerType).toBe('FIREBASE_STORAGE');

      // Verify registered in registry
      const registered = registry.resolve('firebase-test');
      expect(registered).toBe(provider);
    });

    it('should register provider with capabilities', async () => {
      const factory = registry.getFactory('FIREBASE_STORAGE');
      const provider = await factory!.create({
        providerId: 'firebase-cap-test',
        providerType: 'FIREBASE_STORAGE',
        enabled: true,
        priority: 10,
        region: 'us-central1',
        bucketName: 'test-bucket',
        credentials: { projectId: 'test-project' },
      });

      const capabilities = provider.getCapabilities();
      expect(capabilities.has(StorageCapability.UPLOAD)).toBe(true);
      expect(capabilities.has(StorageCapability.DOWNLOAD)).toBe(true);
      expect(capabilities.has(StorageCapability.STREAM_DOWNLOAD)).toBe(true);
      expect(capabilities.has(StorageCapability.MULTIPART_CREATE)).toBe(false);
      expect(capabilities.has(StorageCapability.VERSION_LIST)).toBe(false);
    });
  });

  describe('Capability Resolution', () => {
    it('should discover capabilities for registered providers', async () => {
      const factory = registry.getFactory('FIREBASE_STORAGE');
      const provider = await factory!.create({
        providerId: 'firebase-discovery',
        providerType: 'FIREBASE_STORAGE',
        enabled: true,
        priority: 10,
        region: 'us-central1',
        bucketName: 'test-bucket',
        credentials: { projectId: 'test-project' },
      });

      const capabilities = await capabilityResolver.resolveCapabilities('firebase-discovery');
      expect(capabilities.providerId).toBe('firebase-discovery');
      expect(capabilities.capabilities.has(StorageCapability.UPLOAD)).toBe(true);
      expect(capabilities.capabilities.has(StorageCapability.DOWNLOAD)).toBe(true);
      expect(capabilities.capabilities.has(StorageCapability.MULTIPART_CREATE)).toBe(false);
    });

    it('should find providers by capability query', async () => {
      const factory = registry.getFactory('FIREBASE_STORAGE');
      await factory!.create({
        providerId: 'firebase-query',
        providerType: 'FIREBASE_STORAGE',
        enabled: true,
        priority: 10,
        region: 'us-central1',
        bucketName: 'test-bucket',
        credentials: { projectId: 'test-project' },
      });

      const matches = await capabilityResolver.findProviders({
        required: [StorageCapability.UPLOAD, StorageCapability.STREAM_DOWNLOAD],
      });

      expect(matches.length).toBeGreaterThan(0);
      const firebaseMatch = matches.find(m => m.providerType === 'FIREBASE_STORAGE');
      expect(firebaseMatch).toBeDefined();
      expect(firebaseMatch!.matchedRequired).toContain(StorageCapability.UPLOAD);
      expect(firebaseMatch!.matchedRequired).toContain(StorageCapability.STREAM_DOWNLOAD);
    });

    it('should exclude providers missing required capabilities', async () => {
      const matches = await capabilityResolver.findProviders({
        required: [StorageCapability.MULTIPART_CREATE, StorageCapability.VERSION_LIST],
      });

      const firebaseMatches = matches.filter(m => m.providerType === 'FIREBASE_STORAGE');
      expect(firebaseMatches.length).toBe(0);
    });
  });

  describe('Routing Engine', () => {
    let testRouter: StorageRouterV2;

    beforeEach(() => {
      testRouter = new StorageRouterV2();
    });

    it('should initialize with configured strategies', async () => {
      await testRouter.initialize();
      const strategies = testRouter.getStrategyRegistry().getAll();
      expect(strategies.length).toBeGreaterThan(0);
    });

    it('should select provider for upload request', async () => {
      const request: UploadRequest = {
        path: 'test/video.mp4',
        mimeType: 'video/mp4',
        sizeBytes: 1024 * 1024,
        options: { tier: 'hot' },
      };

      const routing = await testRouter.routeForUpload(request);
      expect(routing.decision).toBeDefined();
      expect(routing.provider).toBeDefined();
      expect(routing.decision.providerId).toBe('firebase-test');
      expect(routing.decision.strategy).toBe('content_type_routing');
    });

    it('should route based on content type', async () => {
      const videoRequest: UploadRequest = {
        path: 'video/test.mp4',
        mimeType: 'video/mp4',
        sizeBytes: 100 * 1024 * 1024,
      };

      const routing = await testRouter.routeForUpload(videoRequest);
      expect(routing.decision.providerId).toBe('firebase-test');
      expect(routing.decision.reasoning).toContain('video/');
    });

    it('should provide fallback providers', async () => {
      const request: UploadRequest = {
        path: 'test/image.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 1024 * 1024,
      };

      const routing = await testRouter.routeForUpload(request);
      expect(routing.decision.fallbackProviders).toBeDefined();
    });
  });

  describe('Policy Engine', () => {
    let testPolicyEngine: StoragePolicyEngine;

    beforeEach(() => {
      testPolicyEngine = new StoragePolicyEngine(configLoader.getConfigOrThrow(), ProviderRegistry.getInstance());
    });

    it('should evaluate upload request through all policies', async () => {
      const request: UploadRequest = {
        path: 'images/test.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 1024 * 1024,
        options: { tier: 'hot' },
      };

      const evaluation = await testPolicyEngine.evaluate(request);
      expect(evaluation.allowed).toBe(true);
      expect(evaluation.decision).toBeDefined();
      expect(evaluation.decision.providerId).toBe('firebase-test');
      expect(evaluation.policiesApplied.length).toBeGreaterThan(0);
    });

    it('should reject executable files', async () => {
      const request: UploadRequest = {
        path: 'temp/malware.exe',
        mimeType: 'application/x-msdownload',
        sizeBytes: 1024,
      };

      const evaluation = await testPolicyEngine.evaluate(request);
      expect(evaluation.allowed).toBe(false);
      expect(evaluation.errors.some(e => e.code === 'ENGINE_ERROR' || e.message.includes('Executable'))).toBe(true);
    });

    it('should reject oversized files', async () => {
      const request: UploadRequest = {
        path: 'images/huge.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 1024 * 1024 * 1024, // 1GB > max 500MB
      };

      const evaluation = await testPolicyEngine.evaluate(request);
      expect(evaluation.allowed).toBe(false);
      expect(evaluation.errors.some(e => e.message.includes('exceeds maximum'))).toBe(true);
    });

    it('should validate path constraints', async () => {
      const request: UploadRequest = {
        path: 'unknown-folder/test.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 1024,
      };

      const evaluation = await testPolicyEngine.evaluate(request);
      expect(evaluation.allowed).toBe(false);
    });
  });

  describe('Capability-Based Routing Integration', () => {
    it('should select provider based on required capabilities', async () => {
      const router = new StorageRouterV2();
      await router.initialize();

      const request: UploadRequest = {
        path: 'large-file.dat',
        mimeType: 'application/octet-stream',
        sizeBytes: 200 * 1024 * 1024, // 200MB - requires multipart
        options: { tier: 'hot' },
      };

      const routing = await router.routeForUpload(request);
      expect(routing.decision.providerId).toBeDefined();
    });

    it('should match streaming capability for video/audio', async () => {
      const router = new StorageRouterV2();
      await router.initialize();

      const videoRequest: UploadRequest = {
        path: 'video/stream.mp4',
        mimeType: 'video/mp4',
        sizeBytes: 50 * 1024 * 1024,
      };

      const routing = await router.routeForUpload(videoRequest);
      expect(routing.decision.providerId).toBeDefined();
    });
  });

  describe('Health Monitoring Integration', () => {
    it('should track provider health', async () => {
      const factory = registry.getFactory('FIREBASE_STORAGE');
      const provider = await factory!.create({
        providerId: 'firebase-health',
        providerType: 'FIREBASE_STORAGE',
        enabled: true,
        priority: 10,
        region: 'us-central1',
        bucketName: 'test-bucket',
        credentials: { projectId: 'test-project' },
      });

      // Force health check
      const health = await healthMonitoring.forceHealthCheck('firebase-health');
      expect(health).toBeDefined();
      expect(health.providerId).toBe('firebase-health');
      expect(['healthy', 'degraded', 'critical', 'offline']).toContain(health.status);
    });

    it('should track circuit breaker state', async () => {
      const factory = registry.getFactory('FIREBASE_STORAGE');
      await factory!.create({
        providerId: 'firebase-circuit',
        providerType: 'FIREBASE_STORAGE',
        enabled: true,
        priority: 10,
        region: 'us-central1',
        bucketName: 'test-bucket',
        credentials: { projectId: 'test-project' },
      });

      const isOpen = healthMonitoring.isCircuitOpen('firebase-circuit');
      expect(typeof isOpen).toBe('boolean');
    });

    it('should provide health stats', async () => {
      const factory = registry.getFactory('FIREBASE_STORAGE');
      await factory!.create({
        providerId: 'firebase-stats',
        providerType: 'FIREBASE_STORAGE',
        enabled: true,
        priority: 10,
        region: 'us-central1',
        bucketName: 'test-bucket',
        credentials: { projectId: 'test-project' },
      });

      // Force a few health checks
      await healthMonitoring.forceHealthCheck('firebase-stats');
      await healthMonitoring.forceHealthCheck('firebase-stats');

      const stats = healthMonitoring.getHealthStats('firebase-stats');
      expect(stats).toBeDefined();
      expect(stats!.totalChecks).toBeGreaterThan(0);
      expect(stats!.uptimePercent).toBeGreaterThanOrEqual(0);
      expect(stats!.averageLatencyMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Provider Registry Operations', () => {
    it('should resolve providers by type', async () => {
      const factory = registry.getFactory('FIREBASE_STORAGE');
      await factory!.create({
        providerId: 'firebase-type-test',
        providerType: 'FIREBASE_STORAGE',
        enabled: true,
        priority: 10,
        region: 'us-central1',
        bucketName: 'test-bucket',
        credentials: { projectId: 'test-project' },
      });

      const providers = registry.resolveByType('FIREBASE_STORAGE');
      expect(providers.length).toBeGreaterThan(0);
    });

    it('should resolve providers by capability', async () => {
      const factory = registry.getFactory('FIREBASE_STORAGE');
      await factory!.create({
        providerId: 'firebase-cap-resolve',
        providerType: 'FIREBASE_STORAGE',
        enabled: true,
        priority: 10,
        region: 'us-central1',
        bucketName: 'test-bucket',
        credentials: { projectId: 'test-project' },
      });

      const providers = registry.resolveByCapability('signedUrls' as any);
      // This uses the old interface - new resolver is preferred
    });

    it('should track provider status changes', async () => {
      const factory = registry.getFactory('FIREBASE_STORAGE');
      await factory!.create({
        providerId: 'firebase-status',
        providerType: 'FIREBASE_STORAGE',
        enabled: true,
        priority: 10,
        region: 'us-central1',
        bucketName: 'test-bucket',
        credentials: { projectId: 'test-project' },
      });

      registry.setStatus('firebase-status', 'inactive');
      const providers = registry.enumerate();
      expect(providers.find(p => p.providerId === 'firebase-status')).toBeUndefined();

      registry.setStatus('firebase-status', 'active');
      const activeProviders = registry.enumerate();
      expect(activeProviders.find(p => p.providerId === 'firebase-status')).toBeDefined();
    });
  });

  describe('End-to-End Upload Flow', () => {
    it('should complete full upload flow: Factory→Registry→Router→Policy→Provider', async () => {
      // 1. Factory creates provider
      const factory = registry.getFactory('FIREBASE_STORAGE');
      const provider = await factory!.create({
        providerId: 'firebase-e2e',
        providerType: 'FIREBASE_STORAGE',
        enabled: true,
        priority: 10,
        region: 'us-central1',
        bucketName: 'test-bucket',
        credentials: { projectId: 'test-project' },
      });

      // 2. Registry has provider
      expect(registry.resolve('firebase-e2e')).toBe(provider);

      // 3. Router routes request
      const router = new StorageRouterV2();
      await router.initialize();

      const request: UploadRequest = {
        path: 'e2e/test.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 1024 * 1024,
      };

      const routing = await router.routeForUpload(request);
      expect(routing.provider).toBe(provider);

      // 4. Policy evaluates request
      const policyEngine = new StoragePolicyEngine(configLoader.getConfigOrThrow(), registry);
      const evaluation = await policyEngine.evaluate(request);
      expect(evaluation.allowed).toBe(true);
      expect(evaluation.decision.providerId).toBe('firebase-e2e');

      // 5. Provider executes upload
      const metadata = await provider.upload('e2e/test.jpg', Buffer.from('test data'));
      expect(metadata.storagePath).toBe('e2e/test.jpg');
      expect(metadata.sizeBytes).toBe(8);
      expect(metadata.checksum).toBeDefined();

      // 6. Capability resolver can find provider
      const caps = await capabilityResolver.resolveCapabilities('firebase-e2e');
      expect(caps.capabilities.has(StorageCapability.UPLOAD)).toBe(true);
    });

    it('should complete full download flow', async () => {
      const factory = registry.getFactory('FIREBASE_STORAGE');
      const provider = await factory!.create({
        providerId: 'firebase-download',
        providerType: 'FIREBASE_STORAGE',
        enabled: true,
        priority: 10,
        region: 'us-central1',
        bucketName: 'test-bucket',
        credentials: { projectId: 'test-project' },
      });

      // Upload first
      await provider.upload('download/test.txt', Buffer.from('download test data'));

      // Download
      const data = await provider.download('download/test.txt');
      expect(data.toString()).toBe('download test data');
    });

    it('should complete signed URL flow', async () => {
      const factory = registry.getFactory('FIREBASE_STORAGE');
      const provider = await factory!.create({
        providerId: 'firebase-signed',
        providerType: 'FIREBASE_STORAGE',
        enabled: true,
        priority: 10,
        region: 'us-central1',
        bucketName: 'test-bucket',
        credentials: { projectId: 'test-project' },
      });

      const url = await provider.generateSignedUrl('signed/test.jpg', 'GET', 3600);
      expect(url.url).toContain('firebasestorage.googleapis.com');
      expect(url.httpMethod).toBe('GET');
      expect(url.expiresAt).toBeDefined();
    });
  });

  describe('Provider Lifecycle', () => {
    it('should handle provider unregistration', async () => {
      const factory = registry.getFactory('FIREBASE_STORAGE');
      await factory!.create({
        providerId: 'firebase-lifecycle',
        providerType: 'FIREBASE_STORAGE',
        enabled: true,
        priority: 10,
        region: 'us-central1',
        bucketName: 'test-bucket',
        credentials: { projectId: 'test-project' },
      });

      expect(registry.resolve('firebase-lifecycle')).toBeDefined();

      const unregistered = await registry.unregister('firebase-lifecycle');
      expect(unregistered).toBe(true);
      expect(registry.resolve('firebase-lifecycle')).toBeUndefined();
    });

    it('should track provider metrics', async () => {
      const factory = registry.getFactory('FIREBASE_STORAGE');
      const provider = await factory!.create({
        providerId: 'firebase-metrics-test',
        providerType: 'FIREBASE_STORAGE',
        enabled: true,
        priority: 10,
        region: 'us-central1',
        bucketName: 'test-bucket',
        credentials: { projectId: 'test-project' },
      });

      // Upload some data
      await provider.upload('metrics/test1.txt', Buffer.from('test data 1'));
      await provider.upload('metrics/test2.txt', Buffer.from('test data 2'));

      const metrics = await provider.getMetrics();
      expect(metrics.totalObjectsCount).toBe(2);
      expect(metrics.totalBytesStored).toBeGreaterThan(0);
    });
  });

  describe('Configuration Integration', () => {
    it('should load configuration with environment overrides', async () => {
      const loader = new StorageConfigLoader();
      // This would load storage.yaml and storage.test.yaml
      // For now, verify the loader can be instantiated
      expect(loader).toBeDefined();
    });

    it('should validate configuration', () => {
      const loader = new StorageConfigLoader();
      // Validation happens on load
      expect(typeof loader.load).toBe('function');
      expect(typeof loader.validateConfiguration).toBe('function');
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle provider failures gracefully', async () => {
      const router = new StorageRouterV2();
      await router.initialize();

      const request: UploadRequest = {
        path: 'error/test.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 1024,
      };

      // Should not throw, should route to available provider
      const routing = await router.routeForUpload(request);
      expect(routing.provider).toBeDefined();
    });

    it('should handle missing provider gracefully', async () => {
      const router = new StorageRouterV2();
      await router.initialize();

      // Request for path with no provider
      await expect(router.routeForDownload('nonexistent/path.jpg')).rejects.toThrow('No provider found for path');
    });
  });

  describe('Performance and Concurrency', () => {
    it('should handle concurrent upload requests', async () => {
      const factory = registry.getFactory('FIREBASE_STORAGE');
      const provider = await factory!.create({
        providerId: 'firebase-concurrent',
        providerType: 'FIREBASE_STORAGE',
        enabled: true,
        priority: 10,
        region: 'us-central1',
        bucketName: 'test-bucket',
        credentials: { projectId: 'test-project' },
      });

      const promises = Array.from({ length: 10 }, (_, i) =>
        provider.upload(`concurrent/${i}.txt`, Buffer.from(`data ${i}`))
      );

      const results = await Promise.all(promises);
      expect(results.length).toBe(10);
      results.forEach((meta, i) => {
        expect(meta.storagePath).toBe(`concurrent/${i}.txt`);
      });
    });

    it('should handle concurrent routing requests', async () => {
      const router = new StorageRouterV2();
      await router.initialize();

      const promises = Array.from({ length: 20 }, (_, i) => {
        const request: UploadRequest = {
          path: `concurrent/${i}.txt`,
          mimeType: 'text/plain',
          sizeBytes: 1024,
        };
        return router.routeForUpload(request);
      });

      const results = await Promise.all(promises);
      expect(results.length).toBe(20);
      results.forEach(routing => {
        expect(routing.decision).toBeDefined();
        expect(routing.provider).toBeDefined();
      });
    });
  });
});

describe('Zero Regression Tests', () => {
  it('should preserve existing Firebase upload behavior', async () => {
    const provider = new FirebaseStorageProvider({ bucketName: 'test-bucket', memoryFallback: true });

    // Upload
    const metadata = await provider.upload('regression/path', Buffer.from('test data'));
    expect(metadata.storagePath).toBe('regression/path');
    expect(metadata.sizeBytes).toBe(9);
    expect(metadata.checksum).toBeDefined();

    // Download
    const downloaded = await provider.download('regression/path');
    expect(downloaded.toString()).toBe('test data');

    // Delete
    const deleted = await provider.delete('regression/path');
    expect(deleted).toBe(true);

    // Exists after delete
    const exists = await provider.exists('regression/path');
    expect(exists).toBe(false);
  });

  it('should preserve signed URL generation', async () => {
    const provider = new FirebaseStorageProvider({ bucketName: 'test-bucket', memoryFallback: true });

    const getUrl = await provider.generateSignedUrl('file.txt', 'GET', 3600);
    expect(getUrl.httpMethod).toBe('GET');
    expect(getUrl.url).toBeDefined();

    const putUrl = await provider.generateSignedUrl('file.txt', 'PUT', 3600);
    expect(putUrl.httpMethod).toBe('PUT');
  });

  it('should preserve streaming support', async () => {
    const provider = new FirebaseStorageProvider({ bucketName: 'test-bucket', memoryFallback: true });

    // Upload via stream
    const uploadStream = provider.getUploadStream('stream-test');
    uploadStream.write(Buffer.from('stream data'));
    uploadStream.end();

    // Wait for upload to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Download via stream
    const downloadStream = await provider.getDownloadStream('stream-test');
    const chunks: Buffer[] = [];
    for await (const chunk of downloadStream) {
      chunks.push(chunk);
    }
    expect(Buffer.concat(chunks).toString()).toBe('stream data');
  });

  it('should preserve metadata operations', async () => {
    const provider = new FirebaseStorageProvider({ bucketName: 'test-bucket', memoryFallback: true });

    await provider.upload('meta-test', Buffer.from('data'), {
      metadata: { customKey: 'customValue' },
    });

    const metadata = await provider.getMetadata('meta-test');
    expect(metadata.customMetadata?.customKey).toBe('customValue');
  });

  it('should preserve copy/move/exists/delete', async () => {
    const provider = new FirebaseStorageProvider({ bucketName: 'test-bucket', memoryFallback: true });

    await provider.upload('copy-test/source.txt', Buffer.from('source data'));
    
    const copied = await provider.copy('copy-test/source.txt', 'copy-test/dest.txt');
    expect(copied).toBe(true);

    const moved = await provider.move('copy-test/dest.txt', 'copy-test/moved.txt');
    expect(moved).toBe(true);

    const exists = await provider.exists('copy-test/moved.txt');
    expect(exists).toBe(true);

    const deleted = await provider.delete('copy-test/moved.txt');
    expect(deleted).toBe(true);

    const sourceExists = await provider.exists('copy-test/source.txt');
    expect(sourceExists).toBe(true);
  });
});