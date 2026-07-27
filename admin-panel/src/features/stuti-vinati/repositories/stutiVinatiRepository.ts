import { BaseRepository } from '../../../core/repositories/BaseRepository';
import { db } from '../../../firebase/config';
import type { StutiVinatiDTO } from '../types';
import { query, where, getCountFromServer } from 'firebase/firestore';

export class StutiVinatiRepository extends BaseRepository<StutiVinatiDTO> {
  constructor() {
    super(db, 'stuti_vinati');
  }

  public async checkExists(field: keyof StutiVinatiDTO, value: any, excludeId?: string): Promise<boolean> {
    const constraints = [where(field as string, '==', value)];
    const q = query(this.collectionRef, ...constraints);
    const snapshot = await getCountFromServer(q);
    
    if (snapshot.data().count === 0) return false;
    
    if (excludeId && snapshot.data().count === 1) {
      const { getDocs } = await import('firebase/firestore');
      const docs = await getDocs(q);
      if (docs.docs[0].id === excludeId) return false;
    }
    
    return snapshot.data().count > 0;
  }
}

export const stutiVinatiRepository = new StutiVinatiRepository();
