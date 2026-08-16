// Sprint M3.5 — Enterprise Document & PDF Processing Engine Test Suite

import { describe, it, expect } from 'vitest';
import { DocumentMetadataExtractor, DocumentSecurityException } from '../Documents/Metadata/DocumentMetadataExtractor';
import { PdfPreviewGenerator } from '../Documents/Previews/PdfPreviewGenerator';
import { DocumentPreviewGenerator } from '../Documents/Previews/DocumentPreviewGenerator';
import { DocumentAnalyzer } from '../Documents/Providers/DocumentAnalyzer';
import { DocumentProcessingStage } from '../Documents/Processors/DocumentProcessingStage';
import { MediaProcessingPipeline } from '../Pipelines/MediaProcessingPipeline';
import type { ProcessingContext } from '../Interfaces/IMediaProcessingPipeline';

describe('Sprint M3.5 Enterprise Document & PDF Processing Engine', () => {
  it('DocumentMetadataExtractor extracts PDF page count, author, title, and category', async () => {
    const mockBuffer = Buffer.alloc(1024);
    const meta = await DocumentMetadataExtractor.extract(mockBuffer, 'satsang_guide.pdf', 'application/pdf');

    expect(meta.extension).toBe('pdf');
    expect(meta.documentCategory).toBe('pdf');
    expect(meta.pageCount).toBeGreaterThan(0);
    expect(meta.author).toBe('Santmat Satsang Prachar Library');
    expect(meta.isEncrypted).toBe(false);
  });

  it('DocumentMetadataExtractor correctly categorizes Office documents (DOCX, XLSX, PPTX)', async () => {
    const mockBuffer = Buffer.alloc(1024);
    const wordMeta = await DocumentMetadataExtractor.extract(mockBuffer, 'report.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    const excelMeta = await DocumentMetadataExtractor.extract(mockBuffer, 'data.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    expect(wordMeta.documentCategory).toBe('word');
    expect(excelMeta.documentCategory).toBe('excel');
  });

  it('DocumentMetadataExtractor rejects corrupt or zero-byte document headers with DocumentSecurityException', async () => {
    const corruptBuffer = Buffer.alloc(10);
    await expect(
      DocumentMetadataExtractor.extract(corruptBuffer, 'corrupt.pdf', 'application/pdf')
    ).rejects.toThrow(DocumentSecurityException);
  });

  it('PdfPreviewGenerator & DocumentPreviewGenerator produce complete preview bundles', () => {
    const pdfBundle = PdfPreviewGenerator.generatePdfPreviews('documents/guide.pdf', 24);
    expect(pdfBundle.firstPagePreview.pageNumber).toBe(1);
    expect(pdfBundle.thumbnail.width).toBe(150);
    expect(pdfBundle.responsivePreview.dataUrlPlaceholder).toContain('data:image/svg+xml');
  });

  it('DocumentAnalyzer analyzes embedded fonts, images, and links', () => {
    const mockMeta = {
      documentCategory: 'pdf' as const,
      pageCount: 10,
      isEncrypted: false,
      isPasswordProtected: false,
      sizeBytes: 500000,
      checksum: 'abc',
      hash: 'abc',
      mimeType: 'application/pdf',
      extension: 'pdf',
    };

    const analysis = DocumentAnalyzer.analyze(mockMeta, 500000);
    expect(analysis.pageCount).toBe(10);
    expect(analysis.embeddedFontCount).toBeGreaterThan(0);
    expect(analysis.embeddedImageCount).toBeGreaterThan(0);
    expect(analysis.hasBookmarks).toBe(true);
  });

  it('MediaProcessingPipeline executes DocumentProcessingStage end-to-end', async () => {
    const pipeline = new MediaProcessingPipeline([new DocumentProcessingStage()]);
    const mockContext: ProcessingContext = {
      mediaId: 'doc_test_404',
      file: Buffer.alloc(2048),
      fileName: 'satsang_book.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 2048,
      storagePath: 'documents/satsang_book.pdf',
      metadata: {},
      completedStages: [],
      errors: [],
      cancelled: false,
      retryCount: 0,
    };

    const resultCtx = await pipeline.execute(mockContext);

    expect(resultCtx.completedStages.length).toBe(1);
    expect(resultCtx.metadata['documentMetadata']).toBeDefined();
    expect(resultCtx.metadata['documentAnalysis']).toBeDefined();
    expect(resultCtx.metadata['documentPreviews']).toBeDefined();
  });
});
