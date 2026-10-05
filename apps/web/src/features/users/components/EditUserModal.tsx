import React, { useState, useEffect } from 'react';
import { Edit3 } from 'lucide-react';
import type { UserProfile } from '../../../types/common/index';
import {
  AdminModal,
  AdminModalHeader,
  AdminModalTitle,
  AdminModalClose,
  AdminModalBody,
  AdminModalFooter,
  AdminButton,
} from '../../../components/admin';

export interface EditUserModalProps {
  user: UserProfile | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (targetUid: string, updates: {
    displayName: string;
    phone: string;
    city: string;
    spiritualMotto: string;
    dikshaGuru: string;
  }) => Promise<boolean>;
  loading: boolean;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  open,
  onClose,
  onSubmit,
  loading,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [spiritualMotto, setSpiritualMotto] = useState('');
  const [dikshaGuru, setDikshaGuru] = useState('');

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhone(user.phone || '');
      setCity(user.city || '');
      setSpiritualMotto(user.spiritualMotto || '');
      setDikshaGuru(user.dikshaGuru || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await onSubmit(user.uid, {
      displayName: displayName.trim(),
      phone: phone.trim(),
      city: city.trim(),
      spiritualMotto: spiritualMotto.trim(),
      dikshaGuru: dikshaGuru.trim(),
    });
  };

  return (
    <AdminModal open={open} onOpenChange={(o) => { if (!o) onClose(); }} className="max-w-md">
      <AdminModalHeader>
        <div className="flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-amber-600" />
          <AdminModalTitle>प्रोफ़ाइल संपादित करें (Edit Profile)</AdminModalTitle>
        </div>
        <AdminModalClose onClick={onClose} />
      </AdminModalHeader>

      <AdminModalBody>
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-bold text-stone-700" id="edit-user-form">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-[0.68rem] text-stone-400 block font-normal">ईमेल (अपरिवर्तनीय)</span>
            <span className="text-stone-800 font-semibold">{user?.email || '—'}</span>
          </div>

          <div>
            <label className="block mb-1 text-stone-800">पूरा नाम (Full Name) *</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="admin-input"
            />
          </div>

          <div>
            <label className="block mb-1 text-stone-800">फोन नंबर (Phone)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              className="admin-input"
            />
          </div>

          <div>
            <label className="block mb-1 text-stone-800">शहर / स्थान (City / Location)</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="उदा. भागलपुर, बिहार"
              className="admin-input"
            />
          </div>

          <div>
            <label className="block mb-1 text-stone-800">आध्यात्मिक ध्येय (Spiritual Motto)</label>
            <input
              type="text"
              value={spiritualMotto}
              onChange={(e) => setSpiritualMotto(e.target.value)}
              placeholder="उदा. गुरु सेवा ही परम धर्म"
              className="admin-input"
            />
          </div>

          <div>
            <label className="block mb-1 text-stone-800">दीक्षा गुरु (Diksha Guru)</label>
            <input
              type="text"
              value={dikshaGuru}
              onChange={(e) => setDikshaGuru(e.target.value)}
              placeholder="उदा. पूज्यपाद महर्षि मेँहीँ परमहंस जी महाराज"
              className="admin-input"
            />
          </div>
        </form>
      </AdminModalBody>

      <AdminModalFooter>
        <AdminButton onClick={onClose} variant="secondary" size="md" disabled={loading}>
          रद्द करें
        </AdminButton>
        <AdminButton
          type="submit"
          form="edit-user-form"
          variant="primary"
          size="md"
          loading={loading}
          loadingText="सहेज रहे हैं…"
        >
          परिवर्तन सहेजें
        </AdminButton>
      </AdminModalFooter>
    </AdminModal>
  );
};
