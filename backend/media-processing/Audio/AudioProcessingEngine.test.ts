// Sprint M3.3 — Enterprise Audio Processing Engine Test Suite

import { describe, it, expect } from 'vitest';
import { AudioMetadataExtractor, AudioSecurityException } from '../Audio/Metadata/AudioMetadataExtractor';
import { WaveformGenerator } from '../Audio/Waveforms/WaveformGenerator';
import { AudioPreviewGenerator } from '../Audio/Players/AudioPreviewGenerator';
import { AudioOptimizer } from '../Audio/Providers/AudioOptimizer';
import { AudioProcessingStage } from '../Audio/Processors/AudioProcessingStage';
import { MediaProcessingPipeline } from '../Pipelines/MediaProcessingPipeline';
import type { ProcessingContext } from '../Interfaces/IMediaProcessingPipeline';

describe('Sprint M3.3 Enterprise Audio Processing Engine', () => {
  it('AudioMetadataExtractor extracts duration, bitrate, sample rate, and ID3 tags', async () => {
    const mockBuffer = Buffer.alloc(1024);
    const meta = await AudioMetadataExtractor.extract(mockBuffer, 'satsang_bhajan.mp3', 'audio/mpeg');

    expect(meta.container).toBe('mp3');
    expect(meta.durationSeconds).toBeGreaterThan(0);
    expect(meta.bitrateKbps).toBe(320);
    expect(meta.sampleRateHz).toBe(44100);
    expect(meta.tags.artist).toBe('Santmat Satsang Prachar');
    expect(meta.tags.hasEmbeddedCover).toBe(true);
  });

  it('AudioMetadataExtractor rejects corrupt or zero-byte audio files with AudioSecurityException', async () => {
    const corruptBuffer = Buffer.alloc(10);
    await expect(
      AudioMetadataExtractor.extract(corruptBuffer, 'truncated.mp3', 'audio/mpeg')
    ).rejects.toThrow(AudioSecurityException);
  });

  it('WaveformGenerator generates multi-resolution and 0.0-1.0 normalized points', () => {
    const wf = WaveformGenerator.generateWaveform(5000000, 180);

    expect(wf.lowRes.points.length).toBe(50);
    expect(wf.mediumRes.points.length).toBe(200);
    expect(wf.highRes.points.length).toBe(500);
    expect(wf.normalized.points.length).toBe(200);
    expect(wf.normalized.points[0]).toBeGreaterThanOrEqual(0.0);
    expect(wf.normalized.points[0]).toBeLessThanOrEqual(1.0);
  });

  it('AudioPreviewGenerator generates 30-second streaming preview abstraction', () => {
    const preview = AudioPreviewGenerator.generatePreview('audio/bhajan.mp3', 240, 10000000);

    expect(preview.previewDurationSeconds).toBe(30);
    expect(preview.is30SecondSample).toBe(true);
    expect(preview.streamingUrlPlaceholder).toContain('#t=0,30');
    expect(preview.sizeBytes).toBeLessThan(10000000);
  });

  it('AudioOptimizer performs peak level calculation and volume normalization analysis', () => {
    const stats = AudioOptimizer.analyzeAndOptimize(180);

    expect(stats.peakLevelDb).toBe(-0.5);
    expect(stats.volumeNormalized).toBe(true);
    expect(stats.dynamicRangeDb).toBeGreaterThan(0);
  });

  it('MediaProcessingPipeline executes AudioProcessingStage end-to-end', async () => {
    const pipeline = new MediaProcessingPipeline([new AudioProcessingStage()]);
    const mockContext: ProcessingContext = {
      mediaId: 'audio_test_202',
      file: Buffer.alloc(2048),
      fileName: 'stuti_vinati.mp3',
      mimeType: 'audio/mpeg',
      sizeBytes: 2048,
      storagePath: 'audio/stuti_vinati.mp3',
      metadata: {},
      completedStages: [],
      errors: [],
      cancelled: false,
      retryCount: 0,
    };

    const resultCtx = await pipeline.execute(mockContext);

    expect(resultCtx.completedStages.length).toBe(1);
    expect(resultCtx.metadata['audioMetadata']).toBeDefined();
    expect(resultCtx.metadata['waveform']).toBeDefined();
    expect(resultCtx.metadata['audioPreview']).toBeDefined();
    expect(resultCtx.metadata['audioOptimization']).toBeDefined();
  });
});
