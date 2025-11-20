/**
 * Entidad StockByBranch
 */

export class StockByBranch {
  constructor(
    public readonly id: string,
    public readonly tenant_id: string,
    public readonly product_id: string,
    public readonly variant_id: string | null,
    public readonly branch_id: string,
    public readonly current_stock: number,
    public readonly reserved_stock: number,
    public readonly available_stock: number,
    public readonly last_updated_at: Date,
    public readonly created_at: Date,
    public readonly updated_at: Date
  ) {}

  /**
   * Verifica si hay stock disponible
   */
  hasAvailableStock(quantity: number): boolean {
    return this.available_stock >= quantity;
  }

  /**
   * Calcula el stock disponible (current - reserved)
   */
  calculateAvailableStock(): number {
    return Math.max(0, this.current_stock - this.reserved_stock);
  }
}

