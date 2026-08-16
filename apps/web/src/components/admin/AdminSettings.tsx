/**
 * ============================================================================
 * Santmat Satsang Prachar - System & Settings (Admin)
 * ============================================================================
 * Reads and updates real system settings from the `app_settings/system`
 * document and surfaces a live database health summary backed by the real
 * Firestore collections. No PIN, no fabricated local backup/restore.
 */
import React, { useState, useEffect } from 'react';
import {
  Settings,
  CheckCircle2,
  AlertCircle,
  Database,
  Save,
  Loader2,
  Server,
  Mail,
  Phone,
  Globe,
  ToggleLeft,
  HardDrive,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { settingsService } from '../../services/settingsService';
import { SystemSettings } from '../../types';

const MB = 1024 * 1024;

export const AdminSettings: React.FC = () => {
  const { bhajans, stutis, categories, suvichars, notifications, playlists, dataLoading, dataError } = useApp();

  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    settingsService.getSettings().then((res) => {
      setLoading(false);
      if (res.success && res.data) {
        setSettings(res.data);
      } else {
        setLoadError(res.error || 'सेटिंग्स लोड करने में त्रुटि');
      }
    });
  }, []);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const updateField = (key: keyof SystemSettings, value: string | number | boolean) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    const res = await settingsService.updateSettings(settings);
    setSaving(false);
    if (res.success) {
      showToast('success', 'सिस्टम सेटिंग्स सहेजी गईं।');
    } else {
      showToast('error', res.error || 'सेटिंग्स सहेजने में त्रुटि');
    }
  };

  const dbCards = [
    { label: 'कुल भजन', value: bhajans.length },
    { label: 'स्तुति-बिनती', value: stutis.length },
    { label: 'श्रेणियाँ', value: categories.length },
    { label: 'सुविचार', value: suvichars.length },
    { label: 'सूचनाएँ', value: notifications.length },
    { label: 'प्लेलिस्ट्स', value: playlists.length },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 font-['Mukta'] select-none">
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-bold text-sm ${
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{toast.msg}</span>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-black text-stone-900 leading-tight">
          सिस्टम एवं सेटिंग्स (Admin Settings)
        </h2>
        <p className="text-xs text-stone-500">
          वास्तविक `app_settings/system` दस्तावेज़ से सिस्टम विन्यास पढ़ें व अद्यतन करें
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Settings Card */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-stone-900">सिस्टम सेटिंग्स</h3>
              <p className="text-[0.7rem] text-stone-400">एप्लिकेशन विन्यास (संग्रह: app_settings/system)</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-stone-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs font-bold">सेटिंग्स लोड हो रही हैं…</span>
            </div>
          ) : loadError || !settings ? (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loadError || 'सेटिंग्स उपलब्ध नहीं'}</span>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-amber-600" />
                    साइट शीर्षक
                  </label>
                  <input
                    type="text"
                    value={settings.siteTitle}
                    onChange={(e) => updateField('siteTitle', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                    <Server className="w-3.5 h-3.5 text-amber-600" />
                    संगठन का नाम
                  </label>
                  <input
                    type="text"
                    value={settings.organizationName}
                    onChange={(e) => updateField('organizationName', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-amber-600" />
                    संपर्क ईमेल
                  </label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => updateField('contactEmail', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-amber-600" />
                    संपर्क फ़ोन
                  </label>
                  <input
                    type="text"
                    value={settings.contactPhone}
                    onChange={(e) => updateField('contactPhone', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5 text-amber-600" />
                  अधिकतम अपलोड आकार (MB)
                </label>
                <input
                  type="number"
                  min={1}
                  value={Math.round(settings.maxUploadSizeBytes / MB)}
                  onChange={(e) => updateField('maxUploadSizeBytes', Math.max(1, Number(e.target.value)) * MB)}
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
                />
                <p className="text-[0.65rem] text-stone-400 mt-1">
                  वर्तमान: {(settings.maxUploadSizeBytes / MB).toFixed(0)} MB
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <label className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <ToggleLeft className="w-4 h-4 text-amber-600" />
                    <div>
                      <p className="text-xs font-bold text-stone-800">रखरखाव मोड</p>
                      <p className="text-[0.68rem] text-stone-500">मोबाइल ऐप को रखरखाव संदेश पर निर्देशित करें</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => updateField('maintenanceMode', e.target.checked)}
                    className="w-4 h-4 accent-amber-600"
                  />
                </label>

                <label className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <ToggleLeft className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-stone-800">नए पंजीकरण अनुमत</p>
                      <p className="text-[0.68rem] text-stone-500">मोबाइल ऐप में नए खाते बनाने की अनुमति</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.allowNewRegistrations}
                    onChange={(e) => updateField('allowNewRegistrations', e.target.checked)}
                    className="w-4 h-4 accent-emerald-600"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl font-bold text-xs shadow-sm transition-all disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    सहेजा जा रहा है…
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    सेटिंग्स सहेजें
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Database Health Card */}
        <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-stone-100 p-5 rounded-3xl border border-stone-700 shadow-md space-y-4 h-fit">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400" />
              <h4 className="font-extrabold text-sm text-stone-100">डेटाबेस स्वास्थ्य (Live)</h4>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold border ${
                dataError
                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : dataLoading
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {dataError ? 'डेटा त्रुटि' : dataLoading ? 'लोड हो रहा है…' : 'सक्रिय (Live & Synced)'}
            </span>
          </div>

          {dataError && (
            <div className="p-2.5 rounded-xl bg-red-500/15 text-red-300 text-[0.7rem] border border-red-500/30">
              {dataError}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
            {dbCards.map((card) => (
              <div key={card.label} className="p-2.5 bg-stone-800/80 rounded-xl border border-stone-700">
                <p className="text-lg font-black text-amber-400">{card.value}</p>
                <p className="text-[0.65rem] text-stone-400">{card.label}</p>
              </div>
            ))}
          </div>

          <p className="text-[0.68rem] text-stone-500 leading-relaxed">
            ये आँकड़े वास्तविक Firestore संग्रहों (audio, stuti_vinati, categories, suvichars,
            notifications, playlists) से वास्तविक समय में सिंक होते हैं। कोई भी संख्या नकली नहीं है।
          </p>
        </div>
      </div>
    </div>
  );
};
