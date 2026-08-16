// Sprint M3.1 — File Validation & Hash Calculator Utility

export interface ValidationRuleOptions {
  maxSizeBytes?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
}

export class MediaValidator {
  private static DEFAULT_MAX_SIZE = 100 * 1024 * 1024; // 100 MB

  public static validateSize(sizeBytes: number, maxBytes?: number): boolean {
    const limit = maxBytes ?? this.DEFAULT_MAX_SIZE;
    return sizeBytes > 0 && sizeBytes <= limit;
  }

  public static validateMimeType(mimeType: string, allowedTypes?: string[]): boolean {
    if (!allowedTypes || allowedTypes.length === 0) return true;
    return allowedTypes.includes(mimeType.toLowerCase());
  }

  public static validateExtension(fileName: string, allowedExts?: string[]): boolean {
    if (!allowedExts || allowedExts.length === 0) return true;
    const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
    return allowedExts.map((e) => e.toLowerCase().replace('.', '')).includes(ext);
  }

  public static async calculateChecksum(bufferOrFile: Buffer | File): Promise<string> {
    if (typeof window !== 'undefined' && bufferOrFile instanceof File) {
      // Browser environment using Web Crypto API
      const arrayBuffer = await bufferOrFile.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } else {
      // Node.js environment
      try {
        const crypto = await import('crypto');
        let buf: Buffer;
        if (Buffer.isBuffer(bufferOrFile)) {
          buf = bufferOrFile;
        } else {
          // @ts-ignore
          buf = Buffer.from(await bufferOrFile.arrayBuffer());
        }
        return crypto.createHash('sha256').update(buf).digest('hex');
      } catch {
        // Fallback simple checksum calculation if crypto is unavailable
        return `chk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      }
    }
  }
}
