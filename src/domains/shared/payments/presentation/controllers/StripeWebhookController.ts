/**
 * Controller para Stripe Webhooks
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { ProcessStripeWebhookUseCase } from '../../application/use-cases/ProcessStripeWebhookUseCase';
import { StripeService } from '../../application/services/StripeService';
import { logger } from '../../../../../shared/utils/logger';
import { TYPES } from '../../../../../config/types';

@injectable()
export class StripeWebhookController {
  constructor(
    @inject(TYPES.ProcessStripeWebhookUseCase) private processWebhookUseCase: ProcessStripeWebhookUseCase,
    @inject(TYPES.StripeService) private stripeService: StripeService
  ) {}

  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string;
      if (!signature) {
        res.status(400).json({
          status: 'error',
          message: 'Missing stripe-signature header',
        });
        return;
      }

      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        res.status(500).json({
          status: 'error',
          message: 'Webhook secret not configured',
        });
        return;
      }

      // Verificar firma y construir evento
      const event = this.stripeService.verifyWebhookSignature(
        req.body,
        signature,
        webhookSecret
      );

      // Procesar evento
      await this.processWebhookUseCase.execute(event);

      res.status(200).json({
        status: 'success',
        received: true,
      });
    } catch (error) {
      logger.error('Error processing Stripe webhook', { error });
      if (error instanceof Error && error.message === 'Invalid webhook signature') {
        res.status(400).json({
          status: 'error',
          message: error.message,
        });
        return;
      }
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }
}

