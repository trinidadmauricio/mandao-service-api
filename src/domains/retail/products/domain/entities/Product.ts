/**
 * Entidad Product
 */

export type UnitOfMeasure = 'UNIT' | 'KG' | 'G' | 'LITER' | 'ML' | 'BOX' | 'PACK';

export class Product {
  constructor(
    public readonly id: string,
    public readonly tenant_id: string,
    public readonly sku: string,
    public readonly barcode: string | null,
    public readonly name: string,
    public readonly description: string | null,
    public readonly name_translations: Record<string, string> | null,
    public readonly description_translations: Record<string, string> | null,
    public readonly category_id: string,
    public readonly brand_id: string | null,
    public readonly cost_price: number,
    public readonly selling_price: number,
    public readonly compare_at_price: number | null,
    public readonly currency: string,
    public readonly track_inventory: boolean,
    public readonly current_stock: number,
    public readonly min_stock_alert: number,
    public readonly uom: UnitOfMeasure,
    public readonly weight_kg: number | null,
    public readonly dimensions: Record<string, unknown> | null,
    public readonly images: Record<string, unknown>,
    public readonly featured_image_url: string | null,
    public readonly has_variants: boolean,
    public readonly is_active: boolean,
    public readonly is_featured: boolean,
    public readonly meta_title: string | null,
    public readonly meta_description: string | null,
    public readonly created_at: Date,
    public readonly updated_at: Date
  ) {}

  /**
   * Verifica si el producto está activo
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

  /**
   * Verifica si está bajo el mínimo de stock
   */
  isLowStock(): boolean {
    return this.track_inventory && this.current_stock <= this.min_stock_alert;
  }
}

