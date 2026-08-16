// Sprint E2.2 — Storage Router V2
// Policy-driven router with strategy framework, health monitoring, and capability discovery

import type {
  IStorageRouter,
  IStorageProvider,
  StorageTier,
  StorageStrategyType,
  StorageProviderType,
  StorageOptions,
  StorageObjectMetadata,
  SignedUrlResult,
  PresignedPostPolicy,
  MultipartUpload,
  MultipartUploadOptions,
  ResumableUploadOptions,
  UploadProgress,
  StorageError,
  StorageProviderHealth,
  StorageMetrics,
} from '../Interfaces/IStorageProvider';
import type { UploadRequest, StorageDecision, ExecutionPlan } from './StoragePolicyEngine';
import { ProviderRegistry, type ProviderRegistration } from '../Factory/ProviderRegistry';
import { StoragePolicyEngine } from '../Policy/StoragePolicyEngine';
import { StrategyRegistry, type IStorageRoutingStrategy, type RoutingContext, type StrategyResult, strategyRegistry } from './RoutingStrategies';
import {
  ContentTypeRoutingStrategy,
  HealthBasedRoutingStrategy,
  CapabilityRoutingStrategy,
  TierBasedRoutingStrategy,
  PrimarySecondaryRoutingStrategy,
  FailoverRoutingStrategy,
  PriorityRoutingStrategy,
  WeightedRoutingStrategy,
  RoundRobinRoutingStrategy,
  CostAwareRoutingStrategy,
  GeoRoutingStrategy,
} from './RoutingStrategies';
import { configLoader, type StorageConfiguration, type RoutingConfiguration } from '../Config/StorageConfigLoader';

export interface RouterMetrics {
  totalRequests: number;
  successfulRoutes: number;
  failedRoutes: number;
  averageLatencyMs: number;
  strategyUsage: Record<string, number>;
  providerUsage: Record<string, number>;
  errorsByType: Record<string, number>;
}

export interface RoutingResult {
  decision: StorageDecision;
  executionPlan: ExecutionPlan;
  provider: IStorageProvider;
}

export class StorageRouterV2 implements IStorageRouter {
  private registry: ProviderRegistry;
  private policyEngine: StoragePolicyEngine;
  private strategyRegistry: StrategyRegistry;
  private config: StorageConfiguration;
  private routingConfig: RoutingConfiguration;
  private metrics: RouterMetrics;
  private initialized = false;

  constructor() {
    this.registry = ProviderRegistry.getInstance();
    this.config = configLoader.getConfigOrThrow();
    this.routingConfig = this.config.routing;
    this.policyEngine = new StoragePolicyEngine(this.config, this.registry);
    this.strategyRegistry = strategyRegistry;
    this.metrics = this.initializeMetrics();
    this.initializeStrategies();
  }

  private initializeMetrics(): RouterMetrics {
    return {
      totalRequests: 0,
      successfulRoutes: 0,
      failedRoutes: 0,
      averageLatencyMs: 0,
      strategyUsage: {},
      providerUsage: {},
      errorsByType: {},
    };
  }

