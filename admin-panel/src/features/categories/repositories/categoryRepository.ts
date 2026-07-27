import { BaseRepository } from '../../../core/repositories/BaseRepository';
import { db } from '../../../firebase/config';
import type { CategoryDTO } from '../types';
import { query, where, getCountFromServer } from 'firebase/firestore';

export class CategoryRepository extends BaseRepository<CategoryDTO> {
  constructor() {
    super(db, 'categories');
  }

  // Extra helper to check for duplicate names under the same parent
  public async nameExistsUnderParent(name: string, parentId: string | undefined): Promise<boolean> {
    const constraints = [where('name', '==', name)];
    if (parentId) {
      constraints.push(where('parentId', '==', parentId));
    } else {
      // Need a way to query "parentId doesn't exist or is empty". 
      // Firestore does not natively support "where field does not exist".
      // We will assume root categories either have no parentId field, or parentId === ''.
      // Let's enforce parentId = '' for root categories if we want to query easily, 
      // or we just fetch and filter. For now we fetch root nodes.
      constraints.push(where('parentId', '==', ''));
    }
    
    const q = query(this.collectionRef, ...constraints);
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count > 0;
  }

  // To check if a category has children before deletion
  public async hasChildren(categoryId: string): Promise<boolean> {
    const q = query(this.collectionRef, where('parentId', '==', categoryId));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count > 0;
  }
}

export const categoryRepository = new CategoryRepository();
