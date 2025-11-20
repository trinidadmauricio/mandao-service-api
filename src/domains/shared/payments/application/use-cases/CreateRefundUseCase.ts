/**
 * Use Case: Crear Refund
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { StripeService } from '../services/StripeService';
import { IPaymentTransactionRepository } from '../../domain/repositories/IPaymentTransactionRepository';
import { CreatePaymentTransactionUseCase } from './CreatePaymentTransactionUseCase';
import { PaymentTransaction } from '../../domain/entities/PaymentTransaction';
import { TYPES } from '../../../../../config/types';

export interface CreateRefundDto {
  order_id: string;
  tenant_id: string;
  original_payment_transaction_id: string;
  amount?: number; // Si no se proporciona, es refund completo
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
}

@injectable()
export class CreateRefundUseCase {
  constructor(
    @inject(TYPES.StripeService) private stripeService: StripeService,
    @inject(TYPES.IPaymentTransactionRepository) private paymentRepository: IPaymentTransactionRepository,
    @inject(TYPES.CreatePaymentTransactionUseCase) private createPaymentTransactionUseCase: CreatePaymentTransactionUseCase
  ) {}

  async execute(dto: CreateRefundDto): Promise<{ refund: PaymentTransaction; refund_id: string }> {
    // Obtener transacción original
    const originalPayment = await this.paymentRepository.findById(dto.original_payment_transaction_id);
    if (!originalPayment) {
      throw new Error('Original payment transaction not found');
    }

    if (originalPayment.tenant_id !== dto.tenant_id) {
      throw new Error('Payment transaction belongs to different tenant');
    }

    if (!originalPayment.charge_id) {
      throw new Error('Original payment does not have a charge_id');
    }

    if (originalPayment.status !== 'SUCCEEDED') {
      throw new Error('Can only refund succeeded payments');
    }

    // Calcular monto del refund
    const refundAmount = dto.amount || originalPayment.amount;

    if (refundAmount > originalPayment.amount) {
      throw new Error('Refund amount cannot exceed original payment amount');
    }

    // Crear refund en Stripe
    const stripeRefund = await this.stripeService.createRefund({
      charge_id: originalPayment.charge_id,
      amount: refundAmount,
      reason: dto.reason,
      metadata: {
        order_id: dto.order_id,
        tenant_id: dto.tenant_id,
        original_payment_id: originalPayment.id,
      },
    });

    // Crear PaymentTransaction de tipo REFUND
    const { payment: refund } = await this.createPaymentTransactionUseCase.execute({
      order_id: dto.order_id,
      tenant_id: dto.tenant_id,
      transaction_type: 'REFUND',
      payment_method: originalPayment.payment_method,
      amount: refundAmount,
      currency: originalPayment.currency,
      refund_id: stripeRefund.id,
      metadata: {
        original_payment_transaction_id: originalPayment.id,
        stripe_refund_id: stripeRefund.id,
        reason: dto.reason,
      },
    });

    // Actualizar estado del refund a SUCCEEDED
    await this.paymentRepository.update(refund.id, {
      status: 'SUCCEEDED',
      refund_id: stripeRefund.id,
    });

    return {
      refund: await this.paymentRepository.findById(refund.id) as PaymentTransaction,
      refund_id: stripeRefund.id,
    };
  }
}

