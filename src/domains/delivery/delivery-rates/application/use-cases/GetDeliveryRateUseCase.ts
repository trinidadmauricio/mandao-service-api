/**
 * Use Case: Obtener DeliveryRate
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IDeliveryRateRepository } from '../../domain/repositories/IDeliveryRateRepository';
import { DeliveryRate } from '../../domain/entities/DeliveryRate';
import { TYPES } from '../../../../../config/types';

@injectable()
export class GetDeliveryRateUseCase {
  constructor(@inject(TYPES.IDeliveryRateRepository) private repository: IDeliveryRateRepository) {}

  async execute(id: string): Promise<DeliveryRate> {
    const rate = await this.repository.findById(id);
    if (!rate) {
      throw new Error('Delivery rate not found');
    }
    return rate;
  }
}
