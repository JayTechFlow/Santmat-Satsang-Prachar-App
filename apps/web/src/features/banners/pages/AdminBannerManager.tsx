/**
 * ============================================================================
 * Santmat Satsang Prachar — Enterprise Banner & Suvichar CMS (Admin)
 * ============================================================================
 * Dual-module CMS for Android Home Screen:
 * 1. Home Carousel Banners (banners collection) with FIXED 16:9 Aspect Ratio profile.
 * 2. Daily Suvichar Posters (suvichar collection) with 16:9 devotional layout.
 *
 * Implements Phase 4, Phase 8, Phase 9:
 * - Fixed target aspect ratio (16:9, 1280×720).
 * - Exact Android Device Carousel Frame preview.
 * - Interactive Canvas Cropper & Auto-Resizer.
 * - Zero unexpected cropping on mobile devices.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  Trash2,
  Edit3,
  Check,
  Quote,
  Layers,
  Sparkles,
  Power,
  X,
} from 'lucide-react';
import { useApp } from '../../../app/providers/AppContext';
import { BannerEntity, SuvicharItem } from '../../../types/common/index';
import { bannerService } from '../services/bannerService';
import { storageService } from '../../../services/storage/storageService';
import { IMAGE_PROFILES } from '../../../lib/media/profiles/imageProfiles';
import {
  AdminButton,
  AdminPageHeader,
  AdminCard,
  AdminSection,
  AdminField,
  AdminUploadField,
  AdminAspectRatioPreview,
  AdminDeleteDialog,
  AdminStatusBadge,
} from '../../../components/admin';

export const AdminBannerManager: React.FC = () => {
  const { suvichars, addSuvichar, updateSuvichar, deleteSuvichar } = useApp();

  // Active Manager Tab
  const [activeTab, setActiveTab] = useState<'banners' | 'suvichars'>('banners');

  // Banners State (banners collection)
  const [banners, setBanners] = useState<BannerEntity[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);

  // Banner Form State
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [bannerTargetScreen, setBannerTargetScreen] = useState('/audio');
  const [bannerActive, setBannerActive] = useState(true);
  const [bannerOrder, setBannerOrder] = useState<number>(0);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [isBannerSaving, setIsBannerSaving] = useState(false);

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

  // Delete Dialog State
  const [deleteDialogItem, setDeleteDialogItem] = useState<{
    type: 'banner' | 'suvichar';
    id: string | number;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Feedback Toast
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Subscribe to real-time Banners
  useEffect(() => {
    setBannersLoading(true);
    const unsub = bannerService.subscribeBanners(
      (list) => {
        setBanners(list);
        setBannersLoading(false);
      },
      (err) => {
        console.error('Banners subscription error:', err);
        setBannersLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // Handle Banner Form Save
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle.trim()) {
      showFeedback('error', 'कृपया बैनर का शीर्षक दर्ज करें।');
      return;
    }

    setIsBannerSaving(true);
    try {
      let finalImageUrl = bannerImageUrl;

      // If a new image file was cropped/selected, upload to Firebase Storage
      if (bannerImageFile) {
        const uploadRes = await storageService.uploadFile(bannerImageFile, 'banners');
        if (!uploadRes.success || !uploadRes.data?.downloadUrl) {
          throw new Error(uploadRes.error || 'बैनर इमेज अपलोड विफल।');
        }
        finalImageUrl = uploadRes.data.downloadUrl;
      }

      if (!finalImageUrl) {
        showFeedback('error', 'कृपया 16:9 बैनर इमेज अपलोड करें।');
        setIsBannerSaving(false);
        return;
      }

      if (editingBannerId) {
        await bannerService.updateBanner(editingBannerId, {
          title: bannerTitle.trim(),
          imageUrl: finalImageUrl,
          targetScreen: bannerTargetScreen,
          active: bannerActive,
          order: bannerOrder,
        });
        showFeedback('success', 'बैनर सफलतापूर्वक अद्यतन किया गया।');
      } else {
        await bannerService.addBanner({
          title: bannerTitle.trim(),
          imageUrl: finalImageUrl,
          targetScreen: bannerTargetScreen,
          active: bannerActive,
          order: banners.length,
        });
        showFeedback('success', 'नया 16:9 बैनर सफलतापूर्वक जोड़ा गया।');
      }

      // Reset form
      setEditingBannerId(null);
      setBannerTitle('');
      setBannerImageUrl('');
      setBannerTargetScreen('/audio');
      setBannerActive(true);
      setBannerImageFile(null);
      setBannerOrder(0);
    } catch (err: any) {
      showFeedback('error', err.message || 'बैनर सहेजने में त्रुटि।');
    } finally {
      setIsBannerSaving(false);
    }
  };

  // Edit Banner
  const handleEditBanner = (b: BannerEntity) => {
    setEditingBannerId(b.id);
    setBannerTitle(b.title);
    setBannerImageUrl(b.imageUrl);
    setBannerTargetScreen(b.targetScreen || '/audio');
    setBannerActive(b.active);
    setBannerOrder(b.order ?? 0);
    setBannerImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle Banner Active status
  const handleToggleBannerActive = async (b: BannerEntity) => {
    try {
      await bannerService.updateBanner(b.id, { active: !b.active });
      showFeedback('success', `बैनर '${b.title}' को ${!b.active ? 'सक्रिय' : 'निष्क्रिय'} किया गया।`);
    } catch (err: any) {
      showFeedback('error', 'बैनर स्थिति बदलने में विफल।');
    }
  };

  // Handle Suvichar Form Save
  const handleSaveSuvichar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suvicharQuote.trim() || !suvicharAuthor.trim()) {
      showFeedback('error', 'कृपया सुविचार उद्धरण एवं संत/लेखक का नाम दर्ज करें।');
      return;
    }

    setIsSuvicharSaving(true);
    try {
      let finalImageUrl = suvicharImageUrl;

      if (suvicharImageFile) {
        const uploadRes = await storageService.uploadFile(suvicharImageFile, 'suvichar');
        if (!uploadRes.success || !uploadRes.data?.downloadUrl) {
          throw new Error(uploadRes.error || 'सुविचार पोस्टर इमेज अपलोड विफल।');
        }
        finalImageUrl = uploadRes.data.downloadUrl;
      }

      const payload: Omit<SuvicharItem, 'id'> = {
        quote: suvicharQuote.trim(),
        author: suvicharAuthor.trim(),
        theme: suvicharTheme.trim() || 'दैनिक सत्संग प्रेरणा',
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

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteDialogItem) return;
    setIsDeleting(true);
    try {
      if (deleteDialogItem.type === 'banner') {
        await bannerService.deleteBanner(String(deleteDialogItem.id));
        showFeedback('success', 'बैनर सफलतापूर्वक हटा दिया गया।');
      } else {
        deleteSuvichar(deleteDialogItem.id);
        showFeedback('success', 'सुविचार सफलतापूर्वक हटा दिया गया।');
      }
    } catch (err: any) {
      showFeedback('error', 'हटाने में विफलता: ' + (err.message || String(err)));
    } finally {
      setIsDeleting(false);
      setDeleteDialogItem(null);
    }
  };

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
        title="होम बैनर एवं सुविचार प्रबंधन"
        subtitle="Android होम स्क्रीन कैरोसेल के लिए 16:9 अनुपात-लॉक बैनर एवं दैनिक सुविचार पोस्टर नियंत्रित करें।"
        badgeText="Android UI संरेखित CMS"
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
              होम बैनर (16:9 Banners)
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
      {/* TAB 1: HOME CAROUSEL BANNERS (banners collection)                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'banners' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Create / Edit Banner (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <AdminCard
              title={editingBannerId ? 'बैनर संशोधित करें' : 'नया 16:9 बैनर जोड़ें'}
              subtitle="सभी इमेज स्वचालित रूप से 16:9 अनुपात एवं 1280×720 WebP प्रारूप में अनुकूलित होंगी।"
              icon={<ImageIcon className="w-5 h-5 text-amber-600" />}
            >
              <form onSubmit={handleSaveBanner} className="space-y-4">
                <AdminField label="बैनर शीर्षक *" required>
                  <input
                    type="text"
                    value={bannerTitle}
                    onChange={(e) => setBannerTitle(e.target.value)}
                    placeholder="उदा. पावन गुरु पूर्णिमा सत्संग महोत्सव"
                    className="admin-input text-sm"
                  />
                </AdminField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AdminField label="क्लिक नेविगेशन स्क्रीन (Target Screen)">
                    <select
                      value={bannerTargetScreen}
                      onChange={(e) => setBannerTargetScreen(e.target.value)}
                      className="admin-select"
                    >
                      <option value="/audio">ऑडियो एवं भजन (/audio)</option>
                      <option value="/stuti-vinati">स्तुति-विनती (/stuti-vinati)</option>
                      <option value="/books">साहित्य एवं पुस्तकें (/books)</option>
                      <option value="/notifications">सूचनाएं (/notifications)</option>
                      <option value="/search">खोज स्क्रीन (/search)</option>
                    </select>
                  </AdminField>

                  <AdminField label="प्रकाशन स्थिति">
                    <div className="flex items-center gap-3 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-stone-800">
                        <input
                          type="checkbox"
                          checked={bannerActive}
                          onChange={(e) => setBannerActive(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-600 accent-amber-600 cursor-pointer"
                        />
                        <span>होम स्क्रीन पर सक्रिय रखें</span>
                      </label>
                    </div>
                  </AdminField>
                </div>

                {/* Fixed 16:9 Image Upload & Interactive Cropper */}
                <AdminUploadField
                  label="बैनर इमेज (Fixed 16:9 Widescreen) *"
                  profile={IMAGE_PROFILES.banner}
                  value={bannerImageUrl}
                  onChange={(file, preview) => {
                    setBannerImageFile(file);
                    setBannerImageUrl(preview);
                  }}
                  onRemove={() => {
                    setBannerImageFile(null);
                    setBannerImageUrl('');
                  }}
                  helperText="न्यूनतम 960×540px। अनुशंसित: 1280×720px (16:9)। क्रॉप टूल से किसी भी छवि को परफेक्ट अनुपात में लॉक करें।"
                  required
                />

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                  {editingBannerId && (
                    <AdminButton
                      type="button"
                      onClick={() => {
                        setEditingBannerId(null);
                        setBannerTitle('');
                        setBannerImageUrl('');
                        setBannerImageFile(null);
                      }}
                      variant="secondary"
                      size="md"
                    >
                      रद्द करें
                    </AdminButton>
                  )}
                  <AdminButton
                    type="submit"
                    disabled={isBannerSaving}
                    loading={isBannerSaving}
                    loadingText="सहेजा जा रहा है…"
                    icon={<Check className="w-4 h-4" />}
                    variant="primary"
                    size="md"
                  >
                    {editingBannerId ? 'बैनर अद्यतन करें' : 'बैनर सुरक्षित करें'}
                  </AdminButton>
                </div>
              </form>
            </AdminCard>
          </div>

          {/* Right Preview & Live Banners List (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Android Preview */}
            <AdminAspectRatioPreview
              imageUrl={bannerImageUrl || (banners[0]?.imageUrl)}
              profile={IMAGE_PROFILES.banner}
              title={bannerTitle || (banners[0]?.title) || 'संतमत सत्संग प्रचार'}
              subtitle="Android Home Screen Carousel"
            />

            {/* Existing Banners List */}
            <AdminCard
              title={`सक्रिय बैनर्स (${banners.length})`}
              subtitle="मोबाइल ऐप में इसी क्रम में प्रदर्शित होंगे।"
              icon={<Layers className="w-4 h-4 text-stone-500" />}
            >
              {bannersLoading ? (
                <div className="p-8 text-center text-stone-400 text-sm">बैनर्स लोड हो रहे हैं…</div>
              ) : banners.length === 0 ? (
                <div className="p-8 text-center text-stone-400 text-xs">
                  कोई बैनर उपलब्ध नहीं है। बाईं ओर से नया बैनर जोड़ें।
                </div>
              ) : (
                <div className="space-y-3">
                  {banners.map((b) => (
                    <div
                      key={b.id}
                      className="p-3 bg-stone-50 rounded-lg border border-stone-200/80 flex items-center justify-between gap-3 hover:border-amber-300 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-16 h-9 rounded-lg bg-stone-900 overflow-hidden shrink-0 border border-stone-300 relative shadow-2xs">
                          <img
                            src={b.imageUrl}
                            alt={b.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                            {b.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-500">
                            <span className="font-mono text-amber-700">{b.targetScreen || '/audio'}</span>
                            <span>•</span>
                            <span className={b.active ? 'text-emerald-600 font-bold' : 'text-stone-400'}>
                              {b.active ? 'सक्रिय' : 'निष्क्रिय'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleToggleBannerActive(b)}
                          className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
                            b.active
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-stone-100 border-stone-200 text-stone-400 hover:bg-stone-200'
                          }`}
                          title={b.active ? 'निष्क्रिय करें' : 'सक्रिय करें'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEditBanner(b)}
                          className="p-1.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                          title="संपादित करें"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteDialogItem({
                              type: 'banner',
                              id: b.id,
                              title: b.title,
                            })
                          }
                          className="p-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-700 transition-colors cursor-pointer"
                          title="हटाएं"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AdminCard>
          </div>
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
              title={editingSuvicharId ? 'सुविचार संशोधित करें' : 'नया दैनिक सुविचार जोड़ें'}
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
                  label="सुविचार पृष्ठभूमि चित्र (Background 16:9)"
                  profile={IMAGE_PROFILES.suvichar_poster}
                  value={suvicharImageUrl}
                  onChange={(file, preview) => {
                    setSuvicharImageFile(file);
                    setSuvicharImageUrl(preview);
                  }}
                  onRemove={() => {
                    setSuvicharImageFile(null);
                    setSuvicharImageUrl('');
                  }}
                  helperText="Android सुविचार कैरोसेल (220px ऊँचाई) के लिए 16:9 बैकड्रॉप छवि।"
                />

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                  {editingSuvicharId !== null && (
                    <AdminButton
                      type="button"
                      onClick={() => {
                        setEditingSuvicharId(null);
                        setSuvicharQuote('');
                        setSuvicharAuthor('');
                        setSuvicharImageUrl('');
                        setSuvicharImageFile(null);
                      }}
                      variant="secondary"
                      size="md"
                    >
                      रद्द करें
                    </AdminButton>
                  )}
                  <AdminButton
                    type="submit"
                    disabled={isSuvicharSaving}
                    loading={isSuvicharSaving}
                    loadingText="सहेजा जा रहा है…"
                    icon={<Check className="w-4 h-4" />}
                    variant="primary"
                    size="md"
                  >
                    {editingSuvicharId !== null ? 'सुविचार अद्यतन करें' : 'सुविचार सुरक्षित करें'}
                  </AdminButton>
                </div>
              </form>
            </AdminCard>
          </div>

          {/* Right Preview & List (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Android Suvichar Preview */}
            <AdminAspectRatioPreview
              imageUrl={suvicharImageUrl || (suvichars[0]?.imageUrl)}
              profile={IMAGE_PROFILES.suvichar_poster}
              title={suvicharQuote || (suvichars[0]?.quote) || 'सत्य ही परमात्मा का स्वरूप है।'}
              subtitle={suvicharAuthor || (suvichars[0]?.author) || 'पूज्यपाद महर्षि मेँहीँ परमहंस'}
            />

            {/* Existing Suvichar List */}
            <AdminCard
              title={`सुविचार संग्रह (${suvichars.length})`}
              subtitle="Android ऐप में कैरोसेल के रूप में स्क्रॉल होता है।"
              icon={<Quote className="w-4 h-4 text-stone-500" />}
            >
              {suvichars.length === 0 ? (
                <div className="p-8 text-center text-stone-400 text-xs">कोई सुविचार उपलब्ध नहीं है।</div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {suvichars.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 bg-stone-50 rounded-lg border border-stone-200/80 space-y-2 hover:border-amber-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-stone-900 line-clamp-2">
                          "{s.quote}"
                        </p>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleEditSuvichar(s)}
                            className="p-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                            title="संपादित करें"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteDialogItem({
                                type: 'suvichar',
                                id: s.id,
                                title: s.quote.slice(0, 30) + '…',
                              })
                            }
                            className="p-1 rounded-md bg-red-50 hover:bg-red-100 text-red-700 transition-colors cursor-pointer"
                            title="हटाएं"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-200/60">
                        <span className="font-semibold text-amber-800 truncate">— {s.author}</span>
                        <span>{s.date || 'दैनिक'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AdminCard>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AdminDeleteDialog
        isOpen={!!deleteDialogItem}
        title={deleteDialogItem?.type === 'banner' ? 'बैनर हटाएं' : 'सुविचार हटाएं'}
        description={`क्या आप वाकई '${deleteDialogItem?.title}' को हटाना चाहते हैं? यह Android मोबाइल ऐप के होम स्क्रीन कैरोसेल से तत्काल हट जाएगा।`}
        targetIdentifier={String(deleteDialogItem?.id || '')}
        confirmButtonText="हाँ, हटाएं"
        cancelButtonText="रद्द करें"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) setDeleteDialogItem(null);
        }}
      />
    </div>
  );
};
