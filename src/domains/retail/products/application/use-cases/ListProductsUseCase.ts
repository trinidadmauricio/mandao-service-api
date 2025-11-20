/**
 * Use Case: Listar Products
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { Product } from '../../domain/entities/Product';
import { TYPES } from '../../../../../config/types';

@injectable()
export class ListProductsUseCase {
  constructor(@inject(TYPES.IProductRepository) private repository: IProductRepository) {}

  async execute(tenant_id?: string, category_id?: string, is_active?: boolean): Promise<Product[]> {
    return await this.repository.findAll(tenant_id, category_id, is_active);
  }
}

