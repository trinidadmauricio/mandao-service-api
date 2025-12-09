/**
 * WishlistItem Entity
 */

export class WishlistItem {
  constructor(
    public readonly id: string,
    public readonly tenant_id: string,
    public readonly customer_id: string,
    public readonly product_id: string,
    public readonly variant_id: string | null,
    public readonly created_at: Date
  ) {}
}

