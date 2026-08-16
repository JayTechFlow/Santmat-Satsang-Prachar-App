// Sprint E2 — Complete Routing Strategy Framework
// All enterprise routing strategies with full implementation

import type {
  StorageTier,
  StorageStrategyType,
  StorageProviderType,
  StorageProviderHealth,
  ProviderCapabilities,
} from '../Models/StorageModels';
import type { IStorageProvider } from '../Interfaces/IStorageProvider';
import type { UploadRequest } from './StoragePolicyEngine';
import { ProviderRegistry, type ProviderRegistration } from '../Factory/ProviderRegistry';

export interface RoutingContext {
  request: UploadRequest;
  providers: ProviderRegistration[];
  health: Map<string, StorageProviderHealth>;
  capabilities: Map<string, ProviderCapabilities>;
  config: any;
}

export interface IStorageRoutingStrategy {
  readonly strategyType: StorageStrategyType;
  readonly name: string;
  readonly description: string;
  readonly priority: number;

  selectProvider(context: RoutingContext): Promise<StrategyResult>;
  canHandle(context: RoutingContext): boolean;
}

export interface StrategyResult {
  providerId: string;
  providerType: StorageProviderType;
  confidence: number;
  reasoning: string;
  fallbackProviders: string[];
  metadata?: Record<string, any>;
}

export interface StrategyChain {
  strategies: IStorageRoutingStrategy[];
  mode: 'first_match' | 'weighted' | 'fallback' | 'composite';
}

export abstract class BaseRoutingStrategy implements IStorageRoutingStrategy {
  abstract readonly strategyType: StorageStrategyType;
  abstract readonly name: string;
  abstract readonly description: string;
  readonly priority: number = 0;

  canHandle(context: RoutingContext): boolean {
    return true;
  }

  abstract selectProvider(context: RoutingContext): Promise<StrategyResult>;

  protected getActiveProviders(context: RoutingContext): ProviderRegistration[] {
    return context.providers.filter(p => p.status === 'active');
  }

  protected getHealthyProviders(context: RoutingContext, threshold: 'healthy' | 'degraded' | 'critical' = 'degraded'): ProviderRegistration[] {
    const validStatuses = this.getValidHealthStatuses(threshold);
    return context.providers.filter(p => {
      if (p.status !== 'active') return false;
      const health = context.health.get(p.providerId);
      return health && validStatuses.includes(health.status);
    });
  }

  protected getValidHealthStatuses(threshold: string): string[] {
    const statusOrder = ['healthy', 'degraded', 'critical', 'offline'];
    const thresholdIndex = statusOrder.indexOf(threshold);
    return statusOrder.slice(0, thresholdIndex + 1);
  }

  protected checkCapabilities(providerId: string, requiredCapabilities: string[], capabilities: Map<string, ProviderCapabilities>): boolean {
    if (!requiredCapabilities || requiredCapabilities.length === 0) return true;
    const caps = capabilities.get(providerId);
    if (!caps) return false;
    return requiredCapabilities.every(cap => caps[cap as keyof ProviderCapabilities] === true);
  }

  protected buildResult(
    providerId: string,
    providerType: StorageProviderType,
    confidence: number,
    reasoning: string,
    fallbackProviders: string[],
    metadata?: Record<string, any>
  ): StrategyResult {
    return { providerId, providerType, confidence, reasoning, fallbackProviders, metadata };
  }
}

// ============================================================================
// CONTENT TYPE ROUTING
// ============================================================================

export class ContentTypeRoutingStrategy extends BaseRoutingStrategy {
  readonly strategyType: StorageStrategyType = 'content_type_routing';
  readonly name = 'Content Type Routing';
  readonly description = 'Routes based on MIME type with provider affinity rules';
  readonly priority = 100;

  constructor(private rules: RoutingRule[] = []) {
    super();
  }

  setRules(rules: RoutingRule[]): void {
    this.rules = rules;
  }

  canHandle(context: RoutingContext): boolean {
    return this.rules.length > 0;
  }

