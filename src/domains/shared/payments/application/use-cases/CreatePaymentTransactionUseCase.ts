/**
 * Use Case: Crear PaymentTransaction
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IPaymentTransactionRepository } from '../../domain/repositories/IPaymentTransactionRepository';
import { IOrderPaymentTransactionRepository } from '../../../../delivery/order-payments/domain/repositories/IOrderPaymentTransactionRepository';
import { PaymentTransaction, PaymentTransactionType, PaymentMethod } from '../../domain/entities/PaymentTransaction';
import { OrderPaymentTransaction } from '../../../../delivery/order-payments/domain/entities/OrderPaymentTransaction';
import { TYPES } from '../../../../../config/types';

export interface CreatePaymentTransactionDto {
  order_id: string;
  tenant_id: string;
  transaction_type: PaymentTransactionType;
  payment_method: PaymentMethod;
  amount: number;
  currency: string;
  payment_intent_id?: string | null;
  charge_id?: string | null;
  refund_id?: string | null;
  card_last4?: string | null;
  card_brand?: string | null;
  metadata?: Record<string, unknown> | null;
}

@injectable()
export class CreatePaymentTransactionUseCase {
  constructor(
    @inject(TYPES.IPaymentTransactionRepository) private paymentRepository: IPaymentTransactionRepository,
    @inject(TYPES.IOrderPaymentTransactionRepository) private orderPaymentRepository: IOrderPaymentTransactionRepository
  ) {}

  async execute(dto: CreatePaymentTransactionDto): Promise<{ payment: PaymentTransaction; orderPayment: OrderPaymentTransaction }> {
    // Crear PaymentTransaction
    const payment = await this.paymentRepository.create({
      tenant_id: dto.tenant_id,
      transaction_type: dto.transaction_type,
      payment_method: dto.payment_method,
      amount: dto.amount,
      currency: dto.currency,
      payment_intent_id: dto.payment_intent_id,
      charge_id: dto.charge_id,
      refund_id: dto.refund_id,
      status: 'PENDING',
      card_last4: dto.card_last4,
      card_brand: dto.card_brand,
      metadata: dto.metadata,
    });

    // Crear relación con Order
    const orderPayment = await this.orderPaymentRepository.create({
      order_id: dto.order_id,
      payment_transaction_id: payment.id,
    });

    return { payment, orderPayment };
  }
}

