/**
 * ============================================================================
 * Santmat Satsang Prachar - Enterprise User Management & IAM Control Plane
 * ============================================================================
 * Real Firebase Auth + Firestore + Cloud Functions user directory.
 * No mock data, no hardcoded users, no fake permissions.
 *
 * Data flow:
 *   useUsers hook → userService.subscribeUsers → onSnapshot(users collection)
 *   IAM actions → userService → Cloud Functions (iam-setUserRole, userProv-createUser)
 *   Profile edits → userService.updateUserProfile → Firestore direct write
 *   Status changes → userService.updateUserStatus → Firestore → syncUserCustomClaims trigger
 */
import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Users, Shield, ShieldAlert, ShieldCheck, UserPlus, Search,
  RefreshCw, Download, CheckCircle2, AlertCircle, AlertTriangle, X, Lock, Unlock,
  KeyRound, Eye, Edit3, Copy, Check, Calendar, Clock, Mail,
  Smartphone, ChevronLeft, ChevronRight, UserX,
} from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { usePermissions } from '../../../app/providers/PermissionContext';
import type { UserProfile, UserRole, UserAccountStatus } from '../../../types/common/index';
import { userService } from '../services/userService';
import { authService } from '../../auth/services/authService';
import { UserAvatar } from '../../../components/shared/UserAvatar';
import { StatCard } from '../../dashboard/components/StatCard';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import {
  AdminPageHeader,
  AdminDeleteDialog,
  AdminModal,
  AdminModalHeader,
  AdminModalTitle,
  AdminModalClose,
  AdminModalBody,
  AdminModalFooter,
  AdminButton,
} from '../../../components/admin';
import { UserProfileDrawer } from '../components/UserProfileDrawer';

