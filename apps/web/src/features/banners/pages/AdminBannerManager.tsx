/**
 * ============================================================================
 * Santmat Satsang Prachar — Enterprise Banner CMS (Admin)
 * ============================================================================
 * 4-SLOT CANONICAL HOME BANNER ARCHITECTURE (Module 04):
 * 1. Exactly 4 Canonical Home Banner Slots:
 *    - Deterministic order: Slot 1, Slot 2, Slot 3, Slot 4.
 *    - Mobile displays up to 4 banners in a swipeable 5s auto-scroll carousel.
 *    - 16:9 Aspect Ratio locked (1280×720 WebP master, 640×360 thumbnail).
 *    - WhatsApp-style interactive pan & zoom cropper.
 *    - Slot-isolated atomic replacement with fail-safe rollback.
 *    - When replacing Slot N: deletes previous Slot N storage & Firestore doc;
 *      all other 3 slots remain completely untouched.
 *    - Storage & Database Integrity Manager (4-slot verification & clean purge).
 */
import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  X,
  Smartphone,
  Layers,
  ShieldCheck,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { BannerEntity, BannerSlotNumber } from '../../../types/common/index';
import { bannerService, CANONICAL_SLOTS } from '../services/bannerService';
import {
  AdminPageHeader,
  AdminCard,
  AdminDeleteDialog,
} from '../../../components/admin';

// Specialized Banner Components
import { BannerSlotCard } from '../components/BannerSlotCard';
import { BannerReplaceModal } from '../components/BannerReplaceModal';
import { BannerEditModal } from '../components/BannerEditModal';
import { BannerCarouselPreview } from '../components/BannerCarouselPreview';
import { BannerIntegrityCard } from '../components/BannerIntegrityCard';

