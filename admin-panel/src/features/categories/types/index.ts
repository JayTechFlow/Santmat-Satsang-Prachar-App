import type { EntityWithAudit } from '../../../core/services/BaseCrudService';

export interface CategoryDTO {
  id: string;
  parentId?: string; // Optional for unlimited depth
  name: string;
  slug: string;
  description: string;
  type: string; // The domain this category belongs to (audio, book, prayer)
  icon?: string;
  sortOrder: number;
  status: 'active' | 'archived';
  featured: boolean;
  color?: string;
}

export type CategoryViewModel = EntityWithAudit<CategoryDTO>;
