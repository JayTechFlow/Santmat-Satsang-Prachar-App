// Sprint E2.2 — Health Monitoring Engine
// Background health polling, circuit breaker, alerting, and health caching

import type {
  StorageProviderHealth,
  StorageProviderType,
} from '../Models/StorageModels';
import type { IStorageProvider } from '../Interfaces/IStorageProvider';
import { ProviderRegistry, type ProviderRegistration } from '../Factory/ProviderRegistry';
import { EventEmitter } from 'events';

export interface HealthCheckConfig {
  intervalMs: number;
  timeoutMs: number;
  enabled: boolean;
}

export interface CircuitBreakerConfig {
  enabled: boolean;
  failureThreshold: number;
  successThreshold: number;
  timeoutMs: number;
}

export interface AlertConfig {
  enabled: boolean;
  latencyThresholdMs: number;
  errorRateThreshold: number;
  capacityThresholdPercent: number;
  healthStatusThreshold: 'healthy' | 'degraded' | 'critical';
}

export interface HealthAlert {
  id: string;
  providerId: string;
  providerType: StorageProviderType;
  severity: 'info' | 'warning' | 'critical';
  type: 'latency' | 'error_rate' | 'capacity' | 'status' | 'unavailable' | 'recovered' | 'circuit_open' | 'circuit_closed' | 'performance_degraded';
  message: string;
  timestamp: string;
  metadata: Record<string, any>;
  acknowledged: boolean;
}

export interface HealthHistoryEntry {
  providerId: string;
  timestamp: string;
  health: StorageProviderHealth;
}

export interface ProviderRanking {
  providerId: string;
  providerType: string;
  rank: number;
  score: number;
  latencyScore: number;
  availabilityScore: number;
  errorRateScore: number;
  capacityScore: number;
  lastUpdated: string;
}

export interface HealthStats {
  providerId: string;
  currentStatus: StorageProviderHealth['status'];
  uptimePercent: number;
  averageLatencyMs: number;
  errorRate: number;
  totalChecks: number;
  failedChecks: number;
  lastStatusChange: string;
  statusHistory: { status: string; timestamp: string }[];
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  throughputMbps: number;
  availability99: number;
}

export interface RecoveryEvent {
  providerId: string;
  previousStatus: string;
  currentStatus: string;
  recoveredAt: string;
  durationMs: number;
  rootCause?: string;
}

export class HealthMonitoringEngine extends EventEmitter {
  private registry: ProviderRegistry;
  private config: HealthCheckConfig;
  private circuitBreakerConfig: CircuitBreakerConfig;
  private alertConfig: AlertConfig;
  private interval: NodeJS.Timeout | null = null;
  private history = new Map<string, HealthHistoryEntry[]>();
  private circuitBreakers = new Map<string, CircuitBreakerState>();
  private alerts: HealthAlert[] = [];
  private maxHistorySize = 1000;
  private maxAlertsSize = 500;
  private running = false;
  private providerRankings = new Map<string, ProviderRanking>();
  private recoveryEvents: RecoveryEvent[] = [];
  private maxRecoveryEvents = 100;

  constructor() {
    super();
    this.registry = ProviderRegistry.getInstance();
    this.config = {
      intervalMs: 60000,
      timeoutMs: 10000,
      enabled: true,
    };
    this.circuitBreakerConfig = {
      enabled: true,
      failureThreshold: 5,
      successThreshold: 2,
      timeoutMs: 30000,
    };
    this.alertConfig = {
      enabled: true,
      latencyThresholdMs: 5000,
      errorRateThreshold: 0.05,
      capacityThresholdPercent: 80,
      healthStatusThreshold: 'degraded',
    };
  }

  configure(config: Partial<HealthCheckConfig & CircuitBreakerConfig & AlertConfig>): void {
    if (config.intervalMs !== undefined) this.config.intervalMs = config.intervalMs;
    if (config.timeoutMs !== undefined) this.config.timeoutMs = config.timeoutMs;
    if (config.enabled !== undefined) this.config.enabled = config.enabled;
    if (config.failureThreshold !== undefined) this.circuitBreakerConfig.failureThreshold = config.failureThreshold;
    if (config.successThreshold !== undefined) this.circuitBreakerConfig.successThreshold = config.successThreshold;
    if (config.timeoutMs !== undefined) this.circuitBreakerConfig.timeoutMs = config.timeoutMs;
    if (config.latencyThresholdMs !== undefined) this.alertConfig.latencyThresholdMs = config.latencyThresholdMs;
    if (config.errorRateThreshold !== undefined) this.alertConfig.errorRateThreshold = config.errorRateThreshold;
    if (config.capacityThresholdPercent !== undefined) this.alertConfig.capacityThresholdPercent = config.capacityThresholdPercent;
    if (config.healthStatusThreshold !== undefined) this.alertConfig.healthStatusThreshold = config.healthStatusThreshold;
  }

