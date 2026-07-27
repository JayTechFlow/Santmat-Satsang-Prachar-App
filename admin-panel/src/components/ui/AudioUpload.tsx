import React, { useState, useEffect, useRef } from 'react';
import { FileUpload } from './FileUpload';
import { Play, Pause, X, Music } from 'lucide-react';
import { storageService } from '../../core/storage';

interface AudioUploadProps {
  onFileSelect: (file: File) => void;
  onClear?: () => void;
  audioUrl?: string;
  progress?: number;
  isUploading?: boolean;
  onCancelUpload?: () => void;
  onUploadComplete?: (url: string) => void;
  folder?: string;
  uploadFn?: (file: File, folder: string, onProgress?: (p: number) => void) => Promise<string>;
}

export const AudioUpload: React.FC<AudioUploadProps> = ({
  onFileSelect,
  onClear,
  audioUrl: externalAudioUrl,
  progress,
  isUploading,
  onCancelUpload,
  onUploadComplete,
  folder = 'audio',
  uploadFn = storageService.uploadAudio.bind(storageService)
}) => {
  const [localAudio, setLocalAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!externalAudioUrl) {
      setLocalAudio(null);
    }
  }, [externalAudioUrl]);

  const handleFileSelect = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setLocalAudio(objectUrl);
    onFileSelect(file);
  };

  const handleClear = () => {
    setLocalAudio(null);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    if (onClear) onClear();
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const currentAudio = localAudio || externalAudioUrl;

  return (
    <div>
      {currentAudio && !isUploading ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-16)',
          padding: 'var(--space-16)',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-input)',
          maxWidth: '400px'
        }}>
          <button 
            onClick={togglePlay}
            className="btn-icon"
            style={{ 
              backgroundColor: 'var(--primary)', 
              color: 'white',
              width: '40px',
              height: '40px',
              borderRadius: '50%'
            }}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
            <Music size={20} color="var(--text-muted)" />
            <div style={{
              height: '4px',
              flex: 1,
              backgroundColor: '#E8E8E8',
              borderRadius: '2px',
              position: 'relative'
            }}>
              {/* Fake waveform / progress bar for visual purpose */}
              <div style={{ width: isPlaying ? '50%' : '0%', height: '100%', backgroundColor: 'var(--primary)', borderRadius: '2px', transition: 'width 0.2s' }} />
            </div>
          </div>
          
          <button onClick={handleClear} className="btn-icon">
            <X size={20} />
          </button>
          
          <audio 
            ref={audioRef} 
            src={currentAudio} 
            onEnded={() => setIsPlaying(false)}
            style={{ display: 'none' }} 
          />
        </div>
      ) : (
        <FileUpload
          onFileSelect={handleFileSelect}
          accept="audio/*"
          label="Drop an audio file here, or click to select"
          description="Supports MP3, WAV, AAC (Max 15MB)"
          maxSizeMB={15}
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
