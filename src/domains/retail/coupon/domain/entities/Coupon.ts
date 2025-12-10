/**
 * Entidad Coupon
 */

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export class Coupon {
  constructor(
    public readonly id: string,
    public readonly tenant_id: string,
    public readonly code: string,
    public readonly discount_type: DiscountType,
    public readonly discount_value: number,
    public readonly min_order_value: number | null,
    public readonly max_uses: number | null,
    public readonly current_uses: number,
    public readonly valid_from: Date,
    public readonly valid_until: Date,
    public readonly is_active: boolean,
    public readonly created_at: Date,
    public readonly updated_at: Date
  ) {}

  /**
   * Verifica si el cupón es válido para usar
   */
  isValid(): boolean {
    if (!this.is_active) {
      return false;
    }

    const now = new Date();
    if (now < this.valid_from || now > this.valid_until) {
      return false;
    }

    if (this.max_uses !== null && this.current_uses >= this.max_uses) {
      return false;
    }

    return true;
  }

  /**
   * Verifica si el cupón puede aplicarse a un monto dado
   */
  canApplyToAmount(amount: number): boolean {
    if (this.min_order_value === null) {
      return true;
    }
    return amount >= this.min_order_value;
  }

  /**
   * Calcula el descuento para un monto dado
   */
  calculateDiscount(amount: number): number {
    if (!this.isValid()) {
      return 0;
    }

    if (!this.canApplyToAmount(amount)) {
      return 0;
    }

    if (this.discount_type === DiscountType.PERCENTAGE) {
      return (amount * this.discount_value) / 100;
    } else {
      // FIXED_AMOUNT
      return Math.min(this.discount_value, amount);
    }
  }
}

