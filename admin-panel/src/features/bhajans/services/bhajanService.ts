import { BaseCrudService } from '../../../core/services/BaseCrudService';
import { bhajanRepository, BhajanRepository } from '../repositories/bhajanRepository';
import { required, maxLength } from '../../../core/validation/validators';
import { AppError } from '../../../core/errors/AppError';
import type { BhajanDTO } from '../types';
import { authService } from '../../../core/services/authService';
import { storageService } from '../../../core/storage';

export class BhajanService extends BaseCrudService<BhajanDTO> {
  private _repo: BhajanRepository;

  constructor(repo: BhajanRepository) {
    super(repo);
    this._repo = repo;
  }

  protected override get currentUserId(): string {
    return authService.getCurrentUserId() || 'system';
  }

  protected override async validateCreate(item: Partial<BhajanDTO>): Promise<void> {
    const titleError = required(item.title) || maxLength(200)(item.title || '');
    if (titleError) throw new AppError('VALIDATION_ERROR', `Title: ${titleError}`);

    const exists = await this._repo.titleExists(item.title as string);
    if (exists) {
      throw new AppError('DUPLICATE_ERROR', `A bhajan with the title "${item.title}" already exists.`);
    }
  }

  protected override async validateUpdate(id: string, item: Partial<BhajanDTO>): Promise<void> {
    if (item.title !== undefined) {
      const titleError = required(item.title) || maxLength(200)(item.title);
      if (titleError) throw new AppError('VALIDATION_ERROR', `Title: ${titleError}`);
      
      const exists = await this._repo.titleExists(item.title, id);
      if (exists) {
        throw new AppError('DUPLICATE_ERROR', `A bhajan with the title "${item.title}" already exists.`);
      }
    }

    const existing = await this._repo.getById(id);
    if (!existing) throw new AppError('NOT_FOUND', 'Bhajan not found.');

    if (item.audioUrl && existing.audioUrl && item.audioUrl !== existing.audioUrl) {
      try {
        await storageService.deleteFile(existing.audioUrl);
      } catch (e) {
        console.warn('Failed to delete old audio', e);
      }
    }

    if (item.thumbnailUrl && existing.thumbnailUrl && item.thumbnailUrl !== existing.thumbnailUrl) {
      try {
        await storageService.deleteFile(existing.thumbnailUrl);
      } catch (e) {
        console.warn('Failed to delete old thumbnail', e);
      }
    }
  }

  public override async delete(id: string): Promise<void> {
    const existing = await this._repo.getById(id);
    await super.delete(id);
    if (existing?.audioUrl) {
      try {
        await storageService.deleteFile(existing.audioUrl);
      } catch (e) { console.warn('Failed to delete audio:', e); }
    }
    if (existing?.thumbnailUrl) {
      try {
        await storageService.deleteFile(existing.thumbnailUrl);
      } catch (e) { console.warn('Failed to delete thumbnail:', e); }
    }
  }
}

export const bhajanService = new BhajanService(bhajanRepository);
