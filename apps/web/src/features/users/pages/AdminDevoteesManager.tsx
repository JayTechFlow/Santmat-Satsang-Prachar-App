/**
 * ============================================================================
 * Santmat Satsang Prachar - Enterprise User Management & IAM Control Plane
 * ============================================================================
 * Production Route: /admin/users
 * Mode: Deep Production Improvement (Functional + UI/UX + Security + Performance)
 *
 * Real Firebase Auth + Firestore + Cloud Functions user directory.
 * No mock data, no hardcoded users, no fake permissions.
 *
 * Data flow:
 *   useUsers hook → userService.subscribeUsers / userService.getUsers
 *   IAM actions → userService → Cloud Functions (iam-setUserRole, userProv-createUser)
 *   Profile edits → userService.updateUserProfile → Firestore direct write
 *   Status changes → userService.updateUserStatus → Firestore → syncUserCustomClaims trigger
 *   Permanent delete → userService.deleteUserPermanently → userProv-deleteUserPermanently
 */
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Shield, UserPlus, RefreshCw, Download, CheckCircle2,
  AlertCircle, AlertTriangle, X
} from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { usePermissions } from '../../../app/providers/PermissionContext';
import type { UserProfile, UserRole, UserAccountStatus } from '../../../types/common/index';
import { userService } from '../services/userService';
import { authService } from '../../auth/services/authService';
import {
  AdminPageHeader,
  AdminDeleteDialog,
  AdminButton,
  AdminConfirmDialog,
} from '../../../components/admin';
import { UserStatsStrip } from '../components/UserStatsStrip';
import { UserFilterBar, UserSortOption } from '../components/UserFilterBar';
import { UserTable } from '../components/UserTable';
import { ROLE_CONFIG } from '../components/UserTableRow';
import { UserProfileDrawer } from '../components/UserProfileDrawer';
import { CreateUserModal, CreateUserData } from '../components/CreateUserModal';
import { EditUserModal } from '../components/EditUserModal';
import { ChangeRoleModal } from '../components/ChangeRoleModal';

