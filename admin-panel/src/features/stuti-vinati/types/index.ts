import type { EntityWithAudit } from '../../../core/services/BaseCrudService';

export type PublishStatus = 'draft' | 'published' | 'archived';

export interface StutiVinatiDTO {
  id: string;
  title: string;
  content: string; // Markdown
  readingOrder: number;
  translation?: string;
  transliteration?: string;
  imageUrl?: string;
  categoryId?: string;
  tags: string[];
  featured: boolean;
  publishStatus: PublishStatus;
}

export type StutiVinatiViewModel = EntityWithAudit<StutiVinatiDTO>;
