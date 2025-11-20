/**
 * Use Case: Obtener ProductVariant
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IProductVariantRepository } from '../../domain/repositories/IProductVariantRepository';
import { ProductVariant } from '../../domain/entities/ProductVariant';
import { TYPES } from '../../../../../config/types';

@injectable()
export class GetProductVariantUseCase {
  constructor(@inject(TYPES.IProductVariantRepository) private repository: IProductVariantRepository) {}

  async execute(id: string): Promise<ProductVariant> {
    const variant = await this.repository.findById(id);
    if (!variant) {
      throw new Error('Product variant not found');
    }
    return variant;
  }
}