  async selectProvider(context: RoutingContext): Promise<StrategyResult> {
    const { request } = context;

    for (const rule of this.rules) {
      if (request.mimeType.startsWith(rule.mimeTypePrefix)) {
        for (const providerId of rule.providerIds) {
          const provider = context.providers.find(p => p.providerId === providerId);
          if (provider && provider.status === 'active') {
            const health = context.health.get(providerId);
            if (health && (health.status === 'healthy' || health.status === 'degraded')) {
              if (this.checkCapabilities(providerId, rule.requireCapabilities, context.capabilities)) {
                return this.buildResult(
                  providerId,
                  provider.providerType as StorageProviderType,
                  0.9,
                  `Matched content type rule: ${rule.mimeTypePrefix} -> ${providerId}`,
                  rule.providerIds.filter(id => id !== providerId),
                  { matchedRule: rule.mimeTypePrefix, tier: rule.tier }
                );
              }
            }
          }
        }
      }
    }

    const activeProviders = this.getActiveProviders(context);
    if (activeProviders.length > 0) {
      const provider = activeProviders[0];
      return this.buildResult(
        provider.providerId,
        provider.providerType as StorageProviderType,
        0.3,
        'No content type rule matched, using first active provider',
        activeProviders.slice(1).map(p => p.providerId)
      );
    }

    throw new Error('No active providers available for content type routing');
  }
}

export interface RoutingRule {
  mimeTypePrefix: string;
  providerIds: string[];
  tier?: StorageTier;
  requireCapabilities?: string[];
}

// ============================================================================
// HEALTH BASED ROUTING
// ============================================================================

export class HealthBasedRoutingStrategy extends BaseRoutingStrategy {
  readonly strategyType: StorageStrategyType = 'health_based_routing';
  readonly name = 'Health Based Routing';
  readonly description = 'Selects providers based on health status threshold';
  readonly priority = 80;

  constructor(private healthThreshold: 'healthy' | 'degraded' | 'critical' = 'degraded', private excludeOffline = true) {
    super();
  }

  setHealthThreshold(threshold: 'healthy' | 'degraded' | 'critical'): void {
    this.healthThreshold = threshold;
  }

  canHandle(context: RoutingContext): boolean {
    return context.providers.some(p => p.status === 'active');
  }

  async selectProvider(context: RoutingContext): Promise<StrategyResult> {
    const healthyProviders = this.getHealthyProviders(context, this.healthThreshold);

    if (healthyProviders.length === 0) {
      if (this.excludeOffline) {
        throw new Error(`No healthy providers above threshold: ${this.healthThreshold}`);
      }
      const activeProviders = this.getActiveProviders(context);
      if (activeProviders.length > 0) {
        const provider = activeProviders[0];
        return this.buildResult(
          provider.providerId,
          provider.providerType as StorageProviderType,
          0.2,
          `No providers above health threshold ${this.healthThreshold}, using first active`,
          activeProviders.slice(1).map(p => p.providerId)
        );
      }
      throw new Error('No active providers available');
    }

    const provider = healthyProviders[0];
    return this.buildResult(
      provider.providerId,
      provider.providerType as StorageProviderType,
      0.85,
      `Health-based selection: ${provider.providerId} (status: ${context.health.get(provider.providerId)?.status})`,
      healthyProviders.slice(1).map(p => p.providerId)
    );
  }
}

// ============================================================================
// CAPABILITY ROUTING
// ============================================================================

export class CapabilityRoutingStrategy extends BaseRoutingStrategy {
  readonly strategyType: StorageStrategyType = 'capability_routing';
  readonly name = 'Capability Routing';
  readonly description = 'Routes to providers supporting required capabilities';
  readonly priority = 90;

  constructor(private capabilityPriorities: Record<string, string[]> = {}) {
    super();
  }

  setCapabilityPriorities(priorities: Record<string, string[]>): void {
    this.capabilityPriorities = priorities;
  }

  canHandle(context: RoutingContext): boolean {
    return Object.keys(this.capabilityPriorities).length > 0;
  }

