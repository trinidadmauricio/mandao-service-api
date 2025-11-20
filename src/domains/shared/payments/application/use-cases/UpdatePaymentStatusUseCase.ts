/**
 * Use Case: Actualizar estado de PaymentTransaction
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IPaymentTransactionRepository } from '../../domain/repositories/IPaymentTransactionRepository';
import { PaymentTransaction, PaymentTransactionStatus } from '../../domain/entities/PaymentTransaction';
import { TYPES } from '../../../../../config/types';

export interface UpdatePaymentStatusDto {
  payment_transaction_id: string;
  status: PaymentTransactionStatus;
  payment_intent_id?: string | null;
  charge_id?: string | null;
  refund_id?: string | null;
  failure_reason?: string | null;
  card_last4?: string | null;
  card_brand?: string | null;
  metadata?: Record<string, unknown> | null;
}

@injectable()
export class UpdatePaymentStatusUseCase {
  constructor(@inject(TYPES.IPaymentTransactionRepository) private paymentRepository: IPaymentTransactionRepository) {}

  async execute(dto: UpdatePaymentStatusDto): Promise<PaymentTransaction> {
    const existing = await this.paymentRepository.findById(dto.payment_transaction_id);
    if (!existing) {
      throw new Error('Payment transaction not found');
    }

    return await this.paymentRepository.update(dto.payment_transaction_id, {
      status: dto.status,
      payment_intent_id: dto.payment_intent_id,
      charge_id: dto.charge_id,
      refund_id: dto.refund_id,
      failure_reason: dto.failure_reason,
      card_last4: dto.card_last4,
      card_brand: dto.card_brand,
      metadata: dto.metadata,
    });
  }
}

