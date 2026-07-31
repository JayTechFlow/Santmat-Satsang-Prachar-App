import { useState } from 'react';
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
import { SearchBar } from '../components/ui/SearchBar';
import { FilterBar } from '../components/ui/FilterBar';
import { BulkActionBar } from '../components/ui/BulkActionBar';
import { Pagination } from '../components/ui/Pagination';
import { ImageUpload } from '../components/ui/ImageUpload';
import { UserStatusBadge } from '../features/users/components/UserStatusBadge';
import { UserAvatar } from '../features/users/components/UserAvatar';

export function Users() {
  const {
    data: items,
    loading,
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

  const columns: Column<UserDTO>[] = [
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
      key: 'role',
      header: 'Role & Dept',
      render: (item) => (
        <div className="flex flex-col gap-1">
          <div className="text-sm text-heading flex items-center">
            {item.designation || 'Staff'} {item.roleIds?.includes('super_admin') && <Shield size={12} className="text-primary ml-1 inline" />}
          </div>
          <div className="text-xs text-muted">
            {item.department || 'General'}
          </div>
        </div>
      )
    },
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
      render: (item) => <UserStatusBadge status={item.status} />
    },
      key: 'actions',
      header: 'Actions',
      render: (item) => {
        return (
          <div className="flex gap-2 justify-end">
            <button className="btn-icon" onClick={(e) => { e.stopPropagation(); openEdit(item); }} title="Edit User">
              <Edit2 size={18} />
            </button>
            <button className="btn-icon danger" onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); }} title="Delete User">
              <Trash2 size={18} />
            </button>
          </div>
        );
      }
    }
  ];

  const isLoading = loading || mutating || isProcessing;

  return (
    <div className="pb-8 max-w-7xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title mb-1">User Management</h1>
          <p className="text-muted text-sm">
            Manage staff accounts, RBAC roles, and system access
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={18} /> Add User
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <SearchBar value={searchTerm} onSearch={setSearchTerm} placeholder="Search by name..." />
        <FilterBar
          options={[
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
            { label: 'Suspended', value: 'suspended' },
            { label: 'Archived', value: 'archived' }
          ]}
          value={statusFilter}
          onChange={(val) => setStatusFilter(val as any)}
          placeholder="All Statuses"
        />
        <FilterBar
          options={[
            { label: 'IT', value: 'IT' },
            { label: 'Content', value: 'Content' },
            { label: 'Management', value: 'Management' }
          ]}
          value={departmentFilter}
          onChange={(val) => setDepartmentFilter(val as any)}
          placeholder="All Departments"
        />
      </div>

      <div className="card p-0 overflow-hidden relative">
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black-40 backdrop-blur flex items-start justify-center z-50 p-4 overflow-y-auto" onClick={() => !isLoading && setIsModalOpen(false)}>
          <div className="card w-full max-w-4xl my-8 p-8 shadow-float" onClick={(e) => e.stopPropagation()}>
            {isLoading && <LoadingOverlay message="Saving..." />}
            <div className="flex-between mb-6 pb-4 border-b">
              <div className="flex items-center gap-2">
                <UsersIcon size={20} className="text-primary" />
                <h2 className="text-heading font-semibold text-xl m-0">
                  {editingId ? 'Edit User Profile' : 'Add New User'}
                </h2>
              </div>
              <button className="btn-icon" onClick={() => !isLoading && setIsModalOpen(false)} disabled={isLoading}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-[1fr_2fr] gap-6">
                {/* Left Column - Avatar & Status */}
                <div className="flex flex-col gap-4">
                  <div className="form-group mb-0 text-center">
                    <label className="form-label">Profile Photo</label>
                    <ImageUpload 
                      folder="avatars"
                      previewUrl={avatarUrl}
                      onUploadComplete={setAvatarUrl}
                      onClear={() => setAvatarUrl('')}
                      onFileSelect={() => {}}
                    />
                  </div>
                  
                  <div className="form-group mb-0">
                    <label className="form-label">Account Status</label>
                    <select className="form-select" value={status} onChange={e => setStatus(e.target.value as UserStatus)} disabled={isLoading}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div className="form-group mb-0">
                    <label className="form-label">Security Settings</label>
                    <label className="flex items-center gap-2 cursor-pointer mb-2">
                      <input 
                        type="checkbox" 
                        checked={emailVerified} 
                        onChange={e => setEmailVerified(e.target.checked)} 
                        disabled={isLoading}
                      />
                      <span className="text-sm">Email Verified</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={twoFactorEnabled} 
                        onChange={e => setTwoFactorEnabled(e.target.checked)} 
                        disabled={isLoading}
                      />
                      <span className="text-sm">Require 2FA</span>
                    </label>
                  </div>
                </div>

                {/* Right Column - Information */}
                <div className="flex flex-col gap-4">
                  <div className="form-group mb-0">
                    <label className="form-label">Full Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={fullName} 
                      onChange={e => setFullName(e.target.value)} 
                      required 
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group mb-0">
                      <label className="form-label">Email Address <span className="text-danger">*</span></label>
                      <input 
                        type="email" 
                        className="form-input" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        required 
                        disabled={isLoading}
                      />
                    </div>
                    <div className="form-group mb-0">
                      <label className="form-label">Phone Number</label>
                      <input 
                        type="tel" 
                        className="form-input" 
                        value={phone} 
                        onChange={e => setPhone(e.target.value)} 
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group mb-0">
                      <label className="form-label">Employee ID</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={employeeId} 
                        onChange={e => setEmployeeId(e.target.value)} 
                        disabled={isLoading}
                      />
                    </div>
                    <div className="form-group mb-0">
                      <label className="form-label">System Role</label>
                      <select 
                        className="form-select" 
                        value={roleIds[0] || ''} 
                        onChange={e => setRoleIds([e.target.value])} 
                        disabled={isLoading}
                      >
                        <option value="">No Role Assigned</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="content_manager">Content Manager</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group mb-0">
                      <label className="form-label">Designation</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={designation} 
                        onChange={e => setDesignation(e.target.value)} 
                        disabled={isLoading}
                      />
                    </div>
                    <div className="form-group mb-0">
                      <label className="form-label">Department</label>
                      <input 
                        type="text" 
                        className="form-input" 
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
