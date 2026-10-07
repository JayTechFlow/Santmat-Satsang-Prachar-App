/**
 * ============================================================================
 * Santmat Satsang Prachar - Add Devotional Bhajan (Admin)
 * ============================================================================
 * Phase 5I-5R: Enterprise Add Bhajan + Real Media Ingestion
 *
 * Sections: Basic Information | Classification | Audio Media | Lyrics/Content |
 *           Thumbnail/Artwork | Publication | Preview | Actions
 *
 * Canonical flow:
 *   VALIDATE → UPLOAD MEDIA → SAVE FIRESTORE METADATA → AUDIT → COMPLETE
 */
import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  Music2,
  Link as LinkIcon,
  Sparkles,
  Clock,
  Volume2,
  Play,
  Pause,
  Calendar,
  FileText,
  Timer,
  RefreshCw,
  Trash2,
  HardDrive,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../../app/providers/AppContext';
import { StorageAudioItem } from '../../../services/storage/storageService';
import { StorageAudioPickerModal } from '../components/StorageAudioPickerModal';
import { Bhajan } from '../../../types/common/index';
import { contentPublishingService, PublishProgress } from '../../../services/shared/ContentPublishingService';
import { UploadProgressComponent } from '../../../components/ui/UploadProgress';
import { MediaValidator } from '../../../lib/media/validation/MediaValidator';
import { MediaType } from '../../../lib/media/types/media.types';
import { AdminButton, AdminUploadField, AdminAspectRatioPreview, AdminPageHeader } from '../../../components/admin';
import { IMAGE_PROFILES } from '../../../lib/media/profiles/imageProfiles';
import {
  sortCategoriesWithSystemFirst,
  getCreatableCategories,
  isAllSentinelCategory,
} from '../../categories/config/systemCategories';

type ValidationErrors = Record<string, string>;

interface ExtractedAudioMeta {
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  source: 'embedded' | 'filename' | 'none';
}

async function extractAudioMetadata(file: File): Promise<ExtractedAudioMeta> {
  // 1. Try embedded ID3v2 tags
  try {
    const headerBuffer = await file.slice(0, 10).arrayBuffer();
    const headerView = new DataView(headerBuffer);
    const isID3 = headerView.getUint8(0) === 0x49 && 
                  headerView.getUint8(1) === 0x44 && 
                  headerView.getUint8(2) === 0x33; // "ID3"
    
    if (isID3) {
      const sizeBytes = [
        headerView.getUint8(6),
        headerView.getUint8(7),
        headerView.getUint8(8),
        headerView.getUint8(9)
      ];
      const tagSize = (sizeBytes[0] << 21) | (sizeBytes[1] << 14) | (sizeBytes[2] << 7) | sizeBytes[3];
      
      const readSize = Math.min(tagSize + 10, 128 * 1024);
      const tagBuffer = await file.slice(0, readSize).arrayBuffer();
      const tagView = new DataView(tagBuffer);
      
      const meta: ExtractedAudioMeta = { source: 'embedded' };
      let offset = 10;
      
      const textDecoder = new TextDecoder('utf-8');
      const utf16Decoder = new TextDecoder('utf-16');

      while (offset < readSize - 10) {
        const frameIdBytes = [
          tagView.getUint8(offset),
          tagView.getUint8(offset + 1),
          tagView.getUint8(offset + 2),
          tagView.getUint8(offset + 3)
        ];
        const frameId = String.fromCharCode(...frameIdBytes);
        
        if (!/^[A-Z0-9]{4}$/.test(frameId)) {
          break;
        }
        
        const frameSize = (tagView.getUint8(offset + 4) << 24) |
                          (tagView.getUint8(offset + 5) << 16) |
                          (tagView.getUint8(offset + 6) << 8) |
                          tagView.getUint8(offset + 7);
                          
        if (frameSize <= 0 || offset + 10 + frameSize > readSize) {
          break;
        }
        
        const frameDataOffset = offset + 10;
        const encoding = tagView.getUint8(frameDataOffset);
        
        const decodeString = (start: number, len: number) => {
          try {
            const buf = new Uint8Array(tagBuffer, start, len);
            if (encoding === 1 || encoding === 2) {
              return utf16Decoder.decode(buf).trim().replace(/^\uFEFF/, '');
            } else {
              return textDecoder.decode(buf).trim();
            }
          } catch {
            return '';
          }
        };
        
        if (frameId === 'TIT2') {
          meta.title = decodeString(frameDataOffset + 1, frameSize - 1);
        } else if (frameId === 'TPE1') {
          meta.artist = decodeString(frameDataOffset + 1, frameSize - 1);
        } else if (frameId === 'TALB') {
          meta.album = decodeString(frameDataOffset + 1, frameSize - 1);
        } else if (frameId === 'TCON') {
          meta.genre = decodeString(frameDataOffset + 1, frameSize - 1);
        }
        
        offset += 10 + frameSize;
      }
      
      if (meta.title || meta.artist) {
        return meta;
      }
    }
  } catch (e) {
    console.error('Error parsing ID3v2 tags:', e);
  }

  // 2. Try ID3v1 tags (at the end of the file)
  try {
    if (file.size >= 128) {
      const buffer = await file.slice(file.size - 128, file.size).arrayBuffer();
      const view = new DataView(buffer);
      const isTag = view.getUint8(0) === 0x54 && 
                    view.getUint8(1) === 0x41 && 
                    view.getUint8(2) === 0x47; // "TAG"
      
      if (isTag) {
        const textDecoder = new TextDecoder('utf-8');
        const decodeString = (offset: number, length: number) => {
          const bytes = new Uint8Array(buffer, offset, length);
          const end = bytes.indexOf(0);
          const activeBytes = end === -1 ? bytes : bytes.slice(0, end);
          return textDecoder.decode(activeBytes).trim();
        };
        
        const title = decodeString(3, 30);
        const artist = decodeString(33, 30);
        const album = decodeString(63, 30);
        
        if (title || artist) {
          return {
            title,
            artist,
            album,
            source: 'embedded'
          };
        }
      }
    }
  } catch (e) {
    console.error('Error parsing ID3v1 tags:', e);
  }

  // 3. Fallback to filename suggestion (e.g. "Swami Santsevi - Hey Prabhu.mp3")
  const basename = file.name.replace(/\.[^/.]+$/, "");
  if (basename.includes('-')) {
    const parts = basename.split('-');
    if (parts.length >= 2) {
      const field1 = parts[0].trim();
      const field2 = parts[1].trim();
      return {
        title: field2,
        artist: field1,
        source: 'filename'
      };
    }
  }

  return { source: 'none' };
}

