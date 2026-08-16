import React, { useState, useEffect } from 'react';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { useSettings } from '../features/settings/hooks/useSettings';
import { usePermissions } from '../core/auth/PermissionContext';
import { Save, ShieldAlert, Sliders, Server, Bell } from 'lucide-react';

export function Settings() {
  const { settings, loading, error, refetch, updateSettings } = useSettings();
  const { context } = usePermissions();

  const [formState, setFormState] = useState({
    appName: '',
    contactEmail: '',
    maintenanceMode: false,
    maxAudioSizeMb: 100,
    maxPdfSizeMb: 50,
    maxBannersCount: 10,
    enableAudioStreaming: true,
    enableBookDownloads: true,
    enableAiRecommendations: true,
    enableNotifications: true,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormState({
        appName: settings.appName || 'Santmat Satsang Prachar',
        contactEmail: settings.contactEmail || 'support@santmatsatsang.org',
        maintenanceMode: settings.maintenanceMode || false,
        maxAudioSizeMb: settings.maxAudioSizeMb || 100,
        maxPdfSizeMb: settings.maxPdfSizeMb || 50,
        maxBannersCount: settings.maxBannersCount || 10,
        enableAudioStreaming: settings.enableAudioStreaming ?? true,
        enableBookDownloads: settings.enableBookDownloads ?? true,
        enableAiRecommendations: settings.enableAiRecommendations ?? true,
        enableNotifications: settings.enableNotifications ?? true,
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateSettings(formState, context?.role || 'developer_super_admin');
    setSaving(false);
  };

  return (
    <div className="p-6 space-y-6 font-['Mukta'] bg-[#FAF8F5] min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="font-extrabold text-xl text-stone-900 leading-tight">
            ऐप एवं सुरक्षा सेटिंग्स (App & Security Settings)
          </h1>
          <p className="text-xs text-stone-600 font-medium">
            सिस्टम पैरामीटर, स्टोरेज सीमाएँ, सुरक्षा नीतियाँ एवं बैकअप नियंत्रण
          </p>
        </div>
      </div>

      {loading && <LoadingState variant="page" message="सिस्टम सेटिंग्स लोड हो रही हैं..." />}

      {error && !loading && (
        <ErrorState
          title="सेटिंग्स लोड करने में विफलता"
          message={error.message}
          onRetry={refetch}
        />
      )}

      {!loading && !error && (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
          {/* General Branding & Information */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 mb-2 border-b border-stone-100 pb-3">
              <Sliders className="w-5 h-5 text-orange-600" />
              <h2 className="text-base font-bold text-stone-900">सामान्य प्लेटफॉर्म जानकारी</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label font-semibold">Application Name *</label>
                <input
                  type="text"
                  required
                  className="input w-full"
                  value={formState.appName}
                  onChange={(e) => setFormState({ ...formState, appName: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label font-semibold">Support Contact Email *</label>
                <input
                  type="email"
                  required
                  className="input w-full"
                  value={formState.contactEmail}
                  onChange={(e) => setFormState({ ...formState, contactEmail: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Maintenance Mode & Health */}
          <div className={`card p-6 border-l-4 ${formState.maintenanceMode ? 'border-danger bg-danger/5' : 'border-success'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ShieldAlert className={`w-6 h-6 ${formState.maintenanceMode ? 'text-danger' : 'text-success'}`} />
                <div>
                  <h2 className="text-lg font-bold">Maintenance Mode</h2>
                  <p className="text-xs text-muted">
                    When active, mobile client access will display a maintenance warning.
                  </p>
                </div>
              </div>
              <label className="flex items-center cursor-pointer space-x-3">
                <span className="text-sm font-semibold">
                  {formState.maintenanceMode ? 'ACTIVE' : 'INACTIVE'}
                </span>
                <input
                  type="checkbox"
                  className="toggle"
                  checked={formState.maintenanceMode}
                  onChange={(e) => setFormState({ ...formState, maintenanceMode: e.target.checked })}
                />
              </label>
            </div>
          </div>

          {/* Upload Limits & Constraints */}
          <div className="card p-6">
            <div className="flex items-center space-x-3 mb-4 border-b pb-3">
              <Server className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Upload & Storage Constraints</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label text-xs">Max Audio Size (MB)</label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  className="input w-full"
                  value={formState.maxAudioSizeMb}
                  onChange={(e) => setFormState({ ...formState, maxAudioSizeMb: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="form-label text-xs">Max Book PDF Size (MB)</label>
                <input
                  type="number"
                  min="5"
                  max="200"
                  className="input w-full"
                  value={formState.maxPdfSizeMb}
                  onChange={(e) => setFormState({ ...formState, maxPdfSizeMb: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="form-label text-xs">Max Active Banners</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  className="input w-full"
                  value={formState.maxBannersCount}
                  onChange={(e) => setFormState({ ...formState, maxBannersCount: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* Feature Flags */}
          <div className="card p-6">
            <div className="flex items-center space-x-3 mb-4 border-b pb-3">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Global Feature Toggles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center justify-between p-3 border rounded">
                <span className="text-sm font-medium">Audio Streaming</span>
                <input
                  type="checkbox"
                  checked={formState.enableAudioStreaming}
                  onChange={(e) => setFormState({ ...formState, enableAudioStreaming: e.target.checked })}
                />
              </label>

              <label className="flex items-center justify-between p-3 border rounded">
                <span className="text-sm font-medium">Book PDF Downloads</span>
                <input
                  type="checkbox"
                  checked={formState.enableBookDownloads}
                  onChange={(e) => setFormState({ ...formState, enableBookDownloads: e.target.checked })}
                />
              </label>

              <label className="flex items-center justify-between p-3 border rounded">
                <span className="text-sm font-medium">AI Recommendations Engine</span>
                <input
                  type="checkbox"
                  checked={formState.enableAiRecommendations}
                  onChange={(e) => setFormState({ ...formState, enableAiRecommendations: e.target.checked })}
                />
              </label>

              <label className="flex items-center justify-between p-3 border rounded">
                <span className="text-sm font-medium">Push Notification Service</span>
                <input
                  type="checkbox"
                  checked={formState.enableNotifications}
                  onChange={(e) => setFormState({ ...formState, enableNotifications: e.target.checked })}
                />
              </label>
            </div>
          </div>

          {/* Save Action */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary flex items-center space-x-2 px-6"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Settings...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}