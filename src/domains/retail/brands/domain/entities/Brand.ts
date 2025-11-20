/**
 * Entidad Brand
 */

export class Brand {
  constructor(
    public readonly id: string,
    public readonly tenant_id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly logo_url: string | null,
    public readonly description: string | null,
    public readonly is_active: boolean,
    public readonly created_at: Date,
    public readonly updated_at: Date
  ) {}

  /**
   * Verifica si la marca está activa
   */
  isActive(): boolean {
    return this.is_active;
  }
}

