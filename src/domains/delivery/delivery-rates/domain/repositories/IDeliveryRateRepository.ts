/**
 * Interface para DeliveryRate Repository
 */

import { DeliveryRate, VehicleType } from '../entities/DeliveryRate';

export interface IDeliveryRateRepository {
  findById(id: string): Promise<DeliveryRate | null>;
  findAll(tenant_id?: string | null, logistics_provider_id?: string | null, zone_id?: string): Promise<DeliveryRate[]>;
  findByZoneAndVehicleType(
    zone_id: string,
    vehicle_type: VehicleType
  ): Promise<DeliveryRate | null>;
  create(data: CreateDeliveryRateData): Promise<DeliveryRate>;
  update(id: string, data: UpdateDeliveryRateData): Promise<DeliveryRate>;
  delete(id: string): Promise<void>;
}

export interface CreateDeliveryRateData {
  tenant_id: string | null;
  logistics_provider_id: string | null;
  zone_id?: string | null;
  vehicle_type: VehicleType;
  distance_km_min: number;
  distance_km_max: number;
  base_price: number;
  price_per_km: number;
  currency?: string;
  priority_multiplier: Record<string, unknown>;
}

export interface UpdateDeliveryRateData {
  zone_id?: string | null;
  vehicle_type?: VehicleType;
  distance_km_min?: number;
  distance_km_max?: number;
  base_price?: number;
  price_per_km?: number;
  currency?: string;
  priority_multiplier?: Record<string, unknown>;
}

