/**
 * Entidad Driver
 */

export type WorkType = 'FULL_TIME' | 'PART_TIME' | 'FREELANCE';
export type DriverStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'SUSPENDED';

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
    public readonly updated_at: Date
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

