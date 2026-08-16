// Sprint M3.5 — PDF Preview Generator (Page 1 Rasterization Abstraction)

import type { DocumentPreviewBundle, DocumentPreviewVariant } from '../Models/DocumentModels';

export class PdfPreviewGenerator {
  public static generatePdfPreviews(storagePath: string, totalPages: number): DocumentPreviewBundle {
    const pageNum = 1;

    const firstPagePreview: DocumentPreviewVariant = {
      label: 'firstPage',
      width: 600,
      height: 800,
      pageNumber: pageNum,
      sizeBytes: 45000,
      storagePath: `${storagePath}_page1_preview.png`,
    };

    const thumbnail: DocumentPreviewVariant = {
      label: 'thumbnail',
      width: 150,
      height: 200,
      pageNumber: pageNum,
      sizeBytes: 8192,
      storagePath: `${storagePath}_thumb.png`,
    };

    const mediumPreview: DocumentPreviewVariant = {
      label: 'medium',
      width: 450,
      height: 600,
      pageNumber: pageNum,
      sizeBytes: 28000,
      storagePath: `${storagePath}_med.png`,
    };

    const largePreview: DocumentPreviewVariant = {
      label: 'large',
      width: 900,
      height: 1200,
      pageNumber: pageNum,
      sizeBytes: 85000,
      storagePath: `${storagePath}_large.png`,
    };

    const responsivePreview: DocumentPreviewVariant = {
      label: 'responsive',
      width: 600,
      height: 800,
      pageNumber: pageNum,
      sizeBytes: 45000,
      dataUrlPlaceholder: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iODAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2YjcyODAiPlBERiBQYWdlIDEgUHJldmlldzwvdGV4dD48L3N2Zz4=',
    };

    return {
      firstPagePreview,
      thumbnail,
      mediumPreview,
      largePreview,
      responsivePreview,
    };
  }
}
