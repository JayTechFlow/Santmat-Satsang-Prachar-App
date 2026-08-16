// Sprint E2.2 — Storage Policy Engine
// Policy evaluation pipeline with priority engine, capability filtering, and decision production

import type {
  StorageTier,
  StorageStrategyType,
  StorageProviderType,
  StorageObjectMetadata,
  StorageOptions,
  StorageProviderHealth,
  ProviderCapabilities,
} from '../Models/StorageModels';
import type { IStorageProvider } from '../Interfaces/IStorageProvider';
import { ProviderRegistry, type ProviderRegistration, type ProviderCapabilities as RegistryProviderCapabilities } from '../Factory/ProviderRegistry';
import { configLoader, type StorageConfiguration, type RoutingConfiguration, type StrategyConfig, type FeatureFlags } from '../Config/StorageConfigLoader';

export interface UploadRequest {
  path: string;
  mimeType: string;
  sizeBytes: number;
  options?: StorageOptions;
  userId?: string;
  organizationId?: string;
  metadata?: Record<string, string>;
}

export interface StorageDecision {
  providerId: string;
  providerType: StorageProviderType;
  strategy: StorageStrategyType;
  tier: StorageTier;
  region?: string;
  executionPlan: ExecutionPlan;
  policiesApplied: AppliedPolicy[];
  fallbackProviders: string[];
  confidence: number;
  reasoning: string;
}

export interface ExecutionPlan {
  primaryProvider: string;
  operations: ExecutionOperation[];
  replicationTargets: ReplicationTarget[];
  lifecycleActions: LifecycleAction[];
  securityChecks: SecurityCheck[];
  estimatedCost?: number;
  estimatedLatencyMs?: number;
}

export interface ExecutionOperation {
  type: 'upload' | 'download' | 'delete' | 'copy' | 'move' | 'multipart' | 'resumable';
  providerId: string;
  path: string;
  options?: Record<string, any>;
  condition?: string;
}

export interface ReplicationTarget {
  providerId: string;
  providerType: StorageProviderType;
  priority: number;
  async: boolean;
  delayMs?: number;
}

export interface LifecycleAction {
  type: 'tier_transition' | 'expiration' | 'legal_hold' | 'retention' | 'multipart_abort';
  providerId: string;
  path: string;
  params: Record<string, any>;
  schedule?: string;
}

export interface SecurityCheck {
  type: 'checksum' | 'virus_scan' | 'content_validation' | 'executable_block' | 'path_constraint' | 'overwrite_protection';
  providerId: string;
  path: string;
  params: Record<string, any>;
  required: boolean;
}

export interface AppliedPolicy {
  name: string;
  type: 'routing' | 'security' | 'lifecycle' | 'replication' | 'cost' | 'compliance' | 'health' | 'failover';
  providerId?: string;
  action: 'allow' | 'deny' | 'modify' | 'select' | 'fallback';
  reason: string;
  priority: number;
}

export interface PolicyContext {
  request: UploadRequest;
  providers: ProviderRegistration[];
  config: StorageConfiguration;
  health: Map<string, StorageProviderHealth>;
  capabilities: Map<string, ProviderCapabilities>;
  timestamp: string;
}

export interface PolicyEvaluationResult {
  allowed: boolean;
  decision?: StorageDecision;
  policiesApplied: AppliedPolicy[];
  errors: PolicyError[];
  warnings: PolicyWarning[];
}

export interface PolicyError {
  policy: string;
  message: string;
  code: string;
}

export interface PolicyWarning {
  policy: string;
  message: string;
  code: string;
}

export type PolicyEvaluator = (context: PolicyContext) => Promise<Partial<StorageDecision> | null>;

export class StoragePolicyEngine {
  private config: StorageConfiguration;
  private registry: ProviderRegistry;
  private evaluators: Map<string, PolicyEvaluator> = new Map();
  private evaluatorOrder: string[] = [];

  constructor(config: StorageConfiguration, registry: ProviderRegistry) {
    this.config = config;
    this.registry = registry;
    this.registerBuiltinEvaluators();
  }

