import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  Maximize2,
  Minimize2,
  Sparkles,
  Smartphone,
  Sliders,
  AlertTriangle,
} from 'lucide-react';
import { ImageProfile, getImageProfile } from '../../lib/media/profiles/imageProfiles';
import { AdminAspectRatioPreview } from './AdminAspectRatioPreview';

export interface CroppedImageOutput {
  file: File;
  previewUrl: string;
  thumbnailFile?: File;
  thumbnailUrl?: string;
  metadata: {
    width: number;
    height: number;
    aspectRatio: number;
    sizeBytes: number;
    mimeType: string;
    compressionRatio: number;
    originalWidth: number;
    originalHeight: number;
    originalSizeBytes: number;
  };
}

export interface AdminImageCropperProps {
  imageSource: File | string;
  profile: ImageProfile | string;
  onCropComplete: (output: CroppedImageOutput) => void;
  onCancel?: () => void;
  className?: string;
}

export const AdminImageCropper: React.FC<AdminImageCropperProps> = ({
  imageSource,
  profile: profileProp,
  onCropComplete,
  onCancel,
  className = '',
}) => {
  const profile = typeof profileProp === 'string' ? getImageProfile(profileProp) : profileProp;

  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [livePreviewUrl, setLivePreviewUrl] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load source image
  useEffect(() => {
    let objectUrl = '';
    const img = new Image();
    img.crossOrigin = 'anonymous';

    if (imageSource instanceof File) {
      setOriginalFile(imageSource);
      objectUrl = URL.createObjectURL(imageSource);
      img.src = objectUrl;
    } else {
      img.src = imageSource;
    }

    img.onload = () => {
      setImageElement(img);
      setLivePreviewUrl(img.src);
      // Auto-fit initial pan/zoom
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [imageSource]);

  // Handle Drag / Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Perform canvas extraction and optimization
  const handleApplyCrop = async () => {
    if (!imageElement) return;
    setIsProcessing(true);

    try {
      const targetW = profile.targetWidth;
      const targetH = profile.targetHeight;

      // 1. Create master off-screen canvas with exact target profile dimensions
      const masterCanvas = document.createElement('canvas');
      masterCanvas.width = targetW;
      masterCanvas.height = targetH;
      const ctx = masterCanvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context could not be created');

      // Enable high-quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Clear
      ctx.fillStyle = '#000000';
      if (profile.fitMode === 'contain') {
        ctx.fillRect(0, 0, targetW, targetH);
      }

      // Calculate source image draw dimensions taking zoom and pan into account
      const containerW = 400;
      const containerH = containerW / profile.aspectRatio;

      const scaleFactor = targetW / containerW;
      const baseScale = Math.max(containerW / imageElement.naturalWidth, containerH / imageElement.naturalHeight);

      const renderW = imageElement.naturalWidth * baseScale * zoom * scaleFactor;
      const renderH = imageElement.naturalHeight * baseScale * zoom * scaleFactor;

      const offsetX = (targetW - renderW) / 2 + pan.x * scaleFactor;
      const offsetY = (targetH - renderH) / 2 + pan.y * scaleFactor;

      ctx.drawImage(imageElement, offsetX, offsetY, renderW, renderH);

      // Export Master Blob
      const masterBlob = await new Promise<Blob>((resolve, reject) => {
        masterCanvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('Blob generation failed'))),
          profile.outputFormat,
          profile.quality
        );
      });

      const masterFileName = originalFile
        ? originalFile.name.replace(/\.[^/.]+$/, '') + `_${profile.id}.webp`
        : `optimized_${profile.id}_${Date.now()}.webp`;

      const masterFile = new File([masterBlob], masterFileName, { type: profile.outputFormat });
      const masterUrl = URL.createObjectURL(masterBlob);
      setLivePreviewUrl(masterUrl);

      // 2. Generate optional thumbnail if specified
      let thumbFile: File | undefined;
      let thumbUrl: string | undefined;

      if (profile.thumbnailVariants?.thumb) {
        const thumbW = profile.thumbnailVariants.thumb.width;
        const thumbH = profile.thumbnailVariants.thumb.height;
        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = thumbW;
        thumbCanvas.height = thumbH;
        const tctx = thumbCanvas.getContext('2d');
        if (tctx) {
          tctx.imageSmoothingEnabled = true;
          tctx.imageSmoothingQuality = 'high';
          tctx.drawImage(masterCanvas, 0, 0, thumbW, thumbH);

          const thumbBlob = await new Promise<Blob>((resolve) => {
            thumbCanvas.toBlob((b) => resolve(b!), 'image/webp', 0.80);
          });
          const thumbFileName = `thumb_${masterFileName}`;
          thumbFile = new File([thumbBlob], thumbFileName, { type: 'image/webp' });
          thumbUrl = URL.createObjectURL(thumbBlob);
        }
      }

      const originalSizeBytes = originalFile ? originalFile.size : masterBlob.size;
      const compressionRatio = Number((masterBlob.size / originalSizeBytes).toFixed(2));

      onCropComplete({
        file: masterFile,
        previewUrl: masterUrl,
        thumbnailFile: thumbFile,
        thumbnailUrl: thumbUrl,
        metadata: {
          width: targetW,
          height: targetH,
          aspectRatio: Number((targetW / targetH).toFixed(3)),
          sizeBytes: masterBlob.size,
          mimeType: profile.outputFormat,
          compressionRatio,
          originalWidth: imageElement.naturalWidth,
          originalHeight: imageElement.naturalHeight,
          originalSizeBytes,
        },
      });
    } catch (err) {
      console.error('Failed to crop & optimize image:', err);
      alert('इमेज क्रॉप एवं अनुकूलन में त्रुटि हुई।');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border border-stone-200 shadow-xl overflow-hidden font-['Mukta'] ${className}`}
    >
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
            <Crop className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
              स्मार्ट इमेज संपादक एवं अनुकूलक (Smart Media Editor)
            </h3>
            <p className="text-xs text-stone-500">
              लक्षित प्रोफ़ाइल: <strong className="text-amber-700">{profile.labelHi}</strong> •{' '}
              {profile.aspectRatioLabel} ({profile.targetWidth}×{profile.targetHeight}px)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-1.5 rounded-[0.625rem] border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 transition-colors"
            >
              रद्द करें
            </button>
          )}
          <button
            type="button"
            onClick={handleApplyCrop}
            disabled={isProcessing || !imageElement}
            className="px-4 py-1.5 rounded-[0.625rem] bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>क्रॉप व अनुकूलित करें</span>
          </button>
        </div>
      </div>

      {/* Main workspace: 2-column on desktop (Left: Interactive Crop Area, Right: Android Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 sm:p-6">
        {/* Left: Interactive Canvas Viewport (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative w-full overflow-hidden bg-stone-900 rounded-xl border border-stone-800 shadow-inner select-none">
            {/* Aspect ratio frame box */}
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                aspectRatio: `${profile.aspectRatio}`,
                cursor: isDragging ? 'grabbing' : 'grab',
              }}
              className="relative w-full flex items-center justify-center overflow-hidden"
            >
              {imageElement && (
                <img
                  src={imageElement.src}
                  alt="Crop Source"
                  draggable={false}
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: 'center center',
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                    maxWidth: 'none',
                    maxHeight: 'none',
                    width: '100%',
                    height: '100%',
                    objectFit: profile.fitMode,
                  }}
                  className="pointer-events-none"
                />
              )}

              {/* Grid overlay for framing guide */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none border border-amber-400/40">
                <div className="border-r border-b border-amber-400/20" />
                <div className="border-r border-b border-amber-400/20" />
                <div className="border-b border-amber-400/20" />
                <div className="border-r border-b border-amber-400/20" />
                <div className="border-r border-b border-amber-400/20" />
                <div className="border-b border-amber-400/20" />
                <div className="border-r border-amber-400/20" />
                <div className="border-r border-amber-400/20" />
                <div />
              </div>

              {/* Aspect Ratio Badge */}
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/70 text-amber-300 font-mono text-[10px] font-bold border border-amber-400/30 backdrop-blur-xs pointer-events-none">
                लक्षित: {profile.aspectRatioLabel}
              </div>
            </div>
          </div>

          {/* Interactive Controls Bar */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[180px]">
              <ZoomOut className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <ZoomIn className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <span className="font-mono font-bold text-stone-700 w-10 text-right">
                {zoom.toFixed(1)}x
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 rounded-[0.625rem] border border-stone-300 hover:bg-white text-stone-700 font-bold transition-colors flex items-center gap-1.5 text-xs shadow-2xs"
              >
                <RotateCcw className="w-3 h-3" />
                <span>रीसेट (Reset)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Android Device Preview & Specs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <AdminAspectRatioPreview
            imageUrl={livePreviewUrl}
            profile={profile}
            title={profile.name}
            subtitle="Santmat Satsang Prachar"
          />
        </div>
      </div>
    </div>
  );
};
