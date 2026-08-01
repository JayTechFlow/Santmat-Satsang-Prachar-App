import { BaseCrudService } from '../../../core/services/BaseCrudService';
import { roleRepository, RoleRepository } from '../repositories/roleRepository';
import { required } from '../../../core/validation/validators';
import { AppError } from '../../../core/errors/AppError';
import type { RoleDTO } from '../types';
import { authService } from '../../../core/services/authService';

export class RoleService extends BaseCrudService<RoleDTO> {
  private _repo: RoleRepository;

  constructor(repo: RoleRepository) {
    super(repo);
    this._repo = repo;
  }

  protected override get currentUserId(): string {
    return authService.getCurrentUserId() || 'system';
  }

  protected override async validateCreate(item: Partial<RoleDTO>): Promise<void> {
    const nameError = required(item.name);
    if (nameError) throw new AppError('VALIDATION_ERROR', `Name: ${nameError}`);
  }

  protected override async validateUpdate(id: string, item: Partial<RoleDTO>): Promise<void> {
    if (item.name !== undefined) {
      const nameError = required(item.name);
      if (nameError) throw new AppError('VALIDATION_ERROR', `Name: ${nameError}`);
    }
    
    const existing = await this._repo.getById(id);
    if (!existing) throw new AppError('NOT_FOUND', 'Role not found.');

    if (existing.isSystemRole && (item.isSystemRole === false || item.name !== existing.name)) {
      throw new AppError('PERMISSION_DENIED', 'Cannot modify system roles.');
    }
  }

  public override async delete(id: string): Promise<void> {
    const existing = await this._repo.getById(id);
    if (existing?.isSystemRole) {
      throw new AppError('PERMISSION_DENIED', 'Cannot delete system roles.');
    }
    await super.delete(id);
  }
}

export const roleService = new RoleService(roleRepository);
