/**
 * Use Case: Remover item del carrito
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ICartRepository } from '../../domain/repositories/ICartRepository';
import { Cart } from '../../domain/entities/Cart';
import { TYPES } from '../../../../../config/types';

export interface RemoveCartItemParams {
  tenant_id: string;
  item_id: string;
}

@injectable()
export class RemoveCartItemUseCase {
  constructor(@inject(TYPES.ICartRepository) private cartRepository: ICartRepository) {}

  async execute(params: RemoveCartItemParams): Promise<Cart> {
    const { tenant_id, item_id } = params;

    // Obtener cart que contiene el item
    const cart = await this.cartRepository.findCartByItemId(item_id);
    if (!cart) {
      throw new Error('Cart item not found');
    }

    if (cart.tenant_id !== tenant_id) {
      throw new Error('Cart belongs to different tenant');
    }

    // Remover item
    await this.cartRepository.removeItem(item_id);

    // Recargar carrito
    const updatedCart = await this.cartRepository.findById(cart.id);
    if (!updatedCart) {
      throw new Error('Cart not found after removing item');
    }

    return updatedCart;
  }
}

