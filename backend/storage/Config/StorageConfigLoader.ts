// Sprint E2.2 — Storage Configuration Loader
// YAML parsing, schema validation, environment overrides, secret resolution, hot reload

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { EventEmitter } from 'events';
import type {
  StorageProviderType,
  StorageTier,
  StorageStrategyType,
  StorageProviderConfig,
  ProviderCapabilities,
} from '../Models/StorageModels';
import { ProviderRegistry, type ProviderRegistration } from '../Factory/ProviderRegistry';
import { getProviderFactory } from '../Factory/StorageProviderFactory';

export interface StorageConfiguration {
  version: string;
  environment: string;
  providers: StorageProviderConfig[];
  routing: RoutingConfiguration;
  features: FeatureFlags;
  security: SecurityConfiguration;
  lifecycle: LifecycleConfiguration;
  backup: BackupConfiguration;
  replication: ReplicationConfiguration;
  observability: ObservabilityConfiguration;
  performance: PerformanceConfiguration;
}

export interface RoutingConfiguration {
  defaultStrategy: StorageStrategyType;
  enabledStrategies: StorageStrategyType[];
  strategyConfig: Record<string, StrategyConfig>;
}

export interface StrategyConfig {
  enabled: boolean;
  rules?: RoutingRule[];
  healthThreshold?: 'healthy' | 'degraded' | 'critical';
  fallbackStrategy?: StorageStrategyType;
  excludeOffline?: boolean;
  primaryProviderId?: string;
  secondaryProviderIds?: string[];
  healthCheckIntervalSeconds?: number;
  failbackEnabled?: boolean;
  failbackDelaySeconds?: number;
  asyncReplication?: boolean;
  replicationDelayMs?: number;
  tierMapping?: Record<StorageTier, string[]>;
  capabilityPriorities?: Record<string, string[]>;
  maxCostPerGBMonth?: number;
  preferCheapest?: boolean;
  regionMapping?: Record<string, string>;
  defaultRegion?: string;
  providerPriorities?: Record<string, number>;
  providerWeights?: Record<string, number>;
}

export interface RoutingRule {
  mimeTypePrefix: string;
  providerIds: string[];
  tier?: StorageTier;
  requireCapabilities?: string[];
}

export interface FeatureFlags {
  multipartUpload: boolean;
  resumableUpload: boolean;
  versioning: boolean;
  legalHold: boolean;
  retention: boolean;
  batchOperations: boolean;
  costReporting: boolean;
  replication: boolean;
  backup: boolean;
  encryption: EncryptionFeatureFlags;
  compression: CompressionFeatureFlags;
  deduplication: DeduplicationFeatureFlags;
  cdn: CDNFeatureFlags;
  observability: ObservabilityFeatureFlags;
}

export interface EncryptionFeatureFlags {
  enabled: boolean;
  defaultAlgorithm: string;
  kmsKeyId?: string;
}

export interface CompressionFeatureFlags {
  enabled: boolean;
  algorithms: string[];
}

export interface DeduplicationFeatureFlags {
  enabled: boolean;
}

export interface CDNFeatureFlags {
  enabled: boolean;
  providerId?: string;
}

export interface ObservabilityFeatureFlags {
  tracing: boolean;
  metrics: boolean;
  logging: boolean;
}

export interface SecurityConfiguration {
  encryptionAlgorithm: string;
  kmsKeyId?: string;
  executableBlock: boolean;
  pathConstraints: boolean;
  overwriteProtection: boolean;
  signedTokenValidation: boolean;
  checksumValidation: boolean;
  checksumAlgorithm: string;
  maxFileSizeBytes: number;
  virusScan: VirusScanConfig;
  contentValidation: ContentValidationConfig;
  accessControl: AccessControlConfig;
  auditLogging: AuditLoggingConfig;
}

export interface VirusScanConfig {
  enabled: boolean;
  engine: string;
  maxFileSizeBytes: number;
}

