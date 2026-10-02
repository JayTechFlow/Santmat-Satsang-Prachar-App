import { describe, it, expect } from 'vitest';
import { categoryService } from '../../features/categories/services/categoryService';

describe('Firestore Category Normalization Test', () => {
  it('correctly maps missing name fields to document IDs', async () => {
    const categories = await categoryService.getCategories();
    expect(categories.length).toBeGreaterThan(0);
    
    // Check that each category has a valid name and that it matches id when name is absent in DB
    for (const cat of categories) {
      expect(cat.name).toBeTruthy();
      if (cat.id === 'general') {
        expect(cat.name).toBe('general');
      } else if (cat.id === 'पदावली भजन') {
        expect(cat.name).toBe('पदावली भजन');
      }
    }
  });
});
