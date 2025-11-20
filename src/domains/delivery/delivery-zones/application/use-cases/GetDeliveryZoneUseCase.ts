/**
 * Use Case: Obtener DeliveryZone
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IDeliveryZoneRepository } from '../../domain/repositories/IDeliveryZoneRepository';
import { DeliveryZone } from '../../domain/entities/DeliveryZone';
import { TYPES } from '../../../../../config/types';

@injectable()
export class GetDeliveryZoneUseCase {
  constructor(@inject(TYPES.IDeliveryZoneRepository) private repository: IDeliveryZoneRepository) {}

  async execute(id: string): Promise<DeliveryZone> {
    const zone = await this.repository.findById(id);
    if (!zone) {
      throw new Error('Delivery zone not found');
    }
    return zone;
  }
}
