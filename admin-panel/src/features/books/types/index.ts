import type { EntityWithAudit } from '../../../core/services/BaseCrudService';

export type PublishStatus = 'draft' | 'published' | 'archived';

export interface BookDTO {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  description: string;
  categoryId: string;
  coverImageUrl?: string;
  pdfUrl?: string;
  language: string;
  edition?: string;
  pageCount?: number;
  publishStatus: PublishStatus;
  featured: boolean;
  tags: string[];
  
  // Analytics fields (prepared for future)
  downloadCount: number;
  viewCount: number;
  lastDownloaded?: string | null;
}

export type BookViewModel = EntityWithAudit<BookDTO>;
