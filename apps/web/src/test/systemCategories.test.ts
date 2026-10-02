/**
 * ============================================================================
 * Santmat Satsang Prachar - Permanent 4-Category System Tests (Admin Web)
 * ============================================================================
 * Verifies canonical system category definitions, exact 4-category order,
 * 'सभी भजन' sentinel semantics, backward-compatible matching ('शाही भजनावली'),
 * custom category positioning, creatable category filtering, and administrative
 * protection guards against deletion and renaming.
 */
import { describe, it, expect } from 'vitest';
import {
  SYSTEM_CATEGORIES,
  ALL_BHAJAN_CATEGORY,
  SHAHI_BHAJANAVALI_CATEGORY,
  PADAVALI_BHAJAN_CATEGORY,
  SWAGAT_GEET_CATEGORY,
  isSystemCategoryId,
  isSystemCategoryName,
  isAllSentinelCategory,
  matchesBhajanCategory,
  sortCategoriesWithSystemFirst,
  getCreatableCategories,
  systemCategoryToCategoryItem,
} from '../features/categories/config/systemCategories';
import {
  normalizeCategoryEntity,
  mergeCategoriesWithSystem,
  categoryService,
} from '../features/categories/services/categoryService';
import { CategoryEntity } from '../types/common';

describe('Permanent 4-Category System Specifications (Web Admin)', () => {
  describe('Canonical Definitions and Exact Order', () => {
    it('must define exactly four permanent system categories in canonical order', () => {
      expect(SYSTEM_CATEGORIES).toHaveLength(4);

      expect(SYSTEM_CATEGORIES[0].id).toBe('allBhajan');
      expect(SYSTEM_CATEGORIES[0].uiLabel).toBe('सभी भजन');
      expect(SYSTEM_CATEGORIES[0].order).toBe(0);
      expect(SYSTEM_CATEGORIES[0].isAllSentinel).toBe(true);
      expect(SYSTEM_CATEGORIES[0].isSystemCategory).toBe(true);

      expect(SYSTEM_CATEGORIES[1].id).toBe('shahiBhajanavali');
      expect(SYSTEM_CATEGORIES[1].uiLabel).toBe('शाही भजनवाली');
      expect(SYSTEM_CATEGORIES[1].order).toBe(1);
      expect(SYSTEM_CATEGORIES[1].canonicalDataValues).toContain('शाही भजनावली');
      expect(SYSTEM_CATEGORIES[1].canonicalDataValues).toContain('शाही भजनवाली');
      expect(SYSTEM_CATEGORIES[1].isAllSentinel).toBe(false);
      expect(SYSTEM_CATEGORIES[1].isSystemCategory).toBe(true);

      expect(SYSTEM_CATEGORIES[2].id).toBe('padavaliBhajan');
      expect(SYSTEM_CATEGORIES[2].uiLabel).toBe('पदावली भजन');
      expect(SYSTEM_CATEGORIES[2].order).toBe(2);
      expect(SYSTEM_CATEGORIES[2].canonicalDataValues).toContain('पदावली भजन');
      expect(SYSTEM_CATEGORIES[2].isAllSentinel).toBe(false);
      expect(SYSTEM_CATEGORIES[2].isSystemCategory).toBe(true);

      expect(SYSTEM_CATEGORIES[3].id).toBe('swagatGeet');
      expect(SYSTEM_CATEGORIES[3].uiLabel).toBe('स्वागत गीत');
      expect(SYSTEM_CATEGORIES[3].order).toBe(3);
      expect(SYSTEM_CATEGORIES[3].canonicalDataValues).toContain('स्वागत गीत');
      expect(SYSTEM_CATEGORIES[3].isAllSentinel).toBe(false);
      expect(SYSTEM_CATEGORIES[3].isSystemCategory).toBe(true);
    });
  });

  describe('Sorting and Ordering Guarantee (sortCategoriesWithSystemFirst)', () => {
    it('should always place system categories 0..3 first regardless of input order', () => {
      const reversedInput = [
        { id: 'swagatGeet', name: 'स्वागत गीत' },
        { id: 'custom-1', name: 'गुरु महिमा', order: 10 },
        { id: 'allBhajan', name: 'सभी भजन' },
        { id: 'padavaliBhajan', name: 'पदावली भजन' },
        { id: 'custom-2', name: 'आरती संग्रह', order: 5 },
        { id: 'shahiBhajanavali', name: 'शाही भजनवाली' },
      ];

      const sorted = sortCategoriesWithSystemFirst(reversedInput);

      expect(sorted[0].name).toBe('सभी भजन');
      expect(sorted[1].name).toBe('शाही भजनवाली');
      expect(sorted[2].name).toBe('पदावली भजन');
      expect(sorted[3].name).toBe('स्वागत गीत');

      // Custom categories follow afterwards, ordered by order field
      expect(sorted[4].name).toBe('आरती संग्रह');
      expect(sorted[5].name).toBe('गुरु महिमा');
    });

    it('should sort custom categories without order alphabetically', () => {
      const input = [
        { id: 'custom-b', name: 'बी श्रेणी' },
        { id: 'allBhajan', name: 'सभी भजन' },
        { id: 'custom-a', name: 'ए श्रेणी' },
        { id: 'swagatGeet', name: 'स्वागत गीत' },
        { id: 'padavaliBhajan', name: 'पदावली भजन' },
        { id: 'shahiBhajanavali', name: 'शाही भजनवाली' },
      ];

      const sorted = sortCategoriesWithSystemFirst(input);

      expect(sorted[0].name).toBe('सभी भजन');
      expect(sorted[1].name).toBe('शाही भजनवाली');
      expect(sorted[2].name).toBe('पदावली भजन');
      expect(sorted[3].name).toBe('स्वागत गीत');
      expect(sorted[4].name).toBe('ए श्रेणी');
      expect(sorted[5].name).toBe('बी श्रेणी');
    });
  });

  describe('Category Identification Helpers', () => {
    it('isSystemCategoryId should accurately detect canonical and variant IDs', () => {
      expect(isSystemCategoryId('allBhajan')).toBe(true);
      expect(isSystemCategoryId('all_bhajan')).toBe(true);
      expect(isSystemCategoryId('shahiBhajanavali')).toBe(true);
      expect(isSystemCategoryId('padavaliBhajan')).toBe(true);
      expect(isSystemCategoryId('swagatGeet')).toBe(true);
      expect(isSystemCategoryId('customCategory123')).toBe(false);
      expect(isSystemCategoryId('')).toBe(false);
      expect(isSystemCategoryId(null)).toBe(false);
    });

    it('isSystemCategoryName should recognize system category labels', () => {
      expect(isSystemCategoryName('सभी भजन')).toBe(true);
      expect(isSystemCategoryName('शाही भजनवाली')).toBe(true);
      expect(isSystemCategoryName('शाही भजनावली')).toBe(true); // backward compatibility alias
      expect(isSystemCategoryName('पदावली भजन')).toBe(true);
      expect(isSystemCategoryName('स्वागत गीत')).toBe(true);
      expect(isSystemCategoryName('कस्टम भजन')).toBe(false);
    });

    it('isAllSentinelCategory should recognize all-bhajan sentinel indicators', () => {
      expect(isAllSentinelCategory('')).toBe(true);
      expect(isAllSentinelCategory(null)).toBe(true);
      expect(isAllSentinelCategory('all')).toBe(true);
      expect(isAllSentinelCategory('allBhajan')).toBe(true);
      expect(isAllSentinelCategory('सभी भजन')).toBe(true);
      expect(isAllSentinelCategory('शाही भजनवाली')).toBe(false);
    });
  });

  describe('Audio/Bhajan Matching & Backward Compatibility (matchesBhajanCategory)', () => {
    it('should return true for all tracks when sentinel / empty filter is selected', () => {
      expect(matchesBhajanCategory('शाही भजनावली', '')).toBe(true);
      expect(matchesBhajanCategory('पदावली भजन', 'सभी भजन')).toBe(true);
      expect(matchesBhajanCategory('general', 'allBhajan')).toBe(true);
      expect(matchesBhajanCategory('custom', null)).toBe(true);
    });

    it('should match existing production tracks stored with "शाही भजनावली" when filtering by "शाही भजनवाली"', () => {
      // Production documents store 'category: "शाही भजनावली"'
      expect(matchesBhajanCategory('शाही भजनावली', 'शाही भजनवाली')).toBe(true);
      expect(matchesBhajanCategory('शाही भजनावली', 'shahiBhajanavali')).toBe(true);
      expect(matchesBhajanCategory('शाही भजनवाली', 'शाही भजनवाली')).toBe(true);
      // Negative check
      expect(matchesBhajanCategory('पदावली भजन', 'शाही भजनवाली')).toBe(false);
    });

    it('should match Padavali Bhajan tracks', () => {
      expect(matchesBhajanCategory('पदावली भजन', 'पदावली भजन')).toBe(true);
      expect(matchesBhajanCategory('पदावली भजन', 'padavaliBhajan')).toBe(true);
      expect(matchesBhajanCategory('मेँहीं पदावली', 'पदावली भजन')).toBe(true);
      expect(matchesBhajanCategory('शाही भजनावली', 'पदावली भजन')).toBe(false);
    });

    it('should match Swagat Geet tracks', () => {
      expect(matchesBhajanCategory('स्वागत गीत', 'स्वागत गीत')).toBe(true);
      expect(matchesBhajanCategory('स्वागत गीत', 'swagatGeet')).toBe(true);
      expect(matchesBhajanCategory('गुरु स्वागत', 'स्वागत गीत')).toBe(true);
      expect(matchesBhajanCategory('पदावली भजन', 'स्वागत गीत')).toBe(false);
    });

    it('should match custom categories accurately', () => {
      expect(matchesBhajanCategory('आरती', 'आरती')).toBe(true);
      expect(matchesBhajanCategory('आरती', 'आरती ')).toBe(true);
      expect(matchesBhajanCategory('आरती', 'भजन')).toBe(false);
    });
  });

  describe('Creatable Categories (Exclusion of AllBhajan Sentinel)', () => {
    it('getCreatableCategories must exclude "सभी भजन" so tracks cannot be assigned to sentinel', () => {
      const mixed = sortCategoriesWithSystemFirst([
        systemCategoryToCategoryItem(ALL_BHAJAN_CATEGORY),
        systemCategoryToCategoryItem(SHAHI_BHAJANAVALI_CATEGORY),
        systemCategoryToCategoryItem(PADAVALI_BHAJAN_CATEGORY),
        systemCategoryToCategoryItem(SWAGAT_GEET_CATEGORY),
        { id: 'custom-1', name: 'विशेष सत्संग', subCategories: [] },
      ]);

      const creatable = getCreatableCategories(mixed);

      expect(creatable.some((c) => c.name === 'सभी भजन' || c.id === 'allBhajan')).toBe(false);
      expect(creatable).toHaveLength(4);
      expect(creatable[0].name).toBe('शाही भजनवाली');
      expect(creatable[1].name).toBe('पदावली भजन');
      expect(creatable[2].name).toBe('स्वागत गीत');
      expect(creatable[3].name).toBe('विशेष सत्संग');
    });
  });

  describe('CategoryService Normalization & Merging', () => {
    it('normalizeCategoryEntity should set system properties for system categories', () => {
      const shahi = normalizeCategoryEntity('shahiBhajanavali', {
        name: 'शाही भजनवाली',
        description: 'शाही स्वामी जी भजन',
        subCategories: ['आरती'],
      });

      expect(shahi.id).toBe('shahiBhajanavali');
      expect(shahi.name).toBe('शाही भजनवाली');
      expect(shahi.isSystemCategory).toBe(true);
      expect(shahi.isAllSentinel).toBe(false);
      expect(shahi.active).toBe(true);
      expect(shahi.subCategories).toContain('आरती');
    });

    it('mergeCategoriesWithSystem should seed all 4 system categories even if Firestore is empty', () => {
      const merged = mergeCategoriesWithSystem([]);

      expect(merged).toHaveLength(4);
      expect(merged[0].name).toBe('सभी भजन');
      expect(merged[1].name).toBe('शाही भजनवाली');
      expect(merged[2].name).toBe('पदावली भजन');
      expect(merged[3].name).toBe('स्वागत गीत');
    });

    it('mergeCategoriesWithSystem should merge existing custom categories after the 4 system categories', () => {
      const firestoreDocs: CategoryEntity[] = [
        {
          id: 'custom-cat-1',
          name: 'प्राणायाम एवं ध्यान',
          subCategories: ['नादानुसंधान'],
          active: true,
          order: 10,
        },
      ];

      const merged = mergeCategoriesWithSystem(firestoreDocs);

      expect(merged).toHaveLength(5);
      expect(merged[0].name).toBe('सभी भजन');
      expect(merged[1].name).toBe('शाही भजनवाली');
      expect(merged[2].name).toBe('पदावली भजन');
      expect(merged[3].name).toBe('स्वागत गीत');
      expect(merged[4].name).toBe('प्राणायाम एवं ध्यान');
    });
  });

  describe('Administrative Protection Guards', () => {
    it('deleteCategory must block deletion of system category IDs', async () => {
      const resAll = await categoryService.deleteCategory('allBhajan');
      expect(resAll.success).toBe(false);
      expect(resAll.error).toContain('हटाया नहीं जा सकता');

      const resShahi = await categoryService.deleteCategory('shahiBhajanavali');
      expect(resShahi.success).toBe(false);

      const resPadavali = await categoryService.deleteCategory('padavaliBhajan');
      expect(resPadavali.success).toBe(false);

      const resSwagat = await categoryService.deleteCategory('swagatGeet');
      expect(resSwagat.success).toBe(false);
    });

    it('addCategory must reject creating categories with system names', async () => {
      const res1 = await categoryService.addCategory({
        name: 'सभी भजन',
        subCategories: [],
      });
      expect(res1.success).toBe(false);
      expect(res1.error).toContain('स्थायी सिस्टम श्रेणी');

      const res2 = await categoryService.addCategory({
        name: 'शाही भजनवाली',
        subCategories: [],
      });
      expect(res2.success).toBe(false);

      const res3 = await categoryService.addCategory({
        name: 'पदावली भजन',
        subCategories: [],
      });
      expect(res3.success).toBe(false);

      const res4 = await categoryService.addCategory({
        name: 'स्वागत गीत',
        subCategories: [],
      });
      expect(res4.success).toBe(false);
    });
  });
});
