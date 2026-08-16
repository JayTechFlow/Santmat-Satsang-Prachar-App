// Sprint M6.5 — Vector Search Platform Test Suite

import { describe, it, expect } from 'vitest';
import { VectorSearchEngine } from './Vector/VectorSearchEngine';

describe('Sprint M6.5 Enterprise Vector Search Platform', () => {
  it('VectorSearchEngine indexes embeddings and executes cosine similarity search', async () => {
    const engine = new VectorSearchEngine();
    engine.indexMediaVector('audio_01', [0.1, 0.9, 0.2], { title: 'Kabir Bhajan' });
    engine.indexMediaVector('audio_02', [0.8, 0.1, 0.1], { title: 'Gita Pravachan' });

    const results = await engine.searchSimilarity([0.15, 0.85, 0.25], 1);
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('audio_01');
    expect(results[0].score).toBeGreaterThan(0.9);
  });
});
