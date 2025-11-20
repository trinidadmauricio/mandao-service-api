/**
 * Use Case: Eliminar Category
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { TYPES } from '../../../../../config/types';

@injectable()
export class DeleteCategoryUseCase {
  constructor(@inject(TYPES.ICategoryRepository) private repository: ICategoryRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Category not found');
    }

    // Verificar que no tenga categorías hijas
    const children = await this.repository.findAll(undefined, id);
    if (children.length > 0) {
      throw new Error('Cannot delete category with child categories');
    }

    await this.repository.delete(id);
  }
}

