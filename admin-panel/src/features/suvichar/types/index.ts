import type { EntityWithAudit } from '../../../core/services/BaseCrudService';

export interface SuvicharDTO {
  id: string;
  title: string;
  content: string;
}

export type SuvicharViewModel = EntityWithAudit<SuvicharDTO>;
