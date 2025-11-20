/**
 * Use Case: Eliminar Product
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { TYPES } from '../../../../../config/types';

@injectable()
export class DeleteProductUseCase {
  constructor(@inject(TYPES.IProductRepository) private repository: IProductRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Product not found');
    }

    await this.repository.delete(id);
  }
}