export interface ContentValidationConfig {
  enabled: boolean;
  magicBytesCheck: boolean;
  mimeTypeVerification: boolean;
}

export interface AccessControlConfig {
  defaultPublicRead: boolean;
  requireSignedUrls: boolean;
  signedUrlMaxExpirySeconds: number;
}

export interface AuditLoggingConfig {
  enabled: boolean;
  logUploads: boolean;
  logDownloads: boolean;
  logDeletes: boolean;
  logMetadataChanges: boolean;
}

export interface LifecycleConfiguration {
  defaultRetentionDays: number;
  hotToWarmDays: number;
  warmToColdDays: number;
  coldToArchiveDays: number;
  autoTiering: AutoTieringConfig;
  expiration: ExpirationConfig;
  multipartAbort: MultipartAbortConfig;
}

export interface AutoTieringConfig {
  enabled: boolean;
  evaluationIntervalHours: number;
}

export interface ExpirationConfig {
  enabled: boolean;
  defaultDays: number;
}

export interface MultipartAbortConfig {
  enabled: boolean;
  daysAfterInitiation: number;
}

export interface BackupConfiguration {
  enabled: boolean;
  schedule: string;
  timezone: string;
  retentionDays: number;
  sourceProviderIds: string[];
  destinationProviderId: string;
  includeVersions: boolean;
  filter: BackupFilter;
  compression: boolean;
  encryption: boolean;
  verification: VerificationConfig;
}

export interface BackupFilter {
  prefix?: string;
  tags?: Record<string, string>;
}

export interface VerificationConfig {
  enabled: boolean;
  sampleRate: number;
}

export interface ReplicationConfiguration {
  enabled: boolean;
  mode: 'async' | 'sync';
  sourceProviderId: string;
  destinationProviderIds: string[];
  filter: ReplicationFilter;
  deleteMarkerReplication: boolean;
  replicationTimeControlMinutes: number;
  consistencyVerification: ConsistencyVerificationConfig;
}

export interface ReplicationFilter {
  prefix?: string;
  tags?: Record<string, string>;
}

export interface ConsistencyVerificationConfig {
  enabled: boolean;
  intervalHours: number;
  sampleRate: number;
}

export interface ObservabilityConfiguration {
  healthCheckIntervalSeconds: number;
  metricsEnabled: boolean;
  tracingEnabled: boolean;
  logLevel: string;
  metricsPort: number;
  healthEndpoint: string;
  alerting: AlertingConfig;
  exporters: ExportersConfig;
}

export interface AlertingConfig {
  enabled: boolean;
  latencyThresholdMs: number;
  errorRateThreshold: number;
  capacityThresholdPercent: number;
}

export interface ExportersConfig {
  prometheus: PrometheusExporterConfig;
  datadog: DatadogExporterConfig;
  newrelic: NewRelicExporterConfig;
}

export interface PrometheusExporterConfig {
  enabled: boolean;
  path: string;
}

export interface DatadogExporterConfig {
  enabled: boolean;
}

export interface NewRelicExporterConfig {
  enabled: boolean;
}

export interface PerformanceConfiguration {
  connectionPool: ConnectionPoolConfig;
  concurrency: ConcurrencyConfig;
  timeouts: TimeoutsConfig;
  retry: RetryConfig;
  buffering: BufferingConfig;
  caching: CachingConfig;
}

export interface ConnectionPoolConfig {
  minSize: number;
  maxSize: number;
  idleTimeoutMs: number;
}

export interface ConcurrencyConfig {
  maxParallelUploads: number;
  maxParallelDownloads: number;
  maxParallelOperations: number;
}