  private registerBuiltinEvaluators(): void {
    this.registerEvaluator('security', this.evaluateSecurityPolicy.bind(this), 110);
    this.registerEvaluator('routing', this.evaluateRoutingPolicy.bind(this), 100);
    this.registerEvaluator('capability', this.evaluateCapabilityPolicy.bind(this), 90);
    this.registerEvaluator('health', this.evaluateHealthPolicy.bind(this), 80);
    this.registerEvaluator('tier', this.evaluateTierPolicy.bind(this), 70);
    this.registerEvaluator('region', this.evaluateRegionPolicy.bind(this), 60);
    this.registerEvaluator('encryption', this.evaluateEncryptionPolicy.bind(this), 40);
    this.registerEvaluator('replication', this.evaluateReplicationPolicy.bind(this), 30);
    this.registerEvaluator('lifecycle', this.evaluateLifecyclePolicy.bind(this), 20);
    this.registerEvaluator('cost', this.evaluateCostPolicy.bind(this), 10);
    this.registerEvaluator('compliance', this.evaluateCompliancePolicy.bind(this), 5);
    this.registerEvaluator('failover', this.evaluateFailoverPolicy.bind(this), 1);
  }

  registerEvaluator(name: string, evaluator: PolicyEvaluator, priority: number): void {
    this.evaluators.set(name, evaluator);
    this.evaluatorOrder = Array.from(this.evaluators.entries())
      .sort((a, b) => b[1].priority - a[1].priority)
      .map(([name]) => name);
  }

  unregisterEvaluator(name: string): boolean {
    const result = this.evaluators.delete(name);
    if (result) {
      this.evaluatorOrder = this.evaluatorOrder.filter(n => n !== name);
    }
    return result;
  }

  async evaluate(request: UploadRequest): Promise<PolicyEvaluationResult> {
    const startTime = Date.now();
    const policiesApplied: AppliedPolicy[] = [];
    const errors: PolicyError[] = [];
    const warnings: PolicyWarning[] = [];

    try {
      const context = await this.buildContext(request);

      let decision: Partial<StorageDecision> = {};
      let allowed = true;
      let denied = false;

      for (const evaluatorName of this.evaluatorOrder) {
        if (denied) break;
        const evaluator = this.evaluators.get(evaluatorName);
        if (!evaluator) continue;

        try {
          const result = await evaluator(context);
          if (result) {
            // If security explicitly denies (providerId === ''), stop evaluation
            if (result.providerId === '') {
              denied = true;
              allowed = false;
              errors.push({
                policy: evaluatorName,
                message: result.reasoning || 'Request denied by security policy',
                code: 'SECURITY_DENIED',
              });
              break;
            }
            decision = { ...decision, ...result };
            policiesApplied.push({
              name: evaluatorName,
              type: this.getPolicyType(evaluatorName),
              action: 'modify',
              reason: `Applied ${evaluatorName} policy`,
              priority: this.getEvaluatorPriority(evaluatorName),
            });
          }
        } catch (error) {
          errors.push({
            policy: evaluatorName,
            message: error instanceof Error ? error.message : String(error),
            code: 'EVALUATION_ERROR',
          });
        }
      }

      if (!denied && !decision.providerId) {
        allowed = false;
        errors.push({
          policy: 'routing',
          message: 'No provider selected after policy evaluation',
          code: 'NO_PROVIDER_SELECTED',
        });
      }

      if (!allowed) {
        return {
          allowed: false,
          policiesApplied,
          errors,
          warnings,
        };
      }

      const finalDecision: StorageDecision = {
        providerId: decision.providerId!,
        providerType: decision.providerType!,
        strategy: decision.strategy || this.config.routing.defaultStrategy,
        tier: decision.tier || request.options?.tier || 'hot',
        region: decision.region,
        executionPlan: this.buildExecutionPlan(decision, context),
        policiesApplied,
        fallbackProviders: decision.fallbackProviders || [],
        confidence: decision.confidence || 0.8,
        reasoning: decision.reasoning || 'Policy evaluation complete',
      };

      return {
        allowed: true,
        decision: finalDecision,
        policiesApplied,
        errors,
        warnings,
      };
    } catch (error) {
      return {
        allowed: false,
        policiesApplied,
        errors: [{
          policy: 'engine',
          message: error instanceof Error ? error.message : String(error),
          code: 'ENGINE_ERROR',
        }],
        warnings,
      };
    }
  }

