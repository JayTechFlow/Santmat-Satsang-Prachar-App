import { storage } from '../../firebase/config';
import { StorageRepository } from './StorageRepository';
import { StorageService } from './StorageService';

const storageRepository = new StorageRepository(storage);
export const storageService = new StorageService(storageRepository);

export * from './StorageRepository';
export * from './StorageService';
