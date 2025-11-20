/**
 * Use Case: Eliminar DeliveryRate
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IDeliveryRateRepository } from '../../domain/repositories/IDeliveryRateRepository';
import { TYPES } from '../../../../../config/types';

@injectable()
export class DeleteDeliveryRateUseCase {
  constructor(@inject(TYPES.IDeliveryRateRepository) private repository: IDeliveryRateRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Delivery rate not found');
    }

    await this.repository.delete(id);
  }
}
