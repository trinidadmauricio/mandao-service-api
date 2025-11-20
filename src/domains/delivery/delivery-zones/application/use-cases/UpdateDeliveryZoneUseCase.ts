/**
 * Use Case: Actualizar DeliveryZone
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IDeliveryZoneRepository } from '../../domain/repositories/IDeliveryZoneRepository';
import { DeliveryZone } from '../../domain/entities/DeliveryZone';
import { UpdateDeliveryZoneDto } from '../dto/CreateDeliveryZoneDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class UpdateDeliveryZoneUseCase {
  constructor(@inject(TYPES.IDeliveryZoneRepository) private repository: IDeliveryZoneRepository) {}

  async execute(id: string, dto: UpdateDeliveryZoneDto): Promise<DeliveryZone> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Delivery zone not found');
    }

    return await this.repository.update(id, {
      name: dto.name,
      boundary: dto.boundary,
      base_rate: dto.base_rate,
      rate_per_km: dto.rate_per_km,
      surge_multiplier: dto.surge_multiplier,
      currency: dto.currency,
      is_active: dto.is_active,
    });
  }
}
