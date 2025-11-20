/**
 * Use Case: Listar Órdenes
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { Order } from '../../domain/entities/Order';
import { TYPES } from '../../../../../config/types';

@injectable()
export class ListOrdersUseCase {
  constructor(@inject(TYPES.IOrderRepository) private orderRepository: IOrderRepository) {}

  async execute(tenant_id: string, status?: string, logistics_provider_id?: string): Promise<Order[]> {
    return await this.orderRepository.findAll(tenant_id, status, logistics_provider_id);
  }
}