  private async buildContext(request: UploadRequest): Promise<PolicyContext> {
    const providers = this.registry.enumerate();
    const health = this.registry.getAllHealth();
    const capabilities = new Map<string, ProviderCapabilities>();

    for (const provider of providers) {
      const caps = this.registry.getCapabilities(provider.providerId);
      if (caps) {
        capabilities.set(provider.providerId, caps);
      }
    }

    return {
      request,
      providers,
      config: this.config,
      health,
      capabilities,
      timestamp: new Date().toISOString(),
    };
  }

  private getPolicyType(evaluatorName: string): AppliedPolicy['type'] {
    const typeMap: Record<string, AppliedPolicy['type']> = {
      routing: 'routing',
      capability: 'routing',
      health: 'health',
      tier: 'routing',
      region: 'routing',
      security: 'security',
      encryption: 'security',
      replication: 'replication',
      lifecycle: 'lifecycle',
      cost: 'cost',
      compliance: 'compliance',
      failover: 'failover',
    };
    return typeMap[evaluatorName] || 'routing';
  }

  private getEvaluatorPriority(name: string): number {
    const priorityMap: Record<string, number> = {
      security: 110,
      routing: 100,
      capability: 90,
      health: 80,
      tier: 70,
      region: 60,
      encryption: 40,
      replication: 30,
      lifecycle: 20,
      cost: 10,
      compliance: 5,
      failover: 1,
    };
    return priorityMap[name] || 0;
  }

  private buildExecutionPlan(decision: Partial<StorageDecision>, context: PolicyContext): ExecutionPlan {
    const operations: ExecutionOperation[] = [];
    const replicationTargets: ReplicationTarget[] = [];
    const lifecycleActions: LifecycleAction[] = [];
    const securityChecks: SecurityCheck[] = [];

    operations.push({
      type: this.getUploadOperationType(context.request),
      providerId: decision.providerId!,
      path: context.request.path,
      options: context.request.options,
    });

    if (this.config.replication.enabled && this.config.replication.mode === 'async') {
      for (const destId of this.config.replication.destinationProviderIds) {
        const destProvider = this.registry.resolve(destId);
        if (destProvider) {
          replicationTargets.push({
            providerId: destId,
            providerType: destProvider.providerType as StorageProviderType,
            priority: 1,
            async: true,
            delayMs: this.config.replication.replicationTimeControlMinutes * 60 * 1000,
          });
        }
      }
    }

    if (this.config.lifecycle.autoTiering.enabled) {
      lifecycleActions.push({
        type: 'tier_transition',
        providerId: decision.providerId!,
        path: context.request.path,
        params: {
          hotToWarmDays: this.config.lifecycle.hotToWarmDays,
          warmToColdDays: this.config.lifecycle.warmToColdDays,
          coldToArchiveDays: this.config.lifecycle.coldToArchiveDays,
        },
      });
    }

    if (this.config.security.checksumValidation) {
      securityChecks.push({
        type: 'checksum',
        providerId: decision.providerId!,
        path: context.request.path,
        params: { algorithm: this.config.security.checksumAlgorithm },
        required: true,
      });
    }

    if (this.config.security.virusScan.enabled && context.request.sizeBytes <= this.config.security.virusScan.maxFileSizeBytes) {
      securityChecks.push({
        type: 'virus_scan',
        providerId: decision.providerId!,
        path: context.request.path,
        params: { engine: this.config.security.virusScan.engine },
        required: false,
      });
    }

    if (this.config.security.contentValidation.enabled) {
      securityChecks.push({
        type: 'content_validation',
        providerId: decision.providerId!,
        path: context.request.path,
        params: {
          magicBytesCheck: this.config.security.contentValidation.magicBytesCheck,
          mimeTypeVerification: this.config.security.contentValidation.mimeTypeVerification,
        },
        required: true,
      });
    }

    if (this.config.security.executableBlock) {
      securityChecks.push({
        type: 'executable_block',
        providerId: decision.providerId!,
        path: context.request.path,
        params: {},
        required: true,
      });
    }

    if (this.config.security.pathConstraints) {
      securityChecks.push({
        type: 'path_constraint',
        providerId: decision.providerId!,
        path: context.request.path,
        params: {},
        required: true,
      });
    }

    if (this.config.security.overwriteProtection) {
      securityChecks.push({
        type: 'overwrite_protection',
        providerId: decision.providerId!,
        path: context.request.path,
        params: {},
        required: true,
      });
    }

    return {
      primaryProvider: decision.providerId!,
      operations,
      replicationTargets,
      lifecycleActions,
      securityChecks,
      estimatedCost: this.estimateCost(context.request, decision.providerId!),
      estimatedLatencyMs: this.estimateLatency(decision.providerId!),
    };
  }

