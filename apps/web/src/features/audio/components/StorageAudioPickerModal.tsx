/**
 * ============================================================================
 * Santmat Satsang Prachar - Storage Audio Media Picker Modal (Admin)
 * ============================================================================
 * Enables administrators to browse and select existing Firebase Storage audio files
 * with live stream preview, file size/MIME inspection, and duplicate linking protection.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  Music2,
  Search,
  X,
  Play,
  Pause,
  Check,
  RefreshCw,
  HardDrive,
  AlertCircle,
  Clock,
  Layers,
  FileCheck,
} from 'lucide-react';
import { storageService, StorageAudioItem } from '../../../services/storage/storageService';
import { Bhajan } from '../../../types/common/index';

interface StorageAudioPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: StorageAudioItem, linkedBhajan?: Bhajan) => void;
  existingBhajans: Bhajan[];
  currentSelectedPath?: string;
}

export const StorageAudioPickerModal: React.FC<StorageAudioPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  existingBhajans,
  currentSelectedPath,
}) => {
  const [items, setItems] = useState<StorageAudioItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<StorageAudioItem | null>(null);

  // Audio Preview Player
  const [previewingPath, setPreviewingPath] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [previewDuration, setPreviewDuration] = useState<string>('00:00');
  const [previewCurrentTime, setPreviewCurrentTime] = useState<string>('00:00');
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const fetchFiles = async () => {
    setIsLoading(true);
    setError(null);
    const res = await storageService.listAudioFiles('audio');
    setIsLoading(false);
    if (res.success && res.data) {
      setItems(res.data);
    } else {
      setError(res.error || 'फ़ायरबेस स्टोरेज से ऑडियो सूची लोड करने में विफल');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFiles();
    } else {
      // Stop preview when modal closes
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
      setIsPlaying(false);
      setPreviewingPath(null);
    }
  }, [isOpen]);

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  };

  const handleTogglePreview = (item: StorageAudioItem, e: React.MouseEvent) => {
    e.stopPropagation();

    if (previewingPath === item.storagePath && isPlaying) {
      previewAudioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }

    const audio = new Audio(item.downloadUrl);
    previewAudioRef.current = audio;
    setPreviewingPath(item.storagePath);
    setIsPlaying(true);

    audio.ontimeupdate = () => {
      const cur = Math.floor(audio.currentTime);
      const curM = Math.floor(cur / 60);
      const curS = cur % 60;
      setPreviewCurrentTime(`${String(curM).padStart(2, '0')}:${String(curS).padStart(2, '0')}`);
    };

    audio.onloadedmetadata = () => {
      const dur = Math.floor(audio.duration);
      if (!isNaN(dur)) {
        const durM = Math.floor(dur / 60);
        const durS = dur % 60;
        setPreviewDuration(`${String(durM).padStart(2, '0')}:${String(durS).padStart(2, '0')}`);
      }
    };

    audio.onended = () => {
      setIsPlaying(false);
      setPreviewCurrentTime('00:00');
    };

    audio.play().catch(() => setIsPlaying(false));
  };

  const getLinkedBhajan = (item: StorageAudioItem): Bhajan | undefined => {
    return existingBhajans.find(
      (b) =>
        (b.storagePath && b.storagePath === item.storagePath) ||
        (b.audioUrl && b.audioUrl === item.downloadUrl)
    );
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.storagePath.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150 font-['Mukta']">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-100 text-amber-700">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-stone-900 leading-tight">
                फ़ायरबेस स्टोरेज ऑडियो ब्राउज़र
              </h3>
              <p className="text-xs text-stone-500 font-semibold">
                स्टोरेज से सीधे भजन चुनें • कुल {items.length} ऑडियो फाइलें उपलब्ध
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchFiles}
              disabled={isLoading}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-xl transition-colors disabled:opacity-50"
              title="सूची रीफ़्रेश करें"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-white border-b border-stone-100">
          <div className="flex items-center gap-2 bg-stone-50 px-3.5 py-2 rounded-2xl border border-stone-200">
            <Search className="w-4 h-4 text-stone-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="फाइल नाम या स्टोरेज पाथ खोजें..."
              className="w-full bg-transparent text-xs font-semibold text-stone-800 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-stone-400 hover:text-stone-600 text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* List Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-stone-600">
                फ़ायरबेस स्टोरेज से ऑडियो सूची लोड हो रही है…
              </p>
            </div>
          ) : error ? (
            <div className="py-12 text-center space-y-2 bg-red-50 rounded-2xl p-4 border border-red-200">
              <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
              <p className="text-xs font-bold text-red-800">{error}</p>
              <button
                onClick={fetchFiles}
                className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-xl"
              >
                पुनः प्रयास करें
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Music2 className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="text-xs font-bold text-stone-500">No audio files available.</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected =
                (selectedItem && selectedItem.storagePath === item.storagePath) ||
                currentSelectedPath === item.storagePath ||
                currentSelectedPath === item.downloadUrl;
              const isPreviewingThis = previewingPath === item.storagePath && isPlaying;
              const linkedBhajan = getLinkedBhajan(item);

              return (
                <div
                  key={item.storagePath}
                  onClick={() => setSelectedItem(item)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-amber-50/80 border-amber-400 shadow-xs'
                      : 'bg-white hover:bg-stone-50 border-stone-200/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Play/Pause Preview Button */}
                    <button
                      type="button"
                      onClick={(e) => handleTogglePreview(item, e)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-xs ${
                        isPreviewingThis
                          ? 'bg-[#EA580C] text-white'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      }`}
                      title={isPreviewingThis ? 'पॉज़ करें' : 'प्रीव्यू सुनें'}
                    >
                      {isPreviewingThis ? (
                        <Pause className="w-4 h-4 fill-white stroke-none" />
                      ) : (
                        <Play className="w-4 h-4 fill-amber-800 stroke-none ml-0.5" />
                      )}
                    </button>

                    {/* Metadata summary */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-xs text-stone-900 truncate">
                          {item.name}
                        </span>
                        {linkedBhajan && (
                          <span className="px-2 py-0.5 rounded-md text-[0.65rem] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                            <FileCheck className="w-3 h-3" />
                            <span>लिंक: {linkedBhajan.title}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[0.68rem] text-stone-500 font-semibold mt-0.5">
                        <span className="font-mono text-stone-400 truncate max-w-xs">
                          {item.storagePath}
                        </span>
                        <span>•</span>
                        <span>{formatFileSize(item.size)}</span>
                        <span>•</span>
                        <span className="uppercase">{item.contentType.replace('audio/', '')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Select button */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {isPreviewingThis && (
                      <span className="text-[0.68rem] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {previewCurrentTime} / {previewDuration}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                        onSelect(item, linkedBhajan);
                        onClose();
                      }}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors ${
                        isSelected
                          ? 'bg-[#EA580C] text-white hover:bg-[#C2410C]'
                          : 'bg-stone-100 hover:bg-amber-100 text-stone-800 hover:text-amber-900'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{linkedBhajan ? 'मौजूदा रिकॉर्ड खोलें' : 'यह ऑडियो चुनें'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs">
          <div className="text-stone-500 font-semibold text-[0.7rem]">
            💡 चयन करने पर स्टोरेज पाथ एवं ऑडियो लिंक स्वतः फॉर्म में भर जाएगा।
          </div>

          <div className="flex items-center gap-2 font-bold">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-xl transition-colors"
            >
              रद्द करें
            </button>
            {selectedItem && (
              <button
                onClick={() => {
                  onSelect(selectedItem, getLinkedBhajan(selectedItem));
                  onClose();
                }}
                className="px-5 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>पुष्टि करें</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