  async selectProvider(context: RoutingContext): Promise<StrategyResult> {
    for (const [capability, providerIds] of Object.entries(this.capabilityPriorities)) {
      for (const providerId of providerIds) {
        const provider = context.providers.find(p => p.providerId === providerId);
        if (provider && provider.status === 'active') {
          const caps = context.capabilities.get(providerId);
          if (caps && caps[capability as keyof ProviderCapabilities] === true) {
            const health = context.health.get(providerId);
            if (health && (health.status === 'healthy' || health.status === 'degraded')) {
              return this.buildResult(
                providerId,
                provider.providerType as StorageProviderType,
                0.85,
                `Selected provider with capability: ${capability}`,
                providerIds.filter(id => id !== providerId),
                { matchedCapability: capability }
              );
            }
          }
        }
      }
    }

    const activeProviders = this.getActiveProviders(context);
    if (activeProviders.length > 0) {
      const provider = activeProviders[0];
      return this.buildResult(
        provider.providerId,
        provider.providerType as StorageProviderType,
        0.3,
        'No capability match, using first active provider',
        activeProviders.slice(1).map(p => p.providerId)
      );
    }

    throw new Error('No active providers available for capability routing');
  }
}

// ============================================================================
// TIER BASED ROUTING
// ============================================================================

export class TierBasedRoutingStrategy extends BaseRoutingStrategy {
  readonly strategyType: StorageStrategyType = 'tier_based_routing';
  readonly name = 'Tier Based Routing';
  readonly description = 'Routes based on storage tier with provider mapping';
  readonly priority = 70;

  constructor(private tierMapping: Record<StorageTier, string[]> = { hot: [], warm: [], cold: [], archive: [] }) {
    super();
  }

  setTierMapping(mapping: Record<StorageTier, string[]>): void {
    this.tierMapping = mapping;
  }

  canHandle(context: RoutingContext): boolean {
    return Object.values(this.tierMapping).some(arr => arr.length > 0);
  }

  async selectProvider(context: RoutingContext): Promise<StrategyResult> {
    const { request } = context;
    const tier = request.options?.tier || 'hot';
    const providersForTier = this.tierMapping[tier] || [];

    for (const providerId of providersForTier) {
      const provider = context.providers.find(p => p.providerId === providerId);
      if (provider && provider.status === 'active') {
        const health = context.health.get(providerId);
        if (health && (health.status === 'healthy' || health.status === 'degraded')) {
          return this.buildResult(
            providerId,
            provider.providerType as StorageProviderType,
            0.8,
            `Tier-based routing: ${tier} -> ${providerId}`,
            providersForTier.filter(id => id !== providerId),
            { tier }
          );
        }
      }
    }

    const activeProviders = this.getActiveProviders(context);
    if (activeProviders.length > 0) {
      const provider = activeProviders[0];
      return this.buildResult(
        provider.providerId,
        provider.providerType as StorageProviderType,
        0.3,
        `No providers for tier ${tier}, using first active`,
        activeProviders.slice(1).map(p => p.providerId)
      );
    }

    throw new Error('No active providers available for tier-based routing');
  }
}

// ============================================================================
// PRIORITY ROUTING
// ============================================================================

export class PriorityRoutingStrategy extends BaseRoutingStrategy {
  readonly strategyType: StorageStrategyType = 'priority_routing';
  readonly name = 'Priority Routing';
  readonly description = 'Routes to highest priority available provider';
  readonly priority = 95;

  constructor(private providerPriorities: Record<string, number> = {}) {
    super();
  }

  setProviderPriorities(priorities: Record<string, number>): void {
    this.providerPriorities = priorities;
  }

  canHandle(context: RoutingContext): boolean {
    return Object.keys(this.providerPriorities).length > 0;
  }

