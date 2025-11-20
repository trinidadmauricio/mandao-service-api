/**
 * Use Case: Eliminar DeliveryZone
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IDeliveryZoneRepository } from '../../domain/repositories/IDeliveryZoneRepository';
import { TYPES } from '../../../../../config/types';

@injectable()
export class DeleteDeliveryZoneUseCase {
  constructor(@inject(TYPES.IDeliveryZoneRepository) private repository: IDeliveryZoneRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Delivery zone not found');
    }

    await this.repository.delete(id);
  }
}
