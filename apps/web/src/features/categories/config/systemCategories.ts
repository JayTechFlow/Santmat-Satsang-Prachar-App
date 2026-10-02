/**
 * ============================================================================
 * Santmat Satsang Prachar - Permanent System Categories Specification
 * ============================================================================
 * Canonical definition and protection rules for the 4 permanent system categories.
 * Aligns 1:1 with the Flutter mobile search category model.
 *
 * Fixed Order:
 * 1. सभी भजन (allBhajan) - Filter-only Sentinel (ALL published items)
 * 2. शाही भजनवाली (shahiBhajanavali) - Maps to production 'शाही भजनावली' & 'शाही भजनवाली'
 * 3. पदावली भजन (padavaliBhajan) - Matches 'पदावली भजन'
 * 4. स्वागत गीत (swagatGeet) - Matches 'स्वागत गीत'
 *
 * Custom categories created by administrators must ALWAYS appear AFTER these four.
 */

import { CategoryItem } from '../../../types/common/index';

export type SystemCategoryId = 'allBhajan' | 'shahiBhajanavali' | 'padavaliBhajan' | 'swagatGeet';

export interface SystemCategoryDefinition {
  id: SystemCategoryId;
  uiLabel: string;
  order: number;
  description: string;
  subCategories: string[];
  canonicalDataValues: string[];
  matchTokens: string[];
  isSystemCategory: true;
  isAllSentinel: boolean;
}

/**
 * 1. "सभी भजन" — ALL sentinel. No category restriction.
 * Filter/Search concept only; never stored on audio documents.
 */
export const ALL_BHAJAN_CATEGORY: SystemCategoryDefinition = {
  id: 'allBhajan',
  uiLabel: 'सभी भजन',
  order: 0,
  description: 'समस्त प्रकाशित भजन (बिना किसी श्रेणी प्रतिबंध के)',
  subCategories: [],
  canonicalDataValues: [],
  matchTokens: [],
  isSystemCategory: true,
  isAllSentinel: true,
};

/**
 * 2. "शाही भजनवाली" — maps to the existing production value "शाही भजनावली" & "शाही भजनवाली".
 */
export const SHAHI_BHAJANAVALI_CATEGORY: SystemCategoryDefinition = {
  id: 'shahiBhajanavali',
  uiLabel: 'शाही भजनवाली',
  order: 1,
  description: 'परम पूज्य शाही स्वामी जी महाराज के भक्ति पद एवं भजन संग्रह',
  subCategories: ['आरती एवं वंदना', 'गुरु महिमा', 'संत स्तुति'],
  canonicalDataValues: ['शाही भजनावली', 'शाही भजनवाली'],
  matchTokens: ['भजनावली', 'शाही'],
  isSystemCategory: true,
  isAllSentinel: false,
};

/**
 * 3. "पदावली भजन" — matches the existing production value "पदावली भजन".
 */
export const PADAVALI_BHAJAN_CATEGORY: SystemCategoryDefinition = {
  id: 'padavaliBhajan',
  uiLabel: 'पदावली भजन',
  order: 2,
  description: 'संत कबीर, महर्षि मेँहीं पदावली एवं अन्य पूज्य संतों के आध्यात्मिक पद',
  subCategories: ['मानस ध्यान', 'अजपा जाप', 'गुरु पद रज'],
  canonicalDataValues: ['पदावली भजन'],
  matchTokens: ['पदावली'],
  isSystemCategory: true,
  isAllSentinel: false,
};

/**
 * 4. "स्वागत गीत" — matches the existing production value "स्वागत गीत".
 */
export const SWAGAT_GEET_CATEGORY: SystemCategoryDefinition = {
  id: 'swagatGeet',
  uiLabel: 'स्वागत गीत',
  order: 3,
  description: 'सत्संग समारोह एवं पूज्य गुरुजन आगमन हेतु स्वागत एवं अभिनंदन गीत',
  subCategories: ['अभिनंदन पद', 'गुरु आगमन'],
  canonicalDataValues: ['स्वागत गीत'],
  matchTokens: ['स्वागत'],
  isSystemCategory: true,
  isAllSentinel: false,
};

