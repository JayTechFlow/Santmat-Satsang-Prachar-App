// Sprint M3.3 — Production AudioProcessingStage implementation

import type { IMediaProcessingStage, ProcessingContext, StageResult } from '../../Interfaces/IMediaProcessingPipeline';
import { AudioMetadataExtractor } from '../Metadata/AudioMetadataExtractor';
import { WaveformGenerator } from '../Waveforms/WaveformGenerator';
import { AudioPreviewGenerator } from '../Players/AudioPreviewGenerator';
import { AudioOptimizer } from '../Providers/AudioOptimizer';
import { mediaEventBus } from '../../Events/MediaProcessingEvents';

export class AudioProcessingStage implements IMediaProcessingStage {
  readonly stageName = 'AudioProcessingStage';

  async execute(ctx: ProcessingContext): Promise<ProcessingContext> {
    const startTime = Date.now();

    // 1. Extract detailed audio metadata & ID3 tags
    const audioMeta = await AudioMetadataExtractor.extract(ctx.file, ctx.fileName, ctx.mimeType);
    ctx.metadata['audioMetadata'] = audioMeta;

    mediaEventBus.publish({
      eventType: 'MetadataExtracted',
      mediaId: ctx.mediaId,
      timestamp: new Date().toISOString(),
      stageName: this.stageName,
      data: { durationSeconds: audioMeta.durationSeconds, codec: audioMeta.codec },
    });

    // 2. Generate Multi-Resolution & Normalized Waveform
    const waveform = WaveformGenerator.generateWaveform(ctx.sizeBytes, audioMeta.durationSeconds);
    ctx.metadata['waveform'] = waveform;

    mediaEventBus.publish({
      eventType: 'WaveformGenerated',
      mediaId: ctx.mediaId,
      timestamp: new Date().toISOString(),
      stageName: this.stageName,
      data: { sampleCount: waveform.sampleCount },
    });

    // 3. Generate Streaming Sample & 30-Second Preview
    const preview = AudioPreviewGenerator.generatePreview(ctx.storagePath, audioMeta.durationSeconds, ctx.sizeBytes);
    ctx.metadata['audioPreview'] = preview;

    mediaEventBus.publish({
      eventType: 'PreviewGenerated',
      mediaId: ctx.mediaId,
      timestamp: new Date().toISOString(),
      stageName: this.stageName,
      data: { previewDuration: preview.previewDurationSeconds },
    });

    // 4. Audio Optimization & Dynamic Range Analysis
    const optimization = AudioOptimizer.analyzeAndOptimize(audioMeta.durationSeconds);
    ctx.metadata['audioOptimization'] = optimization;

    mediaEventBus.publish({
      eventType: 'MediaOptimized',
      mediaId: ctx.mediaId,
      timestamp: new Date().toISOString(),
      stageName: this.stageName,
      data: { peakLevelDb: optimization.peakLevelDb, dynamicRangeDb: optimization.dynamicRangeDb },
    });

    const durationMs = Date.now() - startTime;
    const stageResult: StageResult = {
      stageName: this.stageName,
      status: 'completed',
      durationMs,
      data: {
        durationSeconds: audioMeta.durationSeconds,
        waveformPoints: waveform.normalized.points.length,
        peakLevelDb: optimization.peakLevelDb,
      },
    };

    ctx.completedStages.push(stageResult);
    return ctx;
  }
}
