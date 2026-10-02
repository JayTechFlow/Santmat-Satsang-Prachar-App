/**
 * ============================================================================
 * Santmat Satsang Prachar - Support Tickets Management (Admin)
 * ============================================================================
 * Real-time support messages from the `support_tickets` collection. Admins can
 * change ticket status (open → in progress → resolved → closed) and delete
 * tickets. Empty state shown when no tickets exist.
 */
import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Loader2,
  Trash2,
  Mail,
  Tag,
  AlertTriangle,
  Inbox,
  RefreshCw,
} from 'lucide-react';
import { supportService, SupportTicketEntity } from '../services/supportService';
import { AdminPageHeader } from '../../../components/admin';

const STATUS_LABELS: Record<SupportTicketEntity['status'], string> = {
  open: 'खुला (Open)',
  in_progress: 'प्रगति में (In Progress)',
  resolved: 'समाधान किया (Resolved)',
  closed: 'बंद (Closed)',
};

const STATUS_COLORS: Record<SupportTicketEntity['status'], string> = {
  open: 'bg-red-50 text-red-700 border-red-200',
  in_progress: 'bg-amber-50 text-amber-800 border-amber-200',
  resolved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  closed: 'bg-stone-100 text-stone-600 border-stone-200',
};

const CATEGORY_LABELS: Record<SupportTicketEntity['category'], string> = {
  bug: 'तकनीकी समस्या (Bug)',
  feature_request: 'सुविधा अनुरोध (Feature)',
  content_issue: 'सामग्री समस्या (Content)',
  account_access: 'खाता / पहुँच (Account)',
  general: 'सामान्य (General)',
};

const PRIORITY_LABELS: Record<SupportTicketEntity['priority'], string> = {
  low: 'कम',
  medium: 'मध्यम',
  high: 'उच्च',
  urgent: 'तत्काल',
};

const PRIORITY_COLORS: Record<SupportTicketEntity['priority'], string> = {
  low: 'text-stone-500 bg-stone-100',
  medium: 'text-amber-800 bg-amber-100',
  high: 'text-red-700 bg-red-100',
  urgent: 'text-red-900 bg-red-200',
};

const NEXT_STATUS: Record<SupportTicketEntity['status'], SupportTicketEntity['status']> = {
  open: 'in_progress',
  in_progress: 'resolved',
  resolved: 'closed',
  closed: 'open',
};

export const AdminSupport: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicketEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<SupportTicketEntity['status'] | 'all'>('all');

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3500);
  };

  const load = () => {
    setLoading(true);
    setError(null);
    supportService.getTickets().then((res) => {
      setLoading(false);
      if (res.success) {
        setTickets(res.data || []);
      } else {
        setError(res.error || 'समर्थन टिकट लोड करने में त्रुटि');
      }
    });
  };

  useEffect(() => {
    return supportService.subscribeTickets(
      (data) => {
        setTickets(data);
        setLoading(false);
      },
      () => {
        setError('समर्थन टिकट सदस्यता में त्रुटि');
        setLoading(false);
      }
    );
  }, []);

  const handleStatus = async (ticket: SupportTicketEntity) => {
    const next = NEXT_STATUS[ticket.status];
    const res = await supportService.updateTicket(ticket.id, { status: next });
    if (res.success) {
      showMessage(`टिकट स्थिति: ${STATUS_LABELS[next]}`);
    } else {
      alert(res.error || 'स्थिति अपडेट में त्रुटि');
    }
  };

  const handleDelete = async (ticket: SupportTicketEntity) => {
    if (!confirm('क्या आप इस समर्थन संदेश को हटाना चाहते हैं?')) return;
    const res = await supportService.deleteTicket(ticket.id);
    if (res.success) {
      showMessage('संदेश हटा दिया गया।');
    } else {
      alert(res.error || 'हटाने में त्रुटि');
    }
  };

  const filtered = activeFilter === 'all' ? tickets : tickets.filter((t) => t.status === activeFilter);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto font-['Mukta'] select-none">
      {/* Canonical Admin Page Header */}
      <AdminPageHeader
        title="समर्थन संदेश (Support Tickets)"
        subtitle="मोबाइल ऐप से भक्तों द्वारा भेजे गए सहायता संदेश यहाँ वास्तविक समय में प्रदर्शित होते हैं।"
        badgeText="भक्त सहायता केंद्र"
        badgeVariant="info"
        icon={<MessageSquare className="w-4 h-4" />}
        actions={
          <div className="flex items-center gap-1 bg-stone-100/80 p-1 rounded-lg border border-stone-200">
            {(['all', 'open', 'in_progress', 'resolved', 'closed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setActiveFilter(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeFilter === s ? 'bg-white text-stone-950 shadow-sm border border-stone-200' : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                {s === 'all' ? 'सभी' : STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        }
      />

      {message && (
        <div className="admin-toast admin-toast-success">
          {message}
        </div>
      )}

      {loading ? (
        <div className="admin-card p-12 text-center space-y-3">
          <Loader2 className="w-10 h-10 mx-auto text-purple-600 animate-spin" />
          <p className="text-sm font-bold text-stone-600">संदेश लोड हो रहे हैं…</p>
        </div>
      ) : error && tickets.length === 0 ? (
        <div className="bg-amber-50 rounded-[0.75rem] p-12 border border-amber-200 shadow-xs text-center space-y-3">
          <AlertTriangle className="w-10 h-10 mx-auto text-amber-600" />
          <p className="text-sm font-bold text-amber-900">समर्थन संदेश उपलब्ध नहीं</p>
          <p className="text-xs text-amber-800">{error}</p>
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            पुनः प्रयास करें
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-card p-12 text-center space-y-3">
          <Inbox className="w-12 h-12 mx-auto text-stone-300" />
          <p className="text-sm font-bold text-stone-600">कोई समर्थन संदेश नहीं</p>
          <p className="text-xs text-stone-400">
            {activeFilter === 'all'
              ? 'जैसे ही भक्त सहायता अनुरोध भेजेंगे, वे यहाँ प्रदर्शित होंगे।'
              : `इस स्थिति (${STATUS_LABELS[activeFilter]}) का कोई संदेश नहीं है।`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => (
            <div key={ticket.id} className="admin-card p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 border border-purple-100 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-sm text-stone-900 truncate">{ticket.subject}</h4>
                    <p className="text-[0.68rem] text-stone-500 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3" />
                      {ticket.contactEmail} • {ticket.submittedBy}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-[0.65rem] font-bold border ${PRIORITY_COLORS[ticket.priority]}`}>
                    प्राथमिकता: {PRIORITY_LABELS[ticket.priority]}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-[0.65rem] font-bold border ${STATUS_COLORS[ticket.status]}`}>
                    {STATUS_LABELS[ticket.status]}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[0.68rem] text-stone-500">
                <Tag className="w-3 h-3" />
                {CATEGORY_LABELS[ticket.category]}
                <span className="text-stone-300">•</span>
                <span>{new Date(ticket.createdAt).toLocaleString('hi-IN')}</span>
              </div>

              <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">
                {ticket.message}
              </p>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => handleStatus(ticket)}
                  className="text-xs font-bold text-purple-800 hover:underline"
                >
                  स्थिति बदलें → {STATUS_LABELS[NEXT_STATUS[ticket.status]]}
                </button>
                <button
                  onClick={() => handleDelete(ticket)}
                  className="flex items-center gap-1 text-xs font-bold text-red-600 hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  हटाएं
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
