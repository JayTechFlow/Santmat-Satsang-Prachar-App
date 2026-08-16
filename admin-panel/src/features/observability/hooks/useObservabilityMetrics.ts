// Sprint M6.10 — Enterprise Observability React Hook
// RECOVERY: consumes only real backend observability data (no simulated
// fallbacks). Provides loading / success / error / refresh / cleanup with a
// single polling interval, an in-flight guard, and no duplicate subscriptions.

import { useState, useEffect, useCallback, useRef } from 'react';
import { ObservabilityService } from '../services/observabilityService';
import type {
  ObservabilitySnapshot,
  ComponentHealthStatus,
  OperationalAlert,
} from '../../../../../backend/observability/Models/ObservabilityModels';

export function useObservabilityMetrics(refreshIntervalMs = 10000) {
  const [snapshot, setSnapshot] = useState<ObservabilitySnapshot | null>(null);
  const [healthStatuses, setHealthStatuses] = useState<ComponentHealthStatus[]>([]);
  const [alerts, setAlerts] = useState<OperationalAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  const refreshData = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    try {
      const [metricsRes, alertsRes] = await Promise.allSettled([
        ObservabilityService.fetchLatestMetrics(),
        ObservabilityService.fetchAlerts(),
      ]);

      const latestMetrics = metricsRes.status === 'fulfilled' ? metricsRes.value : null;
      const latestAlerts = alertsRes.status === 'fulfilled' ? alertsRes.value : [];

      setSnapshot(latestMetrics);
      setHealthStatuses(latestMetrics ? ObservabilityService.deriveComponentHealth(latestMetrics) : []);
      setAlerts(latestAlerts);
      setError(latestMetrics ? null : 'Observability data is currently unavailable.');
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, refreshIntervalMs);
    return () => clearInterval(interval);
  }, [refreshData, refreshIntervalMs]);

  return { snapshot, healthStatuses, alerts, loading, error, refreshData };
}
