// Sprint M3.5 — Office Document & Generic Preview Abstraction Generator

import type { DocumentPreviewBundle, DetailedDocumentMetadata } from '../Models/DocumentModels';
import { PdfPreviewGenerator } from './PdfPreviewGenerator';

export class DocumentPreviewGenerator {
  public static generateDocumentPreviews(
    storagePath: string,
    metadata: DetailedDocumentMetadata
  ): DocumentPreviewBundle {
    if (metadata.documentCategory === 'pdf') {
      return PdfPreviewGenerator.generatePdfPreviews(storagePath, metadata.pageCount);
    }

    // Office Document Preview Abstraction (Word, Excel, PPT, OpenDocument)
    const pageNum = 1;
    return {
      firstPagePreview: {
        label: 'firstPage',
        width: 600,
        height: 800,
        pageNumber: pageNum,
        sizeBytes: 30000,
        storagePath: `${storagePath}_office_page1.png`,
      },
      thumbnail: {
        label: 'thumbnail',
        width: 150,
        height: 200,
        pageNumber: pageNum,
        sizeBytes: 6144,
        storagePath: `${storagePath}_office_thumb.png`,
      },
      mediumPreview: {
        label: 'medium',
        width: 450,
        height: 600,
        pageNumber: pageNum,
        sizeBytes: 20000,
        storagePath: `${storagePath}_office_med.png`,
      },
      largePreview: {
        label: 'large',
        width: 900,
        height: 1200,
        pageNumber: pageNum,
        sizeBytes: 60000,
        storagePath: `${storagePath}_office_large.png`,
      },
      responsivePreview: {
        label: 'responsive',
        width: 600,
        height: 800,
        pageNumber: pageNum,
        sizeBytes: 30000,
        dataUrlPlaceholder: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iODAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTFlNGVhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM0YjU1NjMiPk9mZmljZSBEb2N1bWVudCBQcmV2aWV3PC90ZXh0Pjwvc3ZnPg==',
      },
    };
  }
}