/**
 * Exact list of the 4 permanent system categories in canonical order.
 */
export const SYSTEM_CATEGORIES: SystemCategoryDefinition[] = [
  ALL_BHAJAN_CATEGORY,
  SHAHI_BHAJANAVALI_CATEGORY,
  PADAVALI_BHAJAN_CATEGORY,
  SWAGAT_GEET_CATEGORY,
];

/**
 * Check whether a category ID is a permanent system category.
 */
export function isSystemCategoryId(id?: string | null): boolean {
  if (!id) return false;
  const normalized = id.trim().toLowerCase();
  return (
    normalized === 'allbhajan' ||
    normalized === 'shahibhajanavali' ||
    normalized === 'padavalibhajan' ||
    normalized === 'swagatgeet' ||
    normalized === 'all_bhajan' ||
    normalized === 'shahi_bhajanavali' ||
    normalized === 'padavali_bhajan' ||
    normalized === 'swagat_geet'
  );
}

/**
 * Check whether a category name/label matches any of the permanent system categories.
 */
export function isSystemCategoryName(name?: string | null): boolean {
  if (!name) return false;
  const trimmed = name.trim().toLowerCase();
  if (isSystemCategoryId(trimmed)) return true;

  for (const sysCat of SYSTEM_CATEGORIES) {
    if (sysCat.uiLabel.toLowerCase() === trimmed) return true;
    for (const val of sysCat.canonicalDataValues) {
      if (val.toLowerCase() === trimmed) return true;
    }
  }
  return false;
}

/**
 * Check whether a category ID or name represents the ALL sentinel ("सभी भजन").
 */
export function isAllSentinelCategory(idOrName?: string | null): boolean {
  if (!idOrName) return true; // empty / null means all
  const trimmed = idOrName.trim().toLowerCase();
  return (
    trimmed === '' ||
    trimmed === 'all' ||
    trimmed === 'allbhajan' ||
    trimmed === 'all_bhajan' ||
    trimmed === 'सभी भजन' ||
    trimmed === 'सभी'
  );
}

/**
 * Match a bhajan's stored category against a selected filter category.
 * Handles the production alias where stored document category is "शाही भजनावली"
 * while the UI label is "शाही भजनवाली".
 */
export function matchesBhajanCategory(
  bhajanCategory: string | undefined | null,
  selectedFilter: string | number | undefined | null
): boolean {
  // If no filter or "सभी भजन" (All sentinel) is selected, all items match
  if (selectedFilter === undefined || selectedFilter === null || selectedFilter === '') {
    return true;
  }

  const strFilter = String(selectedFilter).trim();
  if (isAllSentinelCategory(strFilter)) {
    return true;
  }

  const rawBhajanCat = (bhajanCategory || '').trim();
  if (!rawBhajanCat) {
    return false;
  }

  const trimmedFilter = strFilter;

  // If filtering by Shahi Bhajanavali
  if (
    trimmedFilter === SHAHI_BHAJANAVALI_CATEGORY.uiLabel ||
    trimmedFilter === SHAHI_BHAJANAVALI_CATEGORY.id ||
    SHAHI_BHAJANAVALI_CATEGORY.canonicalDataValues.includes(trimmedFilter)
  ) {
    return (
      SHAHI_BHAJANAVALI_CATEGORY.canonicalDataValues.some(
        (val) => val.toLowerCase() === rawBhajanCat.toLowerCase()
      ) ||
      rawBhajanCat.includes('भजनावली') ||
      rawBhajanCat.includes('भजनवाली')
    );
  }

  // If filtering by Padavali Bhajan
  if (
    trimmedFilter === PADAVALI_BHAJAN_CATEGORY.uiLabel ||
    trimmedFilter === PADAVALI_BHAJAN_CATEGORY.id ||
    PADAVALI_BHAJAN_CATEGORY.canonicalDataValues.includes(trimmedFilter)
  ) {
    return (
      PADAVALI_BHAJAN_CATEGORY.canonicalDataValues.some(
        (val) => val.toLowerCase() === rawBhajanCat.toLowerCase()
      ) ||
      rawBhajanCat.includes('पदावली')
    );
  }

  // If filtering by Swagat Geet
  if (
    trimmedFilter === SWAGAT_GEET_CATEGORY.uiLabel ||
    trimmedFilter === SWAGAT_GEET_CATEGORY.id ||
    SWAGAT_GEET_CATEGORY.canonicalDataValues.includes(trimmedFilter)
  ) {
    return (
      SWAGAT_GEET_CATEGORY.canonicalDataValues.some(
        (val) => val.toLowerCase() === rawBhajanCat.toLowerCase()
      ) ||
      rawBhajanCat.includes('स्वागत')
    );
  }

  // Custom Category match: exact or case-insensitive match
  return rawBhajanCat.toLowerCase() === trimmedFilter.toLowerCase();
}

