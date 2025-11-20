/**
 * Implementación de IDeliveryClient
 * Actualmente llama directamente al dominio delivery (monolito)
 * En el futuro, cuando Retail se extraiga, cambiará a HTTP client
 */

import { IDeliveryClient } from './IDeliveryClient';
import {
  CreateOrderRequest,
  CreateOrderResponse,
  OrderStatusUpdate,
} from '../../shared/contracts/order.contracts';
import { CreateRetailOrderUseCase } from '../../delivery/orders/application/use-cases/CreateRetailOrderUseCase';

export class DeliveryClient implements IDeliveryClient {
  constructor(private createRetailOrderUseCase: CreateRetailOrderUseCase) {}

  async createOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse> {
    return await this.createRetailOrderUseCase.execute(orderData);
  }

  async getOrderStatus(_orderId: string): Promise<OrderStatusUpdate> {
    // TODO: Implementar cuando se cree el servicio de orders
    throw new Error('DeliveryClient.getOrderStatus not yet implemented');
  }

  async updateOrderStatus(
    _orderId: string,
    _status: OrderStatusUpdate
  ): Promise<OrderStatusUpdate> {
    // TODO: Implementar cuando se cree el servicio de orders
    throw new Error('DeliveryClient.updateOrderStatus not yet implemented');
  }
}
