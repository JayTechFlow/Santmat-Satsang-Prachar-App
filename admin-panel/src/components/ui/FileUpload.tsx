import React, { useState } from 'react';
import { UploadZone, type UploadZoneProps } from './UploadZone';
import { UploadProgress } from './UploadProgress';

interface FileUploadProps extends Omit<UploadZoneProps, 'onFileSelect'> {
  onFileSelect?: (file: File) => void;
  progress?: number;
  fileName?: string;
  isUploading?: boolean;
  onCancelUpload?: () => void;
  onUploadComplete?: (url: string) => void;
  folder?: string;
  uploadFn?: (file: File, folder: string, onProgress?: (p: number) => void) => Promise<string>;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  progress: externalProgress,
  fileName: externalFileName,
  isUploading: externalIsUploading,
  onCancelUpload,
  onUploadComplete,
  folder = 'uploads',
  onFileSelect,
  uploadFn,
  ...zoneProps
}) => {
  const [internalProgress, setInternalProgress] = useState(0);
  const [internalIsUploading, setInternalIsUploading] = useState(false);
  const [internalFileName, setInternalFileName] = useState('');

  const isUploading = externalIsUploading !== undefined ? externalIsUploading : internalIsUploading;
  const progress = externalProgress !== undefined ? externalProgress : internalProgress;
  const fileName = externalFileName !== undefined ? externalFileName : internalFileName;

  const handleFileSelect = async (file: File) => {
    if (onFileSelect) onFileSelect(file);
    if (onUploadComplete && uploadFn) {
      setInternalIsUploading(true);
      setInternalFileName(file.name);
      
      try {
        const url = await uploadFn(file, folder, (p) => setInternalProgress(p));
        setInternalIsUploading(false);
        setInternalProgress(0);
        onUploadComplete(url);
      } catch (error) {
        console.error("Upload failed", error);
        setInternalIsUploading(false);
      }
    }
  };

  return (
    <div>
      {!isUploading ? (
        <UploadZone {...zoneProps} onFileSelect={handleFileSelect} />
      ) : (
        <UploadProgress 
          progress={progress || 0} 
          fileName={fileName} 
          onCancel={onCancelUpload} 
        />
      )}
    </div>
  );
};
