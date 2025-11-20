/**
 * Use Case: Listar Categories
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { Category } from '../../domain/entities/Category';
import { TYPES } from '../../../../../config/types';

@injectable()
export class ListCategoriesUseCase {
  constructor(@inject(TYPES.ICategoryRepository) private repository: ICategoryRepository) {}

  async execute(tenant_id?: string, parent_id?: string | null): Promise<Category[]> {
    return await this.repository.findAll(tenant_id, parent_id);
  }
}

