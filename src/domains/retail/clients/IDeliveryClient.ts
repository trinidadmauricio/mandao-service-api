/**
 * Interface para comunicación entre dominio Retail y Delivery
 * Permite extracción futura de Retail como servicio independiente
 */

import {
  CreateOrderRequest,
  CreateOrderResponse,
  OrderStatusUpdate,
} from '../../shared/contracts/order.contracts';

export interface IDeliveryClient {
  /**
   * Crea una orden en el dominio delivery
   * @param orderData Datos de la orden
   * @returns Orden creada
   */
  createOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse>;

  /**
   * Obtiene el estado de una orden
   * @param orderId ID de la orden
   * @returns Estado actual de la orden
   */
  getOrderStatus(orderId: string): Promise<OrderStatusUpdate>;

  /**
   * Actualiza el estado de una orden
   * @param orderId ID de la orden
   * @param status Nuevo estado
   * @returns Estado actualizado
   */
  updateOrderStatus(orderId: string, status: OrderStatusUpdate): Promise<OrderStatusUpdate>;
}
