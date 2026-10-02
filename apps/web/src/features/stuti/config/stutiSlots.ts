/**
 * ============================================================================
 * Canonicical Stuti-Vinati TWO-SLOT product contract.
 * ============================================================================
 * EXACTLY TWO fixed product slots exist across Admin, Firestore and Android:
 *
 *   1. morning  -> Firestore doc `stuti-morning` (type: 'morning')
 *   2. evening  -> Firestore doc `stuti-evening` (type: 'evening')
 *
 * These identifiers are shared by the Admin CMS, the web service layer and the
 * Android app. No arbitrary stuti items may be created, deleted or re-ordered.
 * This module is the single source of truth for slot metadata and is fully
 * unit-testable (no React, no Firebase).
 */
import { StutiItem, StutiSlot } from '../../../types/common/index';

export interface StutiSlotMeta {
  type: StutiSlot;
  /** Canonical Firestore document id. */
  docId: string;
  /** Product label shown in Admin UI. */
  label: string;
  /** Fixed-slot marker. */
  fixedBadge: string;
  /** Short user-facing description. */
  description: string;
  /** Fallback presentation values (used only while a slot doc is missing). */
  defaultTitle: string;
  defaultSubtitle: string;
  defaultArtist: string;
  defaultQuote: string;
  defaultLyrics: string;
}

export const STUTI_SLOTS: readonly StutiSlotMeta[] = Object.freeze([
  Object.freeze({
    type: 'morning',
    docId: 'stuti-morning',
    label: 'प्रातःकालीन स्तुति',
    fixedBadge: 'FIXED PRODUCT SLOT',
    description: 'सुबह की प्रार्थना – नई ऊर्जा के साथ दिन का आरंभ',
    defaultTitle: 'प्रातःकालीन स्तुति पाठ',
    defaultSubtitle: 'सुबह की प्रार्थना – नई ऊर्जा के साथ',
    defaultArtist: 'संतमत सत्संग आश्रम',
    defaultQuote: 'प्रातः काल की यह स्तुति मन को पवित्र करती है।',
    defaultLyrics: '',
  }),
  Object.freeze({
    type: 'evening',
    docId: 'stuti-evening',
    label: 'संध्याकालीन स्तुति',
    fixedBadge: 'FIXED PRODUCT SLOT',
    description: 'शाम की प्रार्थना – आंतरिक शांति के साथ',
    defaultTitle: 'संध्याकालीन स्तुति पाठ',
    defaultSubtitle: 'शाम की प्रार्थना – आंतरिक शांति के साथ',
    defaultArtist: 'संतमत सत्संग आश्रम',
    defaultQuote: 'संध्या काल की यह स्तुति मन को शांत करती है।',
    defaultLyrics: '',
  }),
]) as unknown as readonly StutiSlotMeta[];

export const STUTI_SLOT_BY_TYPE: Readonly<Record<StutiSlot, StutiSlotMeta>> = Object.freeze({
  morning: STUTI_SLOTS[0],
  evening: STUTI_SLOTS[1],
});

/** True only for the two canonical slot types. Legacy types (binti/padya) are excluded. */
export function isStutiSlot(value: unknown): value is StutiSlot {
  return value === 'morning' || value === 'evening';
}

export function getStutiSlotMeta(slot: StutiSlot): StutiSlotMeta {
  return STUTI_SLOT_BY_TYPE[slot];
}

export function buildDefaultSlotStuti(slot: StutiSlot): StutiItem {
  const meta = getStutiSlotMeta(slot);
  return {
    id: meta.docId,
    type: slot,
    title: meta.defaultTitle,
    subtitle: meta.defaultSubtitle,
    artist: meta.defaultArtist,
    duration: '00:00',
    durationSeconds: 0,
    bannerImage: '',
    quote: meta.defaultQuote,
    lyrics: meta.defaultLyrics,
    audioUrl: '',
  };
}

/** Resolve a slot's canonical document from the active list (by docId, then type). */
export function resolveSlotStuti(stutis: readonly StutiItem[], slot: StutiSlot): StutiItem | undefined {
  const meta = getStutiSlotMeta(slot);
  return stutis.find((s) => s.id === meta.docId || s.type === slot);
}

/** Keep only records belonging to the two canonical slots. Legacy records are dropped. */
export function filterActiveStutis<T extends { type: unknown }>(docs: readonly T[]): T[] {
  return docs.filter((d) => isStutiSlot(d.type));
}