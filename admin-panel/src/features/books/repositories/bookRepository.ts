import { BaseRepository } from '../../../core/repositories/BaseRepository';
import { db } from '../../../firebase/config';
import type { BookDTO } from '../types';
import { query, where, getCountFromServer } from 'firebase/firestore';

export class BookRepository extends BaseRepository<BookDTO> {
  constructor() {
    super(db, 'books');
  }

  public async titleExists(title: string, excludeId?: string): Promise<boolean> {
    const constraints = [where('title', '==', title)];
    const q = query(this.collectionRef, ...constraints);
    const snapshot = await getCountFromServer(q);
    
    // If we only have 1 and its ID matches excludeId, it's not a duplicate.
    // getCountFromServer doesn't give us the ID, so if count > 0, we might need a standard getDocs
    // Or we could query (title == title && id != excludeId) but firestore doesn't support id != easily.
    if (snapshot.data().count === 0) return false;
    
    if (excludeId && snapshot.data().count === 1) {
      // Need to fetch to verify it's the same one
      const { getDocs } = await import('firebase/firestore');
      const docs = await getDocs(q);
      if (docs.docs[0].id === excludeId) return false;
    }
    
    return snapshot.data().count > 0;
  }
}

export const bookRepository = new BookRepository();
