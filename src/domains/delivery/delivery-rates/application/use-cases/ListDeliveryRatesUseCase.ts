/**
 * Use Case: Listar DeliveryRates
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IDeliveryRateRepository } from '../../domain/repositories/IDeliveryRateRepository';
import { DeliveryRate } from '../../domain/entities/DeliveryRate';
import { TYPES } from '../../../../../config/types';

@injectable()
export class ListDeliveryRatesUseCase {
  constructor(@inject(TYPES.IDeliveryRateRepository) private repository: IDeliveryRateRepository) {}

  async execute(tenant_id?: string, zone_id?: string): Promise<DeliveryRate[]> {
    return await this.repository.findAll(tenant_id, zone_id);
  }
}
