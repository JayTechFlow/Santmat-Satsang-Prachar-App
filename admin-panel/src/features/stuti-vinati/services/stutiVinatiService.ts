import { BaseCrudService } from '../../../core/services/BaseCrudService';
import { stutiVinatiRepository, StutiVinatiRepository } from '../repositories/stutiVinatiRepository';
import { categoryRepository } from '../../categories/repositories/categoryRepository';
import { required, maxLength } from '../../../core/validation/validators';
import { AppError } from '../../../core/errors/AppError';
import type { StutiVinatiDTO } from '../types';
import { authService } from '../../../core/services/authService';
import { storageService } from '../../../core/storage';

export class StutiVinatiService extends BaseCrudService<StutiVinatiDTO> {
  private _repo: StutiVinatiRepository;

  constructor(repo: StutiVinatiRepository) {
    super(repo);
    this._repo = repo;
  }

  protected override get currentUserId(): string {
    return authService.getCurrentUserId() || 'system';
  }

  private async checkCategory(categoryId?: string): Promise<void> {
    if (!categoryId) return;
    const categoryExists = await categoryRepository.getById(categoryId);
    if (!categoryExists) {
      throw new AppError('NOT_FOUND', 'The selected category does not exist.');
    }
  }

  protected override async validateCreate(item: Partial<StutiVinatiDTO>): Promise<void> {
    const titleError = required(item.title) || maxLength(150)(item.title || '');
    if (titleError) throw new AppError('VALIDATION_ERROR', `Title: ${titleError}`);

    if (!item.content) {
      throw new AppError('VALIDATION_ERROR', 'Content is required.');
    }

    if (item.readingOrder === undefined || item.readingOrder === null) {
      throw new AppError('VALIDATION_ERROR', 'Reading order is required.');
    }

    await this.checkCategory(item.categoryId);

    const titleExists = await this._repo.checkExists('title', item.title);
    if (titleExists) {
      throw new AppError('DUPLICATE_ERROR', `A prayer with the title "${item.title}" already exists.`);
    }

    const orderExists = await this._repo.checkExists('readingOrder', item.readingOrder);
    if (orderExists) {
      throw new AppError('DUPLICATE_ERROR', `A prayer with reading order "${item.readingOrder}" already exists.`);
    }
  }

  protected override async validateUpdate(id: string, item: Partial<StutiVinatiDTO>): Promise<void> {
    if (item.title !== undefined) {
      const titleError = required(item.title) || maxLength(150)(item.title);
      if (titleError) throw new AppError('VALIDATION_ERROR', `Title: ${titleError}`);
      
      const exists = await this._repo.checkExists('title', item.title, id);
      if (exists) {
        throw new AppError('DUPLICATE_ERROR', `A prayer with the title "${item.title}" already exists.`);
      }
    }

    if (item.content !== undefined && !item.content) {
      throw new AppError('VALIDATION_ERROR', 'Content is required.');
    }

    if (item.readingOrder !== undefined && item.readingOrder !== null) {
      const exists = await this._repo.checkExists('readingOrder', item.readingOrder, id);
      if (exists) {
        throw new AppError('DUPLICATE_ERROR', `A prayer with reading order "${item.readingOrder}" already exists.`);
      }
    }

    if (item.categoryId) {
      await this.checkCategory(item.categoryId);
    }

    const existing = await this._repo.getById(id);
    if (!existing) throw new AppError('NOT_FOUND', 'Prayer not found.');

    if (item.imageUrl && existing.imageUrl && item.imageUrl !== existing.imageUrl) {
      try {
        await storageService.deleteFile(existing.imageUrl);
      } catch (e) {
        console.warn('Failed to delete old image from storage', e);
      }
    }
  }

  public override async delete(id: string): Promise<void> {
    const existing = await this._repo.getById(id);
    await super.delete(id);
    if (existing?.imageUrl) {
      try {
        await storageService.deleteFile(existing.imageUrl);
      } catch (e) {
        console.warn('Failed to delete image on prayer deletion', e);
      }
    }
  }
}

export const stutiVinatiService = new StutiVinatiService(stutiVinatiRepository);