  private getUploadOperationType(request: UploadRequest): ExecutionOperation['type'] {
    if (request.sizeBytes > 100 * 1024 * 1024 && this.config.features.multipartUpload) {
      return 'multipart';
    }
    if (request.sizeBytes > 10 * 1024 * 1024 && this.config.features.resumableUpload) {
      return 'resumable';
    }
    return 'upload';
  }

  private estimateCost(request: UploadRequest, providerId: string): number {
    const provider = this.registry.resolve(providerId);
    if (!provider) return 0;

    const costPerGB = this.getProviderCostPerGB(provider.providerType);
    return (request.sizeBytes / (1024 * 1024 * 1024)) * costPerGB;
  }

  private getProviderCostPerGB(providerType: string): number {
    const costs: Record<string, number> = {
      FIREBASE_STORAGE: 0.026,
      AWS_S3: 0.023,
      AZURE_BLOB: 0.0184,
      GOOGLE_CLOUD_STORAGE: 0.026,
      CLOUDFLARE_R2: 0.015,
      LOCAL: 0,
    };
    return costs[providerType] || 0.023;
  }

  private estimateLatency(providerId: string): number {
    const health = this.registry.getHealth(providerId);
    return health?.latencyMs || 50;
  }

  private async evaluateRoutingPolicy(context: PolicyContext): Promise<Partial<StorageDecision> | null> {
    const routingConfig = context.config.routing;
    const strategyConfig = routingConfig.strategyConfig[routingConfig.defaultStrategy];

    if (!strategyConfig || !strategyConfig.enabled) {
      return null;
    }

    if (routingConfig.defaultStrategy === 'content_type_routing') {
      return this.evaluateContentTypeRouting(context, strategyConfig);
    }
    if (routingConfig.defaultStrategy === 'capability_routing') {
      return this.evaluateCapabilityRouting(context, strategyConfig);
    }
    if (routingConfig.defaultStrategy === 'tier_based_routing') {
      return this.evaluateTierBasedRouting(context, strategyConfig);
    }
    if (routingConfig.defaultStrategy === 'primary_secondary') {
      return this.evaluatePrimarySecondaryRouting(context, strategyConfig);
    }
    if (routingConfig.defaultStrategy === 'failover_routing') {
      return this.evaluateFailoverRouting(context, strategyConfig);
    }

    return this.evaluateDefaultRouting(context);
  }

