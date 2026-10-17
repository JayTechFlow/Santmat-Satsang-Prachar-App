import { describe, it, expect } from 'vitest';
import { categoryService } from '../../features/categories/services/categoryService';

describe('Firestore Category Normalization Test', () => {
  it('correctly maps missing name fields to document IDs', async () => {
    const categories = await categoryService.getCategories();
    expect(categories.length).toBeGreaterThanOrEqual(4); // At least the 4 system categories
    
    // Check that each category has a valid name
    for (const cat of categories) {
      expect(cat.name).toBeTruthy();
    }

    // Verify the first four are the system categories
    const systemCategories = categories.slice(0, 4);
    expect(systemCategories[0].id).toBe('allBhajan');
    expect(systemCategories[0].name).toBe('सभी भजन');
    expect(systemCategories[1].id).toBe('shahiBhajanavali');
    expect(systemCategories[1].name).toBe('शाही भजनावली');
    expect(systemCategories[2].id).toBe('padavaliBhajan');
    expect(systemCategories[2].name).toBe('पदावली भजन');
    expect(systemCategories[3].id).toBe('swagatGeet');
    expect(systemCategories[3].name).toBe('स्वागत गीत');
  });
});
