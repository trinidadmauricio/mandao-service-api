/**
 * Use Case: Actualizar DeliveryRate
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IDeliveryRateRepository } from '../../domain/repositories/IDeliveryRateRepository';
import { DeliveryRate } from '../../domain/entities/DeliveryRate';
import { UpdateDeliveryRateDto } from '../dto/CreateDeliveryRateDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class UpdateDeliveryRateUseCase {
  constructor(@inject(TYPES.IDeliveryRateRepository) private repository: IDeliveryRateRepository) {}

  async execute(id: string, dto: UpdateDeliveryRateDto): Promise<DeliveryRate> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Delivery rate not found');
    }

    if (dto.distance_km_min !== undefined && dto.distance_km_max !== undefined) {
      if (dto.distance_km_min >= dto.distance_km_max) {
        throw new Error('distance_km_min must be less than distance_km_max');
      }
    }

    return await this.repository.update(id, {
      zone_id: dto.zone_id,
      vehicle_type: dto.vehicle_type,
      distance_km_min: dto.distance_km_min,
      distance_km_max: dto.distance_km_max,
      base_price: dto.base_price,
      price_per_km: dto.price_per_km,
      currency: dto.currency,
      priority_multiplier: dto.priority_multiplier,
    });
  }
}
