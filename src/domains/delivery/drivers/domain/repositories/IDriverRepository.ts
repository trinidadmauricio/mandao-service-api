/**
 * Interface para Driver Repository
 */

import { Driver } from '../entities/Driver';

export interface IDriverRepository {
  findById(id: string): Promise<Driver | null>;
  findAll(logistics_provider_id?: string): Promise<Driver[]>;
  create(data: CreateDriverData): Promise<Driver>;
  update(id: string, data: UpdateDriverData): Promise<Driver>;
  delete(id: string): Promise<void>;
}

export interface CreateDriverData {
  logistics_provider_id: string;
  user_id: string;
  identity_document: string;
  driving_license: string;
  date_of_birth: Date;
  emergency_contact: Record<string, unknown>;
  has_own_vehicle: boolean;
  vehicle_id?: string | null;
  work_type: 'FULL_TIME' | 'PART_TIME' | 'FREELANCE';
  work_zone?: string | null;
  availability_status?: 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'SUSPENDED';
  documents: Record<string, unknown>;
}

export interface UpdateDriverData {
  identity_document?: string;
  driving_license?: string;
  date_of_birth?: Date;
  emergency_contact?: Record<string, unknown>;
  has_own_vehicle?: boolean;
  vehicle_id?: string | null;
  work_type?: 'FULL_TIME' | 'PART_TIME' | 'FREELANCE';
  work_zone?: string | null;
  availability_status?: 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'SUSPENDED';
  documents?: Record<string, unknown>;
}

