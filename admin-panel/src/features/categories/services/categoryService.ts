import { BaseCrudService } from '../../../core/services/BaseCrudService';
import { categoryRepository, CategoryRepository } from '../repositories/categoryRepository';
import { required, maxLength, minLength } from '../../../core/validation/validators';
import { AppError } from '../../../core/errors/AppError';
import type { CategoryDTO } from '../types';
import { authService } from '../../../core/services/authService';

export class CategoryService extends BaseCrudService<CategoryDTO> {
  private _repo: CategoryRepository;

  constructor(repo: CategoryRepository) {
    super(repo);
    this._repo = repo;
  }

  protected override get currentUserId(): string {
    return authService.getCurrentUserId() || 'system';
  }

  // To prevent null/undefined parentId issues in Firestore queries, we enforce empty string for root
  private normalizeParentId(parentId?: string): string {
    return parentId || '';
  }

  protected override async checkDuplicates(item: Partial<CategoryDTO>): Promise<void> {
    if (item.name !== undefined) {
      const exists = await this._repo.nameExistsUnderParent(
        item.name, 
        this.normalizeParentId(item.parentId)
      );
      if (exists) {
        throw new AppError('DUPLICATE_ERROR', `A category with the name "${item.name}" already exists under this parent.`);
      }
    }
  }

  private async checkCircularReference(categoryId: string, parentId: string): Promise<void> {
    if (categoryId === parentId) {
      throw new AppError('VALIDATION_ERROR', 'A category cannot be its own parent.');
    }
    
    // Traverse up the tree to ensure categoryId is not an ancestor of parentId
    let currentParentId = parentId;
    while (currentParentId) {
      const parent = await this._repo.getById(currentParentId);
      if (!parent) break;
      if (parent.id === categoryId) {
        throw new AppError('VALIDATION_ERROR', 'Circular reference detected. A category cannot be a child of its own descendant.');
      }
      currentParentId = parent.parentId || '';
    }
  }

  protected override async validateCreate(item: Partial<CategoryDTO>): Promise<void> {
    const nameError = required(item.name) || minLength(2)(item.name || '') || maxLength(50)(item.name || '');
    if (nameError) throw new AppError('VALIDATION_ERROR', `Name: ${nameError}`);

    const slugError = required(item.slug) || maxLength(50)(item.slug || '');
    if (slugError) throw new AppError('VALIDATION_ERROR', `Slug: ${slugError}`);

    if (item.parentId) {
      const parentExists = await this._repo.getById(item.parentId);
      if (!parentExists) {
        throw new AppError('NOT_FOUND', 'The specified parent category does not exist.');
      }
    }

    await this.checkDuplicates(item);
  }

  protected override async validateUpdate(id: string, item: Partial<CategoryDTO>): Promise<void> {
    if (item.name !== undefined) {
      const nameError = required(item.name) || minLength(2)(item.name) || maxLength(50)(item.name);
      if (nameError) throw new AppError('VALIDATION_ERROR', `Name: ${nameError}`);
    }

    if (item.slug !== undefined) {
      const slugError = required(item.slug) || maxLength(50)(item.slug);
      if (slugError) throw new AppError('VALIDATION_ERROR', `Slug: ${slugError}`);
    }

    // Check circular reference if parentId is being updated
    if (item.parentId !== undefined) {
      const newParentId = this.normalizeParentId(item.parentId);
      if (newParentId) {
        await this.checkCircularReference(id, newParentId);
      }
    }

    // Check duplicate name if name or parentId is being updated
    if (item.name !== undefined || item.parentId !== undefined) {
      const existing = await this._repo.getById(id);
      if (existing) {
        const nameToCheck = item.name !== undefined ? item.name : existing.name;
        const parentToCheck = item.parentId !== undefined ? this.normalizeParentId(item.parentId) : this.normalizeParentId(existing.parentId);
        
        // Only check duplicates if name or parent actually changed
        if (nameToCheck !== existing.name || parentToCheck !== this.normalizeParentId(existing.parentId)) {
          const exists = await this._repo.nameExistsUnderParent(nameToCheck, parentToCheck);
          if (exists) {
            throw new AppError('DUPLICATE_ERROR', `A category with the name "${nameToCheck}" already exists under this parent.`);
          }
        }
      }
    }
  }

  // Pre-deletion checks
  public override async delete(id: string): Promise<void> {
    // 1. Check for children
    const hasChildren = await this._repo.hasChildren(id);
    if (hasChildren) {
      throw new AppError('VALIDATION_ERROR', 'Cannot delete this category because it contains sub-categories.');
    }

    // 2. Check for content references (books, bhajans, etc.)
    const contentCollections = ['books', 'bhajans'];
    for (const coll of contentCollections) {
      const isReferenced = await this._repo.isReferencedInCollection(coll, id);
      if (isReferenced) {
        throw new AppError('VALIDATION_ERROR', `Cannot delete this category because it is still referenced by items in ${coll}.`);
      }
    }

    // If checks pass, delete via super
    return super.delete(id);
  }
}

export const categoryService = new CategoryService(categoryRepository);
