import { BaseRepository } from '../../../core/repositories/BaseRepository';
import { db } from '../../../firebase/config';
import type { SuvicharDTO } from '../types';

export class SuvicharRepository extends BaseRepository<SuvicharDTO> {
  constructor() {
    super(db, 'suvichar');
  }
}

export const suvicharRepository = new SuvicharRepository();
