import { BaseCrudService } from '../../../core/services/BaseCrudService';
import { notificationRepository, NotificationRepository } from '../repositories/notificationRepository';
import { required, maxLength } from '../../../core/validation/validators';
import { AppError } from '../../../core/errors/AppError';
import type { NotificationDTO } from '../types';
import { auth } from '../../../firebase/config';

export class NotificationService extends BaseCrudService<NotificationDTO> {
  private _repo: NotificationRepository;

  constructor(repo: NotificationRepository) {
    super(repo);
    this._repo = repo;
  }

  protected override get currentUserId(): string {
    return auth.currentUser?.uid || 'system';
  }

  protected override async validateCreate(item: Partial<NotificationDTO>): Promise<void> {
    const titleError = required(item.title) || maxLength(100)(item.title || '');
    if (titleError) throw new AppError('VALIDATION_ERROR', `Title: ${titleError}`);

    const messageError = required(item.message) || maxLength(500)(item.message || '');
    if (messageError) throw new AppError('VALIDATION_ERROR', `Message: ${messageError}`);

    if (item.deliveryType === 'scheduled' && !item.scheduledFor) {
      throw new AppError('VALIDATION_ERROR', 'Scheduled time is required for scheduled delivery.');
    }
  }

  protected override async validateUpdate(id: string, item: Partial<NotificationDTO>): Promise<void> {
    if (item.title !== undefined) {
      const titleError = required(item.title) || maxLength(100)(item.title);
      if (titleError) throw new AppError('VALIDATION_ERROR', `Title: ${titleError}`);
    }

    if (item.message !== undefined) {
      const messageError = required(item.message) || maxLength(500)(item.message);
      if (messageError) throw new AppError('VALIDATION_ERROR', `Message: ${messageError}`);
    }

    if (item.deliveryType === 'scheduled' && !item.scheduledFor) {
      throw new AppError('VALIDATION_ERROR', 'Scheduled time is required for scheduled delivery.');
    }
    
    // Status transitions
    const existing = await this._repo.getById(id);
    if (!existing) throw new AppError('NOT_FOUND', 'Notification not found');
    
    if (existing.pushStatus === 'sent' && item.pushStatus !== undefined && item.pushStatus !== 'sent') {
      throw new AppError('VALIDATION_ERROR', 'Cannot change status of an already sent notification.');
    }
  }
}

export const notificationService = new NotificationService(notificationRepository);
