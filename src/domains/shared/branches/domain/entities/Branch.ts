/**
 * Entidad Branch
 */

export class Branch {
  constructor(
    public readonly id: string,
    public readonly tenant_id: string,
    public readonly name: string,
    public readonly address: string,
    public readonly gps_lat: number,
    public readonly gps_lng: number,
    public readonly contact_phone: string,
    public readonly is_main: boolean,
    public readonly operating_hours: Record<string, unknown> | null,
    public readonly status: 'ACTIVE' | 'INACTIVE',
    public readonly created_at: Date,
    public readonly updated_at: Date
  ) {}

  /**
   * Verifica si la branch está activa
   */
  isActive(): boolean {
    return this.status === 'ACTIVE';
  }

  /**
   * Verifica si es la branch principal
   */
  isMain(): boolean {
    return this.is_main;
  }
}

