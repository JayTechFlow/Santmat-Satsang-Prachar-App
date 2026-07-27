import { BaseRepository } from '../../../core/repositories/BaseRepository';
import { db } from '../../../firebase/config';
import type { NotificationDTO } from '../types';

export class NotificationRepository extends BaseRepository<NotificationDTO> {
  constructor() {
    super(db, 'notifications');
  }
}

export const notificationRepository = new NotificationRepository();
