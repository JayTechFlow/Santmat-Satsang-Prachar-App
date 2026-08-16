// Sprint M3.1 — Metadata Extractor Utility

export interface ExtractedMetadata {
  fileName: string;
  extension: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  modifiedAt: string;
  checksum: string;
  hash: string;
  // Placeholders for future codec/media extraction (M3.2+)
  dimensionsPlaceholder?: { width: number | null; height: number | null };
  durationPlaceholder?: number | null;
  codecPlaceholder?: string | null;
  resolutionPlaceholder?: string | null;
}

export class MetadataExtractor {
  public static async extract(
    fileName: string,
    mimeType: string,
    sizeBytes: number,
    checksum: string
  ): Promise<ExtractedMetadata> {
    const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
    const now = new Date().toISOString();

    return {
      fileName,
      extension: ext,
      mimeType,
      sizeBytes,
      createdAt: now,
      modifiedAt: now,
      checksum,
      hash: checksum,
      dimensionsPlaceholder: { width: null, height: null },
      durationPlaceholder: null,
      codecPlaceholder: null,
      resolutionPlaceholder: null,
    };
  }
}
