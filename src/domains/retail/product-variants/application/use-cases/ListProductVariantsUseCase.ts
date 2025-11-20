/**
 * Use Case: Listar ProductVariants
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IProductVariantRepository } from '../../domain/repositories/IProductVariantRepository';
import { ProductVariant } from '../../domain/entities/ProductVariant';
import { TYPES } from '../../../../../config/types';

@injectable()
export class ListProductVariantsUseCase {
  constructor(@inject(TYPES.IProductVariantRepository) private repository: IProductVariantRepository) {}

  async execute(tenant_id?: string, product_id?: string): Promise<ProductVariant[]> {
    return await this.repository.findAll(tenant_id, product_id);
  }
}

