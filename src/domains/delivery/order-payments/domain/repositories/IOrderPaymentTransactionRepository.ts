/**
 * Interface para OrderPaymentTransaction Repository
 */

import { OrderPaymentTransaction } from '../entities/OrderPaymentTransaction';

export interface IOrderPaymentTransactionRepository {
  findById(id: string): Promise<OrderPaymentTransaction | null>;
  findByOrderId(order_id: string): Promise<OrderPaymentTransaction[]>;
  findByPaymentTransactionId(payment_transaction_id: string): Promise<OrderPaymentTransaction[]>;
  create(data: CreateOrderPaymentTransactionData): Promise<OrderPaymentTransaction>;
  delete(id: string): Promise<void>;
}

export interface CreateOrderPaymentTransactionData {
  order_id: string;
  payment_transaction_id: string;
}

