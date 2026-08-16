import type { EntityWithAudit } from '../../../core/services/BaseCrudService';
import type { PublishStatus } from '../../../core/types/content.types';

export type { PublishStatus };

export interface StutiVinatiDTO {
  id: string;
  title: string;
  content: string; // Markdown
  readingOrder: number;
  translation?: string;
  transliteration?: string;
  imageUrl?: string;
  audioUrl?: string;
  categoryId?: string;
  type?: string;
  tags: string[];
  featured: boolean;
  publishStatus: PublishStatus;
}

export type StutiVinatiViewModel = EntityWithAudit<StutiVinatiDTO>;
