import React, { useState, useEffect } from 'react';
import { FileUpload } from './FileUpload';
import { X } from 'lucide-react';
import { storageService } from '../../core/storage';

interface ImageUploadProps {
  onFileSelect: (file: File) => void;
  onClear?: () => void;
  previewUrl?: string;
  progress?: number;
  isUploading?: boolean;
  onCancelUpload?: () => void;
  onUploadComplete?: (url: string) => void;
  folder?: string;
  uploadFn?: (file: File, folder: string, onProgress?: (p: number) => void) => Promise<string>;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onFileSelect,
  onClear,
  previewUrl: externalPreviewUrl,
  progress,
  isUploading,
  onCancelUpload,
  onUploadComplete,
  folder = 'images',
  uploadFn = storageService.uploadImage.bind(storageService)
}) => {
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!externalPreviewUrl) {
      setLocalPreview(null);
    }
  }, [externalPreviewUrl]);

  const handleFileSelect = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    onFileSelect(file);
  };

  const handleClear = () => {
    setLocalPreview(null);
    if (onClear) onClear();
  };

  const currentPreview = localPreview || externalPreviewUrl;

  return (
    <div>
      {currentPreview && !isUploading ? (
        <div className="image-upload-preview-wrapper">
          <img 
            src={currentPreview} 
            alt="Preview" 
            className="image-preview image-upload-preview-img"
          />
          <button
            onClick={handleClear}
            className="btn-icon image-upload-clear"
            aria-label="Remove image"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <FileUpload
          onFileSelect={handleFileSelect}
          accept="image/*"
          label="Drop an image here, or click to select"
          description="Supports JPG, PNG, WEBP (Max 5MB)"
          progress={progress}
          isUploading={isUploading}
          onCancelUpload={onCancelUpload}
          onUploadComplete={onUploadComplete}
          folder={folder}
          uploadFn={uploadFn}
        />
      )}
    </div>
  );
};