export const AdminDevoteesManager: React.FC = () => {
  const {
    users: backendUsers,
    loading: usersLoading,
    error: usersError,
    refreshUsers,
    clearError: clearUsersError,
    updateUserRole,
    updateUserStatus,
    deleteUserPermanently,
  } = useUsers();

  const { isDeveloperSuperAdmin, isClientSuperAdmin, user: currentAuthUser } = usePermissions();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | UserAccountStatus>('all');
  const [sortBy, setSortBy] = useState<UserSortOption>('newest');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Drawer state
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const [editProfileUser, setEditProfileUser] = useState<UserProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [changeRoleUser, setChangeRoleUser] = useState<UserProfile | null>(null);
  const [isChangingRole, setIsChangingRole] = useState(false);

  const [statusModalUser, setStatusModalUser] = useState<{ user: UserProfile; action: 'suspend' | 'activate' } | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [resetPasswordUser, setResetPasswordUser] = useState<UserProfile | null>(null);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const [permanentDeleteUser, setPermanentDeleteUser] = useState<UserProfile | null>(null);
  const [isPermanentlyDeleting, setIsPermanentlyDeleting] = useState(false);

  // Feedback notifications
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Debounce search input (250ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Auto-hide feedback notifications after 5 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Check if any filter or search is active
  const hasActiveFilters = Boolean(
    searchQuery.trim() || roleFilter !== 'all' || statusFilter !== 'all' || sortBy !== 'newest'
  );

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearch('');
    setRoleFilter('all');
    setStatusFilter('all');
    setSortBy('newest');
    setCurrentPage(1);
  }, []);

  // Filtered & sorted users list
  const filteredUsers = useMemo(() => {
    let result = [...(backendUsers || [])];

    // Search query across multiple fields
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

    // Role filter
    if (roleFilter !== 'all') {
      result = result.filter((u) => u.role === roleFilter);
    }

    // Status filter (supporting both accountStatus and status)
    if (statusFilter !== 'all') {
      result = result.filter(
        (u) => u.accountStatus === statusFilter || u.status === statusFilter
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortBy === 'lastActive') {
        return new Date(b.lastActiveAt || 0).getTime() - new Date(a.lastActiveAt || 0).getTime();
      }
      return (a.displayName || a.email || '').localeCompare(b.displayName || b.email || '');
    });

    return result;
  }, [backendUsers, debouncedSearch, roleFilter, statusFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Export CSV
  const handleExportCsv = useCallback(() => {
    if (!filteredUsers.length) return;
    const headers = ['UID', 'Display Name', 'Email', 'Phone', 'Role', 'Status', 'City', 'Created At', 'Last Active At'];
    const rows = filteredUsers.map((u) => [
      `"${u.uid}"`,
      `"${(u.displayName || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      `"${(u.phone || '').replace(/"/g, '""')}"`,
      `"${u.role}"`,
      `"${u.accountStatus || u.status || 'active'}"`,
      `"${(u.city || '').replace(/"/g, '""')}"`,
      `"${u.createdAt || ''}"`,
      `"${u.lastActiveAt || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `santmat_users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setFeedback({
      type: 'success',
      message: `${filteredUsers.length} उपयोगकर्ताओं का विवरण CSV में सफलतापूर्वक निर्यात किया गया।`,
    });
  }, [filteredUsers]);

  // Action Handlers
  const handleViewDetails = useCallback((user: UserProfile) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  }, []);

  const handleCreateUserSubmit = async (data: CreateUserData): Promise<boolean> => {
    setIsCreatingUser(true);
    try {
      const res = await userService.createUser(data);
      if (res.success && res.data) {
        setFeedback({
          type: 'success',
          message: `नया उपयोगकर्ता सफलतापूर्वक बनाया गया: ${res.data.displayName} (${res.data.email})`,
        });
        setCreateModalOpen(false);
        return true;
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'उपयोगकर्ता निर्माण में त्रुटि उत्पन्न हुई।',
        });
        return false;
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'उपयोगकर्ता निर्माण में अप्रत्याशित त्रुटि।',
      });
      return false;
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleEditProfileSubmit = async (
    targetUid: string,
    updates: {
      displayName: string;
      phone: string;
      city: string;
      spiritualMotto: string;
      dikshaGuru: string;
    }
  ): Promise<boolean> => {
    setIsEditingProfile(true);
    try {
      const res = await userService.updateUserProfile(targetUid, updates);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: 'प्रोफ़ाइल विवरण सफलतापूर्वक अपडेट किया गया।',
        });
        setEditProfileUser(null);
        if (selectedUser?.uid === targetUid) {
          setSelectedUser((prev) => (prev ? { ...prev, ...updates } : null));
        }
        return true;
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'प्रोफ़ाइल अपडेट करने में विफलता।',
        });
        return false;
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'प्रोफ़ाइल संपादन में अप्रत्याशित त्रुटि।',
      });
      return false;
    } finally {
      setIsEditingProfile(false);
    }
  };

  const handleChangeRoleSubmit = async (targetUid: string, newRole: UserRole): Promise<boolean> => {
    setIsChangingRole(true);
    try {
      const res = await updateUserRole(targetUid, newRole);
      if (res.success) {
        const roleLabel = ROLE_CONFIG[newRole]?.label || newRole;
        setFeedback({
          type: 'success',
          message: `रोल सफलतापूर्वक अपडेट किया गया: ${roleLabel}`,
        });
        setChangeRoleUser(null);
        if (selectedUser?.uid === targetUid) {
          setSelectedUser((prev) => (prev ? { ...prev, role: newRole } : null));
        }
        return true;
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'रोल अपडेट करने में विफलता।',
        });
        return false;
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'रोल परिवर्तन में अप्रत्याशित त्रुटि।',
      });
      return false;
    } finally {
      setIsChangingRole(false);
    }
  };

  const handleToggleStatusSubmit = async () => {
    if (!statusModalUser) return;
    const { user, action } = statusModalUser;
    const nextStatus: UserAccountStatus = action === 'activate' ? 'active' : 'suspended';
    setIsUpdatingStatus(true);
    try {
      const res = await updateUserStatus(user.uid, nextStatus);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `खाता स्थिति सफलतापूर्वक बदली गई: ${user.displayName || user.email} → ${nextStatus === 'active' ? 'सक्रिय (Active)' : 'निलंबित (Suspended)'}`,
        });
        setStatusModalUser(null);
        if (selectedUser?.uid === user.uid) {
          setSelectedUser((prev) => (prev ? { ...prev, accountStatus: nextStatus, status: nextStatus } : null));
        }
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'खाता स्थिति अपडेट करने में विफलता।',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'स्थिति परिवर्तन में अप्रत्याशित त्रुटि।',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSendPasswordResetSubmit = async () => {
    if (!resetPasswordUser?.email) return;
    setIsSendingReset(true);
    try {
      const res = await authService.resetPassword(resetPasswordUser.email);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `पासवर्ड रीसेट लिंक ${resetPasswordUser.email} पर सफलतापूर्वक भेजा गया।`,
        });
        setResetPasswordUser(null);
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'पासवर्ड रीसेट लिंक भेजने में विफलता।',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'पासवर्ड रीसेट में अप्रत्याशित त्रुटि।',
      });
    } finally {
      setIsSendingReset(false);
    }
  };

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
            message: 'उपयोगकर्ता आंशिक रूप से हटाया गया। कुछ संसाधनों की प्रशासनिक समीक्षा आवश्यक है।',
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
      if (selectedUser?.uid === permanentDeleteUser?.uid) {
        setDrawerOpen(false);
        setSelectedUser(null);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-['Mukta'] select-none">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-md transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
          role="alert"
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="hover:opacity-75 cursor-pointer p-0.5"
            aria-label="सूचना बंद करें"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Subscription Error Banner */}
      {usersError && (
        <div
          className="p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-md bg-rose-50 text-rose-900 border border-rose-200"
          role="alert"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>उपयोगकर्ता डेटा लोड करने में समस्या: {usersError}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshUsers}
              className="px-2.5 py-1 bg-rose-200 hover:bg-rose-300 text-rose-900 rounded-lg text-xs font-black cursor-pointer transition-colors"
            >
              पुनः प्रयास करें
            </button>
            <button
              type="button"
              onClick={clearUsersError}
              className="hover:opacity-75 cursor-pointer p-0.5"
              aria-label="त्रुटि बंद करें"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Canonical Admin Page Header */}
      <AdminPageHeader
        title="उपयोगकर्ता प्रबंधन (User Management)"
        subtitle="Firebase Auth + Custom Claims + Firestore द्वारा संचालित। सभी डेटा वास्तविक है।"
        badgeText="पहचान एवं अधिकार नियंत्रण कक्ष (IAM)"
        icon={<Shield className="w-4 h-4" />}
        actions={
          <>
            <AdminButton
              onClick={refreshUsers}
              variant="secondary"
              size="md"
              icon={<RefreshCw className={`w-4 h-4 ${usersLoading ? 'animate-spin' : ''}`} />}
              title="डेटा रीलोड करें"
              disabled={usersLoading}
            >
              रिफ्रेश
            </AdminButton>
            <AdminButton
              onClick={handleExportCsv}
              variant="secondary"
              size="md"
              icon={<Download className="w-4 h-4" />}
              title="CSV फ़ाइल निर्यात करें"
              disabled={filteredUsers.length === 0}
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

      {/* 1. Canonical KPI Strip */}
      <UserStatsStrip users={backendUsers} loading={usersLoading} />

      {/* 2. Canonical Search & Filter Bar */}
      <UserFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        roleFilter={roleFilter}
        onRoleFilterChange={(r) => { setRoleFilter(r); setCurrentPage(1); }}
        statusFilter={statusFilter}
        onStatusFilterChange={(s) => { setStatusFilter(s); setCurrentPage(1); }}
        sortBy={sortBy}
        onSortByChange={(s) => setSortBy(s)}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 3. Canonical User Table */}
      <UserTable
        users={paginatedUsers}
        totalFilteredCount={filteredUsers.length}
        loading={usersLoading}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onPageSizeChange={(sz) => { setPageSize(sz); setCurrentPage(1); }}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
        currentAuthUid={currentAuthUser?.uid}
        isDeveloperSuperAdmin={isDeveloperSuperAdmin}
        isClientSuperAdmin={isClientSuperAdmin}
        onViewDetails={handleViewDetails}
        onEditProfile={(u) => setEditProfileUser(u)}
        onChangeRole={(u) => setChangeRoleUser(u)}
        onToggleStatus={(u) =>
          setStatusModalUser({
            user: u,
            action: (u.accountStatus === 'suspended' || u.status === 'suspended') ? 'activate' : 'suspend',
          })
        }
        onPermanentDelete={(u) => setPermanentDeleteUser(u)}
      />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* USER PROFILE DRAWER                                                */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {selectedUser && (
        <UserProfileDrawer
          user={selectedUser}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onChangeRole={(u) => { setDrawerOpen(false); setChangeRoleUser(u); }}
          onStatusChange={(u, action) => { setDrawerOpen(false); setStatusModalUser({ user: u, action }); }}
          onEditProfile={(u) => { setDrawerOpen(false); setEditProfileUser(u); }}
          onPasswordReset={(u) => { setDrawerOpen(false); setResetPasswordUser(u); }}
          onPermanentDelete={(u) => { setDrawerOpen(false); setPermanentDeleteUser(u); }}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CREATE USER MODAL                                                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <CreateUserModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateUserSubmit}
        loading={isCreatingUser}
      />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* EDIT PROFILE MODAL                                                 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <EditUserModal
        user={editProfileUser}
        open={!!editProfileUser}
        onClose={() => setEditProfileUser(null)}
        onSubmit={handleEditProfileSubmit}
        loading={isEditingProfile}
      />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CHANGE ROLE MODAL                                                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <ChangeRoleModal
        user={changeRoleUser}
        open={!!changeRoleUser}
        onClose={() => setChangeRoleUser(null)}
        onSubmit={handleChangeRoleSubmit}
        loading={isChangingRole}
        isDeveloperSuperAdmin={isDeveloperSuperAdmin}
      />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* STATUS CHANGE CONFIRM DIALOG                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <AdminConfirmDialog
        isOpen={!!statusModalUser}
        title={statusModalUser?.action === 'activate' ? 'खाता पुनः सक्रिय करें' : 'खाता निलंबित करें'}
        message={
          statusModalUser
            ? `${statusModalUser.user.displayName || statusModalUser.user.email} का खाता ${
                statusModalUser.action === 'activate' ? 'पुनः सक्रिय' : 'निलंबित'
              } किया जाएगा। ${
                statusModalUser.action === 'suspend'
                  ? 'सुरक्षा नियमों के अनुसार उनका वर्तमान सत्र समाप्त कर दिया जाएगा।'
                  : ''
              }`
            : ''
        }
        confirmText={statusModalUser?.action === 'activate' ? 'पुनः सक्रिय करें' : 'निलंबित करें'}
        cancelText="रद्द करें"
        isDestructive={statusModalUser?.action === 'suspend'}
        onConfirm={handleToggleStatusSubmit}
        onCancel={() => { if (!isUpdatingStatus) setStatusModalUser(null); }}
      />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* PASSWORD RESET CONFIRM DIALOG                                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <AdminConfirmDialog
        isOpen={!!resetPasswordUser}
        title="पासवर्ड रीसेट लिंक भेजें"
        message={
          resetPasswordUser
            ? `${resetPasswordUser.email} पर पासवर्ड रीसेट करने हेतु आधिकारिक लिंक भेजा जाएगा।`
            : ''
        }
        confirmText="रीसेट लिंक भेजें"
        cancelText="रद्द करें"
        isDestructive={false}
        onConfirm={handleSendPasswordResetSubmit}
        onCancel={() => { if (!isSendingReset) setResetPasswordUser(null); }}
      />

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
          {
            label: 'रोल',
            value: permanentDeleteUser
              ? ROLE_CONFIG[permanentDeleteUser.role]?.label || permanentDeleteUser.role
              : '—',
          },
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
        onCancel={() => {
          if (!isPermanentlyDeleting) setPermanentDeleteUser(null);
        }}
      />
    </div>
  );
};
export default AdminDevoteesManager;