const ROLE_CONFIG: Record<UserRole, { label: string; labelEn: string; badgeClass: string; icon: React.FC<{ className?: string }> }> = {
  developer_super_admin: { label: 'डेवलपर सुपर एडमिन', labelEn: 'Developer Super Admin', badgeClass: 'bg-purple-50 text-purple-800 border-purple-200', icon: ShieldAlert },
  client_super_admin: { label: 'क्लाइंट एडमिन', labelEn: 'Client Super Admin', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200', icon: ShieldCheck },
  mobile_user: { label: 'सत्संगी भक्त', labelEn: 'Mobile User', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: Users },
};

export const AdminDevoteesManager: React.FC = () => {
  const {
    users: backendUsers,
    loading: usersLoading,
    error: usersError,
    clearError: clearUsersError,
    updateUserRole,
    updateUserStatus,
    deleteUserPermanently,
  } = useUsers();
  const { isDeveloperSuperAdmin, isClientSuperAdmin, user: currentAuthUser } = usePermissions();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | UserAccountStatus>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Drawer
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [changeRoleModalUser, setChangeRoleModalUser] = useState<UserProfile | null>(null);
  const [newSelectedRole, setNewSelectedRole] = useState<UserRole>('mobile_user');
  const [statusModalUser, setStatusModalUser] = useState<{ user: UserProfile; action: 'suspend' | 'activate' } | null>(null);
  const [editProfileModalUser, setEditProfileModalUser] = useState<UserProfile | null>(null);
  const [resetPasswordModalUser, setResetPasswordModalUser] = useState<UserProfile | null>(null);
  const [permanentDeleteUser, setPermanentDeleteUser] = useState<UserProfile | null>(null);
  const [isPermanentlyDeleting, setIsPermanentlyDeleting] = useState(false);

  // Form state
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editMotto, setEditMotto] = useState('');
  const [editGuru, setEditGuru] = useState('');

  // Feedback & loading
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedUid, setCopiedUid] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(searchQuery); setCurrentPage(1); }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Auto-hide feedback
  useEffect(() => {
    if (feedback) { const t = setTimeout(() => setFeedback(null), 5000); return () => clearTimeout(t); }
  }, [feedback]);

  // KPIs
  const kpis = useMemo(() => {
    const list = backendUsers || [];
    return {
      total: list.length,
      active: list.filter((u) => u.accountStatus === 'active').length,
      suspended: list.filter((u) => u.accountStatus === 'suspended').length,
      devAdmins: list.filter((u) => u.role === 'developer_super_admin').length,
      clientAdmins: list.filter((u) => u.role === 'client_super_admin').length,
      mobileUsers: list.filter((u) => u.role === 'mobile_user').length,
    };
  }, [backendUsers]);

  // Filtered & sorted
  const filteredUsers = useMemo(() => {
    let result = [...(backendUsers || [])];
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      result = result.filter((u) =>
        (u.displayName || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.uid || '').toLowerCase().includes(q) ||
        (u.phone || '').toLowerCase().includes(q) ||
        (u.city || '').toLowerCase().includes(q)
      );
    }
    if (roleFilter !== 'all') result = result.filter((u) => u.role === roleFilter);
    if (statusFilter !== 'all') result = result.filter((u) => u.accountStatus === statusFilter);
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      return (a.displayName || a.email || '').localeCompare(b.displayName || b.email || '');
    });
    return result;
  }, [backendUsers, debouncedSearch, roleFilter, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Actions
  const handleCopyUid = (uid: string) => {
    navigator.clipboard.writeText(uid);
    setCopiedUid(uid);
    setTimeout(() => setCopiedUid(null), 2000);
  };

  const handleExportCsv = () => {
    if (!filteredUsers.length) return;
    const headers = ['UID', 'Display Name', 'Email', 'Phone', 'Role', 'Status', 'City', 'Created At'];
    const rows = filteredUsers.map((u) => [
      `"${u.uid}"`, `"${(u.displayName || '').replace(/"/g, '""')}"`, `"${u.email || ''}"`,
      `"${u.phone || ''}"`, `"${u.role}"`, `"${u.accountStatus}"`,
      `"${(u.city || '').replace(/"/g, '""')}"`, `"${u.createdAt || ''}"`,
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `santmat_users_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setFeedback({ type: 'success', message: `${filteredUsers.length} उपयोगकर्ताओं का CSV निर्यात किया गया।` });
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const email = String(fd.get('email') || '').trim();
    const password = String(fd.get('password') || '');
    const confirmPassword = String(fd.get('confirmPassword') || '');
    const displayName = String(fd.get('displayName') || '').trim();
    const phone = String(fd.get('phone') || '').trim() || undefined;
    const role = (String(fd.get('role') || 'mobile_user') as UserRole);
    const initialStatus = (String(fd.get('initialStatus') || 'active') as UserAccountStatus);

    if (password !== confirmPassword) { setFeedback({ type: 'error', message: 'पासवर्ड मेल नहीं खाते।' }); return; }
    if (password.length < 6) { setFeedback({ type: 'error', message: 'पासवर्ड न्यूनतम 6 अक्षर।' }); return; }

    setActionLoading(true);
    const res = await userService.createUser({ email, password, confirmPassword, displayName, phone, role, initialStatus });
    setActionLoading(false);
    if (res.success) {
      setFeedback({ type: 'success', message: `उपयोगकर्ता बनाया: ${displayName} (${email})` });
      setCreateModalOpen(false);
    } else {
      setFeedback({ type: 'error', message: res.error || 'त्रुटि।' });
    }
  };

  const handleChangeRoleSubmit = async () => {
    if (!changeRoleModalUser) return;
    setActionLoading(true);
    const res = await updateUserRole(changeRoleModalUser.uid, newSelectedRole);
    setActionLoading(false);
    if (res.success) {
      setFeedback({ type: 'success', message: `रोल अपडेट: ${changeRoleModalUser.displayName} → ${ROLE_CONFIG[newSelectedRole]?.labelEn}` });
      setChangeRoleModalUser(null);
      if (selectedUser?.uid === changeRoleModalUser.uid) setSelectedUser({ ...selectedUser, role: newSelectedRole });
    } else {
      setFeedback({ type: 'error', message: res.error || 'रोल अपडेट विफल।' });
    }
  };

  const handleStatusSubmit = async () => {
    if (!statusModalUser) return;
    const { user, action } = statusModalUser;
    const nextStatus: UserAccountStatus = action === 'activate' ? 'active' : 'suspended';
    setActionLoading(true);
    const res = await updateUserStatus(user.uid, nextStatus);
    setActionLoading(false);
    if (res.success) {
      setFeedback({ type: 'success', message: `खाता स्थिति: ${user.displayName} → ${nextStatus === 'active' ? 'सक्रिय' : 'निलंबित'}` });
      setStatusModalUser(null);
      if (selectedUser?.uid === user.uid) setSelectedUser({ ...selectedUser, accountStatus: nextStatus });
    } else {
      setFeedback({ type: 'error', message: res.error || 'स्थिति बदलने में त्रुटि।' });
    }
  };

  const handleEditProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProfileModalUser) return;
    setActionLoading(true);
    const res = await userService.updateUserProfile(editProfileModalUser.uid, {
      displayName: editDisplayName.trim(), phone: editPhone.trim(), city: editCity.trim(),
      spiritualMotto: editMotto.trim(), dikshaGuru: editGuru.trim(),
    });
    setActionLoading(false);
    if (res.success) {
      setFeedback({ type: 'success', message: 'प्रोफ़ाइल अपडेट की गई।' });
      setEditProfileModalUser(null);
      if (selectedUser?.uid === editProfileModalUser.uid) {
        setSelectedUser({ ...selectedUser, displayName: editDisplayName.trim(), phone: editPhone.trim(), city: editCity.trim(), spiritualMotto: editMotto.trim(), dikshaGuru: editGuru.trim() });
      }
    } else {
      setFeedback({ type: 'error', message: res.error || 'प्रोफ़ाइल अपडेट विफल।' });
    }
  };

  const handleSendPasswordReset = async () => {
    if (!resetPasswordModalUser?.email) return;
    setActionLoading(true);
    const res = await authService.resetPassword(resetPasswordModalUser.email);
    setActionLoading(false);
    if (res.success) {
      setFeedback({ type: 'success', message: `पासवर्ड रीसेट लिंक ${resetPasswordModalUser.email} पर भेजा गया।` });
      setResetPasswordModalUser(null);
    } else {
      setFeedback({ type: 'error', message: res.error || 'रीसेट ईमेल भेजने में विफल।' });
    }
  };

  const openEditProfile = useCallback((user: UserProfile) => {
    setEditDisplayName(user.displayName || '');
    setEditPhone(user.phone || '');
    setEditCity(user.city || '');
    setEditMotto(user.spiritualMotto || '');
    setEditGuru(user.dikshaGuru || '');
    setEditProfileModalUser(user);
  }, []);

  const handleConfirmPermanentDelete = async () => {
    if (!permanentDeleteUser) return;
    setIsPermanentlyDeleting(true);
    try {
      const res = await deleteUserPermanently(permanentDeleteUser.uid);
      if (res.success && res.data) {
        if (res.data.status === 'FULL_DELETE_SUCCESS') {
          setFeedback({
            type: 'success',
            message: `उपयोगकर्ता (${permanentDeleteUser.displayName || permanentDeleteUser.email}) एवं सभी संबद्ध संसाधन स्थायी रूप से हटा दिए गए।`,
          });
        } else {
          setFeedback({
            type: 'error',
            message: `उपयोगकर्ता आंशिक रूप से हटाया गया। कुछ संसाधनों की समीक्षा आवश्यक है।`,
          });
        }
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'उपयोगकर्ता को स्थायी रूप से हटाने में विफलता।',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'स्थायी निष्कासन में अप्रत्याशित त्रुटि।',
      });
    } finally {
      setIsPermanentlyDeleting(false);
      setPermanentDeleteUser(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-['Mukta'] select-none">
      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-md transition-all ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`} role="alert">
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="hover:opacity-75 cursor-pointer" aria-label="बंद करें"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Subscription Error Banner */}
      {usersError && (
        <div className="p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-md bg-rose-50 text-rose-900 border border-rose-200" role="alert">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>उपयोगकर्ता डेटा लोड करने में त्रुटि (सब्सक्रिप्शन विफल)। {usersError}</span>
          </div>
          <button onClick={clearUsersError} className="hover:opacity-75 cursor-pointer" aria-label="त्रुटि बंद करें"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Canonical Admin Page Header */}
      <AdminPageHeader
        title="उपयोगकर्ता प्रबंधन (User Management)"
        subtitle="Firebase Auth + Custom Claims + Firestore द्वारा संचालित। सभी डेटा वास्तविक है।"
        badgeText="पहचान एवं अधिकार नियंत्रण कक्ष"
        icon={<Shield className="w-4 h-4" />}
        actions={
          <>
            <AdminButton
              onClick={handleExportCsv}
              variant="secondary"
              size="md"
              icon={<Download className="w-4 h-4" />}
              title="CSV निर्यात"
            >
              निर्यात
            </AdminButton>
            {(isDeveloperSuperAdmin || isClientSuperAdmin) && (
              <AdminButton
                onClick={() => setCreateModalOpen(true)}
                variant="primary"
                size="md"
                icon={<UserPlus className="w-4 h-4" />}
              >
                + नया उपयोगकर्ता
              </AdminButton>
            )}
          </>
        }
      />

      {/* KPI Strip */}
      <section aria-label="उपयोगकर्ता सांख्यिकी" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard value={kpis.total.toLocaleString('en-IN')} label="कुल उपयोगकर्ता" icon={<Users className="w-6 h-6" />} loading={usersLoading} iconBg="bg-stone-100 border-stone-200 text-stone-600" />
        <StatCard value={kpis.active.toLocaleString('en-IN')} label="सक्रिय (Active)" icon={<Unlock className="w-6 h-6" />} loading={usersLoading} iconBg="bg-emerald-50 border-emerald-200 text-emerald-600" />
        <StatCard value={kpis.suspended.toLocaleString('en-IN')} label="निलंबित (Suspended)" icon={<Lock className="w-6 h-6" />} loading={usersLoading} iconBg="bg-rose-50 border-rose-200 text-rose-600" />
        <StatCard value={String(kpis.devAdmins)} label="डेवलपर एडमिन" icon={<ShieldAlert className="w-6 h-6" />} loading={usersLoading} iconBg="bg-purple-50 border-purple-200 text-purple-600" />
        <StatCard value={String(kpis.clientAdmins)} label="क्लाइंट एडमिन" icon={<ShieldCheck className="w-6 h-6" />} loading={usersLoading} iconBg="bg-amber-50 border-amber-200 text-amber-600" />
        <StatCard value={kpis.mobileUsers.toLocaleString('en-IN')} label="मोबाइल उपभोक्ता" icon={<Smartphone className="w-6 h-6" />} loading={usersLoading} iconBg="bg-stone-100 border-stone-200 text-stone-500" />
      </section>

      {/* Search & Filters */}
      <section aria-label="खोज एवं फ़िल्टर" className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="नाम, ईमेल, UID, फोन या शहर द्वारा खोजें…" aria-label="उपयोगकर्ता खोजें" className="admin-input pl-10" />
          {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600" aria-label="खोज साफ़ करें"><X className="w-3.5 h-3.5" /></button>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value as any); setCurrentPage(1); }} aria-label="रोल फ़िल्टर" className="admin-select">
            <option value="all">सभी रोल्स</option>
            <option value="developer_super_admin">Developer Super Admin</option>
            <option value="client_super_admin">Client Super Admin</option>
            <option value="mobile_user">Mobile User</option>
          </select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1); }} aria-label="स्थिति फ़िल्टर" className="admin-select">
            <option value="all">सभी स्थितियाँ</option>
            <option value="active">सक्रिय (Active)</option>
            <option value="suspended">निलंबित (Suspended)</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} aria-label="क्रमबद्ध करें" className="admin-select">
            <option value="newest">नवीनतम</option>
            <option value="oldest">पुरातन</option>
            <option value="name">नाम (A-Z)</option>
          </select>
          {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all') && (
            <button onClick={() => { setSearchQuery(''); setRoleFilter('all'); setStatusFilter('all'); setCurrentPage(1); }} className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold transition-all cursor-pointer">फ़िल्टर हटाएं</button>
          )}
        </div>
      </section>

      {/* Data Table */}
      <section aria-label="उपयोगकर्ता सूची" className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between text-xs font-bold text-stone-500 bg-stone-50/50">
          <span>
            प्रदर्शित: <strong className="text-stone-900">{filteredUsers.length}</strong> में से{' '}
            <strong className="text-stone-900">{paginatedUsers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filteredUsers.length)}</strong>
          </span>
          <div className="flex items-center gap-2">
            <span>प्रति पृष्ठ:</span>
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="bg-white border border-stone-200 rounded-lg px-2 py-1 text-xs font-bold text-stone-800" aria-label="प्रति पृष्ठ">
              {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" role="grid">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/80 text-[0.7rem] uppercase tracking-wider font-extrabold text-stone-600">
                <th scope="col" className="py-3.5 px-4">उपयोगकर्ता</th>
                <th scope="col" className="py-3.5 px-4 hidden sm:table-cell">संपर्क</th>
                <th scope="col" className="py-3.5 px-4">रोल</th>
                <th scope="col" className="py-3.5 px-4">स्थिति</th>
                <th scope="col" className="py-3.5 px-4 hidden md:table-cell">पंजीकरण</th>
                <th scope="col" className="py-3.5 px-4 text-right">कार्य</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {paginatedUsers.map((user) => {
                const roleMeta = ROLE_CONFIG[user.role] || ROLE_CONFIG.mobile_user;
                const RoleIcon = roleMeta.icon;
                const isSelf = currentAuthUser?.uid === user.uid;
                return (
                  <tr key={user.uid} className="hover:bg-stone-50/70 transition-colors group cursor-pointer" onClick={(e) => { if ((e.target as HTMLElement).closest('button, select, a, input')) return; setSelectedUser(user); setDrawerOpen(true); }}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar avatarUrl={user.photoURL} displayName={user.displayName} email={user.email} size={40} className="shrink-0 ring-1 ring-stone-200" />
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-stone-900 text-xs truncate flex items-center gap-1.5">
                            <span>{user.displayName || 'अनाम भक्त'}</span>
                            {isSelf && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[0.6rem] font-black">आप</span>}
                          </h4>
                          <p className="text-[0.68rem] text-stone-500 truncate sm:hidden">{user.email || '—'}</p>
                          {user.city && <p className="text-[0.68rem] text-stone-500 truncate hidden sm:block">{user.city}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-stone-900 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-stone-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{user.email || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[0.65rem] text-stone-400 font-mono">
                          <span>{user.uid.slice(0, 12)}…</span>
                          <button onClick={(e) => { e.stopPropagation(); handleCopyUid(user.uid); }} className="hover:text-stone-700 p-0.5 rounded cursor-pointer" title="UID कॉपी करें">
                            {copiedUid === user.uid ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[0.68rem] font-extrabold ${roleMeta.badgeClass}`}>
                        <RoleIcon className="w-3.5 h-3.5" /><span className="hidden lg:inline">{roleMeta.label}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {user.accountStatus === 'suspended' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[0.68rem] font-black"><Lock className="w-3 h-3" /><span>निलंबित</span></span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[0.68rem] font-bold"><div className="w-1.5 h-1.5 rounded-full bg-emerald-600" /><span>सक्रिय</span></span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-stone-500 font-medium hidden md:table-cell">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('hi-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedUser(user); setDrawerOpen(true); }} className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer" title="विवरण" aria-label={`${user.displayName} विवरण देखें`}>
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {(isDeveloperSuperAdmin || isClientSuperAdmin) && (
                          <button onClick={(e) => { e.stopPropagation(); openEditProfile(user); }} className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer" title="संपादित" aria-label={`${user.displayName} संपादित करें`}>
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {(isDeveloperSuperAdmin || (isClientSuperAdmin && user.role !== 'developer_super_admin')) && !isSelf && (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); setChangeRoleModalUser(user); setNewSelectedRole(user.role); }} className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors cursor-pointer" title="रोल बदलें" aria-label={`${user.displayName} का रोल बदलें`}>
                              <Shield className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setStatusModalUser({ user, action: user.accountStatus === 'suspended' ? 'activate' : 'suspend' }); }} className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${user.accountStatus === 'suspended' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'}`} title={user.accountStatus === 'suspended' ? 'पुनः सक्रिय' : 'निलंबित'} aria-label={`${user.displayName} ${user.accountStatus === 'suspended' ? 'पुनः सक्रिय करें' : 'निलंबित करें'}`}>
                              {user.accountStatus === 'suspended' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            </button>
                          </>
                        )}
                        {isDeveloperSuperAdmin && !isSelf && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPermanentDeleteUser(user);
                            }}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors cursor-pointer"
                            title="स्थायी रूप से हटाएं (Developer Only)"
                            aria-label={`${user.displayName} को स्थायी रूप से हटाएं`}
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedUsers.length === 0 && (
                <tr><td colSpan={6} className="py-14 text-center text-stone-400">
                  <Users className="w-12 h-12 mx-auto text-stone-300 mb-2" />
                  <p className="text-base font-extrabold text-stone-700">कोई उपयोगकर्ता नहीं मिला</p>
                  <p className="text-xs text-stone-400 mt-0.5">{searchQuery || roleFilter !== 'all' || statusFilter !== 'all' ? 'फ़िल्टर बदलकर पुनः प्रयास करें।' : 'डेटाबेस में कोई उपयोगकर्ता नहीं।'}</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-stone-600">
          <div>पृष्ठ <strong className="text-stone-900">{currentPage}</strong> / <strong className="text-stone-900">{totalPages}</strong></div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1} className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1" aria-label="पिछला पृष्ठ">
              <ChevronLeft className="w-4 h-4" /><span>पिछला</span>
            </button>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1" aria-label="अगला पृष्ठ">
              <span>अगला</span><ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* DRAWER                                                             */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {selectedUser && (
        <UserProfileDrawer
          user={selectedUser}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onChangeRole={(u) => { setDrawerOpen(false); setChangeRoleModalUser(u); setNewSelectedRole(u.role); }}
          onStatusChange={(u, action) => { setDrawerOpen(false); setStatusModalUser({ user: u, action }); }}
          onEditProfile={(u) => { setDrawerOpen(false); openEditProfile(u); }}
          onPasswordReset={(u) => { setDrawerOpen(false); setResetPasswordModalUser(u); }}
          onPermanentDelete={(u) => { setDrawerOpen(false); setPermanentDeleteUser(u); }}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* DEVELOPER-ONLY PERMANENT USER DELETE DIALOG                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <AdminDeleteDialog
        isOpen={!!permanentDeleteUser}
        title="उपयोगकर्ता स्थायी निष्कासन (Permanent User Deletion)"
        description="सावधानी: यह केवल Developer Super Admin के लिए उपलब्ध अत्यंत संवेदनशील क्रिया है। यह उपयोगकर्ता के Firebase Auth खाते, Firestore प्रोफ़ाइल, सब-कलेक्शंस (नोटिफिकेशंस), प्राथमिकताओं और स्टोरेज संपत्तियों को पूर्णतः नष्ट कर देगा।"
        targetIdentifier={permanentDeleteUser?.uid}
        targetDetails={[
          { label: 'नाम', value: permanentDeleteUser?.displayName || '—' },
          { label: 'ईमेल', value: permanentDeleteUser?.email || '—' },
          { label: 'रोल', value: permanentDeleteUser ? ROLE_CONFIG[permanentDeleteUser.role]?.label || permanentDeleteUser.role : '—' },
        ]}
        cleanupList={[
          'Firebase Authentication खाता (Login Credentials)',
          'Firestore users/{uid} प्रोफ़ाइल एवं notification_state सब-कलेक्शन',
          'उपयोगकर्ता प्राथमिकताएं (preferences/{uid}) एवं डिवोशनल डेटा',
          'उपयोगकर्ता द्वारा निर्मित प्लेलिस्ट व डाउनलोड रिकॉर्ड्स',
          'Firebase Storage में उपयोगकर्ता फ़ाइलें (avatars, temp, users)',
          'अपरिवर्तनीय ऑडिट लॉग में निष्कासन विवरण दर्ज',
        ]}
        requiresConfirmationInput={true}
        confirmationKeyword="DELETE"
        confirmButtonText="स्थायी रूप से पूर्णतः हटाएं"
        cancelButtonText="रद्द करें"
        isDeleting={isPermanentlyDeleting}
        onConfirm={handleConfirmPermanentDelete}
        onCancel={() => { if (!isPermanentlyDeleting) setPermanentDeleteUser(null); }}
      />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CREATE USER MODAL                                                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <AdminModal open={createModalOpen} onOpenChange={setCreateModalOpen} className="max-w-lg">
        <AdminModalHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#EA580C]"><UserPlus className="w-5 h-5" /></div>
            <div>
              <AdminModalTitle>नया उपयोगकर्ता बनाएं</AdminModalTitle>
              <p className="text-[0.7rem] text-stone-500">Firebase Auth + Firestore प्रोफ़ाइल</p>
            </div>
          </div>
          <AdminModalClose onClick={() => setCreateModalOpen(false)} />
        </AdminModalHeader>
        <AdminModalBody>
          <form onSubmit={handleCreateUserSubmit} className="space-y-4 text-xs font-bold text-stone-700" id="create-user-form">
            <div><label className="block mb-1">पूरा नाम *</label><input name="displayName" type="text" required placeholder="उदा. स्वामी रामानंद जी" className="admin-input" /></div>
            <div><label className="block mb-1">ईमेल *</label><input name="email" type="email" required placeholder="devotee@santmat.org" className="admin-input" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="block mb-1">पासवर्ड *</label><input name="password" type="password" required autoComplete="new-password" placeholder="न्यूनतम 6 अक्षर" className="admin-input" /></div>
              <div><label className="block mb-1">पासवर्ड पुष्टि *</label><input name="confirmPassword" type="password" required autoComplete="new-password" placeholder="वही पासवर्ड" className="admin-input" /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="block mb-1">रोल *</label><select name="role" className="admin-select"><option value="mobile_user">mobile_user</option><option value="client_super_admin">client_super_admin</option></select></div>
              <div><label className="block mb-1">स्थिति</label><select name="initialStatus" className="admin-select"><option value="active">सक्रिय</option><option value="suspended">निलंबित</option></select></div>
            </div>
            <div><label className="block mb-1">फोन (वैकल्पिक)</label><input name="phone" type="tel" placeholder="+91 9876543210" className="admin-input" /></div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[0.7rem] text-amber-900 font-medium"><strong>नोट:</strong> पासवर्ड Firebase Admin Auth द्वारा सुरक्षित रूप से बनाया जाता है।</div>
          </form>
        </AdminModalBody>
        <AdminModalFooter>
          <AdminButton onClick={() => setCreateModalOpen(false)} variant="secondary" size="md">रद्द करें</AdminButton>
          <AdminButton type="submit" form="create-user-form" variant="primary" size="md" loading={actionLoading} loadingText="सृजन हो रहा…">
            खाता बनाएं
          </AdminButton>
        </AdminModalFooter>
      </AdminModal>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CHANGE ROLE MODAL                                                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <AdminModal open={!!changeRoleModalUser} onOpenChange={(o) => { if (!o) setChangeRoleModalUser(null); }} className="max-w-md">
        <AdminModalHeader>
          <AdminModalTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-amber-600" /><span>रोल परिवर्तन</span></AdminModalTitle>
          <AdminModalClose onClick={() => setChangeRoleModalUser(null)} />
        </AdminModalHeader>
        <AdminModalBody>
          <div className="space-y-4 text-xs">
            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
              <p className="font-bold text-stone-900">{changeRoleModalUser?.displayName}</p>
              <p className="text-stone-500 text-[0.7rem]">{changeRoleModalUser?.email}</p>
              <div className="mt-2 text-stone-700 flex items-center justify-between"><span>वर्तमान रोल:</span><span className="font-black text-amber-800">{changeRoleModalUser?.role}</span></div>
            </div>
            <div>
              <label className="block mb-1.5 font-bold text-stone-700">नया रोल *</label>
              <select value={newSelectedRole} onChange={(e) => setNewSelectedRole(e.target.value as UserRole)} className="admin-select">
                <option value="mobile_user">mobile_user</option>
                <option value="client_super_admin">client_super_admin</option>
                {isDeveloperSuperAdmin && <option value="developer_super_admin">developer_super_admin</option>}
              </select>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[0.7rem] text-amber-900 font-medium">
              <strong className="flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-amber-600" />सुरक्षा प्रभाव:</strong> रोल बदलने पर कस्टम क्लेम्स तुरंत सिंक होंगे और रोल घटाने पर रिफ्रेश टोकन निरस्त होंगे।
            </div>
          </div>
        </AdminModalBody>
        <AdminModalFooter>
          <AdminButton onClick={() => setChangeRoleModalUser(null)} variant="secondary" size="md">रद्द</AdminButton>
          <AdminButton
            onClick={handleChangeRoleSubmit}
            variant="primary"
            size="md"
            loading={actionLoading}
            loadingText="अपडेट…"
            disabled={newSelectedRole === changeRoleModalUser?.role}
          >
            रोल पुष्टि करें
          </AdminButton>
        </AdminModalFooter>
      </AdminModal>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* STATUS CHANGE CONFIRM DIALOG                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <ConfirmDialog
        isOpen={!!statusModalUser}
        title={statusModalUser?.action === 'activate' ? 'खाता पुनः सक्रिय करें' : 'खाता निलंबित करें'}
        message={statusModalUser ? `${statusModalUser.user.displayName} (${statusModalUser.user.email}) का खाता ${statusModalUser.action === 'activate' ? 'पुनः सक्रिय' : 'निलंबित'} किया जाएगा। ${statusModalUser.action === 'suspend' ? 'उनका सत्र समाप्त हो जाएगा।' : ''}` : ''}
        confirmText={statusModalUser?.action === 'activate' ? 'पुनः सक्रिय करें' : 'निलंबित करें'}
        cancelText="रद्द करें"
        isDestructive={statusModalUser?.action === 'suspend'}
        onConfirm={handleStatusSubmit}
        onCancel={() => setStatusModalUser(null)}
      />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* EDIT PROFILE MODAL                                                 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <AdminModal open={!!editProfileModalUser} onOpenChange={(o) => { if (!o) setEditProfileModalUser(null); }} className="max-w-md">
        <AdminModalHeader>
          <AdminModalTitle>प्रोफ़ाइल संपादित करें</AdminModalTitle>
          <AdminModalClose onClick={() => setEditProfileModalUser(null)} />
        </AdminModalHeader>
        <AdminModalBody>
          <form onSubmit={handleEditProfileSubmit} className="space-y-3 text-xs font-bold text-stone-700" id="edit-profile-form">
            <div><label className="block mb-1">पूरा नाम</label><input value={editDisplayName} onChange={(e) => setEditDisplayName(e.target.value)} className="admin-input" /></div>
            <div><label className="block mb-1">फोन</label><input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="admin-input" /></div>
            <div><label className="block mb-1">शहर</label><input value={editCity} onChange={(e) => setEditCity(e.target.value)} className="admin-input" /></div>
            <div><label className="block mb-1">आध्यात्मिक ध्येय</label><input value={editMotto} onChange={(e) => setEditMotto(e.target.value)} className="admin-input" /></div>
            <div><label className="block mb-1">दीक्षा गुरु</label><input value={editGuru} onChange={(e) => setEditGuru(e.target.value)} className="admin-input" /></div>
          </form>
        </AdminModalBody>
        <AdminModalFooter>
          <AdminButton onClick={() => setEditProfileModalUser(null)} variant="secondary" size="md">रद्द</AdminButton>
          <AdminButton type="submit" form="edit-profile-form" variant="primary" size="md" loading={actionLoading} loadingText="अपडेट…">
            सहेजें
          </AdminButton>
        </AdminModalFooter>
      </AdminModal>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* PASSWORD RESET CONFIRM DIALOG                                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <ConfirmDialog
        isOpen={!!resetPasswordModalUser}
        title="पासवर्ड रीसेट लिंक भेजें"
        message={resetPasswordModalUser ? `${resetPasswordModalUser.email} पर पासवर्ड रीसेट लिंक भेजा जाएगा।` : ''}
        confirmText="रीसेट लिंक भेजें"
        cancelText="रद्द करें"
        isDestructive={false}
        onConfirm={handleSendPasswordReset}
        onCancel={() => setResetPasswordModalUser(null)}
      />
    </div>
  );
};
