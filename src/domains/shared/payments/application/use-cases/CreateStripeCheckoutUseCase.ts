/**
 * Use Case: Crear Stripe Checkout Session
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { StripeService } from '../services/StripeService';
import { IOrderRepository } from '../../../../delivery/orders/domain/repositories/IOrderRepository';
import { CreatePaymentTransactionUseCase } from './CreatePaymentTransactionUseCase';
import { TYPES } from '../../../../../config/types';

export interface CreateStripeCheckoutDto {
  order_id: string;
  tenant_id: string;
  success_url: string;
  cancel_url: string;
}

@injectable()
export class CreateStripeCheckoutUseCase {
  constructor(
    @inject(TYPES.StripeService) private stripeService: StripeService,
    @inject(TYPES.IOrderRepository) private orderRepository: IOrderRepository,
    @inject(TYPES.CreatePaymentTransactionUseCase) private createPaymentTransactionUseCase: CreatePaymentTransactionUseCase
  ) {}

  async execute(dto: CreateStripeCheckoutDto): Promise<{ checkout_url: string; payment_intent_id: string | null }> {
    // Obtener orden para obtener total y currency
    const order = await this.orderRepository.findById(dto.order_id);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.tenant_id !== dto.tenant_id) {
      throw new Error('Order belongs to different tenant');
    }

    // Obtener total actual de la orden
    // Por ahora, asumimos que hay un total en la orden
    // En producción, esto vendría de OrderSummaryTotal
    const total = 0; // TODO: Obtener de OrderSummaryTotal
    const currency = 'USD'; // TODO: Obtener de OrderSummaryTotal o Tenant

    // Crear Checkout Session en Stripe
    const session = await this.stripeService.createCheckoutSession({
      order_id: dto.order_id,
      amount: total,
      currency,
      success_url: dto.success_url,
      cancel_url: dto.cancel_url,
      metadata: {
        tenant_id: dto.tenant_id,
        order_id: dto.order_id,
      },
    });

    // Crear PaymentTransaction con status PENDING
    await this.createPaymentTransactionUseCase.execute({
      order_id: dto.order_id,
      tenant_id: dto.tenant_id,
      transaction_type: 'CHARGE',
      payment_method: 'CARD',
      amount: total,
      currency,
      payment_intent_id: session.payment_intent as string | null,
      metadata: {
        checkout_session_id: session.id,
        checkout_url: session.url,
      },
    });

    return {
      checkout_url: session.url || '',
      payment_intent_id: session.payment_intent as string | null,
    };
  }
}

