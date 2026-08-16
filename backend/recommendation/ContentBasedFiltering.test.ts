// Sprint M7.2 — Recommendation Engine: ContentBasedFiltering Unit Tests

import { describe, it, expect, beforeEach } from 'vitest';
import { ContentBasedFiltering } from './ContentBasedFiltering';
import { MediaItem } from './SimilarityEngine';

describe('ContentBasedFiltering', () => {
  let cbEngine: ContentBasedFiltering;

  const item1: MediaItem = {
    id: 'media_1',
    title: 'Kabir Satsang Part 1',
    category: 'Satsang',
    language: 'Hindi',
    tags: ['kabir', 'satsang'],
    speaker: 'Babaji',
    embedding: [0.1, 0.9, 0.2],
  };

  const item2: MediaItem = {
    id: 'media_2',
    title: 'Kabir Satsang Part 2',
    category: 'Satsang',
    language: 'Hindi',
    tags: ['kabir', 'satsang'],
    speaker: 'Babaji',
    embedding: [0.12, 0.88, 0.22],
  };

  const item3: MediaItem = {
    id: 'media_3',
    title: 'Punjabi Bhajan Express',
    category: 'Bhajan',
    language: 'Punjabi',
    tags: ['bhajan', 'punjabi'],
    speaker: 'Singer A',
    embedding: [-0.3, 0.1, 0.9],
  };

  beforeEach(() => {
    cbEngine = new ContentBasedFiltering();
    cbEngine.registerMedia([item1, item2, item3]);
  });

  it('should register media and retrieve correctly', () => {
    expect(cbEngine.getAllMedia().length).toBe(3);
    expect(cbEngine.getMedia('media_1')).toBeDefined();
  });

  it('should build user content profile from interactions', () => {
    cbEngine.recordUserInteraction({
      userId: 'user_1',
      mediaId: 'media_1',
      type: 'like',
      timestamp: new Date().toISOString(),
    });

    const profile = cbEngine.getUserProfile('user_1');
    expect(profile).toBeDefined();
    expect(profile?.categoryPreferences.get('Satsang')).toBeGreaterThan(0);
    expect(profile?.languagePreferences.get('Hindi')).toBeGreaterThan(0);
    expect(profile?.speakerPreferences.get('Babaji')).toBeGreaterThan(0);
  });

  it('should recommend content matching user preference profile', () => {
    cbEngine.recordUserInteraction({
      userId: 'user_1',
      mediaId: 'media_1',
      type: 'complete',
      timestamp: new Date().toISOString(),
    });

    const recs = cbEngine.recommendForUser('user_1', { limit: 5 });
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].media.id).toBe('media_2'); // Should recommend Kabir Satsang Part 2
    expect(recs[0].reason).toContain('Satsang');
  });

  it('should recommend similar media to a given item', () => {
    const similar = cbEngine.recommendSimilarMedia('media_1', { limit: 2 });
    expect(similar.length).toBe(2);
    expect(similar[0].media.id).toBe('media_2');
    expect(similar[0].reason).toContain('Similar to Kabir Satsang Part 1');
  });
});