  private initializeStrategies(): void {
    const strategyConfig = this.routingConfig.strategyConfig;

    if (strategyConfig.content_type_routing?.enabled) {
      const strategy = new ContentTypeRoutingStrategy(
        strategyConfig.content_type_routing.rules || []
      );
      this.strategyRegistry.register(strategy);
    }

    if (strategyConfig.health_based_routing?.enabled) {
      const strategy = new HealthBasedRoutingStrategy(
        strategyConfig.health_based_routing.healthThreshold || 'degraded',
        strategyConfig.health_based_routing.excludeOffline !== false
      );
      this.strategyRegistry.register(strategy);
    }

    if (strategyConfig.capability_routing?.enabled) {
      const strategy = new CapabilityRoutingStrategy(
        strategyConfig.capability_routing.capabilityPriorities || {}
      );
      this.strategyRegistry.register(strategy);
    }

    if (strategyConfig.tier_based_routing?.enabled) {
      const strategy = new TierBasedRoutingStrategy(
        strategyConfig.tier_based_routing.tierMapping || { hot: [], warm: [], cold: [], archive: [] }
      );
      this.strategyRegistry.register(strategy);
    }

    if (strategyConfig.primary_secondary?.enabled) {
      const strategy = new PrimarySecondaryRoutingStrategy(
        strategyConfig.primary_secondary.primaryProviderId || '',
        strategyConfig.primary_secondary.secondaryProviderIds || [],
        strategyConfig.primary_secondary.asyncReplication !== false
      );
      this.strategyRegistry.register(strategy);
    }

    if (strategyConfig.failover_routing?.enabled) {
      const strategy = new FailoverRoutingStrategy(
        strategyConfig.failover_routing.primaryProviderId || '',
        strategyConfig.failover_routing.secondaryProviderIds || [],
        strategyConfig.failover_routing.healthCheckIntervalSeconds || 30,
        strategyConfig.failover_routing.failbackEnabled !== false,
        strategyConfig.failover_routing.failbackDelaySeconds || 300
      );
      this.strategyRegistry.register(strategy);
    }

    if (strategyConfig.priority_routing?.enabled) {
      const strategy = new PriorityRoutingStrategy(
        strategyConfig.priority_routing.providerPriorities || {}
      );
      this.strategyRegistry.register(strategy);
    }

    if (strategyConfig.weighted_routing?.enabled) {
      const strategy = new WeightedRoutingStrategy(
        strategyConfig.weighted_routing.providerWeights || {}
      );
      this.strategyRegistry.register(strategy);
    }

    if (strategyConfig.round_robin?.enabled) {
      const strategy = new RoundRobinRoutingStrategy(
        strategyConfig.round_robin.providerIds || []
      );
      this.strategyRegistry.register(strategy);
    }

    if (strategyConfig.cost_aware_routing?.enabled) {
      const strategy = new CostAwareRoutingStrategy(
        strategyConfig.cost_aware_routing.maxCostPerGBMonth || 0.03,
        strategyConfig.cost_aware_routing.preferCheapest !== false
      );
      this.strategyRegistry.register(strategy);
    }

    if (strategyConfig.geo_routing?.enabled) {
      const strategy = new GeoRoutingStrategy(
        strategyConfig.geo_routing.regionMapping || {},
        strategyConfig.geo_routing.defaultRegion || 'us-central1'
      );
      this.strategyRegistry.register(strategy);
    }

    this.strategyRegistry.setDefault(this.routingConfig.defaultStrategy);
    this.initialized = true;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initializeStrategies();
    this.initialized = true;
  }

  selectProvider(
    mimeType: string,
    region?: string,
    tier: StorageTier = 'hot',
    strategy?: StorageStrategyType
  ): IStorageProvider {
    const request: UploadRequest = {
      path: '',
      mimeType,
      sizeBytes: 0,
      options: { tier, region },
    };

    const decision = this.selectProviderSync(request, strategy);
    const provider = this.registry.resolve(decision.providerId);
    if (!provider) {
      throw new Error(`Provider not found: ${decision.providerId}`);
    }
    return provider;
  }

