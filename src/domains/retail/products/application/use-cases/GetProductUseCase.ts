/**
 * Use Case: Obtener Product
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { Product } from '../../domain/entities/Product';
import { TYPES } from '../../../../../config/types';

@injectable()
export class GetProductUseCase {
  constructor(@inject(TYPES.IProductRepository) private repository: IProductRepository) {}

  async execute(id: string): Promise<Product> {
    const product = await this.repository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }
}

