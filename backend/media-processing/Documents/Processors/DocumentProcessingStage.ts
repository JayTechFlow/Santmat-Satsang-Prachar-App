// Sprint M3.5 — Production DocumentProcessingStage implementation

import type { IMediaProcessingStage, ProcessingContext, StageResult } from '../../Interfaces/IMediaProcessingPipeline';
import { DocumentMetadataExtractor } from '../Metadata/DocumentMetadataExtractor';
import { DocumentPreviewGenerator } from '../Previews/DocumentPreviewGenerator';
import { DocumentAnalyzer } from '../Providers/DocumentAnalyzer';
import { mediaEventBus } from '../../Events/MediaProcessingEvents';

export class DocumentProcessingStage implements IMediaProcessingStage {
  readonly stageName = 'DocumentProcessingStage';

  async execute(ctx: ProcessingContext): Promise<ProcessingContext> {
    const startTime = Date.now();

    // 1. Extract detailed document metadata & run security checks
    const docMeta = await DocumentMetadataExtractor.extract(ctx.file, ctx.fileName, ctx.mimeType);
    ctx.metadata['documentMetadata'] = docMeta;

    mediaEventBus.publish({
      eventType: 'MetadataExtracted',
      mediaId: ctx.mediaId,
      timestamp: new Date().toISOString(),
      stageName: this.stageName,
      data: { category: docMeta.documentCategory, pageCount: docMeta.pageCount },
    });

    // 2. Perform Document Structural Analysis
    const analysis = DocumentAnalyzer.analyze(docMeta, ctx.sizeBytes);
    ctx.metadata['documentAnalysis'] = analysis;

    mediaEventBus.publish({
      eventType: 'DocumentAnalyzed',
      mediaId: ctx.mediaId,
      timestamp: new Date().toISOString(),
      stageName: this.stageName,
      data: { fontCount: analysis.embeddedFontCount, imageCount: analysis.embeddedImageCount },
    });

    // 3. Generate PDF/Office Responsive Preview Bundle
    const previews = DocumentPreviewGenerator.generateDocumentPreviews(ctx.storagePath, docMeta);
    ctx.metadata['documentPreviews'] = previews;

    mediaEventBus.publish({
      eventType: 'PreviewGenerated',
      mediaId: ctx.mediaId,
      timestamp: new Date().toISOString(),
      stageName: this.stageName,
      data: { hasFirstPage: true, pageCount: docMeta.pageCount },
    });

    const durationMs = Date.now() - startTime;
    const stageResult: StageResult = {
      stageName: this.stageName,
      status: 'completed',
      durationMs,
      data: {
        category: docMeta.documentCategory,
        pageCount: docMeta.pageCount,
        embeddedImages: analysis.embeddedImageCount,
      },
    };

    ctx.completedStages.push(stageResult);
    return ctx;
  }
}
