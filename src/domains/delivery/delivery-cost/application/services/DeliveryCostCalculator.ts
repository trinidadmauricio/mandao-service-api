/**
 * Service para calcular costos de entrega
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IDeliveryRateRepository } from '../../../delivery-rates/domain/repositories/IDeliveryRateRepository';
import { IDeliveryZoneRepository } from '../../../delivery-zones/domain/repositories/IDeliveryZoneRepository';
import { VehicleType } from '../../../delivery-rates/domain/entities/DeliveryRate';
import { TYPES } from '../../../../../config/types';

export interface CalculateDeliveryCostParams {
  tenant_id: string;
  distance_km: number;
  vehicle_type: VehicleType;
  zone_id?: string | null;
  priority?: 'NORMAL' | 'URGENT';
  currency?: string;
}

export interface DeliveryCostResult {
  base_price: number;
  distance_price: number;
  priority_multiplier: number;
  surge_multiplier: number;
  subtotal: number;
  total: number;
  currency: string;
}

@injectable()
export class DeliveryCostCalculator {
  constructor(
    @inject(TYPES.IDeliveryRateRepository) private deliveryRateRepository: IDeliveryRateRepository,
    @inject(TYPES.IDeliveryZoneRepository) private deliveryZoneRepository: IDeliveryZoneRepository
  ) {}

  async calculate(params: CalculateDeliveryCostParams): Promise<DeliveryCostResult> {
    const { tenant_id, distance_km, vehicle_type, zone_id, priority = 'NORMAL', currency = 'USD' } = params;

    // Buscar rate apropiado
    let rate = null;
    if (zone_id) {
      rate = await this.deliveryRateRepository.findByZoneAndVehicleType(zone_id, vehicle_type);
    }

    // Si no hay rate específico de zona, buscar uno general (sin zone_id)
    if (!rate) {
      const rates = await this.deliveryRateRepository.findAll(tenant_id, undefined);
      rate = rates.find(
        (r) => r.vehicle_type === vehicle_type && Number(r.distance_km_min) <= distance_km && Number(r.distance_km_max) >= distance_km
      ) || null;
    }

    if (!rate) {
      throw new Error('No delivery rate found for the given parameters');
    }

    // Obtener surge multiplier de la zona si existe
    let surge_multiplier = 1.0;
    if (zone_id) {
      const zone = await this.deliveryZoneRepository.findById(zone_id);
      if (zone) {
        surge_multiplier = zone.surge_multiplier;
      }
    }

    // Calcular precio usando el rate
    const base_price = rate.base_price;
    const distance_price = distance_km * rate.price_per_km;
    const priority_multiplier = (rate.priority_multiplier[priority] as number) || 1.0;

    const subtotal = base_price + distance_price;
    const total = subtotal * priority_multiplier * surge_multiplier;

    return {
      base_price,
      distance_price,
      priority_multiplier,
      surge_multiplier,
      subtotal,
      total: Math.round(total * 100) / 100, // Redondear a 2 decimales
      currency: rate.currency || currency,
    };
  }
}