  start(): void {
    if (this.running || !this.config.enabled) {
      return;
    }

    this.running = true;
    this.interval = setInterval(() => this.checkAllHealth(), this.config.intervalMs);
    this.interval.unref();
    this.emit('started');
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.running = false;
    this.emit('stopped');
  }

  async checkAllHealth(): Promise<Map<string, StorageProviderHealth>> {
    const providers = this.registry.enumerate();
    const results = new Map<string, StorageProviderHealth>();

    await Promise.all(
      providers.map(async (reg) => {
        const previousHealth = this.registry.getHealth(reg.providerId);
        try {
          const health = await this.checkProviderHealth(reg);
          results.set(reg.providerId, health);
          this.recordHistory(reg.providerId, health);
          this.updateCircuitBreaker(reg.providerId, true);
          this.evaluateAlerts(reg.providerId, health);
          this.detectRecovery(reg.providerId, previousHealth, health);
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
          results.set(reg.providerId, health);
          this.recordHistory(reg.providerId, health);
          this.updateCircuitBreaker(reg.providerId, false);
          this.evaluateAlerts(reg.providerId, health);
          this.detectRecovery(reg.providerId, previousHealth, health);
        }
      })
    );

    this.registry.updateHealth(results);
    this.updateProviderRankings();
    this.emit('health:checked', results);
    return results;
  }

  async checkProviderHealth(reg: ProviderRegistration): Promise<StorageProviderHealth> {
    const provider = reg.provider;
    const startTime = Date.now();

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Health check timeout')), this.config.timeoutMs)
    );

    const healthPromise = provider.verifyStorageHealth();

    const health = await Promise.race([healthPromise, timeoutPromise]);
    const latencyMs = Date.now() - startTime;

