import React, { useState, useEffect } from 'react';
import { Edit3, Check, X } from 'lucide-react';
import { BannerEntity, BannerSlotNumber } from '../../../types/common/index';
import {
  AdminButton,
  AdminField,
} from '../../../components/admin';
import { TARGET_SCREEN_LABELS } from './BannerSlotCard';

export interface BannerEditModalProps {
  isOpen: boolean;
  slot: BannerSlotNumber;
  banner: BannerEntity | null;
  onClose: () => void;
  onSave: (updates: { title: string; targetScreen: string; active: boolean }) => Promise<void>;
}

export const BannerEditModal: React.FC<BannerEditModalProps> = ({
  isOpen,
  slot,
  banner,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [targetScreen, setTargetScreen] = useState('/audio');
  const [active, setActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (banner) {
      setTitle(banner.title);
      setTargetScreen(banner.targetScreen || '/audio');
      setActive(banner.active !== false);
      setError(null);
    }
  }, [banner, isOpen]);

  if (!isOpen || !banner) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('कृपया बैनर का शीर्षक दर्ज करें।');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onSave({
        title: title.trim(),
        targetScreen,
        active,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'बैनर अद्यतन करने में त्रुटि।');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-['Mukta']">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-500 text-white">
                  स्लॉट {slot}
                </span>
                <h3 className="text-base font-bold text-stone-900">बैनर विवरण संपादित करें</h3>
              </div>
              <p className="text-xs text-stone-500">छवि अपरिवर्तित रखते हुए शीर्षक और स्क्रीन लिंक बदलें।</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <AdminField label="बैनर शीर्षक *" required>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="उदा. पावन गुरु पूर्णिमा सत्संग महोत्सव"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              autoFocus
              disabled={isSaving}
            />
          </AdminField>

          <AdminField label="गंतव्य स्क्रीन (Target Screen)">
            <select
              value={targetScreen}
              onChange={(e) => setTargetScreen(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
              disabled={isSaving}
            >
              <option value="/audio">ऑडियो एवं भजन संग्रह (/audio)</option>
              <option value="/stuti-vinati">स्तुति-विनती पाठ संग्रह (/stuti-vinati)</option>
              <option value="/books">साहित्य एवं सद्ग्रंथ (/books)</option>
              <option value="/notifications">दैनिक सूचनाएं एवं सत्संग अपडेट (/notifications)</option>
              <option value="/search">सत्संग खोज स्क्रीन (/search)</option>
            </select>
          </AdminField>

          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                disabled={isSaving}
              />
              <span className="text-sm font-medium text-stone-700">
                स्लॉट {slot} को मोबाइल ऐप में सक्रिय रखें
              </span>
            </label>
          </div>

          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <AdminButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isSaving}
            >
              रद्द करें
            </AdminButton>
            <AdminButton
              type="submit"
              variant="primary"
              size="sm"
              loading={isSaving}
              disabled={!title.trim() || isSaving}
              icon={<Check className="w-4 h-4" />}
            >
              सुरक्षित करें
            </AdminButton>
          </div>
        </form>
      </div>
    </div>
  );
};
