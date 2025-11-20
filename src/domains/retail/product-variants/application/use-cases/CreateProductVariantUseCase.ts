/**
 * Use Case: Crear ProductVariant
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IProductVariantRepository } from '../../domain/repositories/IProductVariantRepository';
import { IProductRepository } from '../../../products/domain/repositories/IProductRepository';
import { ITenantRepository } from '../../../../shared/tenants/domain/repositories/ITenantRepository';
import { ProductVariant } from '../../domain/entities/ProductVariant';
import { CreateProductVariantDto } from '../dto/CreateProductVariantDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class CreateProductVariantUseCase {
  constructor(
    @inject(TYPES.IProductVariantRepository) private repository: IProductVariantRepository,
    @inject(TYPES.IProductRepository) private productRepository: IProductRepository,
    @inject(TYPES.ITenantRepository) private tenantRepository: ITenantRepository
  ) {}

  async execute(dto: CreateProductVariantDto): Promise<ProductVariant> {
    // Verificar tenant
    const tenant = await this.tenantRepository.findById(dto.tenant_id);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Verificar que el producto existe
    const product = await this.productRepository.findById(dto.product_id);
    if (!product) {
      throw new Error('Product not found');
    }
    if (product.tenant_id !== dto.tenant_id) {
      throw new Error('Product belongs to different tenant');
    }

    // Verificar que el SKU no esté duplicado
    const existing = await this.repository.findBySku(dto.tenant_id, dto.sku);
    if (existing) {
      throw new Error('Product variant with this SKU already exists');
    }

    // Usar currency del tenant si no se proporciona
    const currency = dto.currency || tenant.default_currency;

    const variant = await this.repository.create({
      product_id: dto.product_id,
      tenant_id: dto.tenant_id,
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
      currency,
      track_inventory: dto.track_inventory,
      current_stock: dto.current_stock,
      weight_kg: dto.weight_kg,
      image_url: dto.image_url,
      is_active: dto.is_active,
    });

    // Actualizar has_variants del producto si es necesario
    if (!product.has_variants) {
      await this.productRepository.update(product.id, { has_variants: true });
    }

    return variant;
  }
}

