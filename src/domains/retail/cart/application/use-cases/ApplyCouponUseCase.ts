/**
 * Use Case: Aplicar cupón al carrito
 */

import { injectable, inject } from 'inversify';
import { TYPES } from '../../../../../config/types';
import { ICartRepository } from '../../domain/repositories/ICartRepository';
import { ICouponRepository } from '../../../coupon/domain/repositories/ICouponRepository';
import { Cart } from '../../domain/entities/Cart';

export interface ApplyCouponParams {
  tenant_id: string;
  customer_id?: string | null;
  session_id?: string | null;
  coupon_code: string;
}

@injectable()
export class ApplyCouponUseCase {
  constructor(
    @inject(TYPES.ICartRepository) private cartRepository: ICartRepository,
    @inject(TYPES.ICouponRepository) private couponRepository: ICouponRepository
  ) {}

  async execute(params: ApplyCouponParams): Promise<Cart> {
    const { tenant_id, customer_id, session_id, coupon_code } = params;

    // Buscar cupón
    const coupon = await this.couponRepository.findByCode(tenant_id, coupon_code);
    if (!coupon) {
      throw new Error('Coupon not found');
    }

    // Validar cupón
    if (!coupon.isValid()) {
      throw new Error('Coupon is not valid');
    }

    // Obtener o crear carrito
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

    // Validar monto mínimo
    const subtotal = cart.calculateSubtotal();
    if (!coupon.canApplyToAmount(subtotal)) {
      throw new Error(
        `Minimum order value of ${coupon.min_order_value} required to use this coupon`
      );
    }

    // Aplicar cupón
    const updatedCart = await this.cartRepository.update(cart.id, {
      coupon_code: coupon.code,
    });

    return updatedCart;
  }
}

