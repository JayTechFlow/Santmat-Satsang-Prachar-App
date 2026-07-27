import { BaseRepository } from '../../../core/repositories/BaseRepository';
import { db } from '../../../firebase/config';
import type { UserDTO } from '../types';
import { query, where, getCountFromServer } from 'firebase/firestore';

export class UserRepository extends BaseRepository<UserDTO> {
  constructor() {
    super(db, 'users');
  }

  public async checkEmailExists(email: string, excludeId?: string): Promise<boolean> {
    const q = query(this.collectionRef, where('email', '==', email.toLowerCase()));
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

export const userRepository = new UserRepository();
