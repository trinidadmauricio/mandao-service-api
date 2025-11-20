/**
 * Controller para Tenants
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { CreateTenantUseCase } from '../../application/use-cases/CreateTenantUseCase';
import { GetTenantUseCase } from '../../application/use-cases/GetTenantUseCase';
import { ListTenantsUseCase } from '../../application/use-cases/ListTenantsUseCase';
import { UpdateTenantUseCase } from '../../application/use-cases/UpdateTenantUseCase';
import { DeleteTenantUseCase } from '../../application/use-cases/DeleteTenantUseCase';
import { createTenantSchema, updateTenantSchema } from '../../application/dto';
import { logger } from '../../../../../shared/utils/logger';
import { TYPES } from '../../../../../config/types';

@injectable()
export class TenantController {
  constructor(
    @inject(TYPES.CreateTenantUseCase) private createTenantUseCase: CreateTenantUseCase,
    @inject(TYPES.GetTenantUseCase) private getTenantUseCase: GetTenantUseCase,
    @inject(TYPES.ListTenantsUseCase) private listTenantsUseCase: ListTenantsUseCase,
    @inject(TYPES.UpdateTenantUseCase) private updateTenantUseCase: UpdateTenantUseCase,
    @inject(TYPES.DeleteTenantUseCase) private deleteTenantUseCase: DeleteTenantUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto = createTenantSchema.parse(req.body);
      const tenant = await this.createTenantUseCase.execute(dto);

      res.status(201).json({
        status: 'success',
        data: tenant,
      });
    } catch (error) {
      logger.error('Error creating tenant', { error });
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
      const tenant = await this.getTenantUseCase.execute(id);

      res.status(200).json({
        status: 'success',
        data: tenant,
      });
    } catch (error) {
      logger.error('Error getting tenant', { error });
      if (error instanceof Error && error.message === 'Tenant not found') {
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

  async list(_req: Request, res: Response): Promise<void> {
    try {
      const tenants = await this.listTenantsUseCase.execute();

      res.status(200).json({
        status: 'success',
        data: tenants,
      });
    } catch (error) {
      logger.error('Error listing tenants', { error });
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dto = updateTenantSchema.parse(req.body);
      const tenant = await this.updateTenantUseCase.execute(id, dto);

      res.status(200).json({
        status: 'success',
        data: tenant,
      });
    } catch (error) {
      logger.error('Error updating tenant', { error });
      if (error instanceof Error && error.message === 'Tenant not found') {
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
      await this.deleteTenantUseCase.execute(id);

      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting tenant', { error });
      if (error instanceof Error && error.message === 'Tenant not found') {
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
