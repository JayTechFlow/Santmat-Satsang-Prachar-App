import type { EntityWithAudit } from '../../../core/services/BaseCrudService';
import type { Timestamp } from 'firebase/firestore';

export type BannerStatus = 'draft' | 'scheduled' | 'published' | 'expired' | 'archived';

export interface BannerDTO {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  mobileImageUrl?: string;
  actionType: 'none' | 'link' | 'internal' | 'book' | 'bhajan' | 'category';
  actionTarget?: string; // URL, or ID of the item
  priority: number;
  startDate?: Timestamp | Date | null;
  endDate?: Timestamp | Date | null;
  status: BannerStatus;
  featured: boolean;
}

export type BannerViewModel = EntityWithAudit<BannerDTO>;
