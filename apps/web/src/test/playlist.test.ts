import { describe, it, expect } from 'vitest';
import type { Playlist, PlaylistItem } from '../types/common/playlist.types';

describe('R6.1 Playlist Unit Tests', () => {
  it('should create valid playlist object with items count', () => {
    const item: PlaylistItem = {
      id: 'item-1',
      audioId: 'audio-101',
      title: 'Mangalacharan',
      order: 1,
      addedAt: new Date().toISOString(),
    };

    const playlist: Playlist = {
      id: 'pl-1',
      title: 'Daily Satsang',
      description: 'Morning Satsang audio collection',
      status: 'published',
      items: [item],
      itemCount: 1,
      createdBy: 'developer_super_admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(playlist.id).toBe('pl-1');
    expect(playlist.items).toHaveLength(1);
    expect(playlist.itemCount).toBe(1);
    expect(playlist.status).toBe('published');
  });

  it('should filter playlists by status correctly', () => {
    const playlists: Playlist[] = [
      { id: '1', title: 'P1', description: '', status: 'published', items: [], itemCount: 0, createdBy: 'admin', createdAt: '', updatedAt: '' },
      { id: '2', title: 'P2', description: '', status: 'draft', items: [], itemCount: 0, createdBy: 'admin', createdAt: '', updatedAt: '' },
    ];

    const published = playlists.filter((p) => p.status === 'published');
    expect(published).toHaveLength(1);
    expect(published[0].id).toBe('1');
  });
});
