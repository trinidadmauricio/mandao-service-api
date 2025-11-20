/**
 * Use Case: Obtener Orden por Tracking Code
 * 
 * Endpoint público sin autenticación
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { Order } from '../../domain/entities/Order';
import { TYPES } from '../../../../../config/types';

@injectable()
export class GetOrderByTrackingCodeUseCase {
  constructor(@inject(TYPES.IOrderRepository) private orderRepository: IOrderRepository) {}

  async execute(tracking_code: string): Promise<Order> {
    const order = await this.orderRepository.findByTrackingCode(tracking_code);
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }
}

