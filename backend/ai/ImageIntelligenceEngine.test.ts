// Sprint M6.1 — Image Intelligence Test Suite

import { describe, it, expect } from 'vitest';
import { ImageIntelligenceEngine } from './Vision/ImageIntelligenceEngine';

describe('Sprint M6.1 Enterprise Image Intelligence', () => {
  it('ImageIntelligenceEngine performs label classification, color analysis, and face detection', async () => {
    const engine = new ImageIntelligenceEngine();
    const result = await engine.analyzeImage('https://cdn.santmat.org/banners/banner_01.jpg');

    expect(result.labels).toContain('satsang');
    expect(result.dominantColors.length).toBeGreaterThan(0);
    expect(result.facesDetected).toBe(1);
    expect(result.containsWatermark).toBe(false);
  });
});