  private evaluateContentTypeRouting(context: PolicyContext, config: StrategyConfig): Partial<StorageDecision> {
    const { request } = context;
    const rules = config.rules || [];

    for (const rule of rules) {
      if (request.mimeType.startsWith(rule.mimeTypePrefix)) {
        for (const providerId of rule.providerIds) {
          const provider = context.providers.find(p => p.providerId === providerId);
          if (provider && provider.status === 'active') {
            const health = context.health.get(providerId);
            if (health && (health.status === 'healthy' || health.status === 'degraded')) {
              if (this.checkRequiredCapabilities(context, providerId, rule.requireCapabilities)) {
                return {
                  providerId,
                  providerType: provider.providerType as any,
                  strategy: 'content_type_routing',
                  tier: rule.tier,
                  fallbackProviders: rule.providerIds.filter(id => id !== providerId),
                  confidence: 0.9,
                  reasoning: `Matched content type rule: ${rule.mimeTypePrefix} -> ${providerId}`,
                };
              }
            }
          }
        }
      }
    }

    return this.evaluateDefaultRouting(context);
  }

  private evaluateCapabilityRouting(context: PolicyContext, config: StrategyConfig): Partial<StorageDecision> {
    const capabilities = config.capabilityPriorities || {};

    for (const [capability, providerIds] of Object.entries(capabilities)) {
      for (const providerId of providerIds) {
        const provider = context.providers.find(p => p.providerId === providerId);
        if (provider && provider.status === 'active') {
          const caps = context.capabilities.get(providerId);
          if (caps && this.hasCapability(caps, capability)) {
            return {
              providerId,
              providerType: provider.providerType as any,
              strategy: 'capability_routing',
              fallbackProviders: providerIds.filter(id => id !== providerId),
              confidence: 0.85,
              reasoning: `Selected provider with capability: ${capability}`,
            };
          }
        }
      }
    }

    return this.evaluateDefaultRouting(context);
  }

  private evaluateTierBasedRouting(context: PolicyContext, config: StrategyConfig): Partial<StorageDecision> {
    const { request } = context;
    const tier = request.options?.tier || 'hot';
    const tierMapping = config.tierMapping || {};
    const providersForTier = tierMapping[tier] || [];

    for (const providerId of providersForTier) {
      const provider = context.providers.find(p => p.providerId === providerId);
      if (provider && provider.status === 'active') {
        const health = context.health.get(providerId);
        if (health && (health.status === 'healthy' || health.status === 'degraded')) {
          return {
            providerId,
            providerType: provider.providerType as any,
            strategy: 'tier_based_routing',
            tier,
            fallbackProviders: providersForTier.filter(id => id !== providerId),
            confidence: 0.8,
            reasoning: `Tier-based routing: ${tier} -> ${providerId}`,
          };
        }
      }
    }

    return this.evaluateDefaultRouting(context);
  }

  private evaluatePrimarySecondaryRouting(context: PolicyContext, config: StrategyConfig): Partial<StorageDecision> {
    const primaryId = config.primaryProviderId;
    const secondaryIds = config.secondaryProviderIds || [];

    if (primaryId) {
      const primary = context.providers.find(p => p.providerId === primaryId);
      if (primary && primary.status === 'active') {
        const health = context.health.get(primaryId);
        if (health && (health.status === 'healthy' || health.status === 'degraded')) {
          return {
            providerId: primaryId,
            providerType: primary.providerType as any,
            strategy: 'primary_secondary',
            fallbackProviders: secondaryIds,
            confidence: 0.95,
            reasoning: `Primary-secondary routing: primary=${primaryId}`,
          };
        }
      }
    }

    for (const secondaryId of secondaryIds) {
      const secondary = context.providers.find(p => p.providerId === secondaryId);
      if (secondary && secondary.status === 'active') {
        const health = context.health.get(secondaryId);
        if (health && (health.status === 'healthy' || health.status === 'degraded')) {
          return {
            providerId: secondaryId,
            providerType: secondary.providerType as any,
            strategy: 'primary_secondary',
            fallbackProviders: secondaryIds.filter(id => id !== secondaryId),
            confidence: 0.7,
            reasoning: `Primary unavailable, failing over to secondary: ${secondaryId}`,
          };
        }
      }
    }

    return this.evaluateDefaultRouting(context);
  }

