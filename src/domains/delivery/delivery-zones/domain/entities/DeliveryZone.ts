/**
 * Entidad DeliveryZone
 */

export class DeliveryZone {
  constructor(
    public readonly id: string,
    public readonly tenant_id: string,
    public readonly name: string,
    public readonly boundary: string, // PostGIS WKT
    public readonly base_rate: number,
    public readonly rate_per_km: number,
    public readonly surge_multiplier: number,
    public readonly currency: string,
    public readonly is_active: boolean,
    public readonly created_at: Date,
    public readonly updated_at: Date
  ) {}

  /**
   * Verifica si la zona está activa
   */
  isActive(): boolean {
    return this.is_active;
  }
}
