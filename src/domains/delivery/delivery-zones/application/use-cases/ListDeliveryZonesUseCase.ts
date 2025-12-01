/**
 * Use Case: Listar DeliveryZones
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IDeliveryZoneRepository } from '../../domain/repositories/IDeliveryZoneRepository';
import { DeliveryZone } from '../../domain/entities/DeliveryZone';
import { TYPES } from '../../../../../config/types';

@injectable()
export class ListDeliveryZonesUseCase {
  constructor(@inject(TYPES.IDeliveryZoneRepository) private repository: IDeliveryZoneRepository) {}

  async execute(tenant_id?: string | null, logistics_provider_id?: string | null): Promise<DeliveryZone[]> {
    return await this.repository.findAll(tenant_id, logistics_provider_id);
  }
}