  private evaluateFailoverRouting(context: PolicyContext, config: StrategyConfig): Partial<StorageDecision> {
    const primaryId = config.primaryProviderId;
    const secondaryIds = config.secondaryProviderIds || [];

    if (primaryId) {
      const primary = context.providers.find(p => p.providerId === primaryId);
      if (primary && primary.status === 'active') {
        const health = context.health.get(primaryId);
        if (health && (health.status === 'healthy' || health.status === 'degraded')) {
          return {
            providerId: primaryId,
            providerType: primary.providerType as any,
            strategy: 'failover_routing',
            fallbackProviders: secondaryIds,
            confidence: 0.95,
            reasoning: `Failover routing: primary healthy (${primaryId})`,
          };
        }
      }
    }

    for (const secondaryId of secondaryIds) {
      const secondary = context.providers.find(p => p.providerId === secondaryId);
      if (secondary && secondary.status === 'active') {
        const health = context.health.get(secondaryId);
        if (health && (health.status === 'healthy' || health.status === 'degraded')) {
          return {
            providerId: secondaryId,
            providerType: secondary.providerType as any,
            strategy: 'failover_routing',
            fallbackProviders: secondaryIds.filter(id => id !== secondaryId),
            confidence: 0.6,
            reasoning: `Failover: primary unavailable, using ${secondaryId}`,
          };
        }
      }
    }

    return this.evaluateDefaultRouting(context);
  }

  private evaluateDefaultRouting(context: PolicyContext): Partial<StorageDecision> {
    const activeProviders = context.providers.filter(p => p.status === 'active');

    // Never route to an unhealthy provider when any healthy eligible provider
    // exists. Providers with no health record are treated as unknown and are
    // only considered when nothing else is available.
    let fallback: { provider: typeof activeProviders[0]; reason: string } | null = null;

    for (const provider of activeProviders) {
      const health = context.health.get(provider.providerId);
      if (health && (health.status === 'healthy' || health.status === 'degraded')) {
        return {
          providerId: provider.providerId,
          providerType: provider.providerType as any,
          strategy: 'single_provider',
          fallbackProviders: activeProviders.filter(p => p.providerId !== provider.providerId).map(p => p.providerId),
          confidence: 0.5,
          reasoning: `Default routing: first healthy provider (${provider.providerId})`,
        };
      }
      if (!health && !fallback) {
        fallback = { provider, reason: `Default routing: ${provider.providerId} has no health data` };
      }
    }

    if (fallback) {
      return {
        providerId: fallback.provider.providerId,
        providerType: fallback.provider.providerType as any,
        strategy: 'single_provider',
        fallbackProviders: activeProviders.filter(p => p.providerId !== fallback!.provider.providerId).map(p => p.providerId),
        confidence: 0.3,
        reasoning: fallback.reason,
      };
    }

    // All active providers are unhealthy — do not route to them.
    return null;
  }

  private hasCapability(caps: any, capability: string): boolean {
    if (!caps) return false;
    if (caps instanceof Set) {
      return caps.has(capability);
    }
    return caps[capability as keyof ProviderCapabilities] === true;
  }

  private checkRequiredCapabilities(context: PolicyContext, providerId: string, requiredCapabilities?: string[]): boolean {
    if (!requiredCapabilities || requiredCapabilities.length === 0) {
      return true;
    }
    const caps = context.capabilities.get(providerId);
    if (!caps) return false;
    return requiredCapabilities.every(cap => this.hasCapability(caps, cap));
  }

  private async evaluateCapabilityPolicy(context: PolicyContext): Promise<Partial<StorageDecision> | null> {
    const { request } = context;
    const requiredCapabilities: string[] = [];

    if (request.sizeBytes > 100 * 1024 * 1024 && context.config.features.multipartUpload) {
      requiredCapabilities.push('multipartUpload');
    }
    if (request.sizeBytes > 10 * 1024 * 1024 && context.config.features.resumableUpload) {
      requiredCapabilities.push('resume');
    }
    if (request.mimeType.startsWith('video/') || request.mimeType.startsWith('audio/')) {
      requiredCapabilities.push('streaming');
    }
    if (context.config.features.versioning) {
      requiredCapabilities.push('versioning');
    }
    if (context.config.features.retention) {
      requiredCapabilities.push('retention');
    }
    if (context.config.features.legalHold) {
      requiredCapabilities.push('legalHold');
    }

    for (const provider of context.providers) {
      if (provider.status !== 'active') continue;
      const caps = context.capabilities.get(provider.providerId);
      if (!caps) continue;

      const hasAll = requiredCapabilities.every(cap => this.hasCapability(caps, cap));
      if (hasAll) {
        return {
          fallbackProviders: context.providers
            .filter(p => p.providerId !== provider.providerId && p.status === 'active')
            .map(p => p.providerId),
          confidence: 0.9,
          reasoning: `Provider supports all required capabilities: ${requiredCapabilities.join(', ')}`,
        };
      }
    }

    return null;
  }

