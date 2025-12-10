/**
 * Use Case: Limpiar carrito
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ICartRepository } from '../../domain/repositories/ICartRepository';
import { Cart } from '../../domain/entities/Cart';
import { TYPES } from '../../../../../config/types';

export interface ClearCartParams {
  tenant_id: string;
  customer_id?: string | null;
  session_id?: string | null;
}

@injectable()
export class ClearCartUseCase {
  constructor(@inject(TYPES.ICartRepository) private cartRepository: ICartRepository) {}

  async execute(params: ClearCartParams): Promise<void> {
    const { tenant_id, customer_id, session_id } = params;

    let cart: Cart | null = null;

    if (customer_id) {
      cart = await this.cartRepository.findByTenantAndCustomer(tenant_id, customer_id);
    } else if (session_id) {
      cart = await this.cartRepository.findByTenantAndSession(tenant_id, session_id);
    }

    if (!cart) {
      throw new Error('Cart not found');
    }

    if (cart.tenant_id !== tenant_id) {
      throw new Error('Cart belongs to different tenant');
    }

    await this.cartRepository.clearItems(cart.id);
  }
}

