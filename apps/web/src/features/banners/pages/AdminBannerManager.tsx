/**
 * ============================================================================
 * Santmat Satsang Prachar — Enterprise Banner & Suvichar CMS (Admin)
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
 * 2. Daily Suvichar Posters (suvichar collection):
 *    - 16:9 devotional layout & daily carousel management.
 */
import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  X,
  Smartphone,
  Quote,
  Layers,
  ShieldCheck,
  Check,
  Edit3,
  Trash2,
  Info,
  CheckCircle2,
  HardDrive,
} from 'lucide-react';
import { useApp } from '../../../app/providers/AppContext';
import { BannerEntity, BannerSlotNumber, SuvicharItem } from '../../../types/common/index';
import { bannerService, CANONICAL_SLOTS } from '../services/bannerService';
import { storageService } from '../../../services/storage/storageService';
import { IMAGE_PROFILES } from '../../../lib/media/profiles/imageProfiles';
import {
  AdminButton,
  AdminPageHeader,
  AdminCard,
  AdminField,
  AdminUploadField,
  AdminAspectRatioPreview,
  AdminDeleteDialog,
} from '../../../components/admin';

// Specialized Banner Components
import { BannerSlotCard } from '../components/BannerSlotCard';
import { BannerReplaceModal } from '../components/BannerReplaceModal';
import { BannerEditModal } from '../components/BannerEditModal';
import { BannerCarouselPreview } from '../components/BannerCarouselPreview';
import { BannerIntegrityCard } from '../components/BannerIntegrityCard';

