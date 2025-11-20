/**
 * Use Case: Obtener OrderCounter por Tenant ID
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IOrderCounterRepository } from '../../domain/repositories/IOrderCounterRepository';
import { OrderCounter } from '../../domain/entities/OrderCounter';
import { TYPES } from '../../../../../config/types';

@injectable()
export class GetOrderCounterUseCase {
  constructor(@inject(TYPES.IOrderCounterRepository) private repository: IOrderCounterRepository) {}

  async execute(tenant_id: string): Promise<OrderCounter> {
    const counter = await this.repository.findByTenantId(tenant_id);

    if (!counter) {
      throw new Error('Order counter not found');
    }

    return counter;
  }
}

