/**
 * Entidad Category
 */

export class Category {
  constructor(
    public readonly id: string,
    public readonly tenant_id: string,
    public readonly parent_id: string | null,
    public readonly name: string,
    public readonly slug: string,
    public readonly description: string | null,
    public readonly image_url: string | null,
    public readonly display_order: number,
    public readonly is_active: boolean,
    public readonly created_at: Date,
    public readonly updated_at: Date
  ) {}

  /**
   * Verifica si la categoría está activa
   */
  isActive(): boolean {
    return this.is_active;
  }

  /**
   * Verifica si tiene categoría padre
   */
  hasParent(): boolean {
    return this.parent_id !== null;
  }
}

