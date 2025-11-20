/**
 * Use Case: Crear DeliveryRate
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IDeliveryRateRepository } from '../../domain/repositories/IDeliveryRateRepository';
import { DeliveryRate } from '../../domain/entities/DeliveryRate';
import { CreateDeliveryRateDto } from '../dto/CreateDeliveryRateDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class CreateDeliveryRateUseCase {
  constructor(@inject(TYPES.IDeliveryRateRepository) private repository: IDeliveryRateRepository) {}

  async execute(dto: CreateDeliveryRateDto): Promise<DeliveryRate> {
    if (dto.distance_km_min >= dto.distance_km_max) {
      throw new Error('distance_km_min must be less than distance_km_max');
    }

    const rate = await this.repository.create({
      tenant_id: dto.tenant_id,
      zone_id: dto.zone_id,
      vehicle_type: dto.vehicle_type,
      distance_km_min: dto.distance_km_min,
      distance_km_max: dto.distance_km_max,
      base_price: dto.base_price,
      price_per_km: dto.price_per_km,
      currency: dto.currency,
      priority_multiplier: dto.priority_multiplier,
    });

    return rate;
  }
}
