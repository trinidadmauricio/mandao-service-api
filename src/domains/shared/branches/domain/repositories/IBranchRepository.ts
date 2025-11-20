/**
 * Interfaz para Branch Repository
 */

import { Branch } from '../entities/Branch';

export interface CreateBranchData {
  tenant_id: string;
  name: string;
  address: string;
  gps_lat: number;
  gps_lng: number;
  contact_phone: string;
  is_main?: boolean;
  operating_hours?: Record<string, unknown> | null;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateBranchData {
  name?: string;
  address?: string;
  gps_lat?: number;
  gps_lng?: number;
  contact_phone?: string;
  is_main?: boolean;
  operating_hours?: Record<string, unknown> | null;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface IBranchRepository {
  findById(id: string): Promise<Branch | null>;
  findByTenantId(tenant_id: string): Promise<Branch[]>;
  findMainByTenantId(tenant_id: string): Promise<Branch | null>;
  findAll(): Promise<Branch[]>;
  create(data: CreateBranchData): Promise<Branch>;
  update(id: string, data: UpdateBranchData): Promise<Branch>;
  delete(id: string): Promise<void>;
}