export const AdminBannerManager: React.FC = () => {
  const { suvichars, addSuvichar, updateSuvichar, deleteSuvichar } = useApp();

  // Active Manager Tab
  const [activeTab, setActiveTab] = useState<'banners' | 'suvichars'>('banners');

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

  // Suvichar Form State
  const [suvicharQuote, setSuvicharQuote] = useState('');
  const [suvicharAuthor, setSuvicharAuthor] = useState('');
  const [suvicharTheme, setSuvicharTheme] = useState('');
  const [suvicharDate, setSuvicharDate] = useState(new Date().toISOString().split('T')[0]);
  const [suvicharImageUrl, setSuvicharImageUrl] = useState('');
  const [suvicharSpecial, setSuvicharSpecial] = useState(true);
  const [suvicharImageFile, setSuvicharImageFile] = useState<File | null>(null);
  const [editingSuvicharId, setEditingSuvicharId] = useState<string | number | null>(null);
  const [isSuvicharSaving, setIsSuvicharSaving] = useState(false);

  // Delete Dialog for Suvichar
  const [deleteSuvicharItem, setDeleteSuvicharItem] = useState<SuvicharItem | null>(null);
  const [isDeletingSuvichar, setIsDeletingSuvichar] = useState(false);

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
      const res = await bannerService.deleteSlotBanner(slotToDelete);
      if (res.success) {
        showFeedback('success', `स्लॉट ${slotToDelete} का बैनर एवं स्टोरेज फाइलें सफलतापूर्वक हटा दी गईं।`);
      } else {
        showFeedback('error', res.error || `स्लॉट ${slotToDelete} हटाने में त्रुटि।`);
      }
    } catch (err: any) {
      showFeedback('error', err.message || `स्लॉट ${slotToDelete} हटाने में विफलता।`);
    } finally {
      setIsDeletingSlot(false);
      setSlotToDelete(null);
    }
  };

  // Handle Save Suvichar (Create / Update)
  const handleSaveSuvichar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suvicharQuote.trim()) {
      showFeedback('error', 'कृपया सुविचार उद्धरण दर्ज करें।');
      return;
    }
    if (!suvicharAuthor.trim()) {
      showFeedback('error', 'कृपया संत / लेखक का नाम दर्ज करें।');
      return;
    }

    setIsSuvicharSaving(true);
    try {
      let finalImageUrl = suvicharImageUrl;

      // Handle image upload if a file was selected
      if (suvicharImageFile) {
        const uploadRes = await storageService.uploadFile(suvicharImageFile, 'suvichar');
        if (uploadRes.success && uploadRes.data?.downloadUrl) {
          finalImageUrl = uploadRes.data.downloadUrl;
        } else {
          throw new Error(uploadRes.error || 'सुविचार पोस्टर अपलोड विफल रहा।');
        }
      }

      const payload = {
        quote: suvicharQuote.trim(),
        author: suvicharAuthor.trim(),
        theme: suvicharTheme.trim() || undefined,
        date: suvicharDate,
        imageUrl: finalImageUrl || undefined,
        isSpecialPoster: suvicharSpecial,
      };

      if (editingSuvicharId !== null) {
        updateSuvichar(editingSuvicharId, payload);
        showFeedback('success', 'सुविचार सफलतापूर्वक अद्यतन किया गया।');
      } else {
        addSuvichar(payload);
        showFeedback('success', 'नया दैनिक सुविचार सफलतापूर्वक जोड़ा गया।');
      }

      // Reset form
      setEditingSuvicharId(null);
      setSuvicharQuote('');
      setSuvicharAuthor('');
      setSuvicharTheme('');
      setSuvicharImageUrl('');
      setSuvicharImageFile(null);
    } catch (err: any) {
      showFeedback('error', err.message || 'सुविचार सहेजने में त्रुटि।');
    } finally {
      setIsSuvicharSaving(false);
    }
  };

  // Edit Suvichar
  const handleEditSuvichar = (s: SuvicharItem) => {
    setEditingSuvicharId(s.id);
    setSuvicharQuote(s.quote);
    setSuvicharAuthor(s.author);
    setSuvicharTheme(s.theme || '');
    setSuvicharDate(s.date || new Date().toISOString().split('T')[0]);
    setSuvicharImageUrl(s.imageUrl || '');
    setSuvicharSpecial(s.isSpecialPoster ?? true);
    setSuvicharImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Confirm Delete Suvichar
  const handleConfirmDeleteSuvichar = async () => {
    if (!deleteSuvicharItem) return;
    setIsDeletingSuvichar(true);
    try {
      deleteSuvichar(deleteSuvicharItem.id);
      showFeedback('success', 'सुविचार सफलतापूर्वक हटा दिया गया।');
    } catch (err: any) {
      showFeedback('error', 'हटाने में विफलता: ' + (err.message || String(err)));
    } finally {
      setIsDeletingSuvichar(false);
      setDeleteSuvicharItem(null);
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
        title="होम बैनर एवं सुविचार CMS"
        subtitle="Android होम स्क्रीन के लिए 4-स्लॉट 16:9 कैनोनिकल कैरोसेल बैनर एवं दैनिक सुविचार नियंत्रित करें।"
        badgeText="4-Slot Carousel CMS"
        icon={<ImageIcon className="w-4 h-4" />}
        actions={
          <div className="flex items-center bg-stone-100 p-1 rounded-[0.625rem] border border-stone-200">
            <button
              onClick={() => setActiveTab('banners')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'banners'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              4-स्लॉट होम बैनर CMS
            </button>
            <button
              onClick={() => setActiveTab('suvichars')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'suvichars'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              दैनिक सुविचार (Daily Suvichar)
            </button>
          </div>
        }
      />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: 4-SLOT CANONICAL 16:9 HOME BANNER CMS                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'banners' && (
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
            slots={slotBanners}
            onAuditCompleted={() => {
              showFeedback('success', 'स्टोरेज ऑडिट एवं सफाई पूर्ण हुई।');
            }}
          />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: DAILY SUVICHAR POSTERS (suvichar collection)                 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'suvichars' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Create / Edit Suvichar (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <AdminCard
              title={editingSuvicharId !== null ? 'सुविचार संशोधित करें' : 'नया दैनिक सुविचार जोड़ें'}
              subtitle="Android होम स्क्रीन पर 5-सेकंड ऑटो-स्क्रॉल सुविचार कार्ड के रूप में प्रदर्शित होगा।"
              icon={<Quote className="w-5 h-5 text-amber-600" />}
            >
              <form onSubmit={handleSaveSuvichar} className="space-y-4">
                <AdminField label="सुविचार उद्धरण (Quote) *" required>
                  <textarea
                    rows={3}
                    value={suvicharQuote}
                    onChange={(e) => setSuvicharQuote(e.target.value)}
                    placeholder="उदा. परमात्मा का निवास अंतर में है, उसे बाहर खोजने की आवश्यकता नहीं..."
                    className="admin-textarea"
                  />
                </AdminField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AdminField label="संत / लेखक (Author) *" required>
                    <input
                      type="text"
                      value={suvicharAuthor}
                      onChange={(e) => setSuvicharAuthor(e.target.value)}
                      placeholder="उदा. पूज्यपाद महर्षि मेँहीँ परमहंस जी महाराज"
                      className="admin-input text-sm"
                    />
                  </AdminField>

                  <AdminField label="थीम / प्रसंग (Theme)">
                    <input
                      type="text"
                      value={suvicharTheme}
                      onChange={(e) => setSuvicharTheme(e.target.value)}
                      placeholder="उदा. ध्यान एवं आंतरिक शांति"
                      className="admin-input text-sm"
                    />
                  </AdminField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AdminField label="दिनांक (Date)">
                    <input
                      type="date"
                      value={suvicharDate}
                      onChange={(e) => setSuvicharDate(e.target.value)}
                      className="admin-input"
                    />
                  </AdminField>

                  <AdminField label="विशेष पोस्टर (Special Poster)">
                    <div className="flex items-center gap-3 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-stone-800">
                        <input
                          type="checkbox"
                          checked={suvicharSpecial}
                          onChange={(e) => setSuvicharSpecial(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-600 accent-amber-600 cursor-pointer"
                        />
                        <span>स्पेशल पोस्टर कार्ड शैली</span>
                      </label>
                    </div>
                  </AdminField>
                </div>

                {/* 16:9 Image Upload with Profile & Cropper */}
                <AdminUploadField
                  label="16:9 सुविचार पोस्टर छवि (ऐच्छिक)"
                  helperText="16:9 अनुपात में छवि अपलोड करें या व्हाट्सएप शैली में क्रॉप करें।"
                  profile={IMAGE_PROFILES.suvichar}
                  value={suvicharImageUrl}
                  onChange={(file, previewUrl) => {
                    setSuvicharImageFile(file);
                    setSuvicharImageUrl(previewUrl);
                  }}
                  onRemove={() => {
                    setSuvicharImageFile(null);
                    setSuvicharImageUrl('');
                  }}
                />

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                  {editingSuvicharId !== null && (
                    <AdminButton
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setEditingSuvicharId(null);
                        setSuvicharQuote('');
                        setSuvicharAuthor('');
                        setSuvicharTheme('');
                        setSuvicharImageUrl('');
                        setSuvicharImageFile(null);
                      }}
                    >
                      संशोधन रद्द करें
                    </AdminButton>
                  )}

                  <AdminButton
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={isSuvicharSaving}
                    disabled={isSuvicharSaving}
                    icon={<Check className="w-4 h-4" />}
                  >
                    {editingSuvicharId !== null ? 'सुविचार अद्यतन करें' : 'सुविचार प्रकाशित करें'}
                  </AdminButton>
                </div>
              </form>
            </AdminCard>
          </div>

          {/* Right List: Existing Suvichars (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900">प्रकाशित सुविचार ({suvichars.length})</h3>
            </div>

            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
              {suvichars.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 space-y-2">
                  <Quote className="w-8 h-8 text-stone-400 mx-auto" />
                  <p className="text-sm font-semibold">अभी कोई सुविचार प्रकाशित नहीं है</p>
                  <p className="text-xs">बाईं ओर दिए गए फॉर्म से नया सुविचार जोड़ें।</p>
                </div>
              ) : (
                suvichars.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs hover:border-amber-300 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {s.date || 'दैनिक'}
                        </span>
                        <p className="text-xs font-semibold text-stone-900 line-clamp-2 mt-1">"{s.quote}"</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditSuvichar(s)}
                          className="p-1.5 text-stone-400 hover:text-amber-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          title="संपादित करें"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteSuvicharItem(s)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          title="हटाएं"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-100">
                      <span>— {s.author}</span>
                      {s.imageUrl && (
                        <span className="text-emerald-600 flex items-center gap-1 font-mono text-[10px]">
                          <ImageIcon className="w-3 h-3" /> पोस्टर युक्त
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODALS & DIALOGS                                                    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/* 1. Slot Replace / Crop Modal */}
      <BannerReplaceModal
        isOpen={isReplaceModalOpen}
        targetSlot={selectedSlotForModal}
        currentBanner={slotBanners[selectedSlotForModal]}
        onClose={() => setIsReplaceModalOpen(false)}
        onSuccess={(newBanner) => {
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

      {/* 4. Delete Suvichar Dialog */}
      <AdminDeleteDialog
        isOpen={deleteSuvicharItem !== null}
        title="सुविचार हटाएं?"
        description={`क्या आप वास्तव में "${deleteSuvicharItem?.quote?.substring(0, 40)}..." सुविचार हटाना चाहते हैं?`}
        confirmButtonText="हाँ, हटाएं"
        cancelButtonText="रद्द करें"
        isDeleting={isDeletingSuvichar}
        onConfirm={handleConfirmDeleteSuvichar}
        onCancel={() => setDeleteSuvicharItem(null)}
      />
    </div>
  );
};
