/**
 * Use Case: Remover cupón del carrito
 */

import { injectable, inject } from 'inversify';
import { TYPES } from '../../../../../config/types';
import { ICartRepository } from '../../domain/repositories/ICartRepository';
import { Cart } from '../../domain/entities/Cart';

export interface RemoveCouponParams {
  tenant_id: string;
  customer_id?: string | null;
  session_id?: string | null;
}

@injectable()
export class RemoveCouponUseCase {
  constructor(@inject(TYPES.ICartRepository) private cartRepository: ICartRepository) {}

  async execute(params: RemoveCouponParams): Promise<Cart> {
    const { tenant_id, customer_id, session_id } = params;

    // Obtener carrito
    let cart: Cart | null = null;

    if (customer_id) {
      cart = await this.cartRepository.findByTenantAndCustomer(tenant_id, customer_id);
    } else if (session_id) {
      cart = await this.cartRepository.findByTenantAndSession(tenant_id, session_id);
    }

    if (!cart) {
      throw new Error('Cart not found');
    }

    if (cart.isExpired()) {
      throw new Error('Cart is expired');
    }

    // Remover cupón
    const updatedCart = await this.cartRepository.update(cart.id, {
      coupon_code: null,
    });

    return updatedCart;
  }
}

