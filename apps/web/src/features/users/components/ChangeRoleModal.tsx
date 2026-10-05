import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import type { UserProfile, UserRole } from '../../../types/common/index';
import {
  AdminModal,
  AdminModalHeader,
  AdminModalTitle,
  AdminModalClose,
  AdminModalBody,
  AdminModalFooter,
  AdminButton,
} from '../../../components/admin';
import { ROLE_CONFIG } from './UserTableRow';

export interface ChangeRoleModalProps {
  user: UserProfile | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (targetUid: string, newRole: UserRole) => Promise<boolean>;
  loading: boolean;
  isDeveloperSuperAdmin: boolean;
}

export const ChangeRoleModal: React.FC<ChangeRoleModalProps> = ({
  user,
  open,
  onClose,
  onSubmit,
  loading,
  isDeveloperSuperAdmin,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('mobile_user');

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;
    await onSubmit(user.uid, selectedRole);
  };

  const isUnchanged = user?.role === selectedRole;

  return (
    <AdminModal open={open} onOpenChange={(o) => { if (!o) onClose(); }} className="max-w-md">
      <AdminModalHeader>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-600" />
          <AdminModalTitle>रोल परिवर्तन (IAM Role Assignment)</AdminModalTitle>
        </div>
        <AdminModalClose onClick={onClose} />
      </AdminModalHeader>

      <AdminModalBody>
        <div className="space-y-4 text-xs">
          {/* Target user details */}
          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-stone-900 text-sm">{user?.displayName || 'अनाम भक्त'}</span>
              <span className="text-[0.68rem] font-mono text-stone-400">{user?.uid.slice(0, 10)}…</span>
            </div>
            <p className="text-stone-500 text-[0.72rem]">{user?.email}</p>
            <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-stone-700">
              <span>वर्तमान रोल:</span>
              <span className="font-black text-amber-800">
                {user ? (ROLE_CONFIG[user.role]?.label || user.role) : '—'}
              </span>
            </div>
          </div>

          {/* Role selector */}
          <div>
            <label className="block mb-1.5 font-bold text-stone-800">नया रोल चुनें *</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="admin-select font-semibold"
            >
              <option value="mobile_user">mobile_user (सत्संगी भक्त)</option>
              <option value="client_super_admin">client_super_admin (क्लाइंट एडमिन)</option>
              {isDeveloperSuperAdmin && (
                <option value="developer_super_admin">developer_super_admin (डेवलपर सुपर एडमिन)</option>
              )}
            </select>
          </div>

          {/* Security warning notice */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[0.7rem] text-amber-900 leading-relaxed font-medium">
            <strong className="flex items-center gap-1.5 text-amber-800 mb-0.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              सुरक्षा प्रभाव (Security Impact):
            </strong>
            रोल परिवर्तन पर Firebase Custom Claims तुरंत बैकएंड द्वारा अपडेट किए जाएंगे। यदि विशेषाधिकार घटाए जाते हैं, तो उपयोगकर्ता के वर्तमान सत्र (refresh tokens) स्वचालित रूप से निरस्त हो जाएंगे।
          </div>
        </div>
      </AdminModalBody>

      <AdminModalFooter>
        <AdminButton onClick={onClose} variant="secondary" size="md" disabled={loading}>
          रद्द करें
        </AdminButton>
        <AdminButton
          onClick={handleSubmit}
          variant="primary"
          size="md"
          loading={loading}
          loadingText="अपडेट हो रहा…"
          disabled={isUnchanged || loading}
        >
          रोल पुष्टि करें
        </AdminButton>
      </AdminModalFooter>
    </AdminModal>
  );
};
