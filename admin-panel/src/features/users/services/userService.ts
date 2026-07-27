import { BaseCrudService } from '../../../core/services/BaseCrudService';
import { userRepository, UserRepository } from '../repositories/userRepository';
import { roleRepository } from '../repositories/roleRepository';
import { required, maxLength } from '../../../core/validation/validators';
import { AppError } from '../../../core/errors/AppError';
import type { UserDTO } from '../types';
import { auth } from '../../../firebase/config';
import { storageService } from '../../../core/storage';

export class UserService extends BaseCrudService<UserDTO> {
  private _repo: UserRepository;

  constructor(repo: UserRepository) {
    super(repo);
    this._repo = repo;
  }

  protected override get currentUserId(): string {
    return auth.currentUser?.uid || 'system';
  }

  private async checkRoles(roleIds: string[]): Promise<void> {
    if (!roleIds || roleIds.length === 0) return;
    for (const roleId of roleIds) {
      const roleExists = await roleRepository.getById(roleId);
      if (!roleExists) {
        throw new AppError('NOT_FOUND', `Role ID ${roleId} does not exist.`);
      }
    }
  }

  protected override async validateCreate(item: Partial<UserDTO>): Promise<void> {
    const nameError = required(item.fullName) || maxLength(100)(item.fullName || '');
    if (nameError) throw new AppError('VALIDATION_ERROR', `Name: ${nameError}`);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emError = required(item.email) || (!emailRegex.test(item.email || '') ? 'Invalid email format' : null);
    if (emError) throw new AppError('VALIDATION_ERROR', `Email: ${emError}`);

    const emailExists = await this._repo.checkEmailExists(item.email!);
    if (emailExists) {
      throw new AppError('DUPLICATE_ERROR', `Email ${item.email} is already in use.`);
    }

    if (item.roleIds) {
      await this.checkRoles(item.roleIds);
    }
  }

  protected override async validateUpdate(id: string, item: Partial<UserDTO>): Promise<void> {
    if (item.fullName !== undefined) {
      const nameError = required(item.fullName) || maxLength(100)(item.fullName);
      if (nameError) throw new AppError('VALIDATION_ERROR', `Name: ${nameError}`);
    }

    if (item.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const emError = required(item.email) || (!emailRegex.test(item.email || '') ? 'Invalid email format' : null);
      if (emError) throw new AppError('VALIDATION_ERROR', `Email: ${emError}`);
      
      const emailExists = await this._repo.checkEmailExists(item.email, id);
      if (emailExists) {
        throw new AppError('DUPLICATE_ERROR', `Email ${item.email} is already in use.`);
      }
    }

    if (item.roleIds) {
      await this.checkRoles(item.roleIds);
    }

    // Security constraints
    if (item.status === 'archived' || item.status === 'suspended') {
      if (id === this.currentUserId) {
        throw new AppError('PERMISSION_DENIED', 'You cannot suspend or archive your own account.');
      }
    }

    const existing = await this._repo.getById(id);
    if (!existing) throw new AppError('NOT_FOUND', 'User not found.');

    // Avatar cleanup
    if (item.avatarUrl && existing.avatarUrl && item.avatarUrl !== existing.avatarUrl) {
      try {
        await storageService.deleteFile(existing.avatarUrl);
      } catch (e) {
        console.warn('Failed to delete old avatar', e);
      }
    }
  }

  public override async delete(id: string): Promise<void> {
    if (id === this.currentUserId) {
      throw new AppError('PERMISSION_DENIED', 'You cannot delete your own account.');
    }

    // Super Admin check could be implemented here by fetching the user and checking their role.
    const existing = await this._repo.getById(id);
    if (!existing) throw new AppError('NOT_FOUND', 'User not found');
    
    // In a real app, this would also delete the Firebase Auth user via a Cloud Function
    // For now, we delete the Firestore profile
    await super.delete(id);
    
    if (existing.avatarUrl) {
      try {
        await storageService.deleteFile(existing.avatarUrl);
      } catch (e) {
        console.warn('Failed to delete avatar on user deletion', e);
      }
    }
  }
}

export const userService = new UserService(userRepository);
