/**
 * Interface para Vehicle Repository
 */

import { Vehicle } from '../entities/Vehicle';

export interface IVehicleRepository {
  findById(id: string): Promise<Vehicle | null>;
  findAll(logistics_provider_id?: string): Promise<Vehicle[]>;
  create(data: CreateVehicleData): Promise<Vehicle>;
  update(id: string, data: UpdateVehicleData): Promise<Vehicle>;
  delete(id: string): Promise<void>;
}

export interface CreateVehicleData {
  logistics_provider_id?: string | null;
  driver_id?: string | null;
  vehicle_type: 'MOTORCYCLE' | 'SEDAN' | 'MINI_VAN' | 'PANEL' | 'TRUCK' | 'PICKUP';
  license_plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  insurance_policy: string;
  insurance_expires_at: Date;
  last_maintenance_at?: Date | null;
  status?: 'AVAILABLE' | 'IN_SERVICE' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
  specifications?: Record<string, unknown> | null;
}

export interface UpdateVehicleData {
  logistics_provider_id?: string | null;
  driver_id?: string | null;
  vehicle_type?: 'MOTORCYCLE' | 'SEDAN' | 'MINI_VAN' | 'PANEL' | 'TRUCK' | 'PICKUP';
  license_plate?: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  insurance_policy?: string;
  insurance_expires_at?: Date;
  last_maintenance_at?: Date | null;
  status?: 'AVAILABLE' | 'IN_SERVICE' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
  specifications?: Record<string, unknown> | null;
}

