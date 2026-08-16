/**
 * ============================================================================
 * Santmat Satsang Prachar - Stuti & Binti Management (Admin)
 * ============================================================================
 * Allows the administrator to manage and update Morning and Evening Stutis,
 * audio links, verse stanzas, guru quotes, and background banner artwork.
 */
import React, { useState, useRef } from 'react';
import {
  BookOpen,
  Play,
  Pause,
  Upload,
  Link as LinkIcon,
  Check,
  Edit3,
  Volume2,
  Eye,
  Clock,
  Layers,
  Quote,
  Music2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StutiItem } from '../../types';
import { NamasteIcon } from '../shared/DevotionalIcons';

import { storageService } from '../../services/storageService';

export const AdminStutiManager: React.FC = () => {
  const { stutis, updateStuti, playTrack, currentTrack, isPlaying, togglePlay } = useApp();

  // Selected Stuti to edit (morning or evening)
  const [selectedStutiId, setSelectedStutiId] = useState<string>(stutis[0]?.id || 'stuti-morning');
  const activeStuti = stutis.find((s) => s.id === selectedStutiId) || stutis[0];

  // Edit fields
  const [title, setTitle] = useState(activeStuti?.title || '');
  const [subtitle, setSubtitle] = useState(activeStuti?.subtitle || '');
  const [artist, setArtist] = useState(activeStuti?.artist || '');
  const [duration, setDuration] = useState(activeStuti?.duration || '');
  const [quote, setQuote] = useState(activeStuti?.quote || '');
  const [bannerImage, setBannerImage] = useState(activeStuti?.bannerImage || '');
  const [audioUrl, setAudioUrl] = useState(activeStuti?.audioUrl || '');
  const [lyrics, setLyrics] = useState(activeStuti?.lyrics || '');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [audioUploading, setAudioUploading] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle audio upload to firebase
   */
  const handleAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioUploading(true);
    setAudioProgress(10);
    const res = await storageService.uploadFile(file, 'prayers', (p) => setAudioProgress(p));
    setAudioUploading(false);
    if (res.success && res.data) {
      setAudioUrl(res.data.downloadUrl);
      showToast('स्तुति ऑडियो सफलतापूर्वक फ़ायरबेस स्टोरेज पर अपलोड हुआ!');
    } else {
      alert(res.error || 'ऑडियो अपलोड विफल');
    }
  };

  // Sync state when switching stuti tabs
  const handleSelectStuti = (stuti: StutiItem) => {
    setSelectedStutiId(stuti.id);
    setTitle(stuti.title);
    setSubtitle(stuti.subtitle || '');
    setArtist(stuti.artist);
    setDuration(stuti.duration);
    setQuote(stuti.quote || '');
    setBannerImage(stuti.bannerImage || '');
    setLyrics(stuti.lyrics || '');
    setShowUrlInput(false);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  /**
   * Handle image upload
   */
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('कृपया केवल इमेज (JPG, PNG, WebP) फ़ाइल चुनें।');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBannerImage(event.target.result as string);
          showToast('कस्टम स्तुति बैनर इमेज सफलतापूर्वक लोड हुई!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Apply Direct Image URL
   */
  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      setBannerImage(customUrlInput.trim());
      setCustomUrlInput('');
      setShowUrlInput(false);
      showToast('इमेज लिंक लागू हो गया!');
    }
  };

  /**
   * Save Stuti Updates
   */
  const handleSaveStuti = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('कृपया स्तुति का शीर्षक दर्ज करें।');
      return;
    }
    if (!duration.trim()) {
      alert('कृपया अवधि (duration) दर्ज करें।');
      return;
    }

    updateStuti(selectedStutiId, {
      title: title.trim(),
      subtitle: subtitle.trim(),
      artist: artist.trim(),
      duration: duration.trim(),
      quote: quote.trim(),
      bannerImage: bannerImage.trim(),
      audioUrl: audioUrl.trim(),
      lyrics: lyrics.trim(),
    });

    showToast('स्तुति-बिनती की जानकारी सफलतापूर्वक अपडेट हो गई!');
  };

  const isCurrentPlayingThis = currentTrack?.id === activeStuti.id && isPlaying;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-['Mukta'] select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-bold text-sm animate-in slide-in-from-top duration-200">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-950 via-purple-950 to-stone-900 p-6 rounded-3xl text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
            <NamasteIcon className="w-4 h-4" />
            <span>दैनिक साधना प्रबंधन</span>
          </div>
          <h1 className="text-2xl font-extrabold">स्तुति एवं विनती प्रबंधन (Stuti & Binti)</h1>
          <p className="text-stone-300 text-sm mt-1 max-w-2xl">
            यहाँ से आप प्रातःकालीन एवं संध्याकालीन स्तुति-विनती के बोल, ऑडियो फाइल, गुरु वाणी उद्धरण एवं मोबाइल ऐप के पृष्ठ चित्र (Background Artwork) को नियंत्रित कर सकते हैं।
          </p>
        </div>

      </div>

      {/* Tab Selector: Morning vs Evening */}
      <div className="flex items-center gap-3">
        {stutis.map((stuti) => {
          const isSelected = stuti.id === selectedStutiId;
          return (
            <button
              key={stuti.id}
              onClick={() => handleSelectStuti(stuti)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm transition-all border ${
                isSelected
                  ? 'bg-gradient-to-r from-[#EA580C] to-amber-600 text-white border-transparent shadow-md'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <NamasteIcon className="w-4 h-4" />
              <span>{stuti.title}</span>
              <span className={`text-[0.68rem] px-2 py-0.5 rounded-full font-extrabold ${isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'}`}>
                {stuti.duration}
              </span>
            </button>
          );
        })}
      </div>

      {/* Stuti Details & Live Mobile Audio Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Edit Form (7 cols) */}
        <form onSubmit={handleSaveStuti} className="lg:col-span-7 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-[#EA580C]" />
              <span>{title} — विवरण एवं बोल संपादित करें</span>
            </h2>
            <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full">
              {activeStuti.type === 'morning' ? 'प्रातःकालीन' : 'संध्याकालीन'}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Title & Subtitle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  स्तुति शीर्षक <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="उदा. प्रातःकालीन स्तुति-विनती"
                  required
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  उप-शीर्षक (Subtitle)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="उदा. महर्षि मेँहीं पदावली एवं स्तुति"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Singer & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  गायक / स्वर (Artist / Ashram)
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="उदा. पूज्य स्वामी जी महाराज"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  अवधि (Duration)
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="उदा. 15:40"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Audio File Upload Control */}
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                स्तुति ऑडियो फ़ाइल (Audio Track)
              </label>
              <input
                type="file"
                ref={audioInputRef}
                onChange={handleAudioFileChange}
                accept="audio/*"
                className="hidden"
              />
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://... या फ़ाइल अपलोड करें"
                  className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => audioInputRef.current?.click()}
                  disabled={audioUploading}
                  className="px-4 py-2.5 bg-amber-800 hover:bg-amber-900 disabled:opacity-60 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{audioUploading ? `अपलोड हो रहा है (${audioProgress}%)` : 'ऑडियो अपलोड'}</span>
                </button>
              </div>
            </div>

            {/* Banner Artwork Image */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-stone-700">
                  पृष्ठभूमि बैनर फ़ोटो (Banner Wallpaper)
                </label>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-amber-700 hover:text-amber-800 font-bold text-[0.72rem] flex items-center gap-1"
                >
                  <LinkIcon className="w-3 h-3" />
                  <span>{showUrlInput ? 'फ़ाइल मोड' : 'URL दर्ज करें'}</span>
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageFileChange}
                accept="image/*"
                className="hidden"
              />

              {showUrlInput && (
                <div className="flex items-center gap-2 mb-3 bg-amber-50/50 p-2 rounded-xl border border-amber-200">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://... इमेज लिंक पेस्ट करें"
                    className="flex-1 px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="px-3 py-1.5 bg-[#EA580C] text-white rounded-lg font-bold text-xs"
                  >
                    लागू करें
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 border-2 border-dashed border-stone-300 hover:border-amber-400 rounded-2xl p-3 bg-stone-50 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4 text-amber-700" />
                  <span className="font-bold text-stone-700 text-xs">डिवाइस से फ़ोटो चुनें</span>
                </div>

                <div className="w-20 h-14 rounded-xl overflow-hidden border border-stone-200 shrink-0 bg-stone-100">
                  <img src={bannerImage} alt="Preview" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Sacred Quote */}
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                पावन संत विचार वाणी (Sacred Quote / Doha)
              </label>
              <textarea
                rows={2}
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="उदा. प्रातः काल उठि के रघुनाथा। मातु पिता गुरु नावहिं माथा॥"
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-stone-800"
              />
            </div>

            {/* Sacred Lyrics / Verses */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-stone-700">
                  सम्पूर्ण स्तुति-बिनती पद एवं बोल (Complete Lyrics)
                </label>
                <span className="text-[0.68rem] text-stone-400">
                  {lyrics.length} अक्षर
                </span>
              </div>
              <textarea
                rows={6}
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="यहाँ संपूर्ण स्तुति-विनती के छंद, दोहा एवं आरती दर्ज करें..."
                className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-xs text-stone-800 leading-relaxed font-['Mukta']"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="submit"
              className="px-8 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>स्तुति विवरण सहेजें (Save Changes)</span>
            </button>
          </div>
        </form>

        {/* Right: Live Preview & Player (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Mobile Stuti Card Preview */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-purple-600" />
                <span>मोबाइल में कैसा दिखेगा (Live Card Preview)</span>
              </h3>
              <span className="text-[0.65rem] bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded-full">
                स्तुति कार्ड
              </span>
            </div>

            {/* Mock Visual Card */}
            <div className="relative rounded-2xl overflow-hidden shadow-md h-52 bg-stone-900">
              <img src={bannerImage} alt={title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              <div className="absolute top-3 left-3 bg-purple-600/90 text-white text-[0.68rem] px-2.5 py-0.5 rounded-full font-bold">
                {activeStuti.type === 'morning' ? 'प्रातःकालीन स्तुति' : 'संध्याकालीन स्तुति'}
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h4 className="font-extrabold text-base drop-shadow-sm leading-tight">
                  {title}
                </h4>
                <p className="text-xs text-amber-300 font-semibold mt-0.5">
                  {artist} • {duration}
                </p>
                {quote && (
                  <p className="text-[0.7rem] text-stone-200 mt-1 line-clamp-1 italic">
                    "{quote}"
                  </p>
                )}
              </div>
            </div>

            {/* Test Audio Player Trigger */}
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    if (currentTrack?.id === activeStuti.id) {
                      togglePlay();
                    } else {
                      playTrack(activeStuti);
                    }
                  }}
                  className="w-10 h-10 rounded-full bg-[#EA580C] text-white flex items-center justify-center shadow-xs transition-transform active:scale-95 shrink-0"
                >
                  {isCurrentPlayingThis ? (
                    <Pause className="w-4 h-4 fill-white stroke-none" />
                  ) : (
                    <Play className="w-4 h-4 fill-white stroke-none ml-0.5" />
                  )}
                </button>

                <div>
                  <p className="font-bold text-xs text-stone-800">स्तुति ऑडियो चलाकर देखें</p>
                  <p className="text-[0.68rem] text-stone-500">
                    {isCurrentPlayingThis ? 'ऑडियो सक्रिय रूप से चल रहा है...' : 'प्लेबैक जांचने के लिए क्लिक करें'}
                  </p>
                </div>
              </div>

              <Volume2 className="w-4 h-4 text-stone-400 shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
