/**
 * Controller para DeliveryZones
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { CreateDeliveryZoneUseCase } from '../../application/use-cases/CreateDeliveryZoneUseCase';
import { GetDeliveryZoneUseCase } from '../../application/use-cases/GetDeliveryZoneUseCase';
import { ListDeliveryZonesUseCase } from '../../application/use-cases/ListDeliveryZonesUseCase';
import { UpdateDeliveryZoneUseCase } from '../../application/use-cases/UpdateDeliveryZoneUseCase';
import { DeleteDeliveryZoneUseCase } from '../../application/use-cases/DeleteDeliveryZoneUseCase';
import {
  createDeliveryZoneSchema,
  updateDeliveryZoneSchema,
} from '../../application/dto/CreateDeliveryZoneDto';
import { logger } from '../../../../../shared/utils/logger';
import { TYPES } from '../../../../../config/types';

@injectable()
export class DeliveryZoneController {
  constructor(
    @inject(TYPES.CreateDeliveryZoneUseCase) private createUseCase: CreateDeliveryZoneUseCase,
    @inject(TYPES.GetDeliveryZoneUseCase) private getUseCase: GetDeliveryZoneUseCase,
    @inject(TYPES.ListDeliveryZonesUseCase) private listUseCase: ListDeliveryZonesUseCase,
    @inject(TYPES.UpdateDeliveryZoneUseCase) private updateUseCase: UpdateDeliveryZoneUseCase,
    @inject(TYPES.DeleteDeliveryZoneUseCase) private deleteUseCase: DeleteDeliveryZoneUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto = createDeliveryZoneSchema.parse({
        ...req.body,
        tenant_id: req.tenant?.id || req.body.tenant_id,
      });
      const zone = await this.createUseCase.execute(dto);

      res.status(201).json({
        status: 'success',
        data: zone,
      });
    } catch (error) {
      logger.error('Error creating delivery zone', { error });
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
      const zone = await this.getUseCase.execute(id);

      res.status(200).json({
        status: 'success',
        data: zone,
      });
    } catch (error) {
      logger.error('Error getting delivery zone', { error });
      if (error instanceof Error && error.message === 'Delivery zone not found') {
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
      const zones = await this.listUseCase.execute(tenant_id);

      res.status(200).json({
        status: 'success',
        data: zones,
      });
    } catch (error) {
      logger.error('Error listing delivery zones', { error });
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dto = updateDeliveryZoneSchema.parse(req.body);
      const zone = await this.updateUseCase.execute(id, dto);

      res.status(200).json({
        status: 'success',
        data: zone,
      });
    } catch (error) {
      logger.error('Error updating delivery zone', { error });
      if (error instanceof Error && error.message === 'Delivery zone not found') {
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
      logger.error('Error deleting delivery zone', { error });
      if (error instanceof Error && error.message === 'Delivery zone not found') {
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
