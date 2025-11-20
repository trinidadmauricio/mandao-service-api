/**
 * Use Case: Obtener Orden por ID
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { Order } from '../../domain/entities/Order';
import { TYPES } from '../../../../../config/types';

@injectable()
export class GetOrderUseCase {
  constructor(@inject(TYPES.IOrderRepository) private orderRepository: IOrderRepository) {}

  async execute(id: string): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }
}

