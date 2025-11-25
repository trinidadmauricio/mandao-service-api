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
import { CreateRetailOrderDto } from '../../delivery/orders/application/dto/CreateRetailOrderDto';

export class DeliveryClient implements IDeliveryClient {
  constructor(private createRetailOrderUseCase: CreateRetailOrderUseCase) {}

  async createOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse> {
    // Convertir CreateOrderRequest a CreateRetailOrderDto
    // branch_id es requerido para retail orders
    if (!orderData.branch_id) {
      throw new Error('branch_id is required for retail orders');
    }

    const dto: CreateRetailOrderDto = {
      tenant_id: orderData.tenant_id,
      customer_snapshot: orderData.customer_snapshot,
      delivery_address: orderData.delivery_address,
      pickup_address: orderData.pickup_address,
      items: orderData.items.map((item) => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_snapshot: item.product_snapshot,
        quantity: item.quantity,
        unit_price: item.unit_price,
        notes: item.notes,
      })),
      branch_id: orderData.branch_id,
      currency: orderData.currency,
      special_instructions: orderData.special_instructions,
      scheduled_pickup_at: orderData.scheduled_pickup_at,
      estimated_delivery_at: orderData.estimated_delivery_at,
      priority: orderData.priority,
    };

    return await this.createRetailOrderUseCase.execute(dto);
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
