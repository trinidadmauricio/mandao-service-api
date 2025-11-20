/**
 * Use Case: Actualizar Product
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { ICategoryRepository } from '../../../categories/domain/repositories/ICategoryRepository';
import { IBrandRepository } from '../../../brands/domain/repositories/IBrandRepository';
import { Product } from '../../domain/entities/Product';
import { UpdateProductDto } from '../dto/CreateProductDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class UpdateProductUseCase {
  constructor(
    @inject(TYPES.IProductRepository) private repository: IProductRepository,
    @inject(TYPES.ICategoryRepository) private categoryRepository: ICategoryRepository,
    @inject(TYPES.IBrandRepository) private brandRepository: IBrandRepository
  ) {}

  async execute(id: string, dto: UpdateProductDto): Promise<Product> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Product not found');
    }

    // Si se actualiza el SKU, verificar que no esté duplicado
    if (dto.sku && dto.sku !== existing.sku) {
      const duplicate = await this.repository.findBySku(existing.tenant_id, dto.sku);
      if (duplicate) {
        throw new Error('Product with this SKU already exists');
      }
    }

    // Si se actualiza category_id, verificar que existe
    if (dto.category_id && dto.category_id !== existing.category_id) {
      const category = await this.categoryRepository.findById(dto.category_id);
      if (!category) {
        throw new Error('Category not found');
      }
      if (category.tenant_id !== existing.tenant_id) {
        throw new Error('Category belongs to different tenant');
      }
    }

    // Si se actualiza brand_id, verificar que existe
    if (dto.brand_id !== undefined && dto.brand_id !== existing.brand_id) {
      if (dto.brand_id) {
        const brand = await this.brandRepository.findById(dto.brand_id);
        if (!brand) {
          throw new Error('Brand not found');
        }
        if (brand.tenant_id !== existing.tenant_id) {
          throw new Error('Brand belongs to different tenant');
        }
      }
    }

    return await this.repository.update(id, {
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
      currency: dto.currency,
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
  }
}

