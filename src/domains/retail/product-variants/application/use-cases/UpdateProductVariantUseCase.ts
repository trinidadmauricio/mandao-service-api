/**
 * Use Case: Actualizar ProductVariant
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IProductVariantRepository } from '../../domain/repositories/IProductVariantRepository';
import { ProductVariant } from '../../domain/entities/ProductVariant';
import { UpdateProductVariantDto } from '../dto/CreateProductVariantDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class UpdateProductVariantUseCase {
  constructor(@inject(TYPES.IProductVariantRepository) private repository: IProductVariantRepository) {}

  async execute(id: string, dto: UpdateProductVariantDto): Promise<ProductVariant> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Product variant not found');
    }

    // Si se actualiza el SKU, verificar que no esté duplicado
    if (dto.sku && dto.sku !== existing.sku) {
      const duplicate = await this.repository.findBySku(existing.tenant_id, dto.sku);
      if (duplicate) {
        throw new Error('Product variant with this SKU already exists');
      }
    }

    return await this.repository.update(id, {
      sku: dto.sku,
      barcode: dto.barcode,
      option1_name: dto.option1_name,
      option1_value: dto.option1_value,
      option2_name: dto.option2_name,
      option2_value: dto.option2_value,
      option3_name: dto.option3_name,
      option3_value: dto.option3_value,
      price_adjustment: dto.price_adjustment,
      cost_price: dto.cost_price,
      currency: dto.currency,
      track_inventory: dto.track_inventory,
      current_stock: dto.current_stock,
      weight_kg: dto.weight_kg,
      image_url: dto.image_url,
      is_active: dto.is_active,
    });
  }
}