  private async evaluateHealthPolicy(context: PolicyContext): Promise<Partial<StorageDecision> | null> {
    const healthConfig = context.config.routing.strategyConfig.health_based_routing;
    if (!healthConfig || !healthConfig.enabled) return null;

    const threshold = healthConfig.healthThreshold || 'degraded';
    const validStatuses = this.getValidHealthStatuses(threshold);

    const healthyProviders = context.providers.filter(p => {
      if (p.status !== 'active') return false;
      const health = context.health.get(p.providerId);
      return health && validStatuses.includes(health.status);
    });

    if (healthyProviders.length === 0 && healthConfig.excludeOffline) {
      return {
        confidence: 0,
        reasoning: 'No healthy providers available',
      };
    }

    return null;
  }

  private getValidHealthStatuses(threshold: string): string[] {
    const statusOrder = ['healthy', 'degraded', 'critical', 'offline'];
    const thresholdIndex = statusOrder.indexOf(threshold);
    return statusOrder.slice(0, thresholdIndex + 1);
  }

  private async evaluateTierPolicy(context: PolicyContext): Promise<Partial<StorageDecision> | null> {
    const { request } = context;
    const tier = request.options?.tier || 'hot';
    return { tier };
  }

  private async evaluateRegionPolicy(context: PolicyContext): Promise<Partial<StorageDecision> | null> {
    const { request } = context;
    const region = request.options?.region;
    return { region };
  }

  private async evaluateSecurityPolicy(context: PolicyContext): Promise<Partial<StorageDecision> | null> {
    const { request } = context;

    if (context.config.security.executableBlock) {
      const isExecutable = this.checkExecutable(request.path, request.mimeType);
      if (isExecutable) {
        return {
          providerId: '',
          confidence: 0,
          reasoning: 'Executable file blocked by security policy',
        };
      }
    }

    if (context.config.security.pathConstraints) {
      const pathValid = this.validatePathConstraints(request.path, request.mimeType, request.sizeBytes);
      if (!pathValid) {
        return {
          providerId: '',
          confidence: 0,
          reasoning: 'Path constraints violated',
        };
      }
    }

    if (context.config.security.maxFileSizeBytes > 0 && request.sizeBytes > context.config.security.maxFileSizeBytes) {
      return {
        providerId: '',
        confidence: 0,
        reasoning: `File size ${request.sizeBytes} exceeds maximum ${context.config.security.maxFileSizeBytes}`,
      };
    }

    return null;
  }

  private checkExecutable(fileName: string, contentType: string): boolean {
    const executableExtensions = new Set([
      'exe', 'sh', 'bat', 'cmd', 'msi', 'apk', 'com', 'scr', 'vbs', 'jar',
      'php', 'py', 'pl', 'cgi', 'asp', 'aspx', 'jsp', 'dll', 'sys', 'drv', 'elf', 'bin', 'ps1'
    ]);
    const executableMimes = new Set([
      'application/x-msdownload',
      'application/x-executable',
      'application/x-sh',
      'application/x-bat',
      'application/x-dostype',
      'application/x-msdos-program',
      'application/x-elf',
      'application/x-sharedlib',
      'application/x-object',
      'application/x-python',
      'application/x-php',
      'application/x-httpd-php',
      'application/x-javascript',
      'text/javascript',
      'application/javascript',
      'application/x-shockwave-flash',
    ]);

    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (executableExtensions.has(ext)) return true;
    if (executableMimes.has(contentType.toLowerCase())) return true;
    return false;
  }

