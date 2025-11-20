/**
 * Use Case: Procesar webhook de Stripe
 * 
 * Maneja eventos de Stripe y actualiza el estado de PaymentTransaction
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { StripeService } from '../services/StripeService';
import { IPaymentTransactionRepository } from '../../domain/repositories/IPaymentTransactionRepository';
import { UpdatePaymentStatusUseCase } from './UpdatePaymentStatusUseCase';
import { UpdateOrderStatusUseCase } from '../../../../delivery/orders/application/use-cases/UpdateOrderStatusUseCase';
import Stripe from 'stripe';
import { logger } from '../../../../../shared/utils/logger';
import { TYPES } from '../../../../../config/types';

@injectable()
export class ProcessStripeWebhookUseCase {
  constructor(
    @inject(TYPES.StripeService) private stripeService: StripeService,
    @inject(TYPES.IPaymentTransactionRepository) private paymentRepository: IPaymentTransactionRepository,
    @inject(TYPES.UpdatePaymentStatusUseCase) private updatePaymentStatusUseCase: UpdatePaymentStatusUseCase,
    @inject(TYPES.UpdateOrderStatusUseCase) private updateOrderStatusUseCase: UpdateOrderStatusUseCase
  ) {}

  async execute(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'charge.succeeded':
          await this.handleChargeSucceeded(event.data.object as Stripe.Charge);
          break;

        case 'charge.refunded':
          await this.handleChargeRefunded(event.data.object as Stripe.Charge);
          break;

        default:
          logger.info('Unhandled Stripe webhook event', { type: event.type });
      }
    } catch (error) {
      logger.error('Error processing Stripe webhook', { error, eventType: event.type });
      throw error;
    }
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const orderId = session.metadata?.order_id;
    if (!orderId) {
      logger.warn('Checkout session completed without order_id', { sessionId: session.id });
      return;
    }

    const paymentIntentId = session.payment_intent as string;
    if (!paymentIntentId) {
      return;
    }

    const payment = await this.paymentRepository.findByPaymentIntentId(paymentIntentId);
    if (!payment) {
      logger.warn('Payment transaction not found for payment intent', { paymentIntentId });
      return;
    }

    // Actualizar estado a PROCESSING
    await this.updatePaymentStatusUseCase.execute({
      payment_transaction_id: payment.id,
      status: 'PROCESSING',
      payment_intent_id: paymentIntentId,
    });
  }

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const payment = await this.paymentRepository.findByPaymentIntentId(paymentIntent.id);
    if (!payment) {
      logger.warn('Payment transaction not found for payment intent', { paymentIntentId: paymentIntent.id });
      return;
    }

    // Obtener charge
    const chargeId = paymentIntent.latest_charge as string;
    const charge = chargeId ? await this.stripeService.getCharge(chargeId) : null;

    // Actualizar estado a SUCCEEDED
    await this.updatePaymentStatusUseCase.execute({
      payment_transaction_id: payment.id,
      status: 'SUCCEEDED',
      payment_intent_id: paymentIntent.id,
      charge_id: chargeId,
      card_last4: charge?.payment_method_details?.card?.last4 || null,
      card_brand: charge?.payment_method_details?.card?.brand || null,
    });

    // Actualizar estado de la orden a CONFIRMED
    // Nota: Necesitamos obtener order_id desde OrderPaymentTransaction
    // Por ahora, lo obtenemos del metadata
    const orderId = paymentIntent.metadata?.order_id;
    if (orderId) {
      try {
        await this.updateOrderStatusUseCase.execute({
          order_id: orderId,
          to_status: 'CONFIRMED',
          changed_by_user_id: 'system',
          notes: 'Payment succeeded',
        });
      } catch (error) {
        logger.error('Error updating order status after payment', { error, orderId });
      }
    }
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const payment = await this.paymentRepository.findByPaymentIntentId(paymentIntent.id);
    if (!payment) {
      return;
    }

    // Actualizar estado a FAILED
    await this.updatePaymentStatusUseCase.execute({
      payment_transaction_id: payment.id,
      status: 'FAILED',
      payment_intent_id: paymentIntent.id,
      failure_reason: paymentIntent.last_payment_error?.message || 'Payment failed',
    });

    // Actualizar estado de la orden a CANCELLED
    const orderId = paymentIntent.metadata?.order_id;
    if (orderId) {
      try {
        await this.updateOrderStatusUseCase.execute({
          order_id: orderId,
          to_status: 'CANCELLED',
          changed_by_user_id: 'system',
          notes: 'Payment failed',
        });
      } catch (error) {
        logger.error('Error updating order status after payment failure', { error, orderId });
      }
    }
  }

  private async handleChargeSucceeded(charge: Stripe.Charge): Promise<void> {
    // Este evento generalmente se maneja junto con payment_intent.succeeded
    // Pero podemos usarlo para actualizar información adicional
    const paymentIntentId = charge.payment_intent as string;
    if (!paymentIntentId) {
      return;
    }

    const payment = await this.paymentRepository.findByPaymentIntentId(paymentIntentId);
    if (!payment) {
      return;
    }

    // Actualizar información de la tarjeta si no está actualizada
    if (!payment.card_last4 && charge.payment_method_details?.card) {
      await this.updatePaymentStatusUseCase.execute({
        payment_transaction_id: payment.id,
        status: payment.status, // Mantener el estado actual
        charge_id: charge.id,
        card_last4: charge.payment_method_details.card.last4 || null,
        card_brand: charge.payment_method_details.card.brand || null,
      });
    }
  }

  private async handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
    // Buscar payment por charge_id
    const payments = await this.paymentRepository.findAll(undefined, undefined, 'CHARGE');
    const payment = payments.find((p) => p.charge_id === charge.id);

    if (!payment) {
      logger.warn('Payment transaction not found for charge', { chargeId: charge.id });
      return;
    }

    // Crear nueva PaymentTransaction de tipo REFUND
    // Nota: Esto debería hacerse en un use case separado, pero por simplicidad lo hacemos aquí
    // En producción, crearíamos un CreateRefundUseCase
    logger.info('Charge refunded', { chargeId: charge.id, paymentId: payment.id });
  }
}

