import { BaseRepository } from '../../../core/repositories/BaseRepository';
import { db } from '../../../firebase/config';
import type { RoleDTO } from '../types';

export class RoleRepository extends BaseRepository<RoleDTO> {
  constructor() {
    super(db, 'roles');
  }
}

export const roleRepository = new RoleRepository();