  async selectProvider(context: RoutingContext): Promise<StrategyResult> {
    const activeProviders = this.getActiveProviders(context);
    if (activeProviders.length === 0) {
      throw new Error('No active providers available for priority routing');
    }

    const scoredProviders = activeProviders
      .map(p => ({
        provider: p,
        priority: this.providerPriorities[p.providerId] ?? 999,
      }))
      .sort((a, b) => a.priority - b.priority);

    const best = scoredProviders[0];
    return this.buildResult(
      best.provider.providerId,
      best.provider.providerType as StorageProviderType,
      0.9,
      `Priority routing: ${best.provider.providerId} (priority: ${best.priority})`,
      scoredProviders.slice(1).map(p => p.provider.providerId),
      { priority: best.priority }
    );
  }
}

// ============================================================================
// PRIMARY SECONDARY ROUTING
// ============================================================================

export class PrimarySecondaryRoutingStrategy extends BaseRoutingStrategy {
  readonly strategyType: StorageStrategyType = 'primary_secondary';
  readonly name = 'Primary Secondary Routing';
  readonly description = 'Primary provider with async replication to secondaries';
  readonly priority = 95;

  constructor(
    private primaryProviderId: string,
    private secondaryProviderIds: string[] = [],
    private asyncReplication = true
  ) {
    super();
  }

  setPrimaryProvider(providerId: string): void {
    this.primaryProviderId = providerId;
  }

  setSecondaryProviders(providerIds: string[]): void {
    this.secondaryProviderIds = providerIds;
  }

  canHandle(context: RoutingContext): boolean {
    return true;
  }

  async selectProvider(context: RoutingContext): Promise<StrategyResult> {
    const primary = context.providers.find(p => p.providerId === this.primaryProviderId);
    if (primary && primary.status === 'active') {
      const health = context.health.get(this.primaryProviderId);
      if (health && (health.status === 'healthy' || health.status === 'degraded')) {
        return this.buildResult(
          this.primaryProviderId,
          primary.providerType as StorageProviderType,
          0.95,
          `Primary-secondary: primary healthy (${this.primaryProviderId})`,
          this.secondaryProviderIds,
          { primary: this.primaryProviderId, secondaries: this.secondaryProviderIds, asyncReplication: this.asyncReplication }
        );
      }
    }

    for (const secondaryId of this.secondaryProviderIds) {
      const secondary = context.providers.find(p => p.providerId === secondaryId);
      if (secondary && secondary.status === 'active') {
        const health = context.health.get(secondaryId);
        if (health && (health.status === 'healthy' || health.status === 'degraded')) {
          return this.buildResult(
            secondaryId,
            secondary.providerType as StorageProviderType,
            0.7,
            `Primary unavailable, failing over to secondary: ${secondaryId}`,
            this.secondaryProviderIds.filter(id => id !== secondaryId),
            { failedOver: true, originalPrimary: this.primaryProviderId }
          );
        }
      }
    }

    const activeProviders = this.getActiveProviders(context);
    if (activeProviders.length > 0) {
      const provider = activeProviders[0];
      return this.buildResult(
        provider.providerId,
        provider.providerType as StorageProviderType,
        0.3,
        'Primary and secondaries unavailable, using first active',
        activeProviders.slice(1).map(p => p.providerId)
      );
    }

    throw new Error('No active providers available for primary-secondary routing');
  }
}

// ============================================================================
// FAILOVER ROUTING
// ============================================================================

export class FailoverRoutingStrategy extends BaseRoutingStrategy {
  readonly strategyType: StorageStrategyType = 'failover_routing';
  readonly name = 'Failover Routing';
  readonly description = 'Primary with automatic failover to secondaries on health degradation';
  readonly priority = 85;

  constructor(
    private primaryProviderId: string,
    private secondaryProviderIds: string[] = [],
    private healthCheckIntervalSeconds = 30,
    private failbackEnabled = true,
    private failbackDelaySeconds = 300
  ) {
    super();
    this.lastFailoverTime = 0;
    this.currentPrimary = primaryProviderId;
  }

  private lastFailoverTime: number;
  private currentPrimary: string;

  setPrimaryProvider(providerId: string): void {
    this.primaryProviderId = providerId;
    this.currentPrimary = providerId;
  }

  canHandle(context: RoutingContext): boolean {
    return true;
  }