export const AdminBannerManager: React.FC = () => {
  // 4-Slot Canonical State
  const [slotBanners, setSlotBanners] = useState<Record<BannerSlotNumber, BannerEntity | null>>({
    1: null,
    2: null,
    3: null,
    4: null,
  });
  const [allBanners, setAllBanners] = useState<BannerEntity[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);

  // Modal Selection State
  const [selectedSlotForModal, setSelectedSlotForModal] = useState<BannerSlotNumber>(1);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Slot Deletion Dialog State
  const [slotToDelete, setSlotToDelete] = useState<BannerSlotNumber | null>(null);
  const [isDeletingSlot, setIsDeletingSlot] = useState(false);

  // Feedback Toast
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Subscribe to the 4 canonical slots in real-time
  useEffect(() => {
    setBannersLoading(true);
    const unsub = bannerService.subscribeSlotBanners(
      (slots, list) => {
        setSlotBanners(slots);
        setAllBanners(list);
        setBannersLoading(false);
      },
      (err) => {
        console.error('Slot banner subscription error:', err);
        setBannersLoading(false);
      }
    );

    return () => {
      unsub();
    };
  }, []);

  // Handle Metadata Save from Edit Modal
  const handleSaveBannerMetadata = async (updates: {
    title: string;
    targetScreen: string;
    active: boolean;
  }) => {
    const res = await bannerService.updateSlotMetadata(selectedSlotForModal, updates);
    if (!res.success) {
      throw new Error(res.error || 'अद्यतन विफल।');
    }
    showFeedback('success', `स्लॉट ${selectedSlotForModal} का विवरण सफलतापूर्वक अद्यतित हुआ!`);
  };

  // Handle Slot Deletion
  const handleConfirmDeleteSlot = async () => {
    if (!slotToDelete) return;
    setIsDeletingSlot(true);
    try {
      const res = await bannerService.deleteSlot(slotToDelete);
      if (res.success) {
        showFeedback('success', `स्लॉट ${slotToDelete} का बैनर सफलतापूर्वक हटा दिया गया।`);
      } else {
        showFeedback('error', res.error || 'हटाने में विफलता।');
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'त्रुटि उत्पन्न हुई।');
    } finally {
      setIsDeletingSlot(false);
      setSlotToDelete(null);
    }
  };

  // Metric counts
  const activeSlotsCount = CANONICAL_SLOTS.filter(
    (s) => slotBanners[s] && slotBanners[s]!.active !== false && !!slotBanners[s]!.imageUrl
  ).length;
  const emptySlotsCount = 4 - activeSlotsCount;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-['Mukta'] select-none">
      {/* Feedback Toast */}
      {feedback && (
        <div
          role="alert"
          className={`admin-toast ${
            feedback.type === 'success' ? 'admin-toast-success' : 'admin-toast-error'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="hover:opacity-75 cursor-pointer ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Canonical Admin Page Header */}
      <AdminPageHeader
        title="होम बैनर CMS"
        subtitle="Android होम स्क्रीन के लिए 4-स्लॉट 16:9 कैनोनिकल कैरोसेल बैनर नियंत्रित करें।"
        badgeText="4-Slot Carousel CMS"
        icon={<ImageIcon className="w-4 h-4" />}
      />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 4-SLOT CANONICAL 16:9 HOME BANNER CMS                                */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="space-y-6">
        {/* Summary Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-stone-500 font-medium">कुल कैनोनिकल स्लॉट्स</span>
              <p className="text-lg font-bold text-stone-900">4 स्लॉट्स (1..4)</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-stone-500 font-medium">सक्रिय बैनर्स</span>
              <p className="text-lg font-bold text-emerald-700">{activeSlotsCount} / 4</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center font-bold">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-stone-500 font-medium">रिक्त स्लॉट्स</span>
              <p className="text-lg font-bold text-stone-700">{emptySlotsCount} / 4</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-stone-500 font-medium">कैरोसेल व्यवहार</span>
              <p className="text-sm font-bold text-stone-900">
                {activeSlotsCount > 1 ? '5s ऑटो-स्क्रॉल' : activeSlotsCount === 1 ? 'एकल बैनर' : 'रिक्त'}
              </p>
            </div>
          </div>
        </div>

        {/* Main 2-Column Layout: 4 Slot Cards & Carousel Phone Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Section: 4 Slot Cards (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  कैनोनिकल होम स्क्रीन स्लॉट्स
                </h3>
                <p className="text-xs text-stone-500">
                  प्रत्येक स्लॉट एक स्वतंत्र बैनर को नियंत्रित करता है। किसी स्लॉट को बदलने पर अन्य 3 स्लॉट्स अपरिवर्तित रहते हैं।
                </p>
              </div>
            </div>

            {/* 2x2 Grid of the 4 Slot Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CANONICAL_SLOTS.map((slotNum) => (
                <BannerSlotCard
                  key={slotNum}
                  slot={slotNum}
                  banner={slotBanners[slotNum]}
                  loading={bannersLoading}
                  onOpenReplaceModal={(s) => {
                    setSelectedSlotForModal(s);
                    setIsReplaceModalOpen(true);
                  }}
                  onOpenEditModal={(s) => {
                    setSelectedSlotForModal(s);
                    setIsEditModalOpen(true);
                  }}
                  onDeleteSlot={(s) => {
                    setSlotToDelete(s);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right Section: Mobile Carousel Live Frame Preview (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <BannerCarouselPreview slots={slotBanners} />

            {/* 4-Slot Architecture Guidelines Card */}
            <AdminCard
              title="4-स्लॉट कैरोसेल अनुबंध"
              subtitle="मोबाइल ऐप संरेखण एवं अखंडता नियम"
              icon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
            >
              <div className="space-y-3 text-xs text-stone-700">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <strong className="text-stone-900">निश्चित स्लॉट क्रम (Deterministic 1..4):</strong>
                    <p className="text-stone-500">
                      मोबाइल ऐप स्लॉट्स को 1 से 4 के क्रम में कैरोसेल में प्रदर्शित करता है।
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <strong className="text-stone-900">स्लॉट-पृथक प्रतिस्थापन (Slot Isolation):</strong>
                    <p className="text-stone-500">
                      स्लॉट N बदलने पर केवल स्लॉट N की फाइलें बदलती हैं। शेष 3 स्लॉट्स पूर्णतः सुरक्षित रहते हैं।
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <strong className="text-stone-900">फेल-सेफ रोलबैक (Fail-Safe Rollback):</strong>
                    <p className="text-stone-500">
                      अपलोड या नेटवर्क विफलता पर पिछला बैनर अपरिवर्तित रहता है।
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    4
                  </span>
                  <div>
                    <strong className="text-stone-900">ज़ीरो मॉक / ज़ीरो फेक डेटा:</strong>
                    <p className="text-stone-500">
                      यदि कोई स्लॉट खाली है, तो ऐप केवल उपलब्ध सक्रिय स्लॉट्स को दिखाता है बिना कोई बनावटी सामग्री बनाए।
                    </p>
                  </div>
                </div>
              </div>
            </AdminCard>
          </div>
        </div>

        {/* Full Width: Storage & Database Integrity Section */}
        <BannerIntegrityCard
          allBanners={allBanners}
          slotBanners={slotBanners}
          onBannersUpdated={() => {
            bannerService.getSlotBanners().then((slots) => setSlotBanners(slots));
          }}
          onFeedback={showFeedback}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODALS & DIALOGS                                                    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/* 1. Slot Replace / Crop Modal */}
      <BannerReplaceModal
        isOpen={isReplaceModalOpen}
        targetSlot={selectedSlotForModal}
        currentBanner={slotBanners[selectedSlotForModal]}
        onClose={() => setIsReplaceModalOpen(false)}
        onSuccess={() => {
          showFeedback('success', `स्लॉट ${selectedSlotForModal} का 16:9 बैनर सफलतापूर्वक सुरक्षित हुआ!`);
        }}
      />

      {/* 2. Slot Edit Metadata Modal */}
      <BannerEditModal
        isOpen={isEditModalOpen}
        slot={selectedSlotForModal}
        banner={slotBanners[selectedSlotForModal]}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveBannerMetadata}
      />

      {/* 3. Slot Clear / Delete Confirmation Dialog */}
      <AdminDeleteDialog
        isOpen={slotToDelete !== null}
        title={`स्लॉट ${slotToDelete} बैनर हटाएं?`}
        description={`क्या आप वास्तव में स्लॉट ${slotToDelete} के बैनर और इसकी स्टोरेज फाइलों को स्थायी रूप से हटाना चाहते हैं? यह प्रक्रिया अपरिवर्तनीय है। शेष अन्य 3 स्लॉट्स पूरी तरह सुरक्षित रहेंगे।`}
        confirmButtonText="हाँ, स्लॉट खाली करें"
        cancelButtonText="रद्द करें"
        isDeleting={isDeletingSlot}
        onConfirm={handleConfirmDeleteSlot}
        onCancel={() => setSlotToDelete(null)}
      />
    </div>
  );
};
