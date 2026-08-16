import React, { useState } from 'react';
import { PageContainer } from '../components/ui/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { DataTable } from '../components/ui/DataTable';
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { useSupport } from '../features/support/hooks/useSupport';
import { usePermissions } from '../core/auth/PermissionContext';
import type { SupportTicket, CreateSupportTicketDto } from '../features/support/types/support.types';
import { Activity, ShieldCheck, LifeBuoy, AlertTriangle, Plus, CheckCircle } from 'lucide-react';

export function Support() {
  const { tickets, healthStatus, alerts, loading, error, refetch, createTicket, acknowledgeAlert } = useSupport();
  const { context } = usePermissions();

  const [activeTab, setActiveTab] = useState('health');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New ticket form state
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<CreateSupportTicketDto['category']>('general');
  const [priority, setPriority] = useState<CreateSupportTicketDto['priority']>('medium');
  const [message, setMessage] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    const created = await createTicket({
      subject,
      category,
      priority,
      message,
      submittedBy: context?.role || 'developer_super_admin',
      contactEmail: contactEmail || 'admin@santmatsatsang.org',
    });

    if (created) {
      setSubject('');
      setMessage('');
      setIsModalOpen(false);
    }
  };

  const ticketColumns = [
    {
      key: 'subject',
      header: 'Subject & Info',
      render: (t: SupportTicket) => (
        <div>
          <div className="font-semibold text-foreground">{t.subject}</div>
          <div className="text-xs text-muted max-w-sm truncate">{t.message}</div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (t: SupportTicket) => <span className="badge badge-neutral">{t.category.toUpperCase()}</span>,
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (t: SupportTicket) => (
        <span
          className={`badge ${
            t.priority === 'urgent' || t.priority === 'high' ? 'badge-danger' : t.priority === 'medium' ? 'badge-warning' : 'badge-neutral'
          }`}
        >
          {t.priority.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (t: SupportTicket) => (
        <span
          className={`badge ${
            t.status === 'resolved' ? 'badge-success' : t.status === 'in_progress' ? 'badge-primary' : 'badge-warning'
          }`}
        >
          {t.status.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'submittedBy',
      header: 'Submitted By',
      render: (t: SupportTicket) => <span className="text-xs font-mono">{t.submittedBy}</span>,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="System Operations & Support Desk"
        subtitle="Live telemetry metrics, system health, operational alerts, and support tickets."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'System Support', path: '/support' },
        ]}
        actions={
          <button
            type="button"
            className="btn btn-primary flex items-center space-x-2"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Create Support Ticket</span>
          </button>
        }
      />

      <TabsRoot defaultValue="health" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="health" className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-success" />
            <span>System Health & Telemetry</span>
          </TabsTrigger>

          <TabsTrigger value="alerts" className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span>Operational Alerts ({alerts.filter((a) => !a.acknowledged).length})</span>
          </TabsTrigger>

          <TabsTrigger value="tickets" className="flex items-center space-x-2">
            <LifeBuoy className="w-4 h-4 text-primary" />
            <span>Support Tickets ({tickets.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health">
          {loading && <LoadingState variant="page" message="Checking system health telemetry..." />}

          {error && !loading && (
            <ErrorState
              title="Telemetry Service Offline"
              message={error.message}
              onRetry={refetch}
            />
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {healthStatus.map((status) => (
                <div key={status.componentName} className="card p-6 border-l-4 border-l-primary flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-base">{status.componentName}</h3>
                      <span
                        className={`badge ${
                          status.status === 'healthy' ? 'badge-success' : status.status === 'warning' ? 'badge-warning' : 'badge-danger'
                        }`}
                      >
                        {status.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-muted mb-4">{status.message || 'All systems functioning normally.'}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted border-t pt-3">
                    <span>Last Checked:</span>
                    <span className="font-mono">{new Date(status.lastChecked).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="alerts">
          <div className="card p-6">
            <h2 className="text-lg font-bold mb-4">Operational Telemetry Alerts</h2>
            {alerts.length === 0 ? (
              <EmptyState
                title="Zero Active Alerts"
                message="No system anomalies or telemetry warnings detected."
              />
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.alertId}
                    className={`flex items-center justify-between p-4 border rounded ${
                      alert.severity === 'critical' || alert.severity === 'error' ? 'bg-danger/5 border-danger' : 'bg-warning/5 border-warning'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className={`w-5 h-5 ${alert.severity === 'critical' || alert.severity === 'error' ? 'text-danger' : 'text-warning'}`} />
                      <div>
                        <div className="font-semibold text-sm">{alert.message}</div>
                        <div className="text-xs text-muted">
                          Component: <span className="font-mono">{alert.component}</span> • Timestamp: {alert.timestamp}
                        </div>
                      </div>
                    </div>
                    {!alert.acknowledged ? (
                      <button
                        type="button"
                        onClick={() => acknowledgeAlert(alert.alertId)}
                        className="btn btn-secondary btn-sm flex items-center space-x-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Acknowledge</span>
                      </button>
                    ) : (
                      <span className="badge badge-neutral">ACKNOWLEDGED</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tickets">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Support Tickets</h2>
              <button
                type="button"
                className="btn btn-primary btn-sm flex items-center space-x-1"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="w-4 h-4" />
                <span>New Ticket</span>
              </button>
            </div>

            {tickets.length === 0 ? (
              <EmptyState
                title="No Support Tickets"
                message="All support queries and feedback items will appear here."
                action={
                  <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
                    Create Ticket
                  </button>
                }
              />
            ) : (
              <DataTable
                data={tickets}
                columns={ticketColumns}
                keyExtractor={(t) => t.id}
              />
            )}
          </div>
        </TabsContent>
      </TabsRoot>

      {/* New Support Ticket Modal */}
      {isModalOpen && (
        <div className="dialog-backdrop flex items-center justify-center p-4 z-50">
          <div className="dialog-content card max-w-lg w-full p-6">
            <div className="flex items-center space-x-2 mb-4">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">Submit Support Ticket</h2>
            </div>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="form-label">Subject *</label>
                <input
                  type="text"
                  required
                  className="input w-full"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Media upload pipeline issue"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Category</label>
                  <select
                    className="input w-full"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CreateSupportTicketDto['category'])}
                  >
                    <option value="general">General Query</option>
                    <option value="bug">System Bug</option>
                    <option value="feature_request">Feature Request</option>
                    <option value="content_issue">Content Issue</option>
                    <option value="account_access">Account Access</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Priority</label>
                  <select
                    className="input w-full"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as CreateSupportTicketDto['priority'])}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Contact Email</label>
                <input
                  type="email"
                  className="input w-full"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="admin@santmatsatsang.org"
                />
              </div>

              <div>
                <label className="form-label">Detailed Message *</label>
                <textarea
                  required
                  className="input w-full min-h-[100px]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe the issue or request in detail..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}