  async selectProvider(context: RoutingContext): Promise<StrategyResult> {
    const primary = context.providers.find(p => p.providerId === this.currentPrimary);
    if (primary && primary.status === 'active') {
      const health = context.health.get(this.currentPrimary);
      if (health && (health.status === 'healthy' || health.status === 'degraded')) {
        return this.buildResult(
          this.currentPrimary,
          primary.providerType as StorageProviderType,
          0.95,
          `Failover routing: current primary healthy (${this.currentPrimary})`,
          this.secondaryProviderIds,
          { isPrimary: true }
        );
      }
    }

    for (const secondaryId of this.secondaryProviderIds) {
      const secondary = context.providers.find(p => p.providerId === secondaryId);
      if (secondary && secondary.status === 'active') {
        const health = context.health.get(secondaryId);
        if (health && (health.status === 'healthy' || health.status === 'degraded')) {
          const wasFailover = this.currentPrimary !== secondaryId;
          if (wasFailover) {
            this.lastFailoverTime = Date.now();
          }
          this.currentPrimary = secondaryId;

          return this.buildResult(
            secondaryId,
            secondary.providerType as StorageProviderType,
            wasFailover ? 0.6 : 0.85,
            wasFailover ? `Failover: primary unavailable, using ${secondaryId}` : `Failover routing: ${secondaryId}`,
            this.secondaryProviderIds.filter(id => id !== secondaryId),
            { isPrimary: false, failedOver: wasFailover }
          );
        }
      }
    }

    const activeProviders = this.getActiveProviders(context);
    if (activeProviders.length > 0) {
      const provider = activeProviders[0];
      this.currentPrimary = provider.providerId;
      return this.buildResult(
        provider.providerId,
        provider.providerType as StorageProviderType,
        0.3,
        'All configured providers unavailable, using first active',
        activeProviders.slice(1).map(p => p.providerId)
      );
    }

    throw new Error('No active providers available for failover routing');
  }

  async checkFailback(context: RoutingContext): Promise<boolean> {
    if (!this.failbackEnabled || this.currentPrimary === this.primaryProviderId) {
      return false;
    }

    const primary = context.providers.find(p => p.providerId === this.primaryProviderId);
    if (!primary || primary.status !== 'active') {
      return false;
    }

    const health = context.health.get(this.primaryProviderId);
    if (!health || (health.status !== 'healthy' && health.status !== 'degraded')) {
      return false;
    }

    const timeSinceFailover = Date.now() - this.lastFailoverTime;
    if (timeSinceFailover < this.failbackDelaySeconds * 1000) {
      return false;
    }

    this.currentPrimary = this.primaryProviderId;
    return true;
  }
}

// ============================================================================
// ROUND ROBIN ROUTING
// ============================================================================

export class RoundRobinRoutingStrategy extends BaseRoutingStrategy {
  readonly strategyType: StorageStrategyType = 'round_robin';
  readonly name = 'Round Robin Routing';
  readonly description = 'Distributes requests evenly across providers';
  readonly priority = 50;

  private currentIndex = 0;

  constructor(private providerIds: string[] = []) {
    super();
  }

  setProviders(providerIds: string[]): void {
    this.providerIds = providerIds;
    this.currentIndex = 0;
  }

  canHandle(context: RoutingContext): boolean {
    return this.providerIds.length > 0;
  }

  async selectProvider(context: RoutingContext): Promise<StrategyResult> {
    const availableProviders = this.providerIds
      .map(id => context.providers.find(p => p.providerId === id))
      .filter((p): p is ProviderRegistration => p !== undefined && p.status === 'active');

    if (availableProviders.length === 0) {
      const activeProviders = this.getActiveProviders(context);
      if (activeProviders.length > 0) {
        const provider = activeProviders[0];
        return this.buildResult(
          provider.providerId,
          provider.providerType as StorageProviderType,
          0.3,
          'No configured providers available, using first active',
          activeProviders.slice(1).map(p => p.providerId)
        );
      }
      throw new Error('No active providers available for round robin routing');
    }

    const provider = availableProviders[this.currentIndex % availableProviders.length];
    this.currentIndex++;

    return this.buildResult(
      provider.providerId,
      provider.providerType as StorageProviderType,
      0.7,
      `Round robin: ${provider.providerId} (index ${this.currentIndex - 1})`,
      availableProviders.filter(p => p.providerId !== provider.providerId).map(p => p.providerId),
      { roundRobinIndex: this.currentIndex - 1 }
    );
  }
}

