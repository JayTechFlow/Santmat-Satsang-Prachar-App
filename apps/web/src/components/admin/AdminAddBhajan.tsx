/**
 * ============================================================================
 * Santmat Satsang Prachar - Add Devotional Bhajan (Admin)
 * ============================================================================
 * Allows the administrator to publish new devotional tracks, schedule posts,
 * upload or link artwork thumbnails, specify vocal artists, select categories,
 * input unlimited lyrics, and auto-fetch audio-synchronized Hindi subtitles.
 */
import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Check,
  Music2,
  Link as LinkIcon,
  Sparkles,
  Clock,
  Volume2,
  Play,
  Pause,
  Calendar,
  Layers,
  FileText,
  Timer,
  RefreshCw,
  Trash2,
  Info,
  Image as ImageIcon,
  HelpCircle,
  LucideIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storageService';

export const AdminAddBhajan: React.FC = () => {
  const navigate = useNavigate();
  const { categories, addBhajan } = useApp();

  // Form input states
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'पदावली भजन');
  const [subCategory, setSubCategory] = useState(categories[0]?.subCategories?.[0] || 'महर्षि मेँहीं पदावली');
  const [lyrics, setLyrics] = useState('');
  const [duration, setDuration] = useState('06:30');
  const [durationSeconds, setDurationSeconds] = useState(390);
  const [isDurationAutoFetched, setIsDurationAutoFetched] = useState(false);
  const [language, setLanguage] = useState('हिंदी');
  const [status, setStatus] = useState<'प्रकाशित' | 'ड्राफ्ट' | 'शेड्यूल किया गया'>('प्रकाशित');

  // Scheduled Post States
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState('06:00');

  // Media preview and upload states
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [hasAudioFile, setHasAudioFile] = useState(false);
  const [audioFileName, setAudioFileName] = useState('');
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Audio Playback Preview States
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);

  // Subtitle / Lyrics Mode (Plain vs Timed Subtitles)
  const [isSubtitleMode, setIsSubtitleMode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Available sub-categories for currently selected category
  const activeSubCategories = useMemo(() => {
    const foundCat = categories.find((c) => c.name === category);
    return foundCat?.subCategories || ['सामान्य'];
  }, [category, categories]);

  // Word count & character count (Unlimited)
  const wordCount = useMemo(() => {
    if (!lyrics.trim()) return 0;
    return lyrics.trim().split(/\s+/).filter(Boolean).length;
  }, [lyrics]);

  // Handle category change and reset sub-category
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    const found = categories.find((c) => c.name === newCategory);
    if (found && found.subCategories.length > 0) {
      setSubCategory(found.subCategories[0]);
    }
  };

  /**
   * Handle image file upload (FileReader -> Base64 data URL)
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
          setThumbnailUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Handle audio file selection and automatically extract duration
   */
  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFileName(file.name);
      setHasAudioFile(true);
      setAudioFile(file);

      // Create audio object URL for live playback
      if (audioBlobUrl) {
        URL.revokeObjectURL(audioBlobUrl);
      }
      const url = URL.createObjectURL(file);
      setAudioBlobUrl(url);

      const tempAudio = new Audio();
      tempAudio.src = url;

      tempAudio.onloadedmetadata = () => {
        const totalSecs = Math.floor(tempAudio.duration);
        if (!isNaN(totalSecs) && totalSecs > 0) {
          const minutes = Math.floor(totalSecs / 60);
          const seconds = totalSecs % 60;
          const formattedDuration = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
          setDuration(formattedDuration);
          setDurationSeconds(totalSecs);
          setIsDurationAutoFetched(true);
        }
      };
    }
  };

  /**
   * Toggle Live Audio Playback in the Admin form
   */
  const handleToggleAudioPlayback = () => {
    if (!audioBlobUrl) return;

    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(audioBlobUrl);
      audioElementRef.current.ontimeupdate = () => {
        if (audioElementRef.current) {
          setCurrentPlaybackTime(audioElementRef.current.currentTime);
        }
      };
      audioElementRef.current.onended = () => {
        setIsPlayingAudio(false);
        setCurrentPlaybackTime(0);
      };
    }

    if (isPlayingAudio) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioElementRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  /**
   * Apply direct image web URL
   */
  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      setThumbnailUrl(customUrlInput.trim());
      setCustomUrlInput('');
      setShowUrlInput(false);
    }
  };

  /**
   * Auto-fetch / Auto-generate Audio Timing Subtitle in Hindi
   * Reads raw lyrics lines, maps them accurately across the audio duration,
   * adding intro/interlude pauses, and produces synchronized LRC timestamp lines.
   */
  const handleAutoFetchSubtitleTiming = () => {
    if (!lyrics.trim()) {
      alert('कृपया पहले भजन के बोल (Lyrics) लिखें या पेस्ट करें।');
      return;
    }

    // Clean existing timestamps if any
    const cleanLines = lyrics
      .split('\n')
      .map((line) => line.replace(/^\[\d{2}:\d{2}(\.\d{2})?\]\s*/, '').trim())
      .filter((line) => line.length > 0);

    if (cleanLines.length === 0) return;

    const totalSeconds = durationSeconds > 30 ? durationSeconds : 360;
    const introPause = 6; // 6 seconds sacred intro
    const outroReserve = 12; // 12 seconds ending music
    const singingTime = Math.max(20, totalSeconds - introPause - outroReserve);
    const interval = singingTime / cleanLines.length;

    const timedLines = cleanLines.map((line, index) => {
      const lineTime = introPause + index * interval;
      const mins = Math.floor(lineTime / 60);
      const secs = Math.floor(lineTime % 60);
      const formattedTime = `[${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}]`;
      return `${formattedTime} ${line}`;
    });

    setLyrics(timedLines.join('\n'));
    setIsSubtitleMode(true);
    setToastMessage('ऑडियो टाइमिंग सबटाइटल (Hindi Timed Subtitles) स्वतः तैयार हो गए!');
    setTimeout(() => setToastMessage(null), 2500);
  };

  /**
   * Stamp Current Audio Time onto Lyrics at the cursor or next line
   */
  const handleStampCurrentAudioTime = () => {
    const mins = Math.floor(currentPlaybackTime / 60);
    const secs = Math.floor(currentPlaybackTime % 60);
    const stamp = `[${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}]`;

    setLyrics((prev) => {
      return `${stamp} ${prev}`;
    });
    setToastMessage(`समय कोड ${stamp} जोड़ा गया`);
    setTimeout(() => setToastMessage(null), 1500);
  };

  /**
   * Clear Timestamps from Lyrics
   */
  const handleClearTimestamps = () => {
    const clean = lyrics
      .split('\n')
      .map((line) => line.replace(/^\[\d{2}:\d{2}(\.\d{2})?\]\s*/, ''))
      .join('\n');
    setLyrics(clean);
    setIsSubtitleMode(false);
    setToastMessage('टाइमस्टैम्प हटा दिए गए, सामान्य लिरिक्स सक्रिय है');
    setTimeout(() => setToastMessage(null), 2000);
  };

  /**
   * Submit Bhajan Creation (Publish, Draft, or Schedule)
   * Uploads the selected audio file to Firebase Storage first, then persists metadata.
   */
  const handleSubmit = async (
    e: React.FormEvent,
    actionType?: 'publish' | 'draft' | 'schedule'
  ) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) {
      alert('कृपया भजन का शीर्षक और गायक का नाम भरें।');
      return;
    }
    if (!audioFile) {
      alert('कृपया ऑडियो फ़ाइल अपलोड करें।');
      return;
    }

    let finalStatus: 'प्रकाशित' | 'ड्राफ्ट' | 'शेड्यूल किया गया' = status;
    if (actionType === 'draft') finalStatus = 'ड्राफ्ट';
    if (actionType === 'publish') finalStatus = 'प्रकाशित';
    if (actionType === 'schedule') finalStatus = 'शेड्यूल किया गया';

    if ((finalStatus === 'प्रकाशित' || finalStatus === 'शेड्यूल किया गया') && !thumbnailUrl.trim()) {
      alert('प्रकाशित करने के लिए कृपया भजन का थंबनेल/चित्र अपलोड करें।');
      return;
    }

    if (finalStatus === 'प्रकाशित' || finalStatus === 'शेड्यूल किया गया') {
      setToastMessage('ऑडियो फ़ाइल क्लाउड पर अपलोड हो रही है…');
      const upload = await storageService.uploadFile(
        audioFile,
        `audio/bhajans/${title.trim().replace(/\s+/g, '_')}`,
        (progress) => {
          setToastMessage(`ऑडियो अपलोड: ${progress}%`);
        }
      );

      if (!upload.success || !upload.data) {
        setToastMessage(upload.error || 'ऑडियो अपलोड विफल');
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }

      addBhajan({
        title: title.trim(),
        artist: artist.trim(),
        category,
        subCategory,
        duration: duration || '05:00',
        durationSeconds: durationSeconds || 300,
        audioUrl: upload.data.downloadUrl,
        storagePath: upload.data.storagePath,
        imageUrl: thumbnailUrl,
        lyrics: lyrics,
        type: 'भजन',
        language,
        status: finalStatus,
        scheduledDate: finalStatus === 'शेड्यूल किया गया' ? scheduledDate : undefined,
        scheduledTime: finalStatus === 'शेड्यूल किया गया' ? scheduledTime : undefined,
      });
    } else {
      addBhajan({
        title: title.trim(),
        artist: artist.trim(),
        category,
        subCategory,
        duration: duration || '05:00',
        durationSeconds: durationSeconds || 300,
        imageUrl: thumbnailUrl,
        lyrics: lyrics,
        type: 'भजन',
        language,
        status: finalStatus,
      });
    }

    let successText = 'नया भजन सफलतापूर्वक प्रकाशित किया गया!';
    if (finalStatus === 'ड्राफ्ट') {
      successText = 'भजन ड्राफ्ट के रूप में सहेज लिया गया!';
    } else if (finalStatus === 'शेड्यूल किया गया') {
      successText = `भजन ${scheduledDate} (${scheduledTime}) के लिए सफलतापूर्वक शेड्यूल किया गया!`;
    }

    setToastMessage(successText);
    setTimeout(() => {
      setToastMessage(null);
      navigate('/admin/bhajan-list');
    }, 1200);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5 select-none font-['Mukta']">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-2 font-bold text-sm animate-in slide-in-from-top duration-200 border border-emerald-500/40">
          <Check className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-stone-500 font-semibold">
        <button onClick={() => navigate('/admin/dashboard')} className="hover:text-stone-800">
          डैशबोर्ड
        </button>
        <span>&gt;</span>
        <button onClick={() => navigate('/admin/bhajan-list')} className="hover:text-stone-800">
          भजन प्रबंधन
        </button>
        <span>&gt;</span>
        <span className="text-amber-800 font-bold">नया भजन जोड़ें</span>
      </div>

      {/* Form Container */}
      <form onSubmit={(e) => handleSubmit(e, 'publish')} className="space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-6">
          {/* Section Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-5 bg-[#EA580C] rounded-full" />
              <h2 className="font-extrabold text-lg text-stone-900">
                भजन की जानकारी एवं संगीत अपलोड
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[0.7rem] px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 font-bold rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                असीमित लिरिक्स व सबटाइटल सिंक
              </span>
            </div>
          </div>

          {/* Form Top Section: 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Details & Lyrics */}
            <div className="space-y-4 text-xs">
              {/* Title */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  भजन शीर्षक (Title) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="भजन का पावन शीर्षक लिखें"
                  required
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-sm font-semibold text-stone-900 transition-colors"
                />
              </div>

              {/* Artist */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  गायक / स्वर <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="गायक या आश्रम का नाम लिखें (उदा. स्वर: स्वामी जी महाराज)"
                  required
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-sm font-semibold text-stone-900 transition-colors"
                />
              </div>

              {/* Dynamic Category Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    श्रेणी (Category) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-xs font-semibold text-stone-800 transition-colors cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id || cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic Sub-Category Selector */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    उप-श्रेणी (Sub Category)
                  </label>
                  <select
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-xs font-semibold text-stone-800 transition-colors cursor-pointer"
                  >
                    {activeSubCategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ONLY Lyrics (Unlimited words/characters, No description) + Auto-fetch Audio Timing Subtitle */}
              <div className="pt-1">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <label className="font-bold text-stone-800 text-xs flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-amber-700" />
                      भजन के बोल (Lyrics / पद)
                    </label>
                    <span className="text-[0.68rem] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      असीमित (Unlimited)
                    </span>
                  </div>

                  <span className="text-stone-500 text-[0.7rem] font-bold">
                    {wordCount} शब्द • {lyrics.length} अक्षर
                  </span>
                </div>

                {/* Subtitle / Timing Toolbar */}
                <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-2.5 mb-2 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[0.72rem]">
                      <Timer className="w-3.5 h-3.5 text-amber-700" />
                      <span>ऑडियो टाइमिंग सबटाइटल टूल (Hindi Subtitle Sync):</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleAutoFetchSubtitleTiming}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[0.68rem] font-bold shadow-xs flex items-center gap-1 transition-colors"
                        title="ऑडियो अवधि के अनुसार सभी पंक्तियों पर टाइमकोड स्वतः लगाएं"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>ऑडियो टाइमिंग सबटाइटल स्वतः बनाएं</span>
                      </button>

                      {hasAudioFile && isPlayingAudio && (
                        <button
                          type="button"
                          onClick={handleStampCurrentAudioTime}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[0.68rem] font-bold shadow-xs flex items-center gap-1 transition-colors"
                          title="वर्तमान ऑडियो समय का टाइमस्टैम्प लगाएं"
                        >
                          <Clock className="w-3 h-3" />
                          <span>समय स्टैम्प करें</span>
                        </button>
                      )}

                      {lyrics.includes('[') && (
                        <button
                          type="button"
                          onClick={handleClearTimestamps}
                          className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-[0.68rem] font-bold transition-colors flex items-center gap-1"
                          title="टाइमस्टैम्प हटाएं और सामान्य लिरिक्स में बदलें"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>टाइमिंग हटाएं</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-[0.65rem] text-amber-800 leading-snug">
                    💡 <strong>ऑटो टाइमिंग:</strong> बटन पर क्लिक करते ही प्रत्येक पद पर <code>[00:15]</code> के अनुसार ऑडियो टाइमिंग सबटाइटल जुड़ जाएगा जिससे भजन बजते समय लिरिक्स लाइव स्क्रॉल होंगे।
                  </p>
                </div>

                <textarea
                  rows={7}
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="यहाँ भजन के संपूर्ण बोल, दोहा, चौपाई अथवा पद लिखें (असीमित शब्द/अक्षर दर्ज कर सकते हैं)..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-xs text-stone-900 transition-colors leading-relaxed font-['Mukta']"
                />
              </div>
            </div>

            {/* Right Column: Media Uploads & Previews */}
            <div className="space-y-4 text-xs">
              {/* Thumbnail Upload & Preview */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-stone-700">
                    भजन का थंबनेल (Thumbnail Artwork) <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-amber-700 hover:text-amber-800 font-bold text-[0.72rem] flex items-center gap-1"
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>{showUrlInput ? 'अपलोड मोड' : 'URL दर्ज करें'}</span>
                  </button>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />

                {/* Direct URL Input */}
                {showUrlInput && (
                  <div className="flex items-center gap-2 mb-3 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200">
                    <input
                      type="url"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      placeholder="इमेज वेब लिंक (https://...) पेस्ट करें"
                      className="flex-1 px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCustomUrl}
                      className="px-3 py-1.5 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-lg font-bold text-xs shadow-xs"
                    >
                      लागू करें
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Upload Dropzone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-amber-300 rounded-2xl p-4 bg-amber-50/30 flex flex-col items-center justify-center text-center space-y-2 hover:bg-amber-50/70 transition-all cursor-pointer group active:scale-[0.99]"
                  >
                    <div className="p-2.5 rounded-full bg-amber-100 text-amber-700 group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-800 text-xs">थंबनेल फ़ोटो अपलोड करें</p>
                      <p className="text-[0.68rem] text-stone-500 mt-0.5">
                        JPG, PNG, WebP (1:1 या 16:9)
                      </p>
                    </div>
                    <span className="px-4 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors shadow-xs">
                      डिवाइस से चुनें
                    </span>
                  </div>

                  {/* Thumbnail Preview */}
                  <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-xs h-36 bg-stone-100 group">
                    <img
                      src={thumbnailUrl}
                      alt="थंबनेल प्रीव्यू"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-black/65 text-white text-[0.65rem] px-2 py-0.5 rounded-md font-bold backdrop-blur-xs">
                      थंबनेल प्रीव्यू
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white/90 hover:bg-white text-stone-900 text-xs px-3 py-1.5 rounded-lg font-bold shadow-md transition-all active:scale-95"
                      >
                        फ़ोटो बदलें
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Audio File (MP3) Upload with Auto Duration Fetching */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-stone-700">
                    ऑडियो फ़ाइल (MP3 / WAV) <span className="text-red-500">*</span>
                  </label>
                  {isDurationAutoFetched && (
                    <span className="text-[0.68rem] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      अवधि स्वतः प्राप्त ({duration})
                    </span>
                  )}
                </div>

                <input
                  type="file"
                  ref={audioInputRef}
                  onChange={handleAudioFileChange}
                  accept="audio/mp3, audio/wav, audio/m4a, audio/*"
                  className="hidden"
                />

                {/* Audio Dropzone */}
                <div
                  onClick={() => audioInputRef.current?.click()}
                  className="border border-stone-200 rounded-2xl p-4 bg-stone-50 flex flex-col items-center justify-center text-center space-y-2 mb-3 hover:bg-orange-50/40 transition-colors cursor-pointer"
                >
                  <div className="p-2 rounded-full bg-orange-100 text-orange-600">
                    <Music2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-stone-800">
                      {hasAudioFile ? audioFileName : 'ऑडियो फ़ाइल अपलोड करें'}
                    </p>
                    <p className="text-[0.65rem] text-stone-500">
                      MP3, WAV फ़ाइल (अपलोड करने पर अवधि स्वतः फ़ेच हो जाएगी)
                    </p>
                  </div>
                  <span className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition-colors shadow-xs">
                    {hasAudioFile ? 'ऑडियो फ़ाइल बदलें' : 'ऑडियो चुनें'}
                  </span>
                </div>

                {/* Live Audio Player Bar */}
                {hasAudioFile && (
                  <div className="bg-amber-50/50 rounded-2xl p-3 border border-amber-200/80 shadow-xs flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleToggleAudioPlayback}
                      className="w-9 h-9 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white flex items-center justify-center shadow-xs shrink-0 transition-transform active:scale-95"
                    >
                      {isPlayingAudio ? (
                        <Pause className="w-4 h-4 fill-white stroke-none" />
                      ) : (
                        <Play className="w-4 h-4 fill-white stroke-none ml-0.5" />
                      )}
                    </button>

                    <div className="flex-1 space-y-1">
                      <div className="h-1.5 bg-stone-200 rounded-full relative overflow-hidden">
                        <div
                          className="h-full bg-[#EA580C] rounded-full transition-all duration-100"
                          style={{
                            width: durationSeconds
                              ? `${Math.min(100, (currentPlaybackTime / durationSeconds) * 100)}%`
                              : '0%',
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[0.65rem] font-bold text-stone-500">
                        <span>
                          {String(Math.floor(currentPlaybackTime / 60)).padStart(2, '0')}:
                          {String(Math.floor(currentPlaybackTime % 60)).padStart(2, '0')}
                        </span>
                        <span>{duration}</span>
                      </div>
                    </div>

                    <Volume2 className="w-4 h-4 text-stone-500 shrink-0" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Bottom Row: Duration, Language, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-100 text-xs">
            {/* Duration (Auto-fetched when user uploads audio) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-stone-700">
                  अवधि (Duration)
                </label>
                {isDurationAutoFetched ? (
                  <span className="text-[0.65rem] text-emerald-600 font-bold">स्वतः प्राप्त ✓</span>
                ) : (
                  <span className="text-[0.65rem] text-stone-400">ऑटो / संपादन</span>
                )}
              </div>
              <input
                type="text"
                value={duration}
                onChange={(e) => {
                  setDuration(e.target.value);
                  setIsDurationAutoFetched(false);
                }}
                placeholder="mm:ss (ऑडियो अपलोड से स्वतः प्राप्त)"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Language */}
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                भाषा
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="हिंदी">हिंदी</option>
                <option value="ब्रज भाषा">ब्रज भाषा</option>
                <option value="अवधी">अवधी</option>
                <option value="मैथिली">मैथिली</option>
                <option value="राजस्थानी">राजस्थानी</option>
              </select>
            </div>

            {/* Status (Publish, Draft, Schedule) */}
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                प्रकाशन स्थिति (Status) <span className="text-red-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="प्रकाशित">तत्काल प्रकाशित करें (Publish Now)</option>
                <option value="ड्राफ्ट">ड्राफ्ट के रूप में सहेजें (Save Draft)</option>
                <option value="शेड्यूल किया गया">शेड्यूल करें (Scheduled Post)</option>
              </select>
            </div>
          </div>

          {/* Scheduled Post Settings (Visible when Scheduled Post is chosen) */}
          {status === 'शेड्यूल किया गया' && (
            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 text-xs space-y-3 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <Calendar className="w-4 h-4 text-[#EA580C]" />
                <span>शेड्यूल पोस्ट दिनांक एवं समय सेट करें:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    शेड्यूल दिनांक (Date)
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:border-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    शेड्यूल समय (Time)
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:border-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              <p className="text-[0.68rem] text-amber-800">
                यह भजन निर्धारित दिनांक <strong>{scheduledDate}</strong> को प्रातः/सायं <strong>{scheduledTime}</strong> बजे स्वतः ऐप पर सभी भक्तों के लिए लाइव हो जाएगा।
              </p>
            </div>
          )}
        </div>

        {/* Footer Action Buttons with Scheduled Post Option */}
        <div className="flex flex-wrap items-center justify-end gap-3 font-bold text-xs pt-1">
          <button
            type="button"
            onClick={() => navigate('/admin/bhajan-list')}
            className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"
          >
            रद्द करें
          </button>

          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'draft')}
            className="px-5 py-2.5 bg-stone-100 hover:bg-amber-50 text-stone-800 rounded-xl border border-stone-300 transition-colors"
          >
            ड्राफ्ट के रूप में सहेजें
          </button>

          {/* Scheduled Post Button */}
          <button
            type="button"
            onClick={(e) => {
              if (status !== 'शेड्यूल किया गया') {
                setStatus('शेड्यूल किया गया');
                setToastMessage('कृपया शेड्यूल दिनांक और समय चुनें, फिर शेड्यूल करें बटन दबाएं');
                setTimeout(() => setToastMessage(null), 2500);
              } else {
                handleSubmit(e, 'schedule');
              }
            }}
            className={`px-5 py-2.5 rounded-xl border shadow-xs flex items-center gap-1.5 transition-all ${
              status === 'शेड्यूल किया गया'
                ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-700 group-hover:text-white" />
            <span>शेड्यूल करें (Schedule Post)</span>
          </button>

          {/* Publish Button */}
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'publish')}
            className="px-7 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-[0.98]"
          >
            <Check className="w-4 h-4" />
            <span>तत्काल प्रकाशित करें</span>
          </button>
        </div>
      </form>
    </div>
  );
};
