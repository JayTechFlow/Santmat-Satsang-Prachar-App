import type { PaginationOptions, PaginatedResult } from '../repositories/BaseRepository';
import type { BaseRepository } from '../repositories/BaseRepository';
import { mapError } from '../errors/errorMapper';
import type { CustomQueryOptions } from '../repositories/BaseRepository';

export interface AuditFields {
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export type EntityWithAudit<T> = T & AuditFields;

export class BaseCrudService<T extends { id: string }> {
  protected repository: BaseRepository<T>;

  constructor(repository: BaseRepository<T>) {
    this.repository = repository;
  }

  protected get currentUserId(): string {
    // Override this in subclasses to inject current user's ID
    return 'system';
  }

  protected async validateCreate(_item: Partial<T>): Promise<void> {
    // Override to implement creation validation
  }

  protected async validateUpdate(_id: string, _item: Partial<T>): Promise<void> {
    // Override to implement update validation
  }

  protected async checkDuplicates(_item: Partial<T>): Promise<void> {
    // Override to check for duplicates before create/update
  }

  protected injectCreateMetadata(item: Partial<T>): EntityWithAudit<Partial<T>> {
    const timestamp = new Date().toISOString();
    return {
      ...item,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: this.currentUserId,
      updatedBy: this.currentUserId,
    };
  }

  protected injectUpdateMetadata(item: Partial<T>): EntityWithAudit<Partial<T>> {
    return {
      ...item,
      updatedAt: new Date().toISOString(),
      updatedBy: this.currentUserId,
    };
  }

  public async getAll(options: CustomQueryOptions = {}): Promise<T[]> {
    try {
      return await this.repository.getAll(options);
    } catch (error) {
      throw mapError(error);
    }
  }

  public async getById(id: string): Promise<T | null> {
    try {
      return await this.repository.getById(id);
    } catch (error) {
      throw mapError(error);
    }
  }

  public async create(item: T, customId?: string): Promise<T> {
    try {
      await this.validateCreate(item);
      await this.checkDuplicates(item);
      const dataToSave = this.injectCreateMetadata(item) as T;
      return await this.repository.create(dataToSave, customId);
    } catch (error) {
      throw mapError(error);
    }
  }

  public async update(id: string, item: Partial<T>): Promise<void> {
    try {
      await this.validateUpdate(id, item);
      await this.checkDuplicates(item);
      const dataToUpdate = this.injectUpdateMetadata(item);
      await this.repository.update(id, dataToUpdate);
    } catch (error) {
      throw mapError(error);
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      await this.repository.delete(id);
    } catch (error) {
      throw mapError(error);
    }
  }

  public async count(options: CustomQueryOptions = {}): Promise<number> {
    try {
      return await this.repository.count(options);
    } catch (error) {
      throw mapError(error);
    }
  }

  public async paginate(
    options: PaginationOptions,
    queryOptions: CustomQueryOptions = {}
  ): Promise<PaginatedResult<T>> {
    try {
      return await this.repository.paginate(options, queryOptions);
    } catch (error) {
      throw mapError(error);
    }
  }
}
