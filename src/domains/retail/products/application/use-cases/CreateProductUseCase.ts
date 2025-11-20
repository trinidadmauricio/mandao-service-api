/**
 * Use Case: Crear Product
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { ICategoryRepository } from '../../../categories/domain/repositories/ICategoryRepository';
import { IBrandRepository } from '../../../brands/domain/repositories/IBrandRepository';
import { ITenantRepository } from '../../../../shared/tenants/domain/repositories/ITenantRepository';
import { Product } from '../../domain/entities/Product';
import { CreateProductDto } from '../dto/CreateProductDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class CreateProductUseCase {
  constructor(
    @inject(TYPES.IProductRepository) private repository: IProductRepository,
    @inject(TYPES.ICategoryRepository) private categoryRepository: ICategoryRepository,
    @inject(TYPES.IBrandRepository) private brandRepository: IBrandRepository,
    @inject(TYPES.ITenantRepository) private tenantRepository: ITenantRepository
  ) {}

  async execute(dto: CreateProductDto): Promise<Product> {
    // Verificar tenant
    const tenant = await this.tenantRepository.findById(dto.tenant_id);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Verificar que el SKU no esté duplicado
    const existing = await this.repository.findBySku(dto.tenant_id, dto.sku);
    if (existing) {
      throw new Error('Product with this SKU already exists');
    }

    // Verificar que la categoría existe
    const category = await this.categoryRepository.findById(dto.category_id);
    if (!category) {
      throw new Error('Category not found');
    }
    if (category.tenant_id !== dto.tenant_id) {
      throw new Error('Category belongs to different tenant');
    }

    // Verificar que la marca existe si se proporciona
    if (dto.brand_id) {
      const brand = await this.brandRepository.findById(dto.brand_id);
      if (!brand) {
        throw new Error('Brand not found');
      }
      if (brand.tenant_id !== dto.tenant_id) {
        throw new Error('Brand belongs to different tenant');
      }
    }

    // Usar currency del tenant si no se proporciona
    const currency = dto.currency || tenant.default_currency;

    const product = await this.repository.create({
      tenant_id: dto.tenant_id,
      sku: dto.sku,
      barcode: dto.barcode,
      name: dto.name,
      description: dto.description,
      name_translations: dto.name_translations,
      description_translations: dto.description_translations,
      category_id: dto.category_id,
      brand_id: dto.brand_id,
      cost_price: dto.cost_price,
      selling_price: dto.selling_price,
      compare_at_price: dto.compare_at_price,
      currency,
      track_inventory: dto.track_inventory,
      current_stock: dto.current_stock,
      min_stock_alert: dto.min_stock_alert,
      uom: dto.uom,
      weight_kg: dto.weight_kg,
      dimensions: dto.dimensions,
      images: dto.images,
      featured_image_url: dto.featured_image_url,
      has_variants: dto.has_variants,
      is_active: dto.is_active,
      is_featured: dto.is_featured,
      meta_title: dto.meta_title,
      meta_description: dto.meta_description,
    });

    return product;
  }
}

