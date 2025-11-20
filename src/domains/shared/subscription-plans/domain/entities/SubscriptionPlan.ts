/**
 * Entidad SubscriptionPlan
 */

export class SubscriptionPlan {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: 'BASIC' | 'PRO' | 'ENTERPRISE' | 'CUSTOM',
    public readonly price_monthly: number,
    public readonly price_yearly: number,
    public readonly features: Record<string, unknown>,
    public readonly max_products: number | null,
    public readonly max_orders_month: number | null,
    public readonly max_branches: number | null,
    public readonly created_at: Date,
    public readonly updated_at: Date
  ) {}

  /**
   * Verifica si el plan tiene límite de productos
   */
  hasProductLimit(): boolean {
    return this.max_products !== null;
  }

  /**
   * Verifica si el plan tiene límite de órdenes
   */
  hasOrderLimit(): boolean {
    return this.max_orders_month !== null;
  }

  /**
   * Verifica si el plan tiene límite de branches
   */
  hasBranchLimit(): boolean {
    return this.max_branches !== null;
  }
}

