/**
 * Use case para agregar producto a wishlist
 */

import { injectable, inject } from 'inversify';
import { IWishlistRepository } from '../../domain/repositories/IWishlistRepository';
import { IProductRepository } from '../../../products/domain/repositories/IProductRepository';
import { IProductVariantRepository } from '../../../product-variants/domain/repositories/IProductVariantRepository';
import { WishlistItem } from '../../domain/entities/WishlistItem';
import { AddToWishlistDto } from '../dto/AddToWishlistDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class AddToWishlistUseCase {
  constructor(
    @inject(TYPES.WishlistRepository)
    private wishlistRepository: IWishlistRepository,
    @inject(TYPES.IProductRepository)
    private productRepository: IProductRepository,
    @inject(TYPES.IProductVariantRepository)
    private productVariantRepository: IProductVariantRepository
  ) {}

  async execute(
    tenant_id: string,
    customer_id: string,
    dto: AddToWishlistDto
  ): Promise<WishlistItem> {
    // Verificar que el producto existe y pertenece al tenant
    const product = await this.productRepository.findById(dto.product_id);
    if (!product || product.tenant_id !== tenant_id) {
      throw new Error('Product not found');
    }

    if (!product.is_active) {
      throw new Error('Product is not active');
    }

    // Si se especifica variant_id, verificar que existe y pertenece al producto
    if (dto.variant_id) {
      const variant = await this.productVariantRepository.findById(dto.variant_id);
      if (!variant || variant.product_id !== dto.product_id) {
        throw new Error('Product variant not found');
      }
      if (!variant.is_active) {
        throw new Error('Product variant is not active');
      }
    }

    // Verificar si ya existe en la wishlist
    const existing = await this.wishlistRepository.findByProductAndVariant(
      tenant_id,
      customer_id,
      dto.product_id,
      dto.variant_id
    );

    if (existing) {
      return existing;
    }

    // Crear nuevo item
    return this.wishlistRepository.create({
      tenant_id,
      customer_id,
      product_id: dto.product_id,
      variant_id: dto.variant_id,
    });
  }
}