/**
 * Sorts any list of categories guaranteeing that the 4 permanent system categories
 * appear FIRST in their exact fixed order (0..3), and all custom categories appear
 * strictly AFTER them (ordered by order, then name).
 */
export function sortCategoriesWithSystemFirst<T extends { id?: string; name: string; order?: number; isSystemCategory?: boolean }>(
  categories: T[]
): T[] {
  const getSystemOrder = (cat: T): number => {
    const id = (cat.id || '').trim().toLowerCase();
    const name = (cat.name || '').trim();

    if (id === 'allbhajan' || name === 'सभी भजन') return 0;
    if (id === 'shahibhajanavali' || name === 'शाही भजनवाली' || name === 'शाही भजनावली') return 1;
    if (id === 'padavalibhajan' || name === 'पदावली भजन') return 2;
    if (id === 'swagatgeet' || name === 'स्वागत गीत') return 3;
    return -1;
  };

  const systemList: { cat: T; order: number }[] = [];
  const customList: T[] = [];

  for (const cat of categories) {
    const sysOrder = getSystemOrder(cat);
    if (sysOrder >= 0) {
      systemList.push({ cat, order: sysOrder });
    } else {
      customList.push(cat);
    }
  }

  // Sort system categories by their fixed order 0..3
  systemList.sort((a, b) => a.order - b.order);

  // Sort custom categories by order (if set), otherwise by name
  customList.sort((a, b) => {
    const orderA = typeof a.order === 'number' ? a.order : 999;
    const orderB = typeof b.order === 'number' ? b.order : 999;
    if (orderA !== orderB) return orderA - orderB;
    return (a.name || '').localeCompare(b.name || '', 'hi');
  });

  return [...systemList.map((s) => s.cat), ...customList];
}

/**
 * Get categories that can be assigned to content (audio items).
 * Filters out "सभी भजन" (AllBhajan) which is a sentinel filter only.
 */
export function getCreatableCategories<T extends { id?: string; name: string; isAllSentinel?: boolean }>(
  categories: T[]
): T[] {
  return categories.filter((c) => {
    if (c.isAllSentinel) return false;
    const id = (c.id || '').trim().toLowerCase();
    const name = (c.name || '').trim();
    if (id === 'allbhajan' || name === 'सभी भजन') return false;
    return true;
  });
}

/**
 * Converts a SystemCategoryDefinition into a standard CategoryItem.
 */
export function systemCategoryToCategoryItem(def: SystemCategoryDefinition): CategoryItem {
  return {
    id: def.id,
    name: def.uiLabel,
    description: def.description,
    subCategories: [...def.subCategories],
    isFeatured: true,
    order: def.order,
    active: true,
    isSystemCategory: true,
    isAllSentinel: def.isAllSentinel,
    canonicalDataValues: def.canonicalDataValues,
    matchTokens: def.matchTokens,
  };
}
