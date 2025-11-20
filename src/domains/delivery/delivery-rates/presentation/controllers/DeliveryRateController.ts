/**
 * Controller para DeliveryRates
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { CreateDeliveryRateUseCase } from '../../application/use-cases/CreateDeliveryRateUseCase';
import { GetDeliveryRateUseCase } from '../../application/use-cases/GetDeliveryRateUseCase';
import { ListDeliveryRatesUseCase } from '../../application/use-cases/ListDeliveryRatesUseCase';
import { UpdateDeliveryRateUseCase } from '../../application/use-cases/UpdateDeliveryRateUseCase';
import { DeleteDeliveryRateUseCase } from '../../application/use-cases/DeleteDeliveryRateUseCase';
import {
  createDeliveryRateSchema,
  updateDeliveryRateSchema,
} from '../../application/dto/CreateDeliveryRateDto';
import { logger } from '../../../../../shared/utils/logger';
import { serializeForResponse } from '../../../../../shared/utils/serializer.util';
import { TYPES } from '../../../../../config/types';

@injectable()
export class DeliveryRateController {
  constructor(
    @inject(TYPES.CreateDeliveryRateUseCase) private createUseCase: CreateDeliveryRateUseCase,
    @inject(TYPES.GetDeliveryRateUseCase) private getUseCase: GetDeliveryRateUseCase,
    @inject(TYPES.ListDeliveryRatesUseCase) private listUseCase: ListDeliveryRatesUseCase,
    @inject(TYPES.UpdateDeliveryRateUseCase) private updateUseCase: UpdateDeliveryRateUseCase,
    @inject(TYPES.DeleteDeliveryRateUseCase) private deleteUseCase: DeleteDeliveryRateUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto = createDeliveryRateSchema.parse({
        ...req.body,
        tenant_id: req.tenant?.id || req.body.tenant_id,
      });
      const rate = await this.createUseCase.execute(dto);

      res.status(201).json({
        status: 'success',
        data: serializeForResponse(rate),
      });
    } catch (error) {
      logger.error('Error creating delivery rate', { error });
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

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const rate = await this.getUseCase.execute(id);

      res.status(200).json({
        status: 'success',
        data: serializeForResponse(rate),
      });
    } catch (error) {
      logger.error('Error getting delivery rate', { error });
      if (error instanceof Error && error.message === 'Delivery rate not found') {
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

  async list(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.tenant?.id;
      const zone_id = req.query.zone_id as string | undefined;
      const rates = await this.listUseCase.execute(tenant_id, zone_id);

      res.status(200).json({
        status: 'success',
        data: serializeForResponse(rates),
      });
    } catch (error) {
      logger.error('Error listing delivery rates', { error });
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dto = updateDeliveryRateSchema.parse(req.body);
      const rate = await this.updateUseCase.execute(id, dto);

      res.status(200).json({
        status: 'success',
        data: serializeForResponse(rate),
      });
    } catch (error) {
      logger.error('Error updating delivery rate', { error });
      if (error instanceof Error && error.message === 'Delivery rate not found') {
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

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.deleteUseCase.execute(id);

      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting delivery rate', { error });
      if (error instanceof Error && error.message === 'Delivery rate not found') {
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
