/**
 * ============================================================================
 * Santmat Satsang Prachar - Devotional Bhajan Management Table (Admin)
 * ============================================================================
 * Enables the administrator to browse, filter by devotional category, search,
 * quick-preview audio playback, change thumbnail artwork on-the-fly, edit
 * song metadata & lyrics, and manage release states.
 */
import React, { useState, useRef } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  Play,
  Pause,
  Music,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  X,
  Check,
  Sparkles,
  Volume2,
  Filter,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Bhajan } from '../../types';

export const AdminBhajanList: React.FC = () => {
  const {
    bhajans,
    updateBhajan,
    deleteBhajan,
    setAdminTab,
    categories,
    playTrack,
    currentTrack,
    isPlaying,
    togglePlay,
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Thumbnail Modal State
  const [thumbnailModalBhajan, setThumbnailModalBhajan] = useState<Bhajan | null>(null);
  const [newThumbnailUrl, setNewThumbnailUrl] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null);

  // Full Edit Modal State
  const [editingBhajan, setEditingBhajan] = useState<Bhajan | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editArtist, setEditArtist] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSubCategory, setEditSubCategory] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editLyrics, setEditLyrics] = useState('');
  const [editStatus, setEditStatus] = useState<'प्रकाशित' | 'ड्राफ्ट' | 'शेड्यूल किया गया'>('प्रकाशित');
  const [editScheduledDate, setEditScheduledDate] = useState<string>('');
  const [editScheduledTime, setEditScheduledTime] = useState<string>('06:00');
  const editModalFileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Filter bhajans by search text & category
  const filtered = bhajans.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.artist.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase()) ||
      (b.subCategory && b.subCategory.toLowerCase().includes(search.toLowerCase())) ||
      (b.lyrics && b.lyrics.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory =
      selectedCategoryFilter === 'all' || b.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Open Quick Thumbnail Editor
  const openThumbnailModal = (bhajan: Bhajan) => {
    setThumbnailModalBhajan(bhajan);
    setNewThumbnailUrl(bhajan.imageUrl);
    setUrlInput('');
    setShowUrlField(false);
  };

  // Open Full Detail Edit Modal
  const openEditModal = (bhajan: Bhajan) => {
    setEditingBhajan(bhajan);
    setEditTitle(bhajan.title);
    setEditArtist(bhajan.artist);
    setEditCategory(bhajan.category);
    setEditSubCategory(bhajan.subCategory || 'सामान्य');
    setEditDuration(bhajan.duration);
    setEditImageUrl(bhajan.imageUrl);
    setEditLyrics(bhajan.lyrics || '');
    setEditStatus(bhajan.status || 'प्रकाशित');
    setEditScheduledDate(bhajan.scheduledDate || '');
    setEditScheduledTime(bhajan.scheduledTime || '06:00');
  };

  // Handle Quick Thumbnail Upload
  const handleQuickThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('कृपया केवल इमेज (JPG, PNG, WebP) फ़ाइल चुनें।');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewThumbnailUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Quick Thumbnail
  const handleSaveThumbnail = () => {
    if (!thumbnailModalBhajan || !newThumbnailUrl) return;
    updateBhajan(thumbnailModalBhajan.id, { imageUrl: newThumbnailUrl });
    showToast(`"${thumbnailModalBhajan.title}" का थंबनेल सफलतापूर्वक बदल दिया गया!`);
    setThumbnailModalBhajan(null);
  };

  // Handle Edit Modal Image Upload
  const handleEditModalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('कृपया केवल इमेज (JPG, PNG, WebP) फ़ाइल चुनें।');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEditImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Full Edit Modal Changes
  const handleSaveFullEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBhajan || !editTitle.trim() || !editArtist.trim()) {
      alert('कृपया शीर्षक एवं गायक का नाम भरें।');
      return;
    }
    updateBhajan(editingBhajan.id, {
      title: editTitle.trim(),
      artist: editArtist.trim(),
      category: editCategory,
      subCategory: editSubCategory,
      duration: editDuration,
      imageUrl: editImageUrl,
      lyrics: editLyrics,
      status: editStatus,
      scheduledDate: editStatus === 'शेड्यूल किया गया' ? editScheduledDate : undefined,
      scheduledTime: editStatus === 'शेड्यूल किया गया' ? editScheduledTime : undefined,
    });
    showToast('भजन की जानकारी सफलतापूर्वक अपडेट की गई!');
    setEditingBhajan(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5 select-none relative font-['Mukta']">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-2 font-bold text-sm animate-in slide-in-from-top duration-200">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-extrabold text-2xl text-stone-900 leading-tight">
            भजन प्रबंधन एवं संगीत संग्रह
          </h2>
          <p className="text-xs text-stone-500 font-semibold">
            कुल {bhajans.length} भजन सक्रिय हैं • थंबनेल बदलने के लिए इमेज पर क्लिक करें
          </p>
        </div>

        <button
          onClick={() => setAdminTab('add_bhajan')}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl font-bold text-xs shadow-sm transition-colors self-start"
        >
          <Plus className="w-4 h-4" />
          <span>नया भजन जोड़ें</span>
        </button>
      </div>

      {/* Search & Category Filter Pills */}
      <div className="bg-white rounded-3xl p-4 border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 bg-stone-50 px-3.5 py-2 rounded-2xl border border-stone-200">
          <Search className="w-4 h-4 text-stone-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="भजन शीर्षक, गायक, पद या श्रेणी से खोजें..."
            className="w-full text-xs text-stone-800 bg-transparent focus:outline-none placeholder:text-stone-400"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
              selectedCategoryFilter === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            सभी श्रेणियाँ ({bhajans.length})
          </button>
          {categories.map((cat) => {
            const count = bhajans.filter((b) => b.category === cat.name).length;
            const isSelected = selectedCategoryFilter === cat.name;
            return (
              <button
                key={cat.id || cat.name}
                onClick={() => setSelectedCategoryFilter(cat.name)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                  isSelected
                    ? 'bg-[#EA580C] text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Bhajan Table Card */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-[0.72rem] font-bold text-stone-500 uppercase">
                <th className="pb-3">थंबनेल एवं शीर्षक</th>
                <th className="pb-3">श्रेणी / उप-श्रेणी</th>
                <th className="pb-3">अवधि</th>
                <th className="pb-3">प्ले संख्या</th>
                <th className="pb-3">स्थिति</th>
                <th className="pb-3 text-right">क्रियाएँ (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {filtered.map((b: Bhajan) => {
                const isPlayingThis = currentTrack?.id === b.id && isPlaying;
                return (
                  <tr key={b.id} className="hover:bg-stone-50/80 transition-colors group">
                    <td className="py-3 flex items-center gap-3 pr-2">
                      {/* Clickable Thumbnail with quick play / change trigger */}
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-stone-200 shadow-xs shrink-0 group/thumb">
                        <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            if (currentTrack?.id === b.id) {
                              togglePlay();
                            } else {
                              playTrack(b);
                            }
                          }}
                          className="absolute inset-0 bg-black/40 hover:bg-black/60 transition-opacity flex flex-col items-center justify-center text-white"
                        >
                          {isPlayingThis ? (
                            <Pause className="w-4 h-4 fill-white stroke-none" />
                          ) : (
                            <Play className="w-4 h-4 fill-white stroke-none ml-0.5" />
                          )}
                        </button>
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-bold text-stone-900 text-xs truncate leading-tight">
                          {b.title}
                        </h4>
                        <p className="text-[0.68rem] text-stone-500 truncate mt-0.5">
                          {b.artist}
                        </p>
                      </div>
                    </td>

                    <td className="py-3 text-stone-600 font-medium whitespace-nowrap">
                      <span className="font-bold text-stone-800">{b.category}</span>
                      {b.subCategory && (
                        <span className="block text-[0.68rem] text-stone-500">
                          {b.subCategory}
                        </span>
                      )}
                    </td>

                    <td className="py-3 text-stone-600 font-bold whitespace-nowrap">
                      {b.duration}
                    </td>

                    <td className="py-3 text-stone-800 font-bold whitespace-nowrap">
                      {b.plays.toLocaleString('hi-IN')}
                    </td>

                    <td className="py-3 whitespace-nowrap">
                      {b.status === 'शेड्यूल किया गया' ? (
                        <div className="space-y-0.5">
                          <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-amber-700" />
                            <span>शेड्यूल</span>
                          </span>
                          {b.scheduledDate && (
                            <span className="block text-[0.65rem] text-stone-500 font-medium">
                              {b.scheduledDate} {b.scheduledTime || ''}
                            </span>
                          )}
                        </div>
                      ) : b.status === 'ड्राफ्ट' ? (
                        <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-stone-150 text-stone-700 bg-stone-200">
                          ड्राफ्ट
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-emerald-100 text-emerald-800">
                          प्रकाशित
                        </span>
                      )}
                    </td>

                    <td className="py-3 text-right whitespace-nowrap space-x-1.5">
                      {/* Quick Change Thumbnail button */}
                      <button
                        onClick={() => openThumbnailModal(b)}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[0.7rem] border border-amber-200 inline-flex items-center gap-1 transition-colors"
                        title="नया थंबनेल अपलोड करें"
                      >
                        <Upload className="w-3 h-3" />
                        <span>थंबनेल</span>
                      </button>

                      {/* Edit Details button */}
                      <button
                        onClick={() => openEditModal(b)}
                        className="p-1.5 rounded-lg text-stone-700 hover:bg-stone-100 transition-colors"
                        title="विवरण संपादित करें"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => {
                          if (confirm(`क्या आप निश्चित रूप से "${b.title}" भजन हटाना चाहते हैं?`)) {
                            deleteBhajan(b.id);
                            showToast('भजन सफलतापूर्वक हटा दिया गया!');
                          }
                        }}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        title="हटाएं"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-stone-400 space-y-1">
            <Music className="w-8 h-8 mx-auto text-stone-300" />
            <p>कोई भजन नहीं मिला</p>
          </div>
        )}
      </div>

      {/* 1. Quick Change Thumbnail Modal */}
      {thumbnailModalBhajan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-amber-100 text-amber-700">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-stone-900">
                    भजन का थंबनेल बदलें
                  </h3>
                  <p className="text-xs text-stone-500 truncate max-w-[240px]">
                    {thumbnailModalBhajan.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setThumbnailModalBhajan(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              type="file"
              ref={thumbnailFileInputRef}
              onChange={handleQuickThumbnailUpload}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">
                नया थंबनेल प्रीव्यू (Live Preview):
              </label>
              <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-md h-48 bg-stone-900 group">
                <img
                  src={newThumbnailUrl}
                  alt="New Thumbnail Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-black/70 text-white text-[0.65rem] px-2.5 py-0.5 rounded-full font-bold backdrop-blur-xs">
                  थंबनेल फ़ोटो
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => thumbnailFileInputRef.current?.click()}
                  className="p-3 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-2xl border border-amber-200 flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold"
                >
                  <Upload className="w-5 h-5 text-[#EA580C]" />
                  <span>फ़ोटो अपलोड करें</span>
                  <span className="text-[0.65rem] text-stone-500 font-normal">डिवाइस से चुनें</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowUrlField(!showUrlField)}
                  className="p-3 bg-stone-50 hover:bg-stone-100 text-stone-800 rounded-2xl border border-stone-200 flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold"
                >
                  <LinkIcon className="w-5 h-5 text-stone-600" />
                  <span>इमेज URL दर्ज करें</span>
                  <span className="text-[0.65rem] text-stone-500 font-normal">वेब लिंक पेस्ट करें</span>
                </button>
              </div>

              {showUrlField && (
                <div className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://... इमेज लिंक पेस्ट करें"
                    className="flex-1 px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (urlInput.trim()) {
                        setNewThumbnailUrl(urlInput.trim());
                        setUrlInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-[#EA580C] text-white rounded-lg font-bold text-xs shadow-xs"
                  >
                    लागू करें
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100 font-bold text-xs">
              <button
                type="button"
                onClick={() => setThumbnailModalBhajan(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={handleSaveThumbnail}
                className="px-6 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl shadow-md flex items-center gap-1.5 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>थंबनेल सुरक्षित करें</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Full Edit Bhajan Details Modal */}
      {editingBhajan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-stone-200 space-y-5 animate-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-amber-100 text-amber-700">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-stone-900">
                  भजन विवरण एवं थंबनेल संपादित करें
                </h3>
              </div>
              <button
                onClick={() => setEditingBhajan(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFullEdit} className="space-y-4 text-xs">
              {/* Title & Singer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">भजन शीर्षक *</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">गायक / स्वर *</label>
                  <input
                    type="text"
                    value={editArtist}
                    onChange={(e) => setEditArtist(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>
              </div>

              {/* Dynamic Category & Sub-Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">श्रेणी</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id || cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">उप-श्रेणी</label>
                  <input
                    type="text"
                    value={editSubCategory}
                    onChange={(e) => setEditSubCategory(e.target.value)}
                    placeholder="उप-श्रेणी दर्ज करें"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Duration & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">अवधि (mm:ss)</label>
                  <input
                    type="text"
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">स्थिति</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="प्रकाशित">प्रकाशित</option>
                    <option value="ड्राफ्ट">ड्राफ्ट</option>
                    <option value="शेड्यूल किया गया">शेड्यूल करें (Scheduled Post)</option>
                  </select>
                </div>
              </div>

              {/* Scheduled Post Settings in Edit Modal */}
              {editStatus === 'शेड्यूल किया गया' && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">शेड्यूल दिनांक</label>
                    <input
                      type="date"
                      value={editScheduledDate}
                      onChange={(e) => setEditScheduledDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">शेड्यूल समय</label>
                    <input
                      type="time"
                      value={editScheduledTime}
                      onChange={(e) => setEditScheduledTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* Thumbnail Image Picker & Preview */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  थंबनेल इमेज (फ़ाइल अपलोड करें या URL बदलें)
                </label>

                <input
                  type="file"
                  ref={editModalFileInputRef}
                  onChange={handleEditModalImageUpload}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />

                <div className="flex items-center gap-3 p-3 bg-stone-50 border border-stone-200 rounded-2xl">
                  <img
                    src={editImageUrl}
                    alt="Thumbnail preview"
                    className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                  />
                  <div className="flex-1 space-y-1.5">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => editModalFileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-100 rounded-lg font-bold text-[0.7rem] shadow-xs transition-colors"
                      >
                        डिवाइस से फ़ोटो चुनें
                      </button>
                    </div>
                    <input
                      type="url"
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      placeholder="या इमेज URL दर्ज करें"
                      className="w-full px-2.5 py-1 bg-white border border-stone-200 rounded-lg text-[0.7rem] focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Lyrics */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  भजन के बोल / लिरिक्स (Lyrics)
                </label>
                <textarea
                  rows={4}
                  value={editLyrics}
                  onChange={(e) => setEditLyrics(e.target.value)}
                  placeholder="भजन के पद एवं बोल लिखें..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100 font-bold text-xs">
                <button
                  type="button"
                  onClick={() => setEditingBhajan(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>बदलाव सुरक्षित करें</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
