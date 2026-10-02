/**
 * ============================================================================
 * Santmat Satsang Prachar - Notifications Broadcast Manager (Admin)
 * ============================================================================
 * Enables the administrator to compose and broadcast devotional announcements,
 * live satsang reminders, morning stuti alerts, and special festival messages
 * directly to the mobile app's notification feed.
 */
import React, { useState } from 'react';
import {
  Bell,
  Send,
  Trash2,
  CheckCircle,
  Eye,
  Calendar,
  Sparkles,
  Music,
  Heart,
  MessageSquare,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useApp } from '../../../app/providers/AppContext';
import { NotificationItem } from '../../../types/common/index';
import { AdminPageHeader, AdminButton } from '../../../components/admin';

export const AdminNotificationsManager: React.FC = () => {
  const { notifications, addNotification, deleteNotification, deleteAllNotifications } = useApp();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'suvichar' | 'bhajan' | 'stuti' | 'special' | 'event'>('bhajan');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  /**
   * Quick notification templates for rapid broadcasting
   */
  const handleApplyTemplate = (templateType: 'morning' | 'evening' | 'bhajan' | 'satsang') => {
    if (templateType === 'morning') {
      setTitle('प्रातःकालीन स्तुति का पावन समय');
      setMessage('सूर्योदय की पावन वेला में सद्गुरु महर्षि मेँहीं परमहंस जी महाराज की अमृतमयी स्तुति-बिनती का पाठ करें।');
      setType('stuti');
    } else if (templateType === 'evening') {
      setTitle('संध्याकालीन स्तुति एवं ध्यान साधना');
      setMessage('संध्या काल की पावन वेला पर आरती, स्तुति एवं मानस ध्यान में सम्मिलित हों।');
      setType('stuti');
    } else if (templateType === 'bhajan') {
      setTitle('नया सत्संग भजन प्रकाशित हुआ');
      setMessage('संत कबीर साहेब की पावन वाणी पर आधारित नया भजन ऐप पर उपलब्ध है। अभी श्रवण करें।');
      setType('bhajan');
    } else if (templateType === 'satsang') {
      setTitle('विशेष सत्संग आयोजन सूचना');
      setMessage('रविवार प्रातः 8:00 बजे से विशेष सत्संग एवं ध्यान अभ्यास का सीधा प्रसारण होगा।');
      setType('special');
    }
  };

  /**
   * Broadcast notification to mobile app
   */
  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('कृपया शीर्षक एवं संदेश दोनों भरें।');
      return;
    }

    addNotification({
      title: title.trim(),
      message: message.trim(),
      type,
    });

    showToast('सूचना सफलतापूर्वक सभी मोबाइल भक्तों को प्रसारित कर दी गई!');
    setTitle('');
    setMessage('');
  };

  const getTypeBadge = (nType: string) => {
    switch (nType) {
      case 'stuti':
        return <span className="bg-purple-100 text-purple-800 text-[0.65rem] font-bold px-2 py-0.5 rounded-full">स्तुति सूचना</span>;
      case 'bhajan':
        return <span className="bg-orange-100 text-orange-800 text-[0.65rem] font-bold px-2 py-0.5 rounded-full">भजन सूचना</span>;
      case 'suvichar':
        return <span className="bg-amber-100 text-amber-800 text-[0.65rem] font-bold px-2 py-0.5 rounded-full">सुविचार</span>;
      case 'special':
        return <span className="bg-emerald-100 text-emerald-800 text-[0.65rem] font-bold px-2 py-0.5 rounded-full">विशेष संदेश</span>;
      default:
        return <span className="bg-blue-100 text-blue-800 text-[0.65rem] font-bold px-2 py-0.5 rounded-full">सामान्य सूचना</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-['Mukta'] select-none">
      {/* Toast Notification */}
      {successToast && (
        <div className="admin-toast admin-toast-success">
          <CheckCircle className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Canonical Admin Page Header */}
      <AdminPageHeader
        title="सूचनाएँ एवं घोषणाएँ भेजें (Broadcast Center)"
        subtitle="यहाँ से आप मोबाइल उपयोगकर्ताओं को तत्काल सूचनाएँ, सत्संग का समय, नए भजन की घोषणाएँ अथवा प्रातः/संध्या स्तुति स्मरण संदेश भेज सकते हैं।"
        badgeText="संदेश एवं सूचना प्रसारण केंद्र"
        badgeVariant="primary"
        icon={<Bell className="w-4 h-4" />}
      />

      {/* Grid: Form (7 cols) + Quick Templates & Live Preview (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Compose Form */}
        <form onSubmit={handleBroadcast} className="lg:col-span-7 admin-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-[#EA580C]" />
              <span>नई सूचना का प्रारूप तैयार करें</span>
            </h2>
            <span className="text-[0.72rem] text-stone-400 font-semibold">
              सभी भक्तों के लिए
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Title */}
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                सूचना का शीर्षक (Notification Title) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="उदा. प्रातःकालीन स्तुति का पावन समय"
                required
                className="admin-input text-sm"
              />
            </div>

            {/* Notification Type */}
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                सूचना का प्रकार (Notification Type) <span className="text-red-500">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="admin-select"
              >
                <option value="bhajan">🎵 भजन संबंधित सूचना (New Bhajan)</option>
                <option value="stuti">🙏 स्तुति-बिनती स्मरण (Stuti Reminder)</option>
                <option value="suvichar">📖 दैनिक सुविचार वाणी (Daily Quote)</option>
                <option value="special">✨ विशेष सत्संग संदेश (Special Event)</option>
              </select>
            </div>

            {/* Message Body */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-stone-700">
                  संदेश विवरण (Message Details) <span className="text-red-500">*</span>
                </label>
                <span className="text-[0.68rem] text-stone-400">{message.length}/300</span>
              </div>
              <textarea
                rows={4}
                maxLength={300}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="यहाँ सूचना का संपूर्ण विवरण लिखें जिसे भक्त अपने मोबाइल स्क्रीन पर देखेंगे..."
                required
                className="admin-textarea"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <AdminButton
              type="submit"
              variant="primary"
              size="md"
              icon={<Send className="w-4 h-4" />}
            >
              तुरंत प्रसारित करें (Broadcast Now)
            </AdminButton>
          </div>
        </form>

        {/* Right: Quick Templates & Mobile Card Preview */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quick Pre-filled Templates */}
          <div className="admin-card p-5 space-y-3">
            <h3 className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>त्वरित सूचना टेम्पलेट्स (Quick Templates)</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleApplyTemplate('morning')}
                className="p-2.5 rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-50 text-left transition-colors text-xs space-y-1"
              >
                <p className="font-bold text-purple-900">🌅 प्रातः स्तुति</p>
                <p className="text-[0.65rem] text-purple-700">सुबह की वंदना स्मरण</p>
              </button>

              <button
                type="button"
                onClick={() => handleApplyTemplate('evening')}
                className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-left transition-colors text-xs space-y-1"
              >
                <p className="font-bold text-amber-900">🌆 संध्या स्तुति</p>
                <p className="text-[0.65rem] text-amber-700">शाम की आरती व ध्यान</p>
              </button>

              <button
                type="button"
                onClick={() => handleApplyTemplate('bhajan')}
                className="p-2.5 rounded-lg border border-orange-200 bg-orange-50/50 hover:bg-orange-50 text-left transition-colors text-xs space-y-1"
              >
                <p className="font-bold text-orange-900">🎵 नया भजन</p>
                <p className="text-[0.65rem] text-orange-700">नए भजन का विमोचन</p>
              </button>

              <button
                type="button"
                onClick={() => handleApplyTemplate('satsang')}
                className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-left transition-colors text-xs space-y-1"
              >
                <p className="font-bold text-emerald-900">✨ सत्संग सभा</p>
                <p className="text-[0.65rem] text-emerald-700">लाइव सत्संग सूचना</p>
              </button>
            </div>
          </div>

          {/* Live Mobile Notification Preview */}
          <div className="admin-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-amber-700" />
                <span>मोबाइल में कैसा दिखेगा (Card Preview)</span>
              </h3>
              <span className="text-[0.65rem] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                लाइव प्रीव्यू
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-stone-900">
                  {title || 'सूचना शीर्षक यहाँ दिखेगा'}
                </span>
                <span className="text-[0.65rem] text-amber-800 font-bold">अभी</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {message || 'सूचना का संदेश विवरण यहाँ मोबाइल स्क्रीन पर प्रदर्शित होगा।'}
              </p>
              <div className="pt-1">{getTypeBadge(type)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast History Table */}
      <div className="admin-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-700" />
              <span>प्रसारित सूचनाओं का इतिहास (Broadcast History: {notifications.length})</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              यहाँ वर्तमान में मोबाइल ऐप में सक्रिय सभी सूचनाएँ सूचीबद्ध हैं।
            </p>
          </div>

          {notifications.length > 0 && (
            <button
              onClick={() => {
                if (confirm('क्या आप सभी पुरानी सूचनाएं हटाना चाहते हैं?')) {
                  deleteAllNotifications();
                  showToast('सभी सूचनाएं हटा दी गईं।');
                }
              }}
              className="text-xs font-bold text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              सभी सूचनाएँ साफ़ करें
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-3.5 rounded-lg bg-stone-50/70 border border-stone-200 hover:bg-stone-50 flex items-start justify-between gap-3 transition-colors"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-xs text-stone-900">{n.title}</h4>
                  {getTypeBadge(n.type)}
                  <span className="text-[0.68rem] text-stone-400">{n.date}</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">{n.message}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  deleteNotification(n.id);
                  showToast('सूचना हटा दी गई।');
                }}
                className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                title="हटाएं"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {notifications.length === 0 && (
            <p className="text-center py-6 text-xs text-stone-400 italic">
              वर्तमान में कोई सूचना उपलब्ध नहीं है।
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
