import { BaseRepository } from '../../../core/repositories/BaseRepository';
import { db } from '../../../firebase/config';
import type { BhajanDTO } from '../types';

export class BhajanRepository extends BaseRepository<BhajanDTO> {
  constructor() {
    super(db, 'audio');
  }

  public async titleExists(title: string, excludeId?: string): Promise<boolean> {
    const { query, where, getCountFromServer } = await import('firebase/firestore');
    let q = query(this.collectionRef, where('title', '==', title));
    const snapshot = await getCountFromServer(q);
    
    if (snapshot.data().count === 0) return false;
    if (!excludeId) return true;
    
    const { getDocs } = await import('firebase/firestore');
    const docs = await getDocs(q);
    return docs.docs.some(doc => doc.id !== excludeId);
  }
}

export const bhajanRepository = new BhajanRepository();
