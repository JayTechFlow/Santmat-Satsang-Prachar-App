import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  X,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Maximize2,
  Minimize2,
  AlertTriangle,
  ArrowRight,
  Sliders,
  Image as ImageIcon,
} from 'lucide-react';
import { BannerEntity, BannerSlotNumber } from '../../../types/common/index';
import { bannerService, ReplaceSlotBannerParams } from '../services/bannerService';
import { IMAGE_PROFILES } from '../../../lib/media/profiles/imageProfiles';
import { AdminButton, AdminField } from '../../../components/admin';

export interface BannerReplaceModalProps {
  isOpen: boolean;
  targetSlot: BannerSlotNumber;
  currentBanner: BannerEntity | null;
  onClose: () => void;
  onSuccess: (newBanner: BannerEntity) => void;
}

export const BannerReplaceModal: React.FC<BannerReplaceModalProps> = ({
  isOpen,
  targetSlot,
  currentBanner,
  onClose,
  onSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Flow State
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Metadata
  const [title, setTitle] = useState('');
  const [targetScreen, setTargetScreen] = useState('/audio');

  // Cropper Pan & Zoom State (WhatsApp Style)
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('cover');

  // Processing & Upload Progress
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live Canvas Preview Blob URL
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string>('');

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setSourceFile(null);
      setImageElement(null);
      setTitle(currentBanner ? currentBanner.title : `संतमत सत्संग बैनर ${targetSlot}`);
      setTargetScreen(currentBanner?.targetScreen || '/audio');
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setFitMode('cover');
      setIsProcessing(false);
      setProgressStep('');
      setProgressPercent(0);
      setErrorMessage(null);
      setPreviewBlobUrl('');
    }
  }, [isOpen, currentBanner, targetSlot]);

  // Load Source File into Image Element
  const handleSelectFile = (file: File) => {
    setErrorMessage(null);
    if (!file.type.startsWith('image/')) {
      setErrorMessage('कृपया केवल वैध छवि फ़ाइल (.jpg, .jpeg, .png, .webp) चुनें।');
      return;
    }

    setSourceFile(file);
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImageElement(img);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };
    img.onerror = () => {
      setErrorMessage('छवि लोड करने में विफलता। कृपया दूसरी छवि चुनें।');
    };
    img.src = objectUrl;
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleSelectFile(e.dataTransfer.files[0]);
    }
  };

  // Pan Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageElement) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !imageElement) return;
    setPan({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Zoom controls
  const handleZoomChange = (newZoom: number) => {
    setZoom(Math.max(1, Math.min(3, newZoom)));
  };

  const handleResetCrop = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setFitMode('cover');
  };

  // Generate Master (1280x720) and Thumbnail (640x360) WebP Blobs
  const renderCroppedWebpBlobs = async (): Promise<{ masterBlob: Blob; thumbBlob: Blob }> => {
    if (!imageElement) throw new Error('कोई छवि लोड नहीं है।');

    // 1. Render Master (1280×720, 16:9)
    const masterCanvas = document.createElement('canvas');
    masterCanvas.width = 1280;
    masterCanvas.height = 720;
    const ctx = masterCanvas.getContext('2d');
    if (!ctx) throw new Error('कैनवास संदर्भ प्राप्त नहीं हो सका।');

    // Background fill (devotional warm neutral)
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, 1280, 720);

    // Calculate source and destination sizing based on pan & zoom
    const imgW = imageElement.naturalWidth || imageElement.width;
    const imgH = imageElement.naturalHeight || imageElement.height;
    const targetAspect = 1280 / 720;
    const imgAspect = imgW / imgH;

    let baseScale = 1;
    if (fitMode === 'cover') {
      baseScale = imgAspect > targetAspect ? 720 / imgH : 1280 / imgW;
    } else {
      baseScale = imgAspect > targetAspect ? 1280 / imgW : 720 / imgH;
    }

    const effectiveScale = baseScale * zoom;
    const drawW = imgW * effectiveScale;
    const drawH = imgH * effectiveScale;

    // Pan offset scaled to 1280×720 canvas
    const containerW = containerRef.current?.clientWidth || 640;
    const scaleFactor = 1280 / containerW;
    const offsetX = 1280 / 2 - drawW / 2 + pan.x * scaleFactor;
    const offsetY = 720 / 2 - drawH / 2 + pan.y * scaleFactor;

    ctx.drawImage(imageElement, offsetX, offsetY, drawW, drawH);

    // Convert master to WebP Blob (quality 0.90)
    const masterBlob = await new Promise<Blob>((resolve, reject) => {
      masterCanvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('मास्टर WebP एन्कोडिंग विफल।'));
        },
        'image/webp',
        0.9
      );
    });

    // 2. Render Thumbnail (640×360, 16:9)
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = 640;
    thumbCanvas.height = 360;
    const thumbCtx = thumbCanvas.getContext('2d');
    if (!thumbCtx) throw new Error('थंबनेल कैनवास संदर्भ प्राप्त नहीं हो सका।');

    thumbCtx.drawImage(masterCanvas, 0, 0, 640, 360);

    const thumbBlob = await new Promise<Blob>((resolve, reject) => {
      thumbCanvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('थंबनेल WebP एन्कोडिंग विफल।'));
        },
        'image/webp',
        0.82
      );
    });

    return { masterBlob, thumbBlob };
  };

  // Update Live Preview when parameters change
  useEffect(() => {
    if (!imageElement) return;

    let isSubscribed = true;
    const updatePreview = async () => {
      try {
        const { thumbBlob } = await renderCroppedWebpBlobs();
        if (isSubscribed) {
          const url = URL.createObjectURL(thumbBlob);
          setPreviewBlobUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
        }
      } catch (_) {}
    };

    const timer = setTimeout(updatePreview, 120);
    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [imageElement, zoom, pan, fitMode]);

  // Execute Slot Replacement with Fail-Safe rollback
  const handleExecuteReplace = async () => {
    if (!imageElement) {
      setErrorMessage('कृपया पहले एक बैनर छवि चुनें।');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('कृपया बैनर का शीर्षक दर्ज करें।');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      setProgressStep('1280×720 WebP मास्टर एवं थंबनेल तैयार किया जा रहा है…');
      setProgressPercent(15);

      const { masterBlob, thumbBlob } = await renderCroppedWebpBlobs();

      const timestamp = Date.now();
      const masterFile = new File([masterBlob], `slot_${targetSlot}_${timestamp}.webp`, {
        type: 'image/webp',
      });
      const thumbFile = new File([thumbBlob], `thumb_slot_${targetSlot}_${timestamp}.webp`, {
        type: 'image/webp',
      });

      const replaceParams: ReplaceSlotBannerParams = {
        slot: targetSlot,
        file: masterFile,
        thumbnailFile: thumbFile,
        title: title.trim(),
        targetScreen,
        width: 1280,
        height: 720,
      };

      const res = await bannerService.replaceSlotBanner(replaceParams, (step, percent) => {
        setProgressStep(step);
        setProgressPercent(percent);
      });

      if (!res.success || !res.data) {
        throw new Error(res.error || `स्लॉट ${targetSlot} प्रतिस्थापन विफल।`);
      }

      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      console.error(`Replace Slot ${targetSlot} error:`, err);
      setErrorMessage(
        err.message || `स्लॉट ${targetSlot} प्रतिस्थापन विफल। पिछला डेटा सुरक्षित रखा गया है।`
      );
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm font-['Mukta'] overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-500 text-white">
                  स्लॉट {targetSlot}
                </span>
                <h3 className="text-base sm:text-lg font-bold">16:9 बैनर अपलोड एवं लाइव क्रॉप</h3>
              </div>
              <p className="text-xs text-stone-300">
                1280×720 WebP अनुपात-लॉक • केवल स्लॉट {targetSlot} अद्यतित होगा, शेष 3 स्लॉट्स सुरक्षित रहेंगे
              </p>
            </div>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Step 1: File Dropzone */}
          {!imageElement ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                isDraggingOver
                  ? 'border-amber-500 bg-amber-50/60 scale-[1.01]'
                  : 'border-stone-300 bg-stone-50/50 hover:border-amber-400 hover:bg-stone-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleSelectFile(e.target.files[0]);
                  }
                }}
              />
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Upload className="w-8 h-8" />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-stone-800">
                स्लॉट {targetSlot} के लिए 16:9 बैनर छवि चुनें या यहाँ छोड़ें
              </h4>
              <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-md mx-auto">
                समर्थित प्रारूप: JPG, PNG, WEBP। छवि को स्वचालित रूप से 16:9 (1280×720) में इंटरैक्टिव क्रॉप किया जाएगा।
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-xs font-medium text-stone-700 shadow-sm">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                <span>फ़ाइल ब्राउज़ करें</span>
              </div>
            </div>
          ) : (
            /* Step 2: Interactive Cropper + Live Preview */
            <div className="space-y-6">
              {/* Cropper Container */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-amber-600" />
                    इंटरैक्टिव 16:9 पैन एवं ज़ूम संपादक (WhatsApp Style)
                  </span>
                  <button
                    onClick={() => {
                      setImageElement(null);
                      setSourceFile(null);
                    }}
                    className="text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    दूसरी छवि चुनें
                  </button>
                </div>

                <div
                  ref={containerRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className={`relative w-full aspect-video bg-stone-950 rounded-xl overflow-hidden select-none border border-stone-300 shadow-inner ${
                    isPanning ? 'cursor-grabbing' : 'cursor-grab'
                  }`}
                >
                  {/* Visual 16:9 Alignment Grid */}
                  <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-10 opacity-25">
                    <div className="border-r border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-b border-white" />
                    <div className="border-r border-white" />
                    <div className="border-r border-white" />
                    <div />
                  </div>

                  {/* Cropper Image */}
                  <div
                    className="absolute inset-0 flex items-center justify-center transition-transform duration-75"
                    style={{
                      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                      transformOrigin: 'center center',
                    }}
                  >
                    <img
                      src={imageElement.src}
                      alt="Crop Source"
                      className={`max-w-none pointer-events-none ${
                        fitMode === 'cover'
                          ? 'w-full h-full object-cover'
                          : 'max-w-full max-h-full object-contain'
                      }`}
                      draggable={false}
                    />
                  </div>

                  {/* Corner Resolution Pill */}
                  <div className="absolute top-2 left-2 z-20 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded text-[11px] text-white font-mono flex items-center gap-2">
                    <span className="text-amber-400 font-bold">स्लॉट {targetSlot}</span>
                    <span>16:9 (1280×720 WebP)</span>
                  </div>

                  {/* Fit Mode Switcher Pill */}
                  <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1 bg-black/75 backdrop-blur-md p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFitMode('cover');
                      }}
                      className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                        fitMode === 'cover' ? 'bg-amber-600 text-white' : 'text-stone-300 hover:text-white'
                      }`}
                      title="कवर (Cover) मोड"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFitMode('contain');
                      }}
                      className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                        fitMode === 'contain' ? 'bg-amber-600 text-white' : 'text-stone-300 hover:text-white'
                      }`}
                      title="कंटेन (Contain) मोड"
                    >
                      <Minimize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Cropper Controls Toolbar */}
                <div className="p-3 bg-stone-100/90 rounded-xl flex flex-wrap items-center justify-between gap-3 border border-stone-200">
                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <ZoomOut className="w-4 h-4 text-stone-500" />
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.05}
                      value={zoom}
                      onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-stone-300 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                    <ZoomIn className="w-4 h-4 text-stone-500" />
                    <span className="text-xs font-mono text-stone-700 w-10 text-right">
                      {zoom.toFixed(1)}x
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetCrop}
                      className="px-2.5 py-1 text-xs text-stone-700 hover:bg-stone-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>रीसेट</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 3: Metadata Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-200">
                <AdminField label="बैनर का शीर्षक (Title)" required>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="उदा. संतमत सत्संग प्रचार या विशेष समागम"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    disabled={isProcessing}
                  />
                </AdminField>

                <AdminField label="टैप करने पर गंतव्य स्क्रीन (Target Screen)">
                  <select
                    value={targetScreen}
                    onChange={(e) => setTargetScreen(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                    disabled={isProcessing}
                  >
                    <option value="/audio">ऑडियो एवं भजन संग्रह (/audio)</option>
                    <option value="/stuti-vinati">स्तुति-विनती पाठ (/stuti-vinati)</option>
                    <option value="/books">साहित्य एवं सद्ग्रंथ (/books)</option>
                    <option value="/notifications">सूचनाएं एवं अपडेट (/notifications)</option>
                    <option value="/search">सत्संग खोज (/search)</option>
                  </select>
                </AdminField>
              </div>
            </div>
          )}

          {/* Processing / Progress State */}
          {isProcessing && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 animate-spin text-amber-600" />
                  <span>{progressStep || 'प्रक्रिया जारी है…'}</span>
                </span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-amber-200/60 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-amber-800">
                कृपया विंडो बंद न करें। स्लॉट {targetSlot} का सुरक्षित कैनोनिकल प्रतिस्थापन प्रगति पर है।
              </p>
            </div>
          )}

          {/* Safety Notice */}
          <div className="flex items-start gap-2.5 text-xs text-stone-600 bg-stone-100/80 p-3 rounded-xl border border-stone-200/60">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-800">स्लॉट-पृथक सुरक्षित अनुबंध (Slot Isolation Contract):</strong>
              <p className="mt-0.5 text-stone-500">
                यह परिवर्तन केवल <strong>स्लॉट {targetSlot}</strong> को अद्यतित करेगा। शेष तीनों स्लॉट्स पूर्णतः अपरिवर्तित रहेंगे।
                यदि किसी कारणवश अपलोड बाधित होता है, तो वर्तमान स्लॉट का डेटा सुरक्षित और सक्रिय रहेगा।
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
          <AdminButton
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isProcessing}
          >
            रद्द करें
          </AdminButton>

          <AdminButton
            type="button"
            variant="primary"
            size="md"
            onClick={handleExecuteReplace}
            disabled={!imageElement || !title.trim() || isProcessing}
            loading={isProcessing}
            loadingText="प्रतिस्थापित हो रहा है…"
            icon={<Check className="w-4 h-4" />}
          >
            स्लॉट {targetSlot} बैनर सुरक्षित करें
          </AdminButton>
        </div>
      </div>
    </div>
  );
};
