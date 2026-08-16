// Sprint M3.3 — Audio Models & Domain Interfaces

export interface AudioTagMetadata {
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  trackNumber?: number;
  discNumber?: number;
  composer?: string;
  publisher?: string;
  language?: string;
  year?: number;
  copyright?: string;
  hasEmbeddedCover: boolean;
  hasLyrics: boolean;
}

export interface DetailedAudioMetadata {
  durationSeconds: number;
  humanReadableDuration: string;
  bitrateKbps: number;
  sampleRateHz: number;
  channels: number;
  codec: string;
  container: string;
  encoding: string;
  sizeBytes: number;
  checksum: string;
  hash: string;
  tags: AudioTagMetadata;
  createdAt: string;
  modifiedAt: string;
}

export interface WaveformResolution {
  points: number[];
}

export interface MultiResolutionWaveform {
  lowRes: WaveformResolution;      // 50 data points (fast render)
  mediumRes: WaveformResolution;   // 200 data points (standard render)
  highRes: WaveformResolution;     // 500 data points (detailed render)
  normalized: WaveformResolution; // Normalized 0.0 - 1.0 peak values
  sampleCount: number;
}

export interface AudioPreviewVariant {
  previewDurationSeconds: number;
  streamingUrlPlaceholder: string;
  is30SecondSample: boolean;
  bitrateKbps: number;
  sizeBytes: number;
}

export interface AudioOptimizationStats {
  peakLevelDb: number;
  silenceDetected: boolean;
  silenceStartSeconds?: number;
  silenceDurationSeconds?: number;
  dynamicRangeDb: number;
  metadataNormalized: boolean;
  volumeNormalized: boolean;
  durationMs: number;
}
