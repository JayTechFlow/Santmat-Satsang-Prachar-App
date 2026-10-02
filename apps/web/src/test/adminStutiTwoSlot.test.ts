/**
 * ADMIN STUTI-VINATI — TWO-SLOT FIXED CMS CONTRACT TESTS
 * ============================================================================
 * Verifies the fixed two-slot product contract at the config/service level
 * (pure, no React/Firebase required):
 *
 *   1.  Exactly two slots exist.
 *   2.  Morning slot resolves/loads.
 *   3.  Evening slot resolves/loads.
 *   4.  No "Add Stuti" control/API exists.
 *   5.  No "Delete Stuti" control/API exists.
 *   6.  Morning editor target (canonical doc) is stable.
 *   7.  Evening editor target (canonical doc) is stable.
 *   8.  Morning audio replacement persists (normalization).
 *   9.  Evening audio replacement persists (normalization).
 *   10. Full metadata persists.
 *   11. Historical extra records do not appear in active UI.
 *   12. No duplicate slot creation.
 *   13. Reopening/page remount preserves both canonical slots.
 */
import { describe, it, expect } from 'vitest';
import {
  STUTI_SLOTS,
  STUTI_SLOT_BY_TYPE,
  isStutiSlot,
  getStutiSlotMeta,
  buildDefaultSlotStuti,
  resolveSlotStuti,
  filterActiveStutis,
} from '../features/stuti/config/stutiSlots';
import { stutiService, normalizeStutiEntity } from '../features/stuti/services/stutiService';

const slotTypes = () => STUTI_SLOTS.map((s) => s.type).sort();
const slotDocIds = () => STUTI_SLOTS.map((s) => s.docId);

