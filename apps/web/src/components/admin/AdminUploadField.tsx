import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Check,
  X,
  AlertCircle,
  Crop,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  ImageProfile,
  getImageProfile,
  validateImageAgainstProfile,
  ImageValidationResult,
} from '../../lib/media/profiles/imageProfiles';
import { AdminImageCropper, CroppedImageOutput } from './AdminImageCropper';

export interface AdminUploadFieldProps {
  label: string;
  profile: ImageProfile | string;
  value?: string;
  onChange: (file: File, previewUrl: string, metadata?: any) => void;
  onRemove?: () => void;
  helperText?: string;
  required?: boolean;
  className?: string;
}

export const AdminUploadField: React.FC<AdminUploadFieldProps> = ({
  label,
  profile: profileProp,
  value,
  onChange,
  onRemove,
  helperText,
  required = false,
  className = '',
}) => {
  const profile = typeof profileProp === 'string' ? getImageProfile(profileProp) : profileProp;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(value || '');
  const [isCropperOpen, setIsCropperOpen] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [fileStats, setFileStats] = useState<{
    width: number;
    height: number;
    sizeKb: number;
    format: string;
  } | null>(null);

  // Drag and drop state
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  const processFile = async (file: File) => {
    setValidationErrors([]);
    setValidationWarnings([]);

    // 1. Profile-aware validation
    const validation = await validateImageAgainstProfile(file, profile);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }
    if (validation.warnings.length > 0) {
      setValidationWarnings(validation.warnings);
    }

    if (validation.dimensions) {
      setFileStats({
        width: validation.dimensions.width,
        height: validation.dimensions.height,
        sizeKb: Math.round(file.size / 1024),
        format: file.type.split('/')[1]?.toUpperCase() || 'IMAGE',
      });
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // If there's an aspect ratio mismatch, open the cropper automatically for convenience!
    if (validation.warnings.length > 0) {
      setIsCropperOpen(true);
    } else {
      onChange(file, objectUrl);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleCropComplete = (output: CroppedImageOutput) => {
    setSelectedFile(output.file);
    setPreviewUrl(output.previewUrl);
    setFileStats({
      width: output.metadata.width,
      height: output.metadata.height,
      sizeKb: Math.round(output.metadata.sizeBytes / 1024),
      format: 'WEBP',
    });
    setValidationWarnings([]);
    setIsCropperOpen(false);
    onChange(output.file, output.previewUrl, output.metadata);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setFileStats(null);
    setValidationErrors([]);
    setValidationWarnings([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onRemove) onRemove();
  };

  return (
    <div className={`space-y-2.5 font-['Mukta'] ${className}`}>
      {/* Label and Target Profile Badge */}
      <div className="flex items-center justify-between">
        <label className="text-xs sm:text-sm font-bold text-stone-800 flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </label>
        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-mono text-[11px] font-bold border border-stone-200">
          अनुपात: {profile.aspectRatioLabel} ({profile.targetWidth}×{profile.targetHeight})
        </span>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Interactive Modal Cropper */}
      {isCropperOpen && selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <AdminImageCropper
              imageSource={selectedFile}
              profile={profile}
              onCropComplete={handleCropComplete}
              onCancel={() => setIsCropperOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Preview or Dropzone */}
      {previewUrl ? (
        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              style={{ aspectRatio: `${profile.aspectRatio}` }}
              className="w-24 h-auto max-h-24 bg-stone-900 rounded-lg overflow-hidden border border-stone-300 shrink-0 relative flex items-center justify-center shadow-xs"
            >
              <img
                src={previewUrl}
                alt="Selected Preview"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1 text-xs text-stone-600">
              <div className="font-bold text-stone-900 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>इमेज सफलतापूर्वक चयनित</span>
              </div>
              {fileStats && (
                <p className="font-mono text-[11px] text-stone-500">
                  {fileStats.width}×{fileStats.height}px • {fileStats.sizeKb} KB • {fileStats.format}
                </p>
              )}
              <p className="text-[11px] text-amber-700">
                Android लक्ष्य: {profile.androidContext.componentName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsCropperOpen(true)}
              className="px-3 py-1.5 rounded-[0.625rem] border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Crop className="w-3.5 h-3.5 text-amber-700" />
              <span>क्रॉप / पुनः आकार</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-[0.625rem] border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-colors"
            >
              बदलें
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-[0.625rem] text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="हटाएं"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
            isDraggingOver
              ? 'border-amber-500 bg-amber-50/60'
              : 'border-stone-300 hover:border-amber-400 bg-stone-50/50 hover:bg-amber-50/20'
          }`}
        >
          <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-xs sm:text-sm font-bold text-stone-800">
            इमेज फ़ाइल यहाँ खींचें या ब्राउज़ करें
          </p>
          <p className="text-[11px] text-stone-500 mt-1 font-mono">
            {profile.labelHi} के लिए अनुशंसित: {profile.targetWidth}×{profile.targetHeight}px ({profile.aspectRatioLabel})
          </p>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-700 space-y-1">
          {validationErrors.map((err, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{err}</span>
            </div>
          ))}
        </div>
      )}

      {/* Validation Warnings */}
      {validationWarnings.length > 0 && (
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1">
          {validationWarnings.map((warn, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>{warn}</span>
            </div>
          ))}
        </div>
      )}

      {/* Helper text */}
      {helperText && <p className="text-xs text-stone-500">{helperText}</p>}
    </div>
  );
};