  private selectProviderSync(request: UploadRequest, strategy?: StorageStrategyType): StorageDecision {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      let decision: StorageDecision;

      if (strategy) {
        const routingStrategy = this.strategyRegistry.get(strategy);
        if (routingStrategy) {
          const context = this.buildRoutingContext(request);
          const result = this.executeStrategySync(routingStrategy, context);
          decision = this.buildDecisionFromResult(result, strategy, request);
        } else {
          decision = this.selectWithPolicyEngine(request);
        }
      } else {
        decision = this.selectWithPolicyEngine(request);
      }

      this.recordSuccess(decision, Date.now() - startTime);
      return decision;
    } catch (error) {
      this.recordError(error, Date.now() - startTime);
      throw error;
    }
  }

  private selectWithPolicyEngine(request: UploadRequest): StorageDecision {
    const evaluation = this.policyEngine.evaluate(request);
    if (!evaluation.allowed || !evaluation.decision) {
      throw new Error(`Routing failed: ${evaluation.errors.map(e => e.message).join(', ')}`);
    }
    return evaluation.decision;
  }

  private buildRoutingContext(request: UploadRequest): RoutingContext {
    return {
      request,
      providers: this.registry.enumerate(),
      health: this.registry.getAllHealth(),
      capabilities: this.registry.getAllCapabilities(),
      config: this.config,
    };
  }

  private executeStrategySync(strategy: IStorageRoutingStrategy, context: RoutingContext): StrategyResult {
    return strategy.selectProvider(context);
  }

  private buildDecisionFromResult(result: StrategyResult, strategy: StorageStrategyType, request: UploadRequest): StorageDecision {
    return {
      providerId: result.providerId,
      providerType: result.providerType,
      strategy,
      tier: request.options?.tier || 'hot',
      region: request.options?.region,
      executionPlan: {
        primaryProvider: result.providerId,
        operations: [],
        replicationTargets: [],
        lifecycleActions: [],
        securityChecks: [],
      },
      policiesApplied: [],
      fallbackProviders: result.fallbackProviders,
      confidence: result.confidence,
      reasoning: result.reasoning,
    };
  }

  async routeForUpload(request: UploadRequest): Promise<RoutingResult> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      const evaluation = await this.policyEngine.evaluate(request);
      if (!evaluation.allowed || !evaluation.decision) {
        throw new Error(`Routing failed: ${evaluation.errors.map(e => e.message).join(', ')}`);
      }

      const provider = this.registry.resolve(evaluation.decision.providerId);
      if (!provider) {
        throw new Error(`Provider not found: ${evaluation.decision.providerId}`);
      }

      this.recordSuccess(evaluation.decision, Date.now() - startTime);
      return {
        decision: evaluation.decision,
        executionPlan: evaluation.decision.executionPlan,
        provider,
      };
    } catch (error) {
      this.recordError(error, Date.now() - startTime);
      throw error;
    }
  }

  async routeForDownload(path: string): Promise<IStorageProvider> {
    const providerId = this.extractProviderIdFromPath(path);
    if (providerId) {
      const provider = this.registry.resolve(providerId);
      if (provider) {
        const health = this.registry.getHealth(providerId);
        if (health && (health.status === 'healthy' || health.status === 'degraded')) {
          return provider;
        }
      }
    }

    const providers = this.registry.enumerate();
    for (const providerReg of providers) {
      if (providerReg.status !== 'active') continue;
      try {
        const provider = providerReg.provider;
        if (await provider.exists(path)) {
          const health = this.registry.getHealth(providerReg.providerId);
          if (health && (health.status === 'healthy' || health.status === 'degraded')) {
            return provider;
          }
        }
      } catch {
        continue;
      }
    }

    throw new Error(`No provider found for path: ${path}`);
  }

  private extractProviderIdFromPath(path: string): string | null {
    const parts = path.split('/');
    if (parts.length >= 2) {
      return parts[0];
    }
    return null;
  }

  getProvider(providerId: string): IStorageProvider | undefined {
    return this.registry.resolve(providerId);
  }

  getAllProviders(): IStorageProvider[] {
    return this.registry.enumerate().map(r => r.provider);
  }

  getProvidersByType(type: string): IStorageProvider[] {
    return this.registry.resolveByType(type as StorageProviderType);
  }

  getProvidersByCapability(capability: string): IStorageProvider[] {
    return this.registry.resolveByCapability(capability as any);
  }

  registerProvider(provider: IStorageProvider): void {
    const registration = this.registry.enumerate().find(r => r.provider === provider);
    if (!registration) {
      throw new Error('Provider not registered in registry. Use ProviderRegistry.register() instead.');
    }
  }

  unregisterProvider(providerId: string): Promise<boolean> {
    return this.registry.unregister(providerId);
  }

  updateProviderHealth(providerId: string, health: StorageProviderHealth): void {
    this.registry.updateHealth(providerId, health);
  }

  getProviderHealth(providerId: string): StorageProviderHealth | undefined {
    return this.registry.getHealth(providerId);
  }

  getAllProviderHealth(): Map<string, StorageProviderHealth> {
    return this.registry.getAllHealth();
  }

  async evaluateHealth(providerId: string): Promise<StorageProviderHealth> {
    const provider = this.registry.resolve(providerId);
    if (!provider) {
      throw new Error(`Provider not found: ${providerId}`);
    }
    const health = await provider.verifyStorageHealth();
    this.registry.updateHealth(providerId, health);
    return health;
  }

  async evaluateAllHealth(): Promise<Map<string, StorageProviderHealth>> {
    const providers = this.registry.enumerate();
    const results = await Promise.all(
      providers.map(async reg => {
        try {
          const health = await reg.provider.verifyStorageHealth();
          this.registry.updateHealth(reg.providerId, health);
          return { providerId: reg.providerId, health };
        } catch (error) {
          const health: StorageProviderHealth = {
            providerId: reg.providerId,
            providerType: reg.providerType,
            status: 'offline',
            latencyMs: -1,
            availableCapacityBytes: 0,
            usedCapacityBytes: 0,
            lastChecked: new Date().toISOString(),
            errorRate: 1,
          };
          this.registry.updateHealth(reg.providerId, health);
          return { providerId: reg.providerId, health };
        }
      })
    );
    return new Map(results.map(r => [r.providerId, r.health]));
  }

  getMetrics(): RouterMetrics {
    return { ...this.metrics };
  }

  getConfig(): StorageConfiguration {
    return this.config;
  }

  getRoutingConfig(): RoutingConfiguration {
    return this.routingConfig;
  }

  reloadConfig(): void {
    this.config = configLoader.getConfigOrThrow();
    this.routingConfig = this.config.routing;
    this.policyEngine = new StoragePolicyEngine(this.config, this.registry);
    this.initializeStrategies();
  }

  async executeUpload(request: UploadRequest): Promise<StorageObjectMetadata> {
    const routing = await this.routeForUpload(request);
    
    // Validate that content is provided
    if (!request.content) {
      throw new Error('Upload content is required');
    }
    
    return routing.provider.upload(request.path, request.content, request.options);
  }

  async executeDownload(path: string): Promise<Buffer | ReadableStream> {
    const provider = await this.routeForDownload(path);
    return provider.download(path);
  }

  async executeDelete(path: string): Promise<boolean> {
    const provider = await this.routeForDownload(path);
    return provider.delete(path);
  }

  private recordSuccess(decision: StorageDecision, latencyMs: number): void {
    this.metrics.successfulRoutes++;
    this.updateAverageLatency(latencyMs);
    this.metrics.strategyUsage[decision.strategy] = (this.metrics.strategyUsage[decision.strategy] || 0) + 1;
    this.metrics.providerUsage[decision.providerId] = (this.metrics.providerUsage[decision.providerId] || 0) + 1;
  }

  private recordError(error: unknown, latencyMs: number): void {
    this.metrics.failedRoutes++;
    this.updateAverageLatency(latencyMs);
    const errorType = error instanceof Error ? error.constructor.name : 'UnknownError';
    this.metrics.errorsByType[errorType] = (this.metrics.errorsByType[errorType] || 0) + 1;
  }

  private updateAverageLatency(latencyMs: number): void {
    const total = this.metrics.successfulRoutes + this.metrics.failedRoutes;
    this.metrics.averageLatencyMs = ((this.metrics.averageLatencyMs * (total - 1)) + latencyMs) / total;
  }

  resetMetrics(): void {
    this.metrics = this.initializeMetrics();
  }

  getStrategyRegistry(): StrategyRegistry {
    return this.strategyRegistry;
  }

  getPolicyEngine(): StoragePolicyEngine {
    return this.policyEngine;
  }

  getRegistry(): ProviderRegistry {
    return this.registry;
  }
}

// Singleton removed to avoid eager initialization; instantiate StorageRouterV2 after config is loaded.