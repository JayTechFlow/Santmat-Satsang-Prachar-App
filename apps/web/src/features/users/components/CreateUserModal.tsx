import React, { useState } from 'react';
import { UserPlus, AlertTriangle } from 'lucide-react';
import type { UserRole, UserAccountStatus } from '../../../types/common/index';
import {
  AdminModal,
  AdminModalHeader,
  AdminModalTitle,
  AdminModalClose,
  AdminModalBody,
  AdminModalFooter,
  AdminButton,
} from '../../../components/admin';

export interface CreateUserData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  phone?: string;
  role: UserRole;
  initialStatus: UserAccountStatus;
}

export interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserData) => Promise<boolean>;
  loading: boolean;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  open,
  onClose,
  onSubmit,
  loading,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('mobile_user');
  const [initialStatus, setInitialStatus] = useState<UserAccountStatus>('active');
  const [phone, setPhone] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const resetForm = () => {
    setDisplayName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setRole('mobile_user');
    setInitialStatus('active');
    setPhone('');
    setValidationError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (password !== confirmPassword) {
      setValidationError('पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते। (Passwords do not match)');
      return;
    }

    if (password.length < 6) {
      setValidationError('पासवर्ड कम से कम 6 अक्षरों का होना चाहिए। (Password must be at least 6 characters)');
      return;
    }

    const success = await onSubmit({
      displayName: displayName.trim(),
      email: email.trim(),
      password,
      confirmPassword,
      role,
      initialStatus,
      phone: phone.trim() || undefined,
    });

    if (success) {
      resetForm();
    }
  };

  return (
    <AdminModal open={open} onOpenChange={(o) => { if (!o) handleClose(); }} className="max-w-lg">
      <AdminModalHeader>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#EA580C]">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <AdminModalTitle>नया उपयोगकर्ता बनाएं (Create User)</AdminModalTitle>
            <p className="text-[0.7rem] text-stone-500">Firebase Auth + Firestore प्रोफ़ाइल</p>
          </div>
        </div>
        <AdminModalClose onClick={handleClose} />
      </AdminModalHeader>

      <AdminModalBody>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-stone-700" id="create-user-form">
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[0.72rem] font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div>
            <label className="block mb-1 text-stone-800">पूरा नाम (Full Name) *</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="उदा. स्वामी रामानंद जी"
              className="admin-input"
            />
          </div>

          <div>
            <label className="block mb-1 text-stone-800">ईमेल (Email) *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="devotee@santmat.org"
              className="admin-input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-stone-800">पासवर्ड (Password) *</label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="न्यूनतम 6 अक्षर"
                className="admin-input"
              />
            </div>
            <div>
              <label className="block mb-1 text-stone-800">पासवर्ड पुष्टि (Confirm) *</label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="वही पासवर्ड दोबारा लिखें"
                className="admin-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-stone-800">रोल (Role) *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="admin-select"
              >
                <option value="mobile_user">mobile_user (सत्संगी भक्त)</option>
                <option value="client_super_admin">client_super_admin (क्लाइंट एडमिन)</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-stone-800">प्रारंभिक स्थिति (Status)</label>
              <select
                value={initialStatus}
                onChange={(e) => setInitialStatus(e.target.value as UserAccountStatus)}
                className="admin-select"
              >
                <option value="active">सक्रिय (Active)</option>
                <option value="suspended">निलंबित (Suspended)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-1 text-stone-800">फोन नंबर (वैकल्पिक)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              className="admin-input"
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[0.7rem] text-amber-900 font-medium">
            <strong>सुरक्षा नियम:</strong> उपयोगकर्ता Firebase Admin Auth तथा Firestore में पंजीकृत होगा। सुरक्षा मानकों के अनुसार Developer Super Admin खाते केवल सुरक्षित बैकएंड CLI द्वारा बनाए जा सकते हैं।
          </div>
        </form>
      </AdminModalBody>

      <AdminModalFooter>
        <AdminButton onClick={handleClose} variant="secondary" size="md" disabled={loading}>
          रद्द करें
        </AdminButton>
        <AdminButton
          type="submit"
          form="create-user-form"
          variant="primary"
          size="md"
          loading={loading}
          loadingText="सृजन हो रहा…"
        >
          खाता बनाएं
        </AdminButton>
      </AdminModalFooter>
    </AdminModal>
  );
};