export interface TimeoutsConfig {
  connectMs: number;
  readMs: number;
  writeMs: number;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export interface BufferingConfig {
  uploadBufferSize: number;
  downloadBufferSize: number;
}

export interface CachingConfig {
  metadataCacheTtlSeconds: number;
  signedUrlCacheTtlSeconds: number;
  healthCacheTtlSeconds: number;
}

export interface ValidationReport {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  providerValidation: ProviderValidationResult[];
}

export interface ValidationError {
  path: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  path: string;
  message: string;
  code: string;
}

export interface ProviderValidationResult {
  providerId: string;
  providerType: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SecretResolver {
  resolve(value: string): string | Promise<string>;
  resolveAll(config: Record<string, any>): Promise<Record<string, any>>;
}

export interface EnvironmentOverrides {
  [environment: string]: Partial<StorageConfiguration>;
}

export class StorageConfigLoader extends EventEmitter {
  private config: StorageConfiguration | null = null;
  private configPath: string;
  private watcher: fs.FSWatcher | null = null;
  private secretResolver: SecretResolver | null = null;
  private validationCache: ValidationReport | null = null;
  private reloadScheduled = false;
  private readonly schema: ConfigurationSchema;
  private environmentOverrides: EnvironmentOverrides = {};
  private baseConfigPath: string;

  constructor(configPath: string = 'storage.yaml') {
    super();
    this.baseConfigPath = configPath;
    this.configPath = path.resolve(configPath);
    this.schema = this.buildSchema();
    this.loadEnvironmentOverrides();
  }

  private loadEnvironmentOverrides(): void {
    const env = process.env.NODE_ENV || 'development';
    const dir = path.dirname(this.baseConfigPath);
    const baseName = path.basename(this.baseConfigPath, '.yaml');
    const overridePath = path.join(dir, `${baseName}.${env}.yaml`);
    
    if (fs.existsSync(overridePath)) {
      try {
        const content = fs.readFileSync(overridePath, 'utf-8');
        const overrides = yaml.load(content) as Partial<StorageConfiguration>;
        this.environmentOverrides[env] = overrides;
        this.emit('overrides:loaded', { environment: env, path: overridePath });
      } catch (error) {
        this.emit('overrides:error', { environment: env, error });
      }
    }
  }

  async load(configPath?: string): Promise<StorageConfiguration> {
    if (configPath) {
      this.configPath = path.resolve(configPath);
    }
    const rawConfig = await this.parseYamlFile(this.configPath);
    const mergedConfig = this.mergeConfig(rawConfig);
    const resolvedConfig = await this.resolveSecrets(mergedConfig);
    const validatedConfig = this.validateConfiguration(resolvedConfig);
    this.config = validatedConfig;
    this.validationCache = this.generateValidationReport(validatedConfig);
    this.emit('loaded', this.config);
    return this.config;
  }

  private mergeConfig(baseConfig: any): any {
    const env = process.env.NODE_ENV || 'development';
    const overrides = this.environmentOverrides[env];
    
    if (!overrides) {
      return baseConfig;
    }

    return this.deepMerge(baseConfig, overrides);
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
          result[key] = this.deepMerge(target[key], source[key]);
        } else {
          result[key] = source[key];
        }
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  async reload(): Promise<StorageConfiguration> {
    this.emit('reloading');
    this.loadEnvironmentOverrides();
    try {
      const newConfig = await this.load();
      this.emit('reloaded', newConfig);
      return newConfig;
    } catch (error) {
      this.emit('reload:failed', error);
      throw error;
    }
  }

  getConfig(): StorageConfiguration | null {
    return this.config;
  }

  getConfigOrThrow(): StorageConfiguration {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call load() first.');
    }
    return this.config;
  }

  getValidationReport(): ValidationReport | null {
    return this.validationCache;
  }

  setConfigForTesting(config: StorageConfiguration, validationCache?: ValidationReport): void {
    this.config = config;
    this.validationCache = validationCache ?? { valid: true, errors: [], warnings: [], providerValidation: [] };
  }

  setSecretResolver(resolver: SecretResolver): void {
    this.secretResolver = resolver;
  }

