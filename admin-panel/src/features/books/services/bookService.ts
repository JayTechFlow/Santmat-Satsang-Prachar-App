import { BaseCrudService } from '../../../core/services/BaseCrudService';
import { bookRepository, BookRepository } from '../repositories/bookRepository';
import { categoryRepository } from '../../categories/repositories/categoryRepository';
import { required, maxLength } from '../../../core/validation/validators';
import { AppError } from '../../../core/errors/AppError';
import type { BookDTO } from '../types';
import { authService } from '../../../core/services/authService';
import { storageService } from '../../../core/storage';

export class BookService extends BaseCrudService<BookDTO> {
  private _repo: BookRepository;

  constructor(repo: BookRepository) {
    super(repo);
    this._repo = repo;
  }

  protected override get currentUserId(): string {
    return authService.getCurrentUserId() || 'system';
  }

  private async checkCategory(categoryId: string): Promise<void> {
    const categoryExists = await categoryRepository.getById(categoryId);
    if (!categoryExists) {
      throw new AppError('NOT_FOUND', 'The selected category does not exist.');
    }
  }

  protected override async validateCreate(item: Partial<BookDTO>): Promise<void> {
    const titleError = required(item.title) || maxLength(200)(item.title || '');
    if (titleError) throw new AppError('VALIDATION_ERROR', `Title: ${titleError}`);

    const authorError = required(item.author) || maxLength(100)(item.author || '');
    if (authorError) throw new AppError('VALIDATION_ERROR', `Author: ${authorError}`);

    if (!item.categoryId) {
      throw new AppError('VALIDATION_ERROR', 'Category is required.');
    }
    
    await this.checkCategory(item.categoryId);

    const exists = await this._repo.titleExists(item.title as string);
    if (exists) {
      throw new AppError('DUPLICATE_ERROR', `A book with the title "${item.title}" already exists.`);
    }

    // Initialize analytics defaults
    item.downloadCount = 0;
    item.viewCount = 0;
  }

  protected override async validateUpdate(id: string, item: Partial<BookDTO>): Promise<void> {
    if (item.title !== undefined) {
      const titleError = required(item.title) || maxLength(200)(item.title);
      if (titleError) throw new AppError('VALIDATION_ERROR', `Title: ${titleError}`);
      
      const exists = await this._repo.titleExists(item.title, id);
      if (exists) {
        throw new AppError('DUPLICATE_ERROR', `A book with the title "${item.title}" already exists.`);
      }
    }

    if (item.author !== undefined) {
      const authorError = required(item.author) || maxLength(100)(item.author);
      if (authorError) throw new AppError('VALIDATION_ERROR', `Author: ${authorError}`);
    }

    if (item.categoryId) {
      await this.checkCategory(item.categoryId);
    }

    const existing = await this._repo.getById(id);
    if (!existing) throw new AppError('NOT_FOUND', 'Book not found.');

    // Cleanup replaced storage files
    if (item.coverImageUrl && existing.coverImageUrl && item.coverImageUrl !== existing.coverImageUrl) {
      try {
        await storageService.deleteFile(existing.coverImageUrl);
      } catch (e) {
        console.warn('Failed to delete old cover image from storage', e);
      }
    }

    if (item.pdfUrl && existing.pdfUrl && item.pdfUrl !== existing.pdfUrl) {
      try {
        await storageService.deleteFile(existing.pdfUrl);
      } catch (e) {
        console.warn('Failed to delete old PDF from storage', e);
      }
    }
  }

  public override async delete(id: string): Promise<void> {
    const existing = await this._repo.getById(id);
    
    await super.delete(id);

    // Delete orphaned files
    if (existing?.coverImageUrl) {
      try {
        await storageService.deleteFile(existing.coverImageUrl);
      } catch (e) {
        console.warn('Failed to delete cover image on book deletion', e);
      }
    }
    if (existing?.pdfUrl) {
      try {
        await storageService.deleteFile(existing.pdfUrl);
      } catch (e) {
        console.warn('Failed to delete PDF on book deletion', e);
      }
    }
  }
}

export const bookService = new BookService(bookRepository);
