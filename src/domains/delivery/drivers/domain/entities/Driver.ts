/**
 * Entidad Driver
 */

export type WorkType = 'FULL_TIME' | 'PART_TIME' | 'FREELANCE';
export type DriverStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'SUSPENDED';

export interface DriverDeliveryZoneRef {
  id: string;
  delivery_zone_id: string;
  created_at?: Date;
  delivery_zone?: {
    id: string;
    name: string;
  };
}

export interface VehicleRef {
  id: string;
  logistics_provider_id: string | null;
  driver_id: string | null;
  vehicle_type: 'MOTORCYCLE' | 'SEDAN' | 'MINI_VAN' | 'PANEL' | 'TRUCK' | 'PICKUP';
  license_plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  insurance_policy: string;
  insurance_expires_at: Date;
  last_maintenance_at: Date | null;
  status: 'AVAILABLE' | 'IN_SERVICE' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
  specifications: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

export class Driver {
  constructor(
    public readonly id: string,
    public readonly logistics_provider_id: string,
    public readonly user_id: string,
    public readonly identity_document: string,
    public readonly driving_license: string,
    public readonly date_of_birth: Date,
    public readonly emergency_contact: Record<string, unknown>,
    public readonly has_own_vehicle: boolean,
    public readonly vehicle_id: string | null,
    public readonly work_type: WorkType,
    public readonly work_zone: string | null,
    public readonly availability_status: DriverStatus,
    public readonly rating_avg: number | null,
    public readonly total_deliveries: number,
    public readonly documents: Record<string, unknown>,
    public readonly created_at: Date,
    public readonly updated_at: Date,
    public readonly delivery_zones: DriverDeliveryZoneRef[] = [],
    public readonly vehicle: VehicleRef | null = null
  ) {}

  /**
   * Verifica si el driver está disponible
   */
  isAvailable(): boolean {
    return this.availability_status === 'AVAILABLE';
  }

  /**
   * Verifica si el driver tiene vehículo asignado
   */
  hasVehicle(): boolean {
    return this.vehicle_id !== null;
  }
}

