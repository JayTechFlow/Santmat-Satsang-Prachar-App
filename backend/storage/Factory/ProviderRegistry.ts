// Sprint E2.2 — Provider Registry
// Dynamic provider registration, resolution, and plugin architecture

import type {
  StorageProviderType,
  StorageTier,
  StorageProviderHealth,
  StorageProviderConfig,
  ProviderCapabilities,
  LifecycleRule,
  LifecycleFilter,
  LifecycleTransition,
  LifecycleExpiration,
  LifecycleAbortMultipartUpload,
  CorsRule,
  PublicAccessBlockConfig,
  ValidationResult,
} from '../Models/StorageModels';
import type { IStorageProvider } from '../Interfaces/IStorageProvider';
import { EventEmitter } from 'events';
import { StorageCapability, StorageCapabilitySet } from '../Capabilities/StorageCapabilities';

export interface ProviderRegistration {
  providerId: string;
  providerType: StorageProviderType;
  provider: IStorageProvider;
  factory: IStorageProviderFactory;
  capabilities: StorageCapabilitySet;
  capabilityMetadata: Map<string, any>;
  config: StorageProviderConfig;
  registeredAt: string;
  status: 'active' | 'inactive' | 'error' | 'initializing';
  healthStatus?: StorageProviderHealth;
  pluginHooks?: ProviderPluginHooks;
}

export interface ProviderPluginHooks {
  onRegister?: (registration: ProviderRegistration) => Promise<void>;
  onUnregister?: (registration: ProviderRegistration) => Promise<void>;
  onHealthCheck?: (health: StorageProviderHealth) => Promise<void>;
  onConfigChange?: (oldConfig: StorageProviderConfig, newConfig: StorageProviderConfig) => Promise<void>;
  onError?: (error: Error, operation: string) => Promise<void>;
}

export interface IStorageProviderFactory {
  readonly providerType: StorageProviderType;
  readonly supportedCapabilities: ProviderCapabilities;
  create(config: StorageProviderConfig): Promise<IStorageProvider>;
  destroy(provider: IStorageProvider): Promise<void>;
  reload(provider: IStorageProvider, config: StorageProviderConfig): Promise<IStorageProvider>;
  validateConfig(config: StorageProviderConfig): ValidationResult;
  discoverCapabilities(provider: IStorageProvider): Promise<ProviderCapabilities>;
}

