import { BaseCrudService } from '../../../core/services/BaseCrudService';
import { bannerRepository, BannerRepository } from '../repositories/bannerRepository';
import { required, maxLength } from '../../../core/validation/validators';
import { AppError } from '../../../core/errors/AppError';
import type { BannerDTO, BannerStatus } from '../types';
import { auth } from '../../../firebase/config';
import { storageService } from '../../../core/storage';

export class BannerService extends BaseCrudService<BannerDTO> {
  private _repo: BannerRepository;

  constructor(repo: BannerRepository) {
    super(repo);
    this._repo = repo;
  }

  protected override get currentUserId(): string {
    return auth.currentUser?.uid || 'system';
  }

  protected override async validateCreate(item: Partial<BannerDTO>): Promise<void> {
    const titleError = required(item.title) || maxLength(100)(item.title || '');
    if (titleError) throw new AppError('VALIDATION_ERROR', `Title: ${titleError}`);

    if (!item.imageUrl) {
      throw new AppError('VALIDATION_ERROR', 'Banner image is required.');
    }

    if (item.status === 'scheduled') {
      if (!item.startDate || !item.endDate) {
        throw new AppError('VALIDATION_ERROR', 'Start Date and End Date are required for scheduled banners.');
      }
      if (new Date(item.startDate as any) >= new Date(item.endDate as any)) {
        throw new AppError('VALIDATION_ERROR', 'End Date must be after Start Date.');
      }
    }
  }

  protected override async validateUpdate(id: string, item: Partial<BannerDTO>): Promise<void> {
    if (item.title !== undefined) {
      const titleError = required(item.title) || maxLength(100)(item.title);
      if (titleError) throw new AppError('VALIDATION_ERROR', `Title: ${titleError}`);
    }

    if (item.imageUrl !== undefined && !item.imageUrl) {
      throw new AppError('VALIDATION_ERROR', 'Banner image cannot be empty.');
    }

    const existing = await this._repo.getById(id);
    if (!existing) throw new AppError('NOT_FOUND', 'Banner not found.');

    const newStatus = item.status !== undefined ? item.status : existing.status;
    const newStartDate = item.startDate !== undefined ? item.startDate : existing.startDate;
    const newEndDate = item.endDate !== undefined ? item.endDate : existing.endDate;

    if (newStatus === 'scheduled') {
      if (!newStartDate || !newEndDate) {
        throw new AppError('VALIDATION_ERROR', 'Start Date and End Date are required for scheduled banners.');
      }
      if (new Date(newStartDate as any) >= new Date(newEndDate as any)) {
        throw new AppError('VALIDATION_ERROR', 'End Date must be after Start Date.');
      }
    }

    // Delete orphaned storage file if imageUrl changes
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
    
    // Perform deletion
    await super.delete(id);

    // Delete orphaned image if exists
    if (existing?.imageUrl) {
      try {
        await storageService.deleteFile(existing.imageUrl);
      } catch (e) {
        console.warn('Failed to delete image from storage on banner deletion', e);
      }
    }
  }
}

export const bannerService = new BannerService(bannerRepository);

// Helper for effective status
export function getEffectiveStatus(banner: BannerDTO): BannerStatus {
  if (banner.status === 'draft' || banner.status === 'archived') {
    return banner.status;
  }
  
  if (banner.status === 'scheduled' || banner.status === 'published') {
    const now = new Date();
    
    // We treat both published and scheduled as potentially time-bound if dates are provided
    if (banner.startDate && banner.endDate) {
      const start = new Date(banner.startDate as any);
      const end = new Date(banner.endDate as any);
      
      if (now < start) return 'scheduled';
      if (now >= start && now <= end) return 'published';
      if (now > end) return 'expired';
    } else if (banner.startDate) {
      const start = new Date(banner.startDate as any);
      if (now < start) return 'scheduled';
      return 'published';
    } else if (banner.endDate) {
      const end = new Date(banner.endDate as any);
      if (now > end) return 'expired';
      return 'published';
    }
  }
  
  return banner.status;
}
