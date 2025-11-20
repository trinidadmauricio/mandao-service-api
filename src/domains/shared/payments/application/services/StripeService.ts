/**
 * Service para integración con Stripe
 */

import 'reflect-metadata';
import { injectable } from 'inversify';
import Stripe from 'stripe';
import { logger } from '../../../../../shared/utils/logger';

export interface CreateCheckoutSessionParams {
  order_id: string;
  amount: number;
  currency: string;
  success_url: string;
  cancel_url: string;
  metadata?: Record<string, string>;
}

export interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
  payment_method_types?: string[];
}

export interface RefundParams {
  charge_id: string;
  amount?: number;
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  metadata?: Record<string, string>;
}

@injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(stripeSecretKey: string) {
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
  }

  /**
   * Crea una Checkout Session de Stripe
   */
  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: params.currency.toLowerCase(),
              product_data: {
                name: `Order ${params.order_id}`,
              },
              unit_amount: Math.round(params.amount * 100), // Stripe usa centavos
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: params.success_url,
        cancel_url: params.cancel_url,
        metadata: {
          order_id: params.order_id,
          ...params.metadata,
        },
      });

      return session;
    } catch (error) {
      logger.error('Error creating Stripe checkout session', { error, params });
      throw error;
    }
  }

  /**
   * Crea un Payment Intent de Stripe
   */
  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<Stripe.PaymentIntent> {
    try {
      const intent = await this.stripe.paymentIntents.create({
        amount: Math.round(params.amount * 100), // Stripe usa centavos
        currency: params.currency.toLowerCase(),
        payment_method_types: params.payment_method_types || ['card'],
        metadata: params.metadata,
      });

      return intent;
    } catch (error) {
      logger.error('Error creating Stripe payment intent', { error, params });
      throw error;
    }
  }

  /**
   * Crea un refund en Stripe
   */
  async createRefund(params: RefundParams): Promise<Stripe.Refund> {
    try {
      const refundParams: Stripe.RefundCreateParams = {
        charge: params.charge_id,
        metadata: params.metadata,
      };

      if (params.amount) {
        refundParams.amount = Math.round(params.amount * 100); // Stripe usa centavos
      }

      if (params.reason) {
        refundParams.reason = params.reason;
      }

      const refund = await this.stripe.refunds.create(refundParams);

      return refund;
    } catch (error) {
      logger.error('Error creating Stripe refund', { error, params });
      throw error;
    }
  }

  /**
   * Verifica la firma de un webhook de Stripe
   */
  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
  ): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      logger.error('Error verifying Stripe webhook signature', { error });
      throw new Error('Invalid webhook signature');
    }
  }

  /**
   * Obtiene un Payment Intent por ID
   */
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      logger.error('Error retrieving Stripe payment intent', { error, paymentIntentId });
      throw error;
    }
  }

  /**
   * Obtiene un Charge por ID
   */
  async getCharge(chargeId: string): Promise<Stripe.Charge> {
    try {
      return await this.stripe.charges.retrieve(chargeId);
    } catch (error) {
      logger.error('Error retrieving Stripe charge', { error, chargeId });
      throw error;
    }
  }
}

