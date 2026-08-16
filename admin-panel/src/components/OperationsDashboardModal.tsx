// Sprint M6.10 — Enterprise Operations & Observability Dashboard Modal Component

import { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Cpu, Database, RefreshCw, Server, X } from 'lucide-react';
import { useObservabilityMetrics } from '../features/observability/hooks/useObservabilityMetrics';
import { ObservabilityService } from '../features/observability/services/observabilityService';
import type { ComponentHealthStatus } from '../../../backend/observability/Models/ObservabilityModels';

interface OperationsDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const healthColor: Record<string, string> = {
  healthy: 'var(--success)',
  warning: 'var(--warning)',
  critical: 'var(--danger)',
  offline: 'var(--text-muted)',
};

const severityColor: Record<string, string> = {
  info: 'var(--info)',
  warning: 'var(--warning)',
  error: 'var(--danger)',
  critical: 'var(--danger)',
};

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${bytes} B`;
}

export function OperationsDashboardModal({ isOpen, onClose }: OperationsDashboardModalProps) {
  const [activeTab, setActiveTab] = useState<'metrics' | 'health' | 'alerts'>('metrics');
  const { snapshot, healthStatuses, alerts, loading, error, refreshData } = useObservabilityMetrics();

  if (!isOpen) return null;

  const acknowledgedCount = alerts.filter(a => a.acknowledged).length;

  const handleAcknowledge = async (alertId: string) => {
    const acknowledged = await ObservabilityService.acknowledgeAlert(alertId);
    if (acknowledged) {
      refreshData();
    }
  };

  const renderHealthBadge = (status: string) => (
    <span className="badge" style={{ fontSize: '0.75rem', color: healthColor[status] || 'var(--text-muted)', border: `1px solid ${healthColor[status] || 'var(--border)'}40`, background: 'var(--background)' }}>
      <CheckCircle2 size={12} /> {status.toUpperCase()}
    </span>
  );

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div className="modal-content" style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 950, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Activity size={22} color="var(--primary)" />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Operations &amp; Observability Console</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Sprint M6.10 — Upload, Queue, AI, Storage, Error &amp; Worker Metrics
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn btn-ghost" onClick={refreshData} title="Refresh metrics" style={{ padding: 6 }}>
              <RefreshCw size={18} />
            </button>
            <button className="btn btn-ghost" onClick={onClose} style={{ padding: 6 }}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--background)' }}>
          {([['metrics', 'Metrics'], ['health', `Component Health (${healthStatuses.length})`], ['alerts', `Alerts (${alerts.length - acknowledgedCount} active)`]] as const).map(([tab, label]) => (
            <button
              key={tab}
              className={`btn btn-ghost ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              style={{ borderRadius: 0, borderBottom: activeTab === tab ? '2px solid var(--primary)' : 'none', color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)' }}
            >
              {tab === 'alerts' ? <AlertTriangle size={16} /> : <Cpu size={16} />}
              {label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <span className="spinner" aria-hidden="true" />
              <p style={{ fontSize: '0.85rem', marginTop: 8 }}>Loading observability metrics...</p>
            </div>
          )}

          {!loading && error && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--danger)' }}>
              <AlertTriangle size={40} style={{ marginBottom: 12 }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Failed to load metrics</h4>
              <p style={{ fontSize: '0.85rem' }}>{error}</p>
            </div>
          )}

          {!loading && !error && !snapshot && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <Database size={40} style={{ marginBottom: 12 }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>No observability data available</h4>
              <p style={{ fontSize: '0.85rem' }}>No backend metrics have been recorded yet. Real metrics will appear here once the system reports telemetry snapshots.</p>
            </div>
          )}

          {!loading && !error && activeTab === 'metrics' && snapshot && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                <div style={{ background: 'var(--background)', padding: 16, borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overall Health</span>
                  <h4 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '4px 0 0 0', color: healthColor[snapshot.overallHealth] || 'var(--text-muted)' }}>{snapshot.overallHealth.toUpperCase()}</h4>
                </div>
                <div style={{ background: 'var(--background)', padding: 16, borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>System SLA</span>
                  <h4 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '4px 0 0 0', color: 'var(--success)' }}>{snapshot.systemSlaPercentage.toFixed(2)}%</h4>
                </div>
                <div style={{ background: 'var(--background)', padding: 16, borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Uploads</span>
                  <h4 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '4px 0 0 0' }}>{snapshot.upload.totalUploads}</h4>
                </div>
                <div style={{ background: 'var(--background)', padding: 16, borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Queue Depth</span>
                  <h4 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '4px 0 0 0' }}>{snapshot.queue.queueLength}</h4>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16, background: 'var(--surface)' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}><Server size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Upload Pipeline</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.8, margin: 0 }}>
                    Active: <strong>{snapshot.upload.activeUploads}</strong> | Successful: <strong>{snapshot.upload.successfulUploads}</strong> | Failed: <strong>{snapshot.upload.failedUploads}</strong><br />
                    Error Rate: <strong>{snapshot.upload.uploadErrorRatePercentage.toFixed(2)}%</strong> | Throughput: <strong>{formatBytes(snapshot.upload.totalBytesUploaded)}</strong>
                  </p>
                </div>
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16, background: 'var(--surface)' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}><Cpu size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Queue Engine</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.8, margin: 0 }}>
                    Pending: <strong>{snapshot.queue.pendingJobs}</strong> | Processing: <strong>{snapshot.queue.processingJobs}</strong> | Completed: <strong>{snapshot.queue.completedJobs}</strong><br />
                    Failed: <strong>{snapshot.queue.failedJobs}</strong> | DLQ: <strong>{snapshot.queue.deadLetterCount}</strong> | Throughput: <strong>{snapshot.queue.throughputPerMinute}/min</strong>
                  </p>
                </div>
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16, background: 'var(--surface)' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}><Database size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Storage Backend</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.8, margin: 0 }}>
                    Objects: <strong>{snapshot.storage.totalObjectsCount}</strong> | Consumed: <strong>{formatBytes(snapshot.storage.storageConsumedBytes)}</strong><br />
                    Reads: <strong>{snapshot.storage.readOperationsCount}</strong> | Writes: <strong>{snapshot.storage.writeOperationsCount}</strong> | Quota: <strong>{snapshot.storage.quotaUsagePercentage.toFixed(2)}%</strong>
                  </p>
                </div>
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16, background: 'var(--surface)' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}><Activity size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />AI Engine</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.8, margin: 0 }}>
                    Inferences: <strong>{snapshot.ai.totalInferences}</strong> | Avg Latency: <strong>{snapshot.ai.averageLatencyMs.toFixed(1)} ms</strong><br />
                    Success: <strong>{snapshot.ai.aiSuccessRatePercentage.toFixed(2)}%</strong> | Models: <strong>{snapshot.ai.activeModelsCount}</strong> | Est. Cost: <strong>${snapshot.ai.estimatedCostUSD.toFixed(2)}</strong>
                  </p>
                </div>
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16, background: 'var(--surface)' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}><AlertTriangle size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Error Monitor</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.8, margin: 0 }}>
                    Total Errors: <strong>{snapshot.error.totalErrors}</strong> | Unhandled: <strong>{snapshot.error.unhandledExceptionsCount}</strong><br />
                    Critical Alerts: <strong>{snapshot.error.criticalAlertsCount}</strong> | Error Rate: <strong>{snapshot.error.errorRatePercentage.toFixed(2)}%</strong>
                  </p>
                </div>
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16, background: 'var(--surface)' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}><Cpu size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Worker Pool</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.8, margin: 0 }}>
                    Active: <strong>{snapshot.worker.activeWorkersCount}</strong> / <strong>{snapshot.worker.totalWorkersCount}</strong> | Utilization: <strong>{snapshot.worker.workerUtilizationPercentage.toFixed(1)}%</strong><br />
                    Avg Execution: <strong>{snapshot.worker.avgExecutionTimeMs.toFixed(1)} ms</strong> | Crashes: <strong>{snapshot.worker.workerCrashCount}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && activeTab === 'health' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {healthStatuses.length === 0 && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No component health data available.</p>
              )}
              {healthStatuses.map((h: ComponentHealthStatus) => (
                <div key={h.componentName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: 'var(--background)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>{h.componentName}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{h.message} | Last checked: {h.lastChecked}</span>
                  </div>
                  {renderHealthBadge(h.status)}
                </div>
              ))}
            </div>
          )}

          {!loading && !error && activeTab === 'alerts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {alerts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <CheckCircle2 size={40} color="var(--success)" style={{ marginBottom: 12 }} />
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>No Operational Alerts</h4>
                  <p style={{ fontSize: '0.85rem' }}>All systems nominal.</p>
                </div>
              )}
              {alerts.map(a => (
                <div key={a.alertId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: 'var(--background)', borderRadius: 'var(--radius-md)', opacity: a.acknowledged ? 0.6 : 1 }}>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>
                      {a.ruleName}
                      <span className="badge" style={{ marginLeft: 8, fontSize: '0.7rem', color: severityColor[a.severity] || 'var(--text-muted)', border: `1px solid ${severityColor[a.severity] || 'var(--border)'}40` }}>
                        {a.severity.toUpperCase()}
                      </span>
                      {a.acknowledged && <span className="badge" style={{ marginLeft: 8, fontSize: '0.7rem' }}>ACKNOWLEDGED</span>}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.component} | {a.message} | {a.timestamp}</span>
                  </div>
                  {!a.acknowledged && (
                    <button className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => handleAcknowledge(a.alertId)}>
                      Acknowledge
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--background)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {snapshot ? `Last updated: ${new Date(snapshot.timestamp).toLocaleString()}` : 'No metrics loaded'}
          </span>
          <button className="btn btn-primary" onClick={onClose}>Close Operations Console</button>
        </div>
      </div>
    </div>
  );
}