  watch(intervalMs: number = 5000): void {
    if (this.watcher) {
      return;
    }

    this.watcher = fs.watch(this.configPath, { persistent: false }, (eventType) => {
      if (eventType === 'change') {
        this.scheduleReload();
      }
    });

    this.watcher.on('error', (error) => {
      this.emit('watch:error', error);
    });

    this.emit('watching', { path: this.configPath, intervalMs });
  }

  unwatch(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
      this.emit('unwatched');
    }
  }

  private scheduleReload(): void {
    if (this.reloadScheduled) {
      return;
    }
    this.reloadScheduled = true;
    setImmediate(async () => {
      this.reloadScheduled = false;
      try {
        await this.reload();
      } catch (error) {
        this.emit('reload:error', error);
      }
    });
  }

  private async parseYamlFile(filePath: string): Promise<any> {
    const content = fs.readFileSync(filePath, 'utf-8');
    return yaml.load(content) as Record<string, any>;
  }

  private async resolveSecrets(config: any): Promise<any> {
    if (!this.secretResolver) {
      return this.resolveEnvVars(config);
    }

    const resolved = JSON.parse(JSON.stringify(config));
    await this.secretResolver.resolveAll(resolved);
    return resolved;
  }

  private resolveEnvVars(config: any): any {
    const resolved = JSON.parse(JSON.stringify(config));
    this.resolveEnvValues(resolved);
    return resolved;
  }