export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private providers = new Map<string, ProviderRegistration>();
  private factories = new Map<StorageProviderType, IStorageProviderFactory>();
  private typeIndex = new Map<StorageProviderType, Set<string>>();
  private priorityIndex: string[] = [];
  private eventListeners = new Map<string, Set<RegistryEventListener>>();

  private constructor() {}

  static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  static reset(): void {
    ProviderRegistry.instance = new ProviderRegistry();
  }

  registerFactory(factory: IStorageProviderFactory): void {
    this.factories.set(factory.providerType, factory);
    this.emit('factory:registered', { providerType: factory.providerType });
  }

  unregisterFactory(providerType: StorageProviderType): boolean {
    const result = this.factories.delete(providerType);
    if (result) {
      this.emit('factory:unregistered', { providerType });
    }
    return result;
  }

  getFactory(providerType: StorageProviderType): IStorageProviderFactory | undefined {
    return this.factories.get(providerType);
  }

  getRegisteredFactories(): IStorageProviderFactory[] {
    return Array.from(this.factories.values());
  }

  async register(registration: Omit<ProviderRegistration, 'registeredAt' | 'status'>): Promise<void> {
    const capabilities = registration.capabilities instanceof Set 
      ? registration.capabilities 
      : new Set(Object.keys(registration.capabilities).filter(k => registration.capabilities[k] === true)) as StorageCapabilitySet;

    const fullRegistration: ProviderRegistration = {
      ...registration,
      capabilities,
      capabilityMetadata: new Map(),
      registeredAt: new Date().toISOString(),
      status: 'initializing',
    };

    this.providers.set(registration.providerId, fullRegistration);

    if (!this.typeIndex.has(registration.providerType)) {
      this.typeIndex.set(registration.providerType, new Set());
    }
    this.typeIndex.get(registration.providerType)!.add(registration.providerId);

    this.rebuildPriorityIndex();

    // Execute plugin hooks
    if (registration.pluginHooks?.onRegister) {
      try {
        await registration.pluginHooks.onRegister(fullRegistration);
      } catch (error) {
        console.error(`Plugin hook onRegister failed for ${registration.providerId}:`, error);
      }
    }

    fullRegistration.status = 'active';
    this.emit('provider:registered', { providerId: registration.providerId });
  }

  async unregister(providerId: string): Promise<boolean> {
    const registration = this.providers.get(providerId);
    if (!registration) {
      return false;
    }

    // Execute plugin hooks
    if (registration.pluginHooks?.onUnregister) {
      try {
        await registration.pluginHooks.onUnregister(registration);
      } catch (error) {
        console.error(`Plugin hook onUnregister failed for ${providerId}:`, error);
      }
    }

    await registration.factory.destroy(registration.provider);

    this.providers.delete(providerId);

    const typeSet = this.typeIndex.get(registration.providerType);
    if (typeSet) {
      typeSet.delete(providerId);
      if (typeSet.size === 0) {
        this.typeIndex.delete(registration.providerType);
      }
    }

    this.rebuildPriorityIndex();

    this.emit('provider:unregistered', { providerId });
    return true;
  }

  resolve(providerId: string): IStorageProvider | undefined {
    return this.providers.get(providerId)?.provider;
  }

  resolveByType(providerType: StorageProviderType): IStorageProvider[] {
    const providerIds = this.typeIndex.get(providerType);
    if (!providerIds) {
      return [];
    }
    return Array.from(providerIds)
      .map(id => this.providers.get(id))
      .filter((r): r is ProviderRegistration => r !== undefined && r.status === 'active')
      .map(r => r.provider);
  }

  resolveByCapability(capability: keyof ProviderCapabilities): IStorageProvider[] {
    return Array.from(this.providers.values())
      .filter(r => {
        if (r.status !== 'active') return false;
        if (r.capabilities instanceof Set) {
          return r.capabilities.has(capability as StorageCapability);
        }
        return r.capabilities[capability] === true;
      })
      .map(r => r.provider);
  }

  enumerate(): ProviderRegistration[] {
    return Array.from(this.providers.values()).filter(r => r.status === 'active');
  }

  enumerateAll(): ProviderRegistration[] {
    return Array.from(this.providers.values());
  }

  getByPriority(): IStorageProvider[] {
    return this.priorityIndex
      .map(id => this.providers.get(id))
      .filter((r): r is ProviderRegistration => r !== undefined && r.status === 'active')
      .map(r => r.provider);
  }

  getProviderIds(): string[] {
    return Array.from(this.providers.keys());
  }

  getProviderIdsByType(providerType: StorageProviderType): string[] {
    const set = this.typeIndex.get(providerType);
    return set ? Array.from(set) : [];
  }

  updateHealth(providerId: string, health: StorageProviderHealth): void {
    const registration = this.providers.get(providerId);
    if (registration) {
      registration.healthStatus = health;
      this.emit('provider:health', { providerId, health });
    }
  }

  getHealth(providerId: string): StorageProviderHealth | undefined {
    return this.providers.get(providerId)?.healthStatus;
  }

  getAllHealth(): Map<string, StorageProviderHealth> {
    const healthMap = new Map<string, StorageProviderHealth>();
    for (const [id, reg] of this.providers) {
      if (reg.healthStatus) {
        healthMap.set(id, reg.healthStatus);
      }
    }
    return healthMap;
  }

  setStatus(providerId: string, status: 'active' | 'inactive' | 'error'): void {
    const registration = this.providers.get(providerId);
    if (registration) {
      const oldStatus = registration.status;
      registration.status = status;
      this.rebuildPriorityIndex();
      this.emit('provider:status', { providerId, oldStatus, newStatus: status });
    }
  }

  getCapabilities(providerId: string): StorageCapabilitySet | undefined {
    return this.providers.get(providerId)?.capabilities;
  }

  getCapabilityMetadata(providerId: string): Map<string, any> | undefined {
    return this.providers.get(providerId)?.capabilityMetadata;
  }

  getAllCapabilities(): Map<string, StorageCapabilitySet> {
    const caps = new Map<string, StorageCapabilitySet>();
    for (const [id, reg] of this.providers) {
      caps.set(id, reg.capabilities);
    }
    return caps;
  }

  getAllCapabilitiesWithMetadata(): Map<string, { capabilities: StorageCapabilitySet; metadata: Map<string, any> }> {
    const caps = new Map<string, { capabilities: StorageCapabilitySet; metadata: Map<string, any> }>();
    for (const [id, reg] of this.providers) {
      caps.set(id, { capabilities: reg.capabilities, metadata: reg.capabilityMetadata });
    }
    return caps;
  }

  isCapabilitySupported(providerType: StorageProviderType, capability: string): boolean {
    const factory = this.factories.get(providerType);
    return factory?.supportedCapabilities[capability as keyof ProviderCapabilities] === true;
  }

  setPluginHooks(providerId: string, hooks: ProviderPluginHooks): void {
    const registration = this.providers.get(providerId);
    if (registration) {
      registration.pluginHooks = hooks;
    }
  }

  async executePluginHook(providerId: string, hookName: keyof ProviderPluginHooks, ...args: any[]): Promise<void> {
    const registration = this.providers.get(providerId);
    if (!registration?.pluginHooks) return;

    const hook = registration.pluginHooks[hookName];
    if (hook) {
      try {
        await hook(...args);
      } catch (error) {
        console.error(`Plugin hook ${hookName} failed for ${providerId}:`, error);
        if (registration.pluginHooks.onError) {
          await registration.pluginHooks.onError(error as Error, hookName);
        }
      }
    }
  }

  on(event: string, listener: RegistryEventListener): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
    return () => this.off(event, listener);
  }

  off(event: string, listener: RegistryEventListener): void {
    this.eventListeners.get(event)?.delete(listener);
  }

  private emit(event: string, data: unknown): void {
    this.eventListeners.get(event)?.forEach(listener => {
      try {
        listener(data);
      } catch (err) {
        console.error(`Registry event listener error for ${event}:`, err);
      }
    });
  }

  private rebuildPriorityIndex(): void {
    this.priorityIndex = Array.from(this.providers.entries())
      .filter(([, reg]) => reg.status === 'active')
      .sort((a, b) => a[1].config.priority - b[1].config.priority)
      .map(([id]) => id);
  }

  clear(): void {
    this.providers.clear();
    this.typeIndex.clear();
    this.priorityIndex = [];
    this.emit('registry:cleared', {});
  }

  getStats(): RegistryStats {
    return {
      totalProviders: this.providers.size,
      activeProviders: this.enumerate().length,
      providersByType: Object.fromEntries(
        Array.from(this.typeIndex.entries()).map(([type, set]) => [type, set.size])
      ),
      factoriesRegistered: this.factories.size,
    };
  }
}

export interface RegistryEventListener {
  (data: unknown): void;
}

export interface RegistryStats {
  totalProviders: number;
  activeProviders: number;
  providersByType: Record<string, number>;
  factoriesRegistered: number;
}

export const providerRegistry = ProviderRegistry.getInstance();