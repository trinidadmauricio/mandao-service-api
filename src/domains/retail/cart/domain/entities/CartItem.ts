/**
 * Entidad CartItem
 */

export class CartItem {
  constructor(
    public readonly id: string,
    public readonly cart_id: string,
    public readonly product_id: string,
    public readonly variant_id: string | null,
    public readonly quantity: number,
    public readonly unit_price: number,
    public readonly created_at: Date,
    public readonly updated_at: Date
  ) {}

  /**
   * Calcula el precio total del item
   */
  get total_price(): number {
    return this.unit_price * this.quantity;
  }

  /**
   * Verifica si el item tiene variante
   */
  hasVariant(): boolean {
    return this.variant_id !== null;
  }
}

