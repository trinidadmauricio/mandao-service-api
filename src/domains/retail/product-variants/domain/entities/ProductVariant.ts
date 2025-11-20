/**
 * Entidad ProductVariant
 */

export class ProductVariant {
  constructor(
    public readonly id: string,
    public readonly product_id: string,
    public readonly tenant_id: string,
    public readonly sku: string,
    public readonly barcode: string | null,
    public readonly option1_name: string | null,
    public readonly option1_value: string | null,
    public readonly option2_name: string | null,
    public readonly option2_value: string | null,
    public readonly option3_name: string | null,
    public readonly option3_value: string | null,
    public readonly price_adjustment: number,
    public readonly cost_price: number | null,
    public readonly currency: string,
    public readonly track_inventory: boolean,
    public readonly current_stock: number,
    public readonly weight_kg: number | null,
    public readonly image_url: string | null,
    public readonly is_active: boolean,
    public readonly created_at: Date,
    public readonly updated_at: Date
  ) {}

  /**
   * Verifica si el variant está activo
   */
  isActive(): boolean {
    return this.is_active;
  }

  /**
   * Verifica si tiene stock disponible
   */
  hasStock(): boolean {
    return this.current_stock > 0;
  }
}