  private resolveEnvValues(obj: any): void {
    if (typeof obj === 'string') {
      return;
    }
    if (Array.isArray(obj)) {
      for (const item of obj) {
        this.resolveEnvValues(item);
      }
      return;
    }
    if (obj && typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          // Supports ${VAR} and ${VAR:-default} syntax
          const match = value.match(/^\$\{([^}:]+)(?::-([^}]*))?\}$/);
          if (match) {
            const envVar = match[1];
            const defaultValue = match[2];
            const envValue = process.env[envVar];
            if (envValue !== undefined) {
              obj[key] = envValue;
            } else if (defaultValue !== undefined) {
              obj[key] = defaultValue;
            }
          }
        } else {
          this.resolveEnvValues(value);
        }
      }
    }
  }

  private validateConfiguration(config: any): StorageConfiguration {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    this.validateSchema(config, '', errors, warnings);
    this.validateProviders(config.providers || [], errors, warnings);
    this.validateRouting(config.routing, errors, warnings);
    this.validateFeatures(config.features, errors, warnings);
    this.validateSecurity(config.security, errors, warnings);
    this.validateLifecycle(config.lifecycle, errors, warnings);
    this.validateBackup(config.backup, errors, warnings);
    this.validateReplication(config.replication, errors, warnings);
    this.validateObservability(config.observability, errors, warnings);
    this.validatePerformance(config.performance, errors, warnings);

    if (errors.length > 0) {
      throw new ConfigurationValidationError('Configuration validation failed', errors);
    }

    return config as StorageConfiguration;
  }

  private validateSchema(config: any, path: string, errors: ValidationError[], warnings: ValidationWarning[]): void {
    const requiredFields = ['version', 'environment', 'providers', 'routing', 'features', 'security', 'lifecycle', 'backup', 'replication', 'observability', 'performance'];
    for (const field of requiredFields) {
      if (!(field in config)) {
        errors.push({ path: `${path}.${field}`, message: `Required field missing: ${field}`, code: 'MISSING_FIELD' });
      }
    }
  }

  private validateProviders(providers: any[], errors: ValidationError[], warnings: ValidationWarning[]): void {
    const providerIds = new Set<string>();
    const enabledProviders: any[] = [];

    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      const providerPath = `providers[${i}]`;

      if (!provider.providerId) {
        errors.push({ path: `${providerPath}.providerId`, message: 'providerId is required', code: 'MISSING_PROVIDER_ID' });
      } else if (providerIds.has(provider.providerId)) {
        errors.push({ path: `${providerPath}.providerId`, message: `Duplicate providerId: ${provider.providerId}`, code: 'DUPLICATE_PROVIDER_ID' });
      } else {
        providerIds.add(provider.providerId);
      }

      if (!provider.providerType) {
        errors.push({ path: `${providerPath}.providerType`, message: 'providerType is required', code: 'MISSING_PROVIDER_TYPE' });
      } else {
        const validTypes: StorageProviderType[] = ['AWS_S3', 'AZURE_BLOB', 'GOOGLE_CLOUD_STORAGE', 'FIREBASE_STORAGE', 'CLOUDFLARE_R2', 'LOCAL'];
        if (!validTypes.includes(provider.providerType)) {
          warnings.push({ path: `${providerPath}.providerType`, message: `Unknown provider type: ${provider.providerType}`, code: 'UNKNOWN_PROVIDER_TYPE' });
        }
      }

      if (typeof provider.enabled !== 'boolean') {
        errors.push({ path: `${providerPath}.enabled`, message: 'enabled must be boolean', code: 'INVALID_ENABLED' });
      }

      if (typeof provider.priority !== 'number' || provider.priority < 0) {
        errors.push({ path: `${providerPath}.priority`, message: 'priority must be non-negative integer', code: 'INVALID_PRIORITY' });
      }

      if (provider.enabled) {
        enabledProviders.push(provider);
      }
    }

    if (enabledProviders.length === 0) {
      warnings.push({ path: 'providers', message: 'No enabled providers configured', code: 'NO_ENABLED_PROVIDERS' });
    }
  }

  private validateRouting(routing: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!routing) {
      errors.push({ path: 'routing', message: 'Routing configuration is required', code: 'MISSING_ROUTING' });
      return;
    }

    const validStrategies: StorageStrategyType[] = [
      'single_provider', 'primary_secondary', 'read_replica', 'failover',
      'round_robin', 'region_aware', 'content_type_routing', 'tier_based', 'cost_optimized',
      'priority_routing', 'weighted_routing', 'health_based_routing', 'capability_routing',
      'composite_routing', 'chain_routing'
    ];

    if (!routing.defaultStrategy || !validStrategies.includes(routing.defaultStrategy)) {
      errors.push({ path: 'routing.defaultStrategy', message: `Invalid default strategy: ${routing.defaultStrategy}`, code: 'INVALID_STRATEGY' });
    }

    if (routing.enabledStrategies) {
      for (const strategy of routing.enabledStrategies) {
        if (!validStrategies.includes(strategy)) {
          warnings.push({ path: 'routing.enabledStrategies', message: `Unknown strategy: ${strategy}`, code: 'UNKNOWN_STRATEGY' });
        }
      }
    }

    if (routing.strategyConfig) {
      for (const [strategyName, strategyConfig] of Object.entries(routing.strategyConfig)) {
        const config = strategyConfig as any;
        if (!config.enabled) continue;

        switch (strategyName) {
          case 'content_type_routing':
            if (config.rules && !Array.isArray(config.rules)) {
              errors.push({ path: `routing.strategyConfig.${strategyName}.rules`, message: 'rules must be an array', code: 'INVALID_RULES' });
            }
            break;
          case 'priority_routing':
            if (config.providerPriorities && typeof config.providerPriorities !== 'object') {
              errors.push({ path: `routing.strategyConfig.${strategyName}.providerPriorities`, message: 'providerPriorities must be an object', code: 'INVALID_PRIORITIES' });
            }
            break;
          case 'weighted_routing':
            if (config.providerWeights && typeof config.providerWeights !== 'object') {
              errors.push({ path: `routing.strategyConfig.${strategyName}.providerWeights`, message: 'providerWeights must be an object', code: 'INVALID_WEIGHTS' });
            }
            break;
          case 'geo_routing':
            if (config.regionMapping && typeof config.regionMapping !== 'object') {
              errors.push({ path: `routing.strategyConfig.${strategyName}.regionMapping`, message: 'regionMapping must be an object', code: 'INVALID_REGION_MAPPING' });
            }
            break;
          case 'primary_secondary':
          case 'failover_routing':
            if (!config.primaryProviderId) {
              errors.push({ path: `routing.strategyConfig.${strategyName}.primaryProviderId`, message: 'primaryProviderId is required', code: 'MISSING_PRIMARY_PROVIDER' });
            }
            break;
        }
      }
    }
  }

  private validateFeatures(features: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!features) return;
    // Feature flags are optional booleans
  }

  private validateSecurity(security: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!security) return;
  }

  private validateLifecycle(lifecycle: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!lifecycle) return;
  }

  private validateBackup(backup: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!backup) return;
    if (backup.enabled && (!backup.sourceProviderIds || backup.sourceProviderIds.length === 0)) {
      errors.push({ path: 'backup.sourceProviderIds', message: 'Backup requires at least one source provider', code: 'MISSING_BACKUP_SOURCE' });
    }
    if (backup.enabled && !backup.destinationProviderId) {
      errors.push({ path: 'backup.destinationProviderId', message: 'Backup requires destination provider', code: 'MISSING_BACKUP_DESTINATION' });
    }
  }

  private validateReplication(replication: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!replication) return;
    if (replication.enabled && !replication.sourceProviderId) {
      errors.push({ path: 'replication.sourceProviderId', message: 'Replication requires source provider', code: 'MISSING_REPLICATION_SOURCE' });
    }
    if (replication.enabled && (!replication.destinationProviderIds || replication.destinationProviderIds.length === 0)) {
      errors.push({ path: 'replication.destinationProviderIds', message: 'Replication requires at least one destination provider', code: 'MISSING_REPLICATION_DESTINATION' });
    }
  }

  private validateObservability(observability: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!observability) return;
  }

  private validatePerformance(performance: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!performance) return;
  }

  private generateValidationReport(config: StorageConfiguration): ValidationReport {
    const providerValidation: ProviderValidationResult[] = [];

    for (const provider of config.providers) {
      const factory = getProviderFactory(provider.providerType);
      let factoryResult: { valid: boolean; errors: string[]; warnings: string[] } = { valid: true, errors: [], warnings: [] };

      if (factory) {
        factoryResult = factory.validateConfig(provider);
      } else {
        factoryResult = { valid: false, errors: [`No factory registered for provider type: ${provider.providerType}`], warnings: [] };
      }

      providerValidation.push({
        providerId: provider.providerId,
        providerType: provider.providerType,
        valid: factoryResult.valid,
        errors: factoryResult.errors,
        warnings: factoryResult.warnings,
      });
    }

    return {
      valid: providerValidation.every(p => p.valid),
      errors: [],
      warnings: [],
      providerValidation,
    };
  }

  private buildSchema(): ConfigurationSchema {
    return {
      version: { type: 'string', required: true },
      environment: { type: 'string', required: true },
      providers: { type: 'array', required: true, items: { type: 'object' } },
      routing: { type: 'object', required: true },
      features: { type: 'object', required: true },
      security: { type: 'object', required: true },
      lifecycle: { type: 'object', required: true },
      backup: { type: 'object', required: true },
      replication: { type: 'object', required: true },
      observability: { type: 'object', required: true },
      performance: { type: 'object', required: true },
    };
  }

  static createDefaultSecretResolver(): SecretResolver {
    return {
      resolve: (key: string) => process.env[key] || '',
    };
  }
}

export class ConfigurationValidationError extends Error {
  public readonly errors: ValidationError[];

  constructor(message: string, errors: ValidationError[]) {
    super(message);
    this.name = 'ConfigurationValidationError';
    this.errors = errors;
  }
}

interface ConfigurationSchema {
  [key: string]: { type: string; required?: boolean; items?: any };
}

export const configLoader = new StorageConfigLoader();