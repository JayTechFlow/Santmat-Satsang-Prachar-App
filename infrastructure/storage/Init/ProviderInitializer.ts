// Sprint E2.3 — Provider Initialization Module
// Loads configuration and registers providers with the registry

import { configLoader } from '../Config/StorageConfigLoader';
import { ProviderRegistry } from '../Factory/ProviderRegistry';
import { registerAllFactories } from '../Factory/ProviderFactories';
import { capabilityResolver } from '../Capabilities/ProviderCapabilityResolver';
import { healthMonitoring } from '../Health/HealthMonitoringEngine';
import type { StorageProviderConfig } from '../Models/StorageModels';

let initialized = false;

export async function initializeProviders(): Promise<void> {
  if (initialized) {
    console.log('Providers already initialized');
    return;
  }

  console.log('Initializing storage providers...');

  // 1. Register all factories
  registerAllFactories();

  // 2. Load configuration (idempotent; safe to call repeatedly)
  await configLoader.load().catch((error) => {
    console.error('Failed to load storage configuration:', error);
    throw error;
  });

  // 3. Get configuration
  const config = configLoader.getConfigOrThrow();

  // 3. Get registry instance
  const registry = ProviderRegistry.getInstance();

  // 4. Create and register providers from config
  for (const providerConfig of config.providers) {
    if (!providerConfig.enabled) {
      console.log(`Skipping disabled provider: ${providerConfig.providerId}`);
      continue;
    }

    try {
      await registerProviderFromConfig(providerConfig);
      console.log(`Registered provider: ${providerConfig.providerId} (${providerConfig.providerType})`);
    } catch (error) {
      console.error(`Failed to register provider ${providerConfig.providerId}:`, error);
      // Continue with other providers
    }
  }

  // 5. Discover capabilities for all registered providers
  console.log('Discovering provider capabilities...');
  await capabilityResolver.discoverAllCapabilities();

  // 6. Start health monitoring
  console.log('Starting health monitoring...');
  healthMonitoring.configure({
    intervalMs: config.observability.healthCheckIntervalSeconds * 1000,
    enabled: true,
  });
  healthMonitoring.start();

  // 7. Run initial health check
  console.log('Running initial health check...');
  await healthMonitoring.checkAllHealth();

  initialized = true;
  console.log('Storage providers initialized successfully');
}

async function registerProviderFromConfig(config: StorageProviderConfig): Promise<void> {
  const registry = ProviderRegistry.getInstance();
  const factory = registry.getFactory(config.providerType);

  if (!factory) {
    throw new Error(`No factory registered for provider type: ${config.providerType}`);
  }

  // Validate config
  const validation = factory.validateConfig(config);
  if (!validation.valid) {
    throw new Error(`Invalid provider config: ${validation.errors.join(', ')}`);
  }

  if (validation.warnings.length > 0) {
    validation.warnings.forEach(w => console.warn(`Provider ${config.providerId}: ${w}`));
  }

  // Create provider
  const provider = await factory.create(config);

  // Register with registry (factory.create already calls registerWithRegistry)
  // But we ensure it's in the registry with proper config
  const existing = registry.resolve(config.providerId);
  if (!existing) {
    await registry.register({
      providerId: config.providerId,
      providerType: config.providerType,
      provider,
      factory,
      capabilities: await factory.discoverCapabilities(provider),
      config,
      registeredAt: new Date().toISOString(),
      status: 'active',
    });
  }
}

export async function shutdownProviders(): Promise<void> {
  if (!initialized) return;

  console.log('Shutting down storage providers...');

  healthMonitoring.stop();
  capabilityResolver.invalidateCache();

  const registry = ProviderRegistry.getInstance();
  const providers = registry.enumerateAll();

  for (const reg of providers) {
    try {
      await registry.unregister(reg.providerId);
    } catch (error) {
      console.error(`Error unregistering ${reg.providerId}:`, error);
    }
  }

  initialized = false;
  console.log('Storage providers shut down');
}

export function isProvidersInitialized(): boolean {
  return initialized;
}

export async function reloadProviders(): Promise<void> {
  await shutdownProviders();
  await initializeProviders();
}

export async function getProviderStatus(): Promise<any> {
  const registry = ProviderRegistry.getInstance();
  const stats = registry.getStats();
  const health = registry.getAllHealth();

  return {
    initialized,
    stats,
    providers: Array.from(health.entries()).map(([id, h]) => ({
      providerId: id,
      status: h.status,
      latencyMs: h.latencyMs,
      lastChecked: h.lastChecked,
    })),
  };
}