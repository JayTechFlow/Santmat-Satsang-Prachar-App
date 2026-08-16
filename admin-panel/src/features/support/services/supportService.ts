import { BaseCrudService } from '../../../core/services/BaseCrudService';
import { supportRepository, SupportRepository } from '../repositories/supportRepository';
import type { SupportTicket } from '../types/support.types';

export class SupportService extends BaseCrudService<SupportTicket> {
  constructor(repo: SupportRepository) {
    super(repo);
  }
}

export const supportService = new SupportService(supportRepository);
