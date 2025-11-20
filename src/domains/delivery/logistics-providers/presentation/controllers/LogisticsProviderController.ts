/**
 * Controller para LogisticsProviders
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { CreateLogisticsProviderUseCase } from '../../application/use-cases/CreateLogisticsProviderUseCase';
import { GetLogisticsProviderUseCase } from '../../application/use-cases/GetLogisticsProviderUseCase';
import { ListLogisticsProvidersUseCase } from '../../application/use-cases/ListLogisticsProvidersUseCase';
import { UpdateLogisticsProviderUseCase } from '../../application/use-cases/UpdateLogisticsProviderUseCase';
import { DeleteLogisticsProviderUseCase } from '../../application/use-cases/DeleteLogisticsProviderUseCase';
import {
  createLogisticsProviderSchema,
  updateLogisticsProviderSchema,
} from '../../application/dto/CreateLogisticsProviderDto';
import { logger } from '../../../../../shared/utils/logger';
import { TYPES } from '../../../../../config/types';

@injectable()
export class LogisticsProviderController {
  constructor(
    @inject(TYPES.CreateLogisticsProviderUseCase) private createUseCase: CreateLogisticsProviderUseCase,
    @inject(TYPES.GetLogisticsProviderUseCase) private getUseCase: GetLogisticsProviderUseCase,
    @inject(TYPES.ListLogisticsProvidersUseCase) private listUseCase: ListLogisticsProvidersUseCase,
    @inject(TYPES.UpdateLogisticsProviderUseCase) private updateUseCase: UpdateLogisticsProviderUseCase,
    @inject(TYPES.DeleteLogisticsProviderUseCase) private deleteUseCase: DeleteLogisticsProviderUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto = createLogisticsProviderSchema.parse(req.body);
      const provider = await this.createUseCase.execute(dto);

      res.status(201).json({
        status: 'success',
        data: provider,
      });
    } catch (error) {
      logger.error('Error creating logistics provider', { error });
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
      const provider = await this.getUseCase.execute(id);

      res.status(200).json({
        status: 'success',
        data: provider,
      });
    } catch (error) {
      logger.error('Error getting logistics provider', { error });
      if (error instanceof Error && error.message === 'Logistics provider not found') {
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
      const providers = await this.listUseCase.execute(tenant_id);

      res.status(200).json({
        status: 'success',
        data: providers,
      });
    } catch (error) {
      logger.error('Error listing logistics providers', { error });
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dto = updateLogisticsProviderSchema.parse(req.body);
      const provider = await this.updateUseCase.execute(id, dto);

      res.status(200).json({
        status: 'success',
        data: provider,
      });
    } catch (error) {
      logger.error('Error updating logistics provider', { error });
      if (error instanceof Error && error.message === 'Logistics provider not found') {
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
      logger.error('Error deleting logistics provider', { error });
      if (error instanceof Error && error.message === 'Logistics provider not found') {
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

