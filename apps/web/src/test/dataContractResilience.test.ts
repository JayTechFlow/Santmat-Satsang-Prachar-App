import { describe, it, expect } from 'vitest';
import { normalizeBhajanEntity } from '../features/audio/services/bhajanService';
import { normalizeStutiEntity } from '../features/stuti/services/stutiService';
import { normalizeSuvicharEntity } from '../services/shared/suvicharService';
import { normalizeCategoryEntity } from '../features/categories/services/categoryService';
import { normalizeBookEntity } from '../features/books/services/bookService';
import { normalizeNotificationEntity } from '../features/notifications/services/notificationService';
import { normalizePlaylistEntity } from '../features/playlists/services/playlistService';

describe('Data Contract Resilience & Normalization Tests', () => {
  describe('normalizeBhajanEntity', () => {
    it('should handle undefined and null fields gracefully', () => {
      const result = normalizeBhajanEntity('bhajan-1', {
        title: null,
        artist: undefined,
        category: null,
        duration: undefined,
        durationSeconds: null,
        plays: undefined,
      });

      expect(result.id).toBe('bhajan-1');
      expect(result.title).toBe('');
      expect(result.artist).toBe('');
      expect(result.category).toBe('');
      expect(result.duration).toBe('00:00');
      expect(result.durationSeconds).toBe(0);
      expect(result.plays).toBe(0);
      expect(result.type).toBe('भजन');
      expect(result.status).toBe('प्रकाशित');
    });

    it('should treat empty subCategory as undefined (no forced default)', () => {
      expect(normalizeBhajanEntity('bhajan-1', { subCategory: '' }).subCategory).toBeUndefined();
      expect(normalizeBhajanEntity('bhajan-1', { subCategory: null }).subCategory).toBeUndefined();
      expect(normalizeBhajanEntity('bhajan-1', { subCategory: undefined }).subCategory).toBeUndefined();
    });

    it('should treat whitespace-only subCategory as falsy-empty', () => {
      expect(normalizeBhajanEntity('bhajan-1', { subCategory: '   ' }).subCategory).toBe('');
    });

    it('should keep a real subCategory after trimming', () => {
      expect(normalizeBhajanEntity('bhajan-1', { subCategory: '  भक्ति  ' }).subCategory).toBe('भक्ति');
    });
  });

  describe('normalizeStutiEntity', () => {
    it('should handle wrong type, legacy fields (textContent), and missing fields', () => {
      const result = normalizeStutiEntity('stuti-1', {
        type: 'binti', // legacy type — not part of the two-slot product contract
        title: null,
        textContent: 'हे प्रभु आनंद दाता', // legacy field for lyrics
        bannerImage: undefined,
      });

      expect(result.id).toBe('stuti-1');
      // Legacy types are no longer preserved; the active contract is morning/evening only.
      expect(result.type).toBe('morning');
      expect(result.title).toBe('');
      expect(result.lyrics).toBe('हे प्रभु आनंद दाता');
      expect(result.bannerImage).toBe('');
    });
  });

  describe('normalizeSuvicharEntity', () => {
    it('should support legacy content mapping to quote, and fall back theme/author', () => {
      const result = normalizeSuvicharEntity('suvichar-1', {
        content: 'सत्य ही ईश्वर है', // legacy content field
        author: null,
        theme: undefined,
      });

      expect(result.id).toBe('suvichar-1');
      expect(result.quote).toBe('सत्य ही ईश्वर है');
      expect(result.author).toBe('संत वाणी');
      expect(result.theme).toBe('सत्संग विचार');
    });
  });

  describe('normalizeCategoryEntity', () => {
    it('should handle empty/missing subcategories array and undefined flags', () => {
      const result = normalizeCategoryEntity('cat-1', {
        name: 'पदावली',
        subCategories: null,
        isFeatured: undefined,
      });

      expect(result.id).toBe('cat-1');
      expect(result.name).toBe('पदावली');
      expect(result.subCategories).toEqual([]);
      expect(result.isFeatured).toBeUndefined();
    });
  });

  describe('normalizeBookEntity', () => {
    it('should map pages count and default status correctly', () => {
      const result = normalizeBookEntity('book-1', {
        title: 'सत्यार्थ प्रकाश',
        pagesCount: '125', // wrong type (string instead of number)
        status: undefined,
        language: '  हिंदी ',
        description: '  धार्मिक पुस्तक विवरण  ',
      });

      expect(result.id).toBe('book-1');
      expect(result.title).toBe('सत्यार्थ प्रकाश');
      expect(result.pagesCount).toBe(125);
      expect(result.status).toBe('published');
      expect(result.language).toBe('हिंदी');
      expect(result.description).toBe('धार्मिक पुस्तक विवरण');
    });
  });

  describe('normalizeNotificationEntity', () => {
    it('should fall back type and default read state', () => {
      const result = normalizeNotificationEntity('notif-1', {
        title: 'Notification',
        type: 'unknown',
        isRead: null,
      });

      expect(result.id).toBe('notif-1');
      expect(result.type).toBe('special');
      expect(result.isRead).toBe(false);
    });
  });

  describe('normalizePlaylistEntity', () => {
    it('should safeguard bhajanIds empty arrays and default visibility', () => {
      const result = normalizePlaylistEntity('playlist-1', {
        name: 'My Satsang',
        bhajanIds: undefined,
        visibility: null,
      });

      expect(result.id).toBe('playlist-1');
      expect(result.name).toBe('My Satsang');
      expect(result.bhajanIds).toEqual([]);
      expect(result.visibility).toBe('public');
    });
  });
});
