import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../../lib/firebase/config';
import { CategoryEntity, ServiceResponse } from '../../../types/common/index';
import {
  SYSTEM_CATEGORIES,
  SystemCategoryId,
  isSystemCategoryId,
  isSystemCategoryName,
  sortCategoriesWithSystemFirst,
} from '../config/systemCategories';

const COLLECTION_NAME = 'categories';

function findMatchingSystemDef(id: string, name: string) {
  const normId = id.trim().toLowerCase();
  const normName = name.trim().toLowerCase();
  for (const sys of SYSTEM_CATEGORIES) {
    if (sys.id.toLowerCase() === normId || sys.uiLabel.toLowerCase() === normName) {
      return sys;
    }
    if (sys.canonicalDataValues.some((v) => v.toLowerCase() === normName || v.toLowerCase() === normId)) {
      return sys;
    }
  }
  return undefined;
}

export function normalizeCategoryEntity(id: string, data: any): CategoryEntity {
  const rawName = String(data.name || id || '').trim();
  const sysMatch = findMatchingSystemDef(id, rawName);

  if (sysMatch) {
    return {
      id: sysMatch.id,
      name: sysMatch.uiLabel,
      description: data.description ? String(data.description).trim() : sysMatch.description,
      icon: data.icon ? String(data.icon).trim() : undefined,
      subCategories:
        Array.isArray(data.subCategories) && data.subCategories.length > 0
          ? data.subCategories.map((s: any) => String(s).trim())
          : [...sysMatch.subCategories],
      isFeatured: true,
      order: sysMatch.order,
      active: true,
      isSystemCategory: true,
      isAllSentinel: sysMatch.isAllSentinel,
      canonicalDataValues: sysMatch.canonicalDataValues,
      matchTokens: sysMatch.matchTokens,
    };
  }

  return {
    id,
    name: rawName,
    description: data.description ? String(data.description).trim() : undefined,
    icon: data.icon ? String(data.icon).trim() : undefined,
    subCategories: Array.isArray(data.subCategories) ? data.subCategories.map((s: any) => String(s).trim()) : [],
    isFeatured: data.isFeatured !== undefined ? Boolean(data.isFeatured) : undefined,
    order: data.order !== undefined ? Number(data.order) : undefined,
    active: data.active !== undefined ? Boolean(data.active) : true,
    isSystemCategory: false,
    isAllSentinel: false,
  };
}

/**
 * Merge Firestore categories with the 4 permanent system categories.
 * Ensures the 4 system categories are always present in exact order,
 * while custom categories are appended afterwards.
 */
export function mergeCategoriesWithSystem(firestoreEntities: CategoryEntity[]): CategoryEntity[] {
  // Map of 4 permanent system categories
  const systemMap = new Map<SystemCategoryId, CategoryEntity>(
    SYSTEM_CATEGORIES.map((def) => [
      def.id,
      {
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
      },
    ])
  );

  const customEntities: CategoryEntity[] = [];
  const seenCustomNames = new Set<string>();

  for (const entity of firestoreEntities) {
    if (entity.isSystemCategory || isSystemCategoryId(entity.id) || isSystemCategoryName(entity.name)) {
      const sysDef = findMatchingSystemDef(entity.id, entity.name);
      if (sysDef) {
        const existing = systemMap.get(sysDef.id);
        if (existing) {
          systemMap.set(sysDef.id, {
            ...existing,
            description: entity.description || existing.description,
            subCategories:
              entity.subCategories && entity.subCategories.length > 0
                ? entity.subCategories
                : existing.subCategories,
          });
        }
      }
    } else {
      const normName = entity.name.toLowerCase();
      if (!seenCustomNames.has(normName) && normName.length > 0) {
        seenCustomNames.add(normName);
        customEntities.push(entity);
      }
    }
  }

  const allMerged = [...Array.from(systemMap.values()), ...customEntities];
  return sortCategoriesWithSystemFirst(allMerged);
}

export class CategoryService {
  async getCategories(): Promise<CategoryEntity[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      const firestoreList = snap.docs.map((d) => normalizeCategoryEntity(d.id, d.data()));
      return mergeCategoriesWithSystem(firestoreList);
    } catch {
      // In offline / fallback mode, always return the 4 system categories
      return mergeCategoriesWithSystem([]);
    }
  }

  subscribeCategories(callback: (items: CategoryEntity[]) => void, onError?: (error: Error) => void): () => void {
    try {
      return onSnapshot(
        collection(db, COLLECTION_NAME),
        (snapshot) => {
          const rawList: CategoryEntity[] = snapshot.docs.map((d) => normalizeCategoryEntity(d.id, d.data()));
          const merged = mergeCategoriesWithSystem(rawList);
          callback(merged);
        },
        (err) => {
          console.warn('Category subscription error:', err);
          if (onError) onError(err);
          else callback(mergeCategoriesWithSystem([]));
        }
      );
    } catch (err) {
      console.warn('Category subscription error:', err);
      if (onError) onError(err instanceof Error ? err : new Error(String(err)));
      else callback(mergeCategoriesWithSystem([]));
      return () => {};
    }
  }

  async addCategory(item: Omit<CategoryEntity, 'id'>): Promise<ServiceResponse<CategoryEntity>> {
    const trimmedName = (item.name || '').trim();
    if (!trimmedName) {
      return { success: false, error: 'श्रेणी का नाम अनिवार्य है।' };
    }

    if (isSystemCategoryName(trimmedName) || isSystemCategoryId(trimmedName)) {
      return {
        success: false,
        error: `"${trimmedName}" एक स्थायी सिस्टम श्रेणी है और इसे पुनः नहीं जोड़ा जा सकता।`,
      };
    }

    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...item,
        name: trimmedName,
        isSystemCategory: false,
        isAllSentinel: false,
      });
      return { success: true, data: { id: docRef.id, ...item } };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to add category' };
    }
  }

  async updateCategory(id: string, updates: Partial<CategoryEntity>): Promise<ServiceResponse<void>> {
    if (isSystemCategoryId(id)) {
      // System categories: Name cannot be changed and active cannot be false
      const safeUpdates: Partial<CategoryEntity> = {};
      if (updates.description !== undefined) safeUpdates.description = updates.description;
      if (updates.subCategories !== undefined) safeUpdates.subCategories = updates.subCategories;
      if (updates.icon !== undefined) safeUpdates.icon = updates.icon;

      try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, safeUpdates);
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message || 'Failed to update system category' };
      }
    }

    // For custom categories, ensure they cannot be renamed into a system category name
    if (updates.name && isSystemCategoryName(updates.name)) {
      return {
        success: false,
        error: `श्रेणी का नाम स्थायी सिस्टम श्रेणी "${updates.name}" में नहीं बदला जा सकता।`,
      };
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, updates);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update category' };
    }
  }

  async deleteCategory(id: string): Promise<ServiceResponse<void>> {
    if (isSystemCategoryId(id)) {
      return { success: false, error: 'स्थायी सिस्टम श्रेणी को हटाया नहीं जा सकता।' };
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete category' };
    }
  }
}

export const categoryService = new CategoryService();
