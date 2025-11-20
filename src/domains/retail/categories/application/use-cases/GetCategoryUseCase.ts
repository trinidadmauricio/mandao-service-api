/**
 * Use Case: Obtener Category
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { Category } from '../../domain/entities/Category';
import { TYPES } from '../../../../../config/types';

@injectable()
export class GetCategoryUseCase {
  constructor(@inject(TYPES.ICategoryRepository) private repository: ICategoryRepository) {}

  async execute(id: string): Promise<Category> {
    const category = await this.repository.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }
}

