import { useState, useEffect } from 'react';
import {
  X, Copy, Check, Calendar, Clock,
  Shield, ShieldAlert, ShieldCheck, Users, Lock, Unlock,
  KeyRound, CheckCircle2, UserX, Activity, History,
} from 'lucide-react';
import type { UserProfile, UserRole } from '../../../types/common/index';
import { usePermissions } from '../../../app/providers/PermissionContext';
import { userService } from '../services/userService';
import { UserAvatar } from '../../../components/shared/UserAvatar';

const ROLE_CONFIG: Record<UserRole, { label: string; labelEn: string; badgeClass: string; icon: React.FC<{ className?: string }> }> = {
  developer_super_admin: { label: 'डेवलपर सुपर एडमिन', labelEn: 'Developer Super Admin', badgeClass: 'bg-purple-50 text-purple-800 border-purple-200', icon: ShieldAlert },
  client_super_admin: { label: 'क्लाइंट एडमिन', labelEn: 'Client Super Admin', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200', icon: ShieldCheck },
  mobile_user: { label: 'सत्संगी भक्त', labelEn: 'Mobile User', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: Users },
};

const AUDIT_LABELS: Record<string, { text: string; color: string }> = {
  CREATE_USER: { text: 'उपयोगकर्ता निर्माण', color: 'text-emerald-700 bg-emerald-50' },
  SET_USER_ROLE: { text: 'रोल परिवर्तन', color: 'text-amber-700 bg-amber-50' },
  SYNC_CUSTOM_CLAIMS: { text: 'क्लेम्स सिंक', color: 'text-blue-700 bg-blue-50' },
  REVOKE_REFRESH_TOKENS: { text: 'टोकन निरस्त', color: 'text-rose-700 bg-rose-50' },
};

interface UserProfileDrawerProps {
  user: UserProfile;
  open: boolean;
  onClose: () => void;
  onChangeRole: (user: UserProfile) => void;
  onStatusChange: (user: UserProfile, action: 'suspend' | 'activate') => void;
  onEditProfile: (user: UserProfile) => void;
  onPasswordReset: (user: UserProfile) => void;
  onPermanentDelete?: (user: UserProfile) => void;
}

export function UserProfileDrawer({
  user, open, onClose, onChangeRole, onStatusChange, onEditProfile, onPasswordReset, onPermanentDelete,
}: UserProfileDrawerProps) {
  const { isDeveloperSuperAdmin, isClientSuperAdmin, user: currentAuthUser } = usePermissions();
  const [tab, setTab] = useState<'profile' | 'security' | 'audit'>('profile');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isSelf = currentAuthUser?.uid === user.uid;
  const canManage = isDeveloperSuperAdmin || (isClientSuperAdmin && user.role !== 'developer_super_admin');
  const roleMeta = ROLE_CONFIG[user.role] || ROLE_CONFIG.mobile_user;
  const RoleIcon = roleMeta.icon;

  useEffect(() => {
    if (open) {
      setTab('profile');
      setAuditLogs([]);
    }
  }, [open, user.uid]);

  useEffect(() => {
    if (tab === 'audit' && open) {
      setAuditLoading(true);
      setAuditError(null);
      userService.getUserAuditLogs(user.uid).then((res) => {
        if (res.success && res.data) {
          setAuditLogs(res.data);
        } else {
          setAuditLogs([]);
          setAuditError(res.error || 'ऑडिट लॉग्स पढ़ने में त्रुटि');
        }
        setAuditLoading(false);
      });
    }
  }, [tab, open, user.uid]);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  const handleCopyUid = () => {
    navigator.clipboard.writeText(user.uid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const safe = (val?: string | null) => val && val.trim() ? val : '—';

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-label="उपयोगकर्ता विवरण" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-stone-200">
          {/* Header */}
          <div className="p-6 border-b border-stone-200 bg-stone-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <UserAvatar avatarUrl={user.photoURL} displayName={user.displayName} email={user.email} size={48} className="ring-2 ring-stone-700 shrink-0" />
              <div className="min-w-0">
                <h3 className="font-extrabold text-base text-white truncate">{safe(user.displayName)}</h3>
                <p className="text-xs text-stone-400 truncate">{safe(user.email)}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white cursor-pointer shrink-0" aria-label="बंद करें">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-stone-200 bg-stone-50 text-xs font-bold" role="tablist">
            {([['profile', 'प्रोफ़ाइल'], ['security', 'सुरक्षा'], ...(isDeveloperSuperAdmin ? [['audit', 'ऑडिट'] as const] : [])] as const).map(([key, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${
                  tab === key ? 'border-[#EA580C] text-[#EA580C] bg-white' : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Profile Tab */}
            {tab === 'profile' && (
              <div className="space-y-5">
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">पहचान</span>
                    <button onClick={handleCopyUid} className="flex items-center gap-1 text-[0.68rem] text-amber-700 font-bold hover:underline cursor-pointer">
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'कॉपी हो गया!' : 'UID कॉपी करें'}</span>
                    </button>
                  </div>
                  <div className="text-xs space-y-2">
                    {[
                      ['UID', <span className="font-mono text-stone-800 text-[0.68rem]">{user.uid}</span>],
                      ['ईमेल', <span className="font-semibold text-stone-900">{safe(user.email)}</span>],
                      ['फोन', <span className="font-semibold text-stone-900">{safe(user.phone)}</span>],
                      ['शहर', <span className="font-semibold text-stone-900">{safe(user.city)}</span>],
                      ['दीक्षा गुरु', <span className="font-semibold text-stone-900">{safe(user.dikshaGuru)}</span>],
                      ['ध्येय', <span className="font-semibold text-stone-900 text-right">{safe(user.spiritualMotto)}</span>],
                    ].map(([label, val], i) => (
                      <div key={i} className="flex justify-between border-b border-stone-200/60 pb-1.5 last:border-0 last:pb-0">
                        <span className="text-stone-500">{label}:</span>
                        {val}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2 text-xs">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">समय एवं गतिविधि (Timeline & Activity)</span>
                  {(
                    [
                      { Icon: Calendar, label: 'पंजीकरण (Registered)', val: user.createdAt },
                      { Icon: Clock, label: 'अंतिम अपडेट (Profile Updated)', val: user.updatedAt },
                      { Icon: Activity, label: 'अंतिम सक्रियता (Last Active)', val: user.lastActiveAt },
                      { Icon: Clock, label: 'अंतिम लॉगिन (Last Login)', val: user.lastLogin },
                    ] as const
                  ).map(({ Icon, label, val }, i) => (
                    <div key={i} className="flex items-center justify-between text-stone-700">
                      <span className="flex items-center gap-1.5 text-stone-500">
                        <Icon className="w-3.5 h-3.5" /><span>{label}:</span>
                      </span>
                      <span className="font-semibold">{val ? new Date(val).toLocaleString('hi-IN') : 'अनुपलब्ध'}</span>
                    </div>
                  ))}
                </div>

                {(isDeveloperSuperAdmin || isClientSuperAdmin) && (
                  <button onClick={() => onEditProfile(user)} className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2">
                    प्रोफ़ाइल संपादित करें
                  </button>
                )}
              </div>
            )}

            {/* Security Tab */}
            {tab === 'security' && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-500 uppercase">अधिकार स्तर</span>
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black border ${roleMeta.badgeClass}`}>
                      <RoleIcon className="w-3.5 h-3.5 inline mr-1" />{roleMeta.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-stone-200/60 pt-2">
                    <span className="text-xs font-bold text-stone-500 uppercase">स्थिति</span>
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black border ${
                      user.accountStatus === 'suspended' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {user.accountStatus === 'suspended' ? 'निलंबित' : 'सक्रिय'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">प्रभावी अनुमतियाँ:</h4>
                  <ul className="space-y-1.5 text-xs">
                    {user.role === 'developer_super_admin' && [
                      'प्लेटफ़ॉर्म सुरक्षा, बैकअप, और सिस्टम कॉन्फ़िगरेशन पूर्ण अधिकार',
                      'समस्त एडमिन एवं भक्तों के रोल्स आवंटन तथा खाता प्रबंधन',
                      'अपरिवर्तनीय सुरक्षा ऑडिट लॉग्स का पठन',
                    ].map((t, i) => (
                      <li key={i} className="flex items-center gap-2 text-purple-900 bg-purple-50 p-2 rounded-xl">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" /><span>{t}</span>
                      </li>
                    ))}
                    {user.role === 'client_super_admin' && [
                      'भजन, स्तुति, पुस्तकें एवं मीडिया अपलोड/संपादन',
                      'सामान्य Android उपयोगकर्ताओं का निर्माण, संपादन एवं निलंबन',
                      'पुश नोटिफिकेशन ब्रॉडकास्ट एवं एनालिटिक्स अवलोकन',
                    ].map((t, i) => (
                      <li key={i} className="flex items-center gap-2 text-amber-900 bg-amber-50 p-2 rounded-xl">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" /><span>{t}</span>
                      </li>
                    ))}
                    {user.role === 'mobile_user' && [
                      'भजन, स्तुति एवं आध्यात्मिक पुस्तकों का पठन/श्रवण',
                      'स्वयं की निजी प्लेलिस्ट एवं पसंदीदा भजनों का प्रबंधन',
                    ].map((t, i) => (
                      <li key={i} className="flex items-center gap-2 text-emerald-900 bg-emerald-50 p-2 rounded-xl">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /><span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-stone-200 space-y-2">
                  <button onClick={() => onPasswordReset(user)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold cursor-pointer transition-all">
                    <KeyRound className="w-4 h-4 text-amber-600" />
                    <span>पासवर्ड रीसेट लिंक भेजें</span>
                  </button>

                  {canManage && !isSelf && (
                    <>
                      <button onClick={() => onChangeRole(user)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold cursor-pointer transition-all">
                        <Shield className="w-4 h-4 text-amber-700" /><span>रोल बदलें</span>
                      </button>
                      <button onClick={() => onStatusChange(user, user.accountStatus === 'suspended' ? 'activate' : 'suspend')} className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        user.accountStatus === 'suspended' ? 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900' : 'border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-900'
                      }`}>
                        {user.accountStatus === 'suspended'
                          ? <><Unlock className="w-4 h-4 text-emerald-700" /><span>पुनः सक्रिय करें</span></>
                          : <><Lock className="w-4 h-4 text-rose-700" /><span>निलंबित करें</span></>
                        }
                      </button>
                    </>
                  )}

                  {isDeveloperSuperAdmin && !isSelf && onPermanentDelete && (
                    <div className="pt-2 border-t border-red-200">
                      <button
                        type="button"
                        onClick={() => onPermanentDelete(user)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 text-red-800 text-xs font-bold cursor-pointer transition-all shadow-2xs"
                      >
                        <UserX className="w-4 h-4 text-red-600" />
                        <span>स्थायी रूप से हटाएं (Developer Only)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Audit Tab */}
            {tab === 'audit' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">हाल के सुरक्षा इवेंट्स</h4>
                {auditLoading ? (
                  <p className="text-xs text-stone-400 py-6 text-center" aria-busy="true">ऑडिट लॉग्स लोड हो रहे हैं…</p>
                ) : auditError ? (
                  <div className="p-8 text-center bg-red-50 rounded-2xl border border-dashed border-red-200">
                    <History className="w-8 h-8 mx-auto text-red-300 mb-2" />
                    <p className="text-xs font-bold text-stone-700">ऑडिट लॉग्स पढ़ने में समस्या</p>
                    <p className="text-[0.68rem] text-stone-500 mt-1">{auditError}</p>
                  </div>
                ) : auditLogs.length > 0 ? (
                  <div className="space-y-2.5" role="list">
                    {auditLogs.map((log: any) => {
                      const meta = AUDIT_LABELS[log.action] || { text: log.action || 'इवेंट', color: 'text-stone-700 bg-stone-50' };
                      return (
                        <div key={log.id} className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-1" role="listitem">
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-0.5 rounded text-[0.65rem] font-black ${meta.color}`}>{meta.text}</span>
                            <span className="text-[0.65rem] text-stone-400">
                              {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString('hi-IN') : '—'}
                            </span>
                          </div>
                          {log.details && (
                            <div className="text-[0.68rem] text-stone-600 space-y-0.5 pt-1">
                              {log.details.targetUid && <p>लक्ष्य: <span className="font-mono">{log.details.targetUid.slice(0, 12)}…</span></p>}
                              {log.details.newRole && <p>नया रोल: <span className="font-bold">{log.details.newRole}</span></p>}
                              {log.details.status && <p>स्थिति: <span className="font-bold">{log.details.status}</span></p>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                    <History className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                    <p className="text-xs font-bold text-stone-600">कोई ऑडिट इवेंट नहीं मिला</p>
                    <p className="text-[0.68rem] text-stone-400 mt-1">इस खाते के लिए कोई विशेषाधिकार परिवर्तन दर्ज नहीं हुआ।</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
