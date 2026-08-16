// Sprint M7.2 — Recommendation Engine: HybridRecommender Unit Tests

import { describe, it, expect, beforeEach } from 'vitest';
import { HybridRecommender } from './HybridRecommender';
import { ContentBasedFiltering } from './ContentBasedFiltering';
import { CollaborativeFiltering } from './CollaborativeFiltering';
import { MediaItem } from './SimilarityEngine';

describe('HybridRecommender', () => {
  let contentEngine: ContentBasedFiltering;
  let collabEngine: CollaborativeFiltering;
  let hybridRecommender: HybridRecommender;

  const mediaList: MediaItem[] = [
    { id: 'm1', title: 'Satsang A', category: 'Satsang', language: 'Hindi', tags: ['satsang'] },
    { id: 'm2', title: 'Satsang B', category: 'Satsang', language: 'Hindi', tags: ['satsang'] },
    { id: 'm3', title: 'Bhajan C', category: 'Bhajan', language: 'Hindi', tags: ['bhajan'] },
    { id: 'm4', title: 'Paath D', category: 'Paath', language: 'Hindi', tags: ['paath'] },
  ];

  beforeEach(() => {
    contentEngine = new ContentBasedFiltering();
    collabEngine = new CollaborativeFiltering();

    contentEngine.registerMedia(mediaList);

    // User 1 interactions
    contentEngine.recordUserInteraction({ userId: 'u1', mediaId: 'm1', type: 'play', timestamp: '2026-08-01' });
    contentEngine.recordUserInteraction({ userId: 'u1', mediaId: 'm2', type: 'like', timestamp: '2026-08-01' });

    collabEngine.recordInteraction({ userId: 'u1', mediaId: 'm1', type: 'play', timestamp: '2026-08-01' });
    collabEngine.recordInteraction({ userId: 'u1', mediaId: 'm2', type: 'like', timestamp: '2026-08-01' });

    // User 2 interactions
    collabEngine.recordInteraction({ userId: 'u2', mediaId: 'm1', type: 'play', timestamp: '2026-08-01' });
    collabEngine.recordInteraction({ userId: 'u2', mediaId: 'm2', type: 'like', timestamp: '2026-08-01' });
    collabEngine.recordInteraction({ userId: 'u2', mediaId: 'm3', type: 'complete', timestamp: '2026-08-01' });

    hybridRecommender = new HybridRecommender(contentEngine, collabEngine);
  });

  it('should fall back gracefully for cold-start user (0 interactions)', () => {
    const recs = hybridRecommender.recommend('cold_user', { limit: 3 });
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].reason).toContain('Recommended popular satsang content');
  });

  it('should generate hybrid recommendations blending content and collaborative scores', () => {
    const recs = hybridRecommender.recommend('u1', { limit: 5 });
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].strategy).toBe('hybrid');
  });
});
