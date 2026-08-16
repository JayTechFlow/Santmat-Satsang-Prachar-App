import { BaseRepository } from '../../../core/repositories/BaseRepository';
import { db } from '../../../firebase/config';
import type { SupportTicket } from '../types/support.types';

export class SupportRepository extends BaseRepository<SupportTicket> {
  constructor() {
    super(db, 'support_tickets');
  }
}

export const supportRepository = new SupportRepository();