// ============================================================================
// WEIGHTED ROUTING
// ============================================================================

export class WeightedRoutingStrategy extends BaseRoutingStrategy {
  readonly strategyType: StorageStrategyType = 'weighted_routing';
  readonly name = 'Weighted Routing';
  readonly description = 'Distributes requests based on provider weights';
  readonly priority = 40;

  private requestCounts = new Map<string, number>();

  constructor(private providerWeights: Record<string, number> = {}) {
    super();
  }

  setProviderWeights(weights: Record<string, number>): void {
    this.providerWeights = weights;
    this.requestCounts.clear();
  }

  canHandle(context: RoutingContext): boolean {
    return Object.keys(this.providerWeights).length > 0;
  }

  async selectProvider(context: RoutingContext): Promise<StrategyResult> {
    const activeProviders = this.getActiveProviders(context)
      .filter(p => this.providerWeights[p.providerId] !== undefined);

    if (activeProviders.length === 0) {
      throw new Error('No weighted providers available');
    }

    // Calculate effective weights based on current distribution
    const totalRequests = Array.from(this.requestCounts.values()).reduce((a, b) => a + b, 0) || 1;
    const targetRatios: Record<string, number> = {};
    const totalWeight = Object.values(this.providerWeights).reduce((a, b) => a + b, 0);

    for (const [id, weight] of Object.entries(this.providerWeights)) {
      targetRatios[id] = weight / totalWeight;
    }

    // Find provider most under its target ratio
    let bestProvider = activeProviders[0];
    let bestScore = -Infinity;

    for (const provider of activeProviders) {
      const currentCount = this.requestCounts.get(provider.providerId) || 0;
      const currentRatio = currentCount / totalRequests;
      const targetRatio = targetRatios[provider.providerId] || 0;
      const score = targetRatio - currentRatio;

      if (score > bestScore) {
        bestScore = score;
        bestProvider = provider;
      }
    }

    this.requestCounts.set(bestProvider.providerId, (this.requestCounts.get(bestProvider.providerId) || 0) + 1);

    return this.buildResult(
      bestProvider.providerId,
      bestProvider.providerType as StorageProviderType,
      0.75,
      `Weighted routing: ${bestProvider.providerId} (weight: ${this.providerWeights[bestProvider.providerId]})`,
      activeProviders.filter(p => p.providerId !== bestProvider.providerId).map(p => p.providerId),
      { weight: this.providerWeights[bestProvider.providerId], requestCount: this.requestCounts.get(bestProvider.providerId) }
    );
  }
}

// ============================================================================
// COST AWARE ROUTING
// ============================================================================

export class CostAwareRoutingStrategy extends BaseRoutingStrategy {
  readonly strategyType: StorageStrategyType = 'cost_optimized';
  readonly name = 'Cost Aware Routing';
  readonly description = 'Selects provider based on cost optimization';
  readonly priority = 10;

  constructor(
    private maxCostPerGB: number = 0.03,
    private preferCheapest = true,
    private providerCosts: Record<string, number> = {}
  ) {
    super();
  }

  setProviderCosts(costs: Record<string, number>): void {
    this.providerCosts = costs;
  }

  canHandle(context: RoutingContext): boolean {
    return Object.keys(this.providerCosts).length > 0;
  }

