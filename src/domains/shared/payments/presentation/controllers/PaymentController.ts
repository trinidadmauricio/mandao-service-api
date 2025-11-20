/**
 * Controller para Payments
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { CreatePaymentTransactionUseCase } from '../../application/use-cases/CreatePaymentTransactionUseCase';
import { CreateStripeCheckoutUseCase } from '../../application/use-cases/CreateStripeCheckoutUseCase';
import { CreateRefundUseCase } from '../../application/use-cases/CreateRefundUseCase';
import { IPaymentTransactionRepository } from '../../domain/repositories/IPaymentTransactionRepository';
import { logger } from '../../../../../shared/utils/logger';
import { serializeForResponse } from '../../../../../shared/utils/serializer.util';
import { TYPES } from '../../../../../config/types';

@injectable()
export class PaymentController {
  constructor(
    @inject(TYPES.CreatePaymentTransactionUseCase) private createPaymentTransactionUseCase: CreatePaymentTransactionUseCase,
    @inject(TYPES.CreateStripeCheckoutUseCase) private createStripeCheckoutUseCase: CreateStripeCheckoutUseCase,
    @inject(TYPES.CreateRefundUseCase) private createRefundUseCase: CreateRefundUseCase,
    @inject(TYPES.IPaymentTransactionRepository) private paymentRepository: IPaymentTransactionRepository
  ) {}

  async createPaymentTransaction(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.tenant?.id;
      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      const dto = {
        order_id: req.body.order_id,
        tenant_id,
        transaction_type: req.body.transaction_type,
        payment_method: req.body.payment_method,
        amount: req.body.amount,
        currency: req.body.currency,
        payment_intent_id: req.body.payment_intent_id,
        charge_id: req.body.charge_id,
        refund_id: req.body.refund_id,
        card_last4: req.body.card_last4,
        card_brand: req.body.card_brand,
        metadata: req.body.metadata,
      };

      const result = await this.createPaymentTransactionUseCase.execute(dto);

      res.status(201).json({
        status: 'success',
        data: serializeForResponse(result),
      });
    } catch (error) {
      logger.error('Error creating payment transaction', { error });
      if (error instanceof Error) {
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

  async getByOrderId(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const payments = await this.paymentRepository.findByOrderId(orderId);

      res.status(200).json({
        status: 'success',
        data: serializeForResponse(payments),
      });
    } catch (error) {
      logger.error('Error getting payments by order', { error });
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async createCheckout(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.tenant?.id;
      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      const dto = {
        order_id: req.body.order_id,
        tenant_id,
        success_url: req.body.success_url,
        cancel_url: req.body.cancel_url,
      };

      const result = await this.createStripeCheckoutUseCase.execute(dto);

      res.status(201).json({
        status: 'success',
        data: serializeForResponse(result),
      });
    } catch (error) {
      logger.error('Error creating checkout', { error });
      if (error instanceof Error) {
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

  async createRefund(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.tenant?.id;
      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      const dto = {
        order_id: req.body.order_id,
        tenant_id,
        original_payment_transaction_id: req.body.original_payment_transaction_id,
        amount: req.body.amount,
        reason: req.body.reason,
      };

      const result = await this.createRefundUseCase.execute(dto);

      res.status(201).json({
        status: 'success',
        data: serializeForResponse(result),
      });
    } catch (error) {
      logger.error('Error creating refund', { error });
      if (error instanceof Error) {
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

