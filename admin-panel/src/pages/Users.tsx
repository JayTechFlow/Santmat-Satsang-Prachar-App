import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, Users as UsersIcon, Shield, Ban, CheckCircle } from 'lucide-react';

import { useUsers } from '../features/users/hooks/useUsers';
import { useUserMutations } from '../features/users/hooks/useUserMutations';
import { useTableSelection } from '../hooks/useTableSelection';
import { useBulkActions } from '../hooks/useBulkActions';
import type { UserDTO, UserStatus } from '../features/users/types';

import { DataTable } from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { SearchBar } from '../components/ui/SearchBar';
import { FilterBar } from '../components/ui/FilterBar';
import { BulkActionBar } from '../components/ui/BulkActionBar';
import { Pagination } from '../components/ui/Pagination';
import { ImageUpload } from '../components/ui/ImageUpload';
import { StatusBadge } from '../components/ui/Badge';
import { UserAvatar } from '../features/users/components/UserAvatar';
import { usePermissions, PermissionGate } from '../core/auth/PermissionContext';

export function Users() {
  const {
    data: items,
    loading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    departmentFilter,
    setDepartmentFilter,
    currentPage,
    setCurrentPage,
    totalPages
  } = useUsers();

  const { createUser, updateUser, deleteUser, changeStatus, loading: mutating } = useUserMutations(refetch);
  usePermissions();

  const {
    selectedIds,
    selectedCount,
    toggleSelection,
    selectAll,
    clearSelection
  } = useTableSelection<string>();

  const { isProcessing, executeBulkAction } = useBulkActions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Bulk actions states
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [status, setStatus] = useState<UserStatus>('active');
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [emailVerified, setEmailVerified] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setEmployeeId('');
    setDesignation('');
    setDepartment('');
    setAvatarUrl('');
    setStatus('active');
    setRoleIds([]);
    setEmailVerified(false);
    setTwoFactorEnabled(false);
  };

  const openEdit = (item: UserDTO) => {
    setEditingId(item.id);
    setFullName(item.fullName || '');
    setEmail(item.email || '');
    setPhone(item.phone || '');
    setEmployeeId(item.employeeId || '');
    setDesignation(item.designation || '');
    setDepartment(item.department || '');
    setAvatarUrl(item.avatarUrl || '');
    setStatus(item.status || 'active');
    setRoleIds(item.roleIds || []);
    setEmailVerified(item.emailVerified || false);
    setTwoFactorEnabled(item.twoFactorEnabled || false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      fullName,
      email,
      phone,
      employeeId,
      designation,
      department,
      avatarUrl,
      status,
      roleIds,
      emailVerified,
      phoneVerified: false,
      twoFactorEnabled,
    };

    let success = false;
    if (editingId) {
      success = await updateUser(editingId, payload);
    } else {
      success = !!(await createUser(payload));
    }

    if (success) {
      setIsModalOpen(false);
      resetForm();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    await deleteUser(deleteId);
    setDeleteId(null);
    clearSelection();
  };

  const handleBulkDelete = async () => {
    await executeBulkAction(selectedIds, deleteUser);
    setBulkDeleteConfirm(false);
    clearSelection();
  };

  const handleBulkStatusChange = async (newStatus: UserStatus) => {
    await executeBulkAction(selectedIds, (id) => changeStatus(id, newStatus));
    clearSelection();
  };

  const columns: Column<UserDTO>[] = React.useMemo(() => [
    {
      key: 'profile',
      header: 'User Profile',
      render: (item) => (
        <div className="flex items-center gap-3">
          <UserAvatar avatarUrl={item.avatarUrl} fullName={item.fullName} size={40} />
          <div>
            <div className="font-semibold text-heading">{item.fullName}</div>
            <div className="text-xs text-muted">{item.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role & Dept',
      render: (item) => (
        <div className="flex flex-col gap-1">
          <div className="text-sm text-heading flex items-center">
            {item.designation || 'Staff'} {item.roleIds?.includes('developer_super_admin') && <Shield size={12} className="text-primary ml-1 inline" />}
          </div>
          <div className="text-xs text-muted">
            {item.department || 'General'}
          </div>
        </div>
      )
    },
    {
      key: 'security',
      header: 'Security',
      render: (item) => (
        <div className="flex flex-col gap-1 text-xs">
          <div className={`flex items-center gap-1 ${item.emailVerified ? 'text-success' : 'text-muted'}`}>
            <CheckCircle size={12} /> {item.emailVerified ? 'Email Verified' : 'Unverified Email'}
          </div>
          <div className={`flex items-center gap-1 ${item.twoFactorEnabled ? 'text-success' : 'text-muted'}`}>
            <Shield size={12} /> {item.twoFactorEnabled ? '2FA Enabled' : '2FA Disabled'}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => {
        return (
          <div className="flex gap-2 justify-end">
            <PermissionGate permission="users.update" fallback={null}>
              <button className="btn-icon" onClick={(e) => { e.stopPropagation(); openEdit(item); }} title="Edit User" aria-label="Edit user">
                <Edit2 size={18} />
              </button>
            </PermissionGate>
            <PermissionGate permission="users.delete" fallback={null}>
              <button className="btn-icon danger" onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); }} title="Delete User" aria-label="Delete user">
                <Trash2 size={18} />
              </button>
            </PermissionGate>
          </div>
        );
      }
    }
  ], []);

  const isLoading = loading || mutating || isProcessing;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-['Mukta'] select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="font-extrabold text-xl text-stone-900 leading-tight">
            सत्संगी भक्त समुदाय एवं उपयोगकर्ता प्रबंधन
          </h1>
          <p className="text-xs text-stone-600 font-medium">
            भक्त प्रोफाइल, साधना विवरण, भूमिका आवंटन एवं खाता सुरक्षा प्रबंधन
          </p>
        </div>
        <PermissionGate permission="users.create" fallback={null}>
          <button
            className="flex items-center gap-2 px-4 py-2.5 bg-[#EA580C] hover:bg-[#C45A0A] text-white rounded-xl font-bold text-xs shadow-sm transition-all"
            onClick={() => { resetForm(); setIsModalOpen(true); }}
          >
            <Plus size={16} />
            <span>नया उपयोगकर्ता जोड़ें</span>
          </button>
        </PermissionGate>
      </div>

      <div className="flex flex-wrap gap-3 bg-white p-4 rounded-3xl border border-stone-200 shadow-sm">
        <SearchBar value={searchTerm} onSearch={setSearchTerm} placeholder="नाम या ईमेल से खोजें..." />
        <FilterBar
          options={[
            { label: 'सक्रिय (Active)', value: 'active' },
            { label: 'निष्क्रिय (Inactive)', value: 'inactive' },
            { label: 'निलंबित (Suspended)', value: 'suspended' },
            { label: 'असंग्रहीत (Archived)', value: 'archived' }
          ]}
          value={statusFilter}
          onChange={(val) => setStatusFilter(val as any)}
          placeholder="सभी स्थितियाँ"
        />
        <FilterBar
          options={[
            { label: 'IT', value: 'IT' },
            { label: 'Content', value: 'Content' },
            { label: 'Management', value: 'Management' }
          ]}
          value={departmentFilter}
          onChange={(val) => setDepartmentFilter(val as any)}
          placeholder="सभी विभाग"
        />
      </div>

      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs">
        {isLoading && <LoadingOverlay message="Processing..." />}
        
        {items.length > 0 ? (
          <>
            <DataTable<UserDTO>
              data={items}
              columns={columns}
              keyExtractor={(item) => item.id}
              selectable={true}
              selectedIds={selectedIds}
              onToggleSelection={toggleSelection}
              onSelectAll={selectAll}
              onClearSelection={clearSelection}
            />
            <div className="p-4 border-t">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </>
        ) : !loading && error ? (
          <div className="py-12">
            <ErrorState title="Failed to load users" message={error.message} onRetry={refetch} />
          </div>
        ) : !loading && (
          <div className="py-12">
            <EmptyState 
              title="No Users Found" 
              message="No staff accounts match the current filters." 
              icon={<UsersIcon size={48} />}
            />
          </div>
        )}
      </div>

      <PermissionGate permission="users.delete" fallback={null}>
        <BulkActionBar 
          selectedCount={selectedCount}
          onClearSelection={clearSelection}
          onDelete={() => setBulkDeleteConfirm(true)}
          customActions={[
            {
              label: 'Suspend',
              icon: <Ban size={16} />,
              onClick: () => handleBulkStatusChange('suspended')
            },
            {
              label: 'Activate',
              icon: <CheckCircle size={16} />,
              onClick: () => handleBulkStatusChange('active')
            }
          ]}
        />
      </PermissionGate>

      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => !isLoading && setIsModalOpen(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-4xl w-full shadow-2xl border border-stone-200" onClick={(e) => e.stopPropagation()}>
            {isLoading && <LoadingOverlay message="Saving..." />}
            <div className="flex flex-col items-start gap-4 pb-4 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <UsersIcon size={20} className="text-primary" />
                <h2 className="text-heading font-semibold text-xl m-0">
                  {editingId ? 'Edit User Profile' : 'Add New User'}
                </h2>
              </div>
              <button className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 btn-icon" onClick={() => !isLoading && setIsModalOpen(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-[1fr_2fr] gap-6 bg-stone-50 rounded-3xl p-6">
                {/* Left Column - Avatar & Status */}
                <div className="flex flex-col gap-4">
                  <div className="form-group mb-0">
                    <label className="form-label text-xs font-medium text-stone-700 mb-1">Profile Photo</label>
<div className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3.5">
                        <ImageUpload 
                          folder="avatars"
                          previewUrl={avatarUrl}
                          onUploadComplete={setAvatarUrl}
                          onClear={() => setAvatarUrl('')}
                          onFileSelect={() => {}}
                        />
                      </div>
                  </div>
                  
                  <div className="form-group mb-0">
                    <label className="form-label text-xs font-medium text-stone-700 mb-1">Account Status</label>
                    <select className="form-select w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 shadow-sm select-none" id="user-status" value={status} onChange={e => setStatus(e.target.value as UserStatus)} disabled={isLoading}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div className="form-group mb-0">
                    <label className="form-label text-xs font-medium text-stone-700 mb-1">Security Settings</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={emailVerified} 
                          onChange={e => setEmailVerified(e.target.checked)} 
                          className="checkbox bg-stone-200 rounded border w-4 h-4 focus:ring-2 focus-ring-primary focus-outline-none"
                          disabled={isLoading}
                        />
                        <span className="text-sm text-stone-600">Email Verified</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={twoFactorEnabled} 
                          onChange={e => setTwoFactorEnabled(e.target.checked)} 
                          className="checkbox bg-stone-200 rounded border w-4 h-4 focus:ring-2 focus-ring-primary focus-outline-none"
                          disabled={isLoading}
                        />
                        <span className="text-sm text-stone-600">Require 2FA</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right Column - Information */}
                <div className="flex flex-col gap-4">
                  <div className="form-group mb-0">
                    <label className="form-label text-xs font-medium text-stone-700 mb-1">Full Name <span className="text-danger">*</span></label>
                    <input 
                      type="text" 
                      className="form-input w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3.5 text-stone-900 placeholder-stone-400 focus:ring-2 focus-ring-primary focus-outline-none"
                      id="user-full-name"
                      value={fullName} 
                      onChange={e => setFullName(e.target.value)} 
                      required 
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
<div className="form-group mb-0">
                    <label className="form-label text-xs font-medium text-stone-700 mb-1">Email Address <span className="text-danger">*</span></label>
                    <input 
                      type="email" 
                      className="form-input w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3.5 text-stone-900 placeholder-stone-400 focus:ring-2 focus-ring-primary focus-outline-none"
                      id="user-email"
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required 
                      disabled={isLoading}
                    />
                    </div>
                    <div className="form-group mb-0">
                    <label className="form-label text-xs font-medium text-stone-700 mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      className="form-input w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3.5 text-stone-900 placeholder-stone-400 focus:ring-2 focus-ring-primary focus-outline-none"
                      id="user-phone"
                      value={phone} 
                      onChange={e => setPhone(e.target.value)} 
                      disabled={isLoading}
                    />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group mb-0">
                    <label className="form-label text-xs font-medium text-stone-700 mb-1">Employee ID</label>
                    <input 
                      type="text" 
                      className="form-input w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3.5 text-stone-900 placeholder-stone-400 focus:ring-2 focus-ring-primary focus-outline-none"
                      id="user-employee-id"
                      value={employeeId} 
                      onChange={e => setEmployeeId(e.target.value)} 
                      disabled={isLoading}
                    />
                    </div>
                    <div className="form-group mb-0">
                    <label className="form-label text-xs font-medium text-stone-700 mb-1">System Role</label>
                    <div className="relative">
                      <select 
                        className="form-select w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 text-stone-900 focus:ring-2 focus-ring-primary focus-outline-none appearance-none pl-10"
                        id="user-system-role"
                        value={roleIds[0] || ''} 
                        onChange={e => setRoleIds([e.target.value])} 
                        disabled={isLoading}
                      >
                        <option value="">No Role Assigned</option>
                        <option value="developer_super_admin">Developer Super Admin</option>
                        <option value="client_super_admin">Client Super Admin</option>
                        <option value="mobile_user">Mobile User</option>
                      </select>
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" fill="none" stroke="currentColor">
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group mb-0">
                    <label className="form-label text-xs font-medium text-stone-700 mb-1">Designation</label>
                    <input 
                      type="text" 
                      className="form-input w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3.5 text-stone-900 placeholder-stone-400 focus:ring-2 focus-ring-primary focus-outline-none"
                      id="user-designation"
                      value={designation} 
                      onChange={e => setDesignation(e.target.value)} 
                      disabled={isLoading}
                    />
                    </div>
                    <div className="form-group mb-0">
                    <label className="form-label text-xs font-medium text-stone-700 mb-1">Department</label>
                    <input 
                      type="text" 
                      className="form-input w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3.5 text-stone-900 placeholder-stone-400 focus:ring-2 focus-ring-primary focus-outline-none"
                      id="user-department"
                      value={department} 
                      onChange={e => setDepartment(e.target.value)} 
                      disabled={isLoading}
                    />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8 pt-4 border-t">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)} disabled={isLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {editingId ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete User"
        message="Are you sure you want to permanently delete this user account? The associated authentication record and data will be removed."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmDialog
        isOpen={bulkDeleteConfirm}
        title="Delete Multiple Users"
        message={`Are you sure you want to delete ${selectedCount} selected users? This action cannot be undone.`}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />
    </div>
  );
}
