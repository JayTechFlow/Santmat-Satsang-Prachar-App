// Sprint M7.2 — Recommendation Engine: CollaborativeFiltering Unit Tests

import { describe, it, expect, beforeEach } from 'vitest';
import { CollaborativeFiltering } from './CollaborativeFiltering';
import { MediaItem } from './SimilarityEngine';

describe('CollaborativeFiltering', () => {
  let cfEngine: CollaborativeFiltering;

  const mediaList: MediaItem[] = [
    { id: 'm1', title: 'Satsang A', category: 'Satsang', language: 'Hindi', tags: [] },
    { id: 'm2', title: 'Satsang B', category: 'Satsang', language: 'Hindi', tags: [] },
    { id: 'm3', title: 'Satsang C', category: 'Satsang', language: 'Hindi', tags: [] },
    { id: 'm4', title: 'Bhajan D', category: 'Bhajan', language: 'Hindi', tags: [] },
  ];

  beforeEach(() => {
    cfEngine = new CollaborativeFiltering();

    // User 1 listens to m1, m2
    cfEngine.recordInteraction({ userId: 'u1', mediaId: 'm1', type: 'play', timestamp: '2026-08-01' });
    cfEngine.recordInteraction({ userId: 'u1', mediaId: 'm2', type: 'play', timestamp: '2026-08-01' });

    // User 2 listens to m1, m2, m3
    cfEngine.recordInteraction({ userId: 'u2', mediaId: 'm1', type: 'play', timestamp: '2026-08-01' });
    cfEngine.recordInteraction({ userId: 'u2', mediaId: 'm2', type: 'play', timestamp: '2026-08-01' });
    cfEngine.recordInteraction({ userId: 'u2', mediaId: 'm3', type: 'play', timestamp: '2026-08-01' });
  });

  it('should calculate user similarity correctly', () => {
    const sim12 = cfEngine.computeUserSimilarity('u1', 'u2');
    // Intersection = m1, m2 (2)
    // Union = m1, m2, m3 (3)
    // Sim = 2/3 = 0.666
    expect(sim12).toBeCloseTo(2 / 3);
  });

  it('should generate user-based recommendations for unwatched items', () => {
    // User 1 hasn't listened to m3 yet. User 2 listened to m3.
    const recs = cfEngine.getUserBasedRecommendations('u1', mediaList, { limit: 5 });

    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].media.id).toBe('m3');
    expect(recs[0].strategy).toBe('collaborative');
  });

  it('should generate item-based co-occurrence recommendations', () => {
    const recs = cfEngine.getItemBasedRecommendations('u1', mediaList, { limit: 5 });

    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].media.id).toBe('m3');
  });

  it('should get frequently played together items for a target media', () => {
    const freq = cfEngine.getFrequentlyPlayedTogether('m1', mediaList, 5);

    expect(freq.length).toBe(2); // m2 and m3 were co-played with m1
    const ids = freq.map((f) => f.media.id);
    expect(ids).toContain('m2');
    expect(ids).toContain('m3');
  });
});
