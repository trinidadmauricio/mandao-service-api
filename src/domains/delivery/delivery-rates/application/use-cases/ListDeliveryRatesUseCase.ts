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

  async execute(tenant_id?: string | null, logistics_provider_id?: string | null, zone_id?: string): Promise<DeliveryRate[]> {
    return await this.repository.findAll(tenant_id, logistics_provider_id, zone_id);
  }
}
