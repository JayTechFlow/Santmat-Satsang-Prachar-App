import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Layers,
  ExternalLink,
  Wifi,
  Battery,
  Search,
} from 'lucide-react';
import { BannerEntity, BannerSlotNumber } from '../../../types/common/index';
import { CANONICAL_SLOTS } from '../services/bannerService';

export interface BannerCarouselPreviewProps {
  slots: Record<BannerSlotNumber, BannerEntity | null>;
}

export const BannerCarouselPreview: React.FC<BannerCarouselPreviewProps> = ({ slots }) => {
  // Collect active banners in order (slots 1..4)
  const activeBanners: { slot: BannerSlotNumber; banner: BannerEntity }[] = [];
  for (const s of CANONICAL_SLOTS) {
    const b = slots[s];
    if (b && b.active !== false && b.imageUrl) {
      activeBanners.push({ slot: s, banner: b });
    }
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Keep index in bounds if active banners count changes
  useEffect(() => {
    if (currentIndex >= activeBanners.length && activeBanners.length > 0) {
      setCurrentIndex(0);
    }
  }, [activeBanners.length, currentIndex]);

  // 5-second auto scroll timer (matching mobile app behavior)
  useEffect(() => {
    if (!isPlaying || activeBanners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, activeBanners.length]);

  const handlePrev = () => {
    if (activeBanners.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleNext = () => {
    if (activeBanners.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const currentItem = activeBanners[currentIndex];

  return (
    <div className="bg-stone-900 rounded-3xl p-4 sm:p-6 text-white shadow-xl border border-stone-800 flex flex-col items-center">
      {/* Header bar with controls */}
      <div className="w-full flex items-center justify-between pb-4 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-amber-500" />
          <h4 className="text-sm font-bold tracking-wide">मोबाइल होम स्क्रीन लाइव प्रीव्यू</h4>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400">
            सक्रिय: <strong className="text-amber-400">{activeBanners.length} / 4</strong>
          </span>

          {activeBanners.length > 1 && (
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-stone-800 text-stone-400 border-stone-700'
              }`}
              title={isPlaying ? 'ऑटो-स्क्रॉल रोकें' : 'ऑटो-स्क्रॉल प्रारंभ करें'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isPlaying ? '5s ऑटो' : 'रुका है'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Simulated Mobile Device Frame */}
      <div className="mt-4 w-full max-w-[340px] bg-stone-950 rounded-[40px] p-3 shadow-2xl border-4 border-stone-700 relative overflow-hidden">
        {/* Phone Speaker Notch */}
        <div className="w-24 h-4 bg-stone-800 rounded-full mx-auto mb-2 flex items-center justify-center">
          <div className="w-8 h-1 bg-stone-900 rounded-full" />
        </div>

        {/* Mobile Screen Status Bar */}
        <div className="px-3 py-1 flex items-center justify-between text-[11px] text-stone-400 font-medium">
          <span>09:41</span>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Mobile App Bar Mock */}
        <div className="px-3 py-2 flex items-center justify-between border-b border-stone-800/80">
          <span className="text-xs font-bold text-amber-400 tracking-wide">संतमत सत्संग प्रचार</span>
          <div className="w-6 h-6 rounded-full bg-stone-800 text-stone-400 flex items-center justify-center text-[10px]">
            ॐ
          </div>
        </div>

        {/* Mobile Search Bar Mock */}
        <div className="p-3">
          <div className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-1.5 flex items-center gap-2 text-stone-500 text-xs">
            <Search className="w-3.5 h-3.5" />
            <span>भजन, सत्संग या साखी खोजें…</span>
          </div>
        </div>

        {/* CAROUSEL SECTION */}
        <div className="px-3 pb-3">
          {activeBanners.length === 0 ? (
            <div className="aspect-video rounded-2xl bg-stone-900 border border-dashed border-stone-700 flex flex-col items-center justify-center text-center p-4">
              <Layers className="w-6 h-6 text-stone-600 mb-1" />
              <p className="text-xs text-stone-400 font-medium">कोई लाइव बैनर नहीं है</p>
              <p className="text-[10px] text-stone-600">स्लॉट 1..4 में बैनर जोड़ें</p>
            </div>
          ) : (
            <div className="relative group">
              {/* 16:9 Banner Display */}
              <div className="aspect-video rounded-2xl overflow-hidden bg-black border border-stone-800 relative shadow-md">
                <img
                  src={currentItem.banner.imageUrl}
                  alt={currentItem.banner.title}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />

                {/* Slot Chip Indicator */}
                <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold shadow-md">
                  स्लॉट {currentItem.slot}
                </div>

                {/* Target Screen Badge */}
                <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-amber-300 text-[10px] flex items-center gap-1 font-mono">
                  <ExternalLink className="w-2.5 h-2.5" />
                  <span>{currentItem.banner.targetScreen || '/audio'}</span>
                </div>

                {/* Bottom Title Gradient Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                  <p className="text-white text-xs font-bold truncate">
                    {currentItem.banner.title}
                  </p>
                </div>
              </div>

              {/* Prev / Next navigation arrows */}
              {activeBanners.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center cursor-pointer transition-transform hover:scale-110 shadow-lg"
                    title="पिछला बैनर"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center cursor-pointer transition-transform hover:scale-110 shadow-lg"
                    title="अगला बैनर"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Carousel Dot Indicators */}
              {activeBanners.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-2.5">
                  {activeBanners.map((item, index) => (
                    <button
                      key={item.slot}
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        index === currentIndex
                          ? 'w-5 bg-amber-500'
                          : 'w-1.5 bg-stone-700 hover:bg-stone-500'
                      }`}
                      title={`स्लॉट ${item.slot}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions Grid Mock (Contextual Home UI) */}
        <div className="px-3 pb-4 pt-1 grid grid-cols-4 gap-2 opacity-50 pointer-events-none">
          {['भजन', 'साहित्य', 'स्तुति', 'सूचनाएं'].map((label, idx) => (
            <div key={idx} className="bg-stone-900 rounded-xl p-2 text-center space-y-1">
              <div className="w-6 h-6 rounded-lg bg-stone-800 mx-auto" />
              <div className="text-[9px] text-stone-400">{label}</div>
            </div>
          ))}
        </div>

        {/* Phone Bottom Home Bar */}
        <div className="w-28 h-1 bg-stone-700 rounded-full mx-auto mt-1 mb-1" />
      </div>
    </div>
  );
};
