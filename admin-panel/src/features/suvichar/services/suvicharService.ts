import { BaseCrudService } from '../../../core/services/BaseCrudService';
import { suvicharRepository } from '../repositories/suvicharRepository';
import { required, maxLength } from '../../../core/validation/validators';
import { AppError } from '../../../core/errors/AppError';
import type { SuvicharDTO } from '../types';
import { auth } from '../../../firebase/config';

export class SuvicharService extends BaseCrudService<SuvicharDTO> {
  constructor() {
    super(suvicharRepository);
  }

  protected override get currentUserId(): string {
    return auth.currentUser?.uid || 'system';
  }

  protected override async validateCreate(item: Partial<SuvicharDTO>): Promise<void> {
    const titleError = required(item.title);
    if (titleError) throw new AppError('VALIDATION_ERROR', `Title: ${titleError}`);

    const titleLengthError = maxLength(100)(item.title || '');
    if (titleLengthError) throw new AppError('VALIDATION_ERROR', `Title: ${titleLengthError}`);

    const contentError = required(item.content);
    if (contentError) throw new AppError('VALIDATION_ERROR', `Content: ${contentError}`);
  }

  protected override async validateUpdate(_id: string, item: Partial<SuvicharDTO>): Promise<void> {
    if (item.title !== undefined) {
      const titleError = required(item.title) || maxLength(100)(item.title);
      if (titleError) throw new AppError('VALIDATION_ERROR', `Title: ${titleError}`);
    }

    if (item.content !== undefined) {
      const contentError = required(item.content);
      if (contentError) throw new AppError('VALIDATION_ERROR', `Content: ${contentError}`);
    }
  }
}

export const suvicharService = new SuvicharService();
