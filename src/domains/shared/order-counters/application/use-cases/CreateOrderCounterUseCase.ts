/**
 * Use Case: Crear OrderCounter
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IOrderCounterRepository } from '../../domain/repositories/IOrderCounterRepository';
import { OrderCounter } from '../../domain/entities/OrderCounter';
import { CreateOrderCounterDto } from '../dto/CreateOrderCounterDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class CreateOrderCounterUseCase {
  constructor(@inject(TYPES.IOrderCounterRepository) private repository: IOrderCounterRepository) {}

  async execute(dto: CreateOrderCounterDto): Promise<OrderCounter> {
    // Validar que no exista un counter para este tenant
    const existing = await this.repository.findByTenantId(dto.tenant_id);
    if (existing) {
      throw new Error('Order counter already exists for this tenant');
    }

    return await this.repository.create(dto);
  }
}

