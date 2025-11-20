/**
 * Controller para OrderCounters
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { CreateOrderCounterUseCase } from '../../application/use-cases/CreateOrderCounterUseCase';
import { GetOrderCounterUseCase } from '../../application/use-cases/GetOrderCounterUseCase';
import { IncrementOrderCounterUseCase } from '../../application/use-cases/IncrementOrderCounterUseCase';
import { UpdateOrderCounterUseCase } from '../../application/use-cases/UpdateOrderCounterUseCase';
import { createOrderCounterSchema, updateOrderCounterSchema } from '../../application/dto';
import { logger } from '../../../../../shared/utils/logger';
import { serializeForResponse } from '../../../../../shared/utils/serializer.util';
import { TYPES } from '../../../../../config/types';

@injectable()
export class OrderCounterController {
  constructor(
    @inject(TYPES.CreateOrderCounterUseCase) private createOrderCounterUseCase: CreateOrderCounterUseCase,
    @inject(TYPES.GetOrderCounterUseCase) private getOrderCounterUseCase: GetOrderCounterUseCase,
    @inject(TYPES.IncrementOrderCounterUseCase) private incrementOrderCounterUseCase: IncrementOrderCounterUseCase,
    @inject(TYPES.UpdateOrderCounterUseCase) private updateOrderCounterUseCase: UpdateOrderCounterUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto = createOrderCounterSchema.parse({
        ...req.body,
        tenant_id: req.body.tenant_id || req.tenant?.id,
      });
      const counter = await this.createOrderCounterUseCase.execute(dto);

      res.status(201).json({
        status: 'success',
        data: serializeForResponse(counter),
      });
    } catch (error) {
      logger.error('Error creating order counter', { error });
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

  async getByTenant(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.params.tenant_id || req.tenant?.id;
      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant ID is required',
        });
        return;
      }

      const counter = await this.getOrderCounterUseCase.execute(tenant_id);

      res.status(200).json({
        status: 'success',
        data: serializeForResponse(counter),
      });
    } catch (error) {
      logger.error('Error getting order counter', { error });
      if (error instanceof Error && error.message === 'Order counter not found') {
        res.status(404).json({
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

  async increment(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.params.tenant_id || req.tenant?.id;
      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant ID is required',
        });
        return;
      }

      const counter = await this.incrementOrderCounterUseCase.execute(tenant_id);
      const nextValue = counter.current_value + BigInt(1);
      const paddedValue = nextValue.toString().padStart(counter.padding_length, '0');
      const orderNumber = counter.prefix ? `${counter.prefix}-${paddedValue}` : paddedValue;

      res.status(200).json({
        status: 'success',
        data: {
          new_value: Number(nextValue),
          order_number: orderNumber,
        },
      });
    } catch (error) {
      logger.error('Error incrementing order counter', { error });
      if (error instanceof Error && error.message === 'Order counter not found') {
        res.status(404).json({
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

  async update(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.params.tenant_id || req.tenant?.id;
      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant ID is required',
        });
        return;
      }

      const dto = updateOrderCounterSchema.parse(req.body);
      const counter = await this.updateOrderCounterUseCase.execute(tenant_id, dto);

      res.status(200).json({
        status: 'success',
        data: serializeForResponse(counter),
      });
    } catch (error) {
      logger.error('Error updating order counter', { error });
      if (error instanceof Error && error.message === 'Order counter not found') {
        res.status(404).json({
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

