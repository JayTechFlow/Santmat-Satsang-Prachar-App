// Sprint M7.2 — Recommendation Engine: RecommendationEngine Unit Tests

import { describe, it, expect, beforeEach } from 'vitest';
import { RecommendationEngine } from './RecommendationEngine';
import { MediaItem } from './SimilarityEngine';
import { MediaEventBus } from '../media-processing/Events/MediaProcessingEvents';

describe('RecommendationEngine', () => {
  let engine: RecommendationEngine;
  let eventBus: MediaEventBus;

  const catalog: MediaItem[] = [
    {
      id: 'media_101',
      title: 'Morning Kabir Satsang Pravachan',
      category: 'Satsang',
      language: 'Hindi',
      tags: ['kabir', 'morning', 'satsang'],
      eventId: 'bhandara_2026',
      eventName: 'Annual Bhandara 2026',
      speaker: 'Babaji',
      durationSeconds: 1800,
      publishedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    },
    {
      id: 'media_102',
      title: 'Evening Kabir Satsang Part 2',
      category: 'Satsang',
      language: 'Hindi',
      tags: ['kabir', 'evening', 'satsang'],
      eventId: 'bhandara_2026',
      eventName: 'Annual Bhandara 2026',
      speaker: 'Babaji',
      durationSeconds: 2400,
      publishedAt: new Date(Date.now() - 7200 * 1000).toISOString(),
    },
    {
      id: 'media_103',
      title: 'Spiritual Punjabi Bhajan Sangrah',
      category: 'Bhajan',
      language: 'Punjabi',
      tags: ['bhajan', 'punjabi', 'devotional'],
      speaker: 'Singer A',
      durationSeconds: 600,
      publishedAt: new Date(Date.now() - 86400 * 1000).toISOString(),
    },
    {
      id: 'media_104',
      title: 'English Satsang & Meditation Guide',
      category: 'Meditation',
      language: 'English',
      tags: ['meditation', 'english'],
      speaker: 'Guide B',
      durationSeconds: 1200,
      publishedAt: new Date(Date.now() - 43200 * 1000).toISOString(),
    },
  ];

  beforeEach(() => {
    eventBus = MediaEventBus.getInstance();
    engine = new RecommendationEngine(eventBus);
    engine.registerMedia(catalog);
  });

  it('1. Similar Media — should retrieve media similar to a target item', () => {
    const similar = engine.getSimilarMedia('media_101', { limit: 3 });
    expect(similar.length).toBeGreaterThan(0);
    expect(similar[0].media.id).toBe('media_102');
    expect(similar[0].reason).toContain('Similar to');
  });

  it('2. Personalized Recommendations — should generate hybrid recommendations for user', () => {
    engine.recordInteraction({
      userId: 'user_alpha',
      mediaId: 'media_101',
      type: 'complete',
      timestamp: new Date().toISOString(),
    });

    const recs = engine.getPersonalizedRecommendations('user_alpha', { limit: 5 });
    expect(recs.length).toBeGreaterThan(0);
  });

  it('3. Trending — should rank media by view velocity and decay', () => {
    // Record multiple plays for media_103
    engine.recordInteraction({ userId: 'u1', mediaId: 'media_103', type: 'play', timestamp: new Date().toISOString() });
    engine.recordInteraction({ userId: 'u2', mediaId: 'media_103', type: 'play', timestamp: new Date().toISOString() });
    engine.recordInteraction({ userId: 'u3', mediaId: 'media_103', type: 'like', timestamp: new Date().toISOString() });

    const trending = engine.getTrendingMedia({ limit: 4 });
    expect(trending.length).toBe(4);
    expect(trending[0].strategy).toBe('trending');
  });

  it('4. Continue Listening — should track partial playback progress', () => {
    engine.updatePlaybackProgress('user_beta', 'media_101', 600, 1800); // 33% progress
    engine.updatePlaybackProgress('user_beta', 'media_102', 2300, 2400); // 95.8% (completed)

    const continueList = engine.getContinueListening('user_beta');
    expect(continueList.length).toBe(1);
    expect(continueList[0].mediaId).toBe('media_101');
    expect(continueList[0].lastPositionSeconds).toBe(600);
  });

  it('5. Recently Viewed — should return user viewing history', () => {
    engine.recordInteraction({ userId: 'user_gamma', mediaId: 'media_101', type: 'view', timestamp: '2026-08-08T10:00:00Z' });
    engine.recordInteraction({ userId: 'user_gamma', mediaId: 'media_104', type: 'view', timestamp: '2026-08-08T11:00:00Z' });

    const recent = engine.getRecentlyViewed('user_gamma');
    expect(recent.length).toBe(2);
    expect(recent[0].media.id).toBe('media_104'); // Most recent first
    expect(recent[1].media.id).toBe('media_101');
  });

  it('6. Frequently Played Together — should find co-played items', () => {
    engine.recordInteraction({ userId: 'u10', mediaId: 'media_101', type: 'play', timestamp: new Date().toISOString() });
    engine.recordInteraction({ userId: 'u10', mediaId: 'media_102', type: 'play', timestamp: new Date().toISOString() });

    const freq = engine.getFrequentlyPlayedTogether('media_101', { limit: 2 });
    expect(freq.length).toBe(1);
    expect(freq[0].media.id).toBe('media_102');
  });

  it('7. Category Recommendation — should recommend media by category and user preference', () => {
    const satsangRecs = engine.getCategoryRecommendations('Satsang');
    expect(satsangRecs.length).toBeGreaterThan(0);
    expect(satsangRecs.every((r) => r.media.category === 'Satsang')).toBe(true);

    engine.recordInteraction({ userId: 'user_cat', mediaId: 'media_103', type: 'like', timestamp: new Date().toISOString() });
    const userCategories = engine.getRecommendedCategoriesForUser('user_cat');
    expect(userCategories).toContain('Bhajan');
  });

  it('8. Language Recommendation — should recommend media by language and user preference', () => {
    const punjabiRecs = engine.getLanguageRecommendations('Punjabi');
    expect(punjabiRecs.length).toBe(1);
    expect(punjabiRecs[0].media.language).toBe('Punjabi');

    const userLangs = engine.getRecommendedLanguagesForUser('user_cat');
    expect(userLangs.length).toBeGreaterThan(0);
  });

  it('9. Event Recommendation — should recommend media by eventId', () => {
    const eventRecs = engine.getEventRecommendations('bhandara_2026');
    expect(eventRecs.length).toBe(2);
    expect(eventRecs.every((r) => r.media.eventId === 'bhandara_2026')).toBe(true);
  });

  it('MediaEventBus Integration — should automatically ingest new media on ProcessingCompleted', () => {
    eventBus.publish({
      eventType: 'ProcessingCompleted',
      mediaId: 'media_bus_999',
      timestamp: new Date().toISOString(),
      data: {
        title: 'Auto Ingested Satsang',
        category: 'Satsang',
        language: 'Hindi',
        tags: ['auto', 'satsang'],
      },
    });

    const ingested = engine.getMedia('media_bus_999');
    expect(ingested).toBeDefined();
    expect(ingested?.title).toBe('Auto Ingested Satsang');
  });
});
