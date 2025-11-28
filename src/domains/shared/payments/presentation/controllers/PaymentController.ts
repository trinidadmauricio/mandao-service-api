/**
 * Controller para Payments
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { CreatePaymentTransactionUseCase } from '../../application/use-cases/CreatePaymentTransactionUseCase';
import { ListPaymentTransactionsUseCase } from '../../application/use-cases/ListPaymentTransactionsUseCase';
import { CreateStripeCheckoutUseCase } from '../../application/use-cases/CreateStripeCheckoutUseCase';
import { CreateRefundUseCase } from '../../application/use-cases/CreateRefundUseCase';
import { IPaymentTransactionRepository } from '../../domain/repositories/IPaymentTransactionRepository';
import { listPaymentTransactionsFiltersSchema } from '../../application/dto/ListPaymentTransactionsFiltersDto';
import { logger } from '../../../../../shared/utils/logger';
import { serializeForResponse } from '../../../../../shared/utils/serializer.util';
import { TYPES } from '../../../../../config/types';

@injectable()
export class PaymentController {
  constructor(
    @inject(TYPES.CreatePaymentTransactionUseCase) private createPaymentTransactionUseCase: CreatePaymentTransactionUseCase,
    @inject(TYPES.ListPaymentTransactionsUseCase) private listPaymentTransactionsUseCase: ListPaymentTransactionsUseCase,
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

  async listTransactions(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.tenant?.id;
      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      // Extraer y validar filtros de query params
      const filtersInput: Record<string, unknown> = {};
      if (req.query.transaction_type) {
        filtersInput.transaction_type = req.query.transaction_type;
      }
      if (req.query.payment_method) {
        filtersInput.payment_method = req.query.payment_method;
      }
      if (req.query.status) {
        filtersInput.status = req.query.status;
      }
      if (req.query.order_id) {
        filtersInput.order_id = req.query.order_id;
      }
      if (req.query.start_date) {
        filtersInput.start_date = req.query.start_date;
      }
      if (req.query.end_date) {
        filtersInput.end_date = req.query.end_date;
      }
      if (req.query.page) {
        filtersInput.page = req.query.page;
      }
      if (req.query.limit) {
        filtersInput.limit = req.query.limit;
      }

      // Validar con schema Zod (solo si hay filtros)
      const filters =
        Object.keys(filtersInput).length > 0
          ? listPaymentTransactionsFiltersSchema.parse(filtersInput)
          : undefined;

      // Ejecutar UseCase
      const result = await this.listPaymentTransactionsUseCase.execute(tenant_id, filters);

      res.status(200).json({
        status: 'success',
        data: serializeForResponse(result.data),
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (error) {
      logger.error('Error listing payment transactions', { error });
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({
          status: 'error',
          message: 'Invalid filter parameters',
          errors: error,
        });
        return;
      }
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

