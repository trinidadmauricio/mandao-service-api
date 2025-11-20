/**
 * Interface para PaymentTransaction Repository
 */

import {
  PaymentTransaction,
  PaymentTransactionStatus,
  PaymentTransactionType,
  PaymentMethod,
} from '../entities/PaymentTransaction';

export interface IPaymentTransactionRepository {
  findById(id: string): Promise<PaymentTransaction | null>;
  findByOrderId(order_id: string): Promise<PaymentTransaction[]>;
  findByPaymentIntentId(payment_intent_id: string): Promise<PaymentTransaction | null>;
  findAll(
    tenant_id?: string,
    status?: PaymentTransactionStatus,
    transaction_type?: PaymentTransactionType
  ): Promise<PaymentTransaction[]>;
  create(data: CreatePaymentTransactionData): Promise<PaymentTransaction>;
  update(id: string, data: UpdatePaymentTransactionData): Promise<PaymentTransaction>;
}

export interface CreatePaymentTransactionData {
  tenant_id: string;
  transaction_type: PaymentTransactionType;
  payment_method: PaymentMethod;
  amount: number;
  currency: string;
  payment_intent_id?: string | null;
  charge_id?: string | null;
  refund_id?: string | null;
  status?: PaymentTransactionStatus;
  failure_reason?: string | null;
  card_last4?: string | null;
  card_brand?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface UpdatePaymentTransactionData {
  status?: PaymentTransactionStatus;
  payment_intent_id?: string | null;
  charge_id?: string | null;
  refund_id?: string | null;
  failure_reason?: string | null;
  card_last4?: string | null;
  card_brand?: string | null;
  metadata?: Record<string, unknown> | null;
}

