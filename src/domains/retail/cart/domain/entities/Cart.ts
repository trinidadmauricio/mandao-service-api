/**
 * Entidad Cart
 */

import { CartItem } from './CartItem';

export class Cart {
  constructor(
    public readonly id: string,
    public readonly tenant_id: string,
    public readonly customer_id: string | null,
    public readonly session_id: string | null,
    public readonly coupon_code: string | null,
    public readonly expires_at: Date | null,
    public readonly created_at: Date,
    public readonly updated_at: Date,
    public readonly items: CartItem[]
  ) {}

  /**
   * Verifica si el carrito está expirado
   */
  isExpired(): boolean {
    if (!this.expires_at) {
      return false;
    }
    return new Date() > this.expires_at;
  }

  /**
   * Calcula el subtotal del carrito
   */
  calculateSubtotal(): number {
    return this.items.reduce((sum, item) => sum + item.total_price, 0);
  }

  /**
   * Verifica si el carrito está vacío
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Obtiene el total de items en el carrito
   */
  getTotalItems(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}

