import React, { useState } from 'react';
import {
  Sparkles,
  ExternalLink,
  Edit3,
  RefreshCw,
  Trash2,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight,
  UploadCloud,
  FileImage,
} from 'lucide-react';
import { BannerEntity, BannerSlotNumber } from '../../../types/common/index';
import { AdminButton } from '../../../components/admin';

export interface BannerSlotCardProps {
  slot: BannerSlotNumber;
  banner: BannerEntity | null;
  loading?: boolean;
  onOpenReplaceModal: (slot: BannerSlotNumber) => void;
  onOpenEditModal: (slot: BannerSlotNumber) => void;
  onDeleteSlot: (slot: BannerSlotNumber) => void;
}

export const TARGET_SCREEN_LABELS: Record<string, string> = {
  '/audio': 'ऑडियो एवं भजन संग्रह (/audio)',
  '/stuti-vinati': 'स्तुति-विनती पाठ संग्रह (/stuti-vinati)',
  '/books': 'साहित्य एवं सद्ग्रंथ (/books)',
  '/notifications': 'दैनिक सूचनाएं एवं सत्संग अपडेट (/notifications)',
  '/search': 'सत्संग खोज स्क्रीन (/search)',
};

export const BannerSlotCard: React.FC<BannerSlotCardProps> = ({
  slot,
  banner,
  loading = false,
  onOpenReplaceModal,
  onOpenEditModal,
  onDeleteSlot,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center animate-pulse space-y-4">
        <div className="h-5 bg-stone-200 rounded w-1/4" />
        <div className="aspect-video bg-stone-100 rounded-xl w-full" />
        <div className="h-4 bg-stone-200 rounded w-1/2" />
      </div>
    );
  }

  const slotTitle = `स्लॉट ${slot}`;

  // EMPTY SLOT STATE
  if (!banner) {
    return (
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          onOpenReplaceModal(slot);
        }}
        className={`bg-white rounded-2xl border-2 transition-all p-5 flex flex-col justify-between shadow-sm hover:shadow-md ${
          isDragOver
            ? 'border-amber-500 bg-amber-50/50'
            : 'border-dashed border-stone-300 hover:border-amber-300'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-100 text-amber-900 border border-amber-200">
              {slotTitle}
            </span>
            <span className="text-xs text-stone-500">होम स्क्रीन क्रम #{slot}</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
            खाली (Empty)
          </span>
        </div>

        {/* Empty Body */}
        <div className="my-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center mx-auto text-stone-400 group-hover:text-amber-600">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-stone-700">{slotTitle} रिक्त है</p>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              16:9 (1280×720) बैनर छवि जोड़ें। मोबाइल होम कैरोसेल में यह स्थान लेगा।
            </p>
          </div>
        </div>

        {/* Action */}
        <div className="pt-2">
          <AdminButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onOpenReplaceModal(slot)}
            className="w-full justify-center !border-amber-300 hover:!bg-amber-50 !text-amber-900 font-semibold"
            icon={<Sparkles className="w-4 h-4 text-amber-600" />}
          >
            {slotTitle} में नया बैनर जोड़ें
          </AdminButton>
        </div>
      </div>
    );
  }

  // ACTIVE / OCCUPIED SLOT STATE
  const targetLabel =
    TARGET_SCREEN_LABELS[banner.targetScreen || '/audio'] || banner.targetScreen || '/audio';
  const updatedDateStr = banner.updatedAt
    ? new Date(banner.updatedAt).toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'हाल ही में';

  const sizeKb = banner.sizeBytes ? Math.round(banner.sizeBytes / 1024) : null;

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden transition-all hover:shadow-md flex flex-col justify-between">
      {/* Slot Header Bar */}
      <div className="px-4 py-3 bg-stone-50/90 border-b border-stone-200/70 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-amber-500 text-white shadow-sm">
            {slotTitle}
          </span>
          <span className="text-xs font-medium text-stone-600 truncate max-w-[120px] sm:max-w-[180px]">
            {banner.title}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
              banner.active !== false
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-stone-100 text-stone-600 border border-stone-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                banner.active !== false ? 'bg-emerald-500' : 'bg-stone-400'
              }`}
            />
            {banner.active !== false ? 'सक्रिय' : 'निष्क्रिय'}
          </span>

          <button
            type="button"
            onClick={() => onDeleteSlot(slot)}
            title={`${slotTitle} हटाएं`}
            className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 16:9 Banner Preview Box */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="relative aspect-video rounded-xl overflow-hidden bg-stone-900 border border-stone-200/80 shadow-inner group">
          <img
            src={banner.imageUrl}
            alt={banner.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
            loading="lazy"
          />

          {/* Format & Dimensions Pill */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded-md text-[10px] text-white font-mono shadow-sm">
            <span>{banner.width || 1280}×{banner.height || 720}</span>
            <span className="text-amber-400 font-bold uppercase">{banner.format?.replace('image/', '') || 'WEBP'}</span>
          </div>

          {/* Bottom Title & Route Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-white text-xs font-bold truncate drop-shadow-sm">
                {banner.title}
              </p>
              <p className="text-amber-300 text-[10px] truncate flex items-center gap-1">
                <ExternalLink className="w-2.5 h-2.5" />
                <span>{banner.targetScreen || '/audio'}</span>
              </p>
            </div>
            {sizeKb && (
              <span className="text-[10px] text-stone-300 font-mono shrink-0 bg-black/40 px-1.5 py-0.5 rounded">
                {sizeKb} KB
              </span>
            )}
          </div>
        </div>

        {/* Metadata info snippet */}
        <div className="text-[11px] text-stone-500 flex items-center justify-between pt-1">
          <span className="truncate">मार्ग: <strong className="text-stone-700">{targetLabel.split(' (')[0]}</strong></span>
          <span className="shrink-0 text-stone-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {updatedDateStr}
          </span>
        </div>

        {/* Slot Action Buttons */}
        <div className="pt-2 flex items-center gap-2 border-t border-stone-100">
          <AdminButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onOpenReplaceModal(slot)}
            className="flex-1 justify-center !text-xs !py-1.5"
            icon={<RefreshCw className="w-3.5 h-3.5 text-stone-600" />}
          >
            बैनर बदलें
          </AdminButton>

          <AdminButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenEditModal(slot)}
            className="justify-center !text-xs !py-1.5 !px-2.5 text-stone-600 hover:text-stone-900"
            icon={<Edit3 className="w-3.5 h-3.5" />}
          >
            संपादित करें
          </AdminButton>
        </div>
      </div>
    </div>
  );
};
