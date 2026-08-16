/**
 * ============================================================================
 * संतमत सत्संग प्रचार - एडमिन बैनर एवं सुविचार प्रबंधन (Banner & Suvichar Manager)
 * ============================================================================
 * यह मॉड्यूल एडमिन को मोबाइल ऐप के होम स्क्रीन कैरोसेल के लिए कस्टम बैनर इमेज
 * अपलोड करने, समाचार/सुविचार जोड़ने, संशोधित करने एवं हटाने की पूर्ण सुविधा प्रदान करता है।
 */
import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Plus,
  Trash2,
  Edit3,
  Share2,
  Check,
  Eye,
  Layers,
  Calendar,
  User,
  Quote,
  Tag,
  Loader2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storageService';
import { SuvicharItem } from '../../types';

export const AdminBannerManager: React.FC = () => {
  const {
    suvichars,
    addSuvichar,
    updateSuvichar,
    deleteSuvichar,
  } = useApp();

  // फॉर्म इनपुट स्टेट (Form Input States)
  const [title, setTitle] = useState('');
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');
  const [theme, setTheme] = useState('');
  const [date, setDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSpecialPoster, setIsSpecialPoster] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // संपादन अवस्था (Edit Mode)
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // फाइल अपलोड रेफरेंस
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  /**
   * फ़ाइल चयन या ड्रैग-एंड-ड्रॉप से इमेज को Firebase Storage में अपलोड करता है।
   * सफलता पर बैनर इमेज के रूप में असली Storage download URL उपयोग होता है।
   */
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('कृपया केवल इमेज (JPG, PNG, WebP) फ़ाइल चुनें।');
      return;
    }

    setIsUploading(true);
    const res = await storageService.uploadFile(file, 'banners');
    setIsUploading(false);
    if (res.success && res.data) {
      setImageUrl(res.data.downloadUrl);
      showToast('बैनर इमेज सफलतापूर्वक अपलोड हुई!');
    } else {
      alert(res.error || 'बैनर इमेज अपलोड विफल रहा। कृपया पुनः प्रयास करें।');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const showToast = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  /**
   * नया बैनर जोड़ना या संपादित करना
   */
  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();

    if (!quote.trim() && !imageUrl.trim()) {
      alert('कृपया बैनर इमेज या विचार वाणी अवश्य भरें।');
      return;
    }
    if (!quote.trim()) {
      alert('विचार वाणी (quote) अवश्य भरें।');
      return;
    }
    if (!imageUrl.trim()) {
      alert('बैनर इमेज (image) अवश्य अपलोड करें।');
      return;
    }

    if (editingId !== null) {
      // संपादन (Update)
      updateSuvichar(editingId, {
        title: title.trim() || undefined,
        quote: quote.trim(),
        author: author.trim() || 'संत वाणी',
        theme: theme.trim() || 'सत्संग महिमा',
        date: date.trim() || new Date().toLocaleDateString('hi-IN'),
        imageUrl: imageUrl.trim(),
        isSpecialPoster,
      });
      showToast('बैनर सफलतापूर्वक अपडेट हो गया!');
      setEditingId(null);
    } else {
      // नया बैनर जोड़ना (Add New) — content is required, no fabricated defaults
      addSuvichar({
        title: title.trim() || undefined,
        quote: quote.trim(),
        author: author.trim() || 'संत वाणी',
        theme: theme.trim() || 'सत्संग विचार',
        date: date.trim() || new Date().toLocaleDateString('hi-IN'),
        imageUrl: imageUrl.trim(),
        isSpecialPoster,
      });
      showToast('नया होम बैनर सफलतापूर्वक जोड़ा गया!');
    }

    // फॉर्म रीसेट
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setQuote('');
    setAuthor('');
    setTheme('');
    setDate('');
    setImageUrl('');
    setIsSpecialPoster(true);
    setEditingId(null);
  };

  const startEdit = (item: SuvicharItem) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setQuote(item.quote);
    setAuthor(item.author);
    setTheme(item.theme);
    setDate(item.date || '');
    setImageUrl(item.imageUrl || '');
    setIsSpecialPoster(!!item.isSpecialPoster);

    // स्क्रॉल टू टॉप
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-['Mukta'] select-none">
      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in slide-in-from-top duration-200">
          <Check className="w-5 h-5 bg-white/20 p-0.5 rounded-full" />
          <span className="font-bold text-sm">{successMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-900 to-stone-900 p-6 rounded-3xl text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
            <ImageIcon className="w-4 h-4" />
            <span>होम स्क्रीन कैरोसेल प्रबंधन</span>
          </div>
          <h1 className="text-2xl font-extrabold">होम बैनर एवं समाचार/विचार प्रबंधन</h1>
          <p className="text-stone-300 text-sm mt-1 max-w-2xl">
            यहाँ से आप मोबाइल ऐप के होम स्क्रीन पर दिखने वाले शीर्ष बैनर की इमेज अपनी इच्छानुसार बदल सकते हैं,
            नया बैनर/पोस्टर अपलोड कर सकते हैं, तथा समाचार एवं सुविचार टेक्स्ट को नियंत्रित कर सकते हैं।
          </p>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-sm transition-all shadow-md active:scale-95 shrink-0 disabled:opacity-60"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          <span>{isUploading ? 'अपलोड हो रहा…' : 'इमेज अपलोड करें'}</span>
        </button>
      </div>

      {/* Grid: Left Form (7 Cols) + Right Live Preview (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Upload & Details Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              {editingId !== null ? (
                <>
                  <Edit3 className="w-5 h-5 text-amber-600" />
                  <span>बैनर संपादित करें (Edit Banner)</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 text-amber-600" />
                  <span>नया होम बैनर / इमेज जोड़ें (Add Banner)</span>
                </>
              )}
            </h2>

            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-stone-500 hover:text-stone-800 font-semibold"
              >
                रद्द करें (Cancel)
              </button>
            )}
          </div>

          <form onSubmit={handleSaveBanner} className="space-y-4">
            {/* 1. इमेज अपलोड सेक्शन (Image Upload Dropzone & URL) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-amber-600" />
                  बैनर इमेज चुनें या अपलोड करें (Upload Custom Banner Image)
                </span>
                <span className="text-[0.7rem] text-amber-700 font-medium">
                  PNG, JPG, WebP समर्थित
                </span>
              </label>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                  isUploading
                    ? 'border-amber-400 bg-amber-50 opacity-70 cursor-wait'
                    : isDragging
                      ? 'border-amber-500 bg-amber-50/50 scale-[1.01]'
                      : 'border-stone-300 hover:border-amber-400 bg-stone-50/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-800">
                      {isUploading
                        ? 'इमेज Firebase Storage में अपलोड हो रही है…'
                        : 'कंप्यूटर या मोबाइल से अपनी इमेज अपलोड करने के लिए यहाँ क्लिक करें'}
                    </p>
                    <p className="text-[0.7rem] text-stone-500 mt-0.5">
                      या फाइल को सीधे यहाँ ड्रैग एवं ड्रॉप (Drag & Drop) करें
                    </p>
                  </div>
                </div>
              </div>

              {/* Or Image URL Input */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-semibold text-stone-500 whitespace-nowrap">
                  या इमेज URL:
                </span>
                <input
                  type="url"
                  placeholder="https://example.com/banner-image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* 2. दिनांक / टैग (Date Tag) & थीम */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>दिनांक / टैग बैज</span>
                </label>
                <input
                  type="text"
                  placeholder="उदा. 15 अगस्त (आज का विचार)"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-amber-600" />
                  <span>थीम / श्रेणी</span>
                </label>
                <input
                  type="text"
                  placeholder="उदा. सत्संग महिमा एवं राष्ट्र चेतना"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* 3. सुविचार / समाचार वाणी (Quote / News Content) */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700 flex items-center gap-1">
                <Quote className="w-3.5 h-3.5 text-amber-600" />
                <span>समाचार एवं सुविचार वाणी (News / Quote Text)</span>
              </label>
              <textarea
                rows={3}
                placeholder="यहाँ पावन संत वाणी, सुविचार या समाचार विवरण दर्ज करें..."
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            {/* 4. संत / लेखक नाम (Author / Source) */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-amber-600" />
                <span>पूज्य संत / आश्रम का नाम</span>
              </label>
              <input
                type="text"
                placeholder="उदा. पूज्य गुरुदेव (महर्षि मेँहीं आश्रम)"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            {/* Submit Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>{editingId !== null ? 'बैनर अपडेट करें' : 'नया बैनर जोड़ें एवं लागू करें'}</span>
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-xs rounded-xl transition-colors"
                >
                  रद्द करें
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right: Live Mobile Banner Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-amber-600" />
                <span>मोबाइल में कैसा दिखेगा (Live Mobile Preview)</span>
              </h3>
              <span className="text-[0.68rem] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                रीयल-टाइम प्रीव्यू
              </span>
            </div>

            {/* Mock Mobile Card replicating exact HomeScreen design */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-amber-900/10 h-56 bg-stone-900 select-none">
              {/* Background Image */}
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Banner Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-800 to-stone-900">
                  <div className="text-center text-stone-500 space-y-1.5">
                    <ImageIcon className="w-8 h-8 mx-auto" />
                    <p className="text-[0.72rem] font-bold">
                      {isUploading ? 'इमेज अपलोड हो रही है…' : 'बैनर इमेज चयनित नहीं'}
                    </p>
                  </div>
                </div>
              )}

              {/* Share Button (Keep as requested) */}
              <button
                type="button"
                className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-colors shadow-sm z-20"
                title="शेयर बटन"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* "आज का समाचार एवं विचार देखें" Button */}
              <div className="absolute bottom-3 left-3 bg-stone-900/85 backdrop-blur-md text-amber-300 px-3.5 py-1 rounded-full text-[0.72rem] font-['Mukta'] font-bold shadow-md border border-amber-500/40 z-10">
                <span>आज का समाचार एवं विचार देखें</span>
              </div>
            </div>

            <p className="text-[0.72rem] text-stone-500 text-center">
              उपरोक्त कार्ड ठीक उसी प्रकार दिखेगा जैसे मोबाइल स्क्रीन पर शेयर बटन और "आज का समाचार एवं विचार देखें" बटन के साथ प्रदर्शित होता है।
            </p>
          </div>
        </div>
      </div>

      {/* Bottom List: All Current Banners in Carousel */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-700" />
              <span>सक्रिय बैनर सूची (Active Home Banners: {suvichars.length})</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              यहाँ वर्तमान में मोबाइल ऐप में प्रदर्शित होने वाले सभी बैनर सूचीबद्ध हैं। आप किसी भी बैनर को संपादित या हटा सकते हैं।
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suvichars.map((item, index) => (
            <div
              key={item.id || index}
              className="border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between bg-stone-50/50 group"
            >
              {/* Thumbnail Container */}
              <div className="relative h-36 bg-stone-800 overflow-hidden">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.theme}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-800 to-stone-900">
                    <ImageIcon className="w-7 h-7 text-stone-600" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Index badge */}
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[0.65rem] font-bold text-white">
                  क्र. #{index + 1}
                </div>

                {/* Date / Tag */}
                {item.date && (
                  <div className="absolute top-2 right-2 bg-amber-500/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[0.65rem] font-bold text-white">
                    {item.date}
                  </div>
                )}

                {/* Bottom quote preview */}
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <p className="text-xs font-bold line-clamp-2 drop-shadow-sm">
                    "{item.quote}"
                  </p>
                  <span className="text-[0.68rem] text-amber-300 font-semibold block mt-0.5">
                    — {item.author}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-white flex items-center justify-between gap-2 border-t border-stone-100">
                <span className="text-[0.68rem] text-stone-400 font-semibold px-2">
                  {item.isSpecialPoster ? 'विशेष पोस्टर' : item.theme || 'होम बैनर'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                    title="संपादित करें / इमेज बदलें"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (suvichars.length <= 1) {
                        alert('कम से कम एक बैनर होना अनिवार्य है।');
                        return;
                      }
                      if (confirm('क्या आप निश्चित रूप से इस बैनर को हटाना चाहते हैं?')) {
                        deleteSuvichar(item.id);
                        showToast('बैनर हटा दिया गया।');
                      }
                    }}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="हटाएं"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
