/**
 * StutiSlotEditor
 * ============================================================================
 * Reusable two-slot editor used for BOTH प्रातःकालीन स्तुति (morning) and
 * संध्याकालीन स्तुति (evening). Configured via the `slot` prop. It manages a
 * single canonical slot document (never creates/duplicates new records).
 */
import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  Upload,
  Link as LinkIcon,
  Check,
  Edit3,
  Volume2,
  Eye,
  Clock,
  Quote,
} from 'lucide-react';
import { useApp } from '../../../app/providers/AppContext';
import { StutiItem, StutiSlot } from '../../../types/common/index';
import { storageService } from '../../../services/storage/storageService';
import { contentPublishingService, PublishProgress } from '../../../services/shared/ContentPublishingService';
import { UploadProgressComponent } from '../../../components/ui/UploadProgress';
import { mediaValidator, MEDIA_VALIDATION_CONFIGS } from '../../../lib/media/validation/MediaValidator';
import { ImageOptimizer } from '../../../lib/media/optimization/ImageOptimizer';
import { getStutiSlotMeta } from '../config/stutiSlots';
import { AdminUploadField, AdminAspectRatioPreview } from '../../../components/admin';
import { IMAGE_PROFILES } from '../../../lib/media/profiles/imageProfiles';

interface StutiSlotEditorProps {
  slot: StutiSlot;
  stuti: StutiItem;
}