export const AdminAddBhajan: React.FC = () => {
  const navigate = useNavigate();
  const { categories, bhajans } = useApp();

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [duration, setDuration] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isDurationAutoFetched, setIsDurationAutoFetched] = useState(false);
  const [language, setLanguage] = useState('हिंदी');
  const [status, setStatus] = useState<'प्रकाशित' | 'ड्राफ्ट' | 'शेड्यूल किया गया'>('प्रकाशित');

  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState('06:00');

  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const [hasAudioFile, setHasAudioFile] = useState(false);
  const [audioFileName, setAudioFileName] = useState('');
  const [audioFileSize, setAudioFileSize] = useState(0);
  const [audioFileType, setAudioFileType] = useState('');
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [existingAudioUrl, setExistingAudioUrl] = useState('');
  const [customAudioUrlInput, setCustomAudioUrlInput] = useState('');
  const [showAudioUrlInput, setShowAudioUrlInput] = useState(false);
  const [showStoragePickerModal, setShowStoragePickerModal] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [publishProgress, setPublishProgress] = useState<PublishProgress | null>(null);

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);


  const [errors, setErrors] = useState<ValidationErrors>({});
  const [extractedMetadata, setExtractedMetadata] = useState<{
    title?: string;
    artist?: string;
    album?: string;
    genre?: string;
    source: 'embedded' | 'filename' | 'none';
  } | null>(null);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const creatableCategories = useMemo(() => {
    return getCreatableCategories(sortCategoriesWithSystemFirst(categories));
  }, [categories]);

  const activeSubCategories = useMemo(() => {
    const foundCat = creatableCategories.find((c) => c.name === category);
    return foundCat?.subCategories || [];
  }, [category, creatableCategories]);

  const wordCount = useMemo(() => {
    if (!lyrics.trim()) return 0;
    return lyrics.trim().split(/\s+/).filter(Boolean).length;
  }, [lyrics]);

  const showValidationError = useCallback((field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const handleCategoryChange = (newCategory: string) => {
    if (isAllSentinelCategory(newCategory)) {
      showValidationError('category', '"सभी भजन" एक फ़िल्टर श्रेणी है। कृपया एक सामग्री श्रेणी चुनें।');
      return;
    }
    setCategory(newCategory);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.category;
      return next;
    });
    const found = creatableCategories.find((c) => c.name === newCategory);
    if (found && found.subCategories.length > 0) {
      setSubCategory(found.subCategories[0]);
    } else {
      setSubCategory('');
    }
  };

  const handleAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validator = new MediaValidator();
    const result = await validator.validate(file, MediaType.AUDIO);
    if (!result.valid) {
      const msg = result.errors.map((err) => err.message).join('; ');
      showValidationError('audio', msg);
      return;
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next.audio;
      return next;
    });

    setAudioFileName(file.name);
    setAudioFileSize(file.size);
    setAudioFileType(file.type || 'audio/mpeg');
    setHasAudioFile(true);
    setAudioFile(file);
    setExistingAudioUrl('');

    // Attempt metadata extraction
    try {
      const meta = await extractAudioMetadata(file);
      setExtractedMetadata(meta);
      
      // Auto populate fields if they are currently empty
      if (meta.title) {
        setTitle(prev => prev.trim() ? prev : meta.title!);
      }
      if (meta.artist) {
        setArtist(prev => prev.trim() ? prev : meta.artist!);
      }
    } catch (err) {
      console.error('Metadata extraction failed:', err);
      setExtractedMetadata({ source: 'none' });
    }

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
  };

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

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      setThumbnailUrl(customUrlInput.trim());
      setCustomUrlInput('');
      setShowUrlInput(false);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.thumbnail;
        return next;
      });
    }
  };

  const handleApplyCustomAudioUrl = () => {
    if (customAudioUrlInput.trim()) {
      const url = customAudioUrlInput.trim();
      setExistingAudioUrl(url);
      setAudioFileName(url.split('/').pop()?.split('?')[0] || 'मौजूदा स्टोरेज ऑडियो');
      setAudioFileSize(0);
      setAudioFileType('');
      setHasAudioFile(true);
      setAudioFile(null);

      if (audioBlobUrl) {
        URL.revokeObjectURL(audioBlobUrl);
      }
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

      setErrors((prev) => {
        const next = { ...prev };
        delete next.audio;
        return next;
      });

      setCustomAudioUrlInput('');
      setShowAudioUrlInput(false);
      setToastMessage('मौजूदा स्टोरेज ऑडियो लिंक किया गया!');
      setTimeout(() => setToastMessage(null), 2000);
    }
  };

  const handleSelectStorageItem = (item: StorageAudioItem, linkedBhajan?: Bhajan) => {
    if (linkedBhajan) {
      if (
        window.confirm(
          `यह ऑडियो पहले से ही "${linkedBhajan.title}" रिकॉर्ड से जुड़ा हुआ है। क्या आप उस भजन के संपादन पृष्ठ पर जाना चाहते हैं?`
        )
      ) {
        navigate('/admin/bhajan-list');
        return;
      }
    }

    setExistingAudioUrl(item.downloadUrl);
    setAudioFileName(item.name);
    setAudioFileSize(item.size);
    setAudioFileType(item.contentType);
    setHasAudioFile(true);
    setAudioFile(null);

    if (audioBlobUrl) {
      URL.revokeObjectURL(audioBlobUrl);
    }
    setAudioBlobUrl(item.downloadUrl);

    const tempAudio = new Audio(item.downloadUrl);
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

    setErrors((prev) => {
      const next = { ...prev };
      delete next.audio;
      return next;
    });

    setToastMessage(`स्टोरेज से "${item.name}" का चयन किया गया!`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleAutoFetchSubtitleTiming = () => {
    if (!lyrics.trim()) {
      showValidationError('lyrics', 'कृपया पहले भजन के बोल (Lyrics) लिखें या पेस्ट करें।');
      return;
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next.lyrics;
      return next;
    });

    const cleanLines = lyrics
      .split('\n')
      .map((line) => line.replace(/^\[\d{2}:\d{2}(\.\d{2})?\]\s*/, '').trim())
      .filter((line) => line.length > 0);

    if (cleanLines.length === 0) return;

    const totalSeconds = durationSeconds > 30 ? durationSeconds : 360;
    const introPause = 6;
    const outroReserve = 12;
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
    setToastMessage('ऑडियो टाइमिंग सबटाइटल (Hindi Timed Subtitles) स्वतः तैयार हो गए!');
    setTimeout(() => setToastMessage(null), 2500);
  };

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

  const handleClearTimestamps = () => {
    const clean = lyrics
      .split('\n')
      .map((line) => line.replace(/^\[\d{2}:\d{2}(\.\d{2})?\]\s*/, ''))
      .join('\n');
    setLyrics(clean);
    setToastMessage('टाइमस्टैम्प हटा दिए गए, सामान्य लिरिक्स सक्रिय है');
    setTimeout(() => setToastMessage(null), 2000);
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  };

  const validateForm = (actionType: 'publish' | 'draft' | 'schedule'): ValidationErrors => {
    const errs: ValidationErrors = {};

    if (!title.trim()) {
      errs.title = 'कृपया भजन का शीर्षक भरें।';
    }
    if (!artist.trim()) {
      errs.artist = 'कृपया गायक / स्वर का नाम भरें।';
    }
    if (!category.trim()) {
      errs.category = 'कृपया श्रेणी चुनें।';
    } else if (isAllSentinelCategory(category)) {
      errs.category = '"सभी भजन" एक फ़िल्टर श्रेणी है। कृपया एक मान्य सामग्री श्रेणी चुनें।';
    }
    if (!hasAudioFile && !existingAudioUrl.trim()) {
      errs.audio = 'कृपया ऑडियो फ़ाइल अपलोड करें या मौजूदा स्टोरेज ऑडियो लिंक दर्ज करें।';
    }
    if ((actionType === 'publish' || actionType === 'schedule') && !thumbnailUrl.trim()) {
      errs.thumbnail = 'प्रकाशित करने के लिए कृपया भजन का थंबनेल/चित्र अपलोड करें।';
    }
    if (actionType === 'schedule') {
      if (!scheduledDate || scheduledDate.trim() === '') {
        errs.scheduledDate = 'शेड्यूल दिनांक आवश्यक है।';
      }
      if (!scheduledTime || scheduledTime.trim() === '') {
        errs.scheduledTime = 'शेड्यूल समय आवश्यक है।';
      }
      if (scheduledDate && scheduledTime) {
        const parsedDate = new Date(`${scheduledDate}T${scheduledTime}`);
        if (isNaN(parsedDate.getTime())) {
          errs.scheduledDate = 'अमान्य शेड्यूल दिनांक या समय।';
        }
      }
    }

    return errs;
  };

  const handleSubmit = async (
    e: React.FormEvent,
    actionType?: 'publish' | 'draft' | 'schedule'
  ) => {
    e.preventDefault();
    clearAllErrors();

    let finalAction: 'publish' | 'draft' | 'schedule' = actionType || 'publish';
    let finalStatus: 'प्रकाशित' | 'ड्राफ्ट' | 'शेड्यूल किया गया' = status;
    if (actionType === 'draft') {
      finalStatus = 'ड्राफ्ट';
      finalAction = 'draft';
    } else if (actionType === 'publish') {
      finalStatus = 'प्रकाशित';
      finalAction = 'publish';
    } else if (actionType === 'schedule') {
      finalStatus = 'शेड्यूल किया गया';
      finalAction = 'schedule';
    }

    const validationErrors = validateForm(finalAction);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstField = Object.keys(validationErrors)[0];
      const el = document.querySelector(`[data-error-field="${firstField}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    setPublishProgress({
      phase: 'IDLE',
      percentage: 0,
      message: 'सामग्री अपलोड प्रारंभ हो रही है...',
    });

    try {
      const res = await contentPublishingService.publishContent({
        contentType: 'bhajan',
        payload: {
          title: title.trim(),
          artist: artist.trim(),
          category,
          subCategory: subCategory || undefined,
          duration: duration || undefined,
          durationSeconds: durationSeconds || undefined,
          lyrics: lyrics || undefined,
          type: 'भजन',
          language,
          scheduledDate: finalStatus === 'शेड्यूल किया गया' ? scheduledDate : undefined,
          scheduledTime: finalStatus === 'शेड्यूल किया गया' ? scheduledTime : undefined,
          imageUrl: thumbnailUrl.trim() || undefined,
        },
        files: {
          audio: audioFile,
          image: imageFile,
        },
        existingUrls: {
          audio: audioFile ? undefined : existingAudioUrl.trim() || undefined,
          image: imageFile ? undefined : thumbnailUrl.trim() || undefined,
        },
        actionType: finalAction,
      }, (prog) => {
        setPublishProgress(prog);
      });

      if (res.success) {
        let successText = 'नया भजन सफलतापूर्वक प्रकाशित किया गया!';
        if (finalStatus === 'ड्राफ्ट') {
          successText = 'भजन ड्राफ्ट के रूप में सहेज लिया गया!';
        } else if (finalStatus === 'शेड्यूल किया गया') {
          successText = `भजन ${scheduledDate} (${scheduledTime}) के लिए सफलतापूर्वक शेड्यूल किया गया!`;
        }
        setToastMessage(successText);
        setTimeout(() => {
          setToastMessage(null);
          setPublishProgress(null);
          navigate('/admin/bhajan-list');
        }, 1500);
      } else {
        setToastMessage(res.error || 'प्रकाशन प्रक्रिया विफल रही।');
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setToastMessage('प्रक्रिया में अप्रत्याशित त्रुटि उत्पन्न हुई।');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ErrorText: React.FC<{ field: string }> = ({ field }) => {
    if (!errors[field]) return null;
    return (
      <p className="text-[0.68rem] text-red-600 font-semibold mt-1 flex items-center gap-1" role="alert">
        <AlertCircle className="w-3 h-3 shrink-0" />
        {errors[field]}
      </p>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5 select-none font-['Mukta']">
      {toastMessage && (
        <div className="admin-toast admin-toast-success">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {publishProgress && (
        <UploadProgressComponent
          progress={publishProgress}
          onClose={() => setPublishProgress(null)}
        />
      )}

      <AdminPageHeader
        title="नया भजन जोड़ें (Add Devotional Bhajan)"
        subtitle="संतमत सत्संग प्रचार हेतु नए भजन, ऑडियो, बोल एवं थंबनेल अपलोड व प्रकाशित करें"
        badgeText="ऑडियो सामग्री प्रबंधन"
        badgeVariant="primary"
        icon={<Music2 className="w-4 h-4" />}
        breadcrumbs={[
          { label: 'डैशबोर्ड', href: '/admin/dashboard' },
          { label: 'भजन प्रबंधन', href: '/admin/bhajan-list' },
          { label: 'नया भजन जोड़ें' },
        ]}
        actions={
          <AdminButton
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/bhajan-list')}
          >
            ← सूची पर वापस
          </AdminButton>
        }
      />

      <form onSubmit={(e) => handleSubmit(e, 'publish')} noValidate>
        <div className="admin-card p-6 space-y-6">
          {/* SECTION 1: Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
              <span className="w-1.5 h-5 bg-[#EA580C] rounded-full" />
              <h2 className="font-extrabold text-lg text-stone-900">
                मूल जानकारी (Basic Information)
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
              <div data-error-field="title">
                <label htmlFor="bhajan-title" className="block font-bold text-stone-700 mb-1">
                  भजन शीर्षक (Title) <span className="text-red-500">*</span>
                </label>
                <input
                  id="bhajan-title"
                  name="title"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.title;
                        return next;
                      });
                    }
                  }}
                  placeholder="भजन का पावन शीर्षक लिखें"
                  aria-required="true"
                  aria-invalid={!!errors.title}
                  aria-describedby={errors.title ? 'bhajan-title-error' : undefined}
                  className={`admin-input ${errors.title ? 'admin-input-error' : ''}`}
                />
                <ErrorText field="title" />
              </div>

              <div data-error-field="artist">
                <label htmlFor="bhajan-artist" className="block font-bold text-stone-700 mb-1">
                  गायक / स्वर <span className="text-red-500">*</span>
                </label>
                <input
                  id="bhajan-artist"
                  name="artist"
                  type="text"
                  value={artist}
                  onChange={(e) => {
                    setArtist(e.target.value);
                    if (errors.artist) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.artist;
                        return next;
                      });
                    }
                  }}
                  placeholder="गायक या आश्रम का नाम लिखें (उदा. स्वर: स्वामी जी महाराज)"
                  aria-required="true"
                  aria-invalid={!!errors.artist}
                  aria-describedby={errors.artist ? 'bhajan-artist-error' : undefined}
                  className={`admin-input ${errors.artist ? 'admin-input-error' : ''}`}
                />
                <ErrorText field="artist" />
              </div>
            </div>
          </div>

          {/* SECTION 2: Classification */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
              <span className="w-1.5 h-5 bg-amber-500 rounded-full" />
              <h2 className="font-extrabold text-lg text-stone-900">
                वर्गीकरण (Classification)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div data-error-field="category">
                <label htmlFor="bhajan-category" className="block font-bold text-stone-700 mb-1">
                  श्रेणी (Category) <span className="text-red-500">*</span>
                </label>
                <select
                  id="bhajan-category"
                  name="category"
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  aria-required="true"
                  aria-invalid={!!errors.category}
                  className={`admin-select ${errors.category ? 'admin-input-error' : ''}`}
                >
                  <option value="">श्रेणी चुनें</option>
                  {creatableCategories.map((cat) => (
                    <option key={cat.id || cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ErrorText field="category" />
              </div>

              <div>
                <label htmlFor="bhajan-subcategory" className="block font-bold text-stone-700 mb-1">
                  उप-श्रेणी (Sub Category)
                </label>
                <select
                  id="bhajan-subcategory"
                  name="subCategory"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  disabled={activeSubCategories.length === 0}
                  className="admin-select disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {activeSubCategories.length === 0 ? (
                    <option value="">उप-श्रेणी उपलब्ध नहीं</option>
                  ) : (
                    activeSubCategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label htmlFor="bhajan-language" className="block font-bold text-stone-700 mb-1">
                  भाषा (Language)
                </label>
                <select
                  id="bhajan-language"
                  name="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="admin-select"
                >
                  <option value="हिंदी">हिंदी</option>
                  <option value="ब्रज भाषा">ब्रज भाषा</option>
                  <option value="अवधी">अवधी</option>
                  <option value="मैथिली">मैथिली</option>
                  <option value="राजस्थानी">राजस्थानी</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: Audio Media */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
              <span className="w-1.5 h-5 bg-orange-500 rounded-full" />
              <h2 className="font-extrabold text-lg text-stone-900">
                ऑडियो मीडिया (Audio Media)
              </h2>
              {isDurationAutoFetched && duration && (
                <span className="text-[0.68rem] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full flex items-center gap-1 ml-auto">
                  <Clock className="w-3 h-3" />
                  अवधि ({duration})
                </span>
              )}
            </div>

            <div data-error-field="audio" className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-stone-700">
                  ऑडियो फ़ाइल (MP3 / WAV / M4A) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAudioUrlInput(!showAudioUrlInput)}
                    className="text-amber-700 hover:text-amber-800 font-bold text-[0.72rem] flex items-center gap-1"
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>{showAudioUrlInput ? 'फ़ाइल अपलोड मोड' : 'मौजूदा स्टोरेज लिंक'}</span>
                  </button>
                </div>
              </div>

              {showAudioUrlInput && (
                <div className="flex items-center gap-2 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200">
                  <input
                    type="url"
                    value={customAudioUrlInput}
                    onChange={(e) => setCustomAudioUrlInput(e.target.value)}
                    placeholder="स्टोरेज ऑडियो लिंक (https://... या audio/bhajans/...) पेस्ट करें"
                    className="admin-input flex-1 min-w-0"
                  />
                  <AdminButton
                    type="button"
                    onClick={handleApplyCustomAudioUrl}
                    variant="primary"
                    size="sm"
                  >
                    ऑडियो लिंक करें
                  </AdminButton>
                </div>
              )}

              <input
                type="file"
                ref={audioInputRef}
                onChange={handleAudioFileChange}
                accept="audio/mp3, audio/wav, audio/m4a, audio/ogg, audio/aac, audio/*"
                className="hidden"
                aria-label="ऑडियो फ़ाइल चुनें"
              />

              {!hasAudioFile ? (
                <div
                  onClick={() => audioInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      audioInputRef.current?.click();
                    }
                  }}
                  className="border-2 border-dashed border-amber-300 rounded-xl p-4 bg-amber-50/30 flex flex-col items-center justify-center text-center space-y-2 hover:bg-amber-50/70 transition-colors cursor-pointer"
                  aria-label="ऑडियो फ़ाइल अपलोड करने के लिए क्लिक करें"
                >
                  <div className="p-2 rounded-full bg-orange-100 text-orange-600">
                    <Music2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-stone-800">ऑडियो फ़ाइल अपलोड करें</p>
                    <p className="text-[0.65rem] text-stone-500">
                      MP3, WAV, M4A फ़ाइल (अधिकतम 512 MB, अपलोड पर अवधि स्वतः फ़ेच हो जाएगी)
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <AdminButton
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowStoragePickerModal(true);
                      }}
                      variant="tertiary"
                      size="sm"
                      icon={<HardDrive className="w-3.5 h-3.5" />}
                    >
                      स्टोरेज से चुनें
                    </AdminButton>
                    <span className="px-3.5 py-1.5 bg-stone-200 text-stone-800 rounded-lg text-xs font-bold shadow-xs">
                      डिवाइस से चुनें
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 flex items-center gap-3">
                    <div className="p-2 rounded-full bg-orange-100 text-orange-600 shrink-0">
                      <Music2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-stone-800 truncate">{audioFileName}</p>
                      <div className="flex items-center gap-2 text-[0.65rem] text-stone-500 mt-0.5">
                        {audioFileSize > 0 && <span>{formatFileSize(audioFileSize)}</span>}
                        {audioFileSize > 0 && audioFileType && <span>•</span>}
                        {audioFileType && <span>{audioFileType}</span>}
                        {duration && <span>• {duration}</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setHasAudioFile(false);
                        setAudioFile(null);
                        setAudioFileName('');
                        setAudioFileSize(0);
                        setAudioFileType('');
                        setExistingAudioUrl('');
                        setExtractedMetadata(null);
                        if (audioBlobUrl) {
                          URL.revokeObjectURL(audioBlobUrl);
                          setAudioBlobUrl(null);
                        }
                        setDuration('');
                        setDurationSeconds(0);
                        setIsDurationAutoFetched(false);
                        setIsPlayingAudio(false);
                        setCurrentPlaybackTime(0);
                        if (audioElementRef.current) {
                          audioElementRef.current.pause();
                          audioElementRef.current = null;
                        }
                      }}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      aria-label="ऑडियो फ़ाइल हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {extractedMetadata && extractedMetadata.source !== 'none' && (
                    <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-2.5 mt-2 flex flex-col gap-1 text-[0.7rem] text-stone-700 animate-in fade-in duration-200">
                      <span className="font-extrabold text-[0.65rem] text-amber-800 uppercase tracking-wider block">
                        निष्कर्षित ऑडियो मेटाडेटा (Metadata Source: {extractedMetadata.source === 'embedded' ? 'Embedded Tags' : 'Filename Suggestion'})
                      </span>
                      {extractedMetadata.title && (
                        <div>शीर्षक: <strong className="text-stone-900">{extractedMetadata.title}</strong></div>
                      )}
                      {extractedMetadata.artist && (
                        <div>गायक / आश्रम: <strong className="text-stone-900">{extractedMetadata.artist}</strong></div>
                      )}
                      {extractedMetadata.album && (
                        <div>एल्बम: <strong className="text-stone-900">{extractedMetadata.album}</strong></div>
                      )}
                      {extractedMetadata.genre && (
                        <div>श्रेणी (Genre): <strong className="text-stone-900">{extractedMetadata.genre}</strong></div>
                      )}
                    </div>
                  )}

                  <div
                    onClick={() => audioInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        audioInputRef.current?.click();
                      }
                    }}
                    className="border border-stone-200 rounded-lg p-3 bg-stone-50 flex items-center gap-3 hover:bg-orange-50/40 transition-colors cursor-pointer"
                  >
                    <span className="px-3.5 py-1.5 bg-stone-200 text-stone-800 rounded-lg text-xs font-bold shadow-xs">
                      डिवाइस से बदलें
                    </span>
                    <AdminButton
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowStoragePickerModal(true);
                      }}
                      variant="tertiary"
                      size="sm"
                      icon={<HardDrive className="w-3.5 h-3.5" />}
                    >
                      स्टोरेज से चुनें
                    </AdminButton>
                  </div>
                </>
              )}

              {hasAudioFile && audioBlobUrl && (
                <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-200/80 shadow-xs flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleToggleAudioPlayback}
                    className="w-9 h-9 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white flex items-center justify-center shadow-xs shrink-0 transition-transform active:scale-95"
                    aria-label={isPlayingAudio ? 'पॉज़ करें' : 'चलाएं'}
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
                      <span>{duration || '--:--'}</span>
                    </div>
                  </div>

                  <Volume2 className="w-4 h-4 text-stone-500 shrink-0" />
                </div>
              )}

              <ErrorText field="audio" />
            </div>

            <div data-error-field="duration" className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="bhajan-duration" className="font-bold text-stone-700">
                    अवधि (Duration)
                  </label>
                  {isDurationAutoFetched ? (
                    <span className="text-[0.65rem] text-emerald-600 font-bold">स्वतः प्राप्त ✓</span>
                  ) : (
                    <span className="text-[0.65rem] text-stone-400">ऑडियो अपलोड से प्राप्त</span>
                  )}
                </div>
                <input
                  id="bhajan-duration"
                  type="text"
                  value={duration}
                  onChange={(e) => {
                    setDuration(e.target.value);
                    setIsDurationAutoFetched(false);
                  }}
                  placeholder="mm:ss"
                  className="admin-input"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Lyrics / Content */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
              <span className="w-1.5 h-5 bg-blue-500 rounded-full" />
              <h2 className="font-extrabold text-lg text-stone-900">
                भजन के बोल (Lyrics / Content)
              </h2>
              <span className="text-[0.7rem] px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 font-bold rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                असीमित लिरिक्स व सबटाइटल सिंक
              </span>
            </div>

            <div data-error-field="lyrics" className="space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <label htmlFor="bhajan-lyrics" className="font-bold text-stone-800 text-xs flex items-center gap-1">
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

              <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-2.5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[0.72rem]">
                    <Timer className="w-3.5 h-3.5 text-amber-700" />
                    <span>ऑडियो टाइमिंग सबटाइटल टूल (Hindi Subtitle Sync):</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <AdminButton
                      type="button"
                      onClick={handleAutoFetchSubtitleTiming}
                      variant="primary"
                      size="sm"
                      title="ऑडियो अवधि के अनुसार सभी पंक्तियों पर टाइमकोड स्वतः लगाएं"
                      icon={<Sparkles className="w-3 h-3" />}
                    >
                      ऑडियो टाइमिंग सबटाइटल स्वतः बनाएं
                    </AdminButton>

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
                      <AdminButton
                        type="button"
                        onClick={handleClearTimestamps}
                        variant="tertiary"
                        size="sm"
                        title="टाइमस्टैम्प हटाएं और सामान्य लिरिक्स में बदलें"
                        icon={<RefreshCw className="w-3 h-3" />}
                      >
                        टाइमिंग हटाएं
                      </AdminButton>
                    )}
                  </div>
                </div>

                <p className="text-[0.65rem] text-amber-800 leading-snug">
                  <strong>ऑटो टाइमिंग:</strong> बटन पर क्लिक करते ही प्रत्येक पद पर <code>[00:15]</code> के अनुसार ऑडियो टाइमिंग सबटाइटल जुड़ जाएगा जिससे भजन बजते समय लिरिक्स लाइव स्क्रॉल होंगे।
                </p>
              </div>

              <textarea
                id="bhajan-lyrics"
                rows={7}
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="यहाँ भजन के संपूर्ण बोल, दोहा, चौपाई अथवा पद लिखें (असीमित शब्द/अक्षर दर्ज कर सकते हैं)..."
                className="admin-textarea"
              />
              <ErrorText field="lyrics" />
            </div>
          </div>

          {/* SECTION 5: Thumbnail / Artwork */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
              <span className="w-1.5 h-5 bg-pink-500 rounded-full" />
              <h2 className="font-extrabold text-lg text-stone-900">
                थंबनेल / आर्टवर्क (Thumbnail / Artwork)
              </h2>
            </div>

            <div data-error-field="thumbnail" className="text-xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-stone-700">
                  भजन का थंबनेल (Thumbnail Artwork - 1:1 Square)
                  {(status === 'प्रकाशित' || status === 'शेड्यूल किया गया') && (
                    <span className="text-red-500"> *</span>
                  )}
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

              {showUrlInput && (
                <div className="flex items-center gap-2 mb-3 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="इमेज वेब लिंक (https://...) पेस्ट करें"
                    className="admin-input flex-1 min-w-0"
                  />
                  <AdminButton
                    type="button"
                    onClick={handleApplyCustomUrl}
                    variant="primary"
                    size="sm"
                  >
                    लागू करें
                  </AdminButton>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <AdminUploadField
                  label="भजन आर्टवर्क (1:1 Square Artwork)"
                  profile={IMAGE_PROFILES.audio_artwork}
                  value={thumbnailUrl}
                  required={status === 'प्रकाशित' || status === 'शेड्यूल किया गया'}
                  onChange={(file, preview) => {
                    setImageFile(file);
                    setThumbnailUrl(preview);
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.thumbnail;
                      return next;
                    });
                  }}
                  onRemove={() => {
                    setImageFile(null);
                    setThumbnailUrl('');
                  }}
                  helperText="एंड्रॉइड ऐप के AudioCard (64×64) और NowPlaying (260×260) के लिए 1:1 वर्गाकार इमेज आवश्यक है।"
                />

                <AdminAspectRatioPreview
                  profile={IMAGE_PROFILES.audio_artwork}
                  imageUrl={thumbnailUrl}
                  title={title || 'भजन शीर्षक'}
                  subtitle={artist || 'गायक / आश्रम'}
                />
              </div>

              <ErrorText field="thumbnail" />
            </div>
          </div>

          {/* SECTION 6: Publication */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
              <span className="w-1.5 h-5 bg-emerald-500 rounded-full" />
              <h2 className="font-extrabold text-lg text-stone-900">
                प्रकाशन (Publication)
              </h2>
            </div>

            <div className="text-xs">
              <div data-error-field="status" className="mb-3">
                <label htmlFor="bhajan-status" className="block font-bold text-stone-700 mb-1">
                  प्रकाशन स्थिति (Status) <span className="text-red-500">*</span>
                </label>
                <select
                  id="bhajan-status"
                  name="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'प्रकाशित' | 'ड्राफ्ट' | 'शेड्यूल किया गया')}
                  className="admin-select"
                >
                  <option value="प्रकाशित">तत्काल प्रकाशित करें (Publish Now)</option>
                  <option value="ड्राफ्ट">ड्राफ्ट के रूप में सहेजें (Save Draft)</option>
                  <option value="शेड्यूल किया गया">शेड्यूल करें (Scheduled Post)</option>
                </select>
              </div>

              {status === 'शेड्यूल किया गया' && (
                <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 space-y-3 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <Calendar className="w-4 h-4 text-[#EA580C]" />
                    <span>शेड्यूल पोस्ट दिनांक एवं समय सेट करें:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div data-error-field="scheduledDate">
                      <label htmlFor="bhajan-scheduled-date" className="block font-bold text-stone-700 mb-1">
                        शेड्यूल दिनांक (Date)
                      </label>
                      <input
                        id="bhajan-scheduled-date"
                        name="scheduledDate"
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        aria-invalid={!!errors.scheduledDate}
                        className={`admin-input ${errors.scheduledDate ? 'admin-input-error' : ''}`}
                      />
                      <ErrorText field="scheduledDate" />
                    </div>

                    <div data-error-field="scheduledTime">
                      <label htmlFor="bhajan-scheduled-time" className="block font-bold text-stone-700 mb-1">
                        शेड्यूल समय (Time)
                      </label>
                      <input
                        id="bhajan-scheduled-time"
                        name="scheduledTime"
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        aria-invalid={!!errors.scheduledTime}
                        className={`admin-input ${errors.scheduledTime ? 'admin-input-error' : ''}`}
                      />
                      <ErrorText field="scheduledTime" />
                    </div>
                  </div>

                  <p className="text-[0.68rem] text-amber-800">
                    यह भजन निर्धारित दिनांक <strong>{scheduledDate}</strong> को प्रातः/सायं <strong>{scheduledTime}</strong> बजे स्वतः ऐप पर सभी भक्तों के लिए लाइव हो जाएगा।
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 7: Preview */}
          {hasAudioFile && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
                <span className="w-1.5 h-5 bg-violet-500 rounded-full" />
                <h2 className="font-extrabold text-lg text-stone-900">
                  पूर्वावलोकन (Preview)
                </h2>
              </div>

              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <span className="text-stone-500 font-bold">शीर्षक:</span>
                    <p className="font-bold text-stone-800 truncate">{title || '—'}</p>
                  </div>
                  <div>
                    <span className="text-stone-500 font-bold">गायक:</span>
                    <p className="font-bold text-stone-800 truncate">{artist || '—'}</p>
                  </div>
                  <div>
                    <span className="text-stone-500 font-bold">श्रेणी:</span>
                    <p className="font-bold text-stone-800 truncate">{category || '—'}</p>
                  </div>
                  <div>
                    <span className="text-stone-500 font-bold">अवधि:</span>
                    <p className="font-bold text-stone-800">{duration || '—'}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-stone-500 font-bold">ऑडियो:</span>
                    <p className="font-bold text-stone-800 truncate">{audioFileName || '—'}</p>
                  </div>
                  <div>
                    <span className="text-stone-500 font-bold">स्थिति:</span>
                    <p className="font-bold text-stone-800">{status}</p>
                  </div>
                  <div>
                    <span className="text-stone-500 font-bold">थंबनेल:</span>
                    <p className="font-bold text-stone-800">{thumbnailUrl ? '✓ सेट' : '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 8: Actions */}
        <div className="flex flex-wrap items-center justify-end gap-3 font-bold text-xs pt-4">
          <AdminButton
            type="button"
            onClick={() => navigate('/admin/bhajan-list')}
            variant="tertiary"
            size="md"
          >
            रद्द करें
          </AdminButton>

          <AdminButton
            type="button"
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={isSubmitting}
            variant="secondary"
            size="md"
          >
            ड्राफ्ट के रूप में सहेजें
          </AdminButton>

          <AdminButton
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
            disabled={isSubmitting}
            variant={status === 'शेड्यूल किया गया' ? 'primary' : 'secondary'}
            size="md"
            className={
              status === 'शेड्यूल किया गया'
                ? ''
                : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 hover:text-amber-900'
            }
            icon={<Calendar className="w-4 h-4" />}
          >
            शेड्यूल करें (Schedule Post)
          </AdminButton>

          <AdminButton
            type="button"
            onClick={(e) => handleSubmit(e, 'publish')}
            disabled={isSubmitting}
            variant="primary"
            size="md"
            icon={<Check className="w-4 h-4" />}
          >
            तत्काल प्रकाशित करें
          </AdminButton>
        </div>
      </form>

      <StorageAudioPickerModal
        isOpen={showStoragePickerModal}
        onClose={() => setShowStoragePickerModal(false)}
        onSelect={handleSelectStorageItem}
        existingBhajans={bhajans}
        currentSelectedPath={existingAudioUrl}
      />
    </div>
  );
};
