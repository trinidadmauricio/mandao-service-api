/**
 * Entidad Vehicle
 */

export type VehicleType = 'MOTORCYCLE' | 'SEDAN' | 'MINI_VAN' | 'PANEL' | 'TRUCK' | 'PICKUP';
export type VehicleStatus = 'AVAILABLE' | 'IN_SERVICE' | 'MAINTENANCE' | 'OUT_OF_SERVICE';

export class Vehicle {
  constructor(
    public readonly id: string,
    public readonly logistics_provider_id: string | null,
    public readonly driver_id: string | null,
    public readonly vehicle_type: VehicleType,
    public readonly license_plate: string,
    public readonly brand: string,
    public readonly model: string,
    public readonly year: number,
    public readonly color: string,
    public readonly insurance_policy: string,
    public readonly insurance_expires_at: Date,
    public readonly last_maintenance_at: Date | null,
    public readonly status: VehicleStatus,
    public readonly specifications: Record<string, unknown> | null,
    public readonly created_at: Date,
    public readonly updated_at: Date
  ) {}

  /**
   * Verifica si el vehículo está disponible
   */
  isAvailable(): boolean {
    return this.status === 'AVAILABLE';
  }

  /**
   * Verifica si el seguro está vigente
   */
  isInsuranceValid(): boolean {
    return new Date() < this.insurance_expires_at;
  }
}

