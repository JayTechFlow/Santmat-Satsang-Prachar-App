import { useState, useEffect, useCallback } from 'react';
import { supportService } from '../services/supportService';
import { ObservabilityService } from '../../observability/services/observabilityService';
import type { SupportTicket, CreateSupportTicketDto } from '../types/support.types';
import type { ComponentHealthStatus, OperationalAlert } from '../../../../../backend/observability/Models/ObservabilityModels';
import { useToast } from '../../../hooks/useToast';

export function useSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [healthStatus, setHealthStatus] = useState<ComponentHealthStatus[]>([]);
  const [alerts, setAlerts] = useState<OperationalAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { showToast } = useToast();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [ticketsData, alertsData, metricsData] = await Promise.all([
        supportService.getAll(),
        ObservabilityService.fetchAlerts(),
        ObservabilityService.fetchLatestMetrics(),
      ]);
      setTickets(ticketsData);
      setAlerts(alertsData);
      setHealthStatus(metricsData ? ObservabilityService.deriveComponentHealth(metricsData) : []);
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to load support operations');
      setError(e);
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createTicket = async (dto: CreateSupportTicketDto): Promise<SupportTicket | null> => {
    try {
      const timestamp = new Date().toISOString();
      const payload: SupportTicket = {
        id: `ticket-${Date.now()}`,
        ...dto,
        status: 'open',
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      const newTicket = await supportService.create(payload);
      setTickets((prev) => [newTicket, ...prev]);
      showToast('Support ticket submitted successfully', 'success');
      return newTicket;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit ticket';
      showToast(msg, 'error');
      return null;
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const acknowledged = await ObservabilityService.acknowledgeAlert(alertId);
      if (!acknowledged) {
        showToast('Failed to acknowledge alert', 'error');
        return;
      }
      setAlerts((prev) => prev.map((a) => (a.alertId === alertId ? { ...a, acknowledged: true } : a)));
      showToast('Alert acknowledged', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to acknowledge alert';
      showToast(msg, 'error');
    }
  };

  return {
    tickets,
    healthStatus,
    alerts,
    loading,
    error,
    refetch: loadData,
    createTicket,
    acknowledgeAlert: handleAcknowledgeAlert,
  };
}
