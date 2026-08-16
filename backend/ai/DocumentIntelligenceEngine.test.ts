// Sprint M6.4 — Document Intelligence Test Suite

import { describe, it, expect } from 'vitest';
import { DocumentIntelligenceEngine } from './Document/DocumentIntelligenceEngine';

describe('Sprint M6.4 Enterprise Document Intelligence', () => {
  it('DocumentIntelligenceEngine performs OCR, table extraction, and layout detection', async () => {
    const engine = new DocumentIntelligenceEngine();
    const result = await engine.analyzeDocument('https://cdn.santmat.org/docs/magazine_jan2026.pdf');

    expect(result.extractedText).toContain('Santmat Satsang Patrika');
    expect(result.tableCount).toBe(2);
    expect(result.formFields.author).toBe('Santmat Editorial Board');
    expect(result.isHandwritten).toBe(false);
  });
});
