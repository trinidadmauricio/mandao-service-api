/**
 * Use Case: Eliminar ProductVariant
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IProductVariantRepository } from '../../domain/repositories/IProductVariantRepository';
import { IProductRepository } from '../../../products/domain/repositories/IProductRepository';
import { TYPES } from '../../../../../config/types';

@injectable()
export class DeleteProductVariantUseCase {
  constructor(
    @inject(TYPES.IProductVariantRepository) private repository: IProductVariantRepository,
    @inject(TYPES.IProductRepository) private productRepository: IProductRepository
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Product variant not found');
    }

    await this.repository.delete(id);

    // Verificar si el producto aún tiene variants
    const remainingVariants = await this.repository.findByProductId(existing.product_id);
    if (remainingVariants.length === 0) {
      // Actualizar has_variants del producto a false
      await this.productRepository.update(existing.product_id, { has_variants: false });
    }
  }
}

