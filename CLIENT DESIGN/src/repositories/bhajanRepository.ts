import { BaseRepository } from './baseRepository';
import { BhajanEntity } from '../types';

export class BhajanRepository extends BaseRepository<BhajanEntity> {
  constructor() {
    super('audio');
  }
}

export const bhajanRepository = new BhajanRepository();
