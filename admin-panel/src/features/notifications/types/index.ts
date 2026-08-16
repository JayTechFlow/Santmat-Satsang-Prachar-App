import type { EntityWithAudit } from '../../../core/services/BaseCrudService';

export type Audience = 'all' | 'registered' | 'guests';
export type PushStatus = 'pending' | 'sent' | 'failed';
export type DeliveryType = 'immediate' | 'scheduled';
export type TargetScreen = 'Home' | 'Audio' | 'Books' | 'StutiVinati';
export type NotificationCategory = 'Updates' | 'विशेष';

export interface NotificationDTO {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  targetScreen: TargetScreen;
  audience: Audience;
  deliveryType: DeliveryType;
  scheduledFor?: string; // ISO String
  pushStatus: PushStatus;
}

export type NotificationViewModel = EntityWithAudit<NotificationDTO>;
