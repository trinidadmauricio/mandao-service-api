/**
 * Use Case: Crear DeliveryZone
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IDeliveryZoneRepository } from '../../domain/repositories/IDeliveryZoneRepository';
import { DeliveryZone } from '../../domain/entities/DeliveryZone';
import { CreateDeliveryZoneDto } from '../dto/CreateDeliveryZoneDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class CreateDeliveryZoneUseCase {
  constructor(@inject(TYPES.IDeliveryZoneRepository) private repository: IDeliveryZoneRepository) {}

  async execute(dto: CreateDeliveryZoneDto): Promise<DeliveryZone> {
    const zone = await this.repository.create({
      tenant_id: dto.tenant_id,
      name: dto.name,
      boundary: dto.boundary,
      base_rate: dto.base_rate,
      rate_per_km: dto.rate_per_km,
      surge_multiplier: dto.surge_multiplier,
      currency: dto.currency,
      is_active: dto.is_active,
    });

    return zone;
  }
}