    return {
      ...health,
      latencyMs,
      lastChecked: new Date().toISOString(),
    };
  }

  private recordHistory(providerId: string, health: StorageProviderHealth): void {
    if (!this.history.has(providerId)) {
      this.history.set(providerId, []);
    }

    const entries = this.history.get(providerId)!;
    entries.push({ providerId, timestamp: health.lastChecked, health });

    if (entries.length > this.maxHistorySize) {
      entries.shift();
    }
  }

  private updateCircuitBreaker(providerId: string, success: boolean): void {
    if (!this.circuitBreakerConfig.enabled) return;

    let state = this.circuitBreakers.get(providerId);
    if (!state) {
      state = {
        status: 'closed',
        failures: 0,
        successes: 0,
        lastFailure: 0,
        lastSuccess: 0,
      };
      this.circuitBreakers.set(providerId, state);
    }

    if (success) {
      state.failures = 0;
      state.successes++;
      state.lastSuccess = Date.now();

      if (state.status === 'half-open' && state.successes >= this.circuitBreakerConfig.successThreshold) {
        state.status = 'closed';
        state.successes = 0;
        this.emit('circuit:closed', { providerId });
      }
    } else {
      state.failures++;
      state.successes = 0;
      state.lastFailure = Date.now();

      if (state.status === 'closed' && state.failures >= this.circuitBreakerConfig.failureThreshold) {
        state.status = 'open';
        this.emit('circuit:opened', { providerId });
      } else if (state.status === 'half-open') {
        state.status = 'open';
        this.emit('circuit:reopened', { providerId });
      }
    }

    if (state.status === 'open' && Date.now() - state.lastFailure > this.circuitBreakerConfig.timeoutMs) {
      state.status = 'half-open';
      state.successes = 0;
      this.emit('circuit:half-open', { providerId });
    }
  }

  isCircuitOpen(providerId: string): boolean {
    const state = this.circuitBreakers.get(providerId);
    return state?.status === 'open';
  }

  getCircuitState(providerId: string): CircuitBreakerState | undefined {
    return this.circuitBreakers.get(providerId);
  }

  private evaluateAlerts(providerId: string, health: StorageProviderHealth): void {
    if (!this.alertConfig.enabled) return;

    const previousHealth = this.registry.getHealth(providerId);

    if (health.status === 'offline' || health.status === 'critical') {
      if (!previousHealth || previousHealth.status !== health.status) {
        this.createAlert({
          providerId,
          providerType: health.providerType as StorageProviderType,
          severity: health.status === 'critical' ? 'critical' : 'warning',
          type: 'status',
          message: `Provider ${providerId} status changed to ${health.status}`,
          metadata: { previousStatus: previousHealth?.status, currentStatus: health.status },
        });
      }
    }

    if (health.latencyMs > this.alertConfig.latencyThresholdMs) {
      this.createAlert({
        providerId,
        providerType: health.providerType as StorageProviderType,
        severity: 'warning',
        type: 'latency',
        message: `Provider ${providerId} latency ${health.latencyMs}ms exceeds threshold ${this.alertConfig.latencyThresholdMs}ms`,
        metadata: { latencyMs: health.latencyMs, thresholdMs: this.alertConfig.latencyThresholdMs },
      });
    }

    if (health.errorRate !== undefined && health.errorRate > this.alertConfig.errorRateThreshold) {
      this.createAlert({
        providerId,
        providerType: health.providerType as StorageProviderType,
        severity: 'warning',
        type: 'error_rate',
        message: `Provider ${providerId} error rate ${(health.errorRate * 100).toFixed(2)}% exceeds threshold ${(this.alertConfig.errorRateThreshold * 100).toFixed(2)}%`,
        metadata: { errorRate: health.errorRate, threshold: this.alertConfig.errorRateThreshold },
      });
    }

    if (health.totalCapacityBytes && health.totalCapacityBytes > 0) {
      const capacityPercent = (health.usedCapacityBytes / health.totalCapacityBytes) * 100;
      if (capacityPercent > this.alertConfig.capacityThresholdPercent) {
        this.createAlert({
          providerId,
          providerType: health.providerType as StorageProviderType,
          severity: 'warning',
          type: 'capacity',
          message: `Provider ${providerId} capacity ${capacityPercent.toFixed(1)}% exceeds threshold ${this.alertConfig.capacityThresholdPercent}%`,
          metadata: { capacityPercent, thresholdPercent: this.alertConfig.capacityThresholdPercent },
        });
      }
    }

    if (previousHealth && previousHealth.status === 'offline' && health.status !== 'offline') {
      this.createAlert({
        providerId,
        providerType: health.providerType as StorageProviderType,
        severity: 'info',
        type: 'recovered',
        message: `Provider ${providerId} recovered from offline to ${health.status}`,
        metadata: { previousStatus: previousHealth.status, currentStatus: health.status },
      });
    }
  }

  private createAlert(alert: Omit<HealthAlert, 'id' | 'timestamp' | 'acknowledged'>): void {
    const fullAlert: HealthAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    };

    this.alerts.push(fullAlert);
    if (this.alerts.length > this.maxAlertsSize) {
      this.alerts.shift();
    }

    this.emit('alert', fullAlert);
  }

  getAlerts(providerId?: string, unacknowledgedOnly = false): HealthAlert[] {
    let filtered = this.alerts;
    if (providerId) {
      filtered = filtered.filter(a => a.providerId === providerId);
    }
    if (unacknowledgedOnly) {
      filtered = filtered.filter(a => !a.acknowledged);
    }
    return [...filtered].reverse();
  }

  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      this.emit('alert:acknowledged', alert);
      return true;
    }
    return false;
  }

  getHealthHistory(providerId: string, limit?: number): HealthHistoryEntry[] {
    const entries = this.history.get(providerId) || [];
    return limit ? entries.slice(-limit) : [...entries];
  }

  getHealthStats(providerId: string): HealthStats | null {
    const entries = this.history.get(providerId);
    if (!entries || entries.length === 0) {
      return null;
    }

    const currentHealth = entries[entries.length - 1].health;
    const totalChecks = entries.length;
    const failedChecks = entries.filter(e => e.health.status === 'offline' || e.health.status === 'critical').length;
    const uptimePercent = ((totalChecks - failedChecks) / totalChecks) * 100;

    const latencies = entries.map(e => e.health.latencyMs).filter(l => l > 0);
    latencies.sort((a, b) => a - b);
    
    const averageLatencyMs = latencies.length > 0
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : 0;

    const p50LatencyMs = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.5)] : 0;
    const p95LatencyMs = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.95)] : 0;
    const p99LatencyMs = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.99)] : 0;

    const errorRate = failedChecks / totalChecks;

    const health = this.registry.getHealth(providerId);
    const throughputMbps = (health?.throughputBytesPerSec || 0) / (1024 * 1024) * 8;
    const availability99 = uptimePercent;

    const statusHistory: { status: string; timestamp: string }[] = [];
    let lastStatus = '';
    for (const entry of entries) {
      if (entry.health.status !== lastStatus) {
        statusHistory.push({ status: entry.health.status, timestamp: entry.timestamp });
        lastStatus = entry.health.status;
      }
    }

    const lastStatusChange = statusHistory.length > 0 ? statusHistory[statusHistory.length - 1].timestamp : entries[0].timestamp;

    return {
      providerId,
      currentStatus: currentHealth.status,
      uptimePercent,
      averageLatencyMs,
      errorRate,
      totalChecks,
      failedChecks,
      lastStatusChange,
      statusHistory,
      p50LatencyMs,
      p95LatencyMs,
      p99LatencyMs,
      throughputMbps,
      availability99,
    };
  }

  getAllHealthStats(): Map<string, HealthStats> {
    const stats = new Map<string, HealthStats>();
    for (const providerId of this.history.keys()) {
      const s = this.getHealthStats(providerId);
      if (s) stats.set(providerId, s);
    }
    return stats;
  }

  getProviderRankings(): ProviderRanking[] {
    return Array.from(this.providerRankings.values())
      .sort((a, b) => a.rank - b.rank);
  }

  getRecoveryEvents(limit?: number): RecoveryEvent[] {
    const events = [...this.recoveryEvents].reverse();
    return limit ? events.slice(0, limit) : events;
  }

  getAggregatedMetrics(): {
    totalProviders: number;
    healthyCount: number;
    degradedCount: number;
    criticalCount: number;
    offlineCount: number;
    averageLatencyMs: number;
    totalThroughputMbps: number;
    overallAvailability: number;
    openCircuits: number;
  } {
    const providers = this.registry.enumerate();
    let healthyCount = 0, degradedCount = 0, criticalCount = 0, offlineCount = 0;
    let totalLatency = 0, validLatencyCount = 0;
    let totalThroughput = 0;
    let openCircuits = 0;

    for (const provider of providers) {
      const health = this.registry.getHealth(provider.providerId);
      if (health) {
        switch (health.status) {
          case 'healthy': healthyCount++; break;
          case 'degraded': degradedCount++; break;
          case 'critical': criticalCount++; break;
          case 'offline': offlineCount++; break;
        }
        if (health.latencyMs > 0) {
          totalLatency += health.latencyMs;
          validLatencyCount++;
        }
        totalThroughput += health.throughputBytesPerSec || 0;
      }
      if (this.isCircuitOpen(provider.providerId)) {
        openCircuits++;
      }
    }

    const totalChecks = providers.length;
    const overallAvailability = totalChecks > 0 ? ((healthyCount + degradedCount) / totalChecks) * 100 : 0;

    return {
      totalProviders: totalChecks,
      healthyCount,
      degradedCount,
      criticalCount,
      offlineCount,
      averageLatencyMs: validLatencyCount > 0 ? totalLatency / validLatencyCount : 0,
      totalThroughputMbps: (totalThroughput / (1024 * 1024)) * 8,
      overallAvailability,
      openCircuits,
    };
  }

  private computeProviderRankings(): void {
    const providers = this.registry.enumerate();
    const statsMap = new Map<string, HealthStats>();

    for (const provider of providers) {
      const stats = this.getHealthStats(provider.providerId);
      if (stats) {
        statsMap.set(provider.providerId, stats);
      }
    }

    const rankedProviders = Array.from(statsMap.entries())
      .map(([providerId, stats]) => {
        const health = this.registry.getHealth(providerId);
        const provider = providers.find(p => p.providerId === providerId);
        
        const latencyScore = this.calculateLatencyScore(stats.averageLatencyMs);
        const availabilityScore = stats.uptimePercent;
        const errorRateScore = Math.max(0, 100 - (stats.errorRate * 100));
        const capacityScore = health?.totalCapacityBytes && health.totalCapacityBytes > 0
          ? 100 - ((health.usedCapacityBytes / health.totalCapacityBytes) * 100)
          : 50;

        const score = (
          latencyScore * 0.3 +
          availabilityScore * 0.3 +
          errorRateScore * 0.2 +
          capacityScore * 0.2
        );

        return { providerId, providerType: provider?.providerType || 'unknown', stats, score, latencyScore, availabilityScore, errorRateScore, capacityScore };
      })
      .sort((a, b) => b.score - a.score);

    rankedProviders.forEach((item, index) => {
      const ranking: ProviderRanking = {
        providerId: item.providerId,
        providerType: item.providerType,
        rank: index + 1,
        score: item.score,
        latencyScore: item.latencyScore,
        availabilityScore: item.availabilityScore,
        errorRateScore: item.errorRateScore,
        capacityScore: item.capacityScore,
        lastUpdated: new Date().toISOString(),
      };
      this.providerRankings.set(item.providerId, ranking);
    });
  }

  private calculateLatencyScore(latencyMs: number): number {
    if (latencyMs <= 10) return 100;
    if (latencyMs <= 50) return 90;
    if (latencyMs <= 100) return 80;
    if (latencyMs <= 200) return 70;
    if (latencyMs <= 500) return 50;
    if (latencyMs <= 1000) return 30;
    if (latencyMs <= 5000) return 10;
    return 0;
  }

  private detectRecovery(providerId: string, previousHealth: StorageProviderHealth | undefined, currentHealth: StorageProviderHealth): void {
    if (!previousHealth) return;

    const wasUnhealthy = previousHealth.status === 'offline' || previousHealth.status === 'critical';
    const isHealthy = currentHealth.status === 'healthy' || currentHealth.status === 'degraded';

    if (wasUnhealthy && isHealthy) {
      const recoveryEvent: RecoveryEvent = {
        providerId,
        previousStatus: previousHealth.status,
        currentStatus: currentHealth.status,
        recoveredAt: new Date().toISOString(),
        durationMs: this.calculateDowntimeDuration(providerId, previousHealth.status),
      };

      this.recoveryEvents.push(recoveryEvent);
      if (this.recoveryEvents.length > this.maxRecoveryEvents) {
        this.recoveryEvents.shift();
      }

      this.emit('recovery:detected', recoveryEvent);
    }
  }

  private calculateDowntimeDuration(providerId: string, fromStatus: string): number {
    const entries = this.history.get(providerId) || [];
    let startTime = Date.now();
    
    for (let i = entries.length - 1; i >= 0; i--) {
      if (entries[i].health.status !== fromStatus) {
        startTime = new Date(entries[i].timestamp).getTime();
        break;
      }
    }
    
    return Date.now() - startTime;
  }

  private updateProviderRankings(): void {
    this.computeProviderRankings();
    this.emit('rankings:updated', this.getProviderRankings());
  }

  getProvidersByStatus(status: 'healthy' | 'degraded' | 'critical' | 'offline'): string[] {
    const providers = this.registry.enumerate();
    return providers
      .filter(p => {
        const health = this.registry.getHealth(p.providerId);
        return health?.status === status;
      })
      .map(p => p.providerId);
  }

  isProviderAvailable(providerId: string): boolean {
    if (this.isCircuitOpen(providerId)) {
      return false;
    }
    const health = this.registry.getHealth(providerId);
    return health?.status === 'healthy' || health?.status === 'degraded';
  }

  getAvailableProviders(): ProviderRegistration[] {
    return this.registry.enumerate().filter(reg => this.isProviderAvailable(reg.providerId));
  }

  async forceHealthCheck(providerId: string): Promise<StorageProviderHealth> {
    const providers = this.registry.enumerate();
    const reg = providers.find(p => p.providerId === providerId);
    if (!reg) {
      throw new Error(`Provider not found: ${providerId}`);
    }
    const health = await this.checkProviderHealth(reg);
    this.recordHistory(providerId, health);
    this.updateCircuitBreaker(providerId, health.status !== 'offline');
    this.evaluateAlerts(providerId, health);
    this.registry.updateHealth(providerId, health);
    return health;
  }

  clearHistory(providerId?: string): void {
    if (providerId) {
      this.history.delete(providerId);
    } else {
      this.history.clear();
    }
  }

  clearAlerts(providerId?: string): void {
    if (providerId) {
      this.alerts = this.alerts.filter(a => a.providerId !== providerId);
    } else {
      this.alerts = [];
    }
  }

  isRunning(): boolean {
    return this.running;
  }

  getConfig(): { healthCheck: HealthCheckConfig; circuitBreaker: CircuitBreakerConfig; alert: AlertConfig } {
    return {
      healthCheck: { ...this.config },
      circuitBreaker: { ...this.circuitBreakerConfig },
      alert: { ...this.alertConfig },
    };
  }
}

interface CircuitBreakerState {
  status: 'closed' | 'open' | 'half-open';
  failures: number;
  successes: number;
  lastFailure: number;
  lastSuccess: number;
}

export const healthMonitoring = new HealthMonitoringEngine();