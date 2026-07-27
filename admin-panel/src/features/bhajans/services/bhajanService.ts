import { bhajanRepository } from '../repositories/bhajanRepository';
import type { BhajanViewModel, BhajanDTO } from '../types';
import { Timestamp } from 'firebase/firestore';

export const bhajanService = {
  fetchBhajans: async (search: string = '', _filter: string = '', sort: string = 'newest', pageSize: number = 10, lastDoc: any = null): Promise<{ data: BhajanViewModel[], totalCount: number, lastDoc: any }> => {
    const result = await bhajanRepository.fetchBhajans(search, sort, pageSize, lastDoc);
    
    return {
      data: result.data.map(mapToViewModel),
      totalCount: result.totalCount,
      lastDoc: result.lastDoc
    };
  },

  createBhajan: async (data: Partial<BhajanDTO>): Promise<void> => {
    if (data.title) {
      const existing = await bhajanRepository.findByTitle(data.title);
      if (existing.length > 0) {
        throw new Error("A bhajan with this title already exists.");
      }
    }

    const payload = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      status: 'active'
    } as any;

    await bhajanRepository.createBhajan(payload);
  },

  updateBhajan: async (id: string, data: Partial<BhajanDTO>): Promise<void> => {
    if (data.title) {
      const existing = await bhajanRepository.findByTitle(data.title);
      if (existing.some(b => b.id !== id)) {
        throw new Error("A bhajan with this title already exists.");
      }
    }

    const payload = {
      ...data,
      updatedAt: Timestamp.now()
    } as any;
    
    await bhajanRepository.updateBhajan(id, payload);
  },

  deleteBhajan: async (id: string): Promise<void> => {
    await bhajanRepository.deleteBhajan(id);
  },

  bulkDeleteBhajans: async (ids: string[]): Promise<any[]> => {
    return Promise.allSettled(ids.map(id => bhajanRepository.deleteBhajan(id)));
  }
};

function mapToViewModel(dto: BhajanDTO): BhajanViewModel {
  let createdAtDate: Date | undefined = undefined;
  if (dto.createdAt) {
    if (dto.createdAt instanceof Timestamp || (dto.createdAt as any).toDate) {
      createdAtDate = (dto.createdAt as any).toDate();
    } else if (dto.createdAt instanceof Date) {
      createdAtDate = dto.createdAt;
    } else if (typeof dto.createdAt === 'string' || typeof dto.createdAt === 'number') {
      createdAtDate = new Date(dto.createdAt);
    }
  }

  return {
    id: dto.id || '',
    title: dto.title || '',
    description: dto.description || '',
    audioUrl: dto.audioUrl || '',
    thumbnailUrl: dto.thumbnailUrl || '',
    createdAt: createdAtDate
  };
}
