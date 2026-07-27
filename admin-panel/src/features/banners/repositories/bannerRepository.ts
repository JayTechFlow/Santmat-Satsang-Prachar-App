import { BaseRepository } from '../../../core/repositories/BaseRepository';
import { db } from '../../../firebase/config';
import type { BannerDTO } from '../types';
import { Timestamp } from 'firebase/firestore';

export class BannerRepository extends BaseRepository<BannerDTO> {
  constructor() {
    super(db, 'banners');
  }

  public override async create(item: BannerDTO, customId?: string): Promise<BannerDTO> {
    const dataToSave = { ...item };
    if (dataToSave.startDate instanceof Date) dataToSave.startDate = Timestamp.fromDate(dataToSave.startDate);
    if (dataToSave.endDate instanceof Date) dataToSave.endDate = Timestamp.fromDate(dataToSave.endDate);
    return super.create(dataToSave, customId);
  }

  public override async update(id: string, item: Partial<BannerDTO>): Promise<void> {
    const dataToSave = { ...item };
    if (dataToSave.startDate instanceof Date) dataToSave.startDate = Timestamp.fromDate(dataToSave.startDate);
    if (dataToSave.endDate instanceof Date) dataToSave.endDate = Timestamp.fromDate(dataToSave.endDate);
    return super.update(id, dataToSave);
  }
}

export const bannerRepository = new BannerRepository();
