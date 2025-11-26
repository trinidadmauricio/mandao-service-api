/**
 * Controller para Vehicles
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { CreateVehicleUseCase } from '../../application/use-cases/CreateVehicleUseCase';
import { GetVehicleUseCase } from '../../application/use-cases/GetVehicleUseCase';
import { ListVehiclesUseCase } from '../../application/use-cases/ListVehiclesUseCase';
import { UpdateVehicleUseCase } from '../../application/use-cases/UpdateVehicleUseCase';
import { DeleteVehicleUseCase } from '../../application/use-cases/DeleteVehicleUseCase';
import { createVehicleSchema, updateVehicleSchema } from '../../application/dto/CreateVehicleDto';
import { logger } from '../../../../../shared/utils/logger';
import { UserRole } from '../../../../../shared/constants/permissions';
import { TYPES } from '../../../../../config/types';

@injectable()
export class VehicleController {
  constructor(
    @inject(TYPES.CreateVehicleUseCase) private createUseCase: CreateVehicleUseCase,
    @inject(TYPES.GetVehicleUseCase) private getUseCase: GetVehicleUseCase,
    @inject(TYPES.ListVehiclesUseCase) private listUseCase: ListVehiclesUseCase,
    @inject(TYPES.UpdateVehicleUseCase) private updateUseCase: UpdateVehicleUseCase,
    @inject(TYPES.DeleteVehicleUseCase) private deleteUseCase: DeleteVehicleUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto = createVehicleSchema.parse(req.body);
      const context = req.user
        ? {
            currentUserRole: req.user.role as string,
            currentUserLogisticsProviderId: req.user.logistics_provider_id || null,
          }
        : undefined;
      const vehicle = await this.createUseCase.execute(dto, context);

      res.status(201).json({
        status: 'success',
        data: vehicle,
      });
    } catch (error) {
      logger.error('Error creating vehicle', { error });
      if (error instanceof Error) {
        const isPermissionError = error.message.includes('permission') || error.message.includes('can only');
        const statusCode = isPermissionError ? 403 : 400;
        res.status(statusCode).json({
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
      const context = req.user
        ? {
            currentUserRole: req.user.role as string,
            currentUserLogisticsProviderId: req.user.logistics_provider_id || null,
          }
        : undefined;
      const vehicle = await this.getUseCase.execute(id, context);

      res.status(200).json({
        status: 'success',
        data: vehicle,
      });
    } catch (error) {
      logger.error('Error getting vehicle', { error });
      if (error instanceof Error) {
        if (error.message === 'Vehicle not found') {
          res.status(404).json({
            status: 'error',
            message: error.message,
          });
          return;
        }
        if (error.message.includes('permission')) {
          res.status(403).json({
            status: 'error',
            message: error.message,
          });
          return;
        }
      }
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      // Si el usuario es LOGISTICS_PROVIDER o SUPERVISOR, filtrar automáticamente por su logistics_provider_id
      // Si no es LOGISTICS_PROVIDER/SUPERVISOR, usar el query parameter si se proporciona
      const logistics_provider_id =
        req.user?.role === UserRole.LOGISTICS_PROVIDER || req.user?.role === UserRole.SUPERVISOR
          ? req.user.logistics_provider_id || undefined
          : (req.query.logistics_provider_id as string | undefined);

      const vehicles = await this.listUseCase.execute(logistics_provider_id);

      res.status(200).json({
        status: 'success',
        data: vehicles,
      });
    } catch (error) {
      logger.error('Error listing vehicles', { error });
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dto = updateVehicleSchema.parse(req.body);
      const context = req.user
        ? {
            currentUserRole: req.user.role as string,
            currentUserLogisticsProviderId: req.user.logistics_provider_id || null,
          }
        : undefined;
      const vehicle = await this.updateUseCase.execute(id, dto, context);

      res.status(200).json({
        status: 'success',
        data: vehicle,
      });
    } catch (error) {
      logger.error('Error updating vehicle', { error });
      if (error instanceof Error) {
        if (error.message === 'Vehicle not found') {
          res.status(404).json({
            status: 'error',
            message: error.message,
          });
          return;
        }
        if (error.message.includes('permission')) {
          res.status(403).json({
            status: 'error',
            message: error.message,
          });
          return;
        }
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
      const context = req.user
        ? {
            currentUserRole: req.user.role as string,
            currentUserLogisticsProviderId: req.user.logistics_provider_id || null,
          }
        : undefined;
      await this.deleteUseCase.execute(id, context);

      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting vehicle', { error });
      if (error instanceof Error) {
        if (error.message === 'Vehicle not found') {
          res.status(404).json({
            status: 'error',
            message: error.message,
          });
          return;
        }
        if (error.message.includes('permission')) {
          res.status(403).json({
            status: 'error',
            message: error.message,
          });
          return;
        }
      }
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }
}

