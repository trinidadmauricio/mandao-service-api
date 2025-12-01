/**
 * Interface para DeliveryZone Repository
 */

import { DeliveryZone } from '../entities/DeliveryZone';

export interface IDeliveryZoneRepository {
  findById(id: string): Promise<DeliveryZone | null>;
  findAll(tenant_id?: string | null, logistics_provider_id?: string | null): Promise<DeliveryZone[]>;
  create(data: CreateDeliveryZoneData): Promise<DeliveryZone>;
  update(id: string, data: UpdateDeliveryZoneData): Promise<DeliveryZone>;
  delete(id: string): Promise<void>;
}

export interface CreateDeliveryZoneData {
  tenant_id: string | null;
  logistics_provider_id: string | null;
  name: string;
  boundary: string;
  base_rate: number;
  rate_per_km: number;
  surge_multiplier?: number;
  currency?: string;
  is_active?: boolean;
}

export interface UpdateDeliveryZoneData {
  name?: string;
  boundary?: string;
  base_rate?: number;
  rate_per_km?: number;
  surge_multiplier?: number;
  currency?: string;
  is_active?: boolean;
}
