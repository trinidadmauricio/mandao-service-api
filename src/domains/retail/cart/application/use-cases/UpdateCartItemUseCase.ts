/**
 * Use Case: Actualizar item del carrito
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ICartRepository } from '../../domain/repositories/ICartRepository';
import { IProductRepository } from '../../../products/domain/repositories/IProductRepository';
import { IProductVariantRepository } from '../../../product-variants/domain/repositories/IProductVariantRepository';
import { UpdateCartItemDto } from '../dto/UpdateCartItemDto';
import { Cart } from '../../domain/entities/Cart';
import { TYPES } from '../../../../../config/types';

export interface UpdateCartItemParams {
  tenant_id: string;
  item_id: string;
  data: UpdateCartItemDto;
}

@injectable()
export class UpdateCartItemUseCase {
  constructor(
    @inject(TYPES.ICartRepository) private cartRepository: ICartRepository,
    @inject(TYPES.IProductRepository) private productRepository: IProductRepository,
    @inject(TYPES.IProductVariantRepository) private variantRepository: IProductVariantRepository
  ) {}

  async execute(params: UpdateCartItemParams): Promise<Cart> {
    const { tenant_id, item_id, data } = params;

    // Obtener cart que contiene el item
    const cart = await this.cartRepository.findCartByItemId(item_id);
    if (!cart) {
      throw new Error('Cart item not found');
    }

    if (cart.tenant_id !== tenant_id) {
      throw new Error('Cart belongs to different tenant');
    }

    const item = cart.items.find((i) => i.id === item_id);
    if (!item) {
      throw new Error('Cart item not found');
    }

    // Validar producto y stock
    const product = await this.productRepository.findById(item.product_id);
    if (!product || product.tenant_id !== tenant_id) {
      throw new Error('Product not found');
    }

    let variant = null;
    if (item.variant_id) {
      variant = await this.variantRepository.findById(item.variant_id);
      if (!variant) {
        throw new Error('Product variant not found');
      }
    }

    // Validar stock
    const stock = variant ? variant.current_stock : product.current_stock;
    const trackInventory = variant ? variant.track_inventory : product.track_inventory;

    if (trackInventory && stock < data.quantity) {
      throw new Error(`Insufficient stock. Only ${stock} items available`);
    }

    // Actualizar item
    await this.cartRepository.updateItem(item_id, data);

    // Recargar carrito
    const updatedCart = await this.cartRepository.findById(cart.id);
    if (!updatedCart) {
      throw new Error('Cart not found after update');
    }

    return updatedCart;
  }

}

