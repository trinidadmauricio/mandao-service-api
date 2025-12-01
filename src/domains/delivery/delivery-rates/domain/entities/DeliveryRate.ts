/**
 * Entidad DeliveryRate
 */

export type VehicleType = 'MOTORCYCLE' | 'SEDAN' | 'MINI_VAN' | 'PANEL' | 'TRUCK' | 'PICKUP';

export class DeliveryRate {
  constructor(
    public readonly id: string,
    public readonly tenant_id: string | null,
    public readonly logistics_provider_id: string | null,
    public readonly zone_id: string | null,
    public readonly vehicle_type: VehicleType,
    public readonly distance_km_min: number,
    public readonly distance_km_max: number,
    public readonly base_price: number,
    public readonly price_per_km: number,
    public readonly currency: string,
    public readonly priority_multiplier: Record<string, unknown>,
    public readonly created_at: Date,
    public readonly updated_at: Date
  ) {}

  /**
   * Calcula el precio para una distancia dada
   */
  calculatePrice(distanceKm: number, priority: 'NORMAL' | 'URGENT' = 'NORMAL'): number {
    if (distanceKm < this.distance_km_min || distanceKm > this.distance_km_max) {
      throw new Error('Distance out of range for this rate');
    }

    const multiplier = (this.priority_multiplier[priority] as number) || 1.0;
    return (this.base_price + distanceKm * this.price_per_km) * multiplier;
  }
}