  async selectProvider(context: RoutingContext): Promise<StrategyResult> {
    const activeProviders = this.getActiveProviders(context);
    if (activeProviders.length === 0) {
      throw new Error('No active providers available for cost-aware routing');
    }

    const scoredProviders = activeProviders
      .map(provider => {
        const cost = this.providerCosts[provider.providerId] || this.getDefaultCost(provider.providerType);
        const health = context.health.get(provider.providerId);
        const healthScore = health ? this.getHealthScore(health.status) : 0.5;
        return { provider, cost, healthScore };
      })
      .filter(p => p.cost <= this.maxCostPerGB)
      .sort((a, b) => {
        if (this.preferCheapest) {
          return a.cost - b.cost || b.healthScore - a.healthScore;
        }
        return b.healthScore - a.healthScore || a.cost - b.cost;
      });

    if (scoredProviders.length === 0) {
      const provider = activeProviders[0];
      return this.buildResult(
        provider.providerId,
        provider.providerType as StorageProviderType,
        0.2,
        'No providers within cost budget, using first active',
        activeProviders.slice(1).map(p => p.providerId)
      );
    }

    const selected = scoredProviders[0];
    return this.buildResult(
      selected.provider.providerId,
      selected.provider.providerType as StorageProviderType,
      0.8,
      `Cost-aware: ${selected.provider.providerId} ($${selected.cost.toFixed(4)}/GB)`,
      scoredProviders.slice(1).map(p => p.provider.providerId),
      { costPerGB: selected.cost, healthScore: selected.healthScore }
    );
  }

  private getDefaultCost(providerType: string): number {
    const defaults: Record<string, number> = {
      FIREBASE_STORAGE: 0.026,
      AWS_S3: 0.023,
      AZURE_BLOB: 0.0184,
      GOOGLE_CLOUD_STORAGE: 0.026,
      CLOUDFLARE_R2: 0.015,
      LOCAL: 0,
    };
    return defaults[providerType] || 0.023;
  }

  private getHealthScore(status: string): number {
    const scores: Record<string, number> = { healthy: 1.0, degraded: 0.7, critical: 0.3, offline: 0 };
    return scores[status] || 0.5;
  }
}

// ============================================================================
// GEO ROUTING
// ============================================================================

export class GeoRoutingStrategy extends BaseRoutingStrategy {
  readonly strategyType: StorageStrategyType = 'region_aware';
  readonly name = 'Geo Routing';
  readonly description = 'Routes based on geographic proximity';
  readonly priority = 60;

  constructor(
    private regionMapping: Record<string, string[]> = {},
    private defaultRegion = 'us-central1'
  ) {
    super();
  }

  setRegionMapping(mapping: Record<string, string[]>): void {
    this.regionMapping = mapping;
  }

  canHandle(context: RoutingContext): boolean {
    return Object.keys(this.regionMapping).length > 0;
  }

  async selectProvider(context: RoutingContext): Promise<StrategyResult> {
    const { request } = context;
    const region = request.options?.region || this.defaultRegion;
    const providersForRegion = this.regionMapping[region] || [];

    for (const providerId of providersForRegion) {
      const provider = context.providers.find(p => p.providerId === providerId);
      if (provider && provider.status === 'active') {
        const health = context.health.get(providerId);
        if (health && (health.status === 'healthy' || health.status === 'degraded')) {
          return this.buildResult(
            providerId,
            provider.providerType as StorageProviderType,
            0.8,
            `Geo routing: ${region} -> ${providerId}`,
            providersForRegion.filter(id => id !== providerId),
            { region }
          );
        }
      }
    }

    const activeProviders = this.getActiveProviders(context);
    if (activeProviders.length > 0) {
      const provider = activeProviders[0];
      return this.buildResult(
        provider.providerId,
        provider.providerType as StorageProviderType,
        0.3,
        `No providers for region ${region}, using first active`,
        activeProviders.slice(1).map(p => p.providerId)
      );
    }

    throw new Error('No active providers available for geo routing');
  }
}

// ============================================================================
// COMPOSITE ROUTING
// ============================================================================

export class CompositeRoutingStrategy extends BaseRoutingStrategy {
  readonly strategyType: StorageStrategyType = 'composite_routing';
  readonly name = 'Composite Routing';
  readonly description = 'Combines multiple strategies with weights';
  readonly priority = 5;

  constructor(private strategies: WeightedStrategy[] = []) {
    super();
  }