  private validatePathConstraints(path: string, contentType: string, sizeBytes: number): boolean {
    const folder = path.split('/')[0];
    const constraints: Record<string, { allowedExtensions: string[]; allowedMimeTypes: RegExp; maxSizeBytes: number }> = {
      images: { allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'ico'], allowedMimeTypes: /^image\/(jpeg|png|webp|gif|svg\+xml|x-icon|vnd\.microsoft\.icon)$/, maxSizeBytes: 10 * 1024 * 1024 },
      audio: { allowedExtensions: ['mp3', 'm4a', 'wav', 'ogg', 'aac', 'flac', 'opus'], allowedMimeTypes: /^audio\/(mpeg|mp4|wav|ogg|aac|x-m4a|flac|opus)$/, maxSizeBytes: 100 * 1024 * 1024 },
      video: { allowedExtensions: ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v'], allowedMimeTypes: /^video\/(mp4|webm|quicktime|x-matroska|x-msvideo)$/, maxSizeBytes: 500 * 1024 * 1024 },
      books: { allowedExtensions: ['pdf', 'epub', 'mobi', 'azw3', 'djvu', 'jpg', 'jpeg', 'png', 'webp'], allowedMimeTypes: /^(application\/pdf|application\/epub\+zip|application\/x-mobipocket-ebook|application\/x-djvu|image\/(jpeg|png|webp))$/, maxSizeBytes: 100 * 1024 * 1024 },
      documents: { allowedExtensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'], allowedMimeTypes: /^(application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument.*|text\/plain|text\/csv)$/, maxSizeBytes: 50 * 1024 * 1024 },
      events: { allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'pdf'], allowedMimeTypes: /^(image\/(jpeg|png|webp)|application\/pdf)$/, maxSizeBytes: 25 * 1024 * 1024 },
      avatars: { allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'], allowedMimeTypes: /^image\/(jpeg|png|webp)$/, maxSizeBytes: 5 * 1024 * 1024 },
    };

    const constraint = constraints[folder];
    if (!constraint) return false;

    if (sizeBytes > constraint.maxSizeBytes) return false;

    const ext = path.split('.').pop()?.toLowerCase() || '';
    if (constraint.allowedExtensions.length > 0 && !constraint.allowedExtensions.includes(ext)) return false;

    if (!constraint.allowedMimeTypes.test(contentType)) return false;

    return true;
  }

  private async evaluateEncryptionPolicy(context: PolicyContext): Promise<Partial<StorageDecision> | null> {
    if (!context.config.features.encryption.enabled) return null;
    return null;
  }

  private async evaluateReplicationPolicy(context: PolicyContext): Promise<Partial<StorageDecision> | null> {
    if (!context.config.replication.enabled) return null;
    return null;
  }

  private async evaluateLifecyclePolicy(context: PolicyContext): Promise<Partial<StorageDecision> | null> {
    if (!context.config.lifecycle.autoTiering.enabled) return null;
    return null;
  }

  private async evaluateCostPolicy(context: PolicyContext): Promise<Partial<StorageDecision> | null> {
    const costConfig = context.config.routing.strategyConfig.cost_aware_routing;
    if (!costConfig || !costConfig.enabled) return null;
    return null;
  }

  private async evaluateCompliancePolicy(context: PolicyContext): Promise<Partial<StorageDecision> | null> {
    return null;
  }

  private async evaluateFailoverPolicy(context: PolicyContext): Promise<Partial<StorageDecision> | null> {
    const failoverConfig = context.config.routing.strategyConfig.failover_routing;
    if (!failoverConfig || !failoverConfig.enabled) return null;
    return null;
  }
}

// NOTE: The eager `policyEngine` singleton was removed because it threw at
// import time whenever configuration had not yet been loaded. Callers must
// construct StoragePolicyEngine with a loaded StorageConfiguration.