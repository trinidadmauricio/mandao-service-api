/**
 * Use Case: Obtener carrito
 * 
 * Obtiene el carrito del usuario (autenticado o guest)
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ICartRepository } from '../../domain/repositories/ICartRepository';
import { Cart } from '../../domain/entities/Cart';
import { TYPES } from '../../../../../config/types';

export interface GetCartParams {
  tenant_id: string;
  customer_id?: string | null;
  session_id?: string | null;
}

@injectable()
export class GetCartUseCase {
  constructor(@inject(TYPES.ICartRepository) private cartRepository: ICartRepository) {}

  async execute(params: GetCartParams): Promise<Cart | null> {
    const { tenant_id, customer_id, session_id } = params;

    // Si hay customer_id, buscar por customer
    if (customer_id) {
      const cart = await this.cartRepository.findByTenantAndCustomer(tenant_id, customer_id);
      if (cart && !cart.isExpired()) {
        return cart;
      }
    }

    // Si hay session_id, buscar por session
    if (session_id) {
      const cart = await this.cartRepository.findByTenantAndSession(tenant_id, session_id);
      if (cart && !cart.isExpired()) {
        return cart;
      }
    }

    return null;
  }
}