  addStrategy(strategy: IStorageRoutingStrategy, weight: number): void {
    this.strategies.push({ strategy, weight });
  }

  canHandle(context: RoutingContext): boolean {
    return this.strategies.length > 0;
  }

  async selectProvider(context: RoutingContext): Promise<StrategyResult> {
    const results = await Promise.all(
      this.strategies.map(async ({ strategy, weight }) => {
        if (!strategy.canHandle(context)) return null;
        try {
          const result = await strategy.selectProvider(context);
          return { ...result, weight, strategyName: strategy.name };
        } catch {
          return null;
        }
      })
    );

    const validResults = results.filter((r): r is StrategyResult & { weight: number; strategyName: string } => r !== null);
    if (validResults.length === 0) {
      throw new Error('No strategy produced a valid result');
    }

    const totalWeight = validResults.reduce((sum, r) => sum + r.weight, 0);
    const weightedResults = validResults.map(r => ({
      ...r,
      weightedConfidence: r.confidence * (r.weight / totalWeight),
    }));

    weightedResults.sort((a, b) => b.weightedConfidence - a.weightedConfidence);
    const best = weightedResults[0];

    return this.buildResult(
      best.providerId,
      best.providerType,
      best.weightedConfidence,
      `Composite: ${best.strategyName} (weight: ${best.weight}) -> ${best.providerId}`,
      best.fallbackProviders,
      { composite: true, strategies: weightedResults.map(r => ({ name: r.strategyName, weight: r.weight, confidence: r.confidence })) }
    );
  }
}

export interface WeightedStrategy {
  strategy: IStorageRoutingStrategy;
  weight: number;
}

// ============================================================================
// CHAIN OF RESPONSIBILITY
// ============================================================================

export class ChainOfResponsibilityStrategy extends BaseRoutingStrategy {
  readonly strategyType: StorageStrategyType = 'chain_routing';
  readonly name = 'Chain of Responsibility Routing';
  readonly description = 'Tries strategies in order until one succeeds';
  readonly priority = 5;

  constructor(private strategies: IStorageRoutingStrategy[] = []) {
    super();
  }

  addStrategy(strategy: IStorageRoutingStrategy): void {
    this.strategies.push(strategy);
  }

  canHandle(context: RoutingContext): boolean {
    return this.strategies.length > 0;
  }

  async selectProvider(context: RoutingContext): Promise<StrategyResult> {
    for (const strategy of this.strategies) {
      if (!strategy.canHandle(context)) continue;
      try {
        const result = await strategy.selectProvider(context);
        return this.buildResult(
          result.providerId,
          result.providerType,
          result.confidence,
          `Chain: ${strategy.name} -> ${result.providerId}`,
          result.fallbackProviders,
          { chainStrategy: strategy.name, originalConfidence: result.confidence }
        );
      } catch {
        continue;
      }
    }

    throw new Error('All strategies in chain failed to select a provider');
  }
}

// ============================================================================
// STRATEGY REGISTRY
// ============================================================================

export class StrategyRegistry {
  private strategies = new Map<StorageStrategyType, IStorageRoutingStrategy>();
  private defaultStrategy: StorageStrategyType = 'single_provider';

  register(strategy: IStorageRoutingStrategy): void {
    this.strategies.set(strategy.strategyType, strategy);
  }

  unregister(strategyType: StorageStrategyType): boolean {
    return this.strategies.delete(strategyType);
  }

  get(strategyType: StorageStrategyType): IStorageRoutingStrategy | undefined {
    return this.strategies.get(strategyType);
  }

  getAll(): IStorageRoutingStrategy[] {
    return Array.from(this.strategies.values());
  }

  setDefault(strategyType: StorageStrategyType): void {
    this.defaultStrategy = strategyType;
  }

  getDefault(): StorageStrategyType {
    return this.defaultStrategy;
  }

  getDefaultStrategy(): IStorageRoutingStrategy | undefined {
    return this.strategies.get(this.defaultStrategy);
  }
}

export const strategyRegistry = new StrategyRegistry();