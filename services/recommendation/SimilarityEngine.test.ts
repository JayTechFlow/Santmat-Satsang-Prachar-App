// Sprint M7.2 — Recommendation Engine: SimilarityEngine Unit Tests

import { describe, it, expect, beforeEach } from 'vitest';
import { SimilarityEngine, MediaItem } from './SimilarityEngine';

describe('SimilarityEngine', () => {
  let engine: SimilarityEngine;

  beforeEach(() => {
    engine = new SimilarityEngine();
  });

  it('should correctly calculate cosine similarity', () => {
    const v1 = [1, 0, 0];
    const v2 = [1, 0, 0];
    const v3 = [0, 1, 0];

    expect(engine.cosineSimilarity(v1, v2)).toBeCloseTo(1.0);
    expect(engine.cosineSimilarity(v1, v3)).toBeCloseTo(0.0);
    expect(engine.cosineSimilarity([], [1, 2, 3])).toBe(0);
  });

  it('should correctly calculate Jaccard similarity', () => {
    const setA = ['bhajan', 'satsang', 'morning'];
    const setB = ['bhajan', 'evening', 'satsang'];

    // Intersection: bhajan, satsang (2)
    // Union: bhajan, satsang, morning, evening (4)
    // Jaccard = 2 / 4 = 0.5
    expect(engine.jaccardSimilarity(setA, setB)).toBeCloseTo(0.5);
  });

  it('should correctly calculate Euclidean distance and similarity', () => {
    const v1 = [0, 0];
    const v2 = [3, 4]; // Dist = 5

    expect(engine.euclideanDistance(v1, v2)).toBe(5);
    expect(engine.euclideanSimilarity(v1, v2)).toBeCloseTo(1 / 6);
  });

  it('should correctly calculate Pearson correlation', () => {
    const a = [1, 2, 3, 4, 5];
    const b = [2, 4, 6, 8, 10]; // Perfect positive correlation

    expect(engine.pearsonCorrelation(a, b)).toBeCloseTo(1.0);
  });

  it('should compute text title similarity', () => {
    const titleA = 'Kabir Vani Morning Satsang';
    const titleB = 'Kabir Vani Evening Satsang';

    const sim = engine.computeTextSimilarity(titleA, titleB);
    expect(sim).toBeGreaterThan(0);
  });

  it('should compute metadata similarity between MediaItems', () => {
    const item1: MediaItem = {
      id: 'm1',
      title: 'Morning Satsang Pravachan',
      category: 'Satsang',
      language: 'Hindi',
      tags: ['satsang', 'kabir', 'morning'],
      speaker: 'Babaji',
      embedding: [0.2, 0.5, 0.8],
    };

    const item2: MediaItem = {
      id: 'm2',
      title: 'Evening Satsang Pravachan',
      category: 'Satsang',
      language: 'Hindi',
      tags: ['satsang', 'kabir', 'evening'],
      speaker: 'Babaji',
      embedding: [0.25, 0.48, 0.81],
    };

    const item3: MediaItem = {
      id: 'm3',
      title: 'English Meditation Guide',
      category: 'Meditation',
      language: 'English',
      tags: ['mindfulness', 'english'],
      speaker: 'John',
      embedding: [-0.5, 0.1, -0.2],
    };

    const sim12 = engine.computeMetadataSimilarity(item1, item2);
    const sim13 = engine.computeMetadataSimilarity(item1, item3);

    expect(sim12).toBeGreaterThan(sim13);
    expect(sim12).toBeGreaterThan(0.7);
  });

  it('should find top similar items from candidates', () => {
    const target: MediaItem = {
      id: 'target',
      title: 'Tulsi Das Bhajan Collection',
      category: 'Bhajan',
      language: 'Hindi',
      tags: ['bhajan', 'tulsi'],
    };

    const c1: MediaItem = {
      id: 'c1',
      title: 'Tulsi Ramcharitmanas Paath',
      category: 'Bhajan',
      language: 'Hindi',
      tags: ['bhajan', 'tulsi', 'paath'],
    };

    const c2: MediaItem = {
      id: 'c2',
      title: 'Random News',
      category: 'News',
      language: 'English',
      tags: ['news'],
    };

    const results = engine.findSimilarItems(target, [c1, c2]);
    expect(results.length).toBe(2);
    expect(results[0].media.id).toBe('c1');
    expect(results[0].score).toBeGreaterThan(results[1].score);
  });
});