export const StutiSlotEditor: React.FC<StutiSlotEditorProps> = ({ slot, stuti }) => {
  const { playTrack, currentTrack, isPlaying, togglePlay } = useApp();
  const meta = getStutiSlotMeta(slot);
  const isMorning = slot === 'morning';

  // Edit fields
  const [title, setTitle] = useState(stuti.title || '');
  const [subtitle, setSubtitle] = useState(stuti.subtitle || '');
  const [artist, setArtist] = useState(stuti.artist || '');
  const [duration, setDuration] = useState(stuti.duration || '');
  const [quote, setQuote] = useState(stuti.quote || '');
  const [bannerImage, setBannerImage] = useState(stuti.bannerImage || '');
  const [audioUrl, setAudioUrl] = useState(stuti.audioUrl || '');
  const [lyrics, setLyrics] = useState(stuti.lyrics || '');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [publishProgress, setPublishProgress] = useState<PublishProgress | null>(null);
  const [originalStats, setOriginalStats] = useState<{ name: string; size: string; width: number; height: number; format: string } | null>(null);
  const [optimizedStats, setOptimizedStats] = useState<{ size: string; width: number; height: number; format: string; ratio: number } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioFile(file);
    setAudioUrl(file.name);
    showToast('स्तुति ऑडियो चयनित (अपलोड लंबित है)');
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOriginalStats(null);
    setOptimizedStats(null);
    setValidationErrors([]);

    const initialValidation = await mediaValidator.validate(file, 'image', 'stuti_vinati', true);
    if (!initialValidation.valid) {
      const errMsgs = initialValidation.errors.map(e => e.message);
      setValidationErrors(errMsgs);
      alert(`इमेज सत्यापन विफल:\n${errMsgs.join('\n')}`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setBannerImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise<void>((resolve) => {
      img.onload = () => {
        setOriginalStats({
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
          width: img.naturalWidth,
          height: img.naturalHeight,
          format: file.type,
        });
        resolve();
      };
      img.onerror = () => resolve();
    });

    const config = MEDIA_VALIDATION_CONFIGS['stuti_vinati'];
    const optRes = await ImageOptimizer.optimize(file, {
      maxWidth: config.maxWidth,
      maxHeight: config.maxHeight,
      quality: 0.82,
    });

    if (optRes.success && optRes.data) {
      const stats = optRes.data;

      const finalValidation = await mediaValidator.validate(stats.file, 'image', 'stuti_vinati', false);
      if (!finalValidation.valid) {
        const errMsgs = finalValidation.errors.map(e => e.message);
        setValidationErrors(errMsgs);
        alert(`इमेज सत्यापन विफल:\n${errMsgs.join('\n')}`);
        setImageFile(null);
        setOriginalStats(null);
        setBannerImage(stuti.bannerImage || '');
        return;
      }

      setImageFile(stats.file);
      const optUrl = URL.createObjectURL(stats.file);
      setBannerImage(optUrl);
      setOptimizedStats({
        size: (stats.optimized.sizeBytes / 1024 / 1024).toFixed(2) + ' MB',
        width: stats.optimized.width,
        height: stats.optimized.height,
        format: stats.optimized.mimeType,
        ratio: stats.optimized.compressionRatio,
      });
      showToast('स्तुति बैनर इमेज अनुकूलित एवं सत्यापित हुई');
    } else {
      const finalValidation = await mediaValidator.validate(file, 'image', 'stuti_vinati', false);
      if (!finalValidation.valid) {
        const errMsgs = finalValidation.errors.map(e => e.message);
        setValidationErrors(errMsgs);
        alert(`इमेज सत्यापन विफल:\n${errMsgs.join('\n')}`);
        setImageFile(null);
        setOriginalStats(null);
        setBannerImage(stuti.bannerImage || '');
        return;
      }
      setImageFile(file);
      showToast('कस्टम स्तुति बैनर इमेज चयनित (अपलोड लंबित है)');
    }
  };

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      setBannerImage(customUrlInput.trim());
      setCustomUrlInput('');
      setShowUrlInput(false);
      showToast('इमेज लिंक लागू हो गया!');
    }
  };

  const handleSaveStuti = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('कृपया स्तुति का शीर्षक दर्ज करें।');
      return;
    }
    if (!duration.trim()) {
      alert('कृपया अवधि (duration) दर्ज करें।');
      return;
    }

    setPublishProgress({
      phase: 'IDLE',
      percentage: 0,
      message: 'स्तुति विवरण सहेजा जा रहा है...',
    });

    const res = await contentPublishingService.publishContent({
      contentType: 'stuti',
      payload: {
        id: meta.docId,
        title: title.trim(),
        subtitle: subtitle.trim(),
        artist: artist.trim(),
        duration: duration.trim(),
        quote: quote.trim(),
        lyrics: lyrics.trim(),
        type: slot,
      },
      files: {
        audio: audioFile,
        image: imageFile,
      },
      existingUrls: {
        audio: audioFile ? undefined : audioUrl,
        image: imageFile ? undefined : bannerImage.startsWith('data:') ? undefined : bannerImage,
      },
      actionType: 'publish',
    }, (prog) => {
      setPublishProgress(prog);
    });

    if (res.success) {
      showToast(`${meta.label} की जानकारी सफलतापूर्वक अपडेट हो गई!`);
      setAudioFile(null);
      setImageFile(null);
      setOriginalStats(null);
      setOptimizedStats(null);
      setValidationErrors([]);
      setTimeout(() => {
        setPublishProgress(null);
      }, 1500);
    } else {
      showToast(res.error || 'अपडेट विफल रहा।');
    }
  };

  const isCurrentPlayingThis = currentTrack?.id === meta.docId && isPlaying;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-bold text-sm animate-in slide-in-from-top duration-200">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Coordinated Ingestion Upload Progress Panel */}
      {publishProgress && (
        <UploadProgressComponent
          progress={publishProgress}
          onClose={() => setPublishProgress(null)}
        />
      )}

      {/* Edit Form (7 cols) */}
      <form onSubmit={handleSaveStuti} className="lg:col-span-7 bg-white rounded-xl p-6 border border-stone-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-[#EA580C]" />
            <span>{meta.label} — विवरण एवं बोल संपादित करें</span>
          </h2>
          <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full">
            {isMorning ? 'प्रातःकालीन स्तुति' : 'संध्याकालीन स्तुति'}
          </span>
        </div>

        <div className="space-y-4 text-xs">
          {/* Title & Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="stuti-title" className="block font-bold text-stone-700 mb-1">
                स्तुति शीर्षक <span className="text-red-500">*</span>
              </label>
              <input
                id="stuti-title"
                name="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="उदा. प्रातःकालीन स्तुति-विनती"
                required
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label htmlFor="stuti-subtitle" className="block font-bold text-stone-700 mb-1">
                उप-शीर्षक (Subtitle)
              </label>
              <input
                id="stuti-subtitle"
                name="subtitle"
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="उदा. महर्षि मेँहीं पदावली एवं स्तुति"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Artist & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="stuti-artist" className="block font-bold text-stone-700 mb-1">
                गायक / स्वर (Artist / Ashram)
              </label>
              <input
                id="stuti-artist"
                name="artist"
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="उदा. पूज्य स्वामी जी महाराज"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label htmlFor="stuti-duration" className="block font-bold text-stone-700 mb-1">
                <Clock className="w-3 h-3 inline mr-1" />
                अवधि (Duration)
              </label>
              <input
                id="stuti-duration"
                name="duration"
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
            <label htmlFor="stuti-audio-url" className="block font-bold text-stone-700 mb-1">
              स्तुति ऑडियो फ़ाइल (Audio Track)
            </label>
            <input
              id="stuti-audio-file"
              name="audioFile"
              type="file"
              ref={audioInputRef}
              onChange={handleAudioFileChange}
              accept="audio/*"
              className="hidden"
            />
            <div className="flex items-center gap-2">
              <input
                id="stuti-audio-url"
                name="audioUrl"
                type="url"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="https://... या फ़ाइल अपलोड करें"
                className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                className="px-4 py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{audioFile ? `चयनित: ${audioFile.name.substring(0, 15)}...` : 'ऑडियो अपलोड'}</span>
              </button>
            </div>
          </div>

          {/* Banner Artwork Image */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-stone-700">
                स्तुति आर्टवर्क (Prayer Card Artwork - 1:1 Square)
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

            <AdminUploadField
              label="स्तुति आर्टवर्क (1:1 Square)"
              profile={IMAGE_PROFILES.stuti_artwork}
              value={bannerImage}
              onChange={(file, preview) => {
                setImageFile(file);
                setBannerImage(preview);
              }}
              onRemove={() => {
                setImageFile(null);
                setBannerImage('');
              }}
              helperText="एंड्रॉइड मोबाइल ऐप पर स्तुति कार्ड में 1:1 वर्गाकार आर्टवर्क (64×64) के रूप में प्रदर्शित होगा।"
            />
          </div>

          {/* Sacred Quote */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">
              <Quote className="w-3 h-3 inline mr-1" />
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
              placeholder="यहाँ संपूर्ण स्तुति-बिनती के छंद, दोहा एवं आरती दर्ज करें..."
              className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-xs text-stone-800 leading-relaxed font-['Mukta']"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between gap-3">
          <span className="text-[0.65rem] font-bold text-stone-400 uppercase tracking-wider">
            {meta.fixedBadge} • {meta.docId}
          </span>
          <button
            type="submit"
            className="px-8 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>स्तुति विवरण सहेजें (Save Changes)</span>
          </button>
        </div>
      </form>

      {/* Live Preview & Player (5 cols) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-purple-600" />
              <span>मोबाइल में कैसा दिखेगा (Live Card Preview)</span>
            </h3>
            <span className="text-[0.65rem] bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded-full">
              {meta.label}
            </span>
          </div>

          {/* Mock Visual Card */}
          <div className="relative rounded-2xl overflow-hidden shadow-md h-52 bg-stone-900">
            {bannerImage ? (
              <img src={bannerImage} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-700 via-purple-800 to-stone-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            <div className="absolute top-3 left-3 bg-purple-600/90 text-white text-[0.68rem] px-2.5 py-0.5 rounded-full font-bold">
              {isMorning ? 'प्रातःकालीन स्तुति' : 'संध्याकालीन स्तुति'}
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
                  if (currentTrack?.id === meta.docId) {
                    togglePlay();
                  } else {
                    playTrack({ ...stuti, title, subtitle, artist, duration, quote, lyrics, audioUrl, bannerImage });
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

        <AdminAspectRatioPreview
          profile={IMAGE_PROFILES.stuti_artwork}
          imageUrl={bannerImage}
          title={title || meta.label}
          subtitle={subtitle || artist}
        />
      </div>
    </div>
  );
};