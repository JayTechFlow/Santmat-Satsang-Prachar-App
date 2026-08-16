// Sprint M6.10 — Agent H: Search & Indexing Engine Unit Tests

import { describe, it, expect, beforeEach } from 'vitest';
import { SearchIndexingEngine, MediaDocument } from './SearchIndexingEngine';
import { MediaEventBus } from '../media-processing/Events/MediaProcessingEvents';

describe('Agent H — Search & Indexing Engine', () => {
  let searchEngine: SearchIndexingEngine;
  let customEventBus: MediaEventBus;

  beforeEach(() => {
    customEventBus = MediaEventBus.getInstance();
    searchEngine = new SearchIndexingEngine(customEventBus);
  });

  it('should connect to uploaded media events and index media on processing completed', async () => {
    customEventBus.publish({
      eventType: 'ProcessingCompleted',
      mediaId: 'media_event_101',
      timestamp: new Date().toISOString(),
      data: {
        title: 'Morning Satsang Satsang Bhajans',
        description: 'Inspiring spiritual discourses and bhajans by Maharishi',
        category: 'Bhajan',
        tags: ['bhajan', 'morning', 'satsang'],
        embedding: [0.1, 0.8, 0.2, 0.5],
      },
    });

    const media = searchEngine.getMediaById('media_event_101');
    expect(media).toBeDefined();
    expect(media?.title).toBe('Morning Satsang Satsang Bhajans');
    expect(media?.category).toBe('Bhajan');
    expect(media?.tags).toContain('bhajan');
  });

  it('should update full-text search index and allow querying by title and full-text', async () => {
    const doc1: MediaDocument = {
      id: 'doc_1',
      title: 'Kabir Vani Audio Satsang',
      description: 'Sacred verses of Sant Kabir',
      category: 'Satsang',
      tags: ['kabir', 'vani', 'audio'],
    };
    const doc2: MediaDocument = {
      id: 'doc_2',
      title: 'Shrimad Bhagavad Gita Chapter 2',
      description: 'Sankhya Yoga pravachan in Hindi',
      category: 'Pravachan',
      tags: ['gita', 'krishna', 'audio'],
    };

    searchEngine.indexMedia(doc1);
    searchEngine.indexMedia(doc2);

    const titleResults = await searchEngine.searchByTitle('Kabir Vani');
    expect(titleResults.length).toBeGreaterThanOrEqual(1);
    expect(titleResults[0].id).toBe('doc_1');
    expect(titleResults[0].matchDetails?.fullTextScore).toBeGreaterThan(0);
  });

  it('should update media tags index and allow querying by tags', async () => {
    searchEngine.indexMedia({
      id: 'doc_tags_1',
      title: 'Stuti Vinati Sangrah',
      category: 'Stuti',
      tags: ['stuti', 'vinati', 'daily_prayer'],
    });

    searchEngine.indexMedia({
      id: 'doc_tags_2',
      title: 'Evening Prayer Vinati',
      category: 'Stuti',
      tags: ['vinati', 'evening'],
    });

    const tagResults = await searchEngine.searchByTags(['vinati']);
    expect(tagResults.length).toBe(2);
    const ids = tagResults.map((r) => r.id);
    expect(ids).toContain('doc_tags_1');
    expect(ids).toContain('doc_tags_2');

    const popularTags = searchEngine.getPopularTags();
    expect(popularTags.find((p) => p.tag === 'vinati')?.count).toBe(2);
  });

  it('should update category index and allow querying by categories', async () => {
    searchEngine.indexMedia({
      id: 'cat_doc_1',
      title: 'Santmat Book Volume 1',
      category: 'Book',
      tags: ['santmat', 'pdf'],
    });

    searchEngine.indexMedia({
      id: 'cat_doc_2',
      title: 'Santmat Discourse Audio',
      category: 'Audio',
      tags: ['audio', 'satsang'],
    });

    const catResults = await searchEngine.searchByCategories(['Book']);
    expect(catResults.length).toBe(1);
    expect(catResults[0].id).toBe('cat_doc_1');
  });

  it('should update vector index / embeddings and allow querying by similarity', async () => {
    const vec1 = [0.9, 0.1, 0.0, 0.0];
    const vec2 = [0.85, 0.15, 0.0, 0.0];
    const vec3 = [0.0, 0.1, 0.9, 0.8];

    searchEngine.indexMedia({
      id: 'sim_1',
      title: 'Meditation Discourse 1',
      category: 'Dhyan',
      tags: ['meditation'],
      embedding: vec1,
    });

    searchEngine.indexMedia({
      id: 'sim_2',
      title: 'Meditation Discourse 2',
      category: 'Dhyan',
      tags: ['meditation'],
      embedding: vec2,
    });

    searchEngine.indexMedia({
      id: 'sim_3',
      title: 'Devotional Music Bhajan',
      category: 'Music',
      tags: ['bhajan'],
      embedding: vec3,
    });

    // Query similarity using vector
    const simResults = await searchEngine.searchBySimilarity([0.9, 0.1, 0.0, 0.0], 2);
    expect(simResults.length).toBe(2);
    expect(simResults[0].id).toBe('sim_1');
    expect(simResults[1].id).toBe('sim_2');

    // Query similarity using mediaId
    const mediaSimResults = await searchEngine.searchBySimilarity('sim_1', 2);
    expect(mediaSimResults.length).toBe(2);
    expect(mediaSimResults[0].id).toBe('sim_1');
  });

  it('should update recommendation engine data structures and compute similar content recommendations', () => {
    searchEngine.indexMedia({
      id: 'rec_1',
      title: 'Guru Bhakti Satsang Part 1',
      category: 'Bhakti',
      tags: ['guru', 'bhakti', 'satsang'],
      embedding: [0.5, 0.5, 0.0, 0.0],
    });

    searchEngine.indexMedia({
      id: 'rec_2',
      title: 'Guru Bhakti Satsang Part 2',
      category: 'Bhakti',
      tags: ['guru', 'bhakti', 'part2'],
      embedding: [0.48, 0.52, 0.0, 0.0],
    });

    searchEngine.indexMedia({
      id: 'rec_3',
      title: 'Unrelated Technical Manual',
      category: 'Docs',
      tags: ['manual'],
      embedding: [0.0, 0.0, 0.9, 0.9],
    });

    const recommendations = searchEngine.getRecommendations('rec_1', 2);
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].id).toBe('rec_2');
    expect(recommendations[0].reason).toContain('Bhakti');
  });
});