describe('ADMIN STUTI-VINATI fixed two-slot contract', () => {
  it('1. Exactly two canonical slots exist (morning + evening)', () => {
    expect(STUTI_SLOTS.length).toBe(2);
    expect(slotTypes()).toEqual(['evening', 'morning']);
    expect(STUTI_SLOTS.map((s) => s.label)).toEqual(['प्रातःकालीन स्तुति', 'संध्याकालीन स्तुति']);
  });

  it('2. Morning slot resolves correctly', () => {
    const stutis = [
      normalizeStutiEntity('stuti-morning', { type: 'morning', title: 'मॉर्निंग', audioUrl: 'a.mp3' }),
      normalizeStutiEntity('stuti-evening', { type: 'evening', title: 'इवनिंग', audioUrl: 'b.mp3' }),
    ];
    expect(resolveSlotStuti(stutis, 'morning')).toBeDefined();
    expect(resolveSlotStuti(stutis, 'morning')?.id).toBe('stuti-morning');
    expect(getStutiSlotMeta('morning').docId).toBe('stuti-morning');
  });

  it('3. Evening slot resolves correctly', () => {
    const stutis = [
      normalizeStutiEntity('stuti-morning', { type: 'morning', title: 'मॉर्निंग' }),
      normalizeStutiEntity('stuti-evening', { type: 'evening', title: 'इवनिंग' }),
    ];
    expect(resolveSlotStuti(stutis, 'evening')).toBeDefined();
    expect(resolveSlotStuti(stutis, 'evening')?.id).toBe('stuti-evening');
    expect(getStutiSlotMeta('evening').docId).toBe('stuti-evening');
  });

  it('4. No dynamic "Add Stuti" API exists in the service or slot config', () => {
    expect((stutiService as any).createStuti).toBeUndefined();
    expect(Object.isFrozen(STUTI_SLOTS)).toBe(true);
    expect((STUTI_SLOTS as any).add).toBeUndefined();
    expect((STUTI_SLOTS as any).create).toBeUndefined();
  });

  it('5. No "Delete Stuti" API exists in the service or slot config', () => {
    expect((stutiService as any).deleteStuti).toBeUndefined();
    expect(STUTI_SLOTS.length).toBe(2);
    expect((STUTI_SLOTS as any).remove).toBeUndefined();
    expect((STUTI_SLOTS as any).delete).toBeUndefined();
  });

  it('6. Morning editor targets the canonical document (id/type/fields)', () => {
    const meta = getStutiSlotMeta('morning');
    expect(meta.docId).toBe('stuti-morning');
    expect(meta.type).toBe('morning');
    const fallback = buildDefaultSlotStuti('morning');
    expect(fallback.id).toBe('stuti-morning');
    expect(fallback.type).toBe('morning');
  });

  it('7. Evening editor targets the canonical document (id/type/fields)', () => {
    const meta = getStutiSlotMeta('evening');
    expect(meta.docId).toBe('stuti-evening');
    expect(meta.type).toBe('evening');
    const fallback = buildDefaultSlotStuti('evening');
    expect(fallback.id).toBe('stuti-evening');
    expect(fallback.type).toBe('evening');
  });

  it('8. Morning audio replacement persists (normalization keeps audioUrl + storagePath)', () => {
    const updated = normalizeStutiEntity('stuti-morning', {
      type: 'morning',
      audioUrl: 'https://example.com/new-morning.mp3',
      storagePath: 'audio/stutis/new-morning.mp3',
    });
    expect(updated.type).toBe('morning');
    expect(updated.audioUrl).toBe('https://example.com/new-morning.mp3');
    expect(updated.storagePath).toBe('audio/stutis/new-morning.mp3');
  });

  it('9. Evening audio replacement persists (normalization keeps audioUrl + storagePath)', () => {
    const updated = normalizeStutiEntity('stuti-evening', {
      type: 'evening',
      audioUrl: 'https://example.com/new-evening.mp3',
      storagePath: 'audio/stutis/new-evening.mp3',
    });
    expect(updated.type).toBe('evening');
    expect(updated.audioUrl).toBe('https://example.com/new-evening.mp3');
    expect(updated.storagePath).toBe('audio/stutis/new-evening.mp3');
  });

  it('10. Full slot metadata persists through normalization', () => {
    const slot = normalizeStutiEntity('stuti-morning', {
      type: 'morning',
      title: 'प्रातःकालीन स्तुति पाठ',
      subtitle: 'सुबह की प्रार्थना',
      artist: 'संतमत सत्संग आश्रम',
      duration: '08:45',
      durationSeconds: 525,
      bannerImage: 'https://example.com/banner.jpg',
      quote: 'प्रातः काल की यह स्तुति मन को पवित्र करती है।',
      lyrics: 'मंगल मूरति सतगुरु मिलवैं…',
    });
    expect(slot.title).toBe('प्रातःकालीन स्तुति पाठ');
    expect(slot.subtitle).toBe('सुबह की प्रार्थना');
    expect(slot.artist).toBe('संतमत सत्संग आश्रम');
    expect(slot.duration).toBe('08:45');
    expect(slot.durationSeconds).toBe(525);
    expect(slot.bannerImage).toBe('https://example.com/banner.jpg');
    expect(slot.quote).toContain('प्रातः काल');
    expect(slot.lyrics).toBe('मंगल मूरति सतगुरु मिलवैं…');
  });

  it('11. Historical/legacy records never appear in the active UI', () => {
    expect(isStutiSlot('binti')).toBe(false);
    expect(isStutiSlot('padya')).toBe(false);
    expect(isStutiSlot('aarti')).toBe(false);
    expect(isStutiSlot('kabir')).toBe(false);
    expect(isStutiSlot('morning')).toBe(true);
    expect(isStutiSlot('evening')).toBe(true);

    const activeOnly = filterActiveStutis([
      { type: 'binti' },
      { type: 'morning' },
      { type: 'padya' },
      { type: 'evening' },
    ]);
    expect(activeOnly).toHaveLength(2);
    expect(activeOnly.map((d) => d.type).sort()).toEqual(['evening', 'morning']);
  });

  it('12. No duplicate slot documents can be produced', () => {
    const ids = slotDocIds();
    expect(new Set(ids).size).toBe(2);
    expect(ids).toEqual(['stuti-morning', 'stuti-evening']);
    expect(getStutiSlotMeta('morning').docId).not.toBe(getStutiSlotMeta('evening').docId);
    expect(STUTI_SLOTS.map((s) => s.type)).toEqual(['morning', 'evening']);
  });

  it('13. Reopening/remounting the page preserves both canonical slots', () => {
    const first = STUTI_SLOT_BY_TYPE;
    const second = STUTI_SLOT_BY_TYPE;
    expect(Object.keys(first)).toHaveLength(2);
    expect(Object.keys(second).sort()).toEqual(['evening', 'morning']);
    expect(first.morning.docId).toBe(second.morning.docId);
    expect(first.evening.docId).toBe(second.evening.docId);
    expect(STUTI_SLOTS).toHaveLength(2);
  });
});