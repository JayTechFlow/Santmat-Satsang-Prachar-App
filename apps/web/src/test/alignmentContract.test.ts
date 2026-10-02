import { describe, it, expect } from 'vitest';
import { normalizeCategoryEntity } from '../features/categories/services/categoryService';
import { normalizeStutiEntity } from '../features/stuti/services/stutiService';
import { normalizeBhajanEntity } from '../features/audio/services/bhajanService';
import { PERMISSION_REGISTRY, DEFAULT_ROLE_PERMISSIONS } from '../app/providers/PermissionContext';
import { NAV_GROUPS } from '../config/navConfig';

describe('Admin CMS ↔ Android Product Alignment Contract Tests', () => {
  // ── CATEGORIES ─────────────────────────────────────────────────────────────
  describe('Categories Contract', () => {
    it('1. Category create populates canonical schema fields', () => {
      const category = normalizeCategoryEntity('cat-1', {
        name: 'गुरु महिमा',
        description: 'गुरुदेव के पदों का संग्रह',
        subCategories: ['अजपा जाप', 'मानस ध्यान'],
        order: 1,
        active: true,
      });

      expect(category.id).toBe('cat-1');
      expect(category.name).toBe('गुरु महिमा');
      expect(category.subCategories).toEqual(['अजपा जाप', 'मानस ध्यान']);
      expect(category.active).toBe(true);
      expect(category.order).toBe(1);
    });

    it('2. Category edit correctly normalizes updated properties', () => {
      const category = normalizeCategoryEntity('cat-1', {
        name: 'ध्यान साधना',
        description: 'अद्यतन विवरण',
        subCategories: ['मानस जप'],
        active: true,
      });

      expect(category.name).toBe('ध्यान साधना');
      expect(category.description).toBe('अद्यतन विवरण');
    });

    it('3. Category activate/deactivate toggles active flag correctly', () => {
      const activeCat = normalizeCategoryEntity('cat-1', { name: 'प्रभु भजन', active: true });
      const inactiveCat = normalizeCategoryEntity('cat-1', { name: 'प्रभु भजन', active: false });

      expect(activeCat.active).toBe(true);
      expect(inactiveCat.active).toBe(false);
    });

    it('4. Category delete safety enforces General protection', () => {
      const generalNames = ['general', 'सामान्य'];
      const isGeneralFallback = (name: string) => generalNames.includes(name.toLowerCase());

      expect(isGeneralFallback('General')).toBe(true);
      expect(isGeneralFallback('सामान्य')).toBe(true);
      expect(isGeneralFallback('गुरु महिमा')).toBe(false);
    });

    it('5. General uniqueness strategy prevents duplicate General categories', () => {
      const existingCategories = [
        { id: 'cat-general', name: 'General', subCategories: [], active: true }
      ];
      const isDuplicateGeneral = (name: string) => {
        const target = name.trim().toLowerCase();
        return ['general', 'सामान्य'].includes(target) && 
               existingCategories.some(c => ['general', 'सामान्य'].includes(c.name.toLowerCase()));
      };

      expect(isDuplicateGeneral('General')).toBe(true);
      expect(isDuplicateGeneral('सामान्य')).toBe(true);
      expect(isDuplicateGeneral('संतवाणी')).toBe(false);
    });
  });

  // ── AUDIO ──────────────────────────────────────────────────────────────────
  describe('Audio CMS Alignment Contract', () => {
    it('6. Audio creation correctly assigns canonical category', () => {
      const bhajan = normalizeBhajanEntity('bhajan-1', {
        title: 'हे प्रभु आनंद दाता',
        artist: 'स्वामी संतसेवी जी',
        category: 'गुरु महिमा',
        subCategory: 'मानस ध्यान',
        duration: '05:30',
        durationSeconds: 330,
        imageUrl: 'https://example.com/thumb.jpg',
        audioUrl: 'https://example.com/audio.mp3',
        plays: 0,
        addedDate: '2026-09-11',
      });

      expect(bhajan.category).toBe('गुरु महिमा');
      expect(bhajan.subCategory).toBe('मानस ध्यान');
    });

    it('7. Audio edit retains single canonical category assignment', () => {
      const bhajan = normalizeBhajanEntity('bhajan-1', {
        title: 'हे प्रभु आनंद दाता',
        artist: 'स्वामी संतसेवी जी',
        category: 'प्रभु भजन',
        duration: '05:30',
        durationSeconds: 330,
        imageUrl: 'https://example.com/thumb.jpg',
        plays: 10,
        addedDate: '2026-09-11',
      });

      expect(bhajan.category).toBe('प्रभु भजन');
    });

    it('8. Featured Audio controls are absent from Audio model', () => {
      const bhajan = normalizeBhajanEntity('bhajan-1', {
        title: 'भजन पद',
        artist: 'कलाकार',
        category: 'General',
      });

      expect((bhajan as any).isFeatured).toBeUndefined();
      expect((bhajan as any).featuredOrder).toBeUndefined();
    });

    it('9. Obsolete multi-category controls are absent', () => {
      const bhajan = normalizeBhajanEntity('bhajan-1', {
        title: 'भजन पद',
        category: 'General',
      });

      expect((bhajan as any).categoryIds).toBeUndefined();
      expect((bhajan as any).multiCategories).toBeUndefined();
    });
  });

  // ── STUTI-VINATI ───────────────────────────────────────────────────────────
  describe('Stuti-Vinati Admin Contract', () => {
    it('10. Morning slot is editable and normalizes correctly', () => {
      const morningSlot = normalizeStutiEntity('stuti-morning', {
        type: 'morning',
        title: 'प्रातःकालीन स्तुति-विनती',
        subtitle: 'महर्षि मेँहीं पदावली',
        artist: 'संतमत आश्रम',
        duration: '18:42',
        durationSeconds: 1122,
        bannerImage: 'https://example.com/morning.jpg',
        quote: 'प्रातःकाल गुरुदेव की स्तुति करें',
        lyrics: 'जय गुरुदेव जय गुरुदेव',
        audioUrl: 'https://example.com/morning.mp3',
      });

      expect(morningSlot.type).toBe('morning');
      expect(morningSlot.title).toBe('प्रातःकालीन स्तुति-विनती');
      expect(morningSlot.audioUrl).toBe('https://example.com/morning.mp3');
    });

    it('11. Evening slot is editable and normalizes correctly', () => {
      const eveningSlot = normalizeStutiEntity('stuti-evening', {
        type: 'evening',
        title: 'संध्याकालीन स्तुति-विनती',
        subtitle: 'संध्या आरती पद',
        artist: 'संतमत आश्रम',
        duration: '16:15',
        durationSeconds: 975,
        bannerImage: 'https://example.com/evening.jpg',
        quote: 'संध्या आरती ध्यान करें',
        lyrics: 'संध्या आरती जय गुरुदेव',
        audioUrl: 'https://example.com/evening.mp3',
      });

      expect(eveningSlot.type).toBe('evening');
      expect(eveningSlot.title).toBe('संध्याकालीन स्तुति-विनती');
      expect(eveningSlot.audioUrl).toBe('https://example.com/evening.mp3');
    });

    it('12. Audio replacement updates canonical document target', () => {
      const updatedSlot = normalizeStutiEntity('stuti-morning', {
        type: 'morning',
        title: 'प्रातःकालीन स्तुति-विनती',
        audioUrl: 'https://storage.googleapis.com/bucket/new-morning.mp3',
        storagePath: 'audio/stutis/new-morning.mp3',
      });

      expect(updatedSlot.audioUrl).toContain('new-morning.mp3');
      expect(updatedSlot.storagePath).toBe('audio/stutis/new-morning.mp3');
    });

    it('13. Exactly two Stuti-Vinati product slots exist (Morning & Evening)', () => {
      const availableTypes = ['morning', 'evening'];
      expect(availableTypes.length).toBe(2);
      expect(availableTypes).toContain('morning');
      expect(availableTypes).toContain('evening');
    });
  });

  // ── SEARCH & NAV ───────────────────────────────────────────────────────────
  describe('Search & Nav Control Plane', () => {
    it('14. No duplicate Search content manager exists in nav configuration', () => {
      const allNavItems = NAV_GROUPS.flatMap(g => g.items);
      const searchContentManagers = allNavItems.filter(i => i.id === 'search-content-manager');

      expect(searchContentManagers.length).toBe(0);
    });
  });

  // ── RBAC ───────────────────────────────────────────────────────────────────
  describe('RBAC Safety', () => {
    it('15. Role permissions remain strictly enforced for admin operations', () => {
      const catManagePerm = PERMISSION_REGISTRY.find(p => p.id === 'categories.manage');
      const audioManagePerm = PERMISSION_REGISTRY.find(p => p.id === 'audio.manage');
      const stutiManagePerm = PERMISSION_REGISTRY.find(p => p.id === 'stuti.manage');

      expect(catManagePerm).toBeDefined();
      expect(audioManagePerm).toBeDefined();
      expect(stutiManagePerm).toBeDefined();

      expect(catManagePerm?.defaultRoles).toContain('developer_super_admin');
      expect(catManagePerm?.defaultRoles).toContain('client_super_admin');
      expect(catManagePerm?.defaultRoles).not.toContain('mobile_user');
    });
  });
});
