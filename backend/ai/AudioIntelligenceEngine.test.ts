// Sprint M6.2 — Audio Intelligence Test Suite

import { describe, it, expect } from 'vitest';
import { AudioIntelligenceEngine } from './Audio/AudioIntelligenceEngine';

describe('Sprint M6.2 Enterprise Audio Intelligence', () => {
  it('AudioIntelligenceEngine transcribes speech, detects language, diarizes speakers, and extracts emotion', async () => {
    const engine = new AudioIntelligenceEngine();
    const result = await engine.analyzeAudio('https://cdn.santmat.org/audio/pravachan_01.mp3');

    expect(result.transcription).toContain('Santmat Satsang Prachar');
    expect(result.detectedLanguage).toBe('hi-IN');
    expect(result.speakerCount).toBe(1);
    expect(result.emotion).toBe('devotional_calm');
  });
